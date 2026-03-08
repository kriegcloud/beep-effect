# Foundation Decisions

## Purpose

Capture the remaining foundation-level decisions that should be treated as fixed defaults for the formal `@beep/semantic-web` spec unless stronger local evidence appears later.

These decisions are intended to remove unnecessary ambiguity before the next spec-authoring session.

## Decision 1: `IRI` and `URI` stay separate first-class public concepts in v1

### Decision

Keep both `IRI` and `URI` as first-class public concepts in v1.

### Default posture

- `IRI` is the semantic-web-first identifier surface
- `URI` is the transport, normalization, and interoperability companion surface
- the package should not collapse them into one public concept
- the package should share internals where practical so the split does not create duplicate logic everywhere

### Why

Local evidence shows the current proof `IRI` module is a strong RFC 3987 syntax boundary:

- [IRI.ts](/home/elpresidank/YeeBois/projects/beep-effect3/packages/common/schema/src/internal/IRI/IRI.ts#L822)

Older prior art shows a richer `URI` / `IRI` package surface with parsing, normalization, serialization, equality, and branded canonical strings:

- [semantic-web README](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/beep-effect/packages/common/semantic-web/README.md)
- [uri.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts#L845)
- [uri.ts](/home/elpresidank/YeeBois/projects/beep-effect3/.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts#L923)

This means the two concepts solve different problems:

- `IRI` matters for semantic-web identifiers and Unicode-aware modeling
- `URI` matters for canonical transport-safe normalization and interoperability with systems that still require RFC 3986-oriented surfaces

### Consequence

The v1 package should likely expose:

- an `iri/` module family
- a `uri/` module family

But `IRI` should be the default semantic identifier language in documentation and examples.

## Decision 2: the initial PROV profile should be intentionally small

### Decision

Adopt a minimal stable PROV profile in v1 and push richer provenance semantics into an extension tier.

### Required core profile

- `prov:Entity`
- `prov:Activity`
- `prov:Agent`
- `prov:SoftwareAgent`
- `prov:used`
- `prov:wasGeneratedBy`
- `prov:wasAssociatedWith`
- `prov:startedAtTime`
- `prov:endedAtTime`

### Early extension tier

Support these early where they add real value, but do not require them everywhere:

- `prov:hadPrimarySource`
- `prov:wasQuotedFrom`
- `prov:wasRevisionOf`
- `prov:wasDerivedFrom`
- `prov:Plan`

### Why

The PROV-O assessment already recommends this exact posture:

- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md#L273)
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md#L275)

It also makes clear that:

- PROV-O is the lineage backbone, not the whole domain model
- lifecycle time semantics should remain explicit domain fields where needed
- provenance should stay bounded and projection-friendly

### Consequence

The spec should not make qualified PROV relations or the full PROV family mandatory in v1.

## Decision 3: Web Annotation is an adapter seam, not a hard dependency

### Decision

Treat W3C Web Annotation as a first-class adapter target and evidence-anchoring reference, but not as a hard package-wide dependency in v1.

### Default posture

- define a package-level evidence anchoring abstraction
- provide a Web Annotation compatible adapter or mapping seam
- do not require every provenance or evidence consumer to speak Web Annotation directly

### Why

The PROV-O assessment is clear that evidence anchoring is necessary for click-through and highlight, and that Web Annotation is a strong standard fit:

- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md#L129)
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md#L143)
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md#L265)

But making it a hard dependency too early would overcouple the package:

- not all evidence is text-position evidence
- some systems will want internal span models or SQL-backed anchors
- the package posture is still `foundation + adapters`

### Consequence

The v1 package should likely include:

- a core evidence anchor model
- a Web Annotation adapter or submodule

Not:

- a requirement that all provenance surfaces are expressed directly as Web Annotation objects

## Decision 4: `SemanticSchemaMetadata.kind` should be closed, but intentionally coarse

### Decision

Make `SemanticSchemaMetadata.kind` a closed literal domain in v1, but keep it intentionally small and coarse-grained.

### Recommended v1 domain

- `identifier`
- `vocabularyTerm`
- `ontologyConstruct`
- `rdfConstruct`
- `jsonldConstruct`
- `provenanceConstruct`
- `serviceContract`
- `adapterBoundary`

### Why

An open string field would weaken the whole point of the metadata pattern.

A closed but modest domain:

- improves agent readability
- improves consistency across modules
- avoids collapsing into dozens of overly specific one-off categories
- leaves room for later secondary fields or future refinement

This is a better v1 posture than trying to encode every distinction directly into `kind`.

### Consequence

The first metadata design should keep `kind` closed and use other fields for finer meaning:

- `canonicalIri`
- `specifications`
- `equivalenceBasis`
- `representations`
- `agentNotes`

If the package later needs finer distinctions, it can add a second dimension such as `semanticRole` or expand the closed literal set deliberately.

## Summary

These four defaults should be treated as settled for the next spec-authoring session:

1. `IRI` and `URI` remain separate first-class public concepts, with `IRI` as the semantic default
2. the initial PROV profile stays minimal, with a clearly bounded extension tier
3. Web Annotation is a first-class adapter seam, not a hard dependency
4. `SemanticSchemaMetadata.kind` is a closed, intentionally coarse literal domain
