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

async function testEmailSending() {
  try {
    console.log('🔍 Testing Email Sending...\n');

    // Test 1: Check email configuration
    console.log('1. Checking email configuration...');
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration is incomplete');
      return;
    }

    // Test 2: Test transporter connection
    console.log('\n2. Testing transporter connection...');
    try {
      await transporter.verify();
      console.log('✅ Transporter connection successful');
    } catch (error) {
      console.error('❌ Transporter connection failed:', error.message);
      return;
    }

    // Test 3: Get test user
    console.log('\n3. Getting test user...');
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

    // Test 4: Send test email
    console.log('\n4. Sending test email...');
    
    const mailOptions = {
      from: `"Mussikon" <${process.env.EMAIL_USER}>`,
      to: testUser.email,
      subject: 'Test Email - Mussikon Email System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📧 Test Email</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Mussikon - Sistema de Email</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0A2A5F; margin-top: 0;">¡Hola ${testUser.name}!</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              Este es un email de prueba para verificar que el sistema de envío de emails de Mussikon está funcionando correctamente.
            </p>
            
            <div style="background: #e6f3ff; border-left: 4px solid #0A2A5F; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #0A2A5F; font-weight: bold;">✅ Información del Test:</p>
              <ul style="margin: 10px 0 0 0; color: #4a5568; padding-left: 20px;">
                <li>Usuario: ${testUser.name}</li>
                <li>Email: ${testUser.email}</li>
                <li>Fecha: ${new Date().toLocaleString()}</li>
                <li>Estado: Sistema funcionando correctamente</li>
              </ul>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              Si recibiste este email, significa que el sistema de notificaciones de Mussikon está funcionando perfectamente.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Este es un email de prueba del sistema Mussikon.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);

    // Test 5: Test the actual verification email function
    console.log('\n5. Testing verification email function...');
    
    const verificationToken = 'test-verification-token-' + Date.now();
    const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
    
    const verificationMailOptions = {
      from: `"Mussikon" <${process.env.EMAIL_USER}>`,
      to: testUser.email,
      subject: 'Verifica tu Email - Mussikon (Test)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📧 Verifica tu Email</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Mussikon - Plataforma Musical</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #0A2A5F; margin-top: 0;">¡Hola ${testUser.name}!</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
              Gracias por registrarte en Mussikon. Para completar tu registro y activar tu cuenta, 
              necesitamos verificar que este email te pertenece.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                ✅ Verificar Email
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <a href="${verificationUrl}" style="color: #0A2A5F; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
        </div>
      `
    };

    const verificationInfo = await transporter.sendMail(verificationMailOptions);
    console.log('✅ Verification email sent successfully');
    console.log(`   Message ID: ${verificationInfo.messageId}`);
    console.log(`   Response: ${verificationInfo.response}`);

    console.log('\n🎉 Email sending test completed successfully!');
    console.log('\n📋 Test results:');
    console.log(`   - Email configuration: ✅ Valid`);
    console.log(`   - Transporter connection: ✅ Success`);
    console.log(`   - Test email: ✅ Sent`);
    console.log(`   - Verification email: ✅ Sent`);
    console.log(`   - User: ${testUser.email}`);
    
  } catch (error) {
    console.error('❌ Email sending test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmailSending();


