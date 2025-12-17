# Prisma Client Runtime Error Fix

## Problem
Error: `TypeError: Cannot read properties of undefined (reading 'findUnique')`

This means `prisma` is `undefined` at runtime, indicating Prisma Client is not available.

## Root Cause
Prisma Client is not being generated or bundled correctly for Vercel serverless functions.

## Solution Applied

1. **Added error handling** in `packages/database/index.ts`:
   - Try-catch around PrismaClient creation
   - Clear error messages if initialization fails

2. **Updated webpack config** in `next.config.js`:
   - Ensure Prisma Client is bundled (not externalized) for serverless functions

3. **Build command** already includes Prisma generation:
   ```bash
   pnpm --filter @rallly/database db:generate && pnpm build:web
   ```

4. **Postinstall script** in root `package.json`:
   ```json
   "postinstall": "pnpm --filter @rallly/database db:generate"
   ```

## Verification Steps

1. Check Vercel build logs for:
   ```
   > @rallly/database@0.0.0 db:generate
   > prisma generate
   ✔ Generated Prisma Client
   ```

2. Check installation logs for:
   ```
   > rallly@4.5.11 postinstall
   > pnpm --filter @rallly/database db:generate
   ```

3. Verify Prisma Client is in node_modules:
   - Should exist at: `node_modules/.pnpm/@prisma+client@6.8.2_.../node_modules/@prisma/client`

## If Still Failing

The issue might be that Prisma Client needs to be generated **after** dependencies are installed but **before** the build. The current setup should handle this, but if it doesn't:

1. Check that `.npmrc` has `enable-pre-post-scripts=true`
2. Check that `pnpm-workspace.yaml` includes Prisma in `onlyBuiltDependencies`
3. Verify the build command in Vercel UI matches `vercel.json`

## Next Steps

After deployment, check the runtime logs. If you see the new error messages from our try-catch blocks, they will indicate exactly where Prisma Client initialization is failing.
