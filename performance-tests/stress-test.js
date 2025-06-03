import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50, // 50 virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.1'],      // Error rate should be less than 10%
  },
};

const BASE_URL = 'http://localhost:5000/api';

export default function() {
  // Stress test critical endpoints
  const endpoints = [
    `${BASE_URL}/products`,
    `${BASE_URL}/blogs`,
    `${BASE_URL}/settings/public`,
  ];

  endpoints.forEach(endpoint => {
    const response = http.get(endpoint);
    
    check(response, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response time OK`]: (r) => r.timings.duration < 1000,
    });
    
    sleep(0.1);
  });
}
