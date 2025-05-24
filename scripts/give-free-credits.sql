-- Give 10 free credits to all users without subscriptions
-- This script updates all users with subscription_tier = 'free' to add 10 credits

-- First, let's see how many users would be affected
SELECT 
  'Users without subscription (before update)' as description,
  COUNT(*) as count,
  AVG(credits_remaining) as avg_credits_before
FROM public.users 
WHERE subscription_tier = 'free';

-- Update users without subscription to add 10 credits
UPDATE public.users 
SET 
  credits_remaining = credits_remaining + 10,
  updated_at = now()
WHERE subscription_tier = 'free';

-- Show the results after update
SELECT 
  'Users without subscription (after update)' as description,
  COUNT(*) as count,
  AVG(credits_remaining) as avg_credits_after
FROM public.users 
WHERE subscription_tier = 'free';

-- Show detailed breakdown
SELECT 
  subscription_tier,
  COUNT(*) as user_count,
  AVG(credits_remaining) as avg_credits,
  MIN(credits_remaining) as min_credits,
  MAX(credits_remaining) as max_credits
FROM public.users 
GROUP BY subscription_tier
ORDER BY subscription_tier;
