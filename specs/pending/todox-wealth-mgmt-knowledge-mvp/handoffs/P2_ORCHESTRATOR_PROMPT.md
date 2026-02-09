# P2 Orchestrator Prompt

You are executing Phase P2 of the `todox-wealth-mgmt-knowledge-mvp` spec: **Hardening**.

## Hard Rules

- P2 allows implementation work, but must remain scoped to the MVP demo narrative and the `/knowledge` surface.
- Enforce non-goals: do not expand into Calendar, webhooks, Outlook/IMAP, doc editor, multi-source resolution.
- Evidence rule: SQL evidence is the UI source of truth; RDF provenance is not sufficient for "Evidence Always".
- Multi-tenant rule: org isolation is demo-fatal if violated; include cross-org tests as part of P2 acceptance.
- **Handoff gate (explicit)**:
  - If context feels ~50% consumed (or before starting a large/risky task), STOP and checkpoint:
    - update `handoffs/HANDOFF_P2.md`
    - update `handoffs/P2_ORCHESTRATOR_PROMPT.md` with current state + remaining work
  - At the same gate, create/update next-phase artifacts even if P2 is not complete:
    - `handoffs/HANDOFF_P3.md`
    - `handoffs/P3_ORCHESTRATOR_PROMPT.md`

## Inputs

- `README.md` (scope, success criteria, phase plan, invariants)
- `AGENT_PROMPTS.md` (acceptance gates to preserve)
- `outputs/R0_SYNTHESIZED_REPORT_V2.md` (source of research truth)
- `outputs/P1_PR_BREAKDOWN.md` (if it exists; executable PR plan and gates)

## Objectives (Pass/Fail)

1. Restart-safe demo path:
   - After a full server restart, the `/knowledge` demo path still works and all evidence links still resolve.
2. Evidence integrity + resolvability:
   - No "optional join dead ends" where evidence exists but cannot be resolved to `documentId + offsets`.
3. Meeting-prep evidence durability:
   - Meeting-prep output is persisted as an object-of-record (bullets/sections) with explicit citations to evidence spans.
4. Multi-tenant isolation hardening:
   - Add cross-org tests across the demo query paths, including embeddings + provenance/persistence.
5. Idempotency hardening:
   - Re-running Gmail materialization/extraction does not create duplicates or drift in identity mapping.

## Required Outputs (Update In-Place)

- Update `handoffs/HANDOFF_P2.md` as implementation proceeds (decisions, invariants, verification commands).
- Update `README.md` if any P0 contract changes are required by hardening (avoid stealth drift).

Optional (recommended):

- Create a P2 hardening checklist at `outputs/P2_HARDENING_CHECKLIST.md` and link it from `README.md`.

## Verification

```bash
# Record exact commands and PASS/FAIL + date after execution.
#
# Suggested categories to include:
# - org isolation test(s)
# - evidence resolvability test(s)
# - restart-safety smoke test (end-to-end)
```

## Phase Completion Requirement (Handoffs)

At the end of P2, create/update:

- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`

