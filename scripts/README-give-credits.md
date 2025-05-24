# Give Free Credits to Non-Subscribers

This guide explains how to give 10 free credits to all users who don't have a subscription (subscription_tier = 'free').

## Overview

The system provides multiple ways to execute this operation:

1. **API Endpoint** - Programmatic execution via HTTP request
2. **Direct SQL** - Execute SQL commands directly in Supabase
3. **Node.js Scripts** - Automated scripts for easy execution

## Methods

### Method 1: API Endpoint (Recommended)

Use the admin API endpoint to give credits:

```bash
# Make sure your app is running first
npm run dev

# Then call the API endpoint
curl -X POST http://localhost:3000/api/admin/give-credits
```

Or use the provided script:

```bash
node scripts/give-credits.js
```

### Method 2: Direct SQL Execution

Execute the SQL script directly in your Supabase SQL Editor:

```sql
-- File: scripts/give-free-credits.sql
UPDATE public.users 
SET 
  credits_remaining = credits_remaining + 10,
  updated_at = now()
WHERE subscription_tier = 'free';
```

### Method 3: Node.js Helper Function

Use the helper function in your code:

```javascript
import { giveFreeCreditsToNonSubscribers } from '@/lib/supabase';

// Give 10 credits to all free users
const result = await giveFreeCreditsToNonSubscribers(10);
console.log(`Updated ${result.usersUpdated} users`);
```

## Prerequisites

1. **Environment Variables**: Ensure you have the service role key configured:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Permissions**: The operation requires admin/service role permissions to update user records.

## Monitoring

### Check Current Status

Before running the operation, check current user credits:

```bash
node scripts/check-credits.js
```

This will show:
- Users by subscription tier
- Average credits per tier
- Min/max credits
- Total users and credits

### Verify Results

After running the operation, run the check script again to verify the changes.

## Safety Features

- ✅ Only updates users with `subscription_tier = 'free'`
- ✅ Additive operation (adds to existing credits, doesn't overwrite)
- ✅ Updates the `updated_at` timestamp
- ✅ Provides detailed feedback on operation results
- ✅ Error handling and rollback capabilities

## Example Output

```
🎁 Giving 10 free credits to users without subscriptions...
✅ Success!
📊 Successfully added 10 credits to 25 users without subscriptions
👥 Users updated: 25
💰 Average credits after update: 15.40
```

## Troubleshooting

### Common Issues

1. **Service Role Key Missing**
   - Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file
   - Get the key from your Supabase project settings

2. **Permission Denied**
   - Ensure the service role key has proper permissions
   - Check RLS policies on the users table

3. **No Users Updated**
   - Verify users exist with `subscription_tier = 'free'`
   - Check the database connection

### Error Messages

- `"Service role key not configured"` → Add the service role key to environment
- `"Failed to fetch free users"` → Database connection or permission issue
- `"X updates failed"` → Some individual updates failed, check logs

## Security Notes

- This operation uses service role permissions
- Only accessible via admin endpoints
- Logs all operations for audit purposes
- Does not expose sensitive user data in responses
