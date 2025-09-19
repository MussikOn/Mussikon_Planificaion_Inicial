// Setup script for Mussikon Backend
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('🚀 Setting up Mussikon Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created from example');
    console.log('⚠️  Please update the .env file with your actual credentials\n');
  } else {
    console.log('❌ No env.example file found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies already installed\n');
}

console.log('🔧 Setup Instructions:');
console.log('1. Update .env file with your Supabase credentials');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');
console.log('4. Test: npm run test:api');
console.log('\n📚 For more information, see README.md');

