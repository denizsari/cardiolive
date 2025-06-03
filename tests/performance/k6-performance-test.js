// Performance testing configuration for k6
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  // Performance test scenarios
  scenarios: {
    // Smoke test - basic functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },
    
    // Load test - normal traffic
    load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
      tags: { test_type: 'load' },
    },
    
    // Stress test - high traffic
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },
    
    // Spike test - sudden traffic increase
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '30s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },
  },
  
  // Thresholds for pass/fail criteria
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests under 500ms
    'http_req_failed': ['rate<0.1'],    // Error rate under 10%
    'errors': ['rate<0.1'],             // Custom error rate under 10%
  },
};

// Test data
const baseUrl = 'http://localhost:5000';
const testData = {
  user: {
    email: 'test@performance.com',
    password: 'test123',
    firstName: 'Performance',
    lastName: 'Test'
  },
  product: {
    name: 'Performance Test Product',
    description: 'Product for performance testing',
    price: 99.99,
    category: 'test',
    brand: 'Test Brand',
    stock: 1000
  }
};

// Helper function to get authentication token
function getAuthToken() {
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: testData.user.email,
    password: testData.user.password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (loginResponse.status === 200) {
    const body = JSON.parse(loginResponse.body);
    return body.token;
  }
  return null;
}

// Main test function
export default function () {
  const testScenario = __ENV.TEST_SCENARIO || 'all';
  
  // Health check
  const healthResponse = http.get(`${baseUrl}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);
  
  // API endpoint tests
  if (testScenario === 'all' || testScenario === 'api') {
    testAPIEndpoints();
  }
  
  // Authentication tests
  if (testScenario === 'all' || testScenario === 'auth') {
    testAuthentication();
  }
  
  // Product system tests
  if (testScenario === 'all' || testScenario === 'products') {
    testProductSystem();
  }
  
  // Order system tests
  if (testScenario === 'all' || testScenario === 'orders') {
    testOrderSystem();
  }
  
  sleep(1); // Think time between iterations
}

function testAPIEndpoints() {
  const endpoints = [
    '/api/products',
    '/api/blogs',
    '/api/categories',
  ];
  
  endpoints.forEach(endpoint => {
    const response = http.get(`${baseUrl}${endpoint}`);
    check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time < 300ms`]: (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  });
}

function testAuthentication() {
  // Test user registration
  const registerResponse = http.post(`${baseUrl}/api/auth/register`, JSON.stringify({
    ...testData.user,
    email: `${Date.now()}@performance.com` // Unique email
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(registerResponse, {
    'registration status is 201': (r) => r.status === 201,
    'registration response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
  
  // Test user login
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: testData.user.email,
    password: testData.user.password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 300ms': (r) => r.timings.duration < 300,
    'login returns token': (r) => JSON.parse(r.body).token !== undefined,
  }) || errorRate.add(1);
}

function testProductSystem() {
  // Get products list
  const productsResponse = http.get(`${baseUrl}/api/products`);
  check(productsResponse, {
    'products list status is 200': (r) => r.status === 200,
    'products list response time < 200ms': (r) => r.timings.duration < 200,
    'products list has data': (r) => JSON.parse(r.body).length > 0,
  }) || errorRate.add(1);
  
  // Get single product (assuming first product exists)
  if (productsResponse.status === 200) {
    const products = JSON.parse(productsResponse.body);
    if (products.length > 0) {
      const productId = products[0]._id;
      const productResponse = http.get(`${baseUrl}/api/products/${productId}`);
      check(productResponse, {
        'single product status is 200': (r) => r.status === 200,
        'single product response time < 200ms': (r) => r.timings.duration < 200,
      }) || errorRate.add(1);
    }
  }
}

function testOrderSystem() {
  const token = getAuthToken();
  if (!token) return;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  // Test order creation
  const orderData = {
    items: [{
      product: '683958fd3582f4a6e2307efd', // Mock product ID
      name: 'Performance Test Product',
      price: 99.99,
      quantity: 1,
      image: '/test-product.jpg'
    }],
    total: 99.99,
    shippingAddress: {
      fullName: 'Performance Test',
      email: 'test@performance.com',
      phone: '+90 555 000 0000',
      address: '123 Performance St',
      city: 'Istanbul',
      district: 'Test',
      postalCode: '34000'
    },
    paymentMethod: 'credit_card'
  };
  
  const orderResponse = http.post(`${baseUrl}/api/orders`, JSON.stringify(orderData), { headers });
  check(orderResponse, {
    'order creation response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
}

// Setup function - runs once before all iterations
export function setup() {
  console.log('Starting Cardiolive performance tests...');
  
  // Verify server is running
  const healthResponse = http.get(`${baseUrl}/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Server is not running or not healthy');
  }
  
  return { startTime: Date.now() };
}

// Teardown function - runs once after all iterations
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Performance tests completed in ${duration} seconds`);
}

// Handle summary for custom reporting
export function handleSummary(data) {
  return {
    'performance-test-results.json': JSON.stringify(data, null, 2),
    'performance-test-summary.txt': generateTextSummary(data),
  };
}

function generateTextSummary(data) {
  const { metrics } = data;
  
  return `
Cardiolive Performance Test Summary
===================================

Test Duration: ${data.state.testRunDurationMs}ms
Virtual Users: ${data.options.scenarios ? 'Multiple scenarios' : 'N/A'}

Key Metrics:
- Average Response Time: ${metrics.http_req_duration?.values?.avg?.toFixed(2)}ms
- 95th Percentile Response Time: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2)}ms
- Request Rate: ${metrics.http_reqs?.values?.rate?.toFixed(2)} req/s
- Error Rate: ${metrics.http_req_failed?.values?.rate ? (metrics.http_req_failed.values.rate * 100).toFixed(2) : 0}%

Thresholds:
${Object.entries(data.thresholds || {}).map(([key, value]) => 
  `- ${key}: ${value.ok ? 'PASS' : 'FAIL'}`
).join('\n')}

Status: ${data.thresholds && Object.values(data.thresholds).every(t => t.ok) ? 'PASS' : 'FAIL'}
`;
}
