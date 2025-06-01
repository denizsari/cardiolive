const OrderService = require('../services/OrderService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

/**
 * @desc Create new order
 * @route POST /api/orders
 * @access Private
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.user.userId;

    const orderData = {
      items,
      total,
      shippingAddress,
      paymentMethod,
      notes
    };

    const order = await OrderService.createOrder(orderData, userId);

    logger.logBusinessEvent('order_created', { 
      userId, 
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      itemCount: order.items.length
    });

    ResponseHandler.created(res, 'Sipariş başarıyla oluşturuldu', { order });
  } catch (error) {
    logger.error('Order creation error:', { userId: req.user?.userId, error: error.message, stack: error.stack });
    
    if (error.message.includes('bulunamadı') || 
        error.message.includes('stokta yok') ||
        error.message.includes('fiyatı değişmiş') ||
        error.message.includes('uyuşmuyor')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Sipariş oluşturma hatası', error);
  }
};

/**
 * @desc Get user orders with filtering and pagination
 * @route GET /api/orders
 * @access Private
 */
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, sort = 'createdAt', order = 'desc' } = req.query;
    const userId = req.user.userId;

    const filters = { status, startDate, endDate };
    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sort,
      sortOrder: order
    };

    const result = await OrderService.getUserOrders(userId, filters, options);

    logger.logBusinessEvent('user_orders_viewed', { 
      userId, 
      orderCount: result.documents?.length || 0,
      filters,
      options 
    });

    ResponseHandler.success(res, 'Siparişler başarıyla getirildi', {
      orders: result.documents,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Get user orders error:', { userId: req.user?.userId, error: error.message, stack: error.stack });
    ResponseHandler.error(res, 'Siparişleri getirme hatası', error);
  }
};

/**
 * @desc Get single order
 * @route GET /api/orders/:id
 * @access Private
 */
exports.getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    const order = await OrderService.getOrderById(orderId, userId);

    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    logger.logBusinessEvent('order_viewed', { userId, orderId, orderNumber: order.orderNumber });

    ResponseHandler.success(res, 'Sipariş başarıyla getirildi', { order });
  } catch (error) {
    logger.error('Get order error:', { userId: req.user?.userId, orderId: req.params?.id, error: error.message });
    ResponseHandler.error(res, 'Sipariş getirme hatası', error);
  }
};

/**
 * @desc Cancel order
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    const success = await OrderService.cancelOrder(orderId, userId);

    if (!success) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı veya iptal edilemez');
    }

    logger.logBusinessEvent('order_cancelled', { userId, orderId });

    ResponseHandler.success(res, 'Sipariş başarıyla iptal edildi');
  } catch (error) {
    logger.error('Cancel order error:', { userId: req.user?.userId, orderId: req.params?.id, error: error.message });
    
    if (error.message === 'Bu sipariş artık iptal edilemez') {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Sipariş iptal etme hatası', error);
  }
};

/**
 * @desc Get all orders (Admin)
 * @route GET /api/admin/orders
 * @access Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, minTotal, maxTotal, sort = 'createdAt', order = 'desc' } = req.query;

    const filters = { status, startDate, endDate, minTotal, maxTotal };
    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sort,
      sortOrder: order
    };

    const result = await OrderService.getAllOrders(filters, options);

    logger.logBusinessEvent('admin_orders_viewed', { 
      adminId: req.user.userId, 
      orderCount: result.documents?.length || 0,
      filters,
      options 
    });

    ResponseHandler.success(res, 'Siparişler başarıyla getirildi', {
      orders: result.documents,
      pagination: result.pagination,
      stats: result.stats
    });
  } catch (error) {
    logger.error('Admin get orders error:', { 
      adminId: req.user?.userId, 
      error: error.message, 
      stack: error.stack,
      name: error.name
    });
    ResponseHandler.error(res, 'Siparişleri getirme hatası', error);
  }
};

/**
 * @desc Update order status (Admin)
 * @route PUT /api/admin/orders/:id/status
 * @access Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const orderId = req.params.id;

    const order = await OrderService.updateOrderStatus(orderId, status, { trackingNumber, notes });

    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    logger.logBusinessEvent('order_status_updated', { 
      adminId: req.user.userId, 
      orderId, 
      orderNumber: order.orderNumber,
      oldStatus: order.status,
      newStatus: status 
    });

    ResponseHandler.success(res, 'Sipariş durumu başarıyla güncellendi', { order });
  } catch (error) {
    logger.error('Update order status error:', { adminId: req.user?.userId, orderId: req.params?.id, error: error.message });
    
    if (error.message.includes('geçiş yapılamaz')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Sipariş durumu güncelleme hatası', error);
  }
};

/**
 * @desc Track order by order number
 * @route GET /api/orders/track/:orderNumber
 * @access Public
 */
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const trackingInfo = await OrderService.trackOrder(orderNumber);

    if (!trackingInfo) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    logger.logBusinessEvent('order_tracked', { orderNumber, status: trackingInfo.status });

    ResponseHandler.success(res, 'Sipariş takip bilgileri getirildi', { trackingInfo });
  } catch (error) {
    logger.error('Track order error:', { orderNumber: req.params?.orderNumber, error: error.message });
    ResponseHandler.error(res, 'Sipariş takip hatası', error);
  }
};

/**
 * @desc Update order payment information
 * @route PATCH /api/orders/:id/payment
 * @access Private
 */
exports.updateOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentStatus, paymentReference, paidAt } = req.body;
    const userId = req.user.userId;

    const paymentData = {
      paymentMethod,
      paymentStatus,
      paymentReference,
      paidAt
    };

    const order = await OrderService.updateOrderPayment(id, paymentData, userId);

    if (!order) {
      return ResponseHandler.notFound(res, 'Sipariş bulunamadı');
    }

    logger.logBusinessEvent('order_payment_updated', { 
      userId, 
      orderId: id, 
      orderNumber: order.orderNumber,
      paymentMethod,
      paymentStatus
    });

    ResponseHandler.success(res, 'Sipariş ödeme bilgileri güncellendi', { order });
  } catch (error) {
    logger.error('Update order payment error:', { 
      userId: req.user?.userId, 
      orderId: req.params?.id, 
      error: error.message 
    });
    
    if (error.message.includes('bulunamadı') || error.message.includes('yetkisiz')) {
      return ResponseHandler.badRequest(res, error.message);
    }
    ResponseHandler.error(res, 'Sipariş ödeme güncelleme hatası', error);
  }
};
