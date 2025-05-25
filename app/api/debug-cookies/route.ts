import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('Debug API: All cookies:', allCookies);
    
    // Look for Supabase auth cookies
    const authCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('sb-') || 
      cookie.name.includes('supabase') ||
      cookie.name.includes('auth') ||
      cookie.name.includes('access') ||
      cookie.name.includes('refresh')
    );
    
    console.log('Debug API: Auth-related cookies:', authCookies);
    
    // Also try to create a Supabase client and test authentication
    console.log('Debug API: Testing Supabase client...');
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = createServerSupabaseClient();
    
    console.log('Debug API: Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('Debug API: User result:', user ? { id: user.id, email: user.email } : null);
    console.log('Debug API: User error:', userError);
    
    return NextResponse.json({
      success: true,
      totalCookies: allCookies.length,
      authCookies: authCookies.length,
      cookies: authCookies.map(c => ({ 
        name: c.name, 
        hasValue: !!c.value,
        valueLength: c.value ? c.value.length : 0 
      })),
      allCookieNames: allCookies.map(c => c.name),
      authTest: {
        user: user ? { id: user.id, email: user.email } : null,
        error: userError?.message || null
      }
    });
  } catch (error) {
    console.error("Debug API error:", error);
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
