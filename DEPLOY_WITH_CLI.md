# 🚀 Deploy to Vercel Using CLI

## ✅ **Solution: Use Vercel CLI**

Since the UI doesn't have a "Create Deployment" button, we'll use the command line.

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Install Vercel CLI**

```bash
cd /Users/IanaSchool/ralllyproject/rallly-app
npm install -g vercel
```

**Or use npx (no installation needed):**
```bash
cd /Users/IanaSchool/ralllyproject/rallly-app
npx vercel
```

### **Step 2: Login to Vercel**

```bash
npx vercel login
```

This will:
- Open your browser
- Ask you to authorize Vercel CLI
- Link your terminal to your Vercel account

### **Step 3: Deploy from Feature Branch**

```bash
cd /Users/IanaSchool/ralllyproject/rallly-app
npx vercel --prod --branch feature/ai-time-suggestions-hobby-finalize
```

**Or if that doesn't work, try:**
```bash
npx vercel --prod
# Then select your branch when prompted
```

### **Step 4: Follow Prompts**

The CLI will ask:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → Yes, select `ralllyproject`
- **Which branch?** → `feature/ai-time-suggestions-hobby-finalize`
- **Override settings?** → No (use defaults)

### **Step 5: Get the URL**

After deployment completes, you'll see:
```
✅ Production: https://ralllyproject.vercel.app
```

**But wait!** This might still deploy from main. Let's try a different approach.

---

## 🎯 **Better Solution: Deploy as Preview First**

### **Deploy as Preview (Not Production)**

```bash
cd /Users/IanaSchool/ralllyproject/rallly-app
npx vercel --branch feature/ai-time-suggestions-hobby-finalize
```

This creates a **preview deployment** (not production), which will:
- ✅ Use your feature branch
- ✅ Have your redirect fixes
- ✅ Give you a preview URL

---

## 🔧 **Alternative: Check if Preview Already Exists**

Since you pushed to the feature branch earlier, Vercel might have already created a preview. Let's check:

1. **In Vercel Dashboard:**
   - Go to **Deployments** tab
   - Click **"All Branches..."** filter
   - Type: `feature`
   - See if `feature/ai-time-suggestions-hobby-finalize` appears

2. **If it exists:**
   - Click on that deployment
   - Copy the preview URL
   - Use that URL!

---

## 📝 **Quick Command Summary**

```bash
# Navigate to project
cd /Users/IanaSchool/ralllyproject/rallly-app

# Login (first time only)
npx vercel login

# Deploy from feature branch as preview
npx vercel --branch feature/ai-time-suggestions-hobby-finalize

# Or deploy to production (if you want)
npx vercel --prod --branch feature/ai-time-suggestions-hobby-finalize
```

---

## ⚠️ **Important Notes**

- **Preview deployments** are free and don't affect production
- **Production deployments** (`--prod`) will replace your current production
- **Preview URL** will be something like: `https://ralllyproject-git-feature-ai-time-suggestions-hobby-finalize-...vercel.app`

---

## ✅ **After Deployment**

1. The CLI will show you the deployment URL
2. Copy that URL
3. Visit it in your browser
4. Should see your Rallly app (not boilerplate) ✅

---

## 🎯 **Recommended Approach**

**For a school project, use preview deployment:**

```bash
npx vercel --branch feature/ai-time-suggestions-hobby-finalize
```

This is safer and gives you a preview URL to test without affecting production.



