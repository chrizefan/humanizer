-- COMPREHENSIVE TRIGGER REPAIR SCRIPT
-- This script will completely rebuild the trigger system for user creation
-- Apply this in your Supabase SQL Editor

-- ============================================
-- STEP 1: Complete Cleanup
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- STEP 2: Recreate Function with Full Permissions
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    insert_result RECORD;
BEGIN
    -- Log trigger execution for debugging
    RAISE LOG 'Trigger executing for user ID: %, Email: %', NEW.id, NEW.email;
    
    -- Ensure we have required data
    IF NEW.id IS NULL OR NEW.email IS NULL THEN
        RAISE LOG 'Missing required data - ID: %, Email: %', NEW.id, NEW.email;
        RETURN NEW;
    END IF;
    
    -- Insert the user record with proper conflict handling
    BEGIN
        INSERT INTO public.users (
            id,
            email,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.created_at, NOW()),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW()
        RETURNING * INTO insert_result;
        
        RAISE LOG 'Successfully created/updated user record for: % with ID: %', NEW.email, NEW.id;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Log detailed error information
            RAISE LOG 'Error in handle_new_user for user %: SQLSTATE=%, SQLERRM=%', NEW.email, SQLSTATE, SQLERRM;
            -- Don't fail the auth operation, just log the error
    END;
    
    RETURN NEW;
END;
$$;

-- ============================================
-- STEP 3: Grant All Necessary Permissions
-- ============================================

-- Grant execute permissions to all relevant roles
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Ensure the function owner has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================
-- STEP 4: Create the Trigger
-- ============================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Verify Installation
-- ============================================

-- Check function exists
SELECT 
    'Function Status' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check trigger exists and is enabled
SELECT 
    'Trigger Status' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgenabled = 'O'
    ) THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status;

-- Show trigger details
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE tgenabled 
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        ELSE 'UNKNOWN'
    END as status,
    CASE tgtype & 1
        WHEN 1 THEN 'ROW'
        ELSE 'STATEMENT'
    END as level,
    CASE tgtype & 66
        WHEN 2 THEN 'BEFORE'
        WHEN 64 THEN 'INSTEAD OF'
        ELSE 'AFTER'
    END as timing,
    CASE tgtype & 28
        WHEN 4 THEN 'INSERT'
        WHEN 8 THEN 'DELETE'
        WHEN 16 THEN 'UPDATE'
        WHEN 12 THEN 'INSERT OR DELETE'
        WHEN 20 THEN 'INSERT OR UPDATE'
        WHEN 24 THEN 'DELETE OR UPDATE'
        WHEN 28 THEN 'INSERT OR DELETE OR UPDATE'
        ELSE 'UNKNOWN'
    END as events
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================
-- STEP 6: Test the Trigger (Optional Manual Test)
-- ============================================

-- You can uncomment and run this to manually test:
/*
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_email text := 'manual-test-' || extract(epoch from now()) || '@test.com';
    user_count integer;
BEGIN
    RAISE NOTICE 'Testing trigger with email: %', test_email;
    
    -- Simulate auth user insert (this would normally be done by Supabase Auth)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        aud,
        role
    ) VALUES (
        test_user_id,
        '00000000-0000-0000-0000-000000000000',
        test_email,
        crypt('test-password', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated'
    );
    
    -- Check if trigger created public.users record
    SELECT COUNT(*) INTO user_count 
    FROM public.users 
    WHERE id = test_user_id;
    
    IF user_count > 0 THEN
        RAISE NOTICE '✅ Trigger test PASSED - User record created in public.users';
    ELSE
        RAISE NOTICE '❌ Trigger test FAILED - No user record found in public.users';
    END IF;
    
    -- Cleanup
    DELETE FROM public.users WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Test cleanup completed';
END $$;
*/
