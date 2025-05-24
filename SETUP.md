# AI Humanizer - Setup Guide

## 🎯 Quick Start

This project has been fully organized with a comprehensive setup and testing system. Follow these steps to get started:

### 1. Database Setup
```bash
npm run db:setup
```
This will launch an interactive wizard with the following options:
- **Option 1**: Apply minimal trigger fix (recommended if tables exist)
- **Option 2**: Apply complete safe migration (for fresh setup)
- **Option 3**: Run health check only
- **Option 4**: Run full test suite

### 2. Quick Health Check
```bash
npm run test:health
```
Verifies database connectivity and table accessibility.

### 3. Comprehensive Testing
```bash
npm run test:suite
```
Runs the complete authentication and database test suite.

## 📁 Organized Structure

### Scripts Directory (`/scripts/`)
- `setup-database.sh` - Interactive setup wizard
- `trigger-only.sql` - Minimal migration (just adds trigger)
- `safe-migration.sql` - Complete safe migration
- `complete-migration.sql` - Original migration script
- `README.md` - Detailed documentation

### Tests Directory (`/tests/`)
- `auth-test-suite.js` - Comprehensive authentication tests
- `health-check.js` - Quick database health checker

## 🧪 Test Results Overview

The test suite validates:
- ✅ Database connectivity
- ✅ Table existence and accessibility
- ✅ Row Level Security configuration
- ✅ Complete authentication flow (sign-up, sign-in, user creation)

## 🛠️ Available Commands

### Database & Testing
- `npm run db:setup` - Interactive database setup
- `npm run test:health` - Quick health check
- `npm run test:suite` - Full test suite
- `npm run test:auth` - Authentication tests (same as test:suite)

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Supabase Local
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset local database

## 🚨 Troubleshooting

### "Database error saving new user"
This indicates the trigger function is missing:
1. Run `npm run db:setup`
2. Choose option 1 (trigger-only migration)
3. Copy the SQL to your Supabase SQL Editor
4. Run the SQL in Supabase
5. Test with `npm run test:suite`

### Tables don't exist
You need the complete migration:
1. Run `npm run db:setup`
2. Choose option 2 (safe migration)
3. Apply the SQL in your Supabase SQL Editor

## 📚 Documentation

For detailed information, see:
- `/scripts/README.md` - Complete setup documentation
- `/docs/supabase-architecture.md` - Architecture overview

## ✅ What's Been Cleaned Up

This organization replaced scattered test files with a structured system:
- ❌ Removed: `check-db.js`, `quick-test.js`, `test-db.js`, `test-auth-flow.js`
- ✅ Added: Organized `/scripts/` and `/tests/` directories
- ✅ Added: Interactive setup script with colored output
- ✅ Added: Comprehensive test suite with detailed reporting
- ✅ Added: Health check for quick validation
- ✅ Added: Complete documentation and troubleshooting guides

## 🎉 Success Criteria

When everything is set up correctly:
- `npm run test:health` shows all ✅ green checkmarks
- `npm run test:suite` shows 100% success rate
- Authentication flow works end-to-end
- User records are automatically created in the database
