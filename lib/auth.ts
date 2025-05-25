import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// Function to get authenticated user from request
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookieStore = cookies();
    
    // Create Supabase client with cookies for API routes
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    // Get the authenticated user
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      console.log("Auth error:", error?.message || "No user found");
      return { user: null, error: error?.message || "Auth session missing!" };
    }
    
    console.log("Auth success:", data.user.email);
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Error in authentication:", error);
    return { user: null, error: "Authentication error" };
  }
}

// Middleware to check authentication
export async function requireAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  const { user, error } = await getAuthenticatedUser(request);
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: error || "Authentication required" },
      { status: 401 }
    );
  }
  
  return handler(request, user);
}
