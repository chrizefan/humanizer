-- Debug script to check trigger function status
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check if the trigger function exists
SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check if the trigger exists
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check recent user records
SELECT 
    id,
    email,
    created_at,
    updated_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Check public.users table
SELECT 
    id,
    email,
    created_at,
    updated_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Test the trigger function manually
-- First, let's see what happens when we try to call it
DO $$
DECLARE
    test_id uuid := gen_random_uuid();
    test_email text := 'test@example.com';
BEGIN
    RAISE NOTICE 'Testing trigger function with ID: % and Email: %', test_id, test_email;
    
    -- Try to insert a test record
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (test_id, test_email, now(), now());
    
    RAISE NOTICE 'Manual insert successful';
    
    -- Clean up
    DELETE FROM public.users WHERE id = test_id;
    RAISE NOTICE 'Test cleanup completed';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;
