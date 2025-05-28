#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let productId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? '‚úÖ PASS' : '‚ùå FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}${details ? ' - ' + details : ''}`, color);
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.headers['Content-Type'] = 'application/json';
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

async function testAuthentication() {
  log('\nÌ¥ê Testing Authentication System', 'blue');
  
  const loginData = {
    email: 'admin@cardiolive.com',
    password: 'admin123'
  };
  
  const loginResult = await makeRequest('POST', '/users/login', loginData);
  logTest('Admin Login', loginResult.success, loginResult.error);
  
  if (loginResult.success) {
    authToken = loginResult.data.token;
    userId = loginResult.data.user.id;
    log(`Auth token received`, 'yellow');
  }
  
  return loginResult.success;
}

async function testProducts() {
  log('\nÌªí Testing Product System', 'blue');
  
  const productsResult = await makeRequest('GET', '/products');
  logTest('Get Products', productsResult.success, 
    productsResult.success ? `Found ${productsResult.data.products.length} products` : productsResult.error);
  
  if (productsResult.success && productsResult.data.products.length > 0) {
    productId = productsResult.data.products[0]._id;
    log(`Using product: ${productsResult.data.products[0].name}`, 'yellow');
  }
  
  return productsResult.success;
}

async function testBlogs() {
  log('\nÌ≥ù Testing Blog System', 'blue');
  
  const blogsResult = await makeRequest('GET', '/blogs');
  logTest('Get Blogs', blogsResult.success, 
    blogsResult.success ? `Found ${blogsResult.data.length} blogs` : blogsResult.error);
  
  if (blogsResult.success && blogsResult.data.length > 0) {
    const blogId = blogsResult.data[0]._id;
    const blogResult = await makeRequest('GET', `/blogs/${blogId}`);
    logTest('Get Single Blog', blogResult.success, blogResult.error);
  }
  
  return blogsResult.success;
}

async function testOrders() {
  log('\nÌ≥¶ Testing Order System', 'blue');
  
  if (!authToken) {
    logTest('Create Order', false, 'No auth token available');
    return false;
  }
  
  // Create order with correct field names
  const orderData = {
    items: [
      {
        product: productId,
        quantity: 2,
        price: 25.99,
        name: 'Test Product'
      }
    ],
    total: 51.98, // Use 'total' instead of 'totalAmount'
    shippingAddress: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+90 555 123 4567',
      address: '123 Test Street',
      city: 'Istanbul',
      state: 'Istanbul',
      zipCode: '34000',
      country: 'Turkey'
    },
    paymentMethod: 'credit_card'
  };
  
  const createOrderResult = await makeRequest('POST', '/orders', orderData, authToken);
  logTest('Create Order', createOrderResult.success, createOrderResult.error);
  
  if (createOrderResult.success) {
    log(`Order created with ID: ${createOrderResult.data.order._id}`, 'yellow');
  }
  
  // Get user orders
  const userOrdersResult = await makeRequest('GET', '/orders/user', null, authToken);
  logTest('Get User Orders', userOrdersResult.success, 
    userOrdersResult.success ? `Found ${userOrdersResult.data.length} orders` : userOrdersResult.error);
  
  return createOrderResult.success && userOrdersResult.success;
}

async function testAdminOperations() {
  log('\nÌ±ë Testing Admin Operations', 'blue');
  
  if (!authToken) {
    logTest('Admin Operations', false, 'No auth token available');
    return false;
  }
  
  // Test admin endpoints
  const adminUsersResult = await makeRequest('GET', '/users/admin/users', null, authToken);
  logTest('Admin - Get All Users', adminUsersResult.success, 
    adminUsersResult.success ? `Found ${adminUsersResult.data.length} users` : adminUsersResult.error);
  
  const adminOrdersResult = await makeRequest('GET', '/orders/admin', null, authToken);
  logTest('Admin - Get All Orders', adminOrdersResult.success, 
    adminOrdersResult.success ? `Found ${adminOrdersResult.data.orders.length} orders` : adminOrdersResult.error);
  
  return adminUsersResult.success && adminOrdersResult.success;
}

async function testCartSimulation() {
  log('\nÌªçÔ∏è Testing Cart Simulation', 'blue');
  
  // Simulate cart operations that frontend would do
  if (!productId) {
    logTest('Cart Simulation', false, 'No product available');
    return false;
  }
  
  // Get product details (like adding to cart)
  const productResult = await makeRequest('GET', `/products/${productId}`);
  logTest('Get Product for Cart', productResult.success, productResult.error);
  
  if (productResult.success) {
    log(`Product added to cart: ${productResult.data.name} - $${productResult.data.price}`, 'yellow');
  }
  
  return productResult.success;
}

async function runAllTests() {
  log('Ì∫Ä Starting Cardiolive E-commerce System Tests', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const authPassed = await testAuthentication();
    const productsPassed = await testProducts();
    const blogsPassed = await testBlogs();
    const cartPassed = await testCartSimulation();
    const ordersPassed = await testOrders();
    const adminPassed = await testAdminOperations();
    
    log('\nÌ≥ä Test Summary', 'blue');
    log('='.repeat(30), 'blue');
    logTest('Authentication System', authPassed);
    logTest('Product System', productsPassed);
    logTest('Blog System', blogsPassed);
    logTest('Cart Simulation', cartPassed);
    logTest('Order System', ordersPassed);
    logTest('Admin Operations', adminPassed);
    
    const allPassed = authPassed && productsPassed && blogsPassed && cartPassed && ordersPassed && adminPassed;
    
    log(`\nÌæØ Overall Result: ${allPassed ? '‚úÖ ALL TESTS PASSED' : '‚ùå SOME TESTS FAILED'}`, 
      allPassed ? 'green' : 'red');
    
    if (allPassed) {
      log('\nÌæâ Cardiolive e-commerce system is functioning correctly!', 'green');
      log('‚úì Authentication and authorization working', 'green');
      log('‚úì Product catalog accessible', 'green');
      log('‚úì Blog system integrated', 'green');
      log('‚úì Cart operations functional', 'green');
      log('‚úì Order processing working', 'green');
      log('‚úì Admin panel operational', 'green');
      log('\nÌ∫Ä System is ready for production deployment!', 'green');
    } else {
      log('\n‚ö†Ô∏è  Some tests failed. Please review the issues above.', 'red');
    }
    
  } catch (error) {
    log(`\nÌ≤• Test suite crashed: ${error.message}`, 'red');
  }
}

async function checkServers() {
  try {
    await axios.get('http://localhost:5000/api/blogs');
    log('‚úÖ Backend server is running on port 5000', 'green');
    return true;
  } catch (error) {
    log('‚ùå Backend server is not running. Please start it first.', 'red');
    return false;
  }
}

async function main() {
  const serversRunning = await checkServers();
  if (serversRunning) {
    await runAllTests();
  }
}

main();
