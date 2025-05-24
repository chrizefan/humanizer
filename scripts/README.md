# AI Humanizer - Database Setup & Testing

This directory contains scripts and tests for setting up and validating the Supabase database configuration.

## 📁 Directory Structure

```
scripts/
├── setup-database.sh          # Interactive setup script
├── trigger-only.sql           # Minimal migration (just adds trigger)
├── safe-migration.sql         # Complete safe migration
└── complete-migration.sql     # Original complete migration

tests/
├── auth-test-suite.js         # Comprehensive authentication tests
└── health-check.js            # Quick database health check
```

## 🚀 Quick Start

1. **Run the setup script** to get started:
   ```bash
   npm run db:setup
   ```

2. **Apply database migrations** by copying SQL from the scripts to your Supabase SQL Editor

3. **Test your setup**:
   ```bash
   npm run test:health    # Quick check
   npm run test:suite     # Full test suite
   ```

## 📝 Available Scripts

### Setup Scripts
- `npm run db:setup` - Interactive database setup wizard
- `npm run test:health` - Quick health check of database connectivity
- `npm run test:suite` - Comprehensive authentication and database test suite

### Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run lint` - Run ESLint

## 🔧 Migration Scripts

### 1. trigger-only.sql (Recommended)
Use this if your tables already exist but authentication is failing:
- Creates the `handle_new_user()` function
- Sets up the trigger for automatic user record creation
- Enables email auto-confirmation in development mode

### 2. safe-migration.sql (Complete Reset)
Use this for a fresh setup or if you want to reset everything:
- Creates all tables (users, projects, usage_logs)
- Sets up Row Level Security policies
- Creates the trigger function and trigger
- Handles existing objects gracefully

### 3. complete-migration.sql (Original)
The original migration script - use safe-migration.sql instead.

## 🧪 Testing

### Health Check
Quick validation that your database is accessible:
```bash
npm run test:health
```

**Output:**
- ✅ Supabase connection successful
- ✅ Table 'users': exists and accessible
- ✅ Table 'projects': exists and accessible
- ✅ Table 'usage_logs': exists and accessible

### Full Test Suite
Comprehensive testing of the entire authentication flow:
```bash
npm run test:suite
```

**Tests Include:**
- Database connectivity
- Table existence and accessibility
- Row Level Security validation
- Complete sign-up flow
- Email confirmation (auto-confirm in development)
- Sign-in validation
- User record creation in custom tables
- Sign-out functionality

## 🐛 Troubleshooting

### "Database error saving new user"
This error occurs when the trigger function is missing. Solution:
1. Run `npm run db:setup`
2. Choose option 1 (trigger-only migration)
3. Copy the SQL to your Supabase SQL Editor and run it
4. Test with `npm run test:suite`

### "Policy already exists" errors
Your database is partially set up. Use the safe migration:
1. Run `npm run db:setup`
2. Choose option 2 (safe migration)
3. This will safely handle existing objects

### Tables don't exist
You need to run the complete migration:
1. Run `npm run db:setup`
2. Choose option 2 (safe migration)
3. This will create all necessary tables and policies

## 🔐 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Email auto-confirmation is only enabled in development mode
- Production deployments should use proper email confirmation

## 📚 Next Steps

After successful setup:
1. Start the development server: `npm run dev`
2. Visit: http://localhost:3001/auth?signup=true
3. Create a test account
4. Verify authentication works correctly

For production deployment, disable email auto-confirmation and configure proper SMTP settings in your Supabase dashboard.
