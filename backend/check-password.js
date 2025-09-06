const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPassword() {
  console.log('🔍 Verificando contraseña del usuario jasbootstudios@gmail.com...\n');

  try {
    // Buscar el usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, status')
      .eq('email', 'jasbootstudios@gmail.com')
      .single();

    if (userError || !user) {
      console.error('❌ Usuario no encontrado:', userError);
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Nombre:', user.name);
    console.log('   Email:', user.email);
    console.log('   Estado:', user.status);

    // Buscar la contraseña
    const { data: passwordData, error: passwordError } = await supabase
      .from('user_passwords')
      .select('password, created_at')
      .eq('user_id', user.id)
      .single();

    if (passwordError || !passwordData) {
      console.error('❌ Contraseña no encontrada:', passwordError);
      return;
    }

    console.log('\n✅ Contraseña encontrada:');
    console.log('   Hash:', passwordData.password);
    console.log('   Creada:', passwordData.created_at);

    // Verificar la contraseña
    const testPassword = 'P0pok@tepel01';
    const isPasswordValid = await bcrypt.compare(testPassword, passwordData.password);
    
    console.log('\n🔐 Verificación de contraseña:');
    console.log('   Contraseña a probar:', testPassword);
    console.log('   ¿Es válida?:', isPasswordValid ? '✅ SÍ' : '❌ NO');

    if (!isPasswordValid) {
      console.log('\n💡 Posibles problemas:');
      console.log('1. La contraseña no se hasheó correctamente');
      console.log('2. El hash en la base de datos es incorrecto');
      console.log('3. La contraseña que se está probando no es la correcta');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkPassword();
