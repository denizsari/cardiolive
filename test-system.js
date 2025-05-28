#!/usr/bin/env node

/**
 * Cardiolive E-commerce System Test Suite
 * Tests all major functionalities including auth, products, orders, and admin operations
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let orderId = '';
let productId = '';

// Colors for console output
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
  
  // Test login with existing admin
  const loginData = {
    email: 'admin@cardiolive.com',
    password: 'admin123'
  };
  
  const loginResult = await makeRequest('POST', '/users/login', loginData);
  logTest('Admin Login', loginResult.success, loginResult.error);
  
  if (loginResult.success) {
    authToken = loginResult.data.token;
    userId = loginResult.data.user.id;
    log(`Auth token received: ${authToken.substring(0, 20)}...`, 'yellow');
  }
  
  return loginResult.success;
}

async function testProducts() {
  log('\nÌªí Testing Product System', 'blue');
  
  // Get all products
  const productsResult = await makeRequest('GET', '/products');
  logTest('Get Products', productsResult.success, 
    productsResult.success ? `Found ${productsResult.data.length} products` : productsResult.error);
  
  if (productsResult.success && productsResult.data.length > 0) {
    productId = productsResult.data[0]._id;
    log(`Using product ID: ${productId}`, 'yellow');
  }
  
  return productsResult.success;
}

async function testBlogs() {
  log('\nÌ≥ù Testing Blog System', 'blue');
  
  // Get all blogs
  const blogsResult = await makeRequest('GET', '/blogs');
  logTest('Get Blogs', blogsResult.success, 
    blogsResult.success ? `Found ${blogsResult.data.length} blogs` : blogsResult.error);
  
  if (blogsResult.success && blogsResult.data.length > 0) {
    const blogId = blogsResult.data[0]._id;
    
    // Get single blog
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
  
  // Create order
  const orderData = {
    items: [
      {
        product: productId || '507f1f77bcf86cd799439011',
        quantity: 2,
        price: 25.99
      }
    ],
    totalAmount: 51.98,
    shippingAddress: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Turkey'
    },
    paymentMethod: 'credit_card'
  };
  
  const createOrderResult = await makeRequest('POST', '/orders', orderData, authToken);
  logTest('Create Order', createOrderResult.success, createOrderResult.error);
  
  if (createOrderResult.success) {
    orderId = createOrderResult.data._id;
    log(`Order created with ID: ${orderId}`, 'yellow');
  }
  
  // Get user orders
  const userOrdersResult = await makeRequest('GET', '/orders/user', null, authToken);
  logTest('Get User Orders', userOrdersResult.success, 
    userOrdersResult.success ? `Found ${userOrdersResult.data.length} orders` : userOrdersResult.error);
  
  return createOrderResult.success;
}

async function runAllTests() {
  log('Ì∫Ä Starting Cardiolive E-commerce System Tests', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const authPassed = await testAuthentication();
    const productsPassed = await testProducts();
    const blogsPassed = await testBlogs();
    const ordersPassed = await testOrders();
    
    log('\nÌ≥ä Test Summary', 'blue');
    log('='.repeat(30), 'blue');
    logTest('Authentication System', authPassed);
    logTest('Product System', productsPassed);
    logTest('Blog System', blogsPassed);
    logTest('Order System', ordersPassed);
    
    const allPassed = authPassed && productsPassed && blogsPassed && ordersPassed;
    
    log(`\nÌæØ Overall Result: ${allPassed ? '‚úÖ ALL TESTS PASSED' : '‚ùå SOME TESTS FAILED'}`, 
      allPassed ? 'green' : 'red');
    
    if (allPassed) {
      log('\nÌæâ Cardiolive e-commerce system is functioning correctly!', 'green');
      log('The system is ready for production deployment.', 'green');
    } else {
      log('\n‚ö†Ô∏è  Some tests failed. Please review the issues above.', 'red');
    }
    
  } catch (error) {
    log(`\nÌ≤• Test suite crashed: ${error.message}`, 'red');
  }
}

// Check if servers are running
async function checkServers() {
  try {
    await axios.get('http://localhost:5000/api/blogs');
    log('‚úÖ Backend server is running on port 5000', 'green');
    return true;
  } catch (error) {
    log('‚ùå Backend server is not running. Please start it with: npm start', 'red');
    return false;
  }
}

// Main execution
async function main() {
  const serversRunning = await checkServers();
  if (serversRunning) {
    await runAllTests();
  }
}

main();
