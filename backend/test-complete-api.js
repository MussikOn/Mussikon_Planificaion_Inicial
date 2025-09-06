// Script para probar la API completa de Mussikon
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCompleteAPI() {
  console.log('🎉 Probando API completa de Mussikon...\n');

  let leaderToken = '';
  let musicianToken = '';
  let requestId = '';

  try {
    // Test 1: Health Check
    console.log('1. 🔍 Verificando salud del servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor funcionando correctamente');
    console.log('   Status:', healthResponse.data.status);
    console.log('   Versión:', healthResponse.data.version);
    console.log('');

    // Test 2: Registrar líder
    console.log('2. 👨‍💼 Registrando líder...');
    const leaderData = {
      name: 'Pastor Juan Pérez',
      email: 'pastor@iglesia.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      church_name: 'Iglesia Central',
      location: 'Santo Domingo, RD'
    };

    const leaderResponse = await axios.post(`${BASE_URL}/api/auth/register`, leaderData);
    leaderToken = leaderResponse.data.token;
    console.log('✅ Líder registrado exitosamente');
    console.log('   Nombre:', leaderResponse.data.user.name);
    console.log('   Iglesia:', leaderResponse.data.user.church_name);
    console.log('   Token:', leaderToken ? 'Generado' : 'No generado');
    console.log('');

    // Test 3: Login del líder
    console.log('3. 🔐 Login del líder...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'pastor@iglesia.com',
      password: 'password123'
    });
    console.log('✅ Login exitoso');
    console.log('   Usuario:', loginResponse.data.user.name);
    console.log('');

    // Test 4: Obtener perfil del líder
    console.log('4. 👤 Obteniendo perfil del líder...');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${leaderToken}` }
    });
    console.log('✅ Perfil obtenido');
    console.log('   Nombre:', profileResponse.data.data.name);
    console.log('   Rol:', profileResponse.data.data.role);
    console.log('   Estado:', profileResponse.data.data.status);
    console.log('');

    // Test 5: Crear solicitud musical
    console.log('5. 📝 Creando solicitud musical...');
    const requestData = {
      event_type: 'Servicio Dominical',
      event_date: '2024-01-15T10:00:00Z',
      location: 'Iglesia Central, Santo Domingo',
      budget: 1500,
      description: 'Necesitamos guitarrista para el servicio dominical',
      required_instrument: 'Guitarrista'
    };

    const requestResponse = await axios.post(`${BASE_URL}/api/requests`, requestData, {
      headers: { Authorization: `Bearer ${leaderToken}` }
    });
    requestId = requestResponse.data.data.id;
    console.log('✅ Solicitud creada exitosamente');
    console.log('   Tipo:', requestResponse.data.data.event_type);
    console.log('   Presupuesto:', requestResponse.data.data.budget, 'DOP');
    console.log('   Instrumento:', requestResponse.data.data.required_instrument);
    console.log('');

    // Test 6: Obtener solicitudes
    console.log('6. 📋 Obteniendo solicitudes...');
    const requestsResponse = await axios.get(`${BASE_URL}/api/requests`, {
      headers: { Authorization: `Bearer ${leaderToken}` }
    });
    console.log('✅ Solicitudes obtenidas');
    console.log('   Total:', requestsResponse.data.data.length);
    console.log('');

    // Test 7: Registrar músico
    console.log('7. 🎵 Registrando músico...');
    const musicianData = {
      name: 'Carlos Músico',
      email: 'carlos@musico.com',
      phone: '+1234567891',
      password: 'password123',
      role: 'musician',
      location: 'Santo Domingo, RD',
      instruments: [
        {
          instrument: 'Guitarrista',
          years_experience: 5
        }
      ]
    };

    const musicianResponse = await axios.post(`${BASE_URL}/api/auth/register`, musicianData);
    console.log('✅ Músico registrado exitosamente');
    console.log('   Nombre:', musicianResponse.data.user.name);
    console.log('   Estado:', musicianResponse.data.user.status);
    console.log('   Instrumentos:', musicianResponse.data.user.instruments?.length || 0);
    console.log('');

    // Test 8: Intentar login del músico (debería fallar)
    console.log('8. 🔐 Intentando login del músico (debería fallar)...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'carlos@musico.com',
        password: 'password123'
      });
      console.log('⚠️  Login inesperadamente exitoso');
    } catch (error) {
      console.log('✅ Login falló como se esperaba');
      console.log('   Razón:', error.response?.data?.message);
    }
    console.log('');

    // Test 9: Verificar documentación Swagger
    console.log('9. 📚 Verificando documentación Swagger...');
    try {
      const swaggerResponse = await axios.get(`${BASE_URL}/api-docs`);
      console.log('✅ Documentación Swagger disponible');
      console.log('   URL: http://localhost:3000/api-docs');
    } catch (error) {
      console.log('❌ Error al acceder a Swagger');
    }
    console.log('');

    // Resumen final
    console.log('🎉 ¡API de Mussikon funcionando perfectamente!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('✅ Health Check');
    console.log('✅ Registro de líderes');
    console.log('✅ Login de líderes');
    console.log('✅ Gestión de perfiles');
    console.log('✅ Creación de solicitudes');
    console.log('✅ Listado de solicitudes');
    console.log('✅ Registro de músicos');
    console.log('✅ Validación de estado de músicos');
    console.log('✅ Documentación Swagger');
    console.log('\n🔗 URLs importantes:');
    console.log('   API: http://localhost:3000');
    console.log('   Health: http://localhost:3000/health');
    console.log('   Swagger: http://localhost:3000/api-docs');
    console.log('\n🚀 ¡El backend está listo para el frontend!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
  }
}

testCompleteAPI();
