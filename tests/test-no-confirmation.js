const { createClient } = require('@supabase/supabase-js');

async function testWithEmailConfirmationDisabled() {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Missing environment variables');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧪 TESTING WITH EMAIL CONFIRMATION DISABLED');
    console.log('===============================================\n');

    // Test with options to skip email confirmation
    const testEmail = `skipconfirm${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';

    console.log(`📝 Sign-up with: ${testEmail}`);
    console.log('(Attempting to skip email confirmation)');
    
    try {
        // Try sign-up with email confirmation disabled
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: undefined, // Don't send confirmation email
                data: {
                    skip_confirmation: true // Custom metadata (won't work but helps identify)
                }
            }
        });

        if (signUpError) {
            console.log('❌ Sign-up failed:', signUpError.message);
            return;
        }

        console.log('✅ Sign-up successful');
        console.log(`   User ID: ${signUpData.user?.id}`);
        console.log(`   Email Confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`);

        // Wait for trigger
        console.log('\n⏳ Waiting for trigger...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check user record
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signUpData.user.id);

        if (userError) {
            console.log('❌ User record check failed:', userError.message);
        } else if (userData && userData.length > 0) {
            console.log('✅ User record found! Trigger is working');
            console.log('   Record:', JSON.stringify(userData[0], null, 2));
        } else {
            console.log('❌ No user record found - trigger still broken');
        }

        // Try to manually confirm the email for testing
        console.log('\n🔧 Attempting manual email confirmation...');
        
        // This won't work with client SDK, but shows the intent
        console.log('   (This would require admin/service role key)');
        
        // Try login anyway to see the exact error
        console.log('\n🔐 Attempting login without confirmation...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });

        if (loginError) {
            console.log('❌ Login failed:', loginError.message);
            console.log('   Error code:', loginError.status);
            
            if (loginError.message.includes('Email not confirmed')) {
                console.log('\n💡 SOLUTION: You need to disable email confirmation in Supabase settings');
                console.log('   Go to: Authentication > Settings > Email Confirmation');
                console.log('   Turn OFF: "Enable email confirmations"');
            }
        } else {
            console.log('✅ Login successful despite no confirmation!');
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }

    console.log('\n===============================================');
    console.log('🏁 Test complete');
}

testWithEmailConfirmationDisabled().catch(console.error);
