# Handoff P1: Foundation Build

## Mission

Execute foundation stack build planning and baseline controls for network/security while preserving split-stack IaC boundaries.

## Locked Inputs

- `../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/aws-first-reference-architecture.md`
- `../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/iac-operating-model.md`
- `../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/policy-plane-design.md`
- `../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/compliance-control-mapping.md`

## Deliverables

- `../outputs/p1-foundation-build/foundation-stack-plan.md`
- `../outputs/p1-foundation-build/network-and-security-baseline.md`
- `../outputs/p1-foundation-build/terraform-opentofu-sst-boundaries.md`

## Execution Contract

- Foundation and platform infrastructure are managed by Terraform/OpenTofu.
- Application runtime wiring remains under SST ownership.
- Any cross-boundary resource request requires an interface contract update.

## Completion Criteria

- G2 checks are defined with concrete plan/apply and baseline verification commands.
- Network and security baselines include guardrails and rollback triggers.
- IaC boundary ownership is explicit and enforceable in CI.

## Verification

```sh
rg -n "Terraform|OpenTofu|SST|boundary|G2" specs/pending/palantir-light-infra-execution/outputs/p1-foundation-build
```
