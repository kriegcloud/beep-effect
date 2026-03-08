# P4 — Implementation Plan and Verification Strategy

## Purpose

Convert the completed spec into a dependency-aware implementation sequence and a concrete verification contract for later implementation work.

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

## Migration Compatibility Posture

- migrate `IRI` and `ProvO` into `@beep/semantic-web` as the canonical public owner
- do not assume temporary `@beep/schema` re-exports are needed; add them only if migration inventory proves they are necessary to avoid unsafe cutovers
- if compatibility shims are introduced, keep them short-lived, document the consumers they protect, and remove them after migration completes

## Verification Commands

Later implementation work should use:

```bash
bun run --filter=@beep/semantic-web check
bun run --filter=@beep/semantic-web lint
bun run --filter=@beep/semantic-web test
bun run --filter=@beep/semantic-web build
```

## Failure Classification

Later implementation verification must classify failures as:

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

This P4 baseline is ready for execution. Later implementation work can now follow this plan without first redesigning the package, but the baseline itself should still be refined during phase execution rather than treated as evidence that P4 already ran.

## Remaining Open Question

Should the first implementation slice include the Web Annotation adapter, or stop at the adapter seam plus core evidence-anchor values?

Recommended default:

- implement the seam and core values first
- add the adapter in the first adapter-focused slice if schedule allows
