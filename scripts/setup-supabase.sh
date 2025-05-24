#!/bin/zsh

# Supabase Setup Script for Humanizer App
# This script will help set up your Supabase project for the Humanizer app.

echo "📦 Setting up Supabase for Humanizer App..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Installing..."
  brew install supabase/tap/supabase
fi

# Check for .env.local file
if [ ! -f .env.local ]; then
  echo "❌ No .env.local file found. Creating from template..."
  cp .env.example .env.local
  echo "⚠️ Please update .env.local with your Supabase credentials."
  echo "  You can find these in your Supabase project dashboard:"
  echo "  - Project URL: https://app.supabase.io/project/_/settings/api"
  echo "  - API Keys: https://app.supabase.io/project/_/settings/api"
  echo "  Then run this script again."
  exit 1
fi

# Start supabase
echo "🚀 Starting Supabase local development..."
supabase start

# Get the local Supabase URL and key
SUPABASE_URL=$(supabase status --output json | jq -r '.localServices[] | select(.name == "studio") | .url')
SUPABASE_KEY=$(supabase status --output json | jq -r '.localApiKey')

# Update .env.local with the local credentials if they're using placeholders
if grep -q "your-supabase-url" .env.local; then
  echo "📝 Updating .env.local with local Supabase credentials..."
  sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|g" .env.local
  sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY|g" .env.local
fi

# Apply migrations
echo "🔄 Applying database migrations..."
supabase db reset

echo "✅ Supabase setup complete!"
echo "📊 Supabase Studio: $SUPABASE_URL"
echo "🔑 API Key: $SUPABASE_KEY"
echo ""
echo "Next steps:"
echo "1. Start your Next.js app with 'npm run dev'"
echo "2. Visit your app at http://localhost:3000"
echo "3. Sign up for a new account to test the functionality"
