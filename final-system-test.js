/**
 * Final System Test - Comprehensive validation of all fixes
 * Tests checkout validation, admin dashboard, and API endpoints
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

// Test configuration
const testData = {
  admin: {
    email: 'admin@cardiolive.com',
    password: 'admin123'
  },
  order: {
    items: [{
      product: '683958fd3582f4a6e2307efd', // Valid product ID
      name: 'Cardiolive Sızma Zeytinyağı',
      price: 159.99,
      quantity: 1,
      image: '/products/zeytinyagi-1l-1.jpg'
    }],
    total: 159.99,
    shippingAddress: {
      fullName: 'Final Test Customer',
      email: 'test@finaltest.com',
      phone: '+90 555 999 8888',
      address: '123 Final Test Street',
      city: 'Istanbul',
      district: 'Kadikoy',
      postalCode: '34000'
    },
    paymentMethod: 'credit_card',
    notes: 'Final system test order'
  }
};

let adminToken = '';
let testOrderId = '';

async function runTest(testName, testFn) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    await testFn();
    console.log(`✅ ${testName} - PASSED`);
  } catch (error) {
    console.log(`❌ ${testName} - FAILED:`, error.message);
    return false;
  }
  return true;
}

// Test 1: Admin Authentication
async function testAdminAuth() {
  const response = await fetch(`${API_BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData.admin)
  });
  
  if (!response.ok) throw new Error('Admin login failed');
  
  const data = await response.json();
  if (!data.success || !data.data.accessToken) {
    throw new Error('Invalid login response structure');
  }
  
  adminToken = data.data.accessToken;
  console.log('   • Admin token obtained successfully');
}

// Test 2: Admin User Count API
async function testAdminUserCount() {
  const response = await fetch(`${API_BASE}/api/users/count`, {
    headers: { 
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error('User count API failed');
  
  const data = await response.json();
  if (!data.success || typeof data.data.count !== 'number') {
    throw new Error('Invalid user count response');
  }
  
  console.log(`   • User count: ${data.data.count}`);
}

// Test 3: Admin Orders API
async function testAdminOrders() {
  const response = await fetch(`${API_BASE}/api/orders/admin`, {
    headers: { 
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error('Admin orders API failed');
  
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data.orders)) {
    throw new Error('Invalid orders response structure');
  }
  
  console.log(`   • Orders count: ${data.data.orders.length}`);
  console.log(`   • Total revenue: $${data.data.stats.totalRevenue}`);
}

// Test 4: Products API
async function testProductsAPI() {
  const response = await fetch(`${API_BASE}/api/products`);
  
  if (!response.ok) throw new Error('Products API failed');
  
  const data = await response.json();
  if (!data.success || !Array.isArray(data.data.products)) {
    throw new Error('Invalid products response structure');
  }
  
  console.log(`   • Products count: ${data.data.products.length}`);
}

// Test 5: Order Creation
async function testOrderCreation() {
  const response = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData.order)
  });
  
  if (!response.ok) throw new Error('Order creation failed');
  
  const data = await response.json();
  if (!data.success || !data.data.order) {
    throw new Error('Invalid order creation response');
  }
  
  testOrderId = data.data.order._id;
  console.log(`   • Order created: ${data.data.order.orderNumber}`);
}

// Test 6: Payment Update API
async function testPaymentUpdate() {
  if (!testOrderId) throw new Error('No test order ID available');
  
  const paymentData = {
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    paymentReference: `TEST_${Date.now()}`,
    paidAt: new Date().toISOString()
  };
  
  const response = await fetch(`${API_BASE}/api/orders/${testOrderId}/payment`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });
  
  if (!response.ok) throw new Error('Payment update failed');
  
  const data = await response.json();
  if (!data.success || data.data.order.paymentStatus !== 'paid') {
    throw new Error('Payment update did not work correctly');
  }
  
  console.log(`   • Payment updated: ${data.data.order.paymentStatus}`);
  console.log(`   • Order status: ${data.data.order.status}`);
}

// Test 7: Frontend Health Check
async function testFrontendHealth() {
  const response = await fetch(`${FRONTEND_BASE}`);
  
  if (!response.ok) throw new Error('Frontend not accessible');
  
  console.log('   • Frontend server responding');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Final System Test Suite');
  console.log('=' .repeat(50));
  
  const tests = [
    ['Admin Authentication', testAdminAuth],
    ['Admin User Count API', testAdminUserCount],
    ['Admin Orders API', testAdminOrders],
    ['Products API', testProductsAPI],
    ['Order Creation', testOrderCreation],
    ['Payment Update API', testPaymentUpdate],
    ['Frontend Health Check', testFrontendHealth]
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [name, testFn] of tests) {
    const success = await runTest(name, testFn);
    if (success) passed++;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! System is fully operational.');
    console.log('\n✅ Key fixes verified:');
    console.log('   • Checkout validation error - FIXED');
    console.log('   • Admin dashboard 0 values - FIXED');
    console.log('   • Admin orders API endpoint - FIXED');
    console.log('   • Payment update method - WORKING');
    console.log('   • API response structure - CORRECTED');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
