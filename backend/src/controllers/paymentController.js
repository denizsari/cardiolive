/**
 * @fileoverview Payment Controller - Handles payment processing operations
 * @description Manages payment processing, validation, and payment methods
 * @author Cardiolive E-commerce Platform
 * @version 1.0.0
 */

const PaymentService = require('../services/PaymentService');
const ResponseHandler = require('../utils/responseHandler');
const { logger } = require('../utils/logger');

// Initialize service
const paymentService = new PaymentService();

/**
 * Process payment for an order
 * @route POST /api/payments/process
 * @access Private (authenticated users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment result
 */
exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentDetails } = req.body;
    
    logger.logEvent('business', 'payment_processing_initiated', {
      orderId,
      paymentMethod,
      userId: req.user?.userId,
      requestId: req.id
    });

    const result = await paymentService.processPayment(orderId, paymentMethod, paymentDetails);

    logger.logEvent('business', 'payment_completed', {
      orderId,
      paymentMethod,
      amount: result.payment.amount,
      reference: result.payment.reference,
      userId: req.user?.userId,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Payment processed successfully', result);  } catch (error) {
    logger.logEvent('error', 'payment_processing_failed', {
      orderId: req.body.orderId,
      paymentMethod: req.body.paymentMethod,
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    // Debug: Log the error details
    console.log('🔍 PaymentController Error Debug:');
    console.log('Error message:', error.message);
    console.log('Error statusCode:', error.statusCode);
    console.log('Error type:', typeof error);
    console.log('Error keys:', Object.keys(error));

    // Pass the status code and error message properly
    const statusCode = error.statusCode || 500;
    ResponseHandler.error(res, error.message || 'Payment processing error', statusCode);
  }
};



/**
 * Get available payment methods
 * @route GET /api/payments/methods
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with payment methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    logger.logEvent('business', 'payment_methods_fetch_initiated', {
      requestId: req.id
    });

    const paymentMethods = await paymentService.getPaymentMethods();

    logger.logEvent('business', 'payment_methods_fetched', {
      methodCount: paymentMethods.length,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Payment methods retrieved successfully', {
      paymentMethods
    });
  } catch (error) {
    logger.logEvent('error', 'payment_methods_fetch_failed', {
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Error fetching payment methods', error);
  }
};

/**
 * Validate payment details
 * @route POST /api/payments/validate
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with validation result
 */
exports.validatePaymentDetails = async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;
    
    logger.logEvent('business', 'payment_validation_initiated', {
      paymentMethod,
      requestId: req.id
    });

    const validation = await paymentService.validatePaymentDetails(paymentMethod, paymentDetails);

    logger.logEvent('business', 'payment_validated', {
      paymentMethod,
      valid: validation.valid,
      errorCount: validation.errors.length,
      requestId: req.id
    });

    ResponseHandler.success(res, 'Payment details validated', validation);
  } catch (error) {
    logger.logEvent('error', 'payment_validation_failed', {
      paymentMethod: req.body.paymentMethod,
      error: error.message,
      stack: error.stack,
      requestId: req.id
    });

    ResponseHandler.error(res, 'Validation error', error);
  }
};


