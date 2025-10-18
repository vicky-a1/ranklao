import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // Test for handling 1,000,000 concurrent users
  scenarios: {
    // Ramp-up load test
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 1000 },   // Ramp up to 1000 users
        { duration: '3m', target: 10000 },  // Ramp up to 10,000 users
        { duration: '5m', target: 100000 }, // Ramp up to 100,000 users
        { duration: '1m', target: 100000 }, // Stay at 100,000 users
        { duration: '1m', target: 0 },      // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
    },
    // Stress test
    stress_test: {
      executor: 'constant-arrival-rate',
      rate: 1000,                // 1000 requests per second
      timeUnit: '1s',            // 1 second
      duration: '5m',            // 5 minutes
      preAllocatedVUs: 1000,     // Pre-allocate 1000 VUs
      maxVUs: 10000,             // Maximum 10,000 VUs
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests can fail
  },
};

// Main test function
export default function() {
  // Test browsing mentors page
  const browseMentorsResponse = http.get('http://localhost:5173/browse-mentors');
  
  check(browseMentorsResponse, {
    'browse-mentors status is 200': (r) => r.status === 200,
    'browse-mentors has correct content': (r) => r.body.includes('Mentors'),
  });
  
  sleep(1);
  
  // Test mentor profile page
  const mentorId = 'sample-mentor-id'; // Replace with actual mentor ID in your tests
  const mentorProfileResponse = http.get(`http://localhost:5173/book-session/${mentorId}`);
  
  check(mentorProfileResponse, {
    'mentor profile status is 200': (r) => r.status === 200,
    'mentor profile has correct content': (r) => r.body.includes('Book Session'),
  });
  
  sleep(1);
}