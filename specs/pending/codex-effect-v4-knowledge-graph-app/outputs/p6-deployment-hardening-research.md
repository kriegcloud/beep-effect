# P6 Research: Deployment Hardening

Date: 2026-02-22

## Phase objective

Finalize production readiness for Vercel deployment with Zep + Better Auth/Neon dependencies, including operational runbooks and rollback procedures.

## Current deployment baseline

- `apps/web` currently has a basic Next setup and no phase-specific production controls yet.
- Auth, graph, and chat routes will be introduced across P1-P5 and hardened here.

Relevant files:
- `apps/web/next.config.ts`
- `apps/web/package.json`
- `turbo.json`

## High-impact hardening decisions

1. Set `runtime = "nodejs"` for API routes using Effect HTTP/AI tooling.
2. Define explicit environment contract with fail-fast startup checks.
3. Add request timeout and error-class logging for all critical API routes.
4. Keep preview and production environment configs separate and documented.
5. Maintain a deploy smoke-test checklist and rollback checklist.

## Environment contract (production)

- `APP_BASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED` (recommended for migrations)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL` (recommended)
- `ZEP_API_KEY`
- `ZEP_BASE_URL` (if non-default)
- `GRAPH_ID` (default `effect-v4`)
- `ALLOWED_EMAILS` (required)

## Recommended runtime controls by route

- `/api/chat`: `runtime = "nodejs"`, timeout guard, structured provider error mapping.
- `/api/graph/search`: `runtime = "nodejs"`, query limits and pagination/fan-out caps.

## Observability and operations checklist

Minimum logging fields per request:
- route
- request id
- user/session id hash (if available)
- graph id
- duration ms
- status code
- upstream error class (if failure)

Minimum operational docs:
- deploy checklist
- post-deploy smoke checks
- incident triage matrix
- rollback steps (config and code rollback)

## Smoke-test suite for deployed env

1. Auth: allowlisted login succeeds; non-allowlisted rejected.
2. Chat: returns grounded response for known prompt.
3. Graph API: query returns nodes/links for known term.
4. Graph UI: interactive expansion works in production build.

## Rollback strategy

Code rollback:
- revert to previous stable deployment.

Config rollback:
- switch `GRAPH_ID` to prior known-good graph if ingestion/regression appears.
- rotate secrets if incident includes credential exposure.

Feature rollback:
- disable expensive chat features independently while preserving core graph APIs.

## P6 phase risk gates

| Risk | Mitigation |
|------|------------|
| Runtime incompatibility in serverless | enforce `runtime = "nodejs"` on Effect-heavy routes |
| Missing/incorrect env causes runtime failure | fail-fast env validation + deploy checklist |
| Hard-to-debug prod incidents | structured logs + smoke tests + clear rollback runbook |

## Verification pack

```bash
bun run check
bun run test
bun run lint
bun run build
bunx turbo run build --filter=@beep/web
```

Plus deployed smoke checks for auth/chat/graph endpoints.

## References

- `apps/web/next.config.ts`
- `apps/web/package.json`
- `turbo.json`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P6.md`
