# Semantic Schema Metadata

## Purpose

Define the formal annotation pattern for `@beep/semantic-web` so that important public semantic-web schemas can carry typed metadata without bloating their runtime value shape.

This document is normative for the completed spec package.

## Normative Decision

`@beep/semantic-web` adopts a typed custom `effect/Schema` annotation for important public semantic schema families.

This is:

- a first-class package pattern
- required for the right public schema families
- intentionally avoided for trivial internal helpers

## Pattern

The pattern mirrors the repo’s existing JSDoc annotation approach:

1. model metadata as a typed schema
2. validate that metadata at schema-construction time
3. store the validated payload in a custom `effect/Schema` annotation key
4. keep the runtime schema surface minimal

## Annotation Surface

### Annotation key

- `semanticSchemaMetadata`

### Required helper surfaces

- a `SemanticSchemaMetadata` payload model
- a module augmentation for the schema annotation key
- a retrieval helper
- a constructor helper that validates and attaches metadata

## Required Metadata Fields

These fields are required for public schema families that opt into the pattern in v1:

- `kind`
- `overview`
- `status`
- `specifications`
- `equivalenceBasis`

These fields are required when they are semantically applicable:

- `canonicalIri`
- `preferredPrefix`
- `representations`
- `canonicalizationRequired`
- `provenanceProfile`
- `evidenceAnchoring`
- `timeSemantics`

## Recommended Metadata Shape

### Core identity

- `kind`
- `canonicalName`
- `canonicalIri`
- `preferredPrefix`
- `aliases`

### Human meaning

- `overview`
- `description`
- `status`
- `deprecatedNote`

### Specification grounding

- `specifications`
  - specification name
  - version or edition when known
  - section or clause when known
  - stable URL when available
  - local reference path when available
  - `normative` or `informative`

### Semantic behavior

- `equivalenceBasis`
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
- `evidenceAnchoring`
- `timeSemantics`

## `kind` Domain Decision

The v1 `SemanticSchemaMetadata.kind` domain is closed and intentionally coarse:

- `identifier`
- `vocabularyTerm`
- `ontologyConstruct`
- `rdfConstruct`
- `jsonldConstruct`
- `provenanceConstruct`
- `serviceContract`
- `adapterBoundary`

This is strict enough to help agents and tooling, while avoiding taxonomy sprawl.

## Where Metadata Is Required

Metadata annotations are required for:

- public IRI, URI, and CURIE-related schemas
- public RDF term, quad, dataset, prefix, and namespace schemas
- public vocabulary term schemas
- public JSON-LD document, context, and framing-related schemas
- public provenance and evidence schemas
- public service contracts

## Where Metadata Is Optional

Metadata annotations are optional for:

- adapter-local DTOs
- test-only schemas
- transition helpers used only during migration

## Where Metadata Should Be Avoided

Do not apply the pattern indiscriminately to:

- tiny private helper schemas
- trivial tuple or record fragments
- internal scaffolding with no durable reuse

## Interaction With Effect v4 Defaults

This metadata pattern complements the local Effect v4 decisions rather than replacing them.

- `Schema.toEquivalence(...)` remains the default equality surface.
- metadata records the intended equivalence basis.
- `Schema.toJsonSchemaDocument(...)` stays JSON-facing only.
- metadata may record JSON-facing representations, but JSON Schema is not semantic truth.
- `Hash` remains internal-only after canonicalization.
- metadata may record whether canonicalization is required before fingerprinting.

## Acceptance Criteria

The metadata design is ready for implementation once:

- the required schema families are explicit
- the required v1 fields are explicit
- the closed `kind` domain is explicit
- the package docs clearly say where the pattern is required, optional, and avoided

## Open Question

Should `specifications` be enforced as a partially machine-checkable structure or remain descriptive-only in v1?

Recommended default:

- keep it strongly typed but descriptive in v1
- avoid overfitting the initial design around machine-enforced citation mechanics
