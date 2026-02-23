# P2 Orchestrator Prompt

You are executing Phase 2 of the `knowledge-slice-conventions-review` spec: **Cross-Cut Review (After All Modules)**.

Rules:
- Keep changes contract-preserving unless explicitly documented in `outputs/CONVENTIONS_AUDIT_REPORT.md`.
- Prefer the smallest diff that closes a finding; do not re-architect.
- Prefer `effect/Schema` classes (`S.Class`) for cross-boundary data models where defaults + runtime validation improve robustness.
- Do not convert service contracts (`Context.Tag` shapes) into schema classes.
- If you convert an interface to `S.Class`, update call sites to decode at the boundary using `Schema.decode*` / `S.decode*` and add a test that would fail without the decode/default.

Required updates (as you work):
- Update `outputs/CONVENTIONS_AUDIT_REPORT.md` for any new findings/fixes (with evidence and dates).
- Update `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md` as candidates are completed or deferred.
- Update `outputs/VERIFICATION_REPORT.md` with exact commands + PASS/FAIL + date.

Primary objectives:
1. Cross-cut boundary/convention verification across `packages/knowledge/*` (imports, schema usage, error-handling patterns).
2. Close any deferred P1 items that are now low-risk to complete.
3. Evaluate and optionally implement the `S.Class` conversions listed in `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md`.

Verification:
- Run at least one full-slice verification at the end:
  - `bunx turbo run check lint test --filter='@beep/knowledge-*' --ui=stream`

Phase completion requirement (handoffs):
- At the end of Phase 2, you must create/update:
  - `handoffs/HANDOFF_P2.md` (what changed, what remains, what to do next)
  - `handoffs/P3_ORCHESTRATOR_PROMPT.md` (next phase prompt)

