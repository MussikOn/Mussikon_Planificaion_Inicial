// Script para configurar Supabase
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Supabase para Mussikon...\n');

// Verificar si ya existe .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('⚠️  El archivo .env ya existe.');
  console.log('¿Quieres sobrescribirlo? (y/n)');
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') {
      createEnvFile();
    } else {
      console.log('❌ Configuración cancelada.');
      process.exit(0);
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\n📝 Creando archivo .env...');
  
  const envContent = `# Supabase Configuration
SUPABASE_URL=https://izccknspzjnujemmtpdp.supabase.co
SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_YOUR_SERVICE_ROLE_KEY

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

  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Archivo .env creado exitosamente!');
  console.log('\n🔑 Pasos siguientes:');
  console.log('1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard');
  console.log('2. Ve a Settings > API');
  console.log('3. Copia la "anon public" key y reemplaza REPLACE_WITH_YOUR_ANON_KEY');
  console.log('4. Copia la "service_role" key y reemplaza REPLACE_WITH_YOUR_SERVICE_ROLE_KEY');
  console.log('5. Guarda el archivo .env');
  console.log('\n📋 Ubicación del archivo:', envPath);
  console.log('\n💡 Después de configurar las credenciales, ejecuta:');
  console.log('   npm run setup-db');
}
