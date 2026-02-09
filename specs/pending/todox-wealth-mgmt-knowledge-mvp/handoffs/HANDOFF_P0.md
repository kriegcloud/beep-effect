# Handoff P0

## Spec

- Name: `todox-wealth-mgmt-knowledge-mvp`
- Location: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Phase Goal (P0: Decisions + Contracts)

- Lock scope and non-goals for the MVP demo narrative.
- Resolve the open questions called out in `README.md` and `outputs/R0_SYNTHESIZED_REPORT_V2.md`.
- Freeze the contracts that make implementation deterministic:
  - OAuth linking UX path + incremental consent behavior
  - Typed scope expansion error payload (includes `missingScopes`)
  - Gmail -> Documents mapping table decisions
  - Evidence-of-record model + `Evidence.List` contract
  - `/knowledge` as the single demo surface

## Current State

- Synthesis input exists: `outputs/R0_SYNTHESIZED_REPORT_V2.md` (built from `outputs/R1–R9`).
- Spec scaffold exists:
  - `README.md`
  - `QUICK_START.md`
  - `AGENT_PROMPTS.md`
  - `handoffs/*` (this directory)
  - `templates/*`

## Next Steps

1. Execute `handoffs/P0_ORCHESTRATOR_PROMPT.md`.
2. Record final P0 decisions (either inline in `README.md` or in new `outputs/P0_DECISIONS.md`).
3. Update `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md` with concrete P1 inputs after P0 is done.

## Verification Commands

```bash
# Spec-only sanity checks
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp
rg -n \"Phase Overview\" specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md
rg -n \"handoff gate\" specs/pending/todox-wealth-mgmt-knowledge-mvp
```

