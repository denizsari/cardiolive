const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { applyRateLimit } = require('../middlewares/rateLimiter');
const { orderValidation, validateOrder, validateOrderQuery } = require('../validations/orderValidation');

// Admin routes (must come before user routes to avoid conflicts)
router.get('/admin', 
  applyRateLimit('api'),
  authenticateToken, 
  authorizeRoles('admin'), 
  validateOrderQuery,
  orderController.getAllOrders
);

router.patch('/admin/:id/status', 
  applyRateLimit('api'),
  authenticateToken, 
  authorizeRoles('admin'), 
  validateOrder(orderValidation.updateStatus),
  orderController.updateOrderStatus
);

// Public tracking route (with rate limiting)
router.get('/track/:orderNumber', 
  applyRateLimit('tracking'),
  orderController.trackOrder
);

// User routes (authentication required)
router.post('/', 
  applyRateLimit('orders'),
  authenticateToken, 
  validateOrder(orderValidation.create),
  orderController.createOrder
);

router.get('/user', 
  applyRateLimit('api'),
  authenticateToken, 
  validateOrderQuery,
  orderController.getUserOrders
);

router.get('/:id', 
  applyRateLimit('api'),
  authenticateToken, 
  orderController.getOrder
);

router.patch('/:id/cancel', 
  applyRateLimit('api'),
  authenticateToken, 
  orderController.cancelOrder
);

router.patch('/:id/payment', 
  applyRateLimit('api'),
  authenticateToken, 
  orderController.updateOrderPayment
);

module.exports = router;
