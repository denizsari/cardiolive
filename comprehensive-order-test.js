#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test Admin',
  email: 'admin@cardiolive.com',
  password: 'admin123',
  role: 'admin'
};

const testOrderData = {
  items: [
    {
      product: '676b32b1db6b5f5cfb5c33e5', // Will be replaced with actual product ID
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
  notes: 'Test order for validation debugging'
};

async function createUserIfNeeded() {
  try {
    // Try to login first
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      return loginResponse.data;
    }
  } catch (error) {
    // User doesn't exist or login failed, try to create user
    console.log('🔄 User doesn\'t exist, creating new user...');
  }

  try {
    // Create user
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, testUser);
    
    if (registerResponse.data.success) {
      console.log('✅ User created successfully');
      
      // Now login
      const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      return loginResponse.data;
    }
  } catch (createError) {
    console.log('❌ Failed to create user:', createError.response?.data?.message || createError.message);
    throw createError;
  }
}

async function runTest() {
  console.log('🧪 Comprehensive Order System Test');
  console.log('===================================\n');

  try {
    // Step 1: Test backend health
    console.log('1️⃣ Testing backend connection...');
    const healthResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Backend is responding');

    // Step 2: Ensure user exists and login
    console.log('\n2️⃣ Handling authentication...');
    const authData = await createUserIfNeeded();
    
    if (!authData.success || !authData.token) {
      throw new Error('Authentication failed');
    }
    
    const authToken = authData.token;
    const user = authData.user;
    console.log(`✅ Authentication successful - User: ${user.name}, Role: ${user.role}`);

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
    testOrderData.items[0].image = product.images && product.images[0] ? product.images[0] : '/products/default.jpg';
    testOrderData.total = product.price * testOrderData.items[0].quantity;
    
    console.log(`✅ Found ${products.length} products, using: ${product.name}`);
    console.log(`   Product ID: ${product._id}`);
    console.log(`   Product Price: ${product.price}`);
    console.log(`   Product Image: ${testOrderData.items[0].image}`);

    // Step 4: Validate order data before sending
    console.log('\n4️⃣ Validating order data...');
    console.log('Order Data:', JSON.stringify(testOrderData, null, 2));
    
    // Check required fields
    const requiredFields = {
      'items': testOrderData.items && testOrderData.items.length > 0,
      'items[0].product': testOrderData.items[0].product,
      'items[0].name': testOrderData.items[0].name,
      'items[0].price': testOrderData.items[0].price,
      'items[0].quantity': testOrderData.items[0].quantity,
      'items[0].image': testOrderData.items[0].image,
      'shippingAddress.fullName': testOrderData.shippingAddress.fullName,
      'shippingAddress.email': testOrderData.shippingAddress.email,
      'shippingAddress.phone': testOrderData.shippingAddress.phone,
      'shippingAddress.address': testOrderData.shippingAddress.address,
      'shippingAddress.city': testOrderData.shippingAddress.city,
      'shippingAddress.district': testOrderData.shippingAddress.district,
      'shippingAddress.postalCode': testOrderData.shippingAddress.postalCode,
      'paymentMethod': testOrderData.paymentMethod,
      'total': testOrderData.total
    };
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        console.log(`❌ Missing required field: ${field}`);
      } else {
        console.log(`✅ ${field}: ${value}`);
      }
    }

    // Step 5: Create order
    console.log('\n5️⃣ Creating order...');
    
    try {
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
        console.log('❌ Order creation failed:', orderResponse.data.message);
        console.log('   Error details:', orderResponse.data.error);
        throw new Error('Order creation failed: ' + (orderResponse.data.message || 'Unknown error'));
      }

      const order = orderResponse.data.order;
      console.log(`✅ Order created successfully!`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Order ID: ${order._id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: ${order.total}`);

      // Step 6: Test payment processing
      console.log('\n6️⃣ Testing payment processing...');
      
      const paymentData = {
        orderId: order._id,
        paymentMethod: 'cash_on_delivery',
        amount: order.total
      };
      
      const paymentResponse = await axios.post(
        `${BASE_URL}/payments/process`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (paymentResponse.data.success) {
        console.log(`✅ Payment processed successfully!`);
        console.log(`   Payment ID: ${paymentResponse.data.payment._id}`);
        console.log(`   Payment Status: ${paymentResponse.data.payment.status}`);
      } else {
        console.log('❌ Payment processing failed:', paymentResponse.data.message);
      }

      // Step 7: Get final order status
      console.log('\n7️⃣ Checking final order status...');
      
      const finalOrderResponse = await axios.get(
        `${BASE_URL}/orders/${order._id}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (finalOrderResponse.data.success) {
        const finalOrder = finalOrderResponse.data.order;
        console.log(`✅ Final order status: ${finalOrder.status}`);
        console.log(`   Payment Status: ${finalOrder.paymentStatus}`);
      }

      console.log('\n🎉 All tests completed successfully!');

    } catch (orderError) {
      console.log('\n❌ Order creation failed:');
      console.log('   Status:', orderError.response?.status);
      console.log('   Message:', orderError.response?.data?.message);
      console.log('   Error:', orderError.response?.data?.error);
      console.log('   Details:', orderError.response?.data);
      
      if (orderError.response?.data?.error?.errors) {
        console.log('\n📋 Validation errors:');
        for (const [field, error] of Object.entries(orderError.response.data.error.errors)) {
          console.log(`   ${field}: ${error.message}`);
        }
      }
      
      throw orderError;
    }

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
runTest().catch(console.error);
