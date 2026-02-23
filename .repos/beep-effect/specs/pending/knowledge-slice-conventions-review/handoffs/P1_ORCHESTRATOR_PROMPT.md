# P1 Orchestrator Prompt

You are executing the `knowledge-slice-conventions-review` spec.

Rules:
- Step through modules in order: domain -> tables -> server -> client -> ui.
- Apply fixes as you go (contract-preserving; smallest diff that closes the finding).
- Prefer `effect/Schema` classes (`S.Class`) for cross-boundary data models and where defaults + runtime validation improve robustness.
- Do not convert service contracts (Context.Tag shapes) into schema classes.
- After each module, update:
  - `outputs/modules/<module>.md`
  - `outputs/MODULE_AUDIT_MATRIX.md`
  - `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md` (if relevant)
  - `outputs/VERIFICATION_REPORT.md`
- Run module-scoped verification after changes; run full-slice verification at the end.

Deliverable: a final `outputs/CONVENTIONS_AUDIT_REPORT.md` + `outputs/VERIFICATION_REPORT.md` with evidence links and dates.

