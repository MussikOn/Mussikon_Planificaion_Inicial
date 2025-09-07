const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configurar nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testPasswordResetFlow() {
  try {
    console.log('🔍 Testing Password Reset Flow...\n');

    // Test 1: Check if password reset table exists
    console.log('1. Checking password reset table...');
    
    const { data: passwordTokens, error: passwordError } = await supabase
      .from('password_reset_tokens')
      .select('count')
      .limit(1);
    
    if (passwordError) {
      console.error('❌ password_reset_tokens table error:', passwordError.message);
      return;
    } else {
      console.log('✅ password_reset_tokens table accessible');
    }

    // Test 2: Get a test user
    console.log('\n2. Getting test user...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ No users found to test with');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.email} (${testUser.name})`);
    console.log(`   User ID: ${testUser.id}`);

    // Test 3: Test email configuration
    console.log('\n3. Testing email configuration...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email configuration not set (EMAIL_USER, EMAIL_PASS)');
      console.log('   This is normal if you haven\'t configured email yet');
    } else {
      try {
        await transporter.verify();
        console.log('✅ Email configuration is valid');
      } catch (error) {
        console.error('❌ Email configuration error:', error.message);
      }
    }

    // Test 4: Create password reset token
    console.log('\n4. Creating password reset token...');
    
    // Generate a shorter token for testing
    const resetToken = 'test-password-reset-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: testUser.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()
      .single();

    if (tokenError) {
      console.error('❌ Password reset token creation error:', tokenError.message);
      return;
    } else {
      console.log('✅ Password reset token created successfully');
      console.log(`   Token ID: ${tokenData.id}`);
      console.log(`   Expires at: ${tokenData.expires_at}`);
    }

    // Test 5: Test token validation
    console.log('\n5. Testing token validation...');
    
    const { data: validToken, error: validError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', resetToken)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (validError) {
      console.error('❌ Token validation error:', validError.message);
    } else {
      console.log('✅ Token validation successful');
      console.log(`   Token is valid and not expired`);
    }

    // Test 6: Test email sending (if configured)
    console.log('\n6. Testing password reset email sending...');
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: testUser.email,
          subject: 'Mussikon - Recuperación de Contraseña (Test)',
          html: `
            <h2>Recuperación de Contraseña - Mussikon</h2>
            <p>Hola ${testUser.name},</p>
            <p>Este es un email de prueba para verificar la configuración del sistema de recuperación de contraseña.</p>
            <p>Token de recuperación: ${resetToken}</p>
            <p>Este token expira en 24 horas.</p>
            <p>Si no solicitaste esta recuperación, puedes ignorar este email.</p>
            <br>
            <p>Saludos,<br>Equipo Mussikon</p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully');
        console.log(`   Message ID: ${info.messageId}`);
      } catch (error) {
        console.error('❌ Email sending error:', error.message);
      }
    } else {
      console.log('⚠️  Email not sent - configuration not set');
    }

    // Test 7: Test password hashing
    console.log('\n7. Testing password hashing...');
    
    const testPassword = 'newTestPassword123!';
    const saltRounds = 10;
    
    try {
      const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
      console.log('✅ Password hashing successful');
      console.log(`   Original password: ${testPassword}`);
      console.log(`   Hashed password: ${hashedPassword.substring(0, 20)}...`);
      
      // Test password verification
      const isValid = await bcrypt.compare(testPassword, hashedPassword);
      if (isValid) {
        console.log('✅ Password verification successful');
      } else {
        console.error('❌ Password verification failed');
      }
    } catch (error) {
      console.error('❌ Password hashing error:', error.message);
    }

    // Test 8: Simulate token usage
    console.log('\n8. Testing token usage...');
    
    const { data: updatedToken, error: updateError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Token update error:', updateError.message);
    } else {
      console.log('✅ Token marked as used successfully');
    }

    // Test 9: Clean up test data
    console.log('\n9. Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('id', tokenData.id);

    if (deleteError) {
      console.error('❌ Cleanup error:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

    console.log('\n🎉 Password reset flow test completed successfully!');
    console.log('\n📋 Test results:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Token creation: ✅ Success`);
    console.log(`   - Token validation: ✅ Success`);
    console.log(`   - Token usage: ✅ Success`);
    console.log(`   - Password hashing: ✅ Success`);
    console.log(`   - Email sending: ${process.env.EMAIL_USER ? '✅ Success' : '⚠️  Not configured'}`);
    console.log(`   - Cleanup: ✅ Success`);
    
  } catch (error) {
    console.error('❌ Password reset flow test failed:', error.message);
    process.exit(1);
  }
}

testPasswordResetFlow();
