#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');
const User = require('./src/models/userModel');

async function clearOrders() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Find the test user
    const user = await User.findOne({ email: 'testuser@cardiolive.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }

    console.log('👤 Found user:', user.name, '(' + user._id + ')');

    // Delete all orders for this user
    const result = await Order.deleteMany({ user: user._id });
    console.log(`🗑️ Deleted ${result.deletedCount} existing orders`);

    console.log('✅ Orders cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearOrders();
