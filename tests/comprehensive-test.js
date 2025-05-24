const { createClient } = require('@supabase/supabase-js');

async function comprehensiveTest() {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 COMPREHENSIVE AUTHENTICATION TEST');
    console.log('=========================================\n');

    let testResults = {
        signUp: false,
        userRecordCreated: false,
        login: false,
        userDataFetch: false
    };

    // Test 1: Sign Up
    const testEmail = `fulltest${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    console.log(`📝 TEST 1: Sign-up with ${testEmail}`);
    console.log('-------------------------------------------');
    
    try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (signUpError) {
            console.log('❌ Sign-up FAILED:', signUpError.message);
            return testResults;
        }

        console.log('✅ Sign-up SUCCESS');
        console.log(`   User ID: ${signUpData.user?.id}`);
        console.log(`   Email: ${signUpData.user?.email}`);
        testResults.signUp = true;

        // Test 2: Check User Record Creation
        console.log('\n🔍 TEST 2: Checking user record creation...');
        console.log('-------------------------------------------');
        
        // Wait for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 3000));

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signUpData.user.id);

        if (userError) {
            console.log('❌ User record check FAILED:', userError.message);
        } else if (userData && userData.length > 0) {
            console.log('✅ User record creation SUCCESS');
            console.log('   Record details:', JSON.stringify(userData[0], null, 2));
            testResults.userRecordCreated = true;
        } else {
            console.log('❌ User record creation FAILED - No record found');
            console.log('   This means the trigger is still not working');
        }

        // Test 3: Login
        console.log('\n🔐 TEST 3: Login test...');
        console.log('-------------------------------------------');

        // First sign out to ensure clean test
        await supabase.auth.signOut();

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) {
            console.log('❌ Login FAILED:', loginError.message);
            console.log('   Error code:', loginError.status);
        } else {
            console.log('✅ Login SUCCESS');
            console.log(`   Logged in as: ${loginData.user?.email}`);
            testResults.login = true;

            // Test 4: Fetch User Data
            console.log('\n📊 TEST 4: Fetching user data...');
            console.log('-------------------------------------------');

            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', loginData.user.id)
                .single();

            if (profileError) {
                console.log('❌ User data fetch FAILED:', profileError.message);
            } else {
                console.log('✅ User data fetch SUCCESS');
                console.log('   Profile data:', JSON.stringify(profileData, null, 2));
                testResults.userDataFetch = true;
            }
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }

    // Final Results
    console.log('\n📋 FINAL TEST RESULTS');
    console.log('=========================================');
    console.log(`✅ Sign-up: ${testResults.signUp ? 'PASS' : 'FAIL'}`);
    console.log(`✅ User Record Created: ${testResults.userRecordCreated ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Login: ${testResults.login ? 'PASS' : 'FAIL'}`);
    console.log(`✅ User Data Fetch: ${testResults.userDataFetch ? 'PASS' : 'FAIL'}`);
    
    const passCount = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n🎯 SUCCESS RATE: ${passCount}/${totalTests} (${(passCount/totalTests*100).toFixed(1)}%)`);
    
    if (passCount === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! Your authentication is working perfectly!');
        console.log('   You can now use your app at http://localhost:3000');
    } else {
        console.log('\n⚠️  Some tests failed. Check the trigger setup in Supabase.');
    }

    return testResults;
}

comprehensiveTest().catch(console.error);
