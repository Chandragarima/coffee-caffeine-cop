#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment process...');

try {
  // Step 1: Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Check if dist folder exists
  if (!fs.existsSync('dist')) {
    throw new Error('❌ Build failed - dist folder not found');
  }

  // Step 3: List what will be deployed
  console.log('📁 Contents of dist folder:');
  const distContents = fs.readdirSync('dist');
  distContents.forEach(file => {
    const filePath = path.join('dist', file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      console.log(`  📁 ${file}/`);
    } else {
      console.log(`  📄 ${file}`);
    }
  });

  console.log('\n✅ Build completed successfully!');
  console.log('📋 Next steps:');
  console.log('1. Commit and push your changes:');
  console.log('   git add .');
  console.log('   git commit -m "Deploy to GitHub Pages"');
  console.log('   git push');
  console.log('2. The GitHub Actions workflow will automatically deploy the dist folder');
  console.log('3. Your site will be available at: https://chandragarima.github.io/coffee-caffeine-cop/');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
