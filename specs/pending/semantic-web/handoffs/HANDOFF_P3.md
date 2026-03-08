# P3 Handoff - Service Contract and Metadata Design

## Objective

Define the public service contracts for provenance, validation, query, and representation work, and lock the metadata policy for public semantic-web schemas.

## Inputs

- [README.md](../README.md)
- [design/provenance-and-evidence.md](../design/provenance-and-evidence.md)
- [design/semantic-schema-metadata.md](../design/semantic-schema-metadata.md)
- `outputs/p1-core-schema-and-value-design.md`
- `outputs/p2-adapter-and-representation-design.md`

## Required Work

1. Define service contracts for:
   - provenance projection and summarization
   - validation
   - query
   - representation conversion or document/RDF bridging
2. State which contracts are foundation-level and which are adapter-backed.
3. Confirm how schema metadata is surfaced or inspected by tooling without forcing it onto trivial helpers.
4. Preserve the Web Annotation seam as optional adapter behavior rather than hard package-wide dependency.

## Deliverable

Write: `outputs/p3-service-contract-and-metadata-design.md`

## Completion Checklist

- [ ] service contract set is explicit
- [ ] foundation-level versus adapter-backed boundaries are explicit
- [ ] metadata policy remains bounded
- [ ] provenance posture remains consistent with P1 and P2

## Exit Gate

P3 is complete when P4 can plan implementation order without reopening service ownership or metadata policy.
