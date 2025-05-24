-- Improved trigger function with better error handling
-- Run this in your Supabase SQL Editor

-- Function to handle new user creation and auto-confirm email in development
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_exists BOOLEAN := FALSE;
BEGIN
  -- Check if user already exists in public.users table
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = NEW.id) INTO user_exists;
  
  -- Only insert if user doesn't already exist
  IF NOT user_exists THEN
    INSERT INTO public.users (id, email, credits_remaining, subscription_tier, created_at, updated_at)
    VALUES (
      NEW.id, 
      NEW.email, 
      10, 
      'free', 
      now(), 
      now()
    );
  END IF;
  
  -- Auto-confirm email in development mode
  IF NEW.raw_user_meta_data->>'confirm_email' = 'true' THEN
    UPDATE auth.users
    SET email_confirmed_at = now(),
        confirmed_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (in a real scenario, you might want to use a logging table)
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW; -- Still return NEW to not break the auth user creation
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the trigger function directly (this will show any immediate syntax errors)
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
