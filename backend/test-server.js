// Simple test script to verify backend is working
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing Mussikon Backend...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('');

    // Test 2: Register a leader
    console.log('2. Testing leader registration...');
    const leaderData = {
      name: 'Pastor Juan Pérez',
      email: 'pastor.juan@test.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      church_name: 'Iglesia Test',
      location: 'Santo Domingo, RD'
    };

    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, leaderData);
    console.log('✅ Leader registration passed:', registerResponse.data.message);
    console.log('');

    // Test 3: Login
    console.log('3. Testing login...');
    const loginData = {
      email: 'pastor.juan@test.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ Login passed:', loginResponse.data.message);
    const token = loginResponse.data.token;
    console.log('');

    // Test 4: Get profile
    console.log('4. Testing get profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get profile passed:', profileResponse.data.data.name);
    console.log('');

    // Test 5: Create request
    console.log('5. Testing create request...');
    const requestData = {
      event_type: 'Servicio Dominical',
      event_date: '2024-01-15T10:00:00Z',
      location: 'Iglesia Test, Santo Domingo',
      budget: 1500,
      description: 'Necesitamos guitarrista para el servicio dominical',
      required_instrument: 'Guitarrista'
    };

    const requestResponse = await axios.post(`${BASE_URL}/api/requests`, requestData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Create request passed:', requestResponse.data.message);
    const requestId = requestResponse.data.data.id;
    console.log('');

    // Test 6: Get requests
    console.log('6. Testing get requests...');
    const requestsResponse = await axios.get(`${BASE_URL}/api/requests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get requests passed:', requestsResponse.data.data.length, 'requests found');
    console.log('');

    // Test 7: Register a musician
    console.log('7. Testing musician registration...');
    const musicianData = {
      name: 'Carlos Músico',
      email: 'carlos.musico@test.com',
      phone: '+1234567891',
      password: 'password123',
      role: 'musician',
      location: 'Santo Domingo, RD',
      instruments: [
        {
          instrument: 'Guitarrista',
          years_experience: 5
        },
        {
          instrument: 'Pianista',
          years_experience: 3
        }
      ]
    };

    const musicianRegisterResponse = await axios.post(`${BASE_URL}/api/auth/register`, musicianData);
    console.log('✅ Musician registration passed:', musicianRegisterResponse.data.message);
    console.log('');

    // Test 8: Login as musician
    console.log('8. Testing musician login...');
    const musicianLoginData = {
      email: 'carlos.musico@test.com',
      password: 'password123'
    };

    const musicianLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, musicianLoginData);
    console.log('✅ Musician login passed:', musicianLoginResponse.data.message);
    const musicianToken = musicianLoginResponse.data.token;
    console.log('');

    // Test 9: Create offer
    console.log('9. Testing create offer...');
    const offerData = {
      request_id: requestId,
      proposed_price: 1200,
      availability_confirmed: true,
      message: 'Estoy disponible para el servicio dominical'
    };

    const offerResponse = await axios.post(`${BASE_URL}/api/offers`, offerData, {
      headers: { Authorization: `Bearer ${musicianToken}` }
    });
    console.log('✅ Create offer passed:', offerResponse.data.message);
    console.log('');

    // Test 10: Get offers
    console.log('10. Testing get offers...');
    const offersResponse = await axios.get(`${BASE_URL}/api/offers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get offers passed:', offersResponse.data.data.length, 'offers found');
    console.log('');

    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('\n📊 Test Summary:');
    console.log('- Health check: ✅');
    console.log('- User registration: ✅');
    console.log('- User login: ✅');
    console.log('- Profile management: ✅');
    console.log('- Request creation: ✅');
    console.log('- Request listing: ✅');
    console.log('- Offer creation: ✅');
    console.log('- Offer listing: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testBackend();