# todox-auth-integration

> Integrate better-auth authentication from `@beep/iam-client` into `apps/todox`, following the established patterns from `apps/web`.

---

## Purpose

The `apps/todox` application currently has a hardcoded user mock and no authentication flow. This spec integrates the existing better-auth infrastructure from `packages/iam/*` to provide:

- Session-based authentication with `AuthGuard`
- Public route protection with `GuestGuard`
- Auth routes (sign-in, sign-up, reset-password)
- Real user session data replacing hardcoded mocks

## Scope

**In Scope:**
- Create `AuthGuard` and `GuestGuard` providers for todox
- Add auth routes under `/auth/*`
- Replace hardcoded user with session data
- Add supporting components (GuardErrorBoundary, GuardErrorFallback)
- Wire up proper redirect flows

**Out of Scope:**
- Server-side auth (already exists in `packages/iam/server`)
- Auth client implementation (already exists in `packages/iam/client`)
- UI components for auth flows (already exists in `packages/iam/ui`)

## Current State

| Component        | apps/web                       | apps/todox     |
|------------------|--------------------------------|----------------|
| `IamProvider`    | Integrated                     | Integrated     |
| `AuthGuard`      | `src/providers/AuthGuard.tsx`  | Missing        |
| `GuestGuard`     | `src/providers/GuestGuard.tsx` | Missing        |
| Auth routes      | `/auth/*` (4 routes)           | Missing        |
| Session data     | Via `useGetSession`            | Hardcoded mock |
| Error boundaries | `GuardErrorBoundary`           | Missing        |

## Success Criteria

- [ ] `AuthGuard` wraps protected routes and handles session validation
- [ ] `GuestGuard` protects auth pages from authenticated users
- [ ] Auth routes render `@beep/iam-ui` views (SignInView, SignUpView, etc.)
- [ ] Main page uses real session user data
- [ ] Error boundaries handle auth failures gracefully
- [ ] `bun run check --filter @beep/todox` passes
- [ ] Application redirects correctly on auth state changes

## Complexity

**Level: Medium**
- Sessions: 2-3
- Files affected: ~12
- Agents needed: 2-3 (codebase-researcher, code-reviewer, test-writer)

## Key Reference Files

| File                                       | Purpose                                 |
|--------------------------------------------|-----------------------------------------|
| `apps/web/src/providers/AuthGuard.tsx`     | Reference implementation for AuthGuard  |
| `apps/web/src/providers/GuestGuard.tsx`    | Reference implementation for GuestGuard |
| `apps/web/src/app/auth/sign-in/page.tsx`   | Auth route pattern                      |
| `apps/web/src/app/auth/sign-in/layout.tsx` | Layout with GuestGuard                  |
| `apps/todox/src/app/page.tsx`              | Current hardcoded user (lines 30-34)    |
| `apps/todox/src/global-providers.tsx`      | Already has IamProvider                 |

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for 5-minute setup.

## Full Workflow

See [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for complete implementation steps.

## Entry Point

Begin with [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md).
