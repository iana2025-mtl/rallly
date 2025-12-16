# 🔐 Complete Vercel Environment Variables List

## ✅ **ALL 4 REQUIRED VARIABLES**

Copy these exactly into Vercel → Settings → Environment Variables:

---

### **1. DATABASE_URL**

```
Key: DATABASE_URL
Value: postgres://postgres:EQGded3agBLLCOlc@db.bcbaplqjuxtowhdzqjzc.supabase.co:5432/postgres
Environments: Production, Preview, Development
```

---

### **2. SECRET_PASSWORD**

```
Key: SECRET_PASSWORD
Value: 100c6f90596ce4756f061ce6788a32703aa2cf4f902dd23b484e2158c7d6fcd9
Environments: Production, Preview, Development
```

---

### **3. NEXT_PUBLIC_BASE_URL**

```
Key: NEXT_PUBLIC_BASE_URL
Value: https://rallly-99a40hc0t-ianas-projects-1053c2ee.vercel.app
Environments: Production, Preview, Development
```

---

### **4. SUPPORT_EMAIL**

```
Key: SUPPORT_EMAIL
Value: your-email@school.edu
Environments: Production, Preview, Development
```

**⚠️ Replace `your-email@school.edu` with your actual email address!**

---

## 📋 **Step-by-Step: Add to Vercel**

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Delete all existing variables** (to start fresh)

3. **Add each variable one by one:**

   **Variable 1:**
   - Click **"+ Add Another"**
   - Key: `DATABASE_URL`
   - Value: `postgres://postgres:EQGded3agBLLCOlc@db.bcbaplqjuxtowhdzqjzc.supabase.co:5432/postgres`
   - Select: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Click **"+ Add Another"**
   - Key: `SECRET_PASSWORD`
   - Value: `100c6f90596ce4756f061ce6788a32703aa2cf4f902dd23b484e2158c7d6fcd9`
   - Select: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Click **"+ Add Another"**
   - Key: `NEXT_PUBLIC_BASE_URL`
   - Value: `https://rallly-99a40hc0t-ianas-projects-1053c2ee.vercel.app`
   - Select: ✅ Production, ✅ Preview, ✅ Development

   **Variable 4:**
   - Click **"+ Add Another"**
   - Key: `SUPPORT_EMAIL`
   - Value: `your-email@school.edu` (replace with your actual email)
   - Select: ✅ Production, ✅ Preview, ✅ Development

4. Click **"Save"** (top right)

5. Go to **Deployments** → **Redeploy** (with cache = No)

---

## ✅ **Final Checklist**

After adding, you should have exactly **4 variables**:

- [ ] `DATABASE_URL` = `postgres://postgres:EQGded3agBLLCOlc@db.bcbaplqjuxtowhdzqjzc.supabase.co:5432/postgres`
- [ ] `SECRET_PASSWORD` = `100c6f90596ce4756f061ce6788a32703aa2cf4f902dd23b484e2158c7d6fcd9`
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://rallly-99a40hc0t-ianas-projects-1053c2ee.vercel.app`
- [ ] `SUPPORT_EMAIL` = `[YOUR EMAIL]`
- [ ] All variables have Production, Preview, Development selected
- [ ] Clicked "Save"
- [ ] Redeployed

---

## 🚀 **After Adding All Variables**

1. **Save** all variables
2. **Redeploy** the failed deployment
3. **Wait** 2-5 minutes
4. **Build should succeed!** ✅

---

## 📝 **Summary**

**You need exactly 4 variables:**
1. `DATABASE_URL` (with your Supabase connection)
2. `SECRET_PASSWORD` (the generated secret)
3. `NEXT_PUBLIC_BASE_URL` (your Vercel URL)
4. `SUPPORT_EMAIL` (your email address)

**All must have Production, Preview, Development selected!**



