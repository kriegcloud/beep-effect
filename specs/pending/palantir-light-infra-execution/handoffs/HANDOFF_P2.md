# Handoff P2: Runtime and Controls

## Mission

Operationalize runtime reliability and control-plane evidence requirements, including `RRC-001.v1` implementation, audit/provenance wiring, and CI/CD drift controls.

## Locked Inputs

- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-plan.md`
- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-results.md`
- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/gap-analysis.md`
- `../../palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md`

## Deliverables

- `../outputs/p2-runtime-and-controls/rrc-001-implementation-runbook.md`
- `../outputs/p2-runtime-and-controls/audit-provenance-wiring-plan.md`
- `../outputs/p2-runtime-and-controls/ci-cd-plan-apply-and-drift.md`

## Execution Contract

- `RRC-001.v1` must be implemented in `platform-runtime-v1` before RR scenario execution.
- Critical risk closure is evidence-driven and threshold-gated.
- CI/CD must enforce plan-before-apply and continuous drift detection.

## Completion Criteria

- G3 checks are explicitly defined and command-verifiable.
- Runtime controls include acceptance thresholds for duplicate suppression and resume success.
- Audit/provenance evidence paths are wired for release-readiness decisions.

## Verification

```sh
rg -n "RRC-001|duplicate|resume|drift|G3" specs/pending/palantir-light-infra-execution/outputs/p2-runtime-and-controls
```
