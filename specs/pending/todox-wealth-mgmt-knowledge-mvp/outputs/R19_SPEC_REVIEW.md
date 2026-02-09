# R19 Spec Review: TodoX Wealth Mgmt Knowledge MVP (Post-Fix)

Date: 2026-02-09
Reviewer: spec-reviewer (strict)
Spec: `specs/pending/todox-wealth-mgmt-knowledge-mvp`

## Summary

The fixes addressed the biggest hygiene gaps from R17 (REFLECTION_LOG now exists; handoffs/prompts include the required sections; Connections UI host is aligned to TodoX Settings; Evidence.List is explicitly canonicalized in R8). However, there are still compliance gaps in the handoffs (context budget tracking left as TBD and missing the "critical info placement" checklist item in P1–P4), and a remaining cross-doc mismatch in the `Evidence.List` response `source` shape between `P0_DECISIONS.md`/`R8_PROVENANCE_PERSISTENCE_AND_API.md` and `R12_EVIDENCE_MODEL_CANON.md`.

**Overall score: 4.4 / 5**

## Rubric (5.0 total)

| Dimension | Weight | Score | Rationale |
|---|---:|---:|---|
| Structure completeness | 1.5 | 1.5 | Required files exist, including `REFLECTION_LOG.md`. |
| Handoff standards compliance | 1.5 | 1.1 | Handoffs now include required sections, but context budget tracking is left as `TBD` and the checklist item for critical info placement is missing in P1–P4. |
| Decision + contract clarity | 1.0 | 0.95 | P0 decisions are locked with no blocking PROPOSED entries; however the Evidence.List `source` fields diverge in R12. |
| Execution plan quality | 0.75 | 0.7 | PR plan is executable with gates; ordering now reflects blockers. Minor residual ambiguity remains only where downstream contracts mismatch (Evidence.List source). |
| Cross-doc consistency | 0.25 | 0.15 | Connections UI host is now consistent, but Evidence.List response shape still drifts between R12 and the canonical C-02 contract. |

**Total: 4.4 / 5**

## Verification Checks (Requested)

- **REFLECTION_LOG present:** Yes (`specs/pending/todox-wealth-mgmt-knowledge-mvp/REFLECTION_LOG.md`).
- **Handoffs + orchestrator prompts compliant:** Mostly yes; missing context budget completion and one checklist line in P1–P4.
- **Cross-doc consistency (Evidence.List, Connections UI host, PR ordering):**
  - Evidence.List: **Not fully consistent** (R12 `source` shape missing `meetingPrepBulletId` and `ontologyId`).
  - Connections UI host: **Consistent** (TodoX Settings → Connections).
  - PR ordering: **Consistent** (PR5 precedes PR4; PR4 explicitly blocked on PR3+PR5).
- **No blocking PROPOSED decisions:** Yes (P0 decisions table is all LOCKED).

## Remaining Fixes Required to Reach 5/5

1) **Evidence.List `source` shape mismatch (cross-doc contract drift)**

- **Problem:** `outputs/P0_DECISIONS.md` C-02 and `outputs/R8_PROVENANCE_PERSISTENCE_AND_API.md` define `source` with `meetingPrepBulletId` and `ontologyId`, but `outputs/R12_EVIDENCE_MODEL_CANON.md` defines `source` as `{ mentionId?; relationEvidenceId?; extractionId?; }` only. This is a contract mismatch in the canonical evidence model.
- **Fix:** Update `outputs/R12_EVIDENCE_MODEL_CANON.md` Evidence.List `source` field to match C-02:
  - Add `meetingPrepBulletId?: string` and `ontologyId?: string` (and ensure `kind: "bullet"` is backed by a bullet id in the `source`).
- **Files:**
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R12_EVIDENCE_MODEL_CANON.md`
  - (Optionally re-validate `outputs/R8_PROVENANCE_PERSISTENCE_AND_API.md` and `outputs/P0_DECISIONS.md` after the change to confirm exact alignment.)

2) **Handoff context budget tracking left as `TBD` (compliance gap)**

- **Problem:** P0–P4 handoffs include a context budget section, but `Direct tool calls`, `Large file reads`, `Sub-agent delegations`, and `Zone` are left as `TBD`. The checklist indicates these must be tracked.
- **Fix:** Fill in the context budget numbers and zone for each handoff (even if "0" or "N/A"), and confirm the checklist items.
- **Files:**
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P0.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P1.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P2.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P3.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P4.md`

3) **Context budget checklist missing the "critical info placement" item in P1–P4**

- **Problem:** HANDOFF_STANDARDS checklist includes "Critical information at document start/end" but this line appears only in P0. P1–P4 omit it.
- **Fix:** Add the checklist line to P1–P4, then mark it as complete if satisfied.
- **Files:**
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P1.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P2.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P3.md`
  - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P4.md`

## Notes

I checked for remaining contract drift, missing mandatory handoff elements, and PR ordering mismatches. The remaining issues are narrow and should be quick to fix; once addressed, this spec meets the 5/5 bar under the repository’s handoff and spec guide requirements.
