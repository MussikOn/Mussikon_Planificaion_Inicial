// Script para verificar la base de datos
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Verificando base de datos...\n');

  try {
    // Test 1: Verificar conexión
    console.log('1. Verificando conexión...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Error de conexión:', error);
      return;
    }
    console.log('✅ Conexión exitosa');

    // Test 2: Verificar estructura de tabla users
    console.log('\n2. Verificando estructura de tabla users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error al consultar users:', usersError);
    } else {
      console.log('✅ Tabla users accesible');
      if (users.length > 0) {
        console.log('   Estructura del primer usuario:', Object.keys(users[0]));
      }
    }

    // Test 3: Intentar insertar un usuario de prueba
    console.log('\n3. Probando inserción de usuario...');
    const { v4: uuidv4 } = require('uuid');
    const testUser = {
      id: uuidv4(),
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      role: 'leader',
      status: 'active',
      church_name: 'Test Church',
      location: 'Test Location',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al insertar usuario:', insertError);
      console.error('   Detalles:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Usuario insertado exitosamente');
      console.log('   ID:', insertedUser.id);
      
      // Limpiar usuario de prueba
      await supabase.from('users').delete().eq('id', testUser.id);
      console.log('   Usuario de prueba eliminado');
    }

    // Test 4: Verificar tabla user_passwords
    console.log('\n4. Verificando tabla user_passwords...');
    const { data: passwords, error: passwordsError } = await supabase
      .from('user_passwords')
      .select('*')
      .limit(1);
    
    if (passwordsError) {
      console.error('❌ Error al consultar user_passwords:', passwordsError);
    } else {
      console.log('✅ Tabla user_passwords accesible');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkDatabase();
