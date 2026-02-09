# P0 Orchestrator Prompt

You are executing Phase P0 of the `todox-wealth-mgmt-knowledge-mvp` spec: **Decisions + Contracts**.

## Hard Rules

- Planning/spec work only for P0: do not implement product code in this phase.
- Research stream rule:
  - Read only `outputs/R0_SYNTHESIZED_REPORT_V2.md` for research context.
  - Do not read `outputs/R1–R9` directly; if R0 is insufficient, commission an explorer report and have it merged into R0.
- Enforce non-goals: do not expand into Calendar, webhooks, Outlook, doc editor, or multi-source resolution.
- Evidence rule: SQL evidence is the UI source of truth; RDF provenance is not sufficient for “Evidence Always”.
- **Handoff gate (explicit)**: when context feels ~50% consumed (or before starting a large/risky task), STOP and write/update a checkpoint handoff:
  - `handoffs/HANDOFF_P0.md`
  - `handoffs/P0_ORCHESTRATOR_PROMPT.md` (this file, updated with current state and next steps)

## Inputs

- `outputs/R0_SYNTHESIZED_REPORT_V2.md`
- `README.md` (decisions/open questions list)

## Objectives (Pass/Fail)

1. Lock the MVP scope and demo narrative so it cannot sprawl.
2. Resolve and record the load-bearing decisions:
   - OAuth Connections UX location and deep-link
   - Typed scope expansion error contract (must include `missingScopes` + relink parameters)
   - Gmail -> Documents mapping semantics (`providerAccountId`, idempotency hash inputs, immutability, soft-delete uniqueness)
   - Relation evidence resolvability choice (mandatory `extractionId` vs add `relation.documentId`)
   - Minimum viable `Evidence.List` contract (entity/relation/meeting-prep bullet)
   - `/knowledge` route as the single demo UI
   - Workflow topology choice (SingleRunner vs durable cluster) and table ownership/prefixing if needed
3. Produce a concrete “definition of done” for P1 (implementation plan), including PR boundaries and acceptance gates.

## Required Outputs (Update In-Place)

- Update `README.md` so P0 decisions are explicit (no TBD where implementation depends on it).
- Update `AGENT_PROMPTS.md` if PR gates or delegation rules change.

Optional (recommended if decisions become long):

- Create `outputs/P0_DECISIONS.md` and link it from `README.md`.

## Verification (Spec Only)

```bash
rg -n \"Key Decisions To Lock In P0\" specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md
rg -n \"Evidence\\.List|Evidence\\.list\" specs/pending/todox-wealth-mgmt-knowledge-mvp -S
```

## Phase Completion Requirement (Handoffs)

At the end of P0, you must create/update:

- `handoffs/HANDOFF_P1.md`
- `handoffs/P1_ORCHESTRATOR_PROMPT.md`

