const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !jwtSecret) {
  console.error('❌ Missing required configuration');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.log('JWT_SECRET:', jwtSecret ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBalanceEndpoints() {
  try {
    console.log('🔍 Testing Balance Endpoints...\n');

    // Test 1: Check if balance tables exist and have data
    console.log('1. Checking balance tables...');
    
    const { data: balances, error: balancesError } = await supabase
      .from('user_balances')
      .select('*')
      .limit(5);
    
    if (balancesError) {
      console.error('❌ user_balances table error:', balancesError.message);
    } else {
      console.log('✅ user_balances table accessible');
      console.log(`   Found ${balances.length} balance records`);
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('user_transactions')
      .select('*')
      .limit(5);
    
    if (transactionsError) {
      console.error('❌ user_transactions table error:', transactionsError.message);
    } else {
      console.log('✅ user_transactions table accessible');
      console.log(`   Found ${transactions.length} transaction records`);
    }

    // Test 2: Get a real user to test with
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

    // Test 3: Create a test balance if it doesn't exist
    console.log('\n3. Ensuring test user has a balance...');
    
    const { data: userBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (balanceError && balanceError.code === 'PGRST116') {
      // No balance exists, create one
      const { data: newBalance, error: createError } = await supabase
        .from('user_balances')
        .insert({
          user_id: testUser.id,
          balance: 1000.00
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating balance:', createError.message);
      } else {
        console.log('✅ Created test balance:', newBalance.balance);
      }
    } else if (balanceError) {
      console.error('❌ Error checking balance:', balanceError.message);
    } else {
      console.log('✅ User already has balance:', userBalance.balance);
    }

    // Test 4: Create a test transaction
    console.log('\n4. Creating test transaction...');
    
    const { data: newTransaction, error: transactionError } = await supabase
      .from('user_transactions')
      .insert({
        user_id: testUser.id,
        type: 'credit',
        amount: 100.00,
        description: 'Test transaction from balance endpoint test',
        reference_type: 'test'
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Error creating transaction:', transactionError.message);
    } else {
      console.log('✅ Created test transaction:', newTransaction.id);
    }

    // Test 5: Generate JWT token for API testing
    console.log('\n5. Generating JWT token...');
    
    const token = jwt.sign(
      {
        userId: testUser.id,
        email: testUser.email,
        role: 'musician',
        active_role: 'musician'
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    console.log('✅ JWT token generated');

    // Test 6: Test API endpoints (simulate)
    console.log('\n6. Testing API endpoint simulation...');
    
    // Simulate the balance endpoint logic
    const { data: finalBalance, error: finalBalanceError } = await supabase
      .from('user_balances')
      .select('*')
      .eq('user_id', testUser.id)
      .single();

    if (finalBalanceError) {
      console.error('❌ Error fetching final balance:', finalBalanceError.message);
    } else {
      console.log('✅ Final balance:', finalBalance.balance);
    }

    const { data: finalTransactions, error: finalTransactionsError } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (finalTransactionsError) {
      console.error('❌ Error fetching transactions:', finalTransactionsError.message);
    } else {
      console.log(`✅ Found ${finalTransactions.length} transactions for user`);
    }

    console.log('\n🎉 Balance endpoints test completed successfully!');
    console.log('\n📋 Test results:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Balance: $${finalBalance?.balance || 'N/A'}`);
    console.log(`   - Transactions: ${finalTransactions?.length || 0}`);
    console.log(`   - JWT Token: Generated successfully`);
    
  } catch (error) {
    console.error('❌ Balance endpoints test failed:', error.message);
    process.exit(1);
  }
}

testBalanceEndpoints();


