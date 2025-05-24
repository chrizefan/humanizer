import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Service role key not configured" },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, get count of users that will be affected
    const { count: usersToUpdate, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'free');
    
    if (countError) {
      console.error('Error counting users:', countError);
      return NextResponse.json(
        { success: false, error: "Failed to count users" },
        { status: 500 }
      );
    }
    
    // Update all users with subscription_tier = 'free' to add 10 credits
    // We'll use a more direct approach with a SELECT then UPDATE
    const { data: freeUsers, error: selectError } = await supabase
      .from('users')
      .select('id, credits_remaining')
      .eq('subscription_tier', 'free');
    
    if (selectError) {
      console.error('Error selecting free users:', selectError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch free users" },
        { status: 500 }
      );
    }
    
    if (!freeUsers || freeUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No free users found to update",
        details: {
          usersUpdated: 0,
          averageCreditsAfter: 0
        }
      });
    }
    
    // Update each user individually to add 10 credits
    const updatePromises = freeUsers.map(user => 
      supabase
        .from('users')
        .update({ 
          credits_remaining: user.credits_remaining + 10,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    );
    
    const updateResults = await Promise.all(updatePromises);
    const failedUpdates = updateResults.filter(result => result.error);
    
    if (failedUpdates.length > 0) {
      console.error('Some updates failed:', failedUpdates);
      return NextResponse.json(
        { success: false, error: `${failedUpdates.length} updates failed` },
        { status: 500 }
      );
    }
    
    // Get updated statistics
    const { data: stats, error: statsError } = await supabase
      .from('users')
      .select('subscription_tier, credits_remaining')
      .eq('subscription_tier', 'free');
    
    const avgCredits = stats ? 
      stats.reduce((sum, user) => sum + user.credits_remaining, 0) / stats.length : 0;
    
    return NextResponse.json({
      success: true,
      message: `Successfully added 10 credits to ${freeUsers.length} users without subscriptions`,
      details: {
        usersUpdated: freeUsers.length,
        averageCreditsAfter: Math.round(avgCredits * 100) / 100
      }
    });
    
  } catch (error) {
    console.error("Error in give credits operation:", error);
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
