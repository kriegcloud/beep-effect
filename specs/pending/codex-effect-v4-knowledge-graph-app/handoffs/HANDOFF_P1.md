# HANDOFF P1: Auth + Access Foundation

## Phase Transition

- From: P0 (Spec + Research + Review)
- To: P1 (Auth + Access Foundation)
- Date: 2026-02-22

## Working Context

Implement private-beta access control in `apps/web` with Better Auth magic-link sign-in, Drizzle adapter, and Neon Postgres, enforced by server-side email allowlist checks.

Non-negotiable constraints:
- No tenant/user graph scoping in v1.
- Shared graph scope remains `graphId = effect-v4`.
- Access is invite-only via approved email addresses.
- Allowlist enforcement must be server-side, not client-only.

## Episodic Context

Completed in P0:
- Architecture and scope were locked in `README.md`.
- Research completed in `outputs/research.md`.
- Decision quality review completed in `outputs/comprehensive-review.md`.
- Canonical pattern review completed in `outputs/canonical-pattern-review.md`.

Locked decisions:
- AD-001 through AD-010 in `README.md`.
- Better Auth magic-link with Neon-backed persistence is primary for v1.

## Semantic Context

Tech stack to use:
- Next.js route handlers in `apps/web`.
- Effect v4 runtime patterns (`effect/unstable/http` and `HttpRouter.toWebHandler` for API routes).
- Better Auth server/client integration under `apps/web/src/lib/auth*`.
- Drizzle schema + migrations with Neon Postgres.

Auth model:
- Email-centric private beta.
- Manual allowlist management.
- No public signup.

## Procedural Context

Reference docs and artifacts:
- `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/QUICK_START.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/p1-auth-allowlist-research.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/comprehensive-review.md`

## Implementation Objectives

1. Implement Better Auth route handler (`/api/auth/[...all]`) and sign-in UX.
2. Implement Better Auth magic-link plugin with email provider wiring.
3. Implement Drizzle adapter + Neon connection and migration baseline.
4. Implement allowlist enforcement for invite-only emails.
5. Protect API surfaces (`/api/chat`, `/api/graph/*`) with server checks.
6. Add tests validating allowlist pass/fail and session validation behavior.

## Target File Surfaces

- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/auth-client.ts`
- `apps/web/src/lib/auth/allowlist.ts`
- `apps/web/src/lib/auth/require-approved-session.ts`
- `apps/web/src/lib/db/client.ts`
- `apps/web/src/lib/db/schema/auth.ts`
- `apps/web/drizzle.config.ts`
- `apps/web/src/app/api/auth/[...all]/route.ts`
- `apps/web/src/middleware.ts`
- `apps/web/src/app/api/chat/route.ts` (gate scaffold)
- `apps/web/src/app/api/graph/search/route.ts` (gate scaffold)

## Verification Commands

```bash
bun run check
bun run test
bun run lint
bun run build
bunx turbo run build --filter=@beep/web
```

## Phase Exit Criteria

- Allowlisted email can establish authenticated session via magic-link sign-in.
- Non-allowlisted email is denied server-side.
- Protected routes reject missing/invalid/non-allowlisted sessions.
- Tests cover allowlist and session verification paths.
- App quality gates remain green.

## Deliverables Checklist

- [ ] Better Auth + magic-link auth foundation implemented
- [ ] Allowlist enforcement implemented server-side
- [ ] Route protection middleware/gates added
- [ ] Test coverage for auth gating behavior
- [ ] `HANDOFF_P2.md` and `P2_ORCHESTRATOR_PROMPT.md` updated with actual outcomes
