// Script para probar el flujo de autenticación completo
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🔍 Probando flujo de autenticación completo...\n');

  try {
    // Test 1: Verificar que el usuario no existe
    console.log('1. Verificando que el usuario no existe...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@example.com')
      .single();

    if (existingUser) {
      console.log('⚠️  Usuario ya existe, eliminándolo...');
      await supabase.from('users').delete().eq('email', 'test@example.com');
      console.log('✅ Usuario eliminado');
    } else {
      console.log('✅ Usuario no existe');
    }

    // Test 2: Simular el proceso de registro
    console.log('\n2. Simulando proceso de registro...');
    
    const userData = {
      name: 'Test Leader',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'leader',
      church_name: 'Test Church',
      location: 'Test Location'
    };

    // Hash password
    console.log('   Hashando contraseña...');
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    console.log('✅ Contraseña hasheada');

    // Create user
    console.log('   Creando usuario...');
    const userId = uuidv4();
    const newUser = {
      id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      status: userData.role === 'leader' ? 'active' : 'pending',
      church_name: userData.church_name || '',
      location: userData.location || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('   Datos del usuario:', JSON.stringify(newUser, null, 2));

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error al crear usuario:', userError);
      console.error('   Detalles:', JSON.stringify(userError, null, 2));
      return;
    }

    console.log('✅ Usuario creado exitosamente');
    console.log('   ID:', user.id);

    // Test 3: Almacenar contraseña
    console.log('\n3. Almacenando contraseña...');
    const { error: passwordError } = await supabase
      .from('user_passwords')
      .insert([{
        user_id: userId,
        password: hashedPassword,
        created_at: new Date().toISOString()
      }]);

    if (passwordError) {
      console.error('❌ Error al almacenar contraseña:', passwordError);
      console.error('   Detalles:', JSON.stringify(passwordError, null, 2));
      return;
    }

    console.log('✅ Contraseña almacenada exitosamente');

    // Test 4: Verificar login
    console.log('\n4. Probando login...');
    const { data: storedPassword } = await supabase
      .from('user_passwords')
      .select('password')
      .eq('user_id', userId)
      .single();

    if (!storedPassword) {
      console.error('❌ No se encontró la contraseña almacenada');
      return;
    }

    const passwordMatch = await bcrypt.compare(userData.password, storedPassword.password);
    if (!passwordMatch) {
      console.error('❌ La contraseña no coincide');
      return;
    }

    console.log('✅ Login exitoso');

    // Test 5: Limpiar datos de prueba
    console.log('\n5. Limpiando datos de prueba...');
    await supabase.from('users').delete().eq('id', userId);
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 Flujo de autenticación funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testAuthFlow();

