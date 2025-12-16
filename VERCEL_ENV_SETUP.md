# 🔐 Vercel Environment Variables Setup Guide

## ⚠️ **IMPORTANT: Do NOT Copy All Three Files**

**You should NOT copy all three `.env` files directly into Vercel.**

Here's why:
- `.env` and `.env.development` contain **localhost URLs** (won't work in production)
- `.env.test` is for testing only
- Some variables are **optional** (you don't need all of them)
- You need **production-ready values** (not localhost)

---

## ✅ **What You SHOULD Do**

### Step 1: Identify Required Variables

For a **basic school project deployment**, you need these **REQUIRED** variables:

#### 🔴 **REQUIRED (Must Have):**

1. **`DATABASE_URL`**
   - **What it is:** PostgreSQL database connection string
   - **For Vercel:** You need a production database (not localhost)
   - **Options:**
     - Use Vercel Postgres (recommended for school projects)
     - Use a free service like Supabase, Neon, or Railway
   - **Example:** `postgres://user:password@host:5432/database`

2. **`SECRET_PASSWORD`**
   - **What it is:** 32+ character secret key for encryption
   - **Action:** Generate a new random 32+ character string
   - **Example:** `abcdef1234567890abcdef1234567890` (but use a different random one!)

3. **`NEXT_PUBLIC_BASE_URL`**
   - **What it is:** Your Vercel deployment URL
   - **For Vercel:** Use your actual Vercel URL
   - **Example:** `https://ralllyproject.vercel.app` or `https://ralllyproject-git-main-ianas-projects-1053c2ee.vercel.app`

4. **`SUPPORT_EMAIL`**
   - **What it is:** Support email address
   - **For school project:** Use your email or a placeholder
   - **Example:** `support@example.com` or `your-email@school.edu`

---

#### 🟡 **OPTIONAL (Only if you need these features):**

5. **`OPENAI_API_KEY`** (For AI Time Suggestions)
   - **What it is:** OpenAI API key for AI features
   - **Only needed if:** You want AI time suggestions to work
   - **How to get:** Create an account at OpenAI and get an API key
   - **Example:** `sk-...`

6. **Email Configuration** (Only if you need email features)
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PWD`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - **Note:** For a school project, you might skip email features

7. **OAuth Providers** (Only if you need Google/Microsoft login)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`
   - **Note:** For a school project, you might skip OAuth

---

## 📝 **Step-by-Step: Setting Up in Vercel**

### Option A: Use "Import .env" Button (Easier)

1. **Create a new `.env.production` file locally** with only the required variables:

```bash
# Create a production-ready .env file
cat > .env.production << 'EOF'
# REQUIRED - Replace with your actual values
DATABASE_URL=postgres://user:password@host:5432/database
SECRET_PASSWORD=your-32-character-random-secret-here
NEXT_PUBLIC_BASE_URL=https://ralllyproject.vercel.app
SUPPORT_EMAIL=support@example.com

# OPTIONAL - Only if you need AI features
OPENAI_API_KEY=sk-your-openai-key-here
EOF
```

2. **In Vercel:**
   - Click **"Import .env"** button
   - Select your `.env.production` file
   - Vercel will automatically parse and add all variables

3. **Review and adjust:**
   - Check that all values are correct
   - Update `DATABASE_URL` with your actual production database
   - Update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL
   - Generate a new `SECRET_PASSWORD`

---

### Option B: Add Variables Manually (More Control)

1. **In Vercel Environment Variables page:**
   - Select **"Production"** from the "All Environments" dropdown
   - Click **"+ Add Another"** for each variable

2. **Add each required variable:**

   | Key | Value | Notes |
   |-----|-------|-------|
   | `DATABASE_URL` | `postgres://...` | Your production database URL |
   | `SECRET_PASSWORD` | `[32+ chars]` | Generate a random secret |
   | `NEXT_PUBLIC_BASE_URL` | `https://ralllyproject.vercel.app` | Your Vercel URL |
   | `SUPPORT_EMAIL` | `support@example.com` | Your email |

3. **If you need AI features, also add:**
   - `OPENAI_API_KEY` = `sk-...`

4. **Click "Save"** at the bottom

---

## 🔍 **What to Change from Local Files**

### ❌ **DO NOT Copy These (Localhost URLs):**
```bash
# These won't work in production:
NEXT_PUBLIC_BASE_URL=http://localhost:3000  ❌
AUTH_URL=http://localhost:3000              ❌
DATABASE_URL=postgres://...@localhost:5450  ❌
```

### ✅ **DO Use Production Values:**
```bash
# Use your actual Vercel URL:
NEXT_PUBLIC_BASE_URL=https://ralllyproject.vercel.app  ✅
AUTH_URL=https://ralllyproject.vercel.app             ✅

# Use your production database:
DATABASE_URL=postgres://user:pass@prod-host:5432/db   ✅
```

---

## 🎯 **Minimum Setup for School Project**

For a **basic school project**, you only need these 4 variables:

```bash
DATABASE_URL=postgres://...
SECRET_PASSWORD=abcdef1234567890abcdef1234567890
NEXT_PUBLIC_BASE_URL=https://ralllyproject.vercel.app
SUPPORT_EMAIL=your-email@school.edu
```

**That's it!** Everything else is optional.

---

## 🚀 **After Setting Variables**

1. **Redeploy your app** in Vercel (or it will auto-redeploy)
2. **Wait for deployment to complete**
3. **Test your app** at your Vercel URL
4. **Check logs** if something doesn't work

---

## 🔐 **Security Notes**

- ✅ **Never commit `.env` files to git** (they're already in `.gitignore`)
- ✅ **Use Vercel's environment variables** for secrets
- ✅ **Generate a new `SECRET_PASSWORD`** (don't use the example one)
- ✅ **Keep your `OPENAI_API_KEY` secret** (if you use it)

---

## 📋 **Quick Checklist**

- [ ] Set `DATABASE_URL` (production database)
- [ ] Set `SECRET_PASSWORD` (32+ random characters)
- [ ] Set `NEXT_PUBLIC_BASE_URL` (your Vercel URL)
- [ ] Set `SUPPORT_EMAIL` (your email)
- [ ] (Optional) Set `OPENAI_API_KEY` (if using AI features)
- [ ] Click "Save" in Vercel
- [ ] Wait for redeployment
- [ ] Test your app

---

## ❓ **Common Questions**

**Q: Do I need all the variables from `.env`?**  
A: No! Only the required ones. Most are optional.

**Q: Can I use localhost URLs?**  
A: No! Use your actual Vercel URL and production database.

**Q: What if I don't have a database?**  
A: You need one. Use Vercel Postgres, Supabase, Neon, or Railway (all have free tiers).

**Q: Do I need email configuration?**  
A: Only if you need email features. For a school project, you might skip it.

**Q: What about the test file?**  
A: Ignore `.env.test` - it's only for local testing.

---

## 🎓 **Summary**

**For your school project:**
1. ✅ Use **only required variables** (4 minimum)
2. ✅ Use **production values** (not localhost)
3. ✅ Use **"Import .env"** button OR add manually
4. ✅ **Generate new secrets** (don't copy local ones)
5. ✅ **Save and redeploy**

**You're all set!** 🚀



