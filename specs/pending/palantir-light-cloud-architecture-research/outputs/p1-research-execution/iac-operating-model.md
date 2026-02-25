# IaC Operating Model

## Objective

Define deterministic ownership boundaries between SST and Terraform/OpenTofu, preserving app delivery speed while keeping foundational controls and policy boundaries auditable and stable [CIT-004][CIT-027][CIT-029][CIT-032].

## Proposed Split

| Domain | IaC Owner | Rationale | Evidence |
|---|---|---|---|
| App-layer runtime wiring | SST | Faster app-facing iteration on function/API composition and developer feedback loops | CIT-027, CIT-028 |
| Foundational cloud infrastructure | Terraform/OpenTofu | State-centric control over shared primitives, networking, and account-level guardrails | CIT-029, CIT-030, CIT-032, CIT-033 |
| Shared platform policy controls | Terraform/OpenTofu | Policy guardrails and baseline security controls require reviewable plans and stable module boundaries | CIT-010, CIT-011, CIT-031 |
| Workflow integration resources | Terraform/OpenTofu + SST interface contracts | Workflow backplane is foundational; runtime handlers remain app-owned | CIT-012, CIT-013, CIT-030 |
| Developer preview workflows | SST | Preview/stage ergonomics and app-iteration velocity | CIT-027, CIT-028 |

## Module and State Boundaries

1. `foundation` stack: organization/account baseline controls, identity boundaries, shared observability backplane.
2. `platform` stack: workflow orchestration and data/control integration primitives shared by multiple runtimes.
3. `application` stack: service endpoints and runtime handlers, managed through SST components.
4. State ownership rule: each Terraform/OpenTofu module owns one bounded state domain to avoid cross-team lock contention [CIT-029][CIT-030][CIT-033].

## Change and Drift Strategy

- All Terraform/OpenTofu changes require plan review before apply (`plan` as mandatory gate) [CIT-031].
- Drift remediation runs on foundational stacks first, then platform stacks, then application stacks.
- SST changes are constrained from mutating foundational guardrails; cross-boundary requests become module interface changes.

## Operational Controls

| Control | Mechanism | Evidence |
|---|---|---|
| Ownership clarity | Module-level ownership matrix with explicit stack boundaries | CIT-030, CIT-033 |
| Predictable changes | Plan-before-apply policy for foundational stacks | CIT-031 |
| Reconciliation accuracy | State-backed resource tracking as system of record | CIT-029 |
| Multi-provider option path | OpenTofu/Terraform modular parity for future portability | CIT-032, CIT-033 |

## Residual Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Boundary leakage between SST and foundational modules | high | Enforce strict interface contracts and CI checks that reject cross-domain resource ownership. |
| Duplicate definitions across stacks | medium | Maintain a single module catalog and ownership ledger with required reviewers. |
| Toolchain divergence over time | medium | Pin module APIs to versioned contracts and track compatibility windows for Terraform/OpenTofu. |

## Inference Notes

1. Inference: split-stack governance is the minimum structure that preserves both developer velocity and compliance traceability under current constraints.
2. Inference: introducing additional IaC engines before baseline stabilization increases operational risk without proportionate near-term benefit.
