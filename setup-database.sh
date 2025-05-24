#!/bin/bash

echo "🚀 Setting up Supabase for AI Humanizer..."
echo ""

# Check if user has applied the database migrations
echo "⚠️  IMPORTANT: Database Setup Required"
echo ""
echo "Please follow these steps to complete the setup:"
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/uqmmhuqdbmoqaebohbwm/sql"
echo ""
echo "2. Copy the SQL migration from:"
echo "   $(pwd)/complete-migration.sql"
echo ""
echo "3. Paste it into the SQL Editor and run it"
echo ""
echo "4. After running the migration, test the setup:"
echo "   npm run test:auth"
echo ""

# Check if the database is accessible
echo "Testing database connection..."
node test-db.js

echo ""
echo "📋 Next Steps:"
echo "1. Apply the database migration (see instructions above)"
echo "2. Test the authentication flow: npm run test:auth"
echo "3. Start the development server: npm run dev"
echo "4. Visit http://localhost:3001/auth?signup=true to test signup"
echo ""
