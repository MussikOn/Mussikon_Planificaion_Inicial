// Script para configurar credenciales de Supabase paso a paso
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Configurando credenciales de Supabase...\n');

console.log('📋 Pasos para obtener las credenciales:');
console.log('1. Ve a https://supabase.com/dashboard');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a Settings > API');
console.log('4. Copia las siguientes claves:\n');

async function getCredentials() {
  try {
    // Obtener anon key
    const anonKey = await new Promise((resolve) => {
      rl.question('🔑 Anon Public Key: ', (answer) => {
        resolve(answer.trim());
      });
    });

    // Obtener service role key
    const serviceRoleKey = await new Promise((resolve) => {
      rl.question('🔐 Service Role Key: ', (answer) => {
        resolve(answer.trim());
      });
    });

    // Validar que las claves no estén vacías
    if (!anonKey || !serviceRoleKey) {
      console.log('❌ Las claves no pueden estar vacías');
      rl.close();
      return;
    }

    // Crear contenido del archivo .env
    const envContent = `# Supabase Configuration
SUPABASE_URL=https://izccknspzjnujemmtpdp.supabase.co
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}

# Database Configuration (Supabase)
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.izccknspzjnujemmtpdp
DB_PASSWORD=0ch1n@gu@01
DB_SSL=true

# JWT Configuration
JWT_SECRET=mussikon_jwt_secret_key_2024_very_secure_${Date.now()}
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;

    // Escribir archivo .env
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Archivo .env actualizado exitosamente!');
    console.log('\n🧪 Ahora puedes verificar la configuración:');
    console.log('   npm run verify-supabase');
    console.log('\n🚀 Y luego probar la API completa:');
    console.log('   npm run test:api');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Ejecutar configuración
getCredentials();
