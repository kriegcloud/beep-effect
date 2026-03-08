# Foundation Decisions

## Purpose

Capture the defaults that are now treated as locked for the formal `@beep/semantic-web` spec unless stronger local evidence explicitly contradicts them.

## Package-Level Defaults

### Decision 1: `@beep/semantic-web` is the canonical semantic-web foundation package

`@beep/semantic-web` is the canonical public owner of reusable semantic-web values, adapters, service contracts, and metadata patterns in this monorepo.

Implication:

- do not keep long-term public ownership split across `@beep/schema` and ad-hoc proof modules
- current proof modules and the empty package stub are migration inputs, not the final state

### Decision 2: the package posture is `foundation + adapters`

The initial package should optimize for:

- reusable semantic-web values and schemas
- explicit adapter seams
- stable service contracts

It should not optimize for:

- semantic-web maximalism
- adopting every upstream runtime as a first-class public surface

### Decision 3: JSON-LD is first-class in v1

JSON-LD must be part of the initial public surface at both the document layer and the adapter layer.

Implication:

- JSON-LD should not be deferred behind a later “optional add-on” plan
- document, context, and streaming concerns all need explicit design space

### Decision 4: `IRI` and `URI` stay separate first-class public concepts in v1

#### Default posture

- `IRI` is the semantic-web-first identifier surface
- `URI` is the transport and interoperability companion surface
- the package should not collapse them into one public concept
- shared internals are allowed, but shared internals must not erase the conceptual split

#### Why

- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) is a strong RFC 3987 syntax boundary
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) provides richer URI / IRI normalization, resolution, and canonical string prior art

### Decision 5: `IRI` and `ProvO` are seed assets, not the whole package design

These modules are valid migration inputs and strong local evidence, but they are not by themselves the full package boundary.

Implication:

- v1 still needs RDF, JSON-LD, evidence, adapter, and service-contract surfaces
- do not treat “move `IRI` and `ProvO`” as a complete package plan

### Decision 6: ontology builder DSL work stays experimental

Ontology builders and ontology-driven schema combinators may exist, but they remain in `experimental/*` unless stronger local evidence later justifies promotion.

### Decision 7: `Schema.toEquivalence(...)` is the default equality surface

For schema-modeled semantic-web values:

- prefer `Schema.toEquivalence(...)`
- use explicit `Equivalence` where normalization rules need non-structural comparison

Do not treat:

- `Hash`
- `Equal`
- Effect `Graph`

as substitutes for RDF semantic identity.

### Decision 8: Effect `Graph` is projection-only

Effect `Graph` may be used for:

- derived worklists
- dependency DAGs
- visualization projections

It must not be used as the primary RDF semantic model.

### Decision 9: `Hash` and `Equal` are internal-only semantic-web tools

`Hash` and `Equal` are only safe after canonicalization or on explicit fingerprint results.

Implication:

- raw structural hashing is not RDF identity
- graph-level identity requires canonicalization before hashing

### Decision 10: `JsonPatch` and `JsonPointer` are JSON-LD document-layer tools only

Use them only for:

- editing JSON-LD source documents
- document-layer diffs
- form or source-blob versioning

Do not use them as the semantic diff story for RDF terms, quads, or datasets.

### Decision 11: generic XML encoding is not RDF/XML

`Schema.toEncoderXml(...)` is not evidence of RDF/XML support.

Implication:

- RDF/XML must remain a separate adapter concern
- do not write docs that blur generic XML encoding into RDF serialization

## Provenance Defaults

### Decision 12: PROV-O is the interoperable provenance backbone, not the whole expert-memory provenance solution

PROV-O is the semantic interchange backbone for provenance, but it must be paired with explicit evidence anchoring, lifecycle fields, and bounded projections.

### Decision 13: the initial PROV profile should be intentionally small

#### Required core profile

- `prov:Entity`
- `prov:Activity`
- `prov:Agent`
- `prov:SoftwareAgent`
- `prov:used`
- `prov:wasGeneratedBy`
- `prov:wasAssociatedWith`
- `prov:startedAtTime`
- `prov:endedAtTime`

#### Early extension tier

- `prov:hadPrimarySource`
- `prov:wasQuotedFrom`
- `prov:wasRevisionOf`
- `prov:wasDerivedFrom`
- `prov:Plan`

### Decision 14: provenance must be paired with explicit evidence anchoring and bounded projections

Default posture:

- define a core evidence-anchor model
- allow a Web Annotation-compatible adapter seam
- emit bounded provenance bundles or projections instead of one unbounded global provenance graph

### Decision 15: lifecycle time semantics stay explicit

Do not force domain lifecycle fields such as:

- `observedAt`
- `publishedAt`
- `ingestedAt`
- `assertedAt`
- `derivedAt`
- `effectiveAt`
- `supersededAt`

into plain PROV activity time fields.

### Decision 16: Web Annotation is an adapter seam, not a hard dependency

Web Annotation is a strong standard fit for evidence anchoring, but not all evidence needs to be modeled directly as Web Annotation objects.

## Metadata Defaults

### Decision 17: `SemanticSchemaMetadata.kind` is a closed, intentionally coarse literal domain

Recommended v1 domain:

- `identifier`
- `vocabularyTerm`
- `ontologyConstruct`
- `rdfConstruct`
- `jsonldConstruct`
- `provenanceConstruct`
- `serviceContract`
- `adapterBoundary`

### Decision 18: the semantic schema metadata pattern applies selectively

Required for:

- important public semantic-web schema families
- vocabulary terms
- RDF, JSON-LD, provenance, evidence, and public service-contract schemas

Avoid for:

- tiny private helper schemas
- trivial tuple or record fragments
- internal scaffolding where metadata adds ceremony without durable value

## Summary

These defaults are now locked for the formal pending spec:

1. `@beep/semantic-web` is canonical
2. the package posture is `foundation + adapters`
3. JSON-LD is first-class
4. `IRI` and `URI` remain separate public concepts
5. `IRI` and `ProvO` are seed assets, not the full design
6. ontology-builder work stays experimental
7. `Schema.toEquivalence(...)` is the default equality surface
8. Effect `Graph` is projection-only
9. `Hash` and `Equal` are not RDF semantic identity
10. `JsonPatch` and `JsonPointer` stay at the JSON-LD document layer
11. generic XML encoding is not RDF/XML
12. PROV-O is the provenance backbone, not the whole solution
13. the initial PROV profile is minimal with an extension tier
14. provenance is paired with evidence anchors and bounded projections
15. lifecycle time fields stay explicit
16. Web Annotation is an adapter seam, not a hard dependency
17. `SemanticSchemaMetadata.kind` is closed and coarse in v1
18. semantic metadata annotations are selective, not universal
