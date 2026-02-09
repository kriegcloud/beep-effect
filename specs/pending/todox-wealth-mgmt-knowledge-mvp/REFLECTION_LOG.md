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
  - Locked the incremental consent remediation wire contract (C-01) so UI can re-link without parsing error strings.
  - Canonicalized evidence-of-record contracts: `Evidence.List` (C-02) and offset drift invariants (C-05).
  - Locked Gmail → Documents mapping invariants (C-03) to prevent identity drift across re-sync and tombstone/resurrect flows.
  - Converted demo-fatal gaps into PR acceptance gates (multi-account, thread aggregation, meeting-prep persistence).
- What failed / surprised us:
  - Cross-doc contract drift was easy to reintroduce (e.g. Evidence.List shape in older outputs).
  - Offset semantics are easy to under-specify; explicitly locking 0-indexed, end-exclusive `[startChar, endChar)` avoided later highlight off-by-one churn.
  - Handoff documents initially lagged repo handoff standards and needed a compliance pass.
- Changes for next phase:
  - In P1/P2, treat `outputs/P0_DECISIONS.md` + `outputs/P1_PR_BREAKDOWN.md` as the only executable contract surfaces; update older outputs only to mark them superseded or align them.
  - Add tests early that assert wire-level `tag` matching (not `_tag`/`instanceof`) and highlight slicing semantics (`content.slice(startChar, endChar)`).
  - Add a short "demo script" section to `README.md` once implementation starts (so UI gates are testable and not subjective).

## Phase P1 (MVP Demo Implementation Plan)

- Date: 2026-02-09
- What worked:
  - Converted PR gates to atomic, grep-friendly `- [PASS/FAIL] ...` statements so implementation does not depend on interpreting prose.
  - Added explicit global demo-fatal acceptance gates: `apps/server` boundary, required `providerAccountId`, evidence spans pinned to `documentVersionId`, and “no fragile join path” for relation evidence.
  - Made the dependency explicit: `/knowledge` UI is blocked on persisted evidence-backed meeting prep (PR4 blocked on PR3 + PR5).
- What failed / surprised us:
  - The provided `rg` verification snippet using double-quotes and backticks triggers shell command substitution in `zsh` (`permission denied: apps/server`); use single quotes or escape backticks.
  - Some earlier gates were compound; splitting them into atomic gates reduced ambiguity and review churn.
- Changes for next phase:
  - In P2, treat any acceptance gate failure as a hard stop; do not “paper over” gaps with UI mocks.
  - Add tests early for `Evidence.List returns documentVersionId for every evidence row` and `Relation evidence never requires relation.extractionId -> extraction.documentId`.
  - Keep `/knowledge` UI work blocked until PR3 + PR5 gates are green (persisted evidence + meeting prep).
