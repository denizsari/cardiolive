#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'admin@cardiolive.com',
  password: 'admin123'
};

const testOrderData = {
  items: [
    {
      product: '676b32b1db6b5f5cfb5c33e5', // We'll get this from products
      name: 'Test Product',
      price: 50.99,
      quantity: 2,
      image: '/products/test.jpg'
    }
  ],
  total: 101.98,
  shippingAddress: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+90 555 123 4567',
    address: 'Test Address 123',
    city: 'Istanbul',
    district: 'Kadikoy',
    postalCode: '34710'
  },
  paymentMethod: 'cash_on_delivery',
  notes: 'Test order'
};

async function runTest() {
  console.log('🧪 Simple Order System Test');
  console.log('============================\n');

  try {
    // Step 1: Test backend health
    console.log('1️⃣ Testing backend connection...');
    const healthResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Backend is responding');

    // Step 2: Login
    console.log('\n2️⃣ Testing authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, testUser);
    
    if (!loginResponse.data.success || !loginResponse.data.token) {
      throw new Error('Login failed');
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log(`✅ Login successful - User: ${user.name}, Role: ${user.role}`);

    // Step 3: Get products
    console.log('\n3️⃣ Getting products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    const products = productsResponse.data.products || productsResponse.data;
    
    if (products.length === 0) {
      throw new Error('No products found');
    }
    
    // Use the first product for testing
    const product = products[0];
    testOrderData.items[0].product = product._id;
    testOrderData.items[0].name = product.name;
    testOrderData.items[0].price = product.price;
    testOrderData.total = product.price * testOrderData.items[0].quantity;
    
    console.log(`✅ Found ${products.length} products, using: ${product.name}`);

    // Step 4: Create order
    console.log('\n4️⃣ Creating order...');
    
    const orderResponse = await axios.post(
      `${BASE_URL}/orders`,
      testOrderData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!orderResponse.data.success) {
      throw new Error('Order creation failed: ' + (orderResponse.data.message || 'Unknown error'));
    }

    const order = orderResponse.data.order;
    console.log(`✅ Order created successfully - Order Number: ${order.orderNumber}, ID: ${order._id}`);

    // Step 5: Get user orders
    console.log('\n5️⃣ Getting user orders...');
    
    const userOrdersResponse = await axios.get(
      `${BASE_URL}/orders/user`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!userOrdersResponse.data.success) {
      throw new Error('Failed to get user orders');
    }

    const userOrders = userOrdersResponse.data.orders;
    console.log(`✅ Found ${userOrders.length} orders for user`);

    // Step 6: Get specific order
    console.log('\n6️⃣ Getting specific order...');
    
    const specificOrderResponse = await axios.get(
      `${BASE_URL}/orders/${order._id}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    if (!specificOrderResponse.data.success) {
      throw new Error('Failed to get specific order');
    }

    console.log(`✅ Order retrieved successfully - Status: ${specificOrderResponse.data.order.status}`);

    // Step 7: Admin operations (if user is admin)
    if (user.role === 'admin') {
      console.log('\n7️⃣ Testing admin operations...');
      
      const allOrdersResponse = await axios.get(
        `${BASE_URL}/orders/admin`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (!allOrdersResponse.data.success) {
        throw new Error('Failed to get all orders as admin');
      }

      console.log(`✅ Admin can see ${allOrdersResponse.data.orders.length} total orders`);
    }

    console.log('\n🎉 All tests passed! Order system is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

runTest();
