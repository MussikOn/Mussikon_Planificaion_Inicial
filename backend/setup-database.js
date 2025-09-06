// Script para configurar la base de datos de Supabase
const fs = require('fs');
const path = require('path');

console.log('🗄️  Configurando base de datos de Supabase...\n');

// Leer el esquema SQL
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ No se encontró el archivo schema.sql');
  process.exit(1);
}

const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 Instrucciones para configurar la base de datos:');
console.log('\n1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard');
console.log('2. Ve a SQL Editor');
console.log('3. Crea una nueva consulta');
console.log('4. Copia y pega el siguiente esquema SQL:');
console.log('\n' + '='.repeat(80));
console.log(schema);
console.log('='.repeat(80));
console.log('\n5. Ejecuta la consulta');
console.log('\n✅ Después de ejecutar el esquema, tu base de datos estará lista!');
console.log('\n🧪 Para probar la configuración, ejecuta:');
console.log('   npm run test:api');
