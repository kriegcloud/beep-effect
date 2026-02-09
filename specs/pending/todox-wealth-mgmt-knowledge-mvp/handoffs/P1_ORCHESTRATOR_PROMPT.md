# P1 Orchestrator Prompt

You are executing Phase P1 of the `todox-wealth-mgmt-knowledge-mvp` spec: **MVP Demo Implementation Plan**.

## Hard Rules

- This phase produces a plan (PR breakdown + gates). Do not implement product code in P1.
- Research stream rule: use `outputs/R0_SYNTHESIZED_REPORT_V2.md` as the source of research truth.
- Keep the MVP constrained to the single demo narrative and `/knowledge` surface.
- **Handoff gate (explicit)**: when context feels ~50% consumed (or before starting a large/risky task), STOP and checkpoint:
  - update `handoffs/HANDOFF_P1.md`
  - update `handoffs/P1_ORCHESTRATOR_PROMPT.md` with current state + remaining work

## Inputs

- `README.md` (scope, success criteria, phase plan)
- `outputs/R0_SYNTHESIZED_REPORT_V2.md` (blockers, decisions, proposed approach)
- `AGENT_PROMPTS.md` (PR strategy + acceptance gates)

## Objectives (What “Done” Means)

1. Produce a PR-by-PR plan that is implementable without re-deriving requirements.
2. For each PR, define:
   - exact feature scope
   - key files/packages likely impacted (at least at package level)
   - required schema/RPC contracts
   - acceptance gates (pass/fail)
   - verification commands (`bun run check`, targeted tests, etc.)
3. Define a minimal end-to-end demo checklist aligned with `README.md` success criteria.

## Outputs

Recommended:

- Create `outputs/P1_PR_BREAKDOWN.md` containing the PR plan + gates.
- Link it from `README.md`.

## Verification (Spec Only)

```bash
rg -n \"Success Criteria\" specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md
rg -n \"PR Breakdown Strategy\" specs/pending/todox-wealth-mgmt-knowledge-mvp/AGENT_PROMPTS.md
```

## Phase Completion Requirement (Handoffs)

At the end of P1, create/update:

- `handoffs/HANDOFF_P2.md`
- `handoffs/P2_ORCHESTRATOR_PROMPT.md`

