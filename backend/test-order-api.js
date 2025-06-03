#!/usr/bin/env node

const axios = require('axios');

async function testOrderAPI() {
  try {
    console.log('🔐 Logging in...');
    
    // Login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@cardiolive.com',
      password: 'User123!'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Get user orders
    console.log('📦 Fetching user orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Orders fetched successfully:');
    console.log(`📊 Total orders: ${ordersResponse.data.orders.length}`);
    
    ordersResponse.data.orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderNumber} - Status: ${order.status} - Total: ₺${order.total}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrderAPI();
