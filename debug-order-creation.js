const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Order Creation with Debug...');
    
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, got token');
    
    // Prepare order data
    const orderData = {
      items: [
        {
          product: '683958fd3582f4a6e2307efd',
          quantity: 2,
          price: 159.99,
          name: 'Cardiolive Sızma Zeytinyağı'
        }
      ],
      total: 319.98,
      shippingAddress: {
        fullName: 'Debug Test Customer',
        email: 'debug@test.com',
        phone: '+90 555 999 8877',
        address: '123 Debug Street, Debug Apartment',
        city: 'Istanbul',
        district: 'Kadikoy',
        postalCode: '34000'
      },
      paymentMethod: 'credit_card',
      notes: 'Debug test order for error analysis'
    };
    
    console.log('🚀 Sending order creation request...');
    console.log('Order data:', JSON.stringify(orderData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Order created successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Order creation failed!');
    console.error('Status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Error message:', error.message);
  }
}

testOrderCreation();
