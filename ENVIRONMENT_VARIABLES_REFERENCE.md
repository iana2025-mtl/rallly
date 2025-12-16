# Environment Variables Reference

This document lists all environment variables used in the Rallly application.

## Currently Set Variables (from .env files)

The following variables are currently configured in your `.env` and `.env.development` files:

- `SECRET_PASSWORD` - Secret key for encryption (32+ characters)
- `NEXT_PUBLIC_BASE_URL` - Base URL of the application
- `AUTH_URL` - Authentication URL
- `DATABASE_URL` - Database connection string
- `DIRECT_DATABASE_URL` - Direct database connection string (for migrations)
- `SUPPORT_EMAIL` - Support email address
- `NEXT_PUBLIC_SELF_HOSTED` - Self-hosted flag
- `SENTRY_IGNORE_API_RESOLUTION_ERROR` - Sentry configuration
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_SECURE` - SMTP secure connection flag
- `SMTP_USER` - SMTP username
- `SMTP_PWD` - SMTP password

---

## Required Environment Variables

### Core (Required)
- **`DATABASE_URL`** (required) - Full database connection string (PostgreSQL)
  - Example: `postgresql://user:password@host:port/database`
  
- **`SECRET_PASSWORD`** (required) - Secret key for session encryption (minimum 32 characters)
  - Example: `your-32-character-secret-key-here`
  
- **`SUPPORT_EMAIL`** (required) - Email address shown as support contact
  - Example: `support@example.com`
  
- **`NEXT_PUBLIC_BASE_URL`** (required) - Base URL where the app is accessible
  - Example: `https://yourdomain.com` or `http://localhost:3000`

---

## Optional Environment Variables

### Application Configuration
- **`NODE_ENV`** - Environment mode: `development`, `production`, or `test` (default: `development`)
- **`API_SECRET`** - API secret key (minimum 32 characters, optional)
- **`SKIP_ENV_VALIDATION`** - Skip environment variable validation (for debugging)

### Email Configuration

#### Email Provider Selection
- **`EMAIL_PROVIDER`** - Email service provider: `smtp` or `ses` (default: `smtp`)

#### SMTP Configuration (when EMAIL_PROVIDER=smtp)
- **`SMTP_HOST`** - SMTP server host address
- **`SMTP_PORT`** - SMTP server port (common: 587, 465, 25)
- **`SMTP_USER`** - SMTP username (if authentication required)
- **`SMTP_PWD`** - SMTP password (if authentication required)
- **`SMTP_SECURE`** - Use SSL: `true` or `false` (typically `true` for port 465)
- **`SMTP_REJECT_UNAUTHORIZED`** - Reject unauthorized certificates: `true` or `false` (default: `true`)
- **`SMTP_TLS_ENABLED`** - (Deprecated) Use `SMTP_REJECT_UNAUTHORIZED` instead

#### AWS SES Configuration (when EMAIL_PROVIDER=ses)
- **`AWS_ACCESS_KEY_ID`** - AWS access key ID
- **`AWS_SECRET_ACCESS_KEY`** - AWS secret access key
- **`AWS_REGION`** - AWS region (e.g., `us-east-1`)

#### Email Settings
- **`NOREPLY_EMAIL`** - Email address for sending transactional emails (defaults to `SUPPORT_EMAIL` if not set)
- **`NOREPLY_EMAIL_NAME`** - Sender name for emails (default: `Rallly`)

### Authentication & Authorization
- **`ALLOWED_EMAILS`** - Comma-separated list of allowed email addresses (wildcards supported)
  - Example: `user@example.com, *@example.com, *@*.example.com`
  - If not set, all emails are allowed
  
- **`EMAIL_LOGIN_ENABLED`** - Enable email login: `true` or `false` (default: `true`)
- **`REGISTRATION_ENABLED`** - Enable user registration: `true` or `false` (default: `true`)

### OpenID Connect (OIDC) Configuration
- **`OIDC_NAME`** - Name of the OIDC provider (default: `OpenID Connect`)
- **`OIDC_DISCOVERY_URL`** - OIDC discovery endpoint URL
- **`OIDC_CLIENT_ID`** - OIDC client ID
- **`OIDC_CLIENT_SECRET`** - OIDC client secret
- **`OIDC_ISSUER_URL`** - OIDC issuer URL
- **`OIDC_EMAIL_CLAIM_PATH`** - Path to email claim (default: `email`)
- **`OIDC_NAME_CLAIM_PATH`** - Path to name claim (default: `name`)
- **`OIDC_PICTURE_CLAIM_PATH`** - Path to picture claim (default: `picture`)

### Google Integration
- **`GOOGLE_CLIENT_ID`** - Google OAuth client ID
- **`GOOGLE_CLIENT_SECRET`** - Google OAuth client secret

### Microsoft Integration
- **`MICROSOFT_TENANT_ID`** - Microsoft tenant ID (default: `common`)
- **`MICROSOFT_CLIENT_ID`** - Microsoft OAuth client ID
- **`MICROSOFT_CLIENT_SECRET`** - Microsoft OAuth client secret

### S3/File Storage Configuration
- **`S3_BUCKET_NAME`** - S3 bucket name
- **`S3_ENDPOINT`** - S3 endpoint URL
- **`S3_ACCESS_KEY_ID`** - S3 access key ID
- **`S3_SECRET_ACCESS_KEY`** - S3 secret access key
- **`S3_REGION`** - S3 region

### AI/Moderation
- **`OPENAI_API_KEY`** - OpenAI API key for content moderation
- **`MODERATION_ENABLED`** - Enable content moderation: `true` or `false` (default: `false`)

### Licensing API
- **`LICENSE_API_URL`** - Licensing API endpoint URL
- **`LICENSE_API_AUTH_TOKEN`** - Authentication token for licensing API

### Client-Side Environment Variables (NEXT_PUBLIC_*)

These are exposed to the browser/client:

- **`NEXT_PUBLIC_BASE_URL`** (required) - Base URL of the application
- **`NEXT_PUBLIC_POSTHOG_API_KEY`** - PostHog analytics API key
- **`NEXT_PUBLIC_POSTHOG_API_HOST`** - PostHog API host URL
- **`NEXT_PUBLIC_SELF_HOSTED`** - Self-hosted flag: `true` or `false`
- **`NEXT_PUBLIC_MAINTENANCE_MODE`** - Maintenance mode flag: `1` to enable
- **`NEXT_PUBLIC_CRISP_WEBSITE_ID`** - Crisp chat widget website ID
- **`NEXT_PUBLIC_VERCEL_URL`** - (Auto-set by Vercel) Vercel deployment URL

### Vercel-Specific Variables

These are automatically set by Vercel or used in deployment:

- **`NEXT_PUBLIC_VERCEL_URL`** - Automatically set by Vercel
- **`DIRECT_DATABASE_URL`** - Direct database connection (bypasses connection pooling)
- **`KV_REST_API_URL`** - Vercel KV (Redis) REST API URL
- **`QSTASH_TOKEN`** - QStash authentication token
- **`QSTASH_URL`** - QStash API URL
- **`QSTASH_CURRENT_SIGNING_KEY`** - QStash current signing key
- **`QSTASH_NEXT_SIGNING_KEY`** - QStash next signing key
- **`CRON_SECRET`** - Secret for cron job authentication

### Monitoring & Error Tracking

- **`SENTRY_DSN`** - Sentry DSN for error tracking
- **`SENTRY_AUTH_TOKEN`** - Sentry authentication token
- **`SENTRY_ORG`** - Sentry organization
- **`SENTRY_PROJECT`** - Sentry project name
- **`SENTRY_IGNORE_API_RESOLUTION_ERROR`** - Ignore API resolution errors in Sentry

### Payment Processing (Stripe)

- **`STRIPE_SECRET_KEY`** - Stripe secret key
- **`STRIPE_SIGNING_SECRET`** - Stripe webhook signing secret

### Other Configuration

- **`DISABLE_LANDING_PAGE`** - Disable landing page: `true` to go straight to app
- **`QUICK_CREATE_ENABLED`** - Enable quick poll creation
- **`MAINTENANCE_MODE`** - Enable maintenance mode
- **`PORT`** - Server port (default: 3000)
- **`NEXT_RUNTIME`** - Next.js runtime mode
- **`ANALYZE`** - Enable bundle analysis

---

## Environment Variable Categories Summary

### Required for Basic Operation
1. `DATABASE_URL`
2. `SECRET_PASSWORD`
3. `SUPPORT_EMAIL`
4. `NEXT_PUBLIC_BASE_URL`

### Required for Email Functionality
- If using SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PWD`
- If using AWS SES: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

### Optional but Recommended
- `NOREPLY_EMAIL` - For transactional emails
- `ALLOWED_EMAILS` - For access control
- `NEXT_PUBLIC_SELF_HOSTED` - For self-hosted deployments

---

## Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser and should not contain secrets
- Variables marked as `optional` have defaults or the feature is disabled if not set
- The `SECRET_PASSWORD` must be at least 32 characters long
- For production, always use secure values and never commit `.env` files to version control

---

## Getting Current Values

To see which variables are currently set in your environment, you can run:

```bash
# List all environment variables (be careful with secrets!)
env | grep -E "(DATABASE|SMTP|SECRET|NEXT_PUBLIC)" | sort
```

Or check your `.env` files (values are masked for security):
```bash
cat .env | grep -v "^#" | grep -v "^$" | sed 's/=.*/=***/'
```

