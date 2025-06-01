/**
 * @fileoverview Payment Service - Handles payment processing business logic
 * @description Service layer for payment operations, validation, and processing
 * @author Cardiolive E-commerce Platform
 * @version 1.0.0
 */

const BaseService = require('./BaseService');
const Order = require('../models/orderModel');
const logger = require('../utils/logger');

/**
 * Payment Service Class
 * @extends BaseService
 */
class PaymentService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Process payment for an order
   * @param {string} orderId - Order ID
   * @param {string} paymentMethod - Payment method (credit_card, bank_transfer, cash_on_delivery)
   * @param {Object} paymentDetails - Payment details
   * @returns {Promise<Object>} Processing result
   */
  async processPayment(orderId, paymentMethod, paymentDetails) {
    try {      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if order is already paid
      if (order.paymentStatus === 'paid') {
        const error = new Error('Order is already paid');
        error.statusCode = 400;
        throw error;
      }

      // Process payment based on method
      let paymentResult;
      
      switch (paymentMethod) {
        case 'credit_card':
          paymentResult = await this.mockCreditCardPayment(paymentDetails, order.total);
          break;
        case 'bank_transfer':
          paymentResult = await this.mockBankTransferPayment(paymentDetails, order.total);
          break;
        case 'cash_on_delivery':
          paymentResult = await this.mockCashOnDeliveryPayment(order.total);
          break;        default:
          const error = new Error('Invalid payment method');
          error.statusCode = 400;
          throw error;
      }
      
      if (paymentResult.success) {
        // Update order with payment info
        order.paymentStatus = 'paid';
        order.paymentMethod = paymentMethod;
        order.paymentReference = paymentResult.reference;
        order.status = 'processing';  // Changed from 'confirmed' to 'processing'
        order.paidAt = new Date();
        
        await order.save();

        logger.logEvent('business', 'payment_processed_successfully', {
          orderId,
          paymentMethod,
          amount: order.total,
          reference: paymentResult.reference
        });

        return {
          success: true,
          payment: {
            reference: paymentResult.reference,
            amount: order.total,
            method: paymentMethod,
            status: 'completed'
          },
          order: {
            id: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus
          }
        };
      } else {        logger.logEvent('business', 'payment_processing_failed', {
          orderId,
          paymentMethod,
          amount: order.total,
          error: paymentResult.error
        });

        const error = new Error(`Payment failed: ${paymentResult.error}`);
        error.statusCode = 400;
        throw error;
      }
    } catch (error) {
      logger.logEvent('error', 'payment_processing_error', {
        orderId,
        paymentMethod,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  /**
   * Get available payment methods
   * @returns {Promise<Array>} Available payment methods
   */
  async getPaymentMethods() {
    try {
      const paymentMethods = [
        {
          id: 'credit_card',
          name: 'Kredi Kartı',
          description: 'Visa, Mastercard, American Express kabul edilir',
          icon: 'credit-card',
          enabled: true,
          fees: 0
        },
        {
          id: 'bank_transfer',
          name: 'Banka Havalesi',
          description: 'Banka hesabından direkt transfer',
          icon: 'bank',
          enabled: true,
          fees: 0
        },
        {
          id: 'cash_on_delivery',
          name: 'Kapıda Ödeme',
          description: 'Ürün teslim edilirken nakit ödeme',
          icon: 'cash',
          enabled: true,
          fees: 5.00 // Kapıda ödeme ücreti
        }
      ];

      return paymentMethods;
    } catch (error) {
      logger.logEvent('error', 'payment_methods_fetch_error', {
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  /**
   * Validate payment details
   * @param {string} paymentMethod - Payment method
   * @param {Object} paymentDetails - Payment details to validate
   * @returns {Promise<Object>} Validation result
   */
  async validatePaymentDetails(paymentMethod, paymentDetails) {
    try {
      let validation = { valid: true, errors: [] };
      
      switch (paymentMethod) {
        case 'credit_card':
          validation = this.validateCreditCard(paymentDetails);
          break;
        case 'bank_transfer':
          validation = this.validateBankTransfer(paymentDetails);
          break;
        case 'cash_on_delivery':
          validation = { valid: true, errors: [] };
          break;
        default:
          validation = { valid: false, errors: ['Invalid payment method'] };
      }
      
      return {
        valid: validation.valid,
        errors: validation.errors
      };
    } catch (error) {
      logger.logEvent('error', 'payment_validation_error', {
        paymentMethod,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  /**
   * Mock Credit Card Payment
   * @private
   */
  async mockCreditCardPayment(paymentDetails, amount) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { cardNumber, expiryMonth, expiryYear, cvv, cardHolder } = paymentDetails;
    
    // Basic validation
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardHolder) {
      return { success: false, error: 'Missing card information' };
    }
    
    // Mock card validation (simulate some failures)
    if (cardNumber === '4000000000000002') {
      return { success: false, error: 'Card declined' };
    }
    
    if (cardNumber === '4000000000000069') {
      return { success: false, error: 'Expired card' };
    }
    
    // Simulate successful payment
    return {
      success: true,
      reference: `CC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: `TXN_${Date.now()}`,
      amount: amount
    };
  }

  /**
   * Mock Bank Transfer Payment
   * @private
   */
  async mockBankTransferPayment(paymentDetails, amount) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { bankAccount, routingNumber } = paymentDetails;
    
    if (!bankAccount || !routingNumber) {
      return { success: false, error: 'Missing bank information' };
    }
    
    return {
      success: true,
      reference: `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      estimatedClearance: '2-3 business days'
    };
  }

  /**
   * Mock Cash on Delivery
   * @private
   */
  async mockCashOnDeliveryPayment(amount) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      reference: `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      note: 'Payment will be collected upon delivery'
    };
  }

  /**
   * Validate Credit Card Details
   * @private
   */
  validateCreditCard(details) {
    const errors = [];
    
    if (!details.cardNumber || details.cardNumber.length < 13) {
      errors.push('Invalid card number');
    }
    
    if (!details.expiryMonth || details.expiryMonth < 1 || details.expiryMonth > 12) {
      errors.push('Invalid expiry month');
    }
    
    if (!details.expiryYear || details.expiryYear < new Date().getFullYear()) {
      errors.push('Invalid expiry year');
    }
    
    if (!details.cvv || details.cvv.length < 3) {
      errors.push('Invalid CVV');
    }
    
    if (!details.cardHolder || details.cardHolder.length < 2) {
      errors.push('Invalid card holder name');
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate Bank Transfer Details
   * @private
   */
  validateBankTransfer(details) {
    const errors = [];
    
    if (!details.bankAccount || details.bankAccount.length < 10) {
      errors.push('Invalid bank account number');
    }
    
    if (!details.routingNumber || details.routingNumber.length < 8) {
      errors.push('Invalid routing number');
    }
    
    return { valid: errors.length === 0, errors };
  }
}

module.exports = PaymentService;
