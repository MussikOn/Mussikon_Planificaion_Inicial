const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
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

async function testNumericVerification() {
  try {
    console.log('🔍 Testing Numeric Verification System...\n');

    // Test 1: Check if user exists
    console.log('1. Getting test user...');
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

    // Test 2: Generate verification code
    console.log('\n2. Generating verification code...');
    const { data: verificationCode, error: codeError } = await supabase
      .rpc('create_email_verification_code', { p_user_id: testUser.id });

    if (codeError) {
      console.error('❌ Error generating verification code:', codeError.message);
      return;
    }

    console.log(`✅ Verification code generated: ${verificationCode}`);

    // Test 3: Check if code was saved in database
    console.log('\n3. Checking code in database...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('verification_code', verificationCode)
      .eq('used', false)
      .single();

    if (tokenError) {
      console.error('❌ Error checking token:', tokenError.message);
      return;
    }

    console.log('✅ Code saved in database:');
    console.log(`   Code: ${tokenData.verification_code}`);
    console.log(`   Expires: ${tokenData.expires_at}`);
    console.log(`   Attempts: ${tokenData.attempts}/${tokenData.max_attempts}`);

    // Test 4: Send verification email
    console.log('\n4. Sending verification email...');
    
    const mailOptions = {
      from: `"Mussikon" <${process.env.EMAIL_USER}>`,
      to: testUser.email,
      subject: 'Código de Verificación - Mussikon (Test)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Código de Verificación</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Mussikon - Plataforma Musical</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0A2A5F; margin-top: 0;">¡Hola ${testUser.name}!</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              Este es un email de prueba para verificar el nuevo sistema de códigos numéricos de Mussikon.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); 
                          color: white; 
                          padding: 20px; 
                          border-radius: 12px; 
                          display: inline-block;
                          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                          border: 3px solid #1E40AF;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Tu código de verificación es:</p>
                <h1 style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </h1>
              </div>
            </div>
            
            <div style="background: #e6f3ff; border-left: 4px solid #0A2A5F; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #0A2A5F; font-weight: bold;">⚠️ Información importante:</p>
              <ul style="margin: 10px 0 0 0; color: #4a5568; padding-left: 20px;">
                <li>Este código expirará en <strong>15 minutos</strong> por seguridad</li>
                <li>Solo puedes usar este código <strong>3 veces</strong></li>
                <li>Si no funciona, solicita un nuevo código de verificación</li>
                <li>Después de 3 intentos fallidos, el código se bloqueará por 30 minutos</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">🔒 Seguridad:</p>
              <p style="margin: 10px 0 0 0; color: #856404;">
                Nunca compartas este código con nadie. El equipo de Mussikon nunca te pedirá tu código de verificación.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Este es un email de prueba del sistema Mussikon.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);

    // Test 5: Test code verification
    console.log('\n5. Testing code verification...');
    const { data: isValid, error: verifyError } = await supabase
      .rpc('verify_email_code', { 
        p_user_id: testUser.id, 
        p_code: verificationCode 
      });

    if (verifyError) {
      console.error('❌ Error verifying code:', verifyError.message);
      return;
    }

    if (isValid) {
      console.log('✅ Code verification successful');
    } else {
      console.log('❌ Code verification failed');
    }

    // Test 6: Check token status after verification
    console.log('\n6. Checking token status after verification...');
    const { data: updatedTokenData, error: updatedTokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('verification_code', verificationCode)
      .single();

    if (updatedTokenError) {
      console.error('❌ Error checking updated token:', updatedTokenError.message);
    } else {
      console.log('✅ Token status updated:');
      console.log(`   Used: ${updatedTokenData.used}`);
      console.log(`   Attempts: ${updatedTokenData.attempts}`);
    }

    console.log('\n🎉 Numeric verification system test completed successfully!');
    console.log('\n📋 Test results:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Code generation: ✅ Success`);
    console.log(`   - Code storage: ✅ Success`);
    console.log(`   - Email sending: ✅ Success`);
    console.log(`   - Code verification: ${isValid ? '✅ Success' : '❌ Failed'}`);
    console.log(`   - Token update: ✅ Success`);
    
  } catch (error) {
    console.error('❌ Numeric verification test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testNumericVerification();


