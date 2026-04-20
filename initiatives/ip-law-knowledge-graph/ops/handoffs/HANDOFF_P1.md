# P1 Handoff — Schema Design

## Objective

Define Effect Schema types for all 15 node types and 11+ edge types as tagged unions, grounded in the OWL ontology research from P0, with explicit traceability annotations and documentation of dropped OWL constraints.

## Inputs

- [SPEC.md](../../SPEC.md) — Planned Node Types table, Planned Edge Types table, ADR-004 (Schema mapping strategy)
- [p0-ontology-research.md](../../history/outputs/p0-ontology-research.md) — Class hierarchies, object properties, reasoning constraints, class-to-node-type mapping

## Required Work

1. Define 15 node types as `S.TaggedClass` with `_tag` discriminant, required fields derived from OWL class properties, and optional metadata fields.
2. Define 11+ edge types as typed records with `_type` discriminant, `sourceId`, `targetId`, and relationship metadata fields.
3. Compose all node types into a `NodeKind` tagged union.
4. Compose all edge types into an `EdgeKind` tagged union.
5. Add `/** @source S# */` JSDoc annotation to every type citing its OWL ontology source.
6. Document every OWL reasoning constraint (cardinality, disjointness, transitivity) that was dropped during translation and provide justification.
7. Verify all types compile by writing example type-check expressions.

## Deliverable

Write: `history/outputs/p1-schema-design.md`

## Completion Checklist

- [ ] 15 node types defined with `_tag` and `@source` annotations
- [ ] 11+ edge types defined with `_type`, `sourceId`, `targetId`
- [ ] `NodeKind` tagged union has 15 branches
- [ ] `EdgeKind` tagged union has 11+ branches
- [ ] Dropped OWL constraints documented with justifications
- [ ] No open design decisions remain

## Exit Gate

P1 is complete when `history/outputs/p1-schema-design.md` contains all schema definitions with OWL traceability and no open design decisions remain.
