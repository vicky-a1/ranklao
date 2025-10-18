/**
 * Security utilities and configurations for production
 */

import { logger } from './error-handler';
import { isProduction } from './env-validation';

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    'https://checkout.razorpay.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://api.razorpay.com',
    'https://www.google-analytics.com'
  ],
  'frame-src': [
    "'self'",
    'https://checkout.razorpay.com'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
};

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize user input for database queries
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  /**
   * Check if an action is rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    if (attempt.count >= this.maxAttempts) {
      logger.warn('Rate limit exceeded', { identifier, attempts: attempt.count });
      return true;
    }

    attempt.count++;
    return false;
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, attempt] of this.attempts.entries()) {
      if (now > attempt.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

/**
 * Session security utilities
 */
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Check if session is expired
   */
  static isSessionExpired(sessionStart: number): boolean {
    return Date.now() - sessionStart > this.SESSION_TIMEOUT;
  }

  /**
   * Check if session is idle
   */
  static isSessionIdle(lastActivity: number): boolean {
    return Date.now() - lastActivity > this.IDLE_TIMEOUT;
  }

  /**
   * Generate secure session token
   */
  static generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate session token format
   */
  static isValidSessionToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }
}

/**
 * Data encryption utilities (for sensitive data)
 */
export class DataEncryption {
  /**
   * Hash sensitive data (one-way)
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate random salt
   */
  static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Initialize security measures
 */
export function initializeSecurity(): void {
  if (typeof window === 'undefined') return;

  // Disable right-click in production
  if (isProduction()) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    });
  }

  // Set up CSP violation reporting
  document.addEventListener('securitypolicyviolation', (e) => {
    logger.error('CSP Violation', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy
    });
  });

  logger.info('Security measures initialized');
}

// Create rate limiter instances for different actions
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute

// Clean up rate limiters periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    authRateLimiter.cleanup();
    apiRateLimiter.cleanup();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}