import { useState } from 'react';
import type { HumanizeRequest, HumanizeResponse } from '@/types';

export function useHumanizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const humanize = async (request: HumanizeRequest): Promise<HumanizeResponse> => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to humanize text'
        };
      }

      const result: HumanizeResponse = await response.json();
      return result;
    } catch (error) {
      setProgress(0);
      console.error('Humanization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000); // Reset progress after a delay
    }
  };

  return {
    humanize,
    isLoading,
    progress
  };
}