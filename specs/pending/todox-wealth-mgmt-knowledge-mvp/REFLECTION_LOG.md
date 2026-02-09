# Reflection Log: TodoX Wealth Mgmt Knowledge MVP

This log captures phase-end learnings so subsequent phases improve instead of repeating mistakes.

## Protocol

- Add an entry at the end of each phase (P0–P4).
- Keep entries short and actionable:
  - what worked
  - what failed / surprised us
  - what to change in the next phase (specific files / gates)

## Phase P0 (Decisions + Contracts)

- Date: 2026-02-09
- What worked:
  - Locked the core demo narrative and enforced non-goals.
  - Canonicalized evidence-of-record contracts: `Evidence.List` (C-02) and offset drift invariants (C-05).
  - Converted demo-fatal gaps into PR acceptance gates (multi-account, thread aggregation, meeting-prep persistence).
- What failed / surprised us:
  - Cross-doc contract drift was easy to reintroduce (e.g. Evidence.List shape in older outputs).
  - Handoff documents initially lagged repo handoff standards and needed a compliance pass.
- Changes for next phase:
  - In P1/P2, treat `outputs/P0_DECISIONS.md` + `outputs/P1_PR_BREAKDOWN.md` as the only executable contract surfaces; update older outputs only to mark them superseded or align them.
  - Add a short "demo script" section to `README.md` once implementation starts (so UI gates are testable and not subjective).
