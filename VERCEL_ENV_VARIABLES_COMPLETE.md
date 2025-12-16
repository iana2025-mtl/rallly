# Complete Vercel Environment Variables List

Copy and paste these into Vercel (Settings → Environment Variables → Add New)

## REQUIRED Variables (Must Have)

```
DATABASE_URL=your-production-postgres-connection-string
DIRECT_DATABASE_URL=your-production-postgres-direct-connection-string
SECRET_PASSWORD=abcdef1234567890abcdef1234567890
SUPPORT_EMAIL=support@rallly.co
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

## IMPORTANT: Replace These Values

1. **DATABASE_URL** - Replace with your actual production database URL (NOT localhost)
   - Example: `postgresql://user:password@host:5432/database?sslmode=require`
   
2. **DIRECT_DATABASE_URL** - Same as DATABASE_URL (for Prisma migrations)
   - Example: `postgresql://user:password@host:5432/database?sslmode=require`

3. **NEXT_PUBLIC_BASE_URL** - Replace with your actual Vercel app URL
   - Example: `https://rallly-project.vercel.app`
   - Find this in your Vercel project dashboard

4. **SECRET_PASSWORD** - Must be at least 32 characters
   - Current value: `abcdef1234567890abcdef1234567890`
   - You can keep this or generate a new 32+ character random string

## RECOMMENDED Variables (For Full Functionality)

```
AUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SELF_HOSTED=false
SENTRY_IGNORE_API_RESOLUTION_ERROR=1
```

## EMAIL Configuration (Required for Email Features)

Choose ONE of these options:

### Option 1: SMTP (Recommended for most users)
```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PWD=your-app-password
```

### Option 2: AWS SES
```
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

### Option 3: Development (No Email - For Testing Only)
```
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PWD=
```

## OPTIONAL Variables (Add if Needed)

```
NODE_ENV=production
ALLOWED_EMAILS=user@example.com
EMAIL_LOGIN_ENABLED=true
REGISTRATION_ENABLED=true
NOREPLY_EMAIL=noreply@yourdomain.com
NOREPLY_EMAIL_NAME=Rallly
```

---

## Quick Copy-Paste for Vercel

**Minimum Required Set:**
```
DATABASE_URL=your-production-db-url
DIRECT_DATABASE_URL=your-production-db-url
SECRET_PASSWORD=abcdef1234567890abcdef1234567890
SUPPORT_EMAIL=support@rallly.co
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
AUTH_URL=https://your-app.vercel.app
SKIP_ENV_VALIDATION=1
```

**Note:** Replace `your-production-db-url` and `https://your-app.vercel.app` with your actual values!

