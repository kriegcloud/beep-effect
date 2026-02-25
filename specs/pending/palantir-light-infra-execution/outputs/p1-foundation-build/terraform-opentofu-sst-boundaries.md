# P1 Terraform/OpenTofu/SST Boundaries

## Owner

- `platform-architecture`

## Inputs

- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/iac-operating-model.md`
- `../../../palantir-light-cloud-architecture-research/outputs/p1-research-execution/runtime-workflow-architecture.md`
- `../p1-foundation-build/foundation-stack-plan.md`

## Exact Tasks

1. Define ownership boundaries for foundation, platform, and application domains.
2. Declare resource interface contracts between Terraform/OpenTofu and SST-managed components.
3. Add CI rules preventing cross-boundary ownership drift.
4. Define handoff contract for new shared resources that cross tooling boundaries.
5. Publish boundary exception process requiring architecture and security approval.

## Entry Criteria

- Split-stack IaC model is accepted as locked input.
- Foundation module inventory exists.
- Runtime team confirms SST app-layer ownership boundaries.

## Exit Criteria

- Boundary matrix is complete for all managed domains.
- CI enforcement and exception workflow are documented.
- G2 packet includes boundary verification output.

## Verification Commands

```sh
rg -n "foundation|platform|application|boundary" specs/pending/palantir-light-infra-execution/outputs/p1-foundation-build/terraform-opentofu-sst-boundaries.md
```

```sh
tofu plan -chdir=infra -detailed-exitcode
```

```sh
bun run check:infra
```

## Rollback/Safety Notes

- If a change crosses boundary ownership without approval, reject merge and revert the change set.
- Boundary exceptions expire after one release window and require explicit renewal.
- No SST component may mutate foundation resources directly.

## Boundary Matrix

| Domain | Primary Tool | Owning Team | State Owner | Notes |
|---|---|---|---|---|
| Foundation controls | Terraform/OpenTofu | platform-foundation | platform-devops | Accounts, network, guardrails, baseline observability |
| Platform runtime primitives | Terraform/OpenTofu | runtime-architecture | platform-devops | Workflow backplane and shared control-plane resources |
| Application runtime wiring | SST | app-runtime | app-runtime | API handlers, function wiring, stage previews |
| Cross-domain interfaces | Terraform/OpenTofu + SST contracts | platform-architecture | platform-devops | Versioned interfaces only, no direct mutation |
