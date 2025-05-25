import { NextRequest, NextResponse } from "next/server";
import { getUser, supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log('Debug API: Starting user check...');
    
    // Get the current user
    const user = await getUser();
    console.log('Debug API: User from getUser():', user ? { id: user.id, email: user.email } : null);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user found',
        details: 'getUser() returned null'
      });
    }
    
    // Simplified response - no database query to avoid 406 errors
    return NextResponse.json({
      success: true,
      authUser: {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role
      },
      message: 'User check completed successfully'
    });
    
  } catch (error) {
    console.error("Debug API error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
