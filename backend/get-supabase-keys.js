// Script para obtener las claves de Supabase correctamente
console.log('🔑 Cómo obtener las claves de Supabase correctamente\n');

console.log('📋 PASO A PASO:');
console.log('1. Ve a https://supabase.com/dashboard');
console.log('2. Selecciona tu proyecto (izccknspzjnujemmtpdp)');
console.log('3. En el menú lateral, haz clic en "Settings"');
console.log('4. Haz clic en "API"');
console.log('5. Encontrarás dos claves importantes:\n');

console.log('🔑 ANON PUBLIC KEY:');
console.log('   - Es una clave que empieza con "eyJ...');
console.log('   - Es segura para usar en el frontend');
console.log('   - La encontrarás en la sección "Project API keys"\n');

console.log('🔐 SERVICE ROLE KEY:');
console.log('   - Es una clave que empieza con "eyJ...');
console.log('   - Es para uso del backend (más permisos)');
console.log('   - La encontrarás en la sección "Project API keys"\n');

console.log('⚠️  IMPORTANTE:');
console.log('   - NO uses la cadena de conexión de PostgreSQL');
console.log('   - Las claves de API son diferentes');
console.log('   - Las claves empiezan con "eyJ" y son muy largas\n');

console.log('📸 Si necesitas ayuda visual:');
console.log('   - Busca "Project API keys" en la página');
console.log('   - Verás "anon public" y "service_role"');
console.log('   - Copia cada una por separado\n');

console.log('💡 Después de obtener las claves, ejecuta:');
console.log('   npm run configure-credentials');

