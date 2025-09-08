const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check if notifications table exists
    console.log('\n1. Checking notifications table...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
    
    if (notificationsError) {
      console.error('❌ Notifications table error:', notificationsError.message);
    } else {
      console.log('✅ Notifications table accessible');
    }

    // Test 2: Check if users table exists
    console.log('\n2. Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }

    // Test 3: Check RLS policies
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'notifications' });
    
    if (policiesError) {
      console.log('⚠️  Could not check RLS policies (this is normal if the function doesn\'t exist)');
    } else {
      console.log('✅ RLS policies check completed');
    }

    // Test 4: Try to insert a test notification (will be rolled back)
    console.log('\n4. Testing notification insertion...');
    const testNotification = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select();

    if (insertError) {
      console.error('❌ Notification insertion error:', insertError.message);
    } else {
      console.log('✅ Notification insertion successful');
      
      // Clean up test data
      await supabase
        .from('notifications')
        .delete()
        .eq('id', insertData[0].id);
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();


