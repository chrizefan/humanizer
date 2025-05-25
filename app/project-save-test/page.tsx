'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { saveProject } from '@/lib/supabase';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';

export default function ProjectSaveTestPage() {
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Test Project');
  const [inputText, setInputText] = useState('This is some test input text');
  const [outputText, setOutputText] = useState('This is the humanized output');
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { user } = useSupabaseAuth();
  const supabase = createClientComponentClient();
  
  // Fetch user info on mount
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        // Get the current user from auth
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get the session to compare
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check if user exists in the users table
        let dbUser = null;
        let dbUserError = null;
        
        if (user) {
          const result = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          
          dbUser = result.data;
          dbUserError = result.error;
        }
        
        setUserInfo({
          authUser: user,
          session,
          dbUser,
          dbUserError
        });
      } catch (err: any) {
        setError(`Error fetching user info: ${err.message}`);
      }
    }
    
    fetchUserInfo();
  }, [supabase]);
  
  // Handle save project button click
  const handleSaveProject = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const saveResult = await saveProject(projectTitle, inputText, outputText);
      
      if (saveResult.success) {
        setSuccess(`Project saved successfully with ID: ${saveResult.projectId}`);
        
        // Fetch the saved project to verify
        await fetchProjects();
      } else {
        setError('Failed to save project');
      }
    } catch (err: any) {
      setError(`Error saving project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch projects
  const fetchProjects = async () => {
    try {
      // Get the current user first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No authenticated user found');
        return;
      }
      
      // Fetch the user's projects
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        setError(`Error fetching projects: ${fetchError.message}`);
        return;
      }
      
      setSavedProjects(data || []);
    } catch (err: any) {
      setError(`Error fetching projects: ${err.message}`);
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Project Save Test</h1>
      
      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current User Information</CardTitle>
        </CardHeader>
        <CardContent>
          {userInfo ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Auth User:</h3>
              {userInfo.authUser ? (
                <>
                  <p><strong>ID:</strong> {userInfo.authUser.id}</p>
                  <p><strong>Email:</strong> {userInfo.authUser.email}</p>
                </>
              ) : (
                <p className="text-red-500">No authenticated user found</p>
              )}
              
              <h3 className="text-lg font-semibold mt-4">Session Info:</h3>
              {userInfo.session ? (
                <p><strong>Session User ID:</strong> {userInfo.session.user?.id}</p>
              ) : (
                <p className="text-red-500">No active session found</p>
              )}
              
              <h3 className="text-lg font-semibold mt-4">Database User Record:</h3>
              {userInfo.dbUser ? (
                <>
                  <p><strong>ID:</strong> {userInfo.dbUser.id}</p>
                  <p><strong>Email:</strong> {userInfo.dbUser.email}</p>
                  <p><strong>Credits:</strong> {userInfo.dbUser.credits_remaining}</p>
                </>
              ) : (
                <p className="text-red-500">
                  {userInfo.dbUserError ? 
                    `Error: ${userInfo.dbUserError.message}` : 
                    'No matching user record found in database'}
                </p>
              )}
            </div>
          ) : (
            <p>Loading user information...</p>
          )}
        </CardContent>
      </Card>
      
      {/* Test Project Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Test Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="project-title" className="block text-sm font-medium mb-1">
                Project Title
              </label>
              <Input
                id="project-title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            
            <div>
              <label htmlFor="input-text" className="block text-sm font-medium mb-1">
                Input Text
              </label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter input text"
                rows={3}
              />
            </div>
            
            <div>
              <label htmlFor="output-text" className="block text-sm font-medium mb-1">
                Output Text
              </label>
              <Textarea
                id="output-text"
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder="Enter output text"
                rows={3}
              />
            </div>
            
            <Button
              onClick={handleSaveProject}
              disabled={loading || !projectTitle || !inputText || !outputText}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save Test Project'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Feedback Messages */}
      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {/* Saved Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Projects</CardTitle>
          <Button variant="outline" onClick={fetchProjects} disabled={loading}>
            Refresh Projects
          </Button>
        </CardHeader>
        <CardContent>
          {savedProjects.length > 0 ? (
            <div className="divide-y">
              {savedProjects.map((project) => (
                <div key={project.id} className="py-4">
                  <h3 className="text-lg font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-500">ID: {project.id}</p>
                  <p className="text-sm text-gray-500">User ID: {project.user_id}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(project.created_at).toLocaleString()}
                  </p>
                  <div className="mt-2 text-sm">
                    <p className="font-medium">Input:</p>
                    <p className="whitespace-pre-wrap line-clamp-2">{project.input_text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No projects found. Try saving one first.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
