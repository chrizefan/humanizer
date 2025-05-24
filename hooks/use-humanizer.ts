import { useState, useCallback } from 'react';
import { useSupabaseAuth } from './use-supabase-auth';
import { useCredits } from './use-credits';

type HumanizeOptions = {
  text: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'formal';
  length?: 'short' | 'medium' | 'long';
  title?: string;
};

type HumanizeResponse = {
  success: boolean;
  output?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  projectId?: string;
  error?: string;
};

export function useHumanizer() {
  const { user } = useSupabaseAuth();
  const { fetchCredits } = useCredits();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // Humanize text
  const humanizeText = useCallback(
    async (options: HumanizeOptions): Promise<HumanizeResponse> => {
      if (!user) {
        const errorMsg = 'You must be signed in to humanize text';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!options.text || options.text.trim() === '') {
        const errorMsg = 'No text provided for humanization';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        setLoading(true);
        const response = await fetch('/api/humanize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to humanize text');
        }

        const data: HumanizeResponse = await response.json();

        if (data.success && data.output) {
          setResult(data.output);
          // Update credits after usage
          await fetchCredits();
          return data;
        } else {
          throw new Error(data.error || 'Failed to humanize text');
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to humanize text';
        setError(errorMsg);
        console.error('Error humanizing text:', err);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [user, fetchCredits]
  );

  return {
    humanizeText,
    result,
    loading,
    error,
  };
}
