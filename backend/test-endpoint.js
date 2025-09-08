// Script para probar el endpoint de registro con validación
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint() {
  console.log('🔍 Probando endpoint de registro...\n');

  try {
    // Test 1: Datos válidos
    console.log('1. Probando con datos válidos...');
    const validData = {
      name: 'Test Leader',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      church_name: 'Test Church',
      location: 'Test Location'
    };

    console.log('   Datos:', JSON.stringify(validData, null, 2));

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, validData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Registro exitoso');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Error en registro');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full response:', JSON.stringify(error.response?.data, null, 2));
    }

    console.log('');

    // Test 2: Datos inválidos (sin church_name para leader)
    console.log('2. Probando con datos inválidos (sin church_name)...');
    const invalidData = {
      name: 'Test Leader',
      email: 'test2@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      location: 'Test Location'
      // Sin church_name
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, invalidData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('⚠️  Registro inesperadamente exitoso');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('✅ Error esperado (validación)');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      if (error.response?.data?.errors) {
        console.log('   Validation errors:', error.response.data.errors);
      }
    }

    console.log('');

    // Test 3: Datos de músico
    console.log('3. Probando con datos de músico...');
    const musicianData = {
      name: 'Test Musician',
      email: 'musician@example.com',
      phone: '+1234567891',
      password: 'password123',
      role: 'musician',
      location: 'Test Location',
      instruments: [
        {
          instrument: 'Guitarrista',
          years_experience: 5
        }
      ]
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, musicianData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Registro de músico exitoso');
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Error en registro de músico');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full response:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testEndpoint();

