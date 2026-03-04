# P1 Orchestrator Prompt

Execute Phase P1 for `specs/pending/palantir-light-infra-execution`.

Requirements:
- Preserve split-stack IaC boundaries from locked inputs.
- Focus on executable foundation build and security baseline controls.
- Update and validate these files:
  - `outputs/p1-foundation-build/foundation-stack-plan.md`
  - `outputs/p1-foundation-build/network-and-security-baseline.md`
  - `outputs/p1-foundation-build/terraform-opentofu-sst-boundaries.md`

Deliverable expectations:
- Plan-before-apply workflow and stack order for dev, stage, prod.
- Network/security baseline checks with guardrail verification.
- Enforceable boundary rules between Terraform/OpenTofu and SST.

Verification before handoff:

```sh
rg -n "Terraform|OpenTofu|SST|G2|Verification Commands" specs/pending/palantir-light-infra-execution/outputs/p1-foundation-build
```
