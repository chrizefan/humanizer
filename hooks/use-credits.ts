import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { getUserCredits } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

type UsageStats = {
  totalCreditsUsed: number;
  creditsRemaining: number;
  subscriptionTier: string;
};

export function useCredits() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  // Fetch user credits with fallback to client-side
  const fetchCredits = useCallback(async () => {
    if (!user) {
      console.log('useCredits: No user found, setting error');
      setError('You must be signed in to view credits');
      return { success: false };
    }

    console.log('useCredits: Fetching credits for user:', user.email);

    try {
      setLoading(true);
      
      // First try the API route with authentication
      console.log('useCredits: Trying API route...');
      
      // Get the current session to include the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('useCredits: No session found, skipping API call');
        throw new Error('No valid session found');
      }
      
      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('useCredits: API response status:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('useCredits: API success response:', data);

        if (data.success) {
          setCredits(data.credits);
          setUsageStats(data.usageStats);
          console.log('useCredits: Set credits to:', data.credits);
          return { success: true, credits: data.credits, usageStats: data.usageStats };
        }
      }
      
      // If API fails, try client-side fallback
      console.log('useCredits: API failed, trying client-side fallback...');
      const clientCredits = await getUserCredits();
      console.log('useCredits: Client-side credits:', clientCredits);
      
      if (clientCredits >= 0) {
        setCredits(clientCredits);
        setUsageStats({
          totalCreditsUsed: 0,
          creditsRemaining: clientCredits,
          subscriptionTier: 'free'
        });
        console.log('useCredits: Set credits from client-side to:', clientCredits);
        return { 
          success: true, 
          credits: clientCredits, 
          usageStats: {
            totalCreditsUsed: 0,
            creditsRemaining: clientCredits,
            subscriptionTier: 'free'
          }
        };
      }
      
      throw new Error('Failed to fetch credits from both API and client-side');
      
    } catch (err: any) {
      console.error('useCredits: Exception caught:', err);
      setError(err.message || 'Failed to fetch credits');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Purchase credits
  const purchaseCredits = useCallback(
    async (amount: number) => {
      if (!user) {
        setError('You must be signed in to purchase credits');
        return { success: false };
      }

      if (!amount || amount <= 0) {
        setError('Invalid credit amount');
        return { success: false, error: 'Invalid credit amount' };
      }

      try {
        setLoading(true);
        const response = await fetch('/api/credits/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to purchase credits');
        }

        const data = await response.json();

        if (data.success) {
          // Update local state with new balance
          setCredits(data.newBalance);
          // Refresh all credit information
          await fetchCredits();
          return { success: true, newBalance: data.newBalance };
        } else {
          throw new Error(data.error || 'Failed to purchase credits');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to purchase credits');
        console.error('Error purchasing credits:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user, fetchCredits]
  );

  // Update subscription tier
  const updateSubscription = useCallback(
    async (tier: string, creditsToAdd: number = 0) => {
      if (!user) {
        setError('You must be signed in to update subscription');
        return { success: false };
      }

      try {
        setLoading(true);
        const response = await fetch('/api/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier, creditsToAdd }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update subscription');
        }

        const data = await response.json();

        if (data.success) {
          // Refresh credit information after subscription change
          await fetchCredits();
          return { success: true };
        } else {
          throw new Error(data.error || 'Failed to update subscription');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update subscription');
        console.error('Error updating subscription:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [user, fetchCredits]
  );

  return {
    credits,
    usageStats,
    loading,
    error,
    fetchCredits,
    purchaseCredits,
    updateSubscription,
  };
}

