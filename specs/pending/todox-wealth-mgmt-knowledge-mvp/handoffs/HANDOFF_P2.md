# Handoff P2

## Spec

- Name: `todox-wealth-mgmt-knowledge-mvp`
- Location: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Phase Goal

- Hardening the MVP demo path so it is restart-safe, evidence-resolvable, and isolation-safe (multi-tenant).

## Context for Phase 2

### Working Context (keep short)

- Current task:
  - Implement integrity constraints + idempotency invariants for Gmail -> Documents -> Knowledge.
  - Make meeting-prep evidence durable (bullets -> citations) and restart-safe.
  - Add cross-org isolation tests on all demo query paths.
- Success criteria (pass/fail):
  - Demo is restart-safe: after a full server restart, `/knowledge` still renders graph + meeting-prep with evidence.
  - Evidence resolvability: no evidence entry can point to a missing/unjoinable document/span.
  - Multi-tenant isolation: no cross-org data can be returned by any demo RPC or UI surface (including embeddings).
  - Idempotency: reruns do not duplicate documents/mentions/extractions.
- Blocking issues:
  - `[list any blockers discovered during P1/P2 execution]`
- Immediate dependencies:
  - P0 decisions recorded in `README.md` (and optional `outputs/P0_DECISIONS.md`)
  - P1 executable plan (expected in `outputs/P1_PR_BREAKDOWN.md` if created)

### Episodic Context (what just happened)

- Prior phase outcome:
  - `[summarize what P1 produced: PR plan, gates, accepted decisions]`
- Key decisions made:
  - `[bullets]`

### Semantic Context (invariants)

- Scope and non-goals (verbatim):
  - The MVP is: Gmail -> Documents -> Knowledge graph -> `/knowledge` UI -> meeting prep with persisted evidence.
  - Non-goals: calendar sync, webhooks, doc editor, multi-source resolution, Outlook/IMAP.
  - SQL is the evidence-of-record for UI; RDF provenance is not sufficient for "Evidence Always".
- Evidence/integrity invariants:
  - Evidence spans returned to the UI always include `documentId + offsets`.
  - Relation evidence never becomes unresolvable due to optional joins.
  - Every meeting-prep claim shown in the demo has at least one evidence span.

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`

## Completed Work

- `[bullets of what changed in P2 so far]`

## Current State

- `[what exists now, what is still missing]`

## Next Steps

1. `[next action]`
2. `[next action]`

## Verification Commands

```bash
# Record exact commands and PASS/FAIL + date after execution.
```

## Handoff Gate (Explicit)

- When context feels ~50% consumed (or before large/risky work), STOP and checkpoint:
  - Update this file (`handoffs/HANDOFF_P2.md`) and the active prompt (`handoffs/P2_ORCHESTRATOR_PROMPT.md`).
  - Create/update next-phase artifacts even if P2 is not complete:
    - `handoffs/HANDOFF_P3.md`
    - `handoffs/P3_ORCHESTRATOR_PROMPT.md`

