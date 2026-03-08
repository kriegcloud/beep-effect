# P0-P4 Handoff — `@beep/semantic-web`

## Objective

Carry the formal `@beep/semantic-web` spec or later implementation-planning work through the defined P0-P4 sequence without reopening settled defaults unless conflicting local evidence requires it.

## Mode Handling

If you are operating in Plan Mode, do not edit spec artifacts yet. First read the required inputs, confirm which defaults are already locked, resolve remaining ambiguities through non-mutating exploration and targeted user questions, and produce a decision-complete phase plan. Only write or refine the current phase output artifact when operating outside Plan Mode.

## Required Read Order

1. [README.md](../README.md)
2. [outputs/manifest.json](../outputs/manifest.json)
3. the current phase output
4. the relevant design note for that phase
5. the preserved research notes only when deeper evidence is needed

## Phase Sequence

| Phase | Focus | Output | Handoff | Orchestrator |
|---|---|---|---|---|
| P0 | Package Topology and Boundaries | [p0-package-topology-and-boundaries.md](../outputs/p0-package-topology-and-boundaries.md) | [HANDOFF_P0.md](./HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md) |
| P1 | Core Schema and Value Design | [p1-core-schema-and-value-design.md](../outputs/p1-core-schema-and-value-design.md) | [HANDOFF_P1.md](./HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md) |
| P2 | Adapter and Representation Design | [p2-adapter-and-representation-design.md](../outputs/p2-adapter-and-representation-design.md) | [HANDOFF_P2.md](./HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) |
| P3 | Service Contract and Metadata Design | [p3-service-contract-and-metadata-design.md](../outputs/p3-service-contract-and-metadata-design.md) | [HANDOFF_P3.md](./HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./P3_ORCHESTRATOR_PROMPT.md) |
| P4 | Implementation Plan and Verification Strategy | [p4-implementation-plan-and-verification-strategy.md](../outputs/p4-implementation-plan-and-verification-strategy.md) | [HANDOFF_P4.md](./HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./P4_ORCHESTRATOR_PROMPT.md) |

## Constraints

- Use `bun` for repo and package commands.
- Stay inside `specs/completed/semantic-web` unless a nearby evidence document must be read.
- Do not write production package code while working only on the spec artifacts.
- Preserve exploratory artifacts explicitly; do not delete them silently.

## Exit Condition

This handoff is complete when the current phase output is internally consistent with the README, the manifest, and the design docs, and the next phase can proceed without reopening settled defaults.
