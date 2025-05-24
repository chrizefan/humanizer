-- Create a function to give credits to users without subscriptions
CREATE OR REPLACE FUNCTION give_credits_to_free_users(credit_amount INTEGER DEFAULT 10)
RETURNS TABLE(updated_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Update all users with subscription_tier = 'free' to add credits
  UPDATE public.users 
  SET 
    credits_remaining = credits_remaining + credit_amount,
    updated_at = now()
  WHERE subscription_tier = 'free';
  
  -- Get the count of affected rows
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  -- Return the count
  RETURN QUERY SELECT updated_rows;
END;
$$;
