#!/bin/bash
# Script to create demo user in production using better-auth's sign-up API
# This ensures the password is hashed correctly with Argon2

# Set your production URL
PRODUCTION_URL="${PRODUCTION_URL:-https://ralllynew.vercel.app}"

echo "🔧 Creating demo user via better-auth API..."
echo "   Production URL: $PRODUCTION_URL"
echo ""

# Create user via sign-up API
RESPONSE=$(curl -s -X POST "$PRODUCTION_URL/api/better-auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "password": "demo123456",
    "name": "Demo User",
    "timeZone": "America/New_York",
    "locale": "en"
  }')

echo "Response: $RESPONSE"
echo ""

# Check if user was created or already exists
if echo "$RESPONSE" | grep -q "user"; then
  echo "✅ Demo user created successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Demo Credentials:"
  echo "Email: demo@test.com"
  echo "Password: demo123456"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "You can now login with these credentials."
elif echo "$RESPONSE" | grep -q "USER_ALREADY_EXISTS"; then
  echo "⚠️  User already exists. Password may need to be reset."
  echo ""
  echo "To reset the password, use the forgot password flow:"
  echo "1. Go to $PRODUCTION_URL/forgot-password"
  echo "2. Enter: demo@test.com"
  echo "3. Check your email for reset link"
else
  echo "❌ Failed to create user. Response: $RESPONSE"
  exit 1
fi

