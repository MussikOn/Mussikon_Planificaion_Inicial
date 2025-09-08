const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserEmail(email) {
  try {
    console.log(`🔍 Checking user: ${email}\n`);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, status, role, active_role, created_at')
      .eq('email', email)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('❌ User not found in database');
        console.log('   This means the email is not registered in the system');
        return;
      } else {
        console.error('❌ Database error:', userError.message);
        return;
      }
    }

    console.log('✅ User found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active Role: ${user.active_role}`);
    console.log(`   Created: ${user.created_at}`);

    // Check if user has verification tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (tokensError) {
      console.error('❌ Error checking verification tokens:', tokensError.message);
    } else {
      console.log(`\n📧 Verification tokens (${tokens.length}):`);
      if (tokens.length === 0) {
        console.log('   No verification tokens found');
      } else {
        tokens.forEach((token, index) => {
          console.log(`   ${index + 1}. Token: ${token.token.substring(0, 20)}...`);
          console.log(`      Used: ${token.used}`);
          console.log(`      Expires: ${token.expires_at}`);
          console.log(`      Created: ${token.created_at}`);
        });
      }
    }

    // Check if user has password reset tokens
    const { data: resetTokens, error: resetTokensError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (resetTokensError) {
      console.error('❌ Error checking password reset tokens:', resetTokensError.message);
    } else {
      console.log(`\n🔐 Password reset tokens (${resetTokens.length}):`);
      if (resetTokens.length === 0) {
        console.log('   No password reset tokens found');
      } else {
        resetTokens.forEach((token, index) => {
          console.log(`   ${index + 1}. Token: ${token.token.substring(0, 20)}...`);
          console.log(`      Used: ${token.used}`);
          console.log(`      Expires: ${token.expires_at}`);
          console.log(`      Created: ${token.created_at}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error checking user:', error.message);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node check-user-email.js <email>');
  process.exit(1);
}

checkUserEmail(email);


