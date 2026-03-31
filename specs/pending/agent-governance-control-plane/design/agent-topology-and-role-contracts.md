# Agent Topology And Role Contracts

## Objective

This design defines the canonical agent catalog for the governance control plane. Each role has explicit ownership, explicit outputs, and explicit rejection authority.

## Canonical Agent Classes

| Agent Class | Primary Responsibility | Output |
|---|---|---|
| Governance Orchestrator | owns phase execution, packet assembly, and final integration | phase output, cross-auditor synthesis, handoff |
| Implementation Executor | executes an approved `Execution Packet` without inventing scope | code changes or refined artifacts plus verification results |
| Domain Worker | performs bounded implementation or formalization work inside a disjoint scope | scoped changes plus local verification |
| Adversarial Auditor | blocks drift against laws, contracts, and acceptance criteria | blockers plus acceptance conditions |
| Drift Auditor | compares current work against prior packet, prior phase, and repo reality | drift report |

## Required Auditor Families

| Auditor | Required Ownership |
|---|---|
| Repo Reality Auditor | confirms active destination surface and flags stale assumptions |
| Schema And Brand Auditor | enforces schema-first and branded-domain laws |
| Effect Data Auditor | enforces Effect-native replacements for native helpers and typed failure posture |
| Service And Layer Boundary Auditor | enforces service-shape integrity and layer-boundary integrity |
| HTTP Boundary Auditor | enforces `effect/unstable/http` and `effect/unstable/httpapi` usage |
| State And Ref Auditor | enforces correct `Ref`-family usage and bans ad-hoc mutable state |
| Duplication And Reuse Auditor | enforces reuse and rejects duplicate abstractions |
| JSDoc And Docgen Auditor | enforces exported-surface documentation and examples |
| Verification And Quality Gate Auditor | enforces command coverage and closure criteria |
| Cross-Phase Drift Auditor | enforces alignment with prior phase outputs and approved packets |

## Role Contract Rules

1. The Governance Orchestrator is required to own final packet contents.
2. Worker agents are required to operate inside explicit write or authorship scopes.
3. Auditor agents are required to return blockers and concrete acceptance conditions.
4. Cheerleader-style reviews are not allowed.
5. Role overlap that obscures ownership is not allowed.
6. A worker is not allowed to overrule an auditor.
7. An auditor is not allowed to widen product scope.

## Blocker Contract

Every adversarial auditor output is required to include:

1. `lawFamily`
2. `violatedRequirement`
3. `location`
4. `evidence`
5. `requiredChange`
6. `acceptanceCondition`
7. `severity`

## Acceptance Condition Contract

Acceptance conditions are required to be:

- specific
- verifiable
- scoped to the blocker
- phrased as closure criteria rather than advice

## Ownership Consequence

This topology creates a single authority model:

- orchestrators own integration and packet emission
- workers own bounded production work
- auditors own rejection authority for governance drift

Any future prompt asset or consumer workflow is required to reuse these role contracts.
