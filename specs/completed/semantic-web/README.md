# @beep/semantic-web

## Status

**COMPLETED**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-03-08
- **Updated:** 2026-03-08

## Quick Navigation

### Root

- [README.md](./README.md) — normative source of truth for the completed spec package
- [QUICK_START.md](./QUICK_START.md) — 5-minute orientation
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) — preserved per-phase execution prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) — phase-by-phase learnings template

### Design

- [module-topology-and-boundaries.md](./design/module-topology-and-boundaries.md) — public module map, `@beep/schema` boundary, seed-asset migration posture, upstream classification
- [provenance-and-evidence.md](./design/provenance-and-evidence.md) — minimal PROV profile, evidence anchoring, bounded projection, lifecycle time policy
- [semantic-schema-metadata.md](./design/semantic-schema-metadata.md) — formal semantic metadata annotation pattern
- [foundation-decisions.md](./design/foundation-decisions.md) — locked defaults preserved from the exploratory phase

### Plans

- [phased-roadmap.md](./plans/phased-roadmap.md) — phased workstream plan from topology through verification
- [verification-strategy.md](./plans/verification-strategy.md) — spec-level and implementation-level verification contract

### Handoffs

- [HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) — preserved cross-phase overview handoff
- [P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md) — preserved combined orchestration prompt
- [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) — P0 Package Topology and Boundaries
- [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) — P1 Core Schema and Value Design
- [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) — P2 Adapter and Representation Design
- [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) — P3 Service Contract and Metadata Design
- [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) — P4 Implementation Plan and Verification Strategy
- [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- [SPEC_FORMALIZATION_BOOTSTRAP_PROMPT.md](./handoffs/SPEC_FORMALIZATION_BOOTSTRAP_PROMPT.md) — preserved as superseded exploratory provenance

### Outputs

- [manifest.json](./outputs/manifest.json) — artifact and phase status tracking
- [p0-package-topology-and-boundaries.md](./outputs/p0-package-topology-and-boundaries.md)
- [p1-core-schema-and-value-design.md](./outputs/p1-core-schema-and-value-design.md)
- [p2-adapter-and-representation-design.md](./outputs/p2-adapter-and-representation-design.md)
- [p3-service-contract-and-metadata-design.md](./outputs/p3-service-contract-and-metadata-design.md)
- [p4-implementation-plan-and-verification-strategy.md](./outputs/p4-implementation-plan-and-verification-strategy.md)

### Research And Local Evidence

- [2026-03-08-initial-exploration.md](./research/2026-03-08-initial-exploration.md)
- [2026-03-08-effect-v4-module-selection.md](./research/2026-03-08-effect-v4-module-selection.md)
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](../../pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md)

---

## Purpose

### Problem

The monorepo now contains both an implemented `@beep/semantic-web` package and the design history that shaped it. What still needs a stable home is a closed spec record that says which semantic-web concerns belong in `@beep/semantic-web`, how they relate to `@beep/schema`, which adapter seams are first-class, and which decisions remain stable for future maintenance work.

### Solution

This completed spec package closes the exploratory semantic-web work that began under `specs/pending/semantic-web` and now lives at `specs/completed/semantic-web`. It records:

1. the initial public module topology
2. the package boundary with `@beep/schema`
3. the v1 provenance and evidence posture
4. the semantic schema metadata policy
5. the phased work, handoffs, and verification expectations that shaped implementation and still govern future changes

### Why It Matters

- The repo needs one canonical semantic-web foundation package instead of split proof modules and prior art.
- JSON-LD, RDF/JS-aligned values, provenance, and semantic metadata are cross-cutting concerns for expert-memory and semantic knowledge work in this monorepo.
- Future maintenance and expansion work should be able to follow a closed design record instead of reopening topology, boundary, and provenance decisions.

## Structural Pattern Reused

This package intentionally mirrors the nearby pending spec pattern used in [ip-law-knowledge-graph](../../pending/ip-law-knowledge-graph/README.md):

- a normative root README
- a short quick start
- per-phase agent prompts
- a reflection log
- per-phase handoffs and orchestrator prompts
- explicit phase outputs
- a manifest for artifact tracking

The exploratory semantic-web docs are preserved as evidence, then formalized through the same package structure.

## Evidence Posture

### Source-grounded facts

- [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) now exports `VERSION` plus the IRI family, so the package already has a small curated public surface.
- [`packages/common/semantic-web/src/iri.ts`](../../../packages/common/semantic-web/src/iri.ts) is a strong RFC 3987 syntax boundary and explicitly does not silently absorb normalization, comparison, transport, or mapping policy.
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) already models `Entity`, `Activity`, `Agent`, `SoftwareAgent`, `Plan`, and derivation-oriented constructs such as `PrimarySource`, `Quotation`, and `Revision`.
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) proves prior local appetite for separate `URI` and `IRI` value models, canonical branded strings, and parse / normalize / resolve / equal helpers.
- [`.repos/effect-v4/packages/effect/src/Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts) confirms `Schema.toArbitrary(...)`, `Schema.toFormatter(...)`, `Schema.toEquivalence(...)`, `Schema.toRepresentation(...)`, `Schema.toJsonSchemaDocument(...)`, `Schema.toCodecJson(...)`, `Schema.toCodecIso(...)`, `Schema.toCodecStringTree(...)`, and `Schema.toEncoderXml(...)` exist, while the exploratory Effect note classifies which of those belong in v1.

### Assumptions used by this spec

- `@beep/semantic-web` will continue to live at `packages/common/semantic-web`.
- Generic schema helpers such as `LiteralKit` and non-semantic repo-wide schema building blocks remain owned by `@beep/schema` unless later package evolution proves they are semantic-web-specific.
- Future package evolution may introduce adapter-specific dependencies behind service boundaries, but the public package identity should stay stable even if particular libraries change.

### Proposed design adopted by this spec

- `@beep/semantic-web` becomes the canonical owner of public semantic-web values, adapters, service contracts, and metadata patterns in this monorepo.
- The package posture is `foundation + adapters`, not semantic-web maximalism.
- JSON-LD is first-class in the initial package surface.
- IRI and URI remain separate public concepts in v1, with IRI as the semantic default.
- Ontology builder DSL work stays experimental.

## Scope

### In Scope

- public module topology for `@beep/semantic-web`
- boundary and migration posture relative to `@beep/schema`
- core semantic-web value and schema families
- JSON-LD, RDF/JS, provenance, evidence, SHACL, and bounded canonicalization adapter seams
- Effect v4-aligned equality, formatting, and verification defaults
- semantic schema metadata pattern adoption policy
- phased outputs, handoffs, and verification expectations

### Out Of Scope

- production implementation of `@beep/semantic-web`
- writing production package code while maintaining this spec package
- treating JSON Schema as a substitute for SHACL or OWL semantics
- using Effect `Graph` as the primary RDF semantic model
- inventing metadata-heavy annotations for every trivial helper schema
- promoting ontology builder DSL work out of the experimental tier without stronger local evidence

## Locked Defaults

The following defaults are preserved unless stronger local evidence explicitly contradicts them:

1. JSON-LD is first-class in the initial package surface.
2. `@beep/semantic-web` is the canonical semantic-web foundation package.
3. The package posture is `foundation + adapters`, not semantic-web maximalism.
4. `IRI` and `ProvO` are seed assets, not the whole package design.
5. Ontology builder DSL work stays experimental.
6. `Schema.toEquivalence(...)` is the default equality surface for schema-modeled domain values.
7. Effect `Graph` is projection-only and must not be the primary RDF semantic model.
8. `Hash` and `Equal` must not be treated as RDF semantic identity.
9. `JsonPatch` and `JsonPointer` are JSON-LD document-layer tools only.
10. Generic XML encoding is not RDF/XML.
11. PROV-O is the interoperable provenance backbone, not the entire expert-memory provenance solution.
12. Provenance must be paired with explicit evidence anchoring and bounded provenance projections.
13. Lifecycle time semantics must not be forced into plain PROV activity time fields.
14. `IRI` and `URI` stay separate first-class public concepts in v1, with IRI as the semantic default.
15. The initial PROV profile stays minimal, with an extension tier.
16. Web Annotation is an adapter seam for evidence anchoring, not a hard package-wide dependency.
17. `SemanticSchemaMetadata.kind` is a closed, intentionally coarse literal domain in v1.
18. The semantic schema metadata pattern is required for the right public schema families and intentionally avoided for trivial internal helpers.

## Architecture Decision Record Summary

| ADR | Decision Surface | Decision | Evidence / Rationale |
|---|---|---|---|
| ADR-001 | Canonical ownership | `@beep/semantic-web` is the canonical public semantic-web package | Current package stub exists; exploratory research and Graphiti memory already point to this package as canonical owner |
| ADR-002 | Package posture | Build `foundation + adapters`, not a maximal semantic-web runtime | Local research shows stronger fit for reusable values, schemas, and service seams than for full runtime maximalism |
| ADR-003 | Identifier posture | Keep `iri/` and `uri/` as separate public module families | Current `IRI` proof module and old `uri.ts` prior art solve different problems and should not be collapsed |
| ADR-004 | Equality posture | Use `Schema.toEquivalence(...)` by default for schema-modeled values; reserve hashing for canonicalized results | Confirmed by local Effect v4 source and the exploratory Effect note |
| ADR-005 | RDF graph posture | Treat Effect `Graph` only as a derived internal projection | Local Effect note shows graph equality and hashing do not model RDF graph semantics |
| ADR-006 | JSON-LD posture | Make JSON-LD first-class with both document and streaming adapter seams | Local upstream references include `jsonld.js`, context parsing, and streaming parser / serializer libraries |
| ADR-007 | Provenance posture | Use a minimal stable PROV profile, explicit evidence anchors, bounded projections, and explicit lifecycle time fields | PROV-O assessment and local `ProvO.ts` support this posture |
| ADR-008 | Metadata posture | Adopt a typed semantic schema metadata annotation pattern for public semantic schema families | Local JSDoc annotation pattern and exploratory semantic metadata note fit the repo’s schema-first approach |

## Package Boundary With `@beep/schema`

| Concern | Canonical Owner | Boundary Rule |
|---|---|---|
| Generic schema building blocks, repo-wide schema laws, `LiteralKit`, generic JSON and utility schemas | `@beep/schema` | Keep these generic and reusable across domains |
| Public semantic-web identifiers, RDF constructs, JSON-LD constructs, provenance profile values, evidence anchors, vocabulary values, semantic service contracts | `@beep/semantic-web` | These become the semantic-web package’s public identity |
| Current `IRI` and `ProvO` proof modules under `@beep/schema` | migrate to `@beep/semantic-web` public ownership | Treat as seed assets and migration inputs, not the final package boundary |
| Semantic schema metadata annotation helpers for semantic-web public families | `@beep/semantic-web` | The pattern is domain-specific even though it builds on generic `effect/Schema` facilities |
| Re-export policy | `@beep/semantic-web` is canonical; `@beep/schema` compatibility shims are allowed only as short-lived migration aids proven by migration inventory | Do not make `@beep/schema` the long-term discovery path for semantic-web modules |

## Initial Public Module Topology

| Module Family | Public Path | v1 Role | Notes |
|---|---|---|---|
| IRI values | `@beep/semantic-web/iri` | semantic identifier boundary, canonical strings, equivalence, normalization policy | IRI is the semantic default |
| URI values | `@beep/semantic-web/uri` | transport and interoperability-oriented normalization, parsing, resolution, serialization | Separate public concept from IRI; IDNA stays internal to this family in v1 |
| RDF values | `@beep/semantic-web/rdf` | RDF/JS-aligned terms, literals, quads, datasets, prefixes, namespace helpers | Primary semantic data model is RDF-aligned values, not Effect `Graph` |
| Vocabulary helpers | `@beep/semantic-web/vocab/*` | stable vocabulary term values for `rdf`, `rdfs`, `owl`, `prov`, `xsd`, `oa`, and repo-relevant terms | Use metadata annotations on important public schema families |
| JSON-LD values and docs | `@beep/semantic-web/jsonld` | document, context, framing, normalization, and projection-facing values plus service seams | JSON-LD is first-class, not a bolt-on export |
| Provenance values | `@beep/semantic-web/prov` | minimal stable PROV profile and extension tier | Treat PROV-O as backbone, not the whole operational model |
| Evidence anchors | `@beep/semantic-web/evidence` | evidence anchor values, selectors, Web Annotation adapter seam, bounded projections | Web Annotation is compatible but not mandatory |
| Service contracts | `@beep/semantic-web/services/*` | Effect v4 service contracts for JSON-LD, canonicalization, SHACL, provenance, and selected query seams | Contracts define seams without forcing concrete libraries into the public API |
| Adapters | `@beep/semantic-web/adapters/*` | backend-specific integration boundaries | Keep concrete library dependency swappable |
| Experimental | `@beep/semantic-web/experimental/*` | ontology-builder and other non-v1-stable work | Must remain clearly experimental |

## Upstream Library Classification

Canonical priority order:

- `core v1 stack`: `jsonld-streaming-parser.js`, `jsonld-streaming-serializer.js`, `shacl-engine`, `jsonld.js`, `jsonld-context-parser.js`, `rdf-canonize`
- `important deferred query research`: `traqula`, `comunica`
- `secondary comparison refs`: `rdf-validate-shacl`, `shex.js`, `clownface`, `rdfine`
- `exploratory or later-ingestion refs`: `GraphQL-LD.js`, `rdfa-streaming-parser.js`, `microdata-rdf-streaming-parser.js`

| Reference | Classification | Priority Tier | Intended Role | Hidden Pitfall |
|---|---|---|---|---|
| [`.repos/semantic-web/jsonld-streaming-parser.js`](../../../.repos/semantic-web/jsonld-streaming-parser.js) | `adapter target` | `core` | streaming JSON-LD to RDF/JS adapter seam | Streaming guarantees depend on document profile and remote-context behavior |
| [`.repos/semantic-web/jsonld-streaming-serializer.js`](../../../.repos/semantic-web/jsonld-streaming-serializer.js) | `adapter target` | `core` | RDF/JS to streaming JSON-LD adapter seam | No automatic RDF list reconstruction or deduplication; some non-streaming behaviors are intentionally unsupported |
| [`.repos/semantic-web/shacl-engine`](../../../.repos/semantic-web/shacl-engine) | `adapter target` | `core` | SHACL validation service contract backend | SPARQL support is an optional plugin, not baseline behavior |
| [`.repos/semantic-web/jsonld.js`](../../../.repos/semantic-web/jsonld.js) | `implementation reference` | `core` | document-oriented JSON-LD algorithms such as compact, expand, frame, and normalize | Remote document loading must stay bounded and policy-controlled |
| [`.repos/semantic-web/jsonld-context-parser.js`](../../../.repos/semantic-web/jsonld-context-parser.js) | `implementation reference` | `core` | context normalization and term expansion / compaction behavior | Remote-context recursion and validation toggles must not leak into public defaults |
| [`.repos/semantic-web/rdf-canonize`](../../../.repos/semantic-web/rdf-canonize) | `implementation reference` | `core` | bounded dataset canonicalization and fingerprinting backend | Poison-graph and blank-node complexity require explicit limits and abort controls |
| [`.repos/semantic-web/traqula`](../../../.repos/semantic-web/traqula) | `research-only reference` | `important deferred` | future SPARQL parser / generator / transformer research | Useful for AST work, but not a v1 foundation-package anchor |
| [`.repos/semantic-web/comunica`](../../../.repos/semantic-web/comunica) | `research-only reference` | `important deferred` | future SPARQL runtime and query-engine research | Monorepo scope is too large to shape the v1 public package boundary |
| [`.repos/semantic-web/rdf-validate-shacl`](../../../.repos/semantic-web/rdf-validate-shacl) | `research-only reference` | `secondary comparison` | alternate SHACL validation reference | Easy to mistake for the canonical backend decision when it is primarily a comparison point |
| [`.repos/semantic-web/shex.js`](../../../.repos/semantic-web/shex.js) | `research-only reference` | `secondary comparison` | alternate shape-language reference so SHACL is not the only validation lens | Can pull the design toward ShEx-specific modeling too early |
| [`.repos/semantic-web/clownface`](../../../.repos/semantic-web/clownface) | `research-only reference` | `secondary comparison` | graph traversal and node-navigation programming model reference | Its programming model is useful to study, but should not define the package’s schema-first identity |
| [`.repos/semantic-web/rdfine`](../../../.repos/semantic-web/rdfine) | `research-only reference` | `secondary comparison` | ontology-wrapper and object-mapping reference | Easy to drift into object-wrapper-first design instead of values plus adapters |
| [`.repos/semantic-web/GraphQL-LD.js`](../../../.repos/semantic-web/GraphQL-LD.js) | `research-only reference` | `exploratory` | linked-data query exploration for JSON-LD-facing consumers | Interesting, but too far from the current v1 foundation scope |
| [`.repos/semantic-web/rdfa-streaming-parser.js`](../../../.repos/semantic-web/rdfa-streaming-parser.js) | `research-only reference` | `later-ingestion` | RDFa ingestion reference for HTML-embedded semantic data | Useful only if HTML-embedded semantics become part of the first ingestion story |
| [`.repos/semantic-web/microdata-rdf-streaming-parser.js`](../../../.repos/semantic-web/microdata-rdf-streaming-parser.js) | `research-only reference` | `later-ingestion` | Microdata-to-RDF ingestion reference for HTML-embedded semantic data | Useful only if HTML-embedded semantics become part of the first ingestion story |

## Artifact Lineage

| Artifact | Status In This Package | Rationale |
|---|---|---|
| [research/2026-03-08-initial-exploration.md](./research/2026-03-08-initial-exploration.md) | preserved | Keeps subtree inventory, early tensions, and decision provenance |
| [research/2026-03-08-effect-v4-module-selection.md](./research/2026-03-08-effect-v4-module-selection.md) | preserved | Remains the Effect v4 evidence summary for module-fit claims |
| [design/foundation-decisions.md](./design/foundation-decisions.md) | preserved and elevated | Locked defaults stay in force for all later phases |
| [design/semantic-schema-metadata.md](./design/semantic-schema-metadata.md) | refined into a formal design note | Promotes the exploratory annotation pattern into the normative metadata policy |
| [handoffs/SPEC_FORMALIZATION_BOOTSTRAP_PROMPT.md](./handoffs/SPEC_FORMALIZATION_BOOTSTRAP_PROMPT.md) | superseded but retained | Replaced operationally by the formal handoff and orchestrator set, but preserved as provenance |

## Phase Breakdown

| Phase | Focus | Deliverable | Exit Criteria |
|---|---|---|---|
| P0 | Package Topology and Boundaries | [p0-package-topology-and-boundaries.md](./outputs/p0-package-topology-and-boundaries.md) | Public module map, `@beep/schema` boundary, upstream classification, and artifact-lineage posture are explicit |
| P1 | Core Schema and Value Design | [p1-core-schema-and-value-design.md](./outputs/p1-core-schema-and-value-design.md) | Core semantic schema families, equality policy, and metadata requirements are explicit |
| P2 | Adapter and Representation Design | [p2-adapter-and-representation-design.md](./outputs/p2-adapter-and-representation-design.md) | JSON-LD, RDF/JS, SHACL, canonicalization, and representation boundaries are explicit |
| P3 | Service Contract and Metadata Design | [p3-service-contract-and-metadata-design.md](./outputs/p3-service-contract-and-metadata-design.md) | Service contracts, provenance posture, evidence anchors, and metadata pattern usage are explicit |
| P4 | Implementation Plan and Verification Strategy | [p4-implementation-plan-and-verification-strategy.md](./outputs/p4-implementation-plan-and-verification-strategy.md) | File/module rollout order, acceptance criteria, and `bun` verification commands are explicit |

These output files now serve as the closed design record for the completed spec package. Revise them only when the public semantic-web design changes materially.

## Success Criteria

- [x] The semantic-web spec package is complete and moved under `specs/completed/semantic-web`.
- [x] The initial package topology is clear enough that implementation can follow it without redesigning the boundary.
- [x] The boundary with `@beep/schema` is explicit.
- [x] JSON-LD, provenance, evidence anchoring, and semantic metadata policy are decision-complete for v1.
- [x] Upstream libraries are explicitly classified as adapter targets, implementation references, or research-only references.
- [x] The phased workstream, handoffs, prompts, and outputs are present and internally consistent.
- [x] Verification expectations use `bun` and reflect actual repo and package scripts.

## Verification Expectations

Implementation and maintenance work should use the package-scoped `bun` commands already exposed by the repo:

```bash
bun run --filter=@beep/semantic-web check
bun run --filter=@beep/semantic-web lint
bun run --filter=@beep/semantic-web test
bun run --filter=@beep/semantic-web build
```

Spec-doc maintenance for this folder should additionally keep Markdown and JSON artifacts valid.

## Locked Execution Defaults

- `idna/` remains internal to `uri/` in v1. IDNA behavior is part of the `uri/` family and is not a first-class stable public submodule.
- JSON-LD framing remains part of the public `@beep/semantic-web/jsonld` contract, even if the first implementation slice defers non-critical framing helpers.
- `comunica` remains a research-only reference in v1 and must not shape the public adapter contract.
- `@beep/schema` compatibility re-exports are not planned by default. Use short-lived shims only if migration inventory later proves they are required.
- The stable root export surface is curated and minimal. Family-specific module paths remain canonical, and root exports must not become a package-wide convenience dump.

## Resolved Closeout Decisions

| Decision Surface | Closed Position |
|---|---|
| SPARQL contract breadth | keep the stable v1 SPARQL surface minimal and engine-agnostic |
| Web Annotation first-wave scope | ship the seam plus core evidence-anchor values first; defer a concrete adapter from the first implementation wave |
| `SemanticSchemaMetadata.specifications` posture | keep it typed but descriptive in v1 rather than machine-enforced |
