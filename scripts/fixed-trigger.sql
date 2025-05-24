-- Fixed trigger function for handle_new_user
-- This version handles common issues that cause 500 errors
-- Run this in your Supabase SQL Editor

-- First, let's drop the existing trigger and function to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function with proper error handling and simpler logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user record into public.users table
  -- Use ON CONFLICT to handle duplicate insertions gracefully
  INSERT INTO public.users (id, email, credits_remaining, subscription_tier)
  VALUES (NEW.id, NEW.email, 10, 'free')
  ON CONFLICT (id) DO NOTHING;
  
  -- Auto-confirm email in development mode (safer approach)
  IF NEW.raw_user_meta_data IS NOT NULL AND 
     NEW.raw_user_meta_data->>'confirm_email' = 'true' THEN
    UPDATE auth.users
    SET email_confirmed_at = NOW(),
        confirmed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Test that the function was created successfully
SELECT 
  proname AS function_name,
  proowner::regrole AS owner,
  prosecdef AS security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Test that the trigger was created successfully  
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
