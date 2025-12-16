# 🔗 How to Find Your Vercel Preview Link

## 🎯 What You're Looking For

The **Vercel preview** is a **separate deployment** of your changes. It:
- ✅ Shows YOUR changes in a live environment
- ✅ Doesn't affect the main project at all
- ✅ Is a temporary preview URL
- ✅ Perfect for testing and showing your work

---

## 📍 Step-by-Step: Find the Preview Link

### Step 1: Go to Your PR
**Link:** https://github.com/lukevella/rallly/pull/2074

### Step 2: Find the "Checks" Section
- Scroll down on the PR page
- Look for a section called **"Checks"** or **"All checks"**
- You'll see various checks listed

### Step 3: Find the Vercel Check
Look for:
- **"Vercel - app"** (with a red X or status icon)
- **"Vercel - landing"** (with a red X or status icon)

### Step 4: Click on the Vercel Check
- Click on **"Vercel - app"** (the main one)
- This will open the Vercel deployment page

### Step 5: Find the Preview URL
On the Vercel page, you'll see:
- A **"Visit"** button or link
- Or a URL like: `https://rallly-xxx-iana2025-mtl.vercel.app`
- This is your preview link!

---

## 🔍 Alternative: Direct Method

### If Vercel Check Shows "Authorization Required":

1. **Go to your PR:** https://github.com/lukevella/rallly/pull/2074

2. **Look for comments from "vercel[bot]"**
   - Scroll to the "Conversation" tab
   - Find the comment from vercel[bot]
   - It should contain a preview URL

3. **Or check the PR description**
   - Sometimes Vercel adds a comment with the preview link

---

## 🌐 What the Preview URL Looks Like

The URL will be something like:
```
https://rallly-git-feature-ai-time-suggestions-hobby-finalize-iana2025-mtl.vercel.app
```

Or:
```
https://rallly-xxx-iana2025-mtl.vercel.app
```

---

## ✅ How to Access the Preview

### Once You Have the URL:

1. **Copy the Vercel preview URL**

2. **Add `/en` to the end:**
   ```
   https://YOUR-VERCEL-URL.vercel.app/en
   ```

3. **Open in your browser**

4. **You should see:**
   - Your changes live
   - AI Time Suggestions feature
   - Finalize poll working for Hobby plan

---

## ⚠️ If Preview Shows Next.js Default Page

### Fix: Add `/en` to URL

**Instead of:**
```
https://rallly-xxx.vercel.app
```

**Use:**
```
https://rallly-xxx.vercel.app/en
```

The app uses locale-based routing, so you need `/en` at the end.

---

## 🔍 Quick Navigation

### Method 1: From PR Page
1. Go to: https://github.com/lukevella/rallly/pull/2074
2. Scroll to "Checks" section
3. Click "Vercel - app"
4. Find "Visit" button or URL

### Method 2: From Comments
1. Go to: https://github.com/lukevella/rallly/pull/2074
2. Click "Conversation" tab
3. Look for vercel[bot] comment
4. Find the preview URL in the comment

### Method 3: Check PR Description
- Sometimes Vercel automatically adds a preview link
- Check the PR description area

---

## 🎯 What You'll See

When you access the preview:

1. **Rallly app with YOUR changes:**
   - AI Time Suggestions feature
   - Finalize poll for Hobby plan
   - All your modifications

2. **It's completely separate:**
   - Doesn't affect main project
   - Temporary preview
   - Only shows your branch

3. **Perfect for:**
   - Testing your changes
   - Showing your work
   - Demonstrating features

---

## 📋 Summary

**To find your preview link:**

1. ✅ Go to PR: https://github.com/lukevella/rallly/pull/2074
2. ✅ Scroll to "Checks" section
3. ✅ Click "Vercel - app"
4. ✅ Find the preview URL
5. ✅ Add `/en` to the URL
6. ✅ Open in browser

**The preview is safe - it's just for viewing your changes!** 🎉

---

## 🔗 Quick Links

- **Your PR:** https://github.com/lukevella/rallly/pull/2074
- **Checks section:** Scroll down on PR page
- **Vercel check:** Look for "Vercel - app" in checks

**Note:** If Vercel shows "Authorization required", the preview may not be available yet. The maintainers need to approve it first. But you can still view your code changes in the "Files changed" tab!



