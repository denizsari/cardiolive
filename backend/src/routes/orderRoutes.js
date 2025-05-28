const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin yetkilendirme gerekli' });
  }
};

// Admin routes (must come before user routes to avoid conflicts)
router.get('/admin', protect, adminAuth, orderController.getAllOrders);
router.patch('/admin/:id/status', protect, adminAuth, orderController.updateOrderStatus);

// Public tracking route
router.get('/track/:orderNumber', orderController.trackOrder);

// User routes (authentication required)
router.post('/', protect, orderController.createOrder);
router.get('/user', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrder);
router.patch('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
