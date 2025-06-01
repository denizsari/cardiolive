const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
  try {
    console.log('🔍 Testing server endpoints...');
    
    // Test 1: Health check
    console.log('\n1️⃣ Health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ Health:', health.data.message);
    
    // Test 2: Products endpoint
    console.log('\n2️⃣ Products endpoint...');
    const products = await axios.get(`${BASE_URL}/products`);
    console.log(`✅ Products: Found ${products.data.length || products.data.products?.length || 0} products`);
    
    // Test 3: Try to register a new admin user
    console.log('\n3️⃣ Creating admin user...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/users/register`, {
        name: 'Test Admin',
        email: 'testadmin@cardiolive.com',
        password: 'admin123456',
        role: 'admin'
      });
      console.log('✅ Admin user created:', registerResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Admin user already exists');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Test 4: Login with the admin user
    console.log('\n4️⃣ Login test...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: 'testadmin@cardiolive.com',
      password: 'admin123456'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log('User:', loginResponse.data.user.name, '- Role:', loginResponse.data.user.role);
      
      // Test 5: Order creation
      console.log('\n5️⃣ Order creation test...');
      const orderData = {
        items: [
          {
            product: products.data[0]?._id || products.data.products?.[0]?._id,
            name: 'Test Product',
            price: 50.99,
            quantity: 1,
            image: '/products/test.jpg'
          }
        ],
        total: 50.99,
        shippingAddress: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+90 555 123 4567',
          address: 'Test Address 123',
          city: 'Istanbul',
          district: 'Kadikoy',
          postalCode: '34710'
        },
        paymentMethod: 'cash_on_delivery'
      };
      
      const orderResponse = await axios.post(`${BASE_URL}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (orderResponse.data.success) {
        console.log('✅ Order created:', orderResponse.data.data.order.orderNumber);
        
        // Test 6: Payment processing
        console.log('\n6️⃣ Payment processing test...');
        const paymentResponse = await axios.post(`${BASE_URL}/payments/process`, {
          orderId: orderResponse.data.data.order._id,
          paymentMethod: 'cash_on_delivery'
        }, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (paymentResponse.data.success) {
          console.log('✅ Payment processed successfully!');
          console.log('🎉 ALL TESTS PASSED! Order and payment flow working correctly.');
        } else {
          console.log('❌ Payment failed:', paymentResponse.data.message);
        }
      } else {
        console.log('❌ Order creation failed:', orderResponse.data.message);
      }
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

quickTest();
