// Test script for complete payment flow
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testCompletePaymentFlow() {
  try {
    console.log('🚀 Starting Complete Payment Flow Test...\n');
    
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Step 2: Get available products
    console.log('\n2️⃣ Getting available products...');
    const productsResponse = await axios.get(`${BASE_URL}/products?limit=1`);
    
    if (!productsResponse.data.success || !productsResponse.data.data.products.length) {
      throw new Error('No products available');
    }
    
    const product = productsResponse.data.data.products[0];
    console.log(`✅ Using product: ${product.name} (${product._id})`);
    
    // Step 3: Create order with proper format
    console.log('\n3️⃣ Creating order...');
    const orderData = {
      items: [{
        product: product._id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.images[0] || '/products/default.jpg'
      }],
      total: product.price,
      shippingAddress: {
        fullName: 'Test Payment Customer',
        email: 'admin@cardiolive.com',
        phone: '+90 555 123 4567',
        address: '123 Test Street, Test Apartment, Test Neighborhood',
        city: 'Istanbul',
        district: 'Kadikoy',
        postalCode: '34000'
      },
      paymentMethod: 'credit_card',
      notes: 'Test order for payment flow validation'
    };
    
    console.log('Order data:', JSON.stringify(orderData, null, 2));
    
    const orderResponse = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!orderResponse.data.success) {
      console.error('❌ Order creation failed:', orderResponse.data);
      throw new Error('Order creation failed: ' + JSON.stringify(orderResponse.data));
    }
      const order = orderResponse.data.data.order;
    console.log(`✅ Order created successfully - ID: ${order._id || order.id}, Number: ${order.orderNumber}`);
    
    // Step 4: Test payment validation
    console.log('\n4️⃣ Testing payment validation...');
    const validationResponse = await axios.post(`${BASE_URL}/payments/validate`, {
      paymentMethod: 'credit_card',
      paymentDetails: {
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardHolder: 'John Doe'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Payment validation result:', validationResponse.data.data);
      // Step 5: Process payment
    console.log('\n5️⃣ Processing payment...');
    const paymentResponse = await axios.post(`${BASE_URL}/payments/process`, {
      orderId: order._id || order.id,
      paymentMethod: 'credit_card',
      paymentDetails: {
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        cardHolder: 'John Doe'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentResponse.data.success) {
      console.log('✅ Payment processed successfully!');
      console.log('Payment details:', paymentResponse.data.data.payment);
      console.log('Order status:', paymentResponse.data.data.order);
    } else {
      console.log('❌ Payment processing failed:', paymentResponse.data);
    }
      // Step 6: Test failed payment scenario
    console.log('\n6️⃣ Testing failed payment scenario...');
    
    // Create a new order for the failed payment test
    const failOrderResponse = await axios.post(`${BASE_URL}/orders`, {
      items: [
        {
          product: product._id,
          quantity: 1,
          price: product.price,
          name: product.name,
          image: product.images[0] || '/products/default.jpg'
        }
      ],
      total: product.price,
      shippingAddress: {
        fullName: 'Test Fail Customer',
        email: 'admin@cardiolive.com',
        phone: '+90 555 123 4567',
        address: '123 Test Street, Test Apartment, Test Neighborhood',
        city: 'Istanbul',
        district: 'Kadikoy',
        postalCode: '34000'
      },
      paymentMethod: 'credit_card',
      notes: 'Test order for failed payment scenario'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const failOrder = failOrderResponse.data.data.order;
    console.log('✅ Created order for fail test - ID:', failOrder._id);
    
    try {
      const failedPaymentResponse = await axios.post(`${BASE_URL}/payments/process`, {
        orderId: failOrder._id || failOrder.id,
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardNumber: '4000000000000002', // This card number simulates a decline
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123',
          cardHolder: 'John Doe'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ Expected failure but got success:', failedPaymentResponse.data);
    } catch (failError) {
      if (failError.response && failError.response.status === 400) {
        console.log('✅ Failed payment scenario worked correctly');
        console.log('Error message:', failError.response.data.message);
      } else {
        console.log('❌ Unexpected error in failed payment test:', failError.response?.data);
      }
    }
    
    // Step 7: Test already paid order scenario
    console.log('\n7️⃣ Testing already paid order scenario...');
    
    try {
      const alreadyPaidResponse = await axios.post(`${BASE_URL}/payments/process`, {
        orderId: order._id || order.id, // Using the already paid order from step 5
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123',
          cardHolder: 'John Doe'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('❌ Expected failure but got success:', alreadyPaidResponse.data);
    } catch (paidError) {
      if (paidError.response && paidError.response.status === 400) {
        console.log('✅ Already paid order scenario worked correctly');
        console.log('Error message:', paidError.response.data.message);
      } else {
        console.log('❌ Unexpected error in already paid test:', paidError.response?.data);
      }
    }
    
    console.log('\n🎉 Complete payment flow test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCompletePaymentFlow();
