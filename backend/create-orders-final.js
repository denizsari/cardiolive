#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');
const User = require('./src/models/userModel');
const Product = require('./src/models/productModel');

async function createSampleOrders() {
  try {
    console.log('Ì¥ó Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('‚úÖ MongoDB connected successfully');

    // Find the test user
    const user = await User.findOne({ email: 'testuser@cardiolive.com' });
    if (!user) {
      console.log('‚ùå Test user not found');
      process.exit(1);
    }
    console.log('Ì±§ Found user:', user.name, '(' + user._id + ')');

    // Get real products from database
    const products = await Product.find().limit(5);
    console.log('Ì≥¶ Found', products.length, 'products');

    if (products.length < 4) {
      console.log('‚ùå Need at least 4 products in database');
      process.exit(1);
    }

    // Sample orders (without orderNumber - let model generate it)
    const ordersData = [
      {
        user: user._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            quantity: 2,
            price: products[0].price,
            image: products[0].image || '/images/default-product.jpg'
          },
          {
            product: products[1]._id,
            name: products[1].name,
            quantity: 1,
            price: products[1].price,
            image: products[1].image || '/images/default-product.jpg'
          }
        ],
        total: (products[0].price * 2) + products[1].price,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        trackingNumber: 'TRK123456789',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: '123 Test Street, Apt 4B',
          city: 'Istanbul',
          district: 'Kadikoy',
          postalCode: '34710'
        }
      },
      {
        user: user._id,
        items: [
          {
            product: products[2]._id,
            name: products[2].name,
            quantity: 1,
            price: products[2].price,
            image: products[2].image || '/images/default-product.jpg'
          }
        ],
        total: products[2].price,
        status: 'shipped',
        paymentStatus: 'pending',
        paymentMethod: 'cash_on_delivery',
        trackingNumber: 'TRK987654321',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: '456 Another Street',
          city: 'Ankara',
          district: 'Cankaya',
          postalCode: '06100'
        }
      },
      {
        user: user._id,
        items: [
          {
            product: products[3]._id,
            name: products[3].name,
            quantity: 3,
            price: products[3].price,
            image: products[3].image || '/images/default-product.jpg'
          }
        ],
        total: products[3].price * 3,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: '789 Third Avenue',
          city: 'Izmir',
          district: 'Konak',
          postalCode: '35220'
        }
      },
      {
        user: user._id,
        items: [
          {
            product: products[0]._id,
            name: products[0].name,
            quantity: 1,
            price: products[0].price,
            image: products[0].image || '/images/default-product.jpg'
          }
        ],
        total: products[0].price,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'credit_card',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: '321 Fourth Boulevard',
          city: 'Bursa',
          district: 'Nilufer',
          postalCode: '16110'
        }
      }
    ];

    console.log('Ì≥ù Creating', ordersData.length, 'sample orders...');

    let createdCount = 0;
    for (let i = 0; i < ordersData.length; i++) {
      try {
        const order = new Order(ordersData[i]);
        await order.save();
        console.log('‚úÖ Created order', i + 1, 'with orderNumber:', order.orderNumber);
        createdCount++;
      } catch (error) {
        console.error('‚ùå Error creating order', i + 1, ':', error.message);
      }
    }

    console.log('\nÌæâ Successfully created', createdCount, 'sample orders!');
    console.log('ÌæØ You can now test the order management system:');
    console.log('Ì≥ß Email: testuser@cardiolive.com');
    console.log('Ì¥ë Password: User123!');
    console.log('Ìºê Login at: http://localhost:3000/login');

    await mongoose.disconnect();
  } catch (error) {
    console.error('‚ùå Error:', error);
    process.exit(1);
  }
}

createSampleOrders();
