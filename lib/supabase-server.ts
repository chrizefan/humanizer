import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Helper function to create server-side Supabase client with cookies
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// Helper function to get the current user (server-side)
export async function getUser() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Helper function to check if the user is authenticated
export async function isAuthenticated() {
  const user = await getUser();
  return !!user;
}

// Helper function to sign out the user
export async function signOut() {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Helper function to get user credits
export async function getUserCredits() {
  const user = await getUser();
  
  if (!user) {
    console.log('getUserCredits: No user found');
    return 0;
  }
  
  // Add logging to debug
  console.log('getUserCredits: Fetching credits for user:', user.id, user.email);
  
  // Use server-side client with cookies
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('credits_remaining')
    .eq('id', user.id)
    .maybeSingle(); // Changed from single() to avoid header issues
    
  // Log the response
  console.log('getUserCredits: Database response:', { data, error });
  
  if (error) {
    console.error('getUserCredits: Error fetching user credits:', error);
    return 0;
  }
  
  if (!data) {
    console.warn('getUserCredits: No data returned for user credits');
    return 0;
  }
  
  console.log('getUserCredits: Returning credits:', data.credits_remaining);
  return data.credits_remaining;
}

// Helper function to update user credits
export async function updateUserCredits(newCreditAmount: number) {
  const user = await getUser();
  
  if (!user) return { success: false };
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .maybeSingle();
    
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
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
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
    .maybeSingle();
    
  if (userError) {
    console.error('Error fetching user data:', userError);
    return { data: null, error: userError };
  }

  if (!userData) {
    console.error('User not found');
    return { data: null, error: new Error('User not found') };
  }
  
  const totalUsed = usageData?.reduce((sum: number, log: any) => sum + log.credits_used, 0) || 0;
  
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
  
  const supabase = createServerSupabaseClient();
  
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
  
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching subscription:', error);
    return { data: null, error };
  }
  
  return { data: data?.subscription_tier || 'free', error: null };
}
