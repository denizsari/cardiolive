const BaseService = require('./BaseService');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * Order Service Class
 * Handles all order-related business logic
 * @class OrderService
 * @extends BaseService
 */
class OrderService extends BaseService {
  constructor() {
    super(Order);
  }

  /**
   * Create a new order with validation and stock management
   * @param {Object} orderData - Order creation data
   * @param {string} userId - User ID creating the order
   * @returns {Promise<Object>} Created order
   * @throws {Error} If validation fails or insufficient stock
   */
  async createOrder(orderData, userId) {
    const { items, shippingAddress, paymentMethod, notes } = orderData;

    // Validate and process items
    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${item.product}`);
      }

      if (!product.isActive || product.stock < item.quantity) {
        throw new Error(`Ürün stokta yok: ${product.name}`);
      }

      // Security check - verify price hasn't changed
      if (Math.abs(product.price - item.price) > 0.01) {
        throw new Error(`Ürün fiyatı değişmiş: ${product.name}`);
      }      const finalPrice = product.discountedPrice || product.price;
      const itemTotal = finalPrice * item.quantity;

      processedItems.push({
        product: product._id,
        name: product.name,
        price: finalPrice,
        quantity: item.quantity,
        image: item.image || product.images[0] || '/products/default.jpg'
      });

      calculatedTotal += itemTotal;

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    const order = await this.create({
      user: userId,
      orderNumber,
      items: processedItems,
      total: calculatedTotal,
      shippingAddress,
      paymentMethod,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending'
    });

    logger.info('Order created successfully', { 
      orderId: order._id, 
      orderNumber: order.orderNumber, 
      userId, 
      total: order.total 
    });

    return order;
  }
  /**
   * Get user orders with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated orders
   */
  async getUserOrders(userId, filters = {}, options = {}) {
    const { status, startDate, endDate } = filters;
    
    const filter = { user: userId };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Convert sortBy/sortOrder to sort object format expected by BaseService
    const { sortBy = 'createdAt', sortOrder = 'desc', ...restOptions } = options;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const queryOptions = {
      ...restOptions,
      sort,
      populate: ['items.product']
    };

    return await this.findAll(filter, queryOptions);
  }

  /**
   * Cancel an order and restore stock
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<void>}
   * @throws {Error} If order cannot be cancelled
   */
  async cancelOrder(orderId, userId) {
    const order = await this.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new Error('Bu sipariş artık iptal edilemez');
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await this.updateById(orderId, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    logger.info('Order cancelled', { orderId, userId });
  }

  /**
   * Update order status (Admin only)
   * @param {string} orderId - Order ID
   * @param {Object} updateData - Status update data
   * @returns {Promise<Object>} Updated order
   * @throws {Error} If status transition is invalid
   */
  async updateOrderStatus(orderId, updateData) {
    const { status, trackingNumber, notes } = updateData;
    
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    const currentStatus = order.status;
    if (!validTransitions[currentStatus].includes(status) && currentStatus !== status) {
      throw new Error(`${currentStatus} durumundan ${status} durumuna geçiş yapılamaz`);
    }

    const updateFields = { status };
    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (notes) updateFields.adminNotes = notes;

    // Set status timestamps
    if (status === 'processing') updateFields.processingAt = new Date();
    if (status === 'shipped') updateFields.shippedAt = new Date();
    if (status === 'delivered') updateFields.deliveredAt = new Date();
    if (status === 'cancelled') updateFields.cancelledAt = new Date();

    const updatedOrder = await this.updateById(orderId, updateFields);

    logger.info('Order status updated', { orderId, oldStatus: currentStatus, newStatus: status });

    return updatedOrder;
  }

  /**
   * Track order by order number
   * @param {string} orderNumber - Order number
   * @returns {Promise<Object>} Tracking information
   */
  async trackOrder(orderNumber) {
    const order = await this.findOne({ orderNumber });
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }

    // Create tracking status history
    const statusHistory = [
      {
        status: 'pending',
        date: order.createdAt,
        description: 'Sipariş alındı ve ödeme onaylandı',
        completed: true
      }
    ];

    // Add processing status if applicable
    if (order.processingAt || ['processing', 'shipped', 'delivered'].includes(order.status)) {
      statusHistory.push({
        status: 'processing',
        date: order.processingAt || new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000),
        description: 'Sipariş kargoya hazırlanıyor',
        completed: order.processingAt ? true : false
      });
    }

    // Add shipped status if applicable
    if (order.shippedAt || ['shipped', 'delivered'].includes(order.status)) {
      statusHistory.push({
        status: 'shipped',
        date: order.shippedAt || new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000),
        description: 'Paket kargoya verildi',
        completed: order.shippedAt ? true : false
      });
    }

    // Add delivered status if applicable
    if (order.deliveredAt || order.status === 'delivered') {
      statusHistory.push({
        status: 'delivered',
        date: order.deliveredAt || order.updatedAt,
        description: 'Paket başarıyla teslim edildi',
        completed: order.deliveredAt ? true : false
      });
    }

    // Add cancelled status if applicable
    if (order.status === 'cancelled') {
      statusHistory.push({
        status: 'cancelled',
        date: order.cancelledAt || order.updatedAt,
        description: 'Sipariş iptal edildi',
        completed: true
      });
    }

    // Calculate estimated delivery (7 days from order date)
    const estimatedDelivery = order.status === 'delivered' ? order.deliveredAt : 
      new Date(order.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDelivery,
      trackingNumber: order.trackingNumber || `TRK${order._id.toString().slice(-8).toUpperCase()}`,
      shippingAddress: order.shippingAddress,
      items: order.items,
      total: order.total,
      statusHistory,
      createdAt: order.createdAt,
      lastUpdated: order.updatedAt
    };
  }

  /**
   * Get all orders with filtering and pagination (Admin)
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated orders with stats
   */  async getAllOrders(filters = {}, options = {}) {
    try {
      const { status, startDate, endDate, minTotal, maxTotal } = filters;
      
      const filter = {};
      if (status) filter.status = status;
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
      if (minTotal || maxTotal) {
        filter.total = {};
        if (minTotal) filter.total.$gte = parseFloat(minTotal);
        if (maxTotal) filter.total.$lte = parseFloat(maxTotal);
      }

      // Query with proper population
      const result = await this.findAll(filter, {
        ...options,
        populate: ['user']
      });

      // Calculate summary statistics
      const stats = await this.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' },
            totalOrders: { $sum: 1 }
          }
        }
      ]);

      return {
        ...result,
        stats: stats[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 }
      };
    } catch (error) {
      console.error('OrderService.getAllOrders error:', error);
      throw error;
    }
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          processingOrders: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
          shippedOrders: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    const statusStats = await this.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      ...stats[0],
      statusBreakdown: statusStats
    };
  }

  /**
   * Update order payment information
   * @param {string} orderId - Order ID
   * @param {Object} paymentData - Payment update data
   * @param {string} paymentData.paymentMethod - Payment method used
   * @param {string} paymentData.paymentStatus - Payment status (pending, paid, failed, refunded)
   * @param {string} [paymentData.paymentReference] - Payment reference/transaction ID
   * @param {string} [paymentData.paidAt] - Payment completion date
   * @returns {Promise<Object>} Updated order
   * @throws {Error} If order not found or payment update is invalid
   */
  async updateOrderPayment(orderId, paymentData) {
    const { paymentMethod, paymentStatus, paymentReference, paidAt } = paymentData;
    
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error('Sipariş bulunamadı');
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new Error(`Geçersiz ödeme durumu: ${paymentStatus}`);
    }

    // Validate payment method
    const validPaymentMethods = ['credit_card', 'bank_transfer', 'cash_on_delivery', 'other'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      throw new Error(`Geçersiz ödeme yöntemi: ${paymentMethod}`);
    }

    // Prepare update fields
    const updateFields = {
      paymentStatus,
      ...(paymentMethod && { paymentMethod }),
      ...(paymentReference && { paymentReference }),
      ...(paidAt && { paidAt: new Date(paidAt) })
    };

    // If payment is successful, update order status to processing if still pending
    if (paymentStatus === 'paid' && order.status === 'pending') {
      updateFields.status = 'processing';
      updateFields.processingAt = new Date();
    }

    // If payment failed, keep order in pending status or mark as cancelled based on business logic
    if (paymentStatus === 'failed' && order.status === 'pending') {
      // You might want to implement automatic cancellation after failed payments
      // For now, we'll keep it pending to allow retry
      updateFields.adminNotes = (order.adminNotes || '') + ` Ödeme başarısız: ${new Date().toISOString()}`;
    }

    const updatedOrder = await this.updateById(orderId, updateFields);

    logger.info('Order payment updated', { 
      orderId, 
      paymentStatus, 
      paymentMethod,
      paymentReference,
      previousStatus: order.status,
      newStatus: updatedOrder.status 
    });

    return updatedOrder;
  }

  /**
   * Generate unique order number
   * @returns {Promise<string>} Generated order number
   * @private
   */
  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const todayOrdersCount = await this.count({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');
    
    return `ORD${year}${month}${day}${sequence}`;
  }
}

module.exports = new OrderService();
