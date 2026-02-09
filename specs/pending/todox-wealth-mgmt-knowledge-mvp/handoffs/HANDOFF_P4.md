# Handoff P4

## Spec

- Name: `todox-wealth-mgmt-knowledge-mvp`
- Location: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Phase Goal

- Production readiness: performance targets, runbooks, retention/audit posture, and rollout plan validated end-to-end.

## Context for Phase 4

### Working Context (keep short)

- Current task:
  - Close all production readiness gates (security/compliance, multi-tenant isolation, ops, observability, workflow topology).
  - Produce runbooks and an operator-ready rollout plan (pilot -> staging -> prod).
  - Confirm data retention and audit posture for evidence and meeting-prep claims.
- Success criteria (pass/fail):
  - Production readiness checklist is complete and signed off.
  - Load/perf is within agreed targets for multi-tenant usage.
  - On-call runbooks exist for the primary failure modes.
  - Rollout is staged with backout steps and monitoring gates.
- Blocking issues:
  - `[list any blockers discovered during P3/P4 execution]`
- Immediate dependencies:
  - P3 staging environment exists and is stable.
  - P2 hardening is complete (evidence + isolation tests).

### Episodic Context (what just happened)

- Prior phase outcome:
  - `[summarize what P3 delivered: staging infra, telemetry, migrations job, known issues]`
- Key decisions made:
  - `[bullets]`

### Semantic Context (invariants)

- Security/compliance invariants:
  - No PII is logged (structured redaction where needed).
  - Claims shown in meeting-prep are grounded in persisted evidence and include disclaimers (no guarantees).
  - Retention and audit posture is documented and enforceable.
- Multi-tenant invariants:
  - Cross-org leakage is prevented and continuously tested.
- Ops invariants:
  - Backups/DR are configured and tested (at least tabletop for MVP).
  - Rollback/backout is defined and validated.

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`

## Completed Work

- `[bullets of what changed in P4 so far]`

## Current State

- `[what exists now, what is still missing]`

## Next Steps

1. `[next action]`
2. `[next action]`

## Verification Commands

```bash
# Record exact commands and PASS/FAIL + date after execution.
#
# Include:
# - load/perf test commands and targets
# - incident drill / tabletop steps (if applicable)
# - rollback test steps
```

## Handoff Gate (Explicit)

- When context feels ~50% consumed (or before large/risky work), STOP and checkpoint:
  - Update this file (`handoffs/HANDOFF_P4.md`) and the active prompt (`handoffs/P4_ORCHESTRATOR_PROMPT.md`).
  - Create/update an end-state summary in the spec (e.g. `README.md` links to runbooks and readiness checklist).

