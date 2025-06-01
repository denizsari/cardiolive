const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugPaymentError() {
  try {
    console.log('🔍 Debug Payment Error Test...');
    
    // Step 1: Login
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    });    const token = loginResponse.data.data.accessToken;
    console.log('✅ Logged in, token:', token.substring(0, 20) + '...');
      // Step 2: Get a product
    const productResponse = await axios.get(`${BASE_URL}/products?page=1&limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const product = productResponse.data.data.products[0];
    console.log('✅ Got product:', product.name);
    
    // Step 3: Create an order
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      items: [{
        product: product._id,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.images[0] || '/products/default.jpg'
      }],
      total: product.price,
      shippingAddress: {
        fullName: 'Debug Test Customer',
        email: 'admin@cardiolive.com',
        phone: '+90 555 123 4567',
        address: '123 Test Street',
        city: 'Istanbul',
        district: 'Kadikoy',
        postalCode: '34000'
      },
      paymentMethod: 'credit_card',
      notes: 'Debug test order'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const order = orderResponse.data.data.order;
    console.log('✅ Created order:', order.orderNumber);
    
    // Step 4: Try payment with declined card
    console.log('\n🚫 Testing declined card payment...');
    try {
      const declinedResponse = await axios.post(`${BASE_URL}/payments/process`, {
        orderId: order._id,
        paymentMethod: 'credit_card',
        paymentDetails: {
          cardNumber: '4000000000000002', // Simulates decline
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
      
      console.log('❌ Expected decline but got success:', declinedResponse.data);
    } catch (error) {
      console.log('✅ Got expected decline error:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Step 5: Process successful payment first
    console.log('\n✅ Processing successful payment...');
    const successResponse = await axios.post(`${BASE_URL}/payments/process`, {
      orderId: order._id,
      paymentMethod: 'credit_card',
      paymentDetails: {
        cardNumber: '4111111111111111', // Valid card
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
    
    console.log('Payment successful:', successResponse.data.data.payment.reference);
    
    // Step 6: Try payment on already paid order
    console.log('\n🔄 Testing already paid order...');
    try {
      const alreadyPaidResponse = await axios.post(`${BASE_URL}/payments/process`, {
        orderId: order._id,
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
      
      console.log('❌ Expected already paid error but got success:', alreadyPaidResponse.data);
    } catch (error) {
      console.log('✅ Got expected already paid error:');
      console.log('Status:', error.response?.status);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugPaymentError();
