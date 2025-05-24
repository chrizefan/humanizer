const { createClient } = require('@supabase/supabase-js');

async function testTriggerFix() {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧪 Testing Trigger Fix...');
    console.log('================================================\n');

    // Test with a new unique email
    const testEmail = `triggertest${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    console.log(`📝 Testing sign-up with: ${testEmail}`);
    
    try {
        // Attempt sign-up
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.log('❌ Sign-up failed:', error.message);
            return;
        }

        console.log('✅ Sign-up successful!');
        console.log(`   User ID: ${data.user?.id}`);

        // Wait a moment for the trigger to execute
        console.log('⏳ Waiting for trigger to execute...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user record was created
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id);

        if (userError) {
            console.log('❌ Error checking user record:', userError.message);
        } else if (userData && userData.length > 0) {
            console.log('✅ SUCCESS! User record created in public.users table');
            console.log('   Record details:', JSON.stringify(userData[0], null, 2));
            
            // Now test login
            console.log('\n🔐 Testing login...');
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });

            if (loginError) {
                console.log('❌ Login failed:', loginError.message);
            } else {
                console.log('✅ Login successful!');
                console.log(`   Logged in as: ${loginData.user?.email}`);
            }
        } else {
            console.log('❌ TRIGGER STILL NOT WORKING - No user record found');
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }

    console.log('\n================================================');
    console.log('🏁 Trigger test complete');
}

testTriggerFix().catch(console.error);
