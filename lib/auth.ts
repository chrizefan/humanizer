import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Function to get authenticated user from request
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Create Supabase client for authentication
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);
    
    // Get the authenticated user
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return { user: null, error: error?.message || "User not authenticated" };
    }
    
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
