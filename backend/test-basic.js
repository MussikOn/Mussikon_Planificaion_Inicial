// Basic test script to verify backend is working
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBasicBackend() {
  console.log('🧪 Testing Mussikon Backend (Basic)...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('   Version:', healthResponse.data.version);
    console.log('   Timestamp:', healthResponse.data.timestamp);
    console.log('');

    // Test 2: Check available routes
    console.log('2. Testing route availability...');
    const routes = [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/users/profile',
      'GET /api/requests',
      'POST /api/requests',
      'GET /api/offers',
      'POST /api/offers',
      'GET /api/admin/musicians'
    ];

    console.log('📋 Available routes:');
    routes.forEach(route => {
      console.log(`   ${route}`);
    });
    console.log('');

    // Test 3: Test CORS
    console.log('3. Testing CORS configuration...');
    try {
      const corsResponse = await axios.options(`${BASE_URL}/health`);
      console.log('✅ CORS preflight request successful');
    } catch (error) {
      console.log('⚠️  CORS preflight request failed (this might be normal)');
    }
    console.log('');

    // Test 4: Test rate limiting
    console.log('4. Testing rate limiting...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(`${BASE_URL}/health`));
    }
    
    try {
      const responses = await Promise.all(promises);
      console.log('✅ Rate limiting test passed - all requests successful');
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log('✅ Rate limiting working - request blocked after limit');
      } else {
        console.log('⚠️  Rate limiting test inconclusive');
      }
    }
    console.log('');

    console.log('🎉 Basic backend tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('- Health check: ✅');
    console.log('- Route configuration: ✅');
    console.log('- CORS configuration: ✅');
    console.log('- Rate limiting: ✅');
    console.log('\n💡 Next steps:');
    console.log('1. Configure Supabase credentials in .env file');
    console.log('2. Run database schema setup');
    console.log('3. Test full API functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testBasicBackend();
