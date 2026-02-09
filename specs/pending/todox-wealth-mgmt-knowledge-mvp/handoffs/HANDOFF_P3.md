# Handoff P3

## Spec

- Name: `todox-wealth-mgmt-knowledge-mvp`
- Location: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Phase Goal

- Stand up staging-grade infrastructure and deployment, aligned to `@beep/shared-env` schemas and the demo requirements.

## Context for Phase 3

### Working Context (keep short)

- Current task:
  - Produce an IaC baseline for staging (and a clear path to prod).
  - Wire secrets, migrations job, and OTLP endpoints end-to-end.
  - Ensure staging deploy is reproducible with no manual steps beyond `terraform apply` + deploy pipeline.
- Success criteria (pass/fail):
  - Staging deploy works without manual hotfixing.
  - Database migrations run as a job (no app-startup migrations).
  - Secret manager is the only source of secrets (no committed tfvars, no plaintext).
  - OTLP traces/logs/metrics land in a dashboard with alerts.
  - Env vars align with `@beep/shared-env` schemas (no drift).
- Blocking issues:
  - `[list any blockers discovered during P2/P3 execution]`
- Immediate dependencies:
  - P0 decisions recorded in `README.md`
  - P2 implementation outcomes and any integrity/test gates added

### Episodic Context (what just happened)

- Prior phase outcome:
  - `[summarize what P2 delivered: hardening, tests, constraints, known issues]`
- Key decisions made:
  - `[bullets]`

### Semantic Context (invariants)

- Scope and non-goals (verbatim):
  - The MVP is: Gmail -> Documents -> Knowledge graph -> `/knowledge` UI -> meeting prep with persisted evidence.
  - Non-goals: calendar sync, webhooks, doc editor, multi-source resolution, Outlook/IMAP.
- Operations invariants:
  - Migrations are applied as a single-run job (idempotent, serialized).
  - Secrets are stored in a secret manager, injected at runtime, never logged.
  - Every environment has OTLP endpoints configured and verified.

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`

## Completed Work

- `[bullets of what changed in P3 so far]`

## Current State

- `[what exists now, what is still missing]`

## Next Steps

1. `[next action]`
2. `[next action]`

## Verification Commands

```bash
# Record exact commands and PASS/FAIL + date after execution.
#
# Suggested staging verification categories:
# - migrations job run
# - health check(s)
# - telemetry visible (traces/logs/metrics)
# - basic demo smoke path
```

## Handoff Gate (Explicit)

- When context feels ~50% consumed (or before large/risky work), STOP and checkpoint:
  - Update this file (`handoffs/HANDOFF_P3.md`) and the active prompt (`handoffs/P3_ORCHESTRATOR_PROMPT.md`).
  - Create/update next-phase artifacts even if P3 is not complete:
    - `handoffs/HANDOFF_P4.md`
    - `handoffs/P4_ORCHESTRATOR_PROMPT.md`

