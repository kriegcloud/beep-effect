# P4 — Implementation Plan and Verification Strategy

## Purpose

Record the dependency-aware implementation sequence that closed the spec and preserve the concrete verification contract for implementation and maintenance work.

## Implementation Sequence

| Order | Workstream | Why It Comes Here |
|---|---|---|
| 1 | package exports, curated root docs, and shared internal conventions | establishes the stable package frame without widening the root surface too early |
| 2 | `iri/` and `uri/` value families | identifier posture is foundational for later modules |
| 3 | `rdf/` and `vocab/*` value families | RDF-aligned values underpin adapters and provenance |
| 4 | `jsonld/` document and context value layer | JSON-LD is first-class and depends on identifier and RDF value posture |
| 5 | `prov/` and `evidence/` value families | provenance and evidence build on identifier and RDF layers |
| 6 | `services/*` contracts | contracts should target already-decided value families |
| 7 | `adapters/*` implementations | concrete backend integrations should satisfy established contracts |
| 8 | tests, examples, docs, and verification evidence | validate the completed package against the spec contract |

## Implementation Constraints

- do not reopen locked defaults from the design docs without stronger local evidence
- keep `idna` internal to `uri/` in v1
- keep the stable root export surface curated and minimal
- do not plan `@beep/schema` compatibility shims unless migration inventory proves they are required
- keep experimental ontology-builder work outside the stable root surface
- do not treat JSON Schema, `Graph`, or raw hashing as semantic substitutes for RDF, SHACL, or canonical identity

## Seed-Asset Migration And Compatibility Posture

- keep `IRI` canonical at `@beep/semantic-web/iri`; no compatibility shim is required
- treat `ProvO` as the seed-asset migration that established `@beep/semantic-web/prov` as the canonical public owner
- do not assume temporary `@beep/schema` re-exports are needed; add them only if migration inventory proves they are necessary to avoid unsafe cutovers
- if compatibility shims are introduced, keep them short-lived, document the consumers they protect, and remove them after migration completes

## Verification Matrix

| Area | Required Verification | Command Gate |
|---|---|---|
| identifiers | valid and invalid `IRI` and `URI` fixtures plus normalization and equivalence coverage where applicable | semantic-web package gates |
| RDF and vocab | term, quad, dataset, prefix, namespace, and vocabulary identity coverage | semantic-web package gates |
| JSON-LD | context normalization, document boundary fixtures, framing, RDF bridging, and streaming behavior | semantic-web package gates |
| provenance and evidence | minimal PROV core, extension-tier cases, lifecycle-field preservation, evidence anchors, and bounded projection behavior | semantic-web package gates |
| services and adapters | request, result, and error schema coverage plus fake-backed or adapter-backed contract tests | semantic-web package gates |
| exports and docs | curated root surface preserved and docs aligned with the stable API | build gate plus docs maintenance checks |

## Verification Commands

Implementation and maintenance work should use:

```bash
bun run --filter=@beep/semantic-web check
bun run --filter=@beep/semantic-web lint
bun run --filter=@beep/semantic-web test
bun run --filter=@beep/semantic-web build
```

## Failure Classification

Implementation and maintenance verification must classify failures as:

- `new failure`
- `pre-existing failure`
- `environmental failure`

## Acceptance Criteria

- the implemented module tree matches the P0 topology
- core value families match the P1 design
- adapter seams match the P2 design
- service contracts and metadata usage match the P3 design
- package-scoped `bun` verification commands exit `0`

## Outcome

P4 is closed. The implementation order, seed-asset posture, compatibility-shim stance, and verification contract are explicit enough that future work can extend the package without redesigning it first.

## Resolved Closeout Decisions

- the stable v1 SPARQL contract remains minimal and engine-agnostic
- the first adapter wave stops at the Web Annotation seam plus core evidence-anchor values
- `SemanticSchemaMetadata.specifications` remains typed but descriptive in v1
