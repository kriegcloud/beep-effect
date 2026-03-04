# P2 Orchestrator Prompt

Execute Phase P2 for `specs/pending/palantir-light-infra-execution`.

Requirements:
- Implement runtime/control execution path for `RRC-001.v1` closure.
- Keep all thresholds and closure conditions aligned with locked inputs.
- Update and validate these files:
  - `outputs/p2-runtime-and-controls/rrc-001-implementation-runbook.md`
  - `outputs/p2-runtime-and-controls/audit-provenance-wiring-plan.md`
  - `outputs/p2-runtime-and-controls/ci-cd-plan-apply-and-drift.md`

Deliverable expectations:
- Task-level runbook for RT-T001 through RT-T012.
- Audit/provenance linkage requirements for release evidence.
- CI/CD plan with drift detection and safety gates.

Verification before handoff:

```sh
rg -n "RRC-001|RT-T0|duplicate|resume|drift|G3" specs/pending/palantir-light-infra-execution/outputs/p2-runtime-and-controls
```
