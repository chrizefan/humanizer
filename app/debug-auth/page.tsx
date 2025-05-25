"use client";

import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export default function AuthDebugPage() {
  const { user, loading } = useSupabaseAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [cookieDebug, setCookieDebug] = useState<any>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Test the credits API
        const creditsResponse = await fetch('/api/credits');
        const creditsData = await creditsResponse.json();
        
        // Test the debug cookies API
        const cookieResponse = await fetch('/api/debug-cookies');
        const cookieData = await cookieResponse.json();
        
        setApiResponse(creditsData);
        setCookieDebug(cookieData);
        
        // Also log client-side cookies for comparison
        console.log('Client-side document.cookie:', document.cookie);
        
      } catch (error) {
        console.error('API test error:', error);
      }
    };

    if (!loading) {
      testAPI();
    }
  }, [loading, user]); // Added user dependency to re-test when auth state changes

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Client-side Authentication State</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify({ 
              user: user ? { 
                id: user.id, 
                email: user.email, 
                email_confirmed_at: user.email_confirmed_at 
              } : null,
              isAuthenticated: !!user
            }, null, 2)}
          </pre>
          {user && (
            <div className="mt-2">
              <button 
                onClick={() => console.log('Document cookies:', document.cookie)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Log Cookies to Console
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Credits API Response</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Server-side Cookies Debug</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(cookieDebug, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
