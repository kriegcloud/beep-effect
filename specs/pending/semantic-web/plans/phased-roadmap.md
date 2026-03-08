# Phased Roadmap

## Purpose

Define the execution order for the formal `@beep/semantic-web` spec so that later implementation work can follow the phase outputs without redoing design discovery.

## Phase Sequence

| Phase | Focus | Primary Inputs | Deliverable | Acceptance Gate |
|---|---|---|---|---|
| P0 | Package Topology and Boundaries | README, exploratory research notes, package stubs, local prior art | `outputs/p0-package-topology-and-boundaries.md` | module map, `@beep/schema` boundary, upstream classification, artifact lineage all explicit |
| P1 | Core Schema and Value Design | P0 output, `IRI.ts`, `ProvO.ts`, metadata note, Effect v4 note | `outputs/p1-core-schema-and-value-design.md` | public schema families, equality policy, and metadata requirements explicit |
| P2 | Adapter and Representation Design | P0 and P1 outputs, upstream semantic-web subtree references | `outputs/p2-adapter-and-representation-design.md` | JSON-LD, RDF/JS, SHACL, canonicalization, and representation posture explicit |
| P3 | Service Contract and Metadata Design | P1 and P2 outputs, provenance note, metadata note, PROV-O assessment | `outputs/p3-service-contract-and-metadata-design.md` | service contracts, provenance posture, and metadata policy explicit |
| P4 | Implementation Plan and Verification Strategy | all prior outputs, package scripts, repo verification commands | `outputs/p4-implementation-plan-and-verification-strategy.md` | file/module rollout order and verification contract explicit |

## Workstream Notes

### P0

- settle the public module families
- settle the package boundary with `@beep/schema`
- classify upstream references
- preserve or supersede exploratory artifacts explicitly

### P1

- define the core semantic value families
- pin down identifier posture, RDF value posture, provenance seeds, and metadata requirements
- preserve Effect v4 equality and hashing defaults

### P2

- define document, streaming, validation, and canonicalization adapter seams
- classify representation boundaries so JSON Schema, JSON Patch, and XML are not overclaimed

### P3

- define public service contracts
- define evidence anchors and provenance projections
- finalize metadata required vs optional scope

### P4

- convert the design into a dependency-aware implementation sequence
- define acceptance criteria and verification commands
- keep the work at planning level rather than implementation level

## Constraints

- Use `bun` for repo and package commands.
- Do not write production package code in the spec-authoring phase.
- Do not reopen locked defaults without stronger local evidence.
- Keep the package posture at `foundation + adapters`.
- If a phase starts in Plan Mode, use the handoff and orchestrator docs to produce a decision-complete phase plan before editing the phase artifact.

## Exit Condition

The roadmap is complete when a future implementation session can start from P4 and build the package without first reopening the design.
