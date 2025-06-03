import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Hold at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Hold at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate should be less than 5%
    errors: ['rate<0.1'],             // Custom error rate should be less than 10%
  },
};

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: `test_${Math.random()}@example.com`,
  password: 'testPassword123',
  name: 'Load Test User'
};

export function setup() {
  // Register test user
  const registerResponse = http.post(`${BASE_URL}/users/register`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (registerResponse.status === 201) {
    const loginResponse = http.post(`${BASE_URL}/users/login`, JSON.stringify({
      email: testUser.email,
      password: testUser.password
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginResponse.status === 200) {
      const body = JSON.parse(loginResponse.body);
      return { token: body.data.token };
    }
  }
  
  return { token: null };
}

export default function(data) {
  const headers = data.token ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`
  } : {
    'Content-Type': 'application/json'
  };

  // Test scenarios
  const scenarios = [
    () => testProductListing(),
    () => testProductDetails(),
    () => testBlogListing(),
    () => data.token ? testUserProfile(headers) : null,
    () => data.token ? testOrderHistory(headers) : null,
  ];

  // Run random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  if (scenario) {
    scenario();
  }

  sleep(1);
}

function testProductListing() {
  const response = http.get(`${BASE_URL}/products?page=1&limit=12`);
  
  const success = check(response, {
    'products listing status is 200': (r) => r.status === 200,
    'products listing response time < 300ms': (r) => r.timings.duration < 300,
    'products listing returns data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.data.products);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testProductDetails() {
  // First get a product ID from listing
  const listingResponse = http.get(`${BASE_URL}/products?limit=1`);
  if (listingResponse.status === 200) {
    try {
      const body = JSON.parse(listingResponse.body);
      if (body.data.products.length > 0) {
        const productId = body.data.products[0]._id;
        
        const response = http.get(`${BASE_URL}/products/${productId}`);
        
        const success = check(response, {
          'product details status is 200': (r) => r.status === 200,
          'product details response time < 200ms': (r) => r.timings.duration < 200,
          'product details returns data': (r) => {
            try {
              const body = JSON.parse(r.body);
              return body.success && body.data;
            } catch {
              return false;
            }
          },
        });

        errorRate.add(!success);
      }
    } catch (e) {
      errorRate.add(true);
    }
  }
}

function testBlogListing() {
  const response = http.get(`${BASE_URL}/blogs?page=1&limit=6`);
  
  const success = check(response, {
    'blog listing status is 200': (r) => r.status === 200,
    'blog listing response time < 300ms': (r) => r.timings.duration < 300,
    'blog listing returns data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.data.blogs);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testUserProfile(headers) {
  const response = http.get(`${BASE_URL}/users/profile`, { headers });
  
  const success = check(response, {
    'user profile status is 200': (r) => r.status === 200,
    'user profile response time < 200ms': (r) => r.timings.duration < 200,
    'user profile returns data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.data;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

function testOrderHistory(headers) {
  const response = http.get(`${BASE_URL}/orders/user`, { headers });
  
  const success = check(response, {
    'order history status is 200': (r) => r.status === 200,
    'order history response time < 300ms': (r) => r.timings.duration < 300,
    'order history returns data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.data.orders);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
}

export function teardown(data) {
  // Cleanup test data if needed
  console.log('Load test completed');
}
