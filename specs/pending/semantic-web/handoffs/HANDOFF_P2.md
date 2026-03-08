# P2 Handoff - Adapter and Representation Design

## Objective

Define the public representation seams and target-specific adapters for JSON-LD, RDF/JS, SHACL, SPARQL/query, and dataset canonicalization.

## Inputs

- [README.md](../README.md)
- [design/module-topology-and-boundaries.md](../design/module-topology-and-boundaries.md)
- [design/provenance-and-evidence.md](../design/provenance-and-evidence.md)
- `outputs/p0-package-topology-and-boundaries.md`
- `outputs/p1-core-schema-and-value-design.md`
- [research/2026-03-08-effect-v4-module-selection.md](../research/2026-03-08-effect-v4-module-selection.md)

## Required Work

1. Define the public JSON-LD seams for:
   - contexts
   - documents
   - streaming parse / serialize
   - optional framing
2. Define the RDF/JS interoperability baseline.
3. Define SHACL, query, and canonicalization adapter posture.
4. Keep representation boundaries explicit so:
   - JSON Schema is not treated as SHACL or OWL
   - generic XML encoding is not treated as RDF/XML
   - JSON patching remains document-layer only

## Deliverable

Write: `outputs/p2-adapter-and-representation-design.md`

## Completion Checklist

- [ ] every public adapter seam has a target or rationale
- [ ] RDF/JS baseline is explicit
- [ ] JSON-LD scope is explicit
- [ ] representation traps are called out explicitly

## Exit Gate

P2 is complete when service-contract work no longer needs to guess which external runtimes are public contract surfaces versus optional adapters.
