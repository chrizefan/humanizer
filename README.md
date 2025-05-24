# Humanizer App

A Next.js application with Supabase backend for humanizing text.

## Features

- Authentication with Supabase Auth
- Credit-based usage system
- Project history and management
- Subscription tiers

## Setting Up Supabase Backend

This application uses Supabase for authentication, database, and storage. Follow these steps to set up your Supabase backend:

### Option 1: Using Supabase Cloud

1. Create a new project on [Supabase](https://app.supabase.com)
2. Get your project URL and API keys from the Supabase dashboard
3. Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run SQL migrations from the `/supabase/migrations` folder in the Supabase SQL Editor

### Option 2: Using Local Supabase

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Run the setup script:
   ```bash
   ./setup-supabase.sh
   ```
3. This will start a local Supabase instance and run migrations

## Database Schema

The application uses the following tables:

- `users`: Extended auth.users with credits and subscription info
- `projects`: Stores user humanization projects
- `usage_logs`: Tracks credit usage

## API Endpoints

- `/api/humanize`: Humanize text and consume credits
- `/api/projects`: List, create, update, and delete projects
- `/api/credits`: Get and purchase credits
- `/api/subscription`: Manage subscription tier

## Development

```bash
# Install dependencies
npm install

# Start Supabase locally (if using local setup)
supabase start

# Start development server
npm run dev
```

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/chrizefan/humanizer)