# Phase 10 Handoff: E2E Testing

## Phase 9 Summary

Phase 9 completed a type safety audit of `@beep/iam-client`:

### Key Actions
1. **Deleted `atom.factory.ts`** - Factory provided marginal value (~5 lines saved) but introduced unsafe type casts. The manual pattern in `core/atoms.ts` is canonical.
2. **Fixed `user.schemas.ts`** - Added `S.is(User.UserRole)` validation before using role value (was unvalidated cast).
3. **Documented structural assertions** - handler.factory.ts casts are due to TypeScript conditional type limitations, not code issues.

### Artifacts Created
- `outputs/type-safety-audit.md` - Complete audit report

### Verification Status
| Check | Result | Notes |
|-------|--------|-------|
| Type check | PASS | No type errors |
| Lint | PASS | (Pre-existing issues in other packages) |
| Test | FAIL | Pre-existing env config issue |
| Build | FAIL | Pre-existing testkit tsconfig issue |

**Note**: Test and build failures are infrastructure issues, not caused by Phase 9 changes.

## Phase 10 Requirements

### Objective
Validate the complete IAM auth flow works end-to-end in a browser.

### What to Test

1. **Sign-in flow**
   - Email/password sign-in succeeds
   - Session signal fires after sign-in
   - Auth guards redirect correctly
   - Toast notifications appear

2. **Sign-out flow**
   - Sign-out succeeds
   - Session signal fires (CRITICAL - this was the bug we fixed)
   - Auth guards react to session change
   - User redirected to login

3. **Sign-up flow**
   - Email/password sign-up succeeds
   - Session signal fires
   - User is logged in after sign-up

4. **Error handling**
   - Invalid credentials show error toast
   - Network errors are handled gracefully
   - Session expiry is handled

### Testing Approach Options

1. **Browser automation with Playwright MCP**
   - Use `mcp__playwright__` tools to navigate and interact
   - Check console for errors
   - Verify session state changes

2. **Manual testing in dev environment**
   - Start dev server: `bun run dev`
   - Test flows manually
   - Document results

3. **Integration tests with mocked Better Auth**
   - Already have `handler.factory.test.ts` tests
   - May need to fix env config issue first

### Pre-existing Issues to Address

1. **Test environment needs env vars**:
   - Tests fail because `ClientEnv.ts` requires `NEXT_PUBLIC_ENV`
   - Need to create test environment setup or mock env

2. **Build requires testkit tsconfig fix**:
   - Error: testkit types.ts not in project file list
   - Need to fix tsconfig.build.json references

### Files to Reference

| File | Purpose |
|------|---------|
| `packages/iam/client/src/core/atoms.ts` | Canonical atom pattern |
| `packages/iam/client/src/_common/handler.factory.ts` | Handler factory |
| `packages/iam/client/src/_common/__tests__/handler.factory.test.ts` | Existing unit tests |
| `apps/web/src/providers/AuthGuard.tsx` | Auth guard implementation |
| `outputs/type-safety-audit.md` | Type safety audit results |

## Success Criteria

1. Sign-in flow works with session signal firing
2. Sign-out flow works with session signal firing (validates Phase 6 fix)
3. Auth guards react to session changes
4. No console errors during auth flows
5. Toast notifications appear correctly
