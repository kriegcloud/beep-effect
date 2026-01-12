# todox-auth-integration Handoff - P1 Phase

> Initial handoff document for Phase 1 execution.

---

## Session Context

**Spec:** todox-auth-integration
**Phase:** P1 (Initial Implementation)
**Objective:** Add better-auth integration to apps/todox

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Spec scaffolding | Complete | README, QUICK_START, MASTER_ORCHESTRATION created |
| Guard providers | Not started | 4 files to create |
| Auth routes | Not started | 8 files to create (4 pages + 4 layouts) |
| Main page integration | Not started | Modify existing page.tsx |

---

## P1 Tasks

### Task 1: Create Guard Infrastructure

Create the following files in `apps/todox/src/providers/`:

1. **GuardErrorBoundary.tsx** - Error boundary class component
2. **GuardErrorFallback.tsx** - Fallback UI for guard errors
3. **AuthGuard.tsx** - Session validation wrapper
4. **GuestGuard.tsx** - Redirect authenticated users from auth pages

**Reference:** See MASTER_ORCHESTRATION.md Phase 1 for full code.

**Verification:**
```bash
bun run check --filter @beep/todox
```

### Task 2: Create Auth Routes

Create auth routes in `apps/todox/src/app/auth/`:

| Route | Page | Layout |
|-------|------|--------|
| `/auth/sign-in` | SignInView | GuestGuard |
| `/auth/sign-up` | SignUpView | GuestGuard |
| `/auth/reset-password` | ResetPasswordView | GuestGuard |
| `/auth/request-reset-password` | RequestResetPasswordView | GuestGuard |

**Reference:** See MASTER_ORCHESTRATION.md Phase 2 for full code.

### Task 3: Integrate with Main Page

Modify `apps/todox/src/app/page.tsx`:

1. Wrap content with `AuthGuard`
2. Replace hardcoded user with session data from `useSession()`

**Reference:** See MASTER_ORCHESTRATION.md Phase 3 for patterns.

---

## Dependencies to Verify

Before implementation, verify these imports work:

```tsx
// These should all resolve
import { useGetSession } from "@beep/iam-client/clients/session";
import { AuthCallback } from "@beep/iam-client";
import { client } from "@beep/iam-client/adapters/better-auth/client";
import { SignInView, SignUpView, ResetPasswordView, RequestResetPasswordView } from "@beep/iam-ui";
import { paths } from "@beep/shared-domain";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { AuthAdapterProvider, useSession } from "@beep/ui/providers";
import { Result } from "@effect-atom/atom-react";
```

If any fail, check:
1. Package is in `apps/todox/package.json` dependencies
2. Path alias is correct in `apps/todox/tsconfig.json`

---

## Success Criteria for P1

- [ ] All 4 provider files created and type-check
- [ ] All 8 auth route files created and type-check
- [ ] Main page wrapped with AuthGuard
- [ ] Hardcoded user replaced with session data
- [ ] `bun run check --filter @beep/todox` passes
- [ ] App loads without runtime errors

---

## Potential Issues

1. **Missing paths.auth**: If `paths.auth.signIn` doesn't exist, use `/auth/sign-in` string literal
2. **AccountSettingsProvider**: This is web-specific - omit from todox AuthGuard
3. **Import alias @/**: Verify `paths` in tsconfig includes `"@/*": ["./src/*"]`

---

## Handoff for Next Session

After completing P1, update REFLECTION_LOG.md with:
- What worked well
- What needed adjustment
- Any remaining tasks for P2
