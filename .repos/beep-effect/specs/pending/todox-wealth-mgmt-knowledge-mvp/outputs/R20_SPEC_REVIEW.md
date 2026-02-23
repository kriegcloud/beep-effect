# R20 Strict Spec Review

**Spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp`
**Date**: 2026-02-09
**Scope**: Re-run strict review after latest fixes, focused on requested checks.

## Score

**3.75 / 5**

### Breakdown (1.25 each)

1. **R12 Evidence.List `source` matches C-02** — **PASS** (1.25/1.25)
   - R12 `EvidenceSpan.source` fields: `mentionId?; relationEvidenceId?; meetingPrepBulletId?; extractionId?; ontologyId?`.
   - C-02 `source` fields match exactly.
   - References:
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R12_EVIDENCE_MODEL_CANON.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/P0_DECISIONS.md`

2. **Handoff context budget status filled (no TBD)** — **PASS** (1.25/1.25)
   - P0–P4 all have numeric baselines + Zone set; no `TBD` in Context Budget Status.
   - References:
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P0.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P1.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P2.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P3.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P4.md`

3. **Context budget checklist includes critical-info placement item across P0–P4** — **PASS** (1.25/1.25)
   - All handoffs include checklist item: “Critical info appears early and verification appears late.”
   - References:
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P0.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P1.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P2.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P3.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/HANDOFF_P4.md`

4. **Orchestrator prompts match HANDOFF_STANDARDS template** — **FAIL** (0/1.25)
   - The current prompts do not follow the `P[N] Orchestrator Prompt Template` sections (Hard Rules, Inputs, Objectives, Required Outputs, Verification, Phase Completion Requirement). They use a different structure (Context, Your Mission, Critical Patterns, Reference Files, Success Criteria, etc.).
   - References:
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/templates/ORCHESTRATOR_PROMPT_TEMPLATE.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/P0_ORCHESTRATOR_PROMPT.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/P1_ORCHESTRATOR_PROMPT.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/P2_ORCHESTRATOR_PROMPT.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/P3_ORCHESTRATOR_PROMPT.md`
     - `specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs/P4_ORCHESTRATOR_PROMPT.md`

## Notes

- If strict conformance to the template is required, the P0–P4 orchestrator prompts should be refactored to match the exact section headings and required blocks defined in `templates/ORCHESTRATOR_PROMPT_TEMPLATE.md`.
