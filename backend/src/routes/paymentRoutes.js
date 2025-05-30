const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

// Get available payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Validate payment details
router.post('/validate', protect, paymentController.validatePaymentDetails);

// Process payment (mock)
router.post('/process', protect, paymentController.processPayment);

module.exports = router;
