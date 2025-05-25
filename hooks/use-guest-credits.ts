import { useState, useEffect, useCallback } from 'react';

const GUEST_CREDITS_KEY = 'guest-credits';
const INITIAL_GUEST_CREDITS = 3;

export function useGuestCredits() {
  const [guestCredits, setGuestCredits] = useState<number>(INITIAL_GUEST_CREDITS);

  // Load guest credits from localStorage on mount
  useEffect(() => {
    const storedCredits = localStorage.getItem(GUEST_CREDITS_KEY);
    if (storedCredits !== null) {
      const credits = parseInt(storedCredits, 10);
      setGuestCredits(isNaN(credits) ? INITIAL_GUEST_CREDITS : credits);
    }
  }, []);

  // Save guest credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(GUEST_CREDITS_KEY, guestCredits.toString());
  }, [guestCredits]);

  // Use a guest credit
  const useGuestCredit = useCallback(() => {
    setGuestCredits(prev => Math.max(0, prev - 1));
  }, []);

  // Reset guest credits (for development/testing)
  const resetGuestCredits = useCallback(() => {
    setGuestCredits(INITIAL_GUEST_CREDITS);
  }, []);

  return {
    guestCredits,
    useGuestCredit,
    resetGuestCredits,
    hasGuestCredits: guestCredits > 0,
  };
}
