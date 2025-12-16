# Setting Up Database on Supabase

## Option 1: Use Prisma Migrations (Recommended)

1. **Get your Supabase Database URL:**
   - Go to Supabase Dashboard → Settings → Database
   - Copy the "Connection string" under "Connection pooling" or "Direct connection"
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

2. **Set up environment variable:**
   ```bash
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   export DIRECT_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Run Prisma migrations:**
   ```bash
   cd rallly-app
   npx prisma migrate deploy
   ```

This will apply all migrations to create all tables, indexes, and relationships.

## Option 2: Manual SQL (If migrations don't work)

If you prefer to run SQL directly in Supabase SQL Editor, see `setup-database-manual.sql` file.

## After Setup

Once tables are created, you can create the demo user by running:
```bash
npx tsx scripts/create-demo-user.ts
```

Make sure DATABASE_URL is set in your environment before running the script.
