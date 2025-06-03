#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');
const User = require('./src/models/userModel');

async function createSampleOrders() {
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

    console.log('👤 Found user:', user.name, '(' + user._id + ')');    // Sample orders
    const ordersData = [
      {
        orderNumber: 'CL000001',
        user: user._id,
        items: [
          {
            product: new mongoose.Types.ObjectId('674550001234567890123456'),
            name: 'Premium Zeytinyağı 500ml',
            quantity: 2,
            price: 89.90,
            image: '/products/olive-oil-premium.jpg'
          },
          {
            product: new mongoose.Types.ObjectId('674550001234567890123457'),
            name: 'Doğal Yeşil Zeytin 250g',
            quantity: 1,
            price: 34.50,
            image: '/products/green-olives.jpg'
          }
        ],
        total: 214.30,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        trackingNumber: 'TRK123456789',
        notes: 'Lütfen sabah saatlerinde teslim edin',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)  // 5 days ago
      },
      {
        user: user._id,
        items: [
          {
            product: new mongoose.Types.ObjectId('674550001234567890123458'),
            name: 'Organik Siyah Zeytin 400g',
            quantity: 3,
            price: 45.00,
            image: '/products/black-olives.jpg'
          }
        ],
        total: 135.00,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        trackingNumber: 'TRK987654321',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
      },
      {
        user: user._id,
        items: [
          {
            product: new mongoose.Types.ObjectId('674550001234567890123459'),
            name: 'Karma Zeytin Çeşitleri 1kg',
            quantity: 1,
            price: 120.00,
            image: '/products/mixed-olives.jpg'
          },
          {
            product: new mongoose.Types.ObjectId('674550001234567890123456'),
            name: 'Premium Zeytinyağı 500ml',
            quantity: 1,
            price: 89.90,
            image: '/products/olive-oil-premium.jpg'
          }
        ],
        total: 209.90,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'cash_on_delivery',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        notes: 'Kapı zili çalışmıyor, lütfen arayın',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)  // 1 day ago
      },
      {
        user: user._id,
        items: [
          {
            product: new mongoose.Types.ObjectId('674550001234567890123460'),
            name: 'Soğuk Sıkım Zeytinyağı 1L',
            quantity: 2,
            price: 150.00,
            image: '/products/cold-pressed-oil.jpg'
          }
        ],
        total: 300.00,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'credit_card',
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        createdAt: new Date(), // Today
        updatedAt: new Date()  // Today
      }
    ];

    let createdCount = 0;
    for (const orderData of ordersData) {
      try {
        const order = await Order.create(orderData);
        createdCount++;
        console.log(`✅ Order ${createdCount} created: ${order._id} (Status: ${order.status})`);
      } catch (error) {
        console.log(`❌ Error creating order ${createdCount + 1}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdCount} sample orders!`);
    console.log('💡 You can now test the order management system:');
    console.log('📧 Email: testuser@cardiolive.com');
    console.log('🔑 Password: User123!');
    console.log('🌐 Login at: http://localhost:3000/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSampleOrders();
