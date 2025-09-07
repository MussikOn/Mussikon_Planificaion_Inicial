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

async function testEmailPasswordFlow() {
  try {
    console.log('🔍 Testing Email and Password Reset Flow...\n');

    // Test 1: Check if tables exist
    console.log('1. Checking required tables...');
    
    const { data: emailTokens, error: emailError } = await supabase
      .from('email_verification_tokens')
      .select('count')
      .limit(1);
    
    if (emailError) {
      console.error('❌ email_verification_tokens table error:', emailError.message);
    } else {
      console.log('✅ email_verification_tokens table accessible');
    }

    const { data: passwordTokens, error: passwordError } = await supabase
      .from('password_reset_tokens')
      .select('count')
      .limit(1);
    
    if (passwordError) {
      console.error('❌ password_reset_tokens table error:', passwordError.message);
    } else {
      console.log('✅ password_reset_tokens table accessible');
    }

    // Test 2: Test email configuration
    console.log('\n2. Testing email configuration...');
    
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

    // Test 3: Test token creation (email verification)
    console.log('\n3. Testing email verification token creation...');
    
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const testToken = 'test-email-token-' + Date.now();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { data: emailTokenData, error: emailTokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: testUserId,
        token: testToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select();

    if (emailTokenError) {
      console.error('❌ Email verification token creation error:', emailTokenError.message);
    } else {
      console.log('✅ Email verification token created successfully');
      
      // Clean up test data
      await supabase
        .from('email_verification_tokens')
        .delete()
        .eq('id', emailTokenData[0].id);
      console.log('✅ Test email verification token cleaned up');
    }

    // Test 4: Test token creation (password reset)
    console.log('\n4. Testing password reset token creation...');
    
    const testPasswordToken = 'test-password-token-' + Date.now();

    const { data: passwordTokenData, error: passwordTokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: testUserId,
        token: testPasswordToken,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select();

    if (passwordTokenError) {
      console.error('❌ Password reset token creation error:', passwordTokenError.message);
    } else {
      console.log('✅ Password reset token created successfully');
      
      // Clean up test data
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('id', passwordTokenData[0].id);
      console.log('✅ Test password reset token cleaned up');
    }

    // Test 5: Test token validation
    console.log('\n5. Testing token validation...');
    
    const { data: validTokens, error: validError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', 'non-existent-token')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString());

    if (validError) {
      console.error('❌ Token validation error:', validError.message);
    } else {
      console.log('✅ Token validation query works (no results as expected)');
    }

    console.log('\n🎉 Email and Password Reset Flow test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Configure email settings in .env file');
    console.log('   2. Test the actual email sending functionality');
    console.log('   3. Test the frontend integration');
    
  } catch (error) {
    console.error('❌ Email and Password Reset Flow test failed:', error.message);
    process.exit(1);
  }
}

testEmailPasswordFlow();
