#!/usr/bin/env node

/**
 * Cardiolive Production Testing Suite
 * Comprehensive testing of all system components
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3000';

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '', important = false) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  const weight = important ? colors.bold : '';
  
  log(`${weight}${status} ${testName}${details ? ' - ' + details : ''}`, color);
  
  results.tests.push({ name: testName, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {},
      timeout: 10000
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
      status: error.response?.status,
      details: error.response?.data
    };
  }
}

async function testServerHealth() {
  log('\n🏥 Testing Server Health', 'blue');
  
  try {
    // Test backend health
    const backendResponse = await axios.get(`${BASE_URL}/blogs`, { timeout: 5000 });
    logTest('Backend Server', true, `Running on port 5000`);
    
    // Test frontend health
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
      logTest('Frontend Server', true, `Running on port 3000`);
    } catch (error) {
      logTest('Frontend Server', false, 'Not responding on port 3000');
    }    // Test MongoDB connection
    const blogsCount = backendResponse.data?.data?.count || 0;
    logTest('MongoDB Connection', blogsCount > 0, `${blogsCount} blogs in database`);
    
    return true;
  } catch (error) {
    logTest('Backend Server', false, 'Not responding on port 5000');
    return false;
  }
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication System', 'blue');
  
  // Test admin login
  const adminLoginData = {
    email: 'admin@cardiolive.com',
    password: 'admin123'
  };
  const adminLoginResult = await makeRequest('POST', '/users/login', adminLoginData);
  logTest('Admin Login', adminLoginResult.success, adminLoginResult.error);
  if (!adminLoginResult.success) {
    return { success: false, token: null, userId: null };
  }

  // Extract token and user info from the correct response structure
  const token = adminLoginResult.data.message.accessToken;
  const userId = adminLoginResult.data.message.user.id;
  
  if (!userId || !token) {
    logTest('User ID/Token Extraction', false, 'Could not extract user ID or token from response');
    return { success: false, token: null, userId: null };
  }
  
  // Test token validation
  const profileResult = await makeRequest('GET', '/users/me', null, token);
  logTest('Token Validation', profileResult.success, profileResult.error);
  
  // Test role-based access
  const adminUsersResult = await makeRequest('GET', '/users/admin/users', null, token);
  logTest('Admin Role Access', adminUsersResult.success, adminUsersResult.error);
  
  return { 
    success: adminLoginResult.success && profileResult.success, 
    token, 
    userId 
  };
}

async function testProductSystem() {
  log('\n🛒 Testing Product System', 'blue');
    // Get all products
  const productsResult = await makeRequest('GET', '/products');
  const productsWorking = productsResult.success && productsResult.data?.data && productsResult.data.data.length > 0;
  logTest('Get Products', productsWorking, 
    productsWorking ? `Found ${productsResult.data.data.length} products` : productsResult.error);
  
  if (!productsWorking) {
    return { success: false, productId: null };
  }
  
  const productId = productsResult.data.data[0]._id;
  const productName = productsResult.data.data[0].name;
  
  // Get single product
  const singleProductResult = await makeRequest('GET', `/products/${productId}`);
  logTest('Get Single Product', singleProductResult.success, 
    singleProductResult.success ? productName : singleProductResult.error);
    return { 
    success: productsWorking && singleProductResult.success, 
    productId,
    productName,
    productPrice: productsResult.data.data[0].price
  };
}

async function testBlogSystem() {
  log('\n📝 Testing Blog System', 'blue');    // Get all blogs
  const blogsResult = await makeRequest('GET', '/blogs');
  const blogsWorking = blogsResult.success && blogsResult.data?.data?.blogs && blogsResult.data.data.blogs.length > 0;
  logTest('Get Blogs', blogsWorking, 
    blogsWorking ? `Found ${blogsResult.data.data.blogs.length} blogs` : blogsResult.error);
  
  if (!blogsWorking) {
    return false;
  }
    const blogId = blogsResult.data.data.blogs[0]._id;
  const blogTitle = blogsResult.data.data.blogs[0].title;
  
  // Get single blog
  const singleBlogResult = await makeRequest('GET', `/blogs/${blogId}`);
  logTest('Get Single Blog', singleBlogResult.success, 
    singleBlogResult.success ? blogTitle : singleBlogResult.error);
  
  return blogsWorking && singleBlogResult.success;
}

async function testOrderSystem(authData, productData) {
  log('\n📦 Testing Order System', 'blue');
  
  if (!authData.success || !productData.success) {
    logTest('Order Prerequisites', false, 'Auth or product data not available');
    return false;
  }
  
  // Test getting user orders (should be empty initially)
  const userOrdersResult = await makeRequest('GET', '/orders/user', null, authData.token);
  logTest('Get User Orders', userOrdersResult.success, userOrdersResult.error);
  
  // Create test order
  const orderData = {
    items: [{
      product: productData.productId,
      quantity: 2,
      price: productData.productPrice,
      name: productData.productName
    }],
    total: productData.productPrice * 2,
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
    notes: "Test order for system validation"
  };
    const createOrderResult = await makeRequest('POST', '/orders', orderData, authData.token);
  logTest('Create Order', createOrderResult.success, createOrderResult.error, true);
  
  if (!createOrderResult.success) {
    log(`Order creation failed: ${JSON.stringify(createOrderResult.details, null, 2)}`, 'red');
    return false;
  }
  
  const orderId = createOrderResult.data.data.order.id;
  const orderNumber = createOrderResult.data.data.order.orderNumber;
  
  // Get the created order
  const getOrderResult = await makeRequest('GET', `/orders/${orderId}`, null, authData.token);
  logTest('Get Created Order', getOrderResult.success, getOrderResult.error);
  
  // Test order tracking
  const trackOrderResult = await makeRequest('GET', `/orders/track/${orderNumber}`);
  logTest('Track Order', trackOrderResult.success, trackOrderResult.error);
  
  return createOrderResult.success && getOrderResult.success;
}

async function testAdminOperations(authData) {
  log('\n👑 Testing Admin Operations', 'blue');
  
  if (!authData.success) {
    logTest('Admin Prerequisites', false, 'Admin auth not available');
    return false;
  }
    // Test admin endpoints
  const adminUsersResult = await makeRequest('GET', '/users/admin/users', null, authData.token);
  logTest('Admin - Get All Users', adminUsersResult.success, 
    adminUsersResult.success ? `Found ${adminUsersResult.data?.message?.users?.length || 0} users` : adminUsersResult.error);
  
  const adminOrdersResult = await makeRequest('GET', '/orders/admin', null, authData.token);
  logTest('Admin - Get All Orders', adminOrdersResult.success, 
    adminOrdersResult.success ? `Found ${adminOrdersResult.data?.message?.orders?.length || 0} orders` : adminOrdersResult.error);
  
  return adminUsersResult.success && adminOrdersResult.success;
}

async function testErrorHandling() {
  log('\n🚨 Testing Error Handling', 'blue');
  
  // Test invalid login
  const invalidLoginResult = await makeRequest('POST', '/users/login', {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  });
  logTest('Invalid Login Handling', !invalidLoginResult.success && invalidLoginResult.status === 401,
    'Should return 401 for invalid credentials');
  
  // Test protected route without token
  const protectedResult = await makeRequest('GET', '/orders/user');
  logTest('Protected Route Without Token', !protectedResult.success && protectedResult.status === 401,
    'Should return 401 for missing auth');
  
  // Test invalid product ID
  const invalidProductResult = await makeRequest('GET', '/products/invalid-id-format');
  logTest('Invalid Product ID Handling', !invalidProductResult.success,
    'Should handle invalid MongoDB ObjectId gracefully');
  
  return true;
}

async function generateReport() {
  log('\n📊 Test Report', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const totalTests = results.passed + results.failed;
  const successRate = totalTests > 0 ? ((results.passed / totalTests) * 100).toFixed(1) : 0;
  
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Success Rate: ${successRate}%`, successRate > 90 ? 'green' : successRate > 70 ? 'yellow' : 'red');
  
  if (results.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.tests.filter(t => !t.passed).forEach(test => {
      log(`   • ${test.name}: ${test.details}`, 'red');
    });
  }
  
  const isProductionReady = results.failed === 0 && results.passed >= 15;
  
  log(`\n🎯 System Status: ${isProductionReady ? '✅ PRODUCTION READY' : '⚠️ NEEDS ATTENTION'}`, 
    isProductionReady ? 'green' : 'yellow');
  
  if (isProductionReady) {
    log('\n🚀 Cardiolive E-commerce Platform is ready for deployment!', 'green');
    log('✓ All core functionalities working', 'green');
    log('✓ Authentication & authorization secure', 'green');
    log('✓ Order processing functional', 'green');
    log('✓ Admin panel operational', 'green');
    log('✓ Error handling robust', 'green');
  } else {
    log('\n⚠️  System needs attention before production deployment', 'yellow');
    log('Please resolve the failed tests above.', 'yellow');
  }
  
  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    totalTests,
    passed: results.passed,
    failed: results.failed,
    successRate: parseFloat(successRate),
    isProductionReady,
    tests: results.tests
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
  log('\n📄 Detailed report saved to test-report.json', 'cyan');
}

async function runAllTests() {
  log('🚀 Starting Cardiolive Production Testing Suite', 'bold');
  log('='.repeat(60), 'blue');
  
  try {
    // Check server health first
    const serverHealthy = await testServerHealth();
    if (!serverHealthy) {
      log('\n💥 Server health check failed. Please ensure backend is running.', 'red');
      return;
    }
    
    // Run all test suites
    const authData = await testAuthentication();
    const productData = await testProductSystem();
    const blogSystemWorking = await testBlogSystem();
    const orderSystemWorking = await testOrderSystem(authData, productData);
    const adminOperationsWorking = await testAdminOperations(authData);
    const errorHandlingWorking = await testErrorHandling();
    
    // Generate comprehensive report
    await generateReport();
    
  } catch (error) {
    log(`\n💥 Test suite crashed: ${error.message}`, 'red');
    console.error(error);
  }
}

// Main execution
runAllTests();
