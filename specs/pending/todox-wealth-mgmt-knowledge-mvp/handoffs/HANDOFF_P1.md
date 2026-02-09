# Handoff P1

## Spec

- Name: `todox-wealth-mgmt-knowledge-mvp`
- Location: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Phase Goal (P1: MVP Demo Implementation Plan)

- Produce an executable, PR-by-PR implementation plan to ship the MVP demo defined in `README.md`.
- Ensure every PR has:
  - scope boundaries
  - acceptance gates
  - verification commands
  - explicit dependencies (tables, RPCs, UI routes)

## Current State (From P0)

- P0 decisions recorded in:
  - `README.md` (and optionally `outputs/P0_DECISIONS.md`)
- Primary synthesis input:
  - `outputs/R0_SYNTHESIZED_REPORT_V2.md`

## Next Steps

1. Execute `handoffs/P1_ORCHESTRATOR_PROMPT.md`.
2. Produce `outputs/P1_PR_BREAKDOWN.md` (recommended) and link it from `README.md`.
3. Update this handoff with concrete PR list + gates once P1 is complete.

## Verification Commands (When Implementation Starts)

```bash
# Suggested initial verification entrypoint for implementation PRs
bun run check --filter @beep/todox
```

