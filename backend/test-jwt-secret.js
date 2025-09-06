const jwt = require('jsonwebtoken');

// Simular la configuración del servidor
const config = {
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your_jwt_secret_here',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h'
  }
};

console.log('🔍 Verificando configuración JWT del servidor...\n');
console.log('Clave secreta configurada:', config.jwt.secret);
console.log('Tiempo de expiración:', config.jwt.expiresIn);

// Generar un token de prueba
const testPayload = {
  userId: 'test-user-id',
  email: 'test@example.com',
  role: 'admin'
};

const testToken = jwt.sign(testPayload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
console.log('\n✅ Token de prueba generado:');
console.log('Token:', testToken);

// Verificar el token
try {
  const verified = jwt.verify(testToken, config.jwt.secret);
  console.log('\n✅ Token verificado exitosamente:');
  console.log('Payload:', JSON.stringify(verified, null, 2));
} catch (error) {
  console.error('\n❌ Error al verificar el token:', error.message);
}

// Ahora probar con el token real del servidor
const realToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDA0ZWI4Ni1mYmNhLTRjODYtOTgzMy01YTkyNmMzNTY3NTkiLCJlbWFpbCI6ImFzdGFjaW9zYW5jaGV6amVmcnlhZ3VzdGluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NzEzNzIxMiwiZXhwIjoxNzU3MjIzNjEyfQ.Ome3wpTMkN4wVYHOoD3304bVX3p1iIgVXyVLITeblrw';

console.log('\n🔍 Verificando token real del servidor...');
try {
  const verifiedReal = jwt.verify(realToken, config.jwt.secret);
  console.log('✅ Token real verificado exitosamente:');
  console.log('Payload:', JSON.stringify(verifiedReal, null, 2));
} catch (error) {
  console.error('❌ Error al verificar el token real:', error.message);
  console.log('Esto sugiere que el servidor está usando una clave secreta diferente.');
}
