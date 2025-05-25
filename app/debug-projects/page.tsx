'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, getUser, isAuthenticated } from '@/lib/supabase';

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<any>(null);
  
  const fetchAuthUser = async () => {
    try {
      setError(null); // Clear any previous errors
      console.log('Debug page - Starting fetchAuthUser...');
      
      // Use the same authentication approach as the dashboard
      const authenticated = await isAuthenticated();
      console.log('Debug page - isAuthenticated result:', authenticated);
      
      if (!authenticated) {
        console.log('Debug page - User not authenticated');
        setError('No authenticated user found. Please log in first.');
        return;
      }
      
      // Get the current user
      const user = await getUser();
      console.log('Debug page - getUser result:', user ? { id: user.id, email: user.email } : null);
      
      setAuthUser(user);
      
      if (!user) {
        console.log('Debug page - No user data available');
        setError('Authentication session exists but user data is missing. Try refreshing the page.');
        return;
      }
      
      // Check if user exists in the users table and get credits in a single query
      console.log('Debug page - User found, fetching database record...');
      const { data: dbUser, error: dbUserError } = await supabase
        .from('users')
        .select('*, credits_remaining, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
        
      console.log('Debug page - Database user record:', dbUser, 'Error:', dbUserError);
      
      if (dbUserError) {
        console.error('Debug page - Database error:', dbUserError);
        setError(`Database error: ${dbUserError.message}`);
      }
      
      // Store the user credits data for later use
      if (dbUser) {
        setUserCredits({
          credits_remaining: dbUser.credits_remaining,
          subscription_tier: dbUser.subscription_tier
        });
        console.log('Debug page - User credits set:', dbUser.credits_remaining);
      } else {
        console.log('Debug page - No user record found in database');
      }
      
      // After getting the user, fetch their projects in the same function
      await fetchProjects(user);
    } catch (err) {
      console.error('Error fetching auth user:', err);
      setError(`Failed to fetch auth user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  const fetchProjects = async (user: any) => {
    setLoading(true);
    try {
      // Initialize variables for current user projects
      let userProjects = [];
      let userError = null;
      let userCount = 0;
      
      if (user) {
        console.log('Fetching projects for current user:', user.id);
        
        // Use proper query format for projects
        const userResponse = await supabase
          .from('projects')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20); // Add a limit to avoid fetching too many projects
          
        userProjects = userResponse.data || [];
        userError = userResponse.error;
        userCount = userResponse.count || 0;
        
        console.log('Current user projects:', { 
          projects: userProjects, 
          error: userError, 
          count: userCount 
        });
        
        // No need to fetch credits again - already done in fetchAuthUser
        console.log('Using existing user credits data:', userCredits);
      }
      
      // Check if any projects exist at all
      console.log('Checking all projects');
      
      // Use proper format for all projects query
      const allResponse = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(20);
        
      const allProjects = allResponse.data || [];
      const allError = allResponse.error;
      const allCount = allResponse.count || 0;
      
      console.log('All projects:', { 
        projects: allProjects, 
        error: allError, 
        count: allCount 
      });
      
      // Set the data for display
      setProjectData({
        current: {
          userId: user?.id || 'N/A',
          projects: userProjects,
          count: userCount,
          error: userError
        },
        all: {
          projects: allProjects,
          count: allCount,
          error: allError
        }
      });
    } catch (err) {
      console.error('Error in fetch projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };
  
  // Load auth user on mount
  useEffect(() => {
    fetchAuthUser();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Project Debugging Page</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Auth User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {authUser ? (
            <div>
              <p><strong>User ID:</strong> {authUser.id}</p>
              <p><strong>Email:</strong> {authUser.email}</p>
              {userCredits && (
                <>
                  <p><strong>Credits Remaining:</strong> {userCredits.credits_remaining}</p>
                  <p><strong>Subscription Tier:</strong> {userCredits.subscription_tier || 'None'}</p>
                </>
              )}
            </div>
          ) : (
            <p>No authenticated user found</p>
          )}
        </CardContent>
      </Card>
      
      <Button 
        onClick={() => fetchAuthUser()}
        disabled={loading}
        className="mb-8"
      >
        {loading ? 'Loading...' : 'Refresh Projects Data'}
      </Button>
      
      {error && (
        <div className="p-4 mb-8 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          {error.includes('No authenticated user found') && (
            <div className="mt-2">
              <a href="/auth" className="text-blue-600 underline">
                Click here to log in
              </a>
            </div>
          )}
        </div>
      )}
      
      {projectData && (
        <div className="space-y-8">
          {/* Current User Projects */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle>Current User Projects (User ID: {projectData.current.userId || 'N/A'})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4"><strong>Count:</strong> {projectData.current.count}</p>
              {projectData.current.count > 0 ? (
                <ul className="list-disc pl-6 space-y-2">
                  {projectData.current.projects.map((p: any) => (
                    <li key={p.id} className="mb-3">
                      <strong>{p.title}</strong> (ID: {p.id})<br />
                      <small className="text-gray-600">Created: {new Date(p.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No projects found for current user</p>
              )}
            </CardContent>
          </Card>
          
          {/* All Projects */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle>All Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4"><strong>Count:</strong> {projectData.all.count}</p>
              {projectData.all.count > 0 ? (
                <ul className="list-disc pl-6 space-y-2">
                  {projectData.all.projects.map((p: any) => (
                    <li key={p.id} className="mb-3">
                      <strong>{p.title}</strong> (ID: {p.id})<br />
                      <small className="text-gray-600">User ID: {p.user_id}</small><br />
                      <small className="text-gray-600">Created: {new Date(p.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No projects found in the database</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
