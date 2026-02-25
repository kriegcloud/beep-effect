# Palantir-Light Infra Execution

## Objective

Deliver an execution-ready infrastructure specification that operationalizes locked architecture decisions into gated, owner-assigned work for foundation build, runtime controls, cutover, and rollback.

## Locked Inputs

All items below are source-of-truth decisions from the prior cloud architecture spec and are not reopened here.

- Go/No-Go state: no-go until runtime replay risk is closed.
  - `../palantir-light-cloud-architecture-research/outputs/p2-validation/final-recommendation.md`
  - `../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-results.md`
  - `../palantir-light-cloud-architecture-research/outputs/p2-validation/risk-register.md`
- Runtime closure requirement: implement `RRC-001.v1` in `platform-runtime-v1` and meet replay/resume thresholds.
  - `../palantir-light-cloud-architecture-research/outputs/p2-validation/validation-plan.md`
  - `../palantir-light-cloud-architecture-research/outputs/p2-validation/gap-analysis.md`
- IaC model decision: split stack boundaries (`Terraform/OpenTofu` for foundation/platform; `SST` for app runtime wiring).
  - `../palantir-light-cloud-architecture-research/outputs/p1-research-execution/iac-operating-model.md`
- Cloud baseline decision: AWS-first, aws-dominant baseline with specialized providers deferred.
  - `../palantir-light-cloud-architecture-research/outputs/p1-research-execution/aws-first-reference-architecture.md`
- Control and evidence baseline: policy precedence, provenance envelope, SOC2 control mappings.
  - `../palantir-light-cloud-architecture-research/outputs/p1-research-execution/policy-plane-design.md`
  - `../palantir-light-cloud-architecture-research/outputs/p1-research-execution/provenance-audit-architecture.md`
  - `../palantir-light-cloud-architecture-research/outputs/p1-research-execution/compliance-control-mapping.md`
  - `../palantir-light-cloud-architecture-research/outputs/p2-validation/implementation-readiness-checklist.md`

## Scope / Non-goals

### Scope

- Define executable phase outputs for P0-P3 with exact tasks and gates.
- Define ownership, RACI, and escalation for infra execution.
- Define verification and rollback controls for foundation, runtime, and cutover.
- Define acceptance reporting structure for production-go decisioning.

### Non-goals

- New architecture discovery or provider reassessment.
- New evidence taxonomy or scoring framework design.
- Modifying prior research artifacts or changing locked decisions.
- Product feature implementation in `apps/web`.

## Phase Model (P0-P3)

| Phase | Purpose | Output Directory |
|---|---|---|
| P0 | Execution readiness: prerequisites, environment/secrets, ownership | `outputs/p0-execution-readiness/` |
| P1 | Foundation build: core stacks, network/security baseline, IaC boundaries | `outputs/p1-foundation-build/` |
| P2 | Runtime and controls: `RRC-001`, audit/provenance wiring, CI/CD and drift controls | `outputs/p2-runtime-and-controls/` |
| P3 | Cutover and validation: RR execution, go-live checks, rollback, acceptance reporting | `outputs/p3-cutover-and-validation/` |

## Execution Gates

| Gate | Decision | Required Evidence |
|---|---|---|
| G0 | Locked inputs acknowledged and change control active | Signed ownership map and locked-input checklist |
| G1 | Execution prerequisites complete | Environment/secrets matrix approved; access and toolchain verified |
| G2 | Foundation baseline stable | Foundation apply records, network/security baseline checks, boundary checks |
| G3 | Runtime controls complete | `RRC-001.v1` implementation evidence, audit/provenance linkage, CI/CD drift controls active |
| G4 | Cutover readiness confirmed | RR execution report, go-live checklist sign-off, rollback drill evidence, acceptance report |

## Risk Register (Operational Only)

| Risk ID | Operational Risk | Impact | Mitigation Owner | Gate |
|---|---|---|---|---|
| OR-001 | Foundation changes applied without reviewed plans | high | platform-foundation | G2 |
| OR-002 | Environment secrets drift or rotation gaps | high | platform-security | G1 |
| OR-003 | Replay/resume duplicates during reconnect bursts | critical | runtime-architecture | G3 |
| OR-004 | Audit/provenance links incomplete for release evidence | high | data-architecture | G3 |
| OR-005 | Drift accumulates between planned and deployed infra state | high | platform-devops | G2/G3 |
| OR-006 | Cutover without proven rollback path | critical | release-management | G4 |

## Verification Commands

Run from repository root.

```sh
find specs/pending/palantir-light-infra-execution -type f | sort
```

```sh
rg -n "^## (Owner|Inputs|Exact Tasks|Entry Criteria|Exit Criteria|Verification Commands|Rollback/Safety Notes)" specs/pending/palantir-light-infra-execution/outputs
```

```sh
jq '.lastUpdated, .stats.totalOutputs, .stats.phaseCount' specs/pending/palantir-light-infra-execution/outputs/manifest.json
```

## Definition of Done

Infra execution spec is ready when:

- All required files in this spec directory exist and are populated with execution content.
- Every phase output file contains owner, inputs, exact tasks, entry criteria, exit criteria, verification commands, and rollback/safety notes.
- Manifest includes every output path, per-phase status, counts/stats, and `lastUpdated` set to `2026-02-25`.
- Gate, ownership, and verification instructions are executable without adding architecture discovery artifacts.
