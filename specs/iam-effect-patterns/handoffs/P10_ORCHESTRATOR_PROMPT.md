# P10 Orchestrator Prompt: E2E Testing

## Mission

You are executing Phase 10 of the IAM Effect Patterns specification. Your mission is to validate the complete IAM auth flows work end-to-end in a browser, confirming that the session signal bugs fixed in earlier phases actually work in practice.

## Context Files to Read First

```
specs/iam-effect-patterns/handoffs/HANDOFF_P10.md      # Phase requirements
specs/iam-effect-patterns/PLAN.md                      # Overall plan
specs/iam-effect-patterns/REFLECTION_LOG.md            # Previous learnings
specs/iam-effect-patterns/outputs/type-safety-audit.md # Phase 9 findings
packages/iam/client/CLAUDE.md                          # Package guidelines
```

## Execution Steps

### Step 1: Assess Pre-existing Issues

Before testing, understand the current infrastructure issues:

```bash
# Check if tests run (likely env issue)
bun run test --filter @beep/iam-client

# Check if build works (likely tsconfig issue)
bunx turbo run build --filter @beep/iam-client
```

Document any failures that need to be addressed before E2E testing.

### Step 2: Choose Testing Approach

Based on infrastructure state, choose one:

#### Option A: Fix Infrastructure First
If test/build issues are blocking:
1. Fix `ClientEnv.ts` env validation for test environment
2. Fix testkit tsconfig references
3. Run automated tests

#### Option B: Browser Automation (Playwright MCP)
If dev server is available:
1. Start dev server (with user permission)
2. Use Playwright MCP tools for browser automation
3. Navigate auth flows and verify behavior

#### Option C: Manual Testing
If automation is problematic:
1. Document steps for manual testing
2. User performs tests
3. Collect and document results

### Step 3: Test Sign-In Flow

**Goal**: Verify sign-in works and `$sessionSignal` fires.

#### Using Playwright MCP:
```typescript
// Navigate to sign-in page
await mcp__playwright__browser_navigate({ url: "http://localhost:3000/auth/sign-in" });

// Take snapshot to see form
await mcp__playwright__browser_snapshot({});

// Fill form
await mcp__playwright__browser_fill_form({
  fields: [
    { name: "email", type: "textbox", ref: "...", value: "test@example.com" },
    { name: "password", type: "textbox", ref: "...", value: "password123" },
  ]
});

// Submit
await mcp__playwright__browser_click({ element: "Sign In button", ref: "..." });

// Check for success (redirect, no errors)
await mcp__playwright__browser_console_messages({ level: "error" });
```

### Step 4: Test Sign-Out Flow

**Goal**: Verify sign-out works and `$sessionSignal` fires (CRITICAL - this was broken before Phase 6).

#### Test Steps:
1. Sign in first (if not already)
2. Navigate to authenticated page
3. Click sign-out
4. Verify:
   - User is redirected to login
   - Auth guards react immediately
   - Toast shows "Signed out successfully"
   - No console errors

### Step 5: Test Sign-Up Flow

**Goal**: Verify sign-up works and creates session.

#### Test Steps:
1. Navigate to sign-up page
2. Fill form with new user details
3. Submit
4. Verify:
   - User is logged in
   - Redirected to authenticated area
   - Session is active

### Step 6: Test Error Handling

**Goal**: Verify errors are handled gracefully.

#### Test Cases:
1. **Invalid credentials**: Try sign-in with wrong password
2. **Network error**: Test with network throttling (if possible)
3. **Empty fields**: Submit forms with missing required fields

### Step 7: Document Results

Create `outputs/e2e-test-results.md`:

```markdown
# E2E Test Results - Phase 10

**Date**: [Current Date]
**Test Method**: [Playwright MCP / Manual / Unit Tests]

## Test Results

### Sign-In Flow
| Test | Status | Notes |
|------|--------|-------|
| Form renders | PASS/FAIL | |
| Valid login succeeds | PASS/FAIL | |
| Session signal fires | PASS/FAIL | |
| Auth guards react | PASS/FAIL | |
| Toast appears | PASS/FAIL | |

### Sign-Out Flow
| Test | Status | Notes |
|------|--------|-------|
| Sign-out button works | PASS/FAIL | |
| Session signal fires | PASS/FAIL | CRITICAL |
| Auth guards react | PASS/FAIL | |
| User redirected | PASS/FAIL | |
| Toast appears | PASS/FAIL | |

### Sign-Up Flow
| Test | Status | Notes |
|------|--------|-------|
| Form renders | PASS/FAIL | |
| Valid signup succeeds | PASS/FAIL | |
| Session created | PASS/FAIL | |
| User redirected | PASS/FAIL | |

### Error Handling
| Test | Status | Notes |
|------|--------|-------|
| Invalid credentials | PASS/FAIL | |
| Network error | PASS/FAIL | |
| Empty fields | PASS/FAIL | |

## Console Errors
[List any console errors observed]

## Issues Found
[Document any issues that need follow-up]
```

### Step 8: Update Documentation

1. Update `REFLECTION_LOG.md`:
```markdown
## Phase 10: E2E Testing

### What Worked
- [List successes]

### What Didn't Work
- [List challenges]

### Key Learnings
- [Insights from E2E testing]
```

2. Update `README.md`:
```markdown
- [x] Phase 10: E2E Testing — Validated auth flows work end-to-end
```

## Success Criteria

1. Sign-in flow works with session signal firing
2. Sign-out flow works with session signal firing (validates Phase 6 fix)
3. Sign-up flow works with session signal firing
4. Auth guards react to session changes
5. No console errors during auth flows
6. Toast notifications appear correctly
7. E2E test results documented

## Important Notes

- **Do NOT start dev server without user confirmation**
- **If tests fail, document the failure clearly**
- **Focus on validating the session signal fixes from Phase 6/7**
- **The sign-out session signal was the CRITICAL bug fixed in this spec**
