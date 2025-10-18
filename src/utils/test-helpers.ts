/**
 * Test utilities and helpers for the application
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create a test query client with default options
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  const mockFn = () => Promise.resolve({ data: null, error: null });
  const mockChainableFn = () => ({
    select: mockChainableFn,
    insert: mockChainableFn,
    update: mockChainableFn,
    delete: mockChainableFn,
    eq: mockChainableFn,
    order: mockChainableFn,
    limit: mockChainableFn,
    single: mockFn,
  });

  return {
    auth: {
      getSession: mockFn,
      signInWithPassword: mockFn,
      signUp: mockFn,
      signOut: mockFn,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => mockChainableFn(),
    rpc: mockFn,
  };
}

/**
 * Mock environment variables for testing
 */
export function mockEnvironmentVariables() {
  const originalEnv = import.meta.env;
  
  Object.defineProperty(import.meta, 'env', {
    value: {
      ...originalEnv,
      VITE_SUPABASE_PROJECT_ID: 'test-project-id',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_SUPABASE_URL: 'https://test-project.supabase.co',
      VITE_RAZORPAY_KEY_ID: 'test-razorpay-key',
      VITE_GOOGLE_CLIENT_ID: 'test-google-client-id',
      VITE_APP_ENV: 'test',
    },
    configurable: true,
  });

  return () => {
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      configurable: true,
    });
  };
}

/**
 * Wait for a specific condition to be true
 */
export function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };
    
    check();
  });
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock session data for testing
 */
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: mockUser,
};

/**
 * Mock mentor data for testing
 */
export const mockMentor = {
  id: 'test-mentor-id',
  user_id: 'test-user-id',
  name: 'Test Mentor',
  title: 'Senior Developer',
  bio: 'Experienced developer with 10+ years',
  expertise: ['React', 'TypeScript', 'Node.js'],
  hourly_rate: 100,
  rating: 4.8,
  total_sessions: 50,
  is_approved: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock student data for testing
 */
export const mockStudent = {
  id: 'test-student-id',
  user_id: 'test-user-id',
  name: 'Test Student',
  learning_goals: ['Learn React', 'Build projects'],
  experience_level: 'beginner',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Performance testing utilities
 */
export class PerformanceTester {
  private measurements: { [key: string]: number[] } = {};

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);
    
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);
    
    return result;
  }

  getStats(name: string) {
    const measurements = this.measurements[name] || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    return { avg, median, min, max, count: measurements.length };
  }

  getAllStats() {
    const stats: { [key: string]: any } = {};
    Object.keys(this.measurements).forEach(name => {
      stats[name] = this.getStats(name);
    });
    return stats;
  }

  clear() {
    this.measurements = {};
  }
}

/**
 * Create a performance tester instance
 */
export function createPerformanceTester(): PerformanceTester {
  return new PerformanceTester();
}