# 🔍 Vercel Preview Link Guide

## What is the Vercel Link?

The Vercel links in your PR are **deployment previews** - they deploy your changes to a temporary URL so reviewers can test your code before merging.

---

## 🚨 Issue: Shows Next.js Home Page

If clicking the Vercel link shows the default Next.js home page, here's how to fix it:

### Solution 1: Add `/en` to the URL

The Rallly app uses locale-based routing. Try adding `/en` to the end of the Vercel URL:

**Instead of:**
```
https://rallly-xxx.vercel.app
```

**Try:**
```
https://rallly-xxx.vercel.app/en
```

The app should automatically redirect, but if it doesn't, manually add `/en`.

---

### Solution 2: Wait for Deployment

Vercel deployments can take 2-5 minutes. If you see the Next.js default page:

1. **Wait a few minutes** - The deployment might still be in progress
2. **Refresh the page** - After waiting, refresh to see if it's ready
3. **Check deployment status** - Look for a green checkmark in the PR checks

---

### Solution 3: Check Deployment Status

1. Go back to your PR page: https://github.com/lukevella/rallly/pull/2074
2. Look at the "Checks" section
3. Find the "Vercel" check
4. Click on it to see deployment status
5. Wait for it to show "Ready" or "Deployed"

---

## 🔗 How to Access the Preview Correctly

### Step 1: Find the Vercel Link
- Go to your PR: https://github.com/lukevella/rallly/pull/2074
- Look for "Vercel" in the checks section
- Click on the Vercel check to see the preview URL

### Step 2: Access the App
Once you have the Vercel URL:

1. **Try the base URL first:**
   ```
   https://rallly-xxx.vercel.app
   ```
   (It should auto-redirect to `/en`)

2. **If that doesn't work, add `/en` manually:**
   ```
   https://rallly-xxx.vercel.app/en
   ```

3. **If still showing Next.js page:**
   - Wait 2-3 more minutes
   - Refresh the page
   - Check if deployment completed

---

## ⚠️ Common Issues

### Issue 1: "Authorization Required"
- **What it means:** The Vercel check needs maintainer approval
- **What to do:** Nothing - this is normal for external contributors
- **Impact:** The preview won't deploy until approved

### Issue 2: Shows Next.js Default Page
- **Cause:** App routing or deployment not complete
- **Solution:** Add `/en` to URL or wait for deployment

### Issue 3: 404 Error
- **Cause:** Deployment might have failed
- **Solution:** Check Vercel deployment logs in the PR checks

---

## ✅ What You Should See

When the Vercel preview works correctly, you should see:

1. **Rallly homepage** (not Next.js default page)
2. **App loads at `/en`** (or redirects there)
3. **You can log in and test features**
4. **Your changes are visible** (AI suggestions, finalize poll, etc.)

---

## 🎯 Testing Your Changes on Vercel Preview

Once the preview is working:

1. **Log in** to your account
2. **Create a new poll**
3. **Test AI suggestions:**
   - Select dates
   - Open AI panel
   - Verify suggestions appear
4. **Test finalize poll:**
   - Try to finalize a poll
   - Verify no paywall appears (Hobby plan)

---

## 📋 Summary

**If Vercel link shows Next.js home page:**

1. ✅ **Add `/en` to the URL** - Most common fix
2. ⏳ **Wait 2-5 minutes** - Deployment might be in progress
3. 🔄 **Refresh the page** - After waiting
4. ✅ **Check deployment status** - In PR checks section

**The preview is for testing - it's normal if it takes a few minutes to be ready!**

---

## 🔗 Quick Links

- **Your PR:** https://github.com/lukevella/rallly/pull/2074
- **Check Vercel status:** Look in the "Checks" section of your PR

**Remember:** The Vercel preview is optional - your code is already in the PR and ready for review! The preview just helps reviewers test it visually.

