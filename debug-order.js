const axios = require('axios');

async function debugOrder() {
  try {
    // Get products
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    const products = productsResponse.data.data;
    const firstProduct = products[0];
    
    console.log('First product details:');
    console.log('ID:', firstProduct._id);
    console.log('Name:', firstProduct.name);
    console.log('Price:', firstProduct.price);
    console.log('Stock:', firstProduct.stock);
    console.log('IsActive:', firstProduct.isActive);
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
      email: 'admin@cardiolive.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.message.accessToken;
    console.log('\nLogin successful, token obtained');
    
    // Try to create order
    const orderData = {
      items: [{
        product: firstProduct._id,
        quantity: 2,
        price: firstProduct.price,
        name: firstProduct.name
      }],
      total: firstProduct.price * 2,
      shippingAddress: {
        fullName: "Test Customer",
        email: "customer@test.com",
        phone: "+90 555 123 4567",
        address: "123 Test Street, Test Apartment",
        city: "Istanbul",
        district: "Kadikoy",
        postalCode: "34000"
      },
      paymentMethod: "credit_card",
      notes: "Test order for debugging"
    };
    
    console.log('\nOrder data being sent:');
    console.log('Product ID:', orderData.items[0].product);
    console.log('Quantity:', orderData.items[0].quantity);
    console.log('Price:', orderData.items[0].price);
    console.log('Total:', orderData.total);
    
    const orderResponse = await axios.post('http://localhost:5000/api/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Order created successfully!');
    console.log('Order ID:', orderResponse.data.order._id);
    
  } catch (error) {
    console.log('\n❌ Order creation failed:');
    console.log('Error:', error.response?.data || error.message);
  }
}

debugOrder();
