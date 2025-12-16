# Quick Setup Guide for Supabase Database

## Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Under **URI**, copy the connection string
   - It looks like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - Or use the direct connection: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

## Step 2: Set Up Environment Variable

In your terminal:

```bash
cd rallly-app
export DATABASE_URL="[paste your connection string here]"
export DIRECT_DATABASE_URL="$DATABASE_URL"
```

**Important:** Replace `[password]` in the URL with your actual database password if it shows `[YOUR-PASSWORD]`.

## Step 3: Run Database Migrations

This will create all the tables:

```bash
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
```

Or use the setup script:

```bash
./scripts/setup-supabase-db.sh
```

## Step 4: Create Demo User (Optional)

```bash
export DATABASE_URL="[your connection string]"
npx tsx scripts/create-demo-user.ts
```

This creates:
- Email: `demo@test.com`
- Password: `demo123`

## Alternative: Using Prisma DB Push (Simpler, but resets on schema changes)

If migrations don't work, you can use:

```bash
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

**Note:** `db push` syncs your schema directly but doesn't track migrations. For production, use `migrate deploy`.

## Troubleshooting

- **Connection refused**: Make sure you're using the correct connection string and password
- **SSL required**: Add `?sslmode=require` to your DATABASE_URL
- **Permission denied**: Make sure your database password is correct

## Verify Tables Were Created

After running migrations, check in Supabase:
1. Go to **Table Editor**
2. You should see tables like: `users`, `accounts`, `polls`, `spaces`, etc.
