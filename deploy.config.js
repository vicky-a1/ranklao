/**
 * Deployment configuration for different environments
 */

const deploymentConfig = {
  // Development environment
  development: {
    buildCommand: 'npm run build',
    outputDir: 'dist',
    environmentFile: '.env',
    checks: [
      'lint',
      'typecheck',
      'test'
    ]
  },

  // Staging environment
  staging: {
    buildCommand: 'npm run build',
    outputDir: 'dist',
    environmentFile: '.env.staging',
    checks: [
      'lint',
      'typecheck',
      'test',
      'e2e'
    ],
    optimization: {
      minify: true,
      sourcemap: false,
      treeshake: true
    }
  },

  // Production environment
  production: {
    buildCommand: 'npm run build',
    outputDir: 'dist',
    environmentFile: '.env.production',
    checks: [
      'lint',
      'typecheck',
      'test',
      'e2e',
      'security-audit',
      'performance-audit'
    ],
    optimization: {
      minify: true,
      sourcemap: false,
      treeshake: true,
      compression: 'gzip'
    },
    security: {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      },
      csp: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': ["'self'", 'https://*.supabase.co', 'https://api.razorpay.com']
      }
    }
  }
};

module.exports = deploymentConfig;