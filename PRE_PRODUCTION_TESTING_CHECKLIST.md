# Pre-Production Testing Checklist for AI Time Suggestions

## 🧪 Automated Tests

### 1. Run Unit Tests
```bash
cd /Users/IanaSchool/ralllyproject/rallly-app
export PATH="/Users/IanaSchool/Library/pnpm:$PATH"
pnpm test:unit
```

**Expected**: All tests pass, including:
- ✅ `time-suggestions.test.ts` - Router validation
- ✅ `ai-service.test.ts` - AI service logic
- ✅ `data-aggregator.test.ts` - Data aggregation
- ✅ `pattern-analyzer.test.ts` - Pattern analysis
- ✅ `cache-manager.test.ts` - Caching logic

### 2. Run Integration Tests
```bash
# Make sure Docker services are running
pnpm docker:up

# Run Playwright tests
pnpm test:integration
```

**Expected**: All integration tests pass

### 3. Type Checking
```bash
pnpm type-check
```

**Expected**: No TypeScript errors

### 4. Linting
```bash
pnpm check
```

**Expected**: No linting errors (fix with `pnpm check:fix` if needed)

---

## 🧑‍💻 Manual Testing Scenarios

### Core Functionality

#### ✅ Test 1: Basic AI Suggestions
1. **Setup**: Log in as a user with at least 3 historical polls
2. **Steps**:
   - Create a new poll
   - Select 2-3 dates in the calendar
   - Open "AI Time Suggestions" panel
3. **Expected**:
   - Panel opens without errors
   - Shows "Checking data availability..." briefly
   - Displays suggestions for selected dates only
   - Each suggestion shows time, confidence, and reasoning
4. **Verify**: Suggestions match the selected dates

#### ✅ Test 2: No Dates Selected
1. **Steps**:
   - Create a new poll
   - Don't select any dates
   - Open "AI Time Suggestions" panel
2. **Expected**:
   - Shows message: "Please select dates in the calendar above..."
   - No suggestions displayed

#### ✅ Test 3: Single Date Selected
1. **Steps**:
   - Create a new poll
   - Select 1 date
   - Open AI panel
2. **Expected**:
   - Shows suggestions for that single date
   - Message shows "Showing suggestions for 1 selected date"

#### ✅ Test 4: Multiple Dates Selected
1. **Steps**:
   - Create a new poll
   - Select 3-5 dates
   - Open AI panel
2. **Expected**:
   - Shows suggestions for all selected dates
   - Message shows "Showing suggestions for X selected dates"
   - Suggestions are grouped/filtered by date

#### ✅ Test 5: Apply Suggestion
1. **Steps**:
   - Select dates and open AI panel
   - Click "Apply" on a suggestion
2. **Expected**:
   - Suggestion is added to poll options
   - Time slot appears in the form
   - Can vote on the suggested time

### Edge Cases

#### ✅ Test 6: Insufficient Historical Data
1. **Setup**: Use a new user account (0-2 polls)
2. **Steps**:
   - Create a new poll
   - Select dates
   - Open AI panel
3. **Expected**:
   - Shows message: "We need at least 3 historical polls..."
   - Displays current poll count
   - Panel is still visible (not hidden)

#### ✅ Test 7: Guest User
1. **Steps**:
   - Create poll as guest (not logged in)
   - Select dates
   - Open AI panel
2. **Expected**:
   - Panel shows appropriate message or is disabled
   - No errors in console

#### ✅ Test 8: Date Range Edge Cases
1. **Test 8a: Very Short Range (1 day)**
   - Select same date twice
   - Expected: Works correctly
2. **Test 8b: Long Range (30+ days)**
   - Select dates spanning a month
   - Expected: Suggestions generated (may take longer)
3. **Test 8c: Past Dates**
   - Try selecting past dates
   - Expected: Handled gracefully (if allowed)

#### ✅ Test 9: Different Durations
1. **Test with different meeting durations**:
   - 15 minutes
   - 30 minutes
   - 60 minutes (default)
   - 120 minutes
   - 240 minutes
2. **Expected**: Suggestions respect the duration setting

#### ✅ Test 10: Timezone Handling
1. **Steps**:
   - Change poll timezone
   - Select dates
   - Open AI panel
2. **Expected**:
   - Suggestions are in the correct timezone
   - Times are displayed correctly

#### ✅ Test 11: Cache Behavior
1. **Steps**:
   - Select dates, open AI panel (first request)
   - Close and reopen panel with same dates
2. **Expected**:
   - Second request may be faster (cached)
   - Results are consistent
   - **Note**: Cache should be bypassed when `specificDates` are provided

#### ✅ Test 12: AI Service Fallback
1. **Setup**: Temporarily disable OpenAI API key or simulate rate limit
2. **Steps**:
   - Select dates
   - Open AI panel
3. **Expected**:
   - Falls back to rule-based suggestions
   - Still shows suggestions for selected dates
   - No errors displayed to user

### Error Handling

#### ✅ Test 13: Network Errors
1. **Steps**:
   - Disconnect internet
   - Select dates and open AI panel
2. **Expected**:
   - Shows appropriate error message
   - Retry button available
   - No app crash

#### ✅ Test 14: API Errors
1. **Steps**:
   - Select dates
   - Open AI panel
   - Monitor browser console
2. **Expected**:
   - No 500 errors
   - No 401 errors (if authenticated)
   - Errors are handled gracefully

#### ✅ Test 15: Invalid Data
1. **Steps**:
   - Select dates
   - Open AI panel
   - Check server logs
2. **Expected**:
   - No unhandled exceptions
   - Logs show helpful debug info
   - User sees friendly error message

### Performance

#### ✅ Test 16: Response Time
1. **Steps**:
   - Select dates
   - Open AI panel
   - Measure time to first suggestion
2. **Expected**:
   - Data availability check: < 1 second
   - Suggestions generation: < 5 seconds (AI) or < 1 second (fallback)
   - Loading indicators shown during wait

#### ✅ Test 17: Large Dataset
1. **Setup**: User with 50+ historical polls
2. **Steps**:
   - Select dates
   - Open AI panel
3. **Expected**:
   - Still responds in reasonable time
   - No memory issues
   - Suggestions are relevant

### UI/UX

#### ✅ Test 18: Panel States
1. **Verify all panel states**:
   - Loading state (spinner)
   - Empty state (no suggestions)
   - Error state (with retry)
   - Success state (with suggestions)
   - Insufficient data state

#### ✅ Test 19: Responsive Design
1. **Test on different screen sizes**:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. **Expected**: Panel is usable on all sizes

#### ✅ Test 20: Accessibility
1. **Check**:
   - Keyboard navigation works
   - Screen reader announces states
   - Focus management is correct
   - ARIA labels are present

---

## 🔒 Security & Privacy

#### ✅ Test 21: Data Privacy
1. **Verify**:
   - User A cannot see User B's historical data
   - Suggestions are based only on accessible polls
   - No sensitive data leaked in logs

#### ✅ Test 22: Rate Limiting
1. **Steps**:
   - Rapidly open/close AI panel 20+ times
2. **Expected**:
   - Rate limiting prevents abuse
   - Falls back gracefully when rate limited
   - No service degradation

#### ✅ Test 23: Input Validation
1. **Test with malicious inputs**:
   - Very large date ranges
   - Invalid date formats
   - SQL injection attempts (if applicable)
2. **Expected**: All inputs validated and sanitized

---

## 📊 Analytics & Monitoring

#### ✅ Test 24: Analytics Tracking
1. **Steps**:
   - Open browser DevTools → Network tab
   - Use AI suggestions feature
2. **Expected**:
   - Analytics events fired for:
     - Panel opened
     - Suggestions generated
     - Suggestion applied
     - Suggestion dismissed
     - Errors (if any)

#### ✅ Test 25: Error Logging
1. **Steps**:
   - Trigger an error scenario
   - Check error tracking service (Sentry, etc.)
2. **Expected**:
   - Errors are logged with context
   - No sensitive data in logs
   - Stack traces are helpful

---

## 🧹 Cleanup

#### ✅ Test 26: Remove Debug Code
1. **Check for**:
   - `console.log` statements (keep only essential ones)
   - Debug UI elements (`process.env.NODE_ENV === "development"` blocks)
   - Test data or mock endpoints
2. **Action**: Remove or properly gate debug code

#### ✅ Test 27: Environment Variables
1. **Verify**:
   - `OPENAI_API_KEY` is set in production
   - All required env vars are documented
   - No hardcoded secrets

---

## 📝 Documentation

#### ✅ Test 28: Code Documentation
1. **Check**:
   - Complex functions have JSDoc comments
   - Types are well-defined
   - README updated if needed

#### ✅ Test 29: User-Facing Messages
1. **Review all user messages**:
   - Are they clear and helpful?
   - Are they properly translated (if i18n enabled)?
   - No technical jargon exposed to users

---

## 🚀 Pre-Deployment Checklist

Before pushing to production:

- [ ] All automated tests pass
- [ ] Manual testing completed (at least Tests 1-15)
- [ ] No console errors in production build
- [ ] Performance is acceptable
- [ ] Security review completed
- [ ] Error handling tested
- [ ] Analytics verified
- [ ] Debug code removed
- [ ] Environment variables configured
- [ ] Documentation updated
- [ ] Code reviewed by team (if applicable)

---

## 🐛 Known Issues to Monitor

After deployment, monitor for:

1. **AI API Rate Limits**: Watch for fallback usage spikes
2. **Slow Response Times**: Monitor suggestion generation latency
3. **Empty Suggestions**: Track when users get no suggestions despite having data
4. **Date Mismatches**: Ensure suggestions always match selected dates
5. **Cache Issues**: Verify cache invalidation works correctly

---

## Quick Test Commands

```bash
# Full test suite
cd /Users/IanaSchool/ralllyproject/rallly-app
export PATH="/Users/IanaSchool/Library/pnpm:$PATH"

# 1. Type check
pnpm type-check

# 2. Lint
pnpm check

# 3. Unit tests
pnpm test:unit

# 4. Integration tests (requires Docker)
pnpm docker:up
pnpm test:integration

# 5. Build production bundle
pnpm build

# 6. Start production server locally
pnpm start
```

---

## Notes

- **Test Data**: Ensure you have mock data in your database (run the mock data script if needed)
- **API Keys**: Make sure `OPENAI_API_KEY` is set for AI testing
- **Docker**: Integration tests require Docker services (PostgreSQL, Redis)
- **Time**: Full manual testing should take ~2-3 hours

Good luck! 🎉

