const { createClient } = require('@supabase/supabase-js');

async function debugAuthFlow() {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables');
        console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
        console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Debugging Authentication Flow...');
    console.log('================================================\n');

    // Test 1: Try to sign up with a unique email
    const testEmail = `test${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    console.log(`📝 Attempting sign-up with: ${testEmail}`);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.log('❌ Sign-up Error Details:');
            console.log('   Code:', error.status || 'Unknown');
            console.log('   Message:', error.message);
            console.log('   Full Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Sign-up Success!');
            console.log('   User ID:', data.user?.id);
            console.log('   Email:', data.user?.email);
            console.log('   Email Confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
            
            // Check if user record was created in public.users
            console.log('\n🔍 Checking if user record was created in public.users...');
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id);
            
            if (userError) {
                console.log('❌ Error fetching user record:', userError.message);
            } else if (userData && userData.length > 0) {
                console.log(`✅ Found ${userData.length} user record(s) in public.users table`);
                userData.forEach((record, index) => {
                    console.log(`   Record ${index + 1}:`, JSON.stringify(record, null, 2));
                });
            } else {
                console.log('❌ No user record found in public.users table');
                console.log('   This means the trigger function is not working properly');
            }
        }
    } catch (err) {
        console.log('❌ Unexpected Error:', err.message);
    }

    console.log('\n================================================');
    console.log('🏁 Debug Complete');
}

debugAuthFlow().catch(console.error);
