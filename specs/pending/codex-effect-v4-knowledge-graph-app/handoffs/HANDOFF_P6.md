# HANDOFF P6: Deployment Hardening

## Phase Transition

- From: P5 (Graph UI + Atom State)
- To: P6 (Deployment Hardening)
- Date: 2026-02-22

## Working Context

Finalize production hardening for deployment across Vercel + Zep with Better Auth/Neon auth infrastructure.

Update this handoff with concrete P5 outcomes before implementation.

## Objectives

1. Finalize environment variable contract and runtime constraints.
2. Add rate limiting/timeouts/retry guardrails where needed.
3. Document deployment, verification, and rollback runbooks.
4. Validate preview and production deployment paths.

## Target File Surfaces

- `apps/web/vercel.json` (if needed)
- `apps/web/README.md` or deployment docs
- app runtime/config files and middleware as needed
- `specs/pending/codex-effect-v4-knowledge-graph-app/README.md` (status updates)
- `specs/pending/codex-effect-v4-knowledge-graph-app/REFLECTION_LOG.md`

## Verification Commands

```bash
bun run check
bun run test
bun run lint
bun run build
bunx turbo run build --filter=@beep/web
```

Add deployment smoke checks for:
- Auth allowlist behavior
- Chat route
- Graph search route

## Phase Exit Criteria

- Preview/prod deployments succeed with documented env requirements.
- Operational runbooks include incident and rollback procedures.
- Core routes pass smoke checks in deployed environment.
- Spec can be moved from pending to completed.

## Deliverables Checklist

- [ ] Deployment configuration validated
- [ ] Runbooks completed (deploy/verify/rollback)
- [ ] Deployed smoke checks documented
- [ ] Spec status updated for completion move criteria
