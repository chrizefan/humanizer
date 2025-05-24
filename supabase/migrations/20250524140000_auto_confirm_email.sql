-- Enable auto-confirmation for development purposes
-- This is triggered when the user signs up with the 'confirm_email' flag set to true in the user metadata
-- IMPORTANT: This should be disabled in production!

CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if we're in development mode based on custom metadata
  IF NEW.raw_user_meta_data->>'confirm_email' = 'true' THEN
    -- Automatically confirm the user's email
    UPDATE auth.users
    SET email_confirmed_at = now(),
        confirmed_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_email();
