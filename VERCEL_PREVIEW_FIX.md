# 🔧 Fix: Vercel Preview Shows Next.js Home Page

## 🚨 The Problem

When you click the Vercel preview link, you see:
- ❌ Next.js default home page
- ❌ Not the Rallly app
- ❌ Your changes aren't visible

## ✅ The Solution

**Add `/en` to the end of the Vercel URL!**

---

## 📝 Step-by-Step Fix

### Step 1: Get Your Vercel URL

From your PR or Vercel dashboard, you have a URL like:
```
https://rallly-xxx-iana2025-mtl.vercel.app
```

### Step 2: Add `/en` to the End

**Change this:**
```
https://rallly-xxx-iana2025-mtl.vercel.app
```

**To this:**
```
https://rallly-xxx-iana2025-mtl.vercel.app/en
```

### Step 3: Open the Fixed URL

Copy and paste the URL with `/en` into your browser.

---

## 🎯 Why This Happens

The Rallly app uses **locale-based routing**:
- All pages are under `/en` (or other language codes)
- The root URL (`/`) doesn't have a page
- That's why you see the Next.js default page

**Solution:** Always add `/en` to access the app!

---

## 🔍 How to Find Your Vercel URL

### Method 1: From PR
1. Go to: https://github.com/lukevella/rallly/pull/2074
2. Scroll to "Checks" section
3. Click "Vercel - app"
4. Look for the preview URL
5. **Add `/en` to it**

### Method 2: From Vercel Dashboard
1. Go to vercel.com
2. Find your project
3. Click on the deployment
4. Copy the URL
5. **Add `/en` to it**

---

## ✅ What You Should See

After adding `/en`, you should see:
- ✅ Rallly homepage (not Next.js default)
- ✅ Your changes visible
- ✅ Can log in and test features
- ✅ AI Time Suggestions working
- ✅ Finalize poll working

---

## 🔗 Quick Examples

### Example 1:
**Wrong:**
```
https://rallly-git-feature-ai-time-suggestions-iana2025-mtl.vercel.app
```

**Correct:**
```
https://rallly-git-feature-ai-time-suggestions-iana2025-mtl.vercel.app/en
```

### Example 2:
**Wrong:**
```
https://rallly-xxx.vercel.app
```

**Correct:**
```
https://rallly-xxx.vercel.app/en
```

---

## 🎯 Quick Fix Checklist

- [ ] Get your Vercel preview URL
- [ ] Add `/en` to the end
- [ ] Open in browser
- [ ] Should see Rallly app (not Next.js page)

---

## 💡 Pro Tip

**Bookmark the URL with `/en`** so you don't have to add it every time!

Or, the app should auto-redirect, but if it doesn't, manually add `/en`.

---

## ✅ Summary

**Problem:** Vercel preview shows Next.js default page  
**Solution:** Add `/en` to the URL  
**Example:** `https://your-url.vercel.app/en`

**That's it!** Just add `/en` and it will work! 🎉



