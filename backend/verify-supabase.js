// Script para verificar la configuración de Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function verifySupabase() {
  console.log('🔍 Verificando configuración de Supabase...\n');

  // Verificar variables de entorno
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno de Supabase no configuradas');
    console.log('Asegúrate de que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén en tu archivo .env');
    process.exit(1);
  }

  console.log('✅ Variables de entorno encontradas');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  
  // Verificar variables de base de datos
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  
  if (dbHost && dbUser && dbPassword) {
    console.log('✅ Variables de base de datos encontradas');
    console.log(`   Host: ${dbHost}`);
    console.log(`   User: ${dbUser}`);
    console.log(`   Password: ${dbPassword.substring(0, 5)}...`);
  } else {
    console.log('⚠️  Variables de base de datos no configuradas completamente');
  }

  try {
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente de Supabase creado');

    // Verificar conexión
    console.log('\n🔌 Probando conexión a la base de datos...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error de conexión:', error.message);
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica que las credenciales sean correctas');
      console.log('2. Asegúrate de que el esquema SQL se haya ejecutado en Supabase');
      console.log('3. Verifica que el proyecto de Supabase esté activo');
      process.exit(1);
    }

    console.log('✅ Conexión a la base de datos exitosa');

    // Verificar tablas
    console.log('\n📋 Verificando tablas...');
    const tables = ['users', 'user_passwords', 'user_instruments', 'requests', 'offers', 'admin_actions'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabla ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabla ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error inesperado`);
      }
    }

    // Verificar usuario admin
    console.log('\n👤 Verificando usuario administrador...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@mussikon.com')
      .single();

    if (adminError || !adminUser) {
      console.log('⚠️  Usuario administrador no encontrado');
      console.log('   Esto es normal si no has ejecutado el esquema SQL aún');
    } else {
      console.log('✅ Usuario administrador encontrado');
      console.log(`   Nombre: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rol: ${adminUser.role}`);
      console.log(`   Estado: ${adminUser.status}`);
    }

    console.log('\n🎉 Verificación completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('- Variables de entorno: ✅');
    console.log('- Conexión a Supabase: ✅');
    console.log('- Base de datos accesible: ✅');
    console.log('\n🚀 Tu backend está listo para funcionar!');
    console.log('\n🧪 Para probar la API completa, ejecuta:');
    console.log('   npm run test:api');

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    process.exit(1);
  }
}

// Ejecutar verificación
verifySupabase();
