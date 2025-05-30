const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ResponseHandler = require('../utils/responseHandler');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.user.userId;

    // Validate and process items
    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return ResponseHandler.badRequest(res, `Ürün bulunamadı: ${item.product}`);
      }

      if (!product.isActive || product.stock < item.quantity) {
        return ResponseHandler.badRequest(res, `Ürün stokta yok: ${product.name}`);
      }

      // Security check - verify price hasn't changed
      if (Math.abs(product.price - item.price) > 0.01) {
        return ResponseHandler.badRequest(res, `Ürün fiyatı değişmiş: ${product.name}`);
      }

      const itemTotal = item.price * item.quantity;
      calculatedTotal += itemTotal;

      processedItems.push({
        product: item.product,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.images?.[0] || '/products/placeholder.jpg'
      });
    }

    // Verify total amount
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return ResponseHandler.badRequest(res, 'Toplam tutar hesaplaması uyuşmuyor');
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Process shipping address
    const processedShippingAddress = {
      ...shippingAddress,
      district: shippingAddress.district || shippingAddress.city,
      country: shippingAddress.country || 'Türkiye'
    };

    // Create order
    const order = new Order({
      user: userId,
      orderNumber,
      items: processedItems,
      total,
      shippingAddress: processedShippingAddress,
      paymentMethod,
      notes: notes || '',
      status: 'pending'
    });

    await order.save();

    // Update product stock
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate product information
    await order.populate('items.product', 'name price images');

    const orderResponse = {
      id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt
    };

    ResponseHandler.success(res, { order: orderResponse }, 'Sipariş başarıyla oluşturuldu', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Sipariş oluşturma hatası', 500, error);
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { page, limit, status, startDate, endDate, sort, order } = req.query;
    const userId = req.user.userId;

    // Build filter
    const filter = { user: userId };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const orders = await Order.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name price images')
      .select('-__v');

    const total = await Order.countDocuments(filter);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Siparişler başarıyla getirildi', {
      orders,
      pagination
    });
  } catch (error) {
    ResponseHandler.error(res, 'Siparişleri getirme hatası', 500, error);
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).populate('items.product', 'name price images').select('-__v');

    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    ResponseHandler.success(res, 'Sipariş başarıyla getirildi', { order });
  } catch (error) {
    ResponseHandler.error(res, 'Sipariş getirme hatası', 500, error);
  }
};

// Cancel order (only if status is pending)
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    const order = await Order.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return ResponseHandler.badRequest(res, 'Bu sipariş artık iptal edilemez');
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    ResponseHandler.success(res, 'Sipariş başarıyla iptal edildi');
  } catch (error) {
    ResponseHandler.error(res, 'Sipariş iptal etme hatası', 500, error);
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page, limit, status, startDate, endDate, minTotal, maxTotal, sort, order } = req.query;

    // Build filter
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

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const orders = await Order.find(filter)
      .populate('user', 'name email phoneNumber')
      .populate('items.product', 'name price images')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Order.countDocuments(filter);

    // Calculate summary statistics
    const stats = await Order.aggregate([
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

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    ResponseHandler.success(res, 'Siparişler başarıyla getirildi', {
      orders,
      pagination,
      stats: stats[0] || { totalRevenue: 0, averageOrderValue: 0, totalOrders: 0 }
    });
  } catch (error) {
    ResponseHandler.error(res, 'Siparişleri getirme hatası', 500, error);
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    // Validate status transition
    const currentStatus = order.status;
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus].includes(status) && currentStatus !== status) {
      return ResponseHandler.badRequest(res, `${currentStatus} durumundan ${status} durumuna geçiş yapılamaz`);
    }

    // Update order
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.adminNotes = notes;
    
    // Set status timestamps
    if (status === 'processing') order.processingAt = new Date();
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') order.cancelledAt = new Date();

    await order.save();

    // Populate for response
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price');

    ResponseHandler.success(res, 'Sipariş durumu başarıyla güncellendi', { order });
  } catch (error) {
    ResponseHandler.error(res, 'Sipariş durumu güncelleme hatası', 500, error);
  }
};

// Track order by order number (public endpoint)
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .select('-user -adminNotes -__v');

    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
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

    const trackingInfo = {
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

    ResponseHandler.success(res, 'Sipariş takip bilgileri getirildi', { trackingInfo });
  } catch (error) {
    ResponseHandler.error(res, 'Sipariş takip hatası', 500, error);
  }
};
