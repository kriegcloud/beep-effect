# Generic IR → IP-law Knowledge Graph mapping

**Status:** reference example (the concrete table is owned downstream).
**Date:** 2026-05-29 (absolute).

## Purpose

`@beep/nlp` emits a **product-neutral** generic IR — the handoff contract in
`@beep/nlp/Handoff/Contract` (`AnnotatedDocument` = chunks + entities + relations,
each with a `Span` and PROV-O `Provenance`). It deliberately contains **no IP-law
vocabulary**: `Entity.type` and `Relation.type` are free-form generic discriminants
(strings). The downstream `goals/ip-law-knowledge-graph` initiative owns the
concrete mapping from those generic discriminants to its 15-node / 11-edge OWL
schema. This document shows the *shape* of that mapping so the boundary is clear;
the authoritative table lives with the KG initiative (`goals/ip-law-knowledge-graph/SPEC.md`).

## Why the boundary sits here

- The capability stays reusable: any consumer (not just the IP-law KG) can decode
  `AnnotatedDocument` and apply its own mapping.
- The mapping is **mechanical**: `Entity.type` is a single discriminant the KG
  switches on; `Span` + `Provenance` carry the evidence/lineage the KG's PROV-O
  provenance model needs; `Relation.subject`/`object` are entity-id references the
  KG turns into edges.

## Example mapping (illustrative — not authoritative)

### Entities: generic `Entity.type` → KG node type

| generic `Entity.type` | → KG node (IP-law) |
| --------------------- | ------------------ |
| `"PATENT"`            | `Patent`           |
| `"CLAIM"`             | `Claim`            |
| `"TRADEMARK"`         | `Trademark`        |
| `"APPLICANT"` / `"ASSIGNEE"` | `Party`     |
| `"INVENTOR"`          | `Person`           |
| `"ORG"`               | `Organization`     |
| `"DATE"`              | (literal property on the owning node, not a node) |

The generic extractor emits whatever discriminant its backend produces (e.g.
wink-nlp NER tags, or an LLM backend's typed entities). The KG mapping is a total
function over the discriminants it recognizes, with an `Unknown`/skip fallback for
the rest.

### Relations: generic `Relation.type` → KG edge type

| generic `Relation.type` | → KG edge (IP-law) |
| ----------------------- | ------------------ |
| `"ASSIGNED_TO"`         | `assignedTo`       |
| `"INVENTED_BY"`         | `inventedBy`       |
| `"CITES"`               | `cites`            |
| `"CLAIMS"`              | `hasClaim`         |
| `"MENTIONS"`            | (provenance edge / evidence link) |

### Provenance: generic `Provenance` → PROV-O on the KG

`Provenance { source, generatedBy, timestamp, confidence? }` maps directly onto the
KG's PROV-O model:

- `source` → `prov:wasDerivedFrom` (the source document/uri node)
- `generatedBy` → `prov:wasGeneratedBy` (the activity/agent: the NLP operation or backend)
- `timestamp` → `prov:generatedAtTime` (epoch ms → xsd:dateTime)
- `confidence` → a confidence annotation on the asserted node/edge

`Span { start, end }` carries the character offsets the KG attaches as evidence
spans on the provenance of each asserted entity/relation.

## Consumption shape (downstream pseudocode)

```
decode AnnotatedDocument
for each entity:    upsert KG node  = nodeTypeOf(entity.type)(entity.canonicalName, provenance→PROV-O)
for each relation:  upsert KG edge  = edgeTypeOf(relation.type)(subject→node, object→node, provenance)
```

The KG initiative implements `nodeTypeOf` / `edgeTypeOf` against its OWL schema;
`@beep/nlp` guarantees only that the IR is well-formed, fully provenanced, and
span-accurate. That contract is enforced by the property tests in
`test/Handoff/Contract.test.ts` (round-trip, provenance completeness, span
validity).
