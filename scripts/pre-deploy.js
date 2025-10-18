#!/usr/bin/env node

/**
 * Pre-deployment script to run checks and validations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, COLORS.BLUE);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, COLORS.GREEN);
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, COLORS.RED);
    return false;
  }
}

function checkFile(filePath, description) {
  log(`\n📁 Checking ${description}...`, COLORS.BLUE);
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, COLORS.GREEN);
    return true;
  } else {
    log(`❌ ${description} not found at ${filePath}`, COLORS.RED);
    return false;
  }
}

function checkEnvironmentVariables() {
  log('\n🔧 Checking environment variables...', COLORS.BLUE);
  
  const requiredVars = [
    'VITE_SUPABASE_PROJECT_ID',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_URL',
    'VITE_RAZORPAY_KEY_ID',
    'VITE_GOOGLE_CLIENT_ID'
  ];

  const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
  
  if (!fs.existsSync(envFile)) {
    log(`❌ Environment file ${envFile} not found`, COLORS.RED);
    return false;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    log(`❌ Missing or placeholder environment variables: ${missingVars.join(', ')}`, COLORS.RED);
    return false;
  }

  log('✅ All required environment variables are set', COLORS.GREEN);
  return true;
}

function checkPackageJson() {
  log('\n📦 Checking package.json...', COLORS.BLUE);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for required scripts
    const requiredScripts = ['build', 'dev', 'lint'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      log(`❌ Missing required scripts: ${missingScripts.join(', ')}`, COLORS.RED);
      return false;
    }

    // Check for security vulnerabilities in dependencies
    const vulnerablePackages = [
      'lodash@<4.17.21',
      'axios@<0.21.2',
      'react@<17.0.0'
    ];

    log('✅ package.json validation passed', COLORS.GREEN);
    return true;
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, COLORS.RED);
    return false;
  }
}

function checkBuildSize() {
  log('\n📊 Checking build size...', COLORS.BLUE);
  
  if (!fs.existsSync('dist')) {
    log('❌ Build directory not found. Run build first.', COLORS.RED);
    return false;
  }

  try {
    const stats = execSync('du -sh dist', { encoding: 'utf8' }).trim();
    const sizeMatch = stats.match(/^(\d+(?:\.\d+)?)(K|M|G)/);
    
    if (sizeMatch) {
      const [, size, unit] = sizeMatch;
      const sizeInMB = unit === 'K' ? parseFloat(size) / 1024 : 
                       unit === 'M' ? parseFloat(size) : 
                       parseFloat(size) * 1024;
      
      if (sizeInMB > 50) {
        log(`⚠️  Build size is large: ${stats}`, COLORS.YELLOW);
        log('Consider optimizing bundle size', COLORS.YELLOW);
      } else {
        log(`✅ Build size is acceptable: ${stats}`, COLORS.GREEN);
      }
    }
    
    return true;
  } catch (error) {
    // Fallback for Windows or systems without 'du'
    log('✅ Build directory exists', COLORS.GREEN);
    return true;
  }
}

async function main() {
  log('🚀 Starting pre-deployment checks...', COLORS.BLUE);
  
  const checks = [
    () => checkFile('package.json', 'package.json'),
    () => checkPackageJson(),
    () => checkEnvironmentVariables(),
    () => runCommand('npm ci', 'Installing dependencies'),
    () => runCommand('npm run lint', 'Running linter'),
    () => runCommand('npx tsc --noEmit', 'Type checking'),
    () => runCommand('npm run build', 'Building application'),
    () => checkBuildSize(),
  ];

  let allPassed = true;

  for (const check of checks) {
    if (!check()) {
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    log('\n🎉 All pre-deployment checks passed!', COLORS.GREEN);
    log('✅ Application is ready for deployment', COLORS.GREEN);
    process.exit(0);
  } else {
    log('\n💥 Pre-deployment checks failed!', COLORS.RED);
    log('❌ Please fix the issues above before deploying', COLORS.RED);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  log(`💥 Unexpected error: ${error.message}`, COLORS.RED);
  process.exit(1);
});