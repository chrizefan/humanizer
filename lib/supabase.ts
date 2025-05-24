import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Define constants for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if required environment variables are present
if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL is not defined. Please add it to your .env.local file'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please add it to your .env.local file'
  );
}

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get the current user
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if the user is authenticated
export async function isAuthenticated() {
  const user = await getUser();
  return !!user;
}

// Helper function to sign out the user
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Helper function to get user credits
export async function getUserCredits() {
  const user = await getUser();
  
  if (!user) return 0;
  
  // Add logging to debug
  console.log('Fetching credits for user:', user.id);
  
  const { data, error } = await supabase
    .from('users')
    .select('credits_remaining')
    .eq('id', user.id)
    .single();
    
  // Log the response
  console.log('Credits response:', { data, error });
  
  if (error) {
    console.error('Error fetching user credits:', error);
    return 0;
  }
  
  if (!data) {
    console.warn('No data returned for user credits');
    return 0;
  }
  
  return data.credits_remaining;
}

// Helper function to update user credits
export async function updateUserCredits(newCreditAmount: number) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const { error } = await supabase
    .from('users')
    .update({ credits_remaining: newCreditAmount })
    .eq('id', user.id);
    
  return { success: !error };
}

// Helper function to save a new project
export async function saveProject(title: string, inputText: string, outputText: string) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title,
      input_text: inputText,
      output_text: outputText
    })
    .select();
    
  return { 
    success: !error,
    projectId: data?.[0]?.id
  };
}

// Helper function to log usage
export async function logUsage(projectId: string, creditsUsed: number) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: user.id,
      project_id: projectId,
      credits_used: creditsUsed
    });
    
  return { success: !error };
}

// Helper function to get user projects
export async function getUserProjects(page = 1, pageSize = 10) {
  const user = await getUser();
  
  if (!user) return { data: [], count: 0 };
  
  // Calculate pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Get total count
  const { count, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  // Get paginated data
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);
    
  return { 
    data: data || [],
    count: count || 0
  };
}

// Helper function to get a single project by ID
export async function getProjectById(projectId: string) {
  const user = await getUser();
  
  if (!user) return { data: null };
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching project:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}

// Helper function to update a project
export async function updateProject(projectId: string, updates: Partial<{
  title: string;
  input_text: string;
  output_text: string;
}>) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const { error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', user.id);
    
  return { success: !error, error };
}

// Helper function to delete a project
export async function deleteProject(projectId: string) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);
    
  return { success: !error, error };
}

// Helper function to get usage statistics
export async function getUserUsageStats() {
  const user = await getUser();
  
  if (!user) return { data: null };
  
  // Get total credits used
  const { data: usageData, error: usageError } = await supabase
    .from('usage_logs')
    .select('credits_used')
    .eq('user_id', user.id);
    
  if (usageError) {
    console.error('Error fetching usage stats:', usageError);
    return { data: null, error: usageError };
  }
  
  // Get user details including subscription tier
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('subscription_tier, credits_remaining')
    .eq('id', user.id)
    .single();
    
  if (userError) {
    console.error('Error fetching user data:', userError);
    return { data: null, error: userError };
  }
  
  const totalUsed = usageData?.reduce((sum, log) => sum + log.credits_used, 0) || 0;
  
  return { 
    data: {
      totalCreditsUsed: totalUsed,
      creditsRemaining: userData?.credits_remaining || 0,
      subscriptionTier: userData?.subscription_tier || 'free'
    }, 
    error: null 
  };
}

// Helper function to update user subscription tier
export async function updateUserSubscription(subscriptionTier: string) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: subscriptionTier })
    .eq('id', user.id);
    
  return { success: !error };
}

// Helper function to get subscription details
export async function getUserSubscription() {
  const user = await getUser();
  
  if (!user) return { data: null };
  
  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching subscription:', error);
    return { data: null, error };
  }
  
  return { data: data?.subscription_tier || 'free', error: null };
}

// Admin function to give credits to users without subscriptions
export async function giveFreeCreditsToNonSubscribers(creditAmount: number = 10) {
  // This requires service role permissions
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseServiceKey) {
    throw new Error('Service role key not configured');
  }
  
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get all free users
  const { data: freeUsers, error: selectError } = await adminSupabase
    .from('users')
    .select('id, credits_remaining')
    .eq('subscription_tier', 'free');
  
  if (selectError) {
    throw new Error(`Failed to fetch free users: ${selectError.message}`);
  }
  
  if (!freeUsers || freeUsers.length === 0) {
    return {
      success: true,
      usersUpdated: 0,
      creditsAdded: creditAmount
    };
  }
  
  // Update each user individually
  const updatePromises = freeUsers.map(user => 
    adminSupabase
      .from('users')
      .update({ 
        credits_remaining: user.credits_remaining + creditAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
  );
  
  const updateResults = await Promise.all(updatePromises);
  const failedUpdates = updateResults.filter(result => result.error);
  
  if (failedUpdates.length > 0) {
    throw new Error(`${failedUpdates.length} updates failed`);
  }
  
  return {
    success: true,
    usersUpdated: freeUsers.length,
    creditsAdded: creditAmount
  };
}