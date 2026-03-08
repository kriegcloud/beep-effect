# Semantic Schema Metadata

## Purpose

Define a repo-consistent annotation pattern for `@beep/semantic-web` so that semantic-web schemas can carry typed metadata without inflating their runtime value shape.

This note adopts the same broad pattern used by the JSDoc model in:

- [JSDocTagDefinition.model.ts](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L24)
- [JSDocTagDefinition.model.ts](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L139)
- [JSDocTagAnnotation.model.ts](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/repo-utils/src/JSDoc/models/JSDocTagAnnotation.model.ts#L12)

The pattern is:

1. model a rich metadata payload as a typed schema
2. validate that payload once at schema construction time
3. store it in a custom `effect/Schema` annotation key
4. return the minimal runtime schema surface

## Decision

`@beep/semantic-web` should use a typed custom schema annotation for formal semantic metadata on important public schemas.

This should be a first-class package pattern, but not a universal rule for every private helper schema.

## Why This Fits

This approach is a good fit for the semantic-web package because:

- semantic-web concepts are specification-heavy and benefit from explicit provenance
- agents can inspect annotations instead of reverse-engineering meaning from names alone
- schema metadata becomes queryable and tooling-friendly
- runtime shapes stay lean
- it supports the package posture already captured in:
  - [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/semantic-web/README.md)
  - [2026-03-08-effect-v4-module-selection.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/semantic-web/research/2026-03-08-effect-v4-module-selection.md#L179)

## Proposed Annotation Name

Use a dedicated annotation key such as:

- `semanticSchemaMetadata`

The exact exported helper names can be finalized later, but the shape should mirror the JSDoc pattern:

- one payload model
- one module augmentation for `effect/Schema`
- one retrieval helper
- one constructor helper for attaching validated metadata

## Proposed Metadata Shape

The initial `SemanticSchemaMetadata` payload should stay focused on metadata that is stable, useful, and likely to pay off in tooling.

### Core identity

- `kind`
  - examples: `vocabularyTerm`, `ontologyClass`, `ontologyProperty`, `rdfValue`, `jsonldConstruct`, `serviceContract`
- `canonicalName`
- `canonicalIri`
- `preferredPrefix`
- `aliases`

### Human meaning

- `overview`
- `description`
- `status`
  - examples: `stable`, `experimental`, `deprecated`
- `deprecatedNote`

### Specification grounding

- `specifications`
  - spec name
  - version or edition if known
  - section or clause
  - upstream URL if stable
  - local reference path when available
  - normative or informative classification

### Semantic behavior

- `equivalenceBasis`
  - what counts as equal for this schema
- `normalizationNotes`
- `canonicalizationRequired`
- `identityNotes`

### Representations

- `representations`
  - RDF/JS
  - JSON-LD
  - Turtle
  - TriG
  - RDF/XML
  - JSON Schema relevance

### Relationships

- `relatedSchemas`
- `relatedTerms`
- `seeAlso`

### Agent and maintenance support

- `agentNotes`
- `implementationNotes`
- `nonGoals`

### Provenance and evidence support

- `provenanceProfile`
  - whether the schema participates in a PROV-facing surface
- `evidenceAnchoring`
  - whether the schema expects Web Annotation style evidence selectors, internal span references, or none
- `timeSemantics`
  - whether the schema needs explicit lifecycle timestamps beyond plain PROV activity time

## Where The Pattern Should Be Required

This pattern should be required for public schemas that represent formal semantic-web concepts.

### Required

- vocabulary term schemas
- ontology class and property schemas
- IRI / URI / CURIE related public schemas
- RDF term, quad, dataset, prefix, and namespace public schemas
- JSON-LD document, context, and framing-related public schemas
- provenance-related public schemas
- public semantic service contracts

### Optional

- adapter-local DTOs
- testing-only schemas
- transitional migration helpers

### Avoid

- tiny private helper schemas
- trivial tuple or record fragments
- internal scaffolding where metadata would add ceremony without real reuse

## Interaction With Effect v4 Defaults

This pattern should complement, not replace, the Effect v4 defaults captured in:

- [2026-03-08-effect-v4-module-selection.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/semantic-web/research/2026-03-08-effect-v4-module-selection.md)

Expected interaction:

- `Schema.toEquivalence(...)` remains the default value-level equality surface
- metadata can state the intended equivalence basis
- `Schema.toJsonSchemaDocument(...)` remains JSON-facing only
- metadata can record which representations are valid for a schema
- `Hash` is still internal-only and only safe after canonicalization
- metadata can state whether canonicalization is required before fingerprinting
- metadata can state whether a schema is part of the bounded provenance projection layer

## Non-Goals

This annotation should not attempt to encode all ontology semantics directly.

It is not intended to become:

- a replacement for SHACL
- a replacement for OWL reasoning
- the main runtime execution model
- an excuse to annotate every internal helper

## `kind` Domain Decision

The first `SemanticSchemaMetadata.kind` domain should be closed in v1, but intentionally coarse.

### Recommended v1 literal set

- `identifier`
- `vocabularyTerm`
- `ontologyConstruct`
- `rdfConstruct`
- `jsonldConstruct`
- `provenanceConstruct`
- `serviceContract`
- `adapterBoundary`

This is strict enough to be useful for agents and tooling, but small enough to avoid premature taxonomy sprawl.

## Remaining Open Questions

- should `specifications` distinguish normative versus informative references
- should `representations` be descriptive only or partially machine-enforced
- should `agentNotes` live in the annotation or in adjacent docs only
- how much provenance-profile detail belongs in annotations versus dedicated provenance docs

## Current Recommendation

Adopt this pattern in v1, but start with a small set of required metadata fields:

- `kind`
- `overview`
- `specifications`
- `canonicalIri`
- `equivalenceBasis`
- `status`

Then expand only where the package gets real leverage from the extra structure.
