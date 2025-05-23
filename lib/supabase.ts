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

// Helper function to get user credits
export async function getUserCredits() {
  const user = await getUser();
  
  if (!user) return 0;
  
  const { data, error } = await supabase
    .from('users')
    .select('credits_remaining')
    .eq('id', user.id)
    .single();
    
  if (error || !data) return 0;
  
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