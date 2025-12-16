# 🗄️ Quick Guide: Get DATABASE_URL

## ⚡ Fastest Option: Vercel Postgres

### Step 1: Create Database in Vercel
1. In Vercel Dashboard, go to **Storage** tab (top navigation)
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Click **"Create"**
5. Wait 1-2 minutes for setup

### Step 2: Get Connection String
1. Once created, click on your database
2. Go to **".env.local"** tab
3. Copy the `POSTGRES_URL` value
4. Use it as `DATABASE_URL` in Environment Variables

**Example format:**
```
postgres://default:password@host.vercel-storage.com:5432/verceldb
```

---

## 🆓 Alternative: Supabase (Free)

1. Go to: https://supabase.com
2. Sign up (free)
3. Click **"New Project"**
4. Fill in:
   - Name: `rallly-project`
   - Database Password: (create a strong password)
   - Region: (choose closest)
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup
7. Go to **Settings** → **Database**
8. Scroll to **"Connection String"**
9. Copy **"URI"** format
10. Use as `DATABASE_URL`

---

## ✅ After Getting DATABASE_URL

1. Go back to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with the connection string you copied
3. Select all environments (Production, Preview, Development)
4. Click **"Save"**
5. Redeploy your project!

---

## 📋 Summary

**Easiest:** Use Vercel Postgres (Storage tab → Create Database)  
**Free Alternative:** Supabase (supabase.com → New Project)  
**Then:** Copy connection string → Add as `DATABASE_URL` in Vercel

