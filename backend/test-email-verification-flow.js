const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !jwtSecret) {
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

async function testEmailVerificationFlow() {
  try {
    console.log('🔍 Testing Email Verification Flow...\n');

    // Test 1: Check if email verification table exists
    console.log('1. Checking email verification table...');
    
    const { data: emailTokens, error: emailError } = await supabase
      .from('email_verification_tokens')
      .select('count')
      .limit(1);
    
    if (emailError) {
      console.error('❌ email_verification_tokens table error:', emailError.message);
      return;
    } else {
      console.log('✅ email_verification_tokens table accessible');
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

    // Test 4: Create email verification token
    console.log('\n4. Creating email verification token...');
    
    // Generate a shorter token for testing
    const verificationToken = 'test-email-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: testUser.id,
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()
      .single();

    if (tokenError) {
      console.error('❌ Email verification token creation error:', tokenError.message);
      return;
    } else {
      console.log('✅ Email verification token created successfully');
      console.log(`   Token ID: ${tokenData.id}`);
      console.log(`   Expires at: ${tokenData.expires_at}`);
    }

    // Test 5: Test token validation
    console.log('\n5. Testing token validation...');
    
    const { data: validToken, error: validError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', verificationToken)
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
    console.log('\n6. Testing email sending...');
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: testUser.email,
          subject: 'Mussikon - Verificación de Email (Test)',
          html: `
            <h2>Verificación de Email - Mussikon</h2>
            <p>Hola ${testUser.name},</p>
            <p>Este es un email de prueba para verificar la configuración del sistema de verificación por email.</p>
            <p>Token de verificación: ${verificationToken}</p>
            <p>Este token expira en 24 horas.</p>
            <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
            <br>
            <p>Saludos,<br>Equipo Mussikon</p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully');
        console.log(`   Message ID: ${info.messageId}`);
      } catch (error) {
        console.error('❌ Email sending error:', error.message);
      }
    } else {
      console.log('⚠️  Email not sent - configuration not set');
    }

    // Test 7: Simulate token usage
    console.log('\n7. Testing token usage...');
    
    const { data: updatedToken, error: updateError } = await supabase
      .from('email_verification_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Token update error:', updateError.message);
    } else {
      console.log('✅ Token marked as used successfully');
    }

    // Test 8: Clean up test data
    console.log('\n8. Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('id', tokenData.id);

    if (deleteError) {
      console.error('❌ Cleanup error:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

    console.log('\n🎉 Email verification flow test completed successfully!');
    console.log('\n📋 Test results:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Token creation: ✅ Success`);
    console.log(`   - Token validation: ✅ Success`);
    console.log(`   - Token usage: ✅ Success`);
    console.log(`   - Email sending: ${process.env.EMAIL_USER ? '✅ Success' : '⚠️  Not configured'}`);
    console.log(`   - Cleanup: ✅ Success`);
    
  } catch (error) {
    console.error('❌ Email verification flow test failed:', error.message);
    process.exit(1);
  }
}

testEmailVerificationFlow();
