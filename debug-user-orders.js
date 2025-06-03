const axios = require('axios');
const mongoose = require('./backend/node_modules/mongoose');

const BASE_URL = 'http://localhost:5000/api';

async function debugUserOrders() {
  try {
    console.log('🔍 Debug: User Orders API Test');
    
    // Step 1: Login as admin to get token
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    });    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user._id;
    console.log(`✅ Login successful - User ID: ${userId}`);
    console.log('🔍 Full login response:', JSON.stringify(loginResponse.data, null, 2));
      // Step 2: Check MongoDB directly
    console.log('\n2️⃣ Connecting to MongoDB to check orders...');
    await mongoose.connect('mongodb+srv://dnzsrslk:lM7FgL9SZgMaMoMn@discordbot.huv0u.mongodb.net/?retryWrites=true&w=majority&appName=discordBot');
    
    const Order = mongoose.model('Order', {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      orderNumber: String,
      status: String,
      total: Number,
      createdAt: Date
    });
    
    const allOrders = await Order.find({});
    console.log(`📊 Total orders in database: ${allOrders.length}`);
    
    const userOrders = await Order.find({ user: userId });
    console.log(`👤 Orders for current user (${userId}): ${userOrders.length}`);
    
    if (allOrders.length > 0) {
      console.log('\n📝 All orders in database:');
      allOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ${order.orderNumber}: User ${order.user}, Status: ${order.status}, Total: ${order.total}`);
      });
    }
    
    if (userOrders.length > 0) {
      console.log('\n👤 Current user orders:');
      userOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ${order.orderNumber}: Status ${order.status}, Total: ${order.total}`);
      });
    }
    
    // Step 3: Test API directly
    console.log('\n3️⃣ Testing getUserOrders API...');
    const apiResponse = await axios.get(`${BASE_URL}/orders/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response received');    console.log('📊 API Response structure:', {
      success: apiResponse.data.success,
      message: apiResponse.data.message,
      hasData: !!apiResponse.data.data,
      orderCount: apiResponse.data.data?.orders?.length || 0,
      paginationExists: !!apiResponse.data.data?.pagination,
      totalItems: apiResponse.data.data?.pagination?.totalItems || 0
    });
      if (apiResponse.data.data?.orders && apiResponse.data.data.orders.length > 0) {
      console.log('\n📝 Orders from API:');
      apiResponse.data.data.orders.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ${order.orderNumber}: Status ${order.status}, Total: ${order.total}`);
      });
    } else {
      console.log('⚠️ API returned empty orders array');
      console.log('Full API response:', JSON.stringify(apiResponse.data, null, 2));
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

debugUserOrders().catch(console.error);
