# P1 Research: Auth + Access Foundation

Date: 2026-02-22

## Phase objective

Implement private-beta authentication and authorization in `apps/web` using Better Auth magic-link sign-in, Drizzle adapter, Neon Postgres, and server-side allowlist enforcement.

## Current baseline in this repo

- `apps/web` is currently a minimal Next app with no auth stack yet.
- `apps/web/package.json` currently does not include Better Auth/Drizzle auth dependencies.
- No DB schema or migration system is currently wired for auth.

Key files:
- `apps/web/package.json`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`

## High-impact design decisions for P1

1. Use Better Auth as the auth framework and expose auth via App Router catch-all route.
2. Use Drizzle adapter with Neon Postgres for persistent users/sessions/verifications.
3. Use magic-link plugin with an email provider integration (Resend recommended).
4. Enforce invite-only access with server-side allowlist checks before magic-link issuance.
5. Keep auth UX minimal: email input + magic-link callback.

## Recommended file plan

- `apps/web/src/lib/db/client.ts`
- `apps/web/src/lib/db/schema/auth.ts`
- `apps/web/drizzle.config.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/auth-client.ts`
- `apps/web/src/lib/auth/allowlist.ts`
- `apps/web/src/lib/auth/require-approved-session.ts`
- `apps/web/src/app/api/auth/[...all]/route.ts`
- `apps/web/src/middleware.ts`

## Auth flow contract (v1)

1. User submits email on sign-in page.
2. Server validates email against allowlist.
3. Better Auth magic-link flow issues and sends link to approved email.
4. Callback verification creates authenticated DB-backed session.
5. Protected routes verify session and allowlist membership server-side.

Session rules:
- Session lifecycle managed by Better Auth.
- Session transport remains secure (`httpOnly`, secure in prod, bounded TTL).
- Session reads for protected routes should use Better Auth server APIs.

## Allowlist source strategy

Primary source:
1. `ALLOWED_EMAILS` environment variable (comma-separated) for beta simplicity.

Rules:
- Normalize emails to lowercase before lookup.
- Enforce exact-match lookup on normalized email.
- Validate allowlist both at sign-in attempt and protected-route access.

## Execution order (recommended)

1. Implement Neon DB client + Drizzle schema + migration baseline.
2. Implement Better Auth instance with Drizzle adapter.
3. Add magic-link plugin and email provider wiring.
4. Implement allowlist guard in auth flow.
5. Add `requireApprovedSession` helper/middleware for protected routes.
6. Add tests for approved/denied flow, invalid/expired link, missing session.

## Verification pack

Command gates:

```bash
bun run check
bun run test
bun run lint
bun run build
bunx turbo run build --filter=@beep/web
```

Behavior gates:
- Approved email can sign in via magic link.
- Non-approved email is denied server-side.
- Protected routes return unauthorized/forbidden when session is missing/invalid.
- Invalid/expired magic links are rejected.

## Rollout guidance for P1

- Validate sign-in + callback behavior in preview first.
- Keep allowlist edits operationally simple (`ALLOWED_EMAILS` updates only during beta).
- Add request-rate controls around sign-in endpoint.

## Rollback plan for P1

- Revert to previous deploy if auth callback/session handling breaks.
- Keep ability to disable sign-in while preserving protected-route deny-by-default behavior.
- Preserve allowlist checks independent of client UI state.

## P1 phase risk gates

| Risk | Mitigation |
|------|------------|
| Client-only checks accidentally ship | Require route-level server guard helper and tests |
| Email case mismatch bypasses/denies users | Normalize lowercase + exact match |
| Magic-link abuse/replay | short TTL links, one-time verification semantics, rate limiting |
| Sign-in endpoint abuse | Add rate limiting and minimal response leakage |

## References

- `apps/web/package.json`
- `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P1.md`
