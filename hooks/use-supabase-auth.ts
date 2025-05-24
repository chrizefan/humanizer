import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          setError(error.message);
        } else {
          setUser(user);
        }
      } catch (err) {
        setError('Failed to fetch user');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for common error messages and provide more user-friendly errors
        if (error.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please confirm your email address before signing in. Check your inbox for a confirmation link.',
            isEmailConfirmationError: true
          };
        }
        
        if (error.message.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: 'Invalid email or password. Please check your credentials and try again.'
          };
        }
        
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to sign in';
      setError(errorMessage);
      console.error('Error signing in:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      // For development, disable email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // In development, we'll auto-confirm emails
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // This data will trigger the server-side function to auto-confirm in development
          data: {
            confirm_email: process.env.NODE_ENV === 'development' ? 'true' : 'false'
          }
        }
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // In development mode, the email should be auto-confirmed
      if (process.env.NODE_ENV === 'development') {
        // Check if user was created successfully
        if (data.user) {
          return { 
            success: true, 
            emailConfirmationRequired: false,
            message: "Account created successfully!"
          };
        }
      }

      // Check if email confirmation is required and wasn't auto-confirmed
      if (data?.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          emailConfirmationRequired: true,
          message: "Check your email for the confirmation link."
        };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to sign up';
      setError(errorMessage);
      console.error('Error signing up:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = 'Failed to sign out';
      setError(errorMessage);
      console.error('Error signing out:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { 
        success: true,
        message: "Password reset instructions sent to your email."
      };
    } catch (err) {
      const errorMessage = 'Failed to reset password';
      setError(errorMessage);
      console.error('Error resetting password:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
