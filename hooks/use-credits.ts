import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';

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

  // Fetch user credits
  const fetchCredits = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to view credits');
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await fetch('/api/credits');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch credits');
      }

      const data = await response.json();

      if (data.success) {
        setCredits(data.credits);
        setUsageStats(data.usageStats);
        return { success: true, credits: data.credits, usageStats: data.usageStats };
      } else {
        throw new Error(data.error || 'Failed to fetch credits');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch credits');
      console.error('Error fetching credits:', err);
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

