// Load test runner script
import { check } from 'k6';
import http from 'k6/http';
import { sleep } from 'k6';

// Test configuration for 1M concurrent users
export const options = {
  scenarios: {
    // Quick test for verification
    quick_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '20s', target: 1000 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests can fail
  },
};

// Main test function
export default function() {
  const baseUrl = 'http://localhost:5173';
  
  // Test home page
  const homeRes = http.get(`${baseUrl}/`);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
  });
  
  // Test browse mentors page
  const browseMentorsRes = http.get(`${baseUrl}/browse-mentors`);
  check(browseMentorsRes, {
    'browse-mentors status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}