# P4 Handoff - Implementation Plan and Verification Strategy

## Objective

Produce an implementation-ready rollout plan and verification strategy for `@beep/semantic-web` without writing production package code.

## Mode Handling

If you are operating in Plan Mode, do not edit spec artifacts yet. First read the required inputs, confirm which defaults are already locked, resolve remaining ambiguities through non-mutating exploration and targeted user questions, and produce a decision-complete phase plan. Only write or refine the phase output artifact when operating outside Plan Mode.

## Inputs

- [README.md](../README.md)
- [plans/phased-roadmap.md](../plans/phased-roadmap.md)
- [plans/verification-strategy.md](../plans/verification-strategy.md)
- `outputs/p0-package-topology-and-boundaries.md`
- `outputs/p1-core-schema-and-value-design.md`
- `outputs/p2-adapter-and-representation-design.md`
- `outputs/p3-service-contract-and-metadata-design.md`

## Required Work

1. Define the rollout order for the implementation.
2. State how `IRI` and `ProvO` seed assets will migrate and whether temporary `@beep/schema` compatibility shims are actually required by migration inventory.
3. Break the work into concrete implementation areas and dependencies.
4. Define the verification matrix and `bun` commands that must pass.
5. Record only the remaining human decisions that are not already settled by the locked defaults.

## Deliverable

Write: `outputs/p4-implementation-plan-and-verification-strategy.md`

## Completion Checklist

- [ ] rollout order is explicit
- [ ] seed-asset migration posture is explicit
- [ ] compatibility shim posture is explicit
- [ ] verification matrix is explicit
- [ ] `bun` command expectations are explicit
- [ ] remaining unresolved items are bounded and owned

## Exit Gate

P4 is complete when later implementation work can start coding without redesigning the package first.
