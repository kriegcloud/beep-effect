# P1 Handoff - Core Schema and Value Design

## Objective

Define the public schema and value families for identifiers, RDF constructs, provenance constructs, evidence anchors, vocabulary terms, and other stable semantic-web values.

## Inputs

- [README.md](../README.md)
- [design/module-topology-and-boundaries.md](../design/module-topology-and-boundaries.md)
- [design/semantic-schema-metadata.md](../design/semantic-schema-metadata.md)
- [design/foundation-decisions.md](../design/foundation-decisions.md)
- `outputs/p0-package-topology-and-boundaries.md`
- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts)
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts)

## Required Work

1. Define the public schema families for:
   - identifiers
   - RDF terms, quads, datasets, prefixes, and namespaces
   - provenance constructs
   - evidence anchors
   - vocabulary terms
2. State where semantic schema metadata is required, optional, or intentionally avoided.
3. State the default equality, normalization, and canonicalization policy for each public family.
4. Preserve the locked defaults around `Schema.toEquivalence(...)`, `Graph`, `Hash`, `Equal`, and JSON-LD document-layer tools.

## Deliverable

Write: `outputs/p1-core-schema-and-value-design.md`

## Completion Checklist

- [ ] all public schema families are assigned to a module family
- [ ] metadata policy is explicit
- [ ] equality and canonicalization policy is explicit
- [ ] identifier and provenance posture remain consistent with locked defaults

## Exit Gate

P1 is complete when P2 and P3 can design adapters and service contracts without reopening core schema ownership or value semantics.
