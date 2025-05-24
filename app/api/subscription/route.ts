import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateUserSubscription, getUserSubscription, updateUserCredits } from "@/lib/supabase";

// GET subscription details
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      const { data, error } = await getUserSubscription();
      
      if (error) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch subscription" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        subscription: data
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

// POST to update subscription
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      // Parse request body
      const body = await request.json();
      const { tier, creditsToAdd = 0 } = body;
      
      // Validate request
      if (!tier || typeof tier !== 'string') {
        return NextResponse.json(
          { success: false, error: "Invalid subscription tier" },
          { status: 400 }
        );
      }
      
      // Define valid tiers and their credit bonuses
      const validTiers: Record<string, number> = {
        free: 0,
        basic: 50,
        premium: 200,
        enterprise: 1000
      };
      
      if (!Object.keys(validTiers).includes(tier)) {
        return NextResponse.json(
          { success: false, error: "Invalid subscription tier" },
          { status: 400 }
        );
      }
      
      // Update subscription
      const { success: subscriptionUpdated } = await updateUserSubscription(tier);
      
      if (!subscriptionUpdated) {
        return NextResponse.json(
          { success: false, error: "Failed to update subscription" },
          { status: 500 }
        );
      }
      
      // Add tier bonus credits if applicable
      let creditUpdateSuccess = true;
      if (creditsToAdd > 0) {
        // Update user credits
        const { success } = await updateUserCredits(creditsToAdd);
        creditUpdateSuccess = success;
      }
      
      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        creditsAdded: creditUpdateSuccess ? creditsToAdd : 0
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
