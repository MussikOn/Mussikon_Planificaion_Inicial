// Script para probar el endpoint directamente sin validación
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testDirectEndpoint() {
  console.log('🔍 Probando endpoint directamente...\n');

  try {
    // Test 1: Verificar que el servidor esté funcionando
    console.log('1. Verificando servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor funcionando');

    // Test 2: Probar endpoint de registro con datos mínimos
    console.log('\n2. Probando registro...');
    const registrationData = {
      name: 'Test Leader',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      church_name: 'Test Church',
      location: 'Test Location'
    };

    console.log('   Enviando datos:', JSON.stringify(registrationData, null, 2));

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, registrationData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos timeout
      });
      
      console.log('✅ Registro exitoso');
      console.log('   Status:', response.status);
      console.log('   Data:', response.data);
      
    } catch (error) {
      console.log('❌ Error en registro');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full response:', JSON.stringify(error.response?.data, null, 2));
      
      // Si hay un error de red o timeout
      if (error.code === 'ECONNREFUSED') {
        console.log('   Error: No se puede conectar al servidor');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   Error: Timeout de conexión');
      }
    }

    // Test 3: Probar con un email diferente
    console.log('\n3. Probando con email diferente...');
    const registrationData2 = {
      name: 'Test Leader 2',
      email: 'test2@example.com',
      phone: '+1234567891',
      password: 'password123',
      role: 'leader',
      church_name: 'Test Church 2',
      location: 'Test Location 2'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, registrationData2, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Registro exitoso');
      console.log('   Status:', response.status);
      console.log('   Data:', response.data);
      
    } catch (error) {
      console.log('❌ Error en registro');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full response:', JSON.stringify(error.response?.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testDirectEndpoint();

