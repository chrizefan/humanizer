const { createClient } = require('@supabase/supabase-js');

async function testExistingUsers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 CHECKING EXISTING USERS STATUS');
    console.log('==================================\n');

    try {
        // Check how many users exist in auth.users vs public.users
        console.log('📊 Checking user counts...');
        
        // This will show if there's a mismatch
        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('id, email, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (publicError) {
            console.log('❌ Error fetching public users:', publicError.message);
        } else {
            console.log(`✅ Found ${publicUsers.length} users in public.users table`);
            if (publicUsers.length > 0) {
                console.log('   Recent users:');
                publicUsers.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.email} (${user.created_at})`);
                });
            }
        }

        console.log('\n💡 DIAGNOSIS:');
        if (publicUsers.length === 0) {
            console.log('   ❌ No users in public.users table - TRIGGER IS BROKEN');
            console.log('   📋 Action needed: Apply the ultimate-trigger-fix.sql script');
        } else {
            console.log('   ✅ Users exist in public.users table - trigger may be working');
            console.log('   📋 Issue likely: Email confirmation requirement');
        }

        console.log('\n🔧 NEXT STEPS:');
        console.log('   1. Apply ultimate-trigger-fix.sql in Supabase SQL Editor');
        console.log('   2. Disable email confirmation in Authentication settings');
        console.log('   3. Wait for rate limit to reset (or use new email domain)');
        console.log('   4. Test with: npm run test:full');

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

testExistingUsers().catch(console.error);
