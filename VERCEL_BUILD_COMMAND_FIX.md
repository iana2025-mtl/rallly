# 🔧 Fix Vercel Build Command Issue

## 🚨 **Problem Found**

Your `vercel.json` has this build command:
```json
"buildCommand": "cd ../.. && pnpm db:generate && pnpm build:web && pnpm db:deploy"
```

The `pnpm db:deploy` step tries to connect to the database **during build**, which might be failing!

---

## ✅ **Solution: Modify Build Command**

### **Option 1: Skip Database Deploy During Build** (Recommended)

The database migrations should run **after** deployment, not during build.

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Build & Development Settings**

2. Find **"Build Command"**

3. Change it from:
   ```
   cd ../.. && pnpm db:generate && pnpm build:web && pnpm db:deploy
   ```
   
   To:
   ```
   cd ../.. && pnpm db:generate && pnpm build:web
   ```
   
   (Remove `&& pnpm db:deploy`)

4. Click **"Save"**

5. **Redeploy**

---

### **Option 2: Use Environment Variable to Skip Deploy**

Add this variable:
- **Key:** `SKIP_DB_DEPLOY`
- **Value:** `true`
- **Environments:** Production, Preview, Development

Then modify the build command to:
```
cd ../.. && pnpm db:generate && pnpm build:web && ([ "$SKIP_DB_DEPLOY" = "true" ] || pnpm db:deploy)
```

---

## 🎯 **Why This Fails**

The `pnpm db:deploy` command:
- Tries to connect to database during build
- Requires database to be accessible from Vercel's build servers
- Might fail if database has connection limits or IP restrictions

**Solution:** Run migrations **after** deployment, not during build.

---

## 📋 **Quick Fix Steps**

1. Go to **Vercel** → **Settings** → **Build & Development Settings**
2. Find **"Build Command"**
3. Change to: `cd ../.. && pnpm db:generate && pnpm build:web`
4. **Remove:** `&& pnpm db:deploy`
5. Click **"Save"**
6. **Redeploy**

---

## ✅ **After Fixing**

The build should:
1. ✅ Generate Prisma client (`db:generate`)
2. ✅ Build the app (`build:web`)
3. ❌ Skip database deploy (do it manually later if needed)

**The build should succeed now!** 🚀

---

## 💡 **Note**

Database migrations (`db:deploy`) can be run:
- Manually after deployment
- Via Vercel's post-deploy hooks
- Or set up a separate migration job

**For now, skip it during build to get the app deployed!**



