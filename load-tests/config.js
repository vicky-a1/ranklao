// k6 load testing configuration
export const environments = {
  local: {
    baseUrl: 'http://localhost:5173',
  },
  staging: {
    baseUrl: 'https://staging.rankup-guide-pro.com',
  },
  production: {
    baseUrl: 'https://rankup-guide-pro.com',
  },
};

// Test scenarios for different load levels
export const scenarios = {
  smoke: {
    vus: 1,
    duration: '1m',
  },
  load: {
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 0 },
    ],
  },
  stress: {
    stages: [
      { duration: '2m', target: 1000 },
      { duration: '5m', target: 1000 },
      { duration: '2m', target: 0 },
    ],
  },
  spike: {
    stages: [
      { duration: '10s', target: 100 },
      { duration: '1m', target: 1000 },
      { duration: '10s', target: 100 },
    ],
  },
  soak: {
    stages: [
      { duration: '2m', target: 400 },
      { duration: '3h', target: 400 },
      { duration: '2m', target: 0 },
    ],
  },
  extreme: {
    stages: [
      { duration: '2m', target: 10000 },
      { duration: '5m', target: 100000 },
      { duration: '5m', target: 1000000 },
      { duration: '5m', target: 100000 },
      { duration: '2m', target: 0 },
    ],
  },
};