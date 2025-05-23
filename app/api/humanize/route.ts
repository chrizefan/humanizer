import { NextRequest, NextResponse } from "next/server";
import { humanizeText } from "@/lib/humanizer";
import { getUserCredits, updateUserCredits, saveProject, logUsage } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { HumanizeRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, tone, length, title } = body as HumanizeRequest & { title?: string };
    
    // Check if text is provided
    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { success: false, error: "No text provided for humanization" },
        { status: 400 }
      );
    }
    
    // Create Supabase client for authentication
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user has enough credits
    const userCredits = await getUserCredits();
    
    if (userCredits <= 0) {
      return NextResponse.json(
        { success: false, error: "Insufficient credits" },
        { status: 403 }
      );
    }
    
    // Process the text
    const response = await humanizeText({
      text,
      tone: tone || "professional",
      length: length || "medium",
    });
    
    // If humanization was successful
    if (response.success && response.output) {
      // Calculate credits used
      const creditsUsed = response.creditsUsed || 1;
      
      // Update user credits
      const newCreditAmount = Math.max(0, userCredits - creditsUsed);
      await updateUserCredits(newCreditAmount);
      
      // Save project if title is provided
      let projectId: string | undefined;
      
      if (title) {
        const saveResult = await saveProject(
          title,
          text,
          response.output
        );
        
        projectId = saveResult.projectId;
        
        // Log usage for the saved project
        if (projectId) {
          await logUsage(projectId, creditsUsed);
        }
      }
      
      // Return successful response
      return NextResponse.json({
        success: true,
        output: response.output,
        creditsUsed,
        creditsRemaining: newCreditAmount,
        projectId
      });
    }
    
    // Return error response
    return NextResponse.json(
      { success: false, error: response.error || "Humanization failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error processing humanize request:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}