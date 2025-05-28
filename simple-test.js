const axios = require('axios');

async function test() {
  try {
    console.log('Testing API...');
    
    // Test basic endpoint
    const blogsResponse = await axios.get('http://localhost:5000/api/blogs');
    console.log('✅ Blogs endpoint working:', blogsResponse.data.length, 'blogs found');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    });
    console.log('✅ Login working, token received');
    
    const token = loginResponse.data.token;
    
    // Test protected endpoint
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User orders endpoint working:', ordersResponse.data);
    
    // Test order creation
    const orderData = {
      items: [{
        product: "6837345fe265802d09bae3b3",
        quantity: 1,
        price: 25.99,
        name: "Test Olive Oil"
      }],
      total: 25.99,
      shippingAddress: {
        fullName: "Test User",
        email: "test@example.com", 
        phone: "+90 555 123 4567",
        address: "123 Test Street",
        city: "Istanbul",
        district: "Kadikoy"
      },
      paymentMethod: "credit_card"
    };
    
    const createOrderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Order creation working:', createOrderResponse.data);
    
    console.log('\n� All tests passed! System is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

test();
