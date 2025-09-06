const jwt = require('jsonwebtoken');

// Token del login anterior
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDA0ZWI4Ni1mYmNhLTRjODYtOTgzMy01YTkyNmMzNTY3NTkiLCJlbWFpbCI6ImFzdGFjaW9zYW5jaGV6amVmcnlhZ3VzdGluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NzEzNzIxMiwiZXhwIjoxNzU3MjIzNjEyfQ.Ome3wpTMkN4wVYHOoD3304bVX3p1iIgVXyVLITeblrw';

// Clave secreta (debe coincidir con la del servidor)
const secret = 'your_jwt_secret_here';

console.log('🔍 Verificando token JWT...\n');

try {
  // Decodificar el token sin verificar (para ver el contenido)
  const decoded = jwt.decode(token);
  console.log('✅ Token decodificado exitosamente:');
  console.log('   Payload:', JSON.stringify(decoded, null, 2));
  
  // Verificar el token con la clave secreta
  const verified = jwt.verify(token, secret);
  console.log('\n✅ Token verificado exitosamente:');
  console.log('   Payload verificado:', JSON.stringify(verified, null, 2));
  
  // Verificar la expiración
  const now = Math.floor(Date.now() / 1000);
  const exp = verified.exp;
  const timeLeft = exp - now;
  
  console.log('\n⏰ Información de expiración:');
  console.log('   Timestamp actual:', now);
  console.log('   Timestamp de expiración:', exp);
  console.log('   Tiempo restante (segundos):', timeLeft);
  console.log('   Tiempo restante (horas):', Math.floor(timeLeft / 3600));
  console.log('   ¿Está expirado?:', timeLeft <= 0 ? '❌ SÍ' : '✅ NO');
  
} catch (error) {
  console.error('❌ Error al verificar el token:', error.message);
  
  if (error.name === 'JsonWebTokenError') {
    console.log('\n💡 Posibles problemas:');
    console.log('1. La clave secreta no coincide');
    console.log('2. El token está malformado');
  } else if (error.name === 'TokenExpiredError') {
    console.log('\n💡 El token ha expirado');
  }
}
