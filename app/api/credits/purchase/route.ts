import { NextRequest, NextResponse } from "next/server";
import { getUserCredits, updateUserCredits } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      // Parse request body
      const body = await request.json();
      const { amount } = body;
      
      // Validate request
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { success: false, error: "Invalid credit amount" },
          { status: 400 }
        );
      }
      
      // Get current credits
      const currentCredits = await getUserCredits();
      
      // Add credits
      const newCreditAmount = currentCredits + amount;
      const { success } = await updateUserCredits(newCreditAmount);
      
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Failed to add credits" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `${amount} credits added successfully`,
        newBalance: newCreditAmount
      });
    } catch (error) {
      console.error("Error adding credits:", error);
      
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
