# P0 Handoff — Ontology Research

## Objective

Survey 7 published OWL ontologies to extract class hierarchies, object properties, and reasoning constraints relevant to intellectual property law, and produce a class-to-node-type mapping for the 15 planned graph node types.

## Inputs

- [README.md](../README.md) — Source-of-Truth Contract (7 ontology URLs), Planned Node Types table, Planned Edge Types table
- [manifest.json](../outputs/manifest.json) — Phase status tracking

## Required Work

1. Retrieve or access each of the 7 OWL ontology files from the URLs listed in the Source-of-Truth Contract.
2. For each ontology, document:
   - OWL dialect and serialization format
   - Top-level class hierarchy (depth 2-3)
   - Object properties relevant to IP law concepts
   - Reasoning constraints: cardinality restrictions, disjointness axioms, transitivity declarations
3. Produce a class-to-node-type mapping table showing which OWL classes inform each of the 15 planned node types.
4. Identify any planned node types with weak ontological grounding and flag for review.
5. Note any object properties that suggest additional edge types beyond the 11 planned.

## Deliverable

Write: `outputs/p0-ontology-research.md`

## Completion Checklist

- [ ] All 7 ontology sections populated with non-empty class lists
- [ ] Object properties documented for each ontology
- [ ] Reasoning constraints documented (at least 3 per applicable ontology)
- [ ] Class-to-node-type mapping covers all 15 planned types
- [ ] Gaps and weak groundings explicitly flagged

## Exit Gate

P0 is complete when `outputs/p0-ontology-research.md` exists with all 7 ontology sections substantively populated and the class-to-node-type mapping covers all 15 planned node types.
