#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createSampleOrdersForUser() {
  try {
    console.log('📦 Creating sample orders for regular user...');
    
    // First login to get the user token
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'testuser@cardiolive.com',
      password: 'User123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Failed to login');
    }

    const userToken = loginResponse.data.token;
    const userId = loginResponse.data.user._id;
    
    console.log('✅ Logged in successfully');
    console.log('👤 User ID:', userId);

    // Create headers with auth token
    const headers = {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    };

    // Sample orders data
    const ordersData = [
      {
        items: [
          {
            product: '674550001234567890123456', // Dummy product ID
            name: 'Premium Zeytinyağı 500ml',
            quantity: 2,
            price: 89.90,
            image: '/products/olive-oil-premium.jpg'
          },
          {
            product: '674550001234567890123457',
            name: 'Doğal Yeşil Zeytin 250g',
            quantity: 1,
            price: 34.50,
            image: '/products/green-olives.jpg'
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        paymentMethod: 'credit_card',
        notes: 'Lütfen sabah saatlerinde teslim edin'
      },
      {
        items: [
          {
            product: '674550001234567890123458',
            name: 'Organik Siyah Zeytin 400g',
            quantity: 3,
            price: 45.00,
            image: '/products/black-olives.jpg'
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        paymentMethod: 'bank_transfer'
      },
      {
        items: [
          {
            product: '674550001234567890123459',
            name: 'Karma Zeytin Çeşitleri 1kg',
            quantity: 1,
            price: 120.00,
            image: '/products/mixed-olives.jpg'
          },
          {
            product: '674550001234567890123456',
            name: 'Premium Zeytinyağı 500ml',
            quantity: 1,
            price: 89.90,
            image: '/products/olive-oil-premium.jpg'
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          email: 'testuser@cardiolive.com',
          phone: '05551234567',
          address: 'Atatürk Caddesi No: 123 Daire: 5',
          city: 'İstanbul',
          district: 'Kadıköy',
          postalCode: '34710'
        },
        paymentMethod: 'cash_on_delivery',
        notes: 'Kapı zili çalışmıyor, lütfen arayın'
      }
    ];

    let orderCount = 0;
    for (const orderData of ordersData) {
      try {
        const response = await axios.post(`${BASE_URL}/orders`, orderData, { headers });
        
        if (response.data.success) {
          orderCount++;
          console.log(`✅ Order ${orderCount} created: ${response.data.data.order._id}`);
          
          // Update order status for variety
          if (orderCount === 1) {
            // First order - mark as shipped
            await axios.put(`${BASE_URL}/orders/${response.data.data.order._id}/status`, 
              { status: 'shipped' }, 
              { headers }
            );
            console.log(`📦 Order ${orderCount} marked as shipped`);
          } else if (orderCount === 2) {
            // Second order - mark as delivered
            await axios.put(`${BASE_URL}/orders/${response.data.data.order._id}/status`, 
              { status: 'delivered' }, 
              { headers }
            );
            console.log(`✅ Order ${orderCount} marked as delivered`);
          }
          // Third order stays as pending
        } else {
          console.log(`❌ Failed to create order ${orderCount + 1}:`, response.data.message);
        }
      } catch (error) {
        console.log(`❌ Error creating order ${orderCount + 1}:`, error.response?.data?.message || error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${orderCount} sample orders for user!`);
    console.log('💡 You can now login with:');
    console.log('📧 Email: testuser@cardiolive.com');
    console.log('🔑 Password: User123!');
    console.log('🌐 Login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

createSampleOrdersForUser();
