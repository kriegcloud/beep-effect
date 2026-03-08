# @beep/semantic-web

## Status

**EXPLORATORY**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-03-08
- **Updated:** 2026-03-08

## Quick Navigation

### Root

- [README.md](./README.md) — current source of truth for the exploration
- [QUICK_START.md](./QUICK_START.md) — fast orientation for the next session

### Research

- [2026-03-08-initial-exploration.md](./research/2026-03-08-initial-exploration.md) — subtree inventory, local evidence, decisions, and open questions
- [2026-03-08-effect-v4-module-selection.md](./research/2026-03-08-effect-v4-module-selection.md) — Effect v4 module fit analysis for semantic-web design
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](../expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md) — provenance posture and expert-memory alignment

### Design

- [semantic-schema-metadata.md](./design/semantic-schema-metadata.md) — proposed typed annotation pattern for semantic-web schemas
- [foundation-decisions.md](./design/foundation-decisions.md) — settled defaults for identifiers, provenance profile, evidence anchoring, and metadata kinds

### Tracking

- [manifest.json](./outputs/manifest.json) — current exploration status and next artifacts

---

## Purpose

Define the shape of a schema-first `@beep/semantic-web` package for this monorepo before writing the formal implementation spec.

The package is intended to become the canonical home for reusable semantic-web values, schemas, adapters, and service contracts needed by the broader expert-memory and semantic-knowledge work in this repository.

## Current Working Thesis

The current direction is:

1. `@beep/semantic-web` should become the canonical owner of semantic-web foundation modules in this repo.
2. The package should optimize for `foundation + adapters`, not for a maximal semantic-web runtime.
3. JSON-LD should be first-class in the initial package surface.
4. The current `IRI` and `ProvO` proof modules are seed assets, not final package design.
5. Ontology or builder DSL work should be an experimental submodule, not the center of the package.

## Settled Defaults

The following foundation decisions are now treated as settled defaults for the formal spec pass:

1. `IRI` and `URI` stay separate first-class public concepts in v1, with `IRI` as the semantic default.
2. The initial PROV profile stays intentionally small, with a minimal core and a bounded early extension tier.
3. Web Annotation is a first-class adapter seam for evidence anchoring, not a hard dependency across the whole package.
4. `SemanticSchemaMetadata.kind` should be a closed, intentionally coarse literal domain in v1.

See [foundation-decisions.md](./design/foundation-decisions.md).

## Confirmed Local Evidence

The current exploration is grounded in these local references:

- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) — working RFC 3987-oriented IRI schema implementation
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) — working schema-first PROV-O module
- [`packages/common/semantic-web/README.md`](../../../packages/common/semantic-web/README.md) — current package stub
- [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) — current implementation is effectively empty beyond version export
- [`.repos/beep-effect/packages/common/semantic-web/README.md`](../../../.repos/beep-effect/packages/common/semantic-web/README.md) — older semantic-web package prior art
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) — richer parse / normalize / resolve URI surface from older work
- [`.repos/effect-v4/packages/effect/src/Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts) — local Effect v4 source of truth for schema-derived helpers

## Effect v4 Notes Relevant to This Exploration

Confirmed from local Effect v4 source:

- `Schema.toArbitrary(...)` exists
- `Schema.toFormatter(...)` exists
- `Schema.toEquivalence(...)` exists
- no obvious schema-derived hashing helper has been confirmed yet from `Schema.ts`

This matters because the package likely wants schema-derived codecs, formatting, equivalence, and validation surfaces, but may need explicit package-level hashing strategy instead of assuming one comes from `effect/Schema`.

## Inferred Package Topology

### 1. Core value layer

- `iri/` and possibly `uri/`
- `rdf/` terms, quads, datasets, prefixes, namespace helpers
- `prov/`
- vocabulary modules such as `rdf`, `rdfs`, `owl`, `prov`, and JSON-LD vocabulary helpers

### 2. Adapter layer

- RDF/JS interoperability
- N3 / Turtle / TriG / N-Triples / N-Quads
- JSON-LD document, context, expansion, compaction, and serialization surfaces
- RDF/XML and related ingestion boundaries

### 3. Contract layer

- provenance services
- reasoning services
- SHACL validation services
- SPARQL query or verification services

### 4. Experimental layer

- ontology entity / class / predicate builders
- schema combinators for generating new ontology-aligned schemas

## New Upstream References Now Available Locally

The repository now has a broader semantic-web subtree set under [`.repos/semantic-web`](../../../.repos/semantic-web).

High-value additions for the current direction include:

- `jsonld.js`
- `jsonld-context-parser.js`
- `jsonld-streaming-parser.js`
- `jsonld-streaming-serializer.js`
- `rdf-canonize`
- `traqula`
- `comunica`
- `shacl-engine`

See the research note for the full inventory with imported upstream commit SHAs and rationale.

## Immediate Design Tensions

### Package boundaries

The package should clarify what:

- stays in `@beep/schema`
- moves into `@beep/semantic-web`
- gets re-exported from one place through the other

### JSON-LD scope

Because JSON-LD is first-class, the initial design likely needs both:

- RDF/JS-aligned values and adapter seams
- JSON-LD document and context seams

That is broader than just `IRI`, `ProvO`, and quad schemas.

## Current Non-Goals

- implementing the package now
- finalizing handoff prompts before the topology is clearer
- locking in a maximal reasoning or OWL runtime
- blindly copying older Effect v3-era patterns into Effect v4 code

## Next Steps

1. Continue shape discovery from the local subtree set and current proof modules.
2. Decide the initial public module topology for `@beep/semantic-web`.
3. Formalize which public schema families require semantic metadata annotations.
4. Produce phased implementation plans in `./plans`.
5. Generate handoff and orchestrator prompts in `./handoffs` only after the topology is agreed.

## Exit Criteria For This Exploration Stage

This exploratory stage is ready to transition into formal spec writing once the following are clear:

- the canonical module map for the initial package
- the boundary between pure schemas, adapters, and runtime contracts
- the ownership and migration path for `IRI` and `ProvO`
- which upstream libraries are adapter targets versus research references
- whether ontology builders remain experimental in v1
