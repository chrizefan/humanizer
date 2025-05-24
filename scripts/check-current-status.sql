-- Quick check to see current trigger status
-- Run this in Supabase SQL Editor to see what's currently installed

SELECT 'Current Trigger Function Status' as info;

-- Check if function exists
SELECT 
    'Function' as component,
    proname as name,
    CASE WHEN proname IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
UNION ALL
SELECT 
    'Trigger' as component,
    tgname as name,
    CASE WHEN tgname IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Show recent auth users (last 5)
SELECT 'Recent Auth Users (last 5)' as info;
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Show recent public users (last 5)
SELECT 'Recent Public Users (last 5)' as info;
SELECT 
    id,
    email,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
