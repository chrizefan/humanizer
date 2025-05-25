import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // Create Supabase client with anon key for token validation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication error" },
        { status: 401 }
      );
    }
    
    // Create authenticated client with the access token in headers
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    // Fetch user credits from database
    const { data: userData, error: creditsError } = await authenticatedSupabase
      .from('users')
      .select('credits_remaining')
      .eq('id', user.id)
      .maybeSingle();
      
    if (creditsError) {
      return NextResponse.json(
        { success: false, error: "Error fetching credits" },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    const credits = userData?.credits_remaining || 0;
    
    return NextResponse.json({
      success: true,
      credits,
      usageStats: {
        totalCreditsUsed: 0,
        creditsRemaining: credits,
        subscriptionTier: 'free'
      }
    });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}