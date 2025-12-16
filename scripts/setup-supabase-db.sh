#!/bin/bash

# Script to set up database on Supabase using Prisma
# Usage: ./scripts/setup-supabase-db.sh

set -e

echo "🚀 Setting up database on Supabase..."
echo ""
echo "This script will:"
echo "  1. Apply all Prisma migrations to create tables"
echo "  2. Create the demo user (demo@test.com / demo123)"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
    echo ""
    echo "Get your connection string from:"
    echo "  Supabase Dashboard → Settings → Database → Connection string"
    exit 1
fi

# Set DIRECT_DATABASE_URL if not set
if [ -z "$DIRECT_DATABASE_URL" ]; then
    export DIRECT_DATABASE_URL="$DATABASE_URL"
fi

cd "$(dirname "$0")/.."

echo "📦 Installing dependencies (if needed)..."
npx pnpm install --filter @rallly/database > /dev/null 2>&1 || true

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Would you like to create the demo user now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "👤 Creating demo user..."
    npx tsx scripts/create-demo-user.ts
    echo ""
    echo "✅ Demo user created!"
    echo "   Email: demo@test.com"
    echo "   Password: demo123"
fi

echo ""
echo "✨ Done! Your database is ready."
