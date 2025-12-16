# 🎯 How to Change Vercel Production Branch

## ⚠️ **Important: Deploy Hooks ≠ Production Branch**

**Deploy Hooks** are for manually triggering deployments via webhooks.  
**Production Branch** is what Vercel automatically deploys from.

**You need to change the Production Branch, NOT create a deploy hook.**

---

## ✅ **Correct Steps: Change Production Branch**

### **Step 1: Navigate to Git Settings**

1. Go to: **https://vercel.com/dashboard**
2. Click on your project: **`ralllyproject`**
3. Click the **"Settings"** tab (top navigation)
4. In the left sidebar, click **"Git"** (under "Configuration")

### **Step 2: Find Production Branch Setting**

Look for a section called **"Production Branch"** or **"Branch"**.

You should see:
- Current production branch: `main`
- A dropdown or input field to change it

### **Step 3: Change to Your Feature Branch**

1. Click on the branch dropdown/field
2. Select or type: `feature/ai-time-suggestions-hobby-finalize`
3. Click **"Save"** or **"Update"**

### **Step 4: Redeploy**

After saving:
- Vercel will automatically trigger a new deployment
- OR go to **"Deployments"** tab and click **"Redeploy"**

---

## 📍 **Where to Find It (Visual Guide)**

```
Vercel Dashboard
  └─ Your Project (ralllyproject)
      └─ Settings Tab
          └─ Git (left sidebar)
              └─ Production Branch ← CHANGE THIS
```

**NOT:**
- ❌ Deploy Hooks (different feature)
- ❌ Environment Variables
- ❌ General Settings

---

## 🔍 **What You're Looking For**

The Production Branch setting should look like one of these:

**Option A: Dropdown**
```
Production Branch
[main ▼]
```

**Option B: Input Field**
```
Production Branch
[main                    ]
```

**Option C: Text with Edit Button**
```
Production Branch: main [Edit]
```

---

## ⚠️ **If You Can't Find It**

Some Vercel projects might not show this option if:
- The project is connected to a specific branch only
- You need to disconnect and reconnect the Git repository

**Alternative Solution:**
1. Go to **Settings** → **General**
2. Scroll down to **"Git Repository"**
3. Click **"Disconnect"**
4. Reconnect and select your feature branch during setup

---

## 🎯 **Quick Answer**

**NO, don't change it in Deploy Hooks.**

**YES, change it in:**
- **Settings** → **Git** → **Production Branch**

Change from `main` to `feature/ai-time-suggestions-hobby-finalize`

---

## ✅ **After Changing**

1. Vercel will redeploy automatically
2. Wait 2-5 minutes
3. Visit: `https://ralllyproject.vercel.app/`
4. Should redirect to `/en` and show your app (not Next.js boilerplate)

---

## 📋 **Summary**

| Location | What It Does | Should You Change? |
|----------|-------------|-------------------|
| **Settings → Git → Production Branch** | Determines which branch Vercel deploys from | ✅ **YES - Change this** |
| **Deploy Hooks** | Creates webhook URLs for manual triggers | ❌ No - Not needed |

**Change the Production Branch, not the Deploy Hook!** 🎯

