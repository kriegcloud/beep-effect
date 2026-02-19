# P3 Orchestrator Prompt

You are executing Phase 3 of the `knowledge-slice-conventions-review` spec: **Synthesis (Report + Follow-Ups)**.

Rules:
- Keep any remaining changes contract-preserving unless explicitly documented in `outputs/CONVENTIONS_AUDIT_REPORT.md`.
- Prefer the smallest diff; no re-architecture.

Primary objectives:
1. Produce a concrete synthesis summary of the spec:
   - prioritized findings (P0-P3) with evidence links
   - interface-to-`S.Class` conversions completed vs deferred (and reasons)
   - risk assessment + rollback notes (if applicable)
2. Ensure all Phase 2 artifacts are accurate and up to date:
   - `outputs/CONVENTIONS_AUDIT_REPORT.md`
   - `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md`
   - `outputs/VERIFICATION_REPORT.md`
3. Decide spec state transitions:
   - if all objectives are complete, update `specs/README.md` / spec status as appropriate and prepare to move the spec to `specs/completed/` (only if consistent with repo workflow).

Verification:
- Ensure at least one full-slice verification is recorded:
  - `bunx turbo run check lint test --filter='@beep/knowledge-*' --ui=stream`

Phase completion requirement (handoffs):
- At the end of Phase 3, you must create/update:
  - `handoffs/HANDOFF_P3.md`
  - `handoffs/P4_ORCHESTRATOR_PROMPT.md` (if another phase is needed; otherwise state explicitly that Phase 4 is not required)

