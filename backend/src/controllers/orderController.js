const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
    console.log('User info:', req.user);
    
    const { items, total, shippingAddress, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Sipariş öğeleri gereklidir' });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Geçerli bir toplam tutar gereklidir' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.email ||
        !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ message: 'Tüm teslimat bilgileri gereklidir' });
    }

    // Add missing required fields to items
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Ürün bulunamadı: ${item.name}` });
      }

      // Check if price matches (basic security check)
      if (Math.abs(product.price - item.price) > 0.01) {
        return res.status(400).json({ message: `Ürün fiyatı değişmiş: ${item.name}` });
      }

      processedItems.push({
        product: item.product,
        name: item.name || product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || product.images[0] || '/products/placeholder.jpg'
      });
    }

    // Add missing district field to shipping address
    const processedShippingAddress = {
      ...shippingAddress,
      district: shippingAddress.district || shippingAddress.city // Use city as district if not provided
    };

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `CL${String(orderCount + 1).padStart(6, '0')}`;

    // Create order
    const order = new Order({
      user: req.user.id,
      orderNumber,
      items: processedItems,
      total,
      shippingAddress: processedShippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      notes
    });

    await order.save();

    // Populate product information
    await order.populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Sipariş oluşturulurken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name');

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Sipariş bilgileri alınırken hata oluştu' });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Sipariş bilgileri alınırken hata oluştu' });
  }
};

// Cancel order (only if status is pending)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        message: 'Bu sipariş artık iptal edilemez'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ 
      success: true,
      message: 'Sipariş başarıyla iptal edildi' 
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Sipariş iptal edilirken hata oluştu' });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Siparişler getirilirken hata oluştu' });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Geçersiz sipariş durumu' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    await order.save();

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Sipariş durumu güncellenirken hata oluştu' });
  }
};

// Track order by order number (public endpoint)
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .populate('user', 'name email')
      .select('-user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create mock tracking info
    const trackingInfo = {
      orderId: order.orderNumber,
      status: order.status,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      trackingNumber: order.trackingNumber || `TRK${order._id.toString().slice(-8).toUpperCase()}`,
      shippingAddress: order.shippingAddress,
      statusHistory: [
        {
          status: 'pending',
          date: order.createdAt,
          description: 'Order placed and payment confirmed'
        },
        ...(order.status !== 'pending' ? [{
          status: 'processing',
          date: new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000),
          description: 'Order is being prepared for shipment'
        }] : []),
        ...(order.status === 'shipped' || order.status === 'delivered' ? [{
          status: 'shipped',
          date: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000),
          description: 'Package has been dispatched and is on its way'
        }] : []),
        ...(order.status === 'delivered' ? [{
          status: 'delivered',
          date: order.updatedAt,
          description: 'Package has been delivered successfully'
        }] : [])
      ]
    };

    res.json({
      success: true,
      trackingInfo
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
