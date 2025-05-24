const { createClient } = require('@supabase/supabase-js');

async function testExistingUsers() {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 CHECKING EXISTING USER DATA');
    console.log('=====================================\n');

    try {
        // Check auth.users table
        console.log('📊 Checking auth.users table...');
        const { data: authUsers, error: authError } = await supabase
            .from('users')  // This will fail but let's see the error
            .select('*')
            .limit(5);

        // Check what users exist in auth (we can't query auth.users directly via supabase-js)
        console.log('🔍 Checking public.users table...');
        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (publicError) {
            console.log('❌ Error querying public.users:', publicError.message);
        } else {
            console.log(`✅ Found ${publicUsers?.length || 0} users in public.users table`);
            
            if (publicUsers && publicUsers.length > 0) {
                console.log('\n📋 Recent users in public.users:');
                publicUsers.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
                    console.log(`      Created: ${user.created_at}`);
                });
            } else {
                console.log('   No users found in public.users table');
                console.log('   This confirms the trigger is not working');
            }
        }

        // Try to check current session
        console.log('\n🔐 Checking current session...');
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (session?.session) {
            console.log('✅ Active session found');
            console.log(`   User: ${session.session.user.email}`);
            console.log(`   ID: ${session.session.user.id}`);
        } else {
            console.log('ℹ️  No active session');
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }

    console.log('\n🎯 ANALYSIS & NEXT STEPS');
    console.log('=====================================');
    console.log('1. Apply the trigger fix in Supabase SQL Editor');
    console.log('2. Disable email confirmation in Supabase Auth settings');
    console.log('3. Wait for email rate limit to reset (about 1 hour)');
    console.log('4. Test with fresh email addresses');
    console.log('\nThe email rate limit is expected - we ran many tests!');
}

testExistingUsers().catch(console.error);
