#!/bin/bash

# AI Humanizer - Supabase Database Setup Script
# This script helps you set up the database schema for the AI Humanizer application

set -e  # Exit on any error

echo "🚀 AI Humanizer - Database Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Database Setup Options:${NC}"
echo ""
echo "1. 🔧 Apply minimal trigger fix (recommended if tables exist)"
echo "2. 🔄 Apply complete safe migration (resets policies)"
echo "3. 🏥 Run health check only"
echo "4. 🧪 Run full test suite"
echo "5. ❌ Exit"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}📁 Opening trigger-only migration...${NC}"
        echo ""
        echo "📝 Copy and paste this SQL into your Supabase SQL Editor:"
        echo "   https://supabase.com/dashboard/project/uqmmhuqdbmoqaebohbwm/sql"
        echo ""
        echo "🔗 Migration file: $(pwd)/scripts/trigger-only.sql"
        echo ""
        cat scripts/trigger-only.sql
        echo ""
        echo -e "${GREEN}✅ After running the SQL, test with: npm run test:suite${NC}"
        ;;
    2)
        echo -e "${YELLOW}📁 Opening complete safe migration...${NC}"
        echo ""
        echo "📝 Copy and paste this SQL into your Supabase SQL Editor:"
        echo "   https://supabase.com/dashboard/project/uqmmhuqdbmoqaebohbwm/sql"
        echo ""
        echo "🔗 Migration file: $(pwd)/scripts/safe-migration.sql"
        echo ""
        cat scripts/safe-migration.sql
        echo ""
        echo -e "${GREEN}✅ After running the SQL, test with: npm run test:suite${NC}"
        ;;
    3)
        echo -e "${BLUE}🏥 Running health check...${NC}"
        npm run test:health
        ;;
    4)
        echo -e "${BLUE}🧪 Running full test suite...${NC}"
        npm run test:suite
        ;;
    5)
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option. Please choose 1-5.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📚 Available Commands:${NC}"
echo "  npm run db:setup     - Run this setup script"
echo "  npm run test:health  - Quick database health check"
echo "  npm run test:suite   - Complete authentication test suite"
echo "  npm run dev          - Start development server"
echo ""
