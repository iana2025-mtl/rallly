# 📁 Environment Variable Files Location

## 🔍 Found Environment Files

### 1. **Root Level Environment Files**

#### `.env`
- **Location:** `/Users/IanaSchool/ralllyproject/rallly-app/.env`
- **Purpose:** Main environment variables (typically for production or default)
- **Status:** ✅ Exists (941 bytes)
- **Git Status:** Ignored (in `.gitignore`)

#### `.env.development`
- **Location:** `/Users/IanaSchool/ralllyproject/rallly-app/.env.development`
- **Purpose:** Development-specific environment variables
- **Status:** ✅ Exists (941 bytes)
- **Git Status:** Ignored (in `.gitignore`)

---

### 2. **Web App Environment Files**

#### `.env.test`
- **Location:** `/Users/IanaSchool/ralllyproject/rallly-app/apps/web/.env.test`
- **Purpose:** Test environment variables for the web app
- **Status:** ✅ Exists (381 bytes)
- **Git Status:** Ignored (in `.gitignore`)

---

## 📋 Environment File Hierarchy

Next.js loads environment files in this order (higher priority overrides lower):

1. `.env.local` (highest priority, always ignored by git)
2. `.env.development.local` / `.env.production.local` / `.env.test.local`
3. `.env.development` / `.env.production` / `.env.test`
4. `.env` (lowest priority)

**Note:** Files with `.local` suffix are typically not committed to git.

---

## 🔐 Environment Variable Configuration

### Environment Variable Schema
The project uses **@t3-oss/env-nextjs** for type-safe environment variables.

**Schema Location:** `apps/web/src/env.ts`

### Key Environment Variables (from `env.ts`):

#### Server-Side Only:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_PASSWORD` - Must be 32+ characters
- `API_SECRET` - Optional, 32+ characters
- `NODE_ENV` - "development" | "production" | "test"

#### OIDC Configuration:
- `OIDC_NAME` - Provider name
- `OIDC_DISCOVERY_URL` - OpenID Connect discovery endpoint
- `OIDC_CLIENT_ID` - Client ID
- `OIDC_CLIENT_SECRET` - Client secret
- `OIDC_ISSUER_URL` - Issuer URL
- `OIDC_EMAIL_CLAIM_PATH` - Email claim path
- `OIDC_NAME_CLAIM_PATH` - Name claim path
- `OIDC_PICTURE_CLAIM_PATH` - Picture claim path

#### Email Configuration:
- `EMAIL_PROVIDER` - "smtp" | "ses"
- `SMTP_HOST` - SMTP server host
- `SMTP_USER` - SMTP username
- `SMTP_PWD` - SMTP password
- `SMTP_SECURE` - "true" | "false"
- `SMTP_PORT` - SMTP port number
- `AWS_ACCESS_KEY_ID` - For AWS SES
- `AWS_SECRET_ACCESS_KEY` - For AWS SES
- `AWS_REGION` - AWS region

#### Client-Side (NEXT_PUBLIC_*):
- `NEXT_PUBLIC_VERCEL_URL` - Vercel deployment URL
- `NEXT_PUBLIC_SELF_HOSTED` - Self-hosted mode flag
- `NEXT_PUBLIC_POSTHOG_API_KEY` - PostHog analytics
- `NEXT_PUBLIC_POSTHOG_API_HOST` - PostHog host
- `NEXT_PUBLIC_CRISP_WEBSITE_ID` - Crisp chat widget
- `NEXT_PUBLIC_MAINTENANCE_MODE` - Maintenance mode flag

#### AI Features:
- `OPENAI_API_KEY` - OpenAI API key for AI time suggestions

#### Other:
- `ALLOWED_EMAILS` - Comma-separated list of allowed email addresses
- `SUPPORT_EMAIL` - Support email address
- `KV_REST_API_URL` - Redis connection (for rate limiting)

---

## 🚫 Git Ignore Rules

From `.gitignore`:
```
.env
.env*.local
```

**This means:**
- ✅ `.env` - Ignored
- ✅ `.env.local` - Ignored
- ✅ `.env.development.local` - Ignored
- ✅ `.env.production.local` - Ignored
- ✅ `.env.test.local` - Ignored
- ❓ `.env.development` - **May be tracked** (check git status)
- ❓ `.env.production` - **May be tracked** (check git status)
- ❓ `.env.test` - **May be tracked** (check git status)

---

## 📝 How to View Environment Files

Since these files are filtered by `.gitignore` and may contain secrets, you can:

1. **View in terminal:**
   ```bash
   cd /Users/IanaSchool/ralllyproject/rallly-app
   cat .env
   cat .env.development
   cat apps/web/.env.test
   ```

2. **View in your IDE:**
   - Open the files directly in your editor
   - They should be visible in the file explorer

3. **Check if tracked by git:**
   ```bash
   git ls-files | grep .env
   ```

---

## 🔧 Environment Variable Documentation

For complete documentation on environment variables, see:
- `apps/web/src/env.ts` - Type definitions and validation
- `apps/web/declarations/environment.d.ts` - TypeScript declarations
- `CLAUDE.md` - Project documentation (mentions key variables)

---

## ⚠️ Security Notes

- **Never commit `.env` or `.env.local` files to git**
- **Never share environment files publicly**
- **Use Vercel Environment Variables** for production deployments
- **Use `.env.example` files** (if they exist) as templates without secrets

---

## 📍 Summary

| File | Location | Size | Purpose |
|------|----------|------|---------|
| `.env` | `rallly-app/.env` | 941 bytes | Main/default env vars |
| `.env.development` | `rallly-app/.env.development` | 941 bytes | Development env vars |
| `.env.test` | `rallly-app/apps/web/.env.test` | 381 bytes | Test env vars |

**All files are located in the `rallly-app` directory (project root).**



