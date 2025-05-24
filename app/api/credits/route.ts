import { NextRequest, NextResponse } from "next/server";
import { getUserCredits, getUserUsageStats } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      // Fetch user credits and usage statistics
      const credits = await getUserCredits();
      const { data: usageStats } = await getUserUsageStats();
      
      // Return successful response
      return NextResponse.json({
        success: true,
        credits,
        usageStats: usageStats || {
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
  });
}