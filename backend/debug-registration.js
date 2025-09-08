// Script para debuggear el registro de usuarios
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugRegistration() {
  console.log('🔍 Debuggeando registro de usuarios...\n');

  try {
    // Test 1: Verificar que el servidor esté funcionando
    console.log('1. Verificando servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor funcionando');
    console.log('   Status:', healthResponse.data.status);
    console.log('');

    // Test 2: Intentar registro con datos mínimos
    console.log('2. Probando registro con datos mínimos...');
    const registrationData = {
      name: 'Test Leader',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      church_name: 'Test Church',
      location: 'Test Location'
    };

    console.log('   Datos de registro:', JSON.stringify(registrationData, null, 2));

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registrationData);
      console.log('✅ Registro exitoso');
      console.log('   Response:', registerResponse.data);
    } catch (error) {
      console.log('❌ Error en registro');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Full response:', JSON.stringify(error.response?.data, null, 2));
      
      // Si hay un error de validación, mostrarlo
      if (error.response?.data?.errors) {
        console.log('   Validation errors:', error.response.data.errors);
      }
    }

    console.log('');

    // Test 3: Verificar si el usuario ya existe
    console.log('3. Verificando si el usuario ya existe...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('⚠️  Usuario ya existe y puede hacer login');
      console.log('   Token:', loginResponse.data.token ? 'Presente' : 'Ausente');
    } catch (error) {
      console.log('✅ Usuario no existe o no puede hacer login');
      console.log('   Error:', error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Ejecutar debug
debugRegistration();

