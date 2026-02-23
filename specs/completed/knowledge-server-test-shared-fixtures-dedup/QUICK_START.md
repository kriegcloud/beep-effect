# Quick Start: Knowledge Server Test Dedup

## Objective

Extract duplicated test mocks/layers/fixtures into `packages/knowledge/server/test/_shared` and migrate callers safely.

## 5-Minute Launch

1. Read `README.md` and `MASTER_ORCHESTRATION.md`.
2. Start Phase 1 using `handoffs/P1_ORCHESTRATOR_PROMPT.md`.
3. Produce `outputs/codebase-context.md` before editing code.
4. Do not begin broad rewrites without `outputs/remediation-plan.md`.

## Required Phase Outputs

- `outputs/codebase-context.md`
- `outputs/evaluation.md`
- `outputs/remediation-plan.md`
- `outputs/verification-report.md`

## Minimum Verification Commands

Run from repo root after migration changes:

```bash
bun run check
bun run test packages/knowledge/server/test
```

If package-scoped test command is unavailable, run `bun run test` and report the fallback explicitly.

## Guardrails

- Keep helper modules test-local (`packages/knowledge/server/test/_shared/*`).
- Avoid `any`, unchecked casts, and `@ts-ignore`.
- Preserve assertions and behavior; this is structural deduplication.
- Update `REFLECTION_LOG.md` at phase completion.

## Handoff Rule

Each completed phase must produce both:

- `handoffs/HANDOFF_P[N+1].md`
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`
