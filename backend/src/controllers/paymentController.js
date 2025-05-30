const Order = require('../models/orderModel');

// Mock Payment Processing
exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentDetails } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Mock payment simulation based on payment method
    let paymentResult;
    
    switch (paymentMethod) {
      case 'credit_card':
        paymentResult = await mockCreditCardPayment(paymentDetails, order.total);
        break;
      case 'bank_transfer':
        paymentResult = await mockBankTransferPayment(paymentDetails, order.total);
        break;
      case 'cash_on_delivery':
        paymentResult = await mockCashOnDeliveryPayment(order.total);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment method' 
        });
    }

    if (paymentResult.success) {
      // Update order with payment info
      order.paymentStatus = 'paid';
      order.paymentMethod = paymentMethod;
      order.paymentReference = paymentResult.reference;
      order.status = 'confirmed';
      order.paidAt = new Date();
      
      await order.save();

      res.json({
        success: true,
        message: 'Payment processed successfully',
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
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentResult.error
      });
    }

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing error', 
      error: error.message 
    });
  }
};

// Mock Credit Card Payment
async function mockCreditCardPayment(paymentDetails, amount) {
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

// Mock Bank Transfer Payment
async function mockBankTransferPayment(paymentDetails, amount) {
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

// Mock Cash on Delivery
async function mockCashOnDeliveryPayment(amount) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    reference: `COD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount,
    note: 'Payment will be collected upon delivery'
  };
}

// Get Payment Methods
exports.getPaymentMethods = async (req, res) => {
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

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment methods', 
      error: error.message 
    });
  }
};

// Validate Payment Details
exports.validatePaymentDetails = async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;
    
    let validation = { valid: true, errors: [] };
    
    switch (paymentMethod) {
      case 'credit_card':
        validation = validateCreditCard(paymentDetails);
        break;
      case 'bank_transfer':
        validation = validateBankTransfer(paymentDetails);
        break;
      case 'cash_on_delivery':
        validation = { valid: true, errors: [] };
        break;
      default:
        validation = { valid: false, errors: ['Invalid payment method'] };
    }
    
    res.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Validation error', 
      error: error.message 
    });
  }
};

function validateCreditCard(details) {
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

function validateBankTransfer(details) {
  const errors = [];
  
  if (!details.bankAccount || details.bankAccount.length < 10) {
    errors.push('Invalid bank account number');
  }
  
  if (!details.routingNumber || details.routingNumber.length < 8) {
    errors.push('Invalid routing number');
  }
  
  return { valid: errors.length === 0, errors };
}
