# @beep/semantic-web — Quick Start

> Formal pending spec for the schema-first semantic-web foundation package in this monorepo.

## What This Package Defines

- the canonical module topology for `@beep/semantic-web`
- the package boundary with `@beep/schema`
- the v1 provenance, evidence, and semantic metadata posture
- the phased outputs, handoffs, and verification contract for subsequent implementation work

## Already Decided

- `@beep/semantic-web` is the canonical semantic-web foundation package.
- JSON-LD is first-class in the initial surface.
- The package posture is `foundation + adapters`.
- `IRI` and `URI` remain separate public concepts in v1, with `IRI` as the semantic default.
- `Schema.toEquivalence(...)` is the default equality surface for schema-modeled values.
- Effect `Graph` is projection-only and not the primary RDF semantic model.
- PROV-O is the provenance backbone, paired with explicit evidence anchors, bounded projections, and explicit lifecycle time fields.
- Ontology builder DSL work stays experimental.

## Read In This Order

1. [README.md](./README.md)
2. [design/module-topology-and-boundaries.md](./design/module-topology-and-boundaries.md)
3. [design/provenance-and-evidence.md](./design/provenance-and-evidence.md)
4. [design/semantic-schema-metadata.md](./design/semantic-schema-metadata.md)
5. [outputs/p0-package-topology-and-boundaries.md](./outputs/p0-package-topology-and-boundaries.md)
6. [outputs/p1-core-schema-and-value-design.md](./outputs/p1-core-schema-and-value-design.md)
7. [outputs/p2-adapter-and-representation-design.md](./outputs/p2-adapter-and-representation-design.md)
8. [outputs/p3-service-contract-and-metadata-design.md](./outputs/p3-service-contract-and-metadata-design.md)
9. [outputs/p4-implementation-plan-and-verification-strategy.md](./outputs/p4-implementation-plan-and-verification-strategy.md)

## Kickoff Posture

- Start phase execution with [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) and [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) unless [`outputs/manifest.json`](./outputs/manifest.json) sets a later `currentTargetPhase`.
- Treat the existing `outputs/p0` through `outputs/p4` docs as pre-authored baselines to refine, not as proof that phase execution already happened.
- In Plan Mode, produce a decision-complete phase plan before editing the current phase artifact.
- When operating outside Plan Mode, refine the current phase output instead of recreating it from scratch.

## Phase Entry Files

| Phase | Handoff | Orchestrator | Output |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [p0-package-topology-and-boundaries.md](./outputs/p0-package-topology-and-boundaries.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [p1-core-schema-and-value-design.md](./outputs/p1-core-schema-and-value-design.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [p2-adapter-and-representation-design.md](./outputs/p2-adapter-and-representation-design.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [p3-service-contract-and-metadata-design.md](./outputs/p3-service-contract-and-metadata-design.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [p4-implementation-plan-and-verification-strategy.md](./outputs/p4-implementation-plan-and-verification-strategy.md) |

## Later Implementation Verification

```bash
bun run --filter=@beep/semantic-web check
bun run --filter=@beep/semantic-web lint
bun run --filter=@beep/semantic-web test
bun run --filter=@beep/semantic-web build
```

For spec-only maintenance in this folder, keep Markdown and JSON artifacts valid in addition to preserving the package-level verification contract above.
