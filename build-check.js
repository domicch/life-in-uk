#!/usr/bin/env node

// Build environment detection script
// This script sets the correct environment variables for GitHub Pages deployment

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Detecting build environment...');

// Check if we're in GitHub Actions (GitHub Pages environment)
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true' || 
                       process.env.CI === 'true' ||
                       process.env.GITHUB_WORKFLOW ||
                       process.env.RUNNER_OS;

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

console.log('Environment detection:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - GITHUB_ACTIONS:', process.env.GITHUB_ACTIONS);
console.log('  - CI:', process.env.CI);
console.log('  - Is GitHub Actions:', isGitHubActions);
console.log('  - Is Production:', isProduction);

// Prepare environment variables for the build process
const buildEnv = { ...process.env };

// If we're in GitHub Actions and production, set GitHub Pages variables
if (isGitHubActions && isProduction) {
  console.log('🚀 GitHub Pages deployment detected - setting environment variables');
  
  buildEnv.GITHUB_PAGES = 'true';
  buildEnv.NEXT_PUBLIC_GITHUB_PAGES = 'true';
  buildEnv.NEXT_PUBLIC_BUILD_TIME = new Date().toISOString();
  
  console.log('✅ Environment variables set:');
  console.log('  - GITHUB_PAGES: true');
  console.log('  - NEXT_PUBLIC_GITHUB_PAGES: true');
  console.log('  - NEXT_PUBLIC_BUILD_TIME:', buildEnv.NEXT_PUBLIC_BUILD_TIME);
} else {
  console.log('🏠 Local development build detected');
}

console.log('✨ Starting Next.js build with proper environment...\n');

// Run next build with the correct environment
const nextBuild = spawn('npx', ['next', 'build'], {
  env: buildEnv,
  stdio: 'inherit',
  shell: true
});

nextBuild.on('close', (code) => {
  if (code !== 0) {
    console.error(`Next.js build failed with exit code ${code}`);
    process.exit(code);
  }
  console.log('\n✅ Build completed successfully!');
});
