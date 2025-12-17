#!/bin/bash
# Script to create demo user in Vercel production using better-auth API

PRODUCTION_URL="${PRODUCTION_URL:-https://ralllynew.vercel.app}"

echo "🔧 Creating demo user via better-auth API..."
echo "   Production URL: $PRODUCTION_URL"
echo ""

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

if echo "$RESPONSE" | grep -q '"user"'; then
  echo "✅ Demo user created successfully!"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Demo Credentials:"
  echo "Email: demo@test.com"
  echo "Password: demo123456"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
elif echo "$RESPONSE" | grep -q "USER_ALREADY_EXISTS"; then
  echo "⚠️  User already exists. You can try logging in."
  echo "   If login fails, you may need to reset the password."
else
  echo "❌ Failed to create user."
  echo "   Response: $RESPONSE"
  exit 1
fi
