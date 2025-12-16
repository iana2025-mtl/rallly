# Step-by-Step: Test Production Build

## Step 1: Build the Production Bundle

Open your terminal and run:

```bash
cd /Users/IanaSchool/ralllyproject/rallly-app
export PATH="/Users/IanaSchool/Library/pnpm:$PATH"
pnpm build
```

**What to expect:**
- Build process will take 2-3 minutes
- You'll see "Creating an optimized production build..."
- At the end, you should see: `✓ Compiled successfully` or similar
- **Success indicator**: `Tasks: 1 successful, 1 total`

**If you see errors:**
- Check the error message
- Common issues: TypeScript errors, missing dependencies
- Fix errors and try again

---

## Step 2: Start the Production Server

After the build succeeds, start the production server:

```bash
pnpm start
```

**What to expect:**
- Server starts on port 3000 (or another port if 3000 is busy)
- You'll see: `✓ Ready in X seconds`
- Look for: `Local: http://localhost:3000`

**Keep this terminal open** - the server needs to keep running.

---

## Step 3: Open the App in Browser

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to: `http://localhost:3000`
3. The app should automatically redirect to `http://localhost:3000/en`

**What to check:**
- ✅ Page loads without errors
- ✅ No 404 errors
- ✅ UI looks normal
- ✅ No console errors (press F12 → Console tab)

---

## Step 4: Test AI Time Suggestions (Production Mode)

1. **Log in** to your account
   - Use the account with mock data (`iribnicova83@gmail.com`)

2. **Create a new poll:**
   - Click "New Poll" or go to `/en/new`
   - Fill in poll details (title, description)

3. **Select dates:**
   - In the calendar, select 2-3 dates
   - Dates should be highlighted

4. **Open AI panel:**
   - Scroll down to find "AI Time Suggestions"
   - Click to expand the panel
   - Wait for suggestions to load

5. **Verify it works:**
   - ✅ Panel opens without errors
   - ✅ Shows "Checking data availability..." briefly
   - ✅ Displays suggestions for your selected dates
   - ✅ Each suggestion has time, confidence, reasoning

---

## Step 5: Test Finalize Poll (Production Mode)

1. **In the same poll** (or create a new one):
   - Add some time options (or use AI suggestions)
   - Get some votes if possible (or just proceed)

2. **Finalize the poll:**
   - Click "Manage Poll" (three dots or settings icon)
   - Click "Finalize"
   - Select a time option
   - Click "Finalize" button

3. **Verify it works:**
   - ✅ No paywall appears (Hobby plan should work)
   - ✅ Poll status changes to "Finalized"
   - ✅ Event is created

---

## Step 6: Check Production Console

1. **Open browser DevTools:**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Go to "Console" tab

2. **Check for errors:**
   - ✅ No red error messages
   - ✅ No 500/401/404 errors
   - ⚠️ Debug messages are OK (they're gated for development)

3. **Check Network tab:**
   - Go to "Network" tab
   - Refresh the page
   - Look for failed requests (red)
   - ✅ All requests should be 200 (green)

---

## Step 7: Verify Production Features

### Test these features work in production:

- [ ] **Homepage loads** - No errors
- [ ] **Can create polls** - Form works
- [ ] **Can select dates** - Calendar works
- [ ] **AI suggestions appear** - For selected dates
- [ ] **Can apply suggestions** - Adds to poll options
- [ ] **Can finalize poll** - No paywall for Hobby
- [ ] **Events page works** - `/en/events` loads
- [ ] **No console errors** - Clean browser console

---

## Step 8: Stop the Production Server

When you're done testing:

1. Go back to the terminal where `pnpm start` is running
2. Press `Ctrl+C` to stop the server
3. You'll see: `^C` and the server stops

---

## Troubleshooting

### Build fails with memory error:
- Already fixed! The build script has `NODE_OPTIONS=--max-old-space-size=4096`
- If it still fails, increase to 6144 or 8192

### Server won't start:
- Check if port 3000 is already in use
- Try: `PORT=3001 pnpm start`
- Then use `http://localhost:3001`

### Features don't work:
- Make sure you're logged in
- Check browser console for errors
- Verify environment variables are set
- Check terminal logs for server errors

### Page shows 404:
- Make sure you're using `/en` in the URL
- Try: `http://localhost:3000/en`
- Check if middleware is working

---

## Success Criteria ✅

Your production build is working if:

1. ✅ Build completes without errors
2. ✅ Server starts successfully
3. ✅ App loads in browser
4. ✅ AI suggestions work
5. ✅ Finalize poll works (Hobby plan)
6. ✅ No console errors
7. ✅ All features work as expected

---

## Quick Command Reference

```bash
# 1. Build
cd /Users/IanaSchool/ralllyproject/rallly-app
export PATH="/Users/IanaSchool/Library/pnpm:$PATH"
pnpm build

# 2. Start production server
pnpm start

# 3. Stop server (when done)
# Press Ctrl+C in the terminal
```

---

## Next Steps After Testing

If everything works:
- ✅ You're ready to deploy!
- ✅ Production build is working
- ✅ All features tested and working

If something doesn't work:
- Check the error messages
- Review the troubleshooting section
- Fix issues and rebuild

Good luck! 🚀

