# P0 — Package Topology and Boundaries

## Purpose

Lock the initial public module topology for `@beep/semantic-web`, define the long-term boundary with `@beep/schema`, record the `IRI` and `ProvO` seed-asset migration posture, lock the internal `idna/` and curated root-export defaults, and classify the locally vendored upstream references.

## Evidence Basis

- [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) now exports `VERSION` plus the IRI family, so the package already has a small curated convenience surface.
- [`packages/common/semantic-web/package.json`](../../../packages/common/semantic-web/package.json) still exposes a broad wildcard subpath export, which is wider than the intended long-term curated public surface and should not be treated as normative package policy.
- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) is a strong syntax boundary but not the whole identifier policy.
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) proves local PROV modeling depth.
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) proves local prior art for separate `URI` and `IRI` surfaces.
- [`packages/common/schema/test/IRI.test.ts`](../../../packages/common/schema/test/IRI.test.ts) and [`packages/common/schema/test/ProvO.test.ts`](../../../packages/common/schema/test/ProvO.test.ts) show the remaining repo-visible uses of the old internal proof modules are test-only, not stable consumer-facing imports.
- The vendored semantic-web subtree set provides concrete JSON-LD, SHACL, canonicalization, query, and streaming references.

## Boundary Decision

| Concern | Canonical Owner | Decision |
|---|---|---|
| generic schema tooling and repo-wide schema laws | `@beep/schema` | stays generic |
| public semantic-web values, vocabularies, service contracts, metadata helpers, and adapters | `@beep/semantic-web` | canonical public owner |
| current `IRI` and `ProvO` proof modules | migrate to `@beep/semantic-web` public ownership | keep proof modules only as migration inputs |
| temporary compatibility re-exports | `@beep/schema` only if migration inventory proves they are needed | do not plan shims by default |
| consumer discovery path | `@beep/semantic-web` | long-term canonical import path |

## Seed Asset Migration Posture

| Current Asset | v1 Package Role | Migration Stance |
|---|---|---|
| [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) | syntax-boundary seed for semantic identifiers | promote public ownership into `@beep/semantic-web/iri`; preserve only genuinely generic helper dependencies in `@beep/schema` |
| [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) | provenance seed asset | promote public ownership into `@beep/semantic-web/prov`; retain only generic helper dependencies in `@beep/schema` |
| [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) | current thin package entry surface | keep the root surface curated; do not let the entry module become a convenience dump as more families land |
| [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) | local prior art for `uri/` | mine semantics and helper shape, including internal IDNA handling, but do not copy Effect v3 assumptions or mutable global registration patterns blindly |

## Public Module Topology

| Module Family | Public Path | Required In v1 | v1 Role |
|---|---|---|---|
| IRI | `@beep/semantic-web/iri` | yes | semantic-first identifier values and canonical strings |
| URI | `@beep/semantic-web/uri` | yes | transport and interoperability-oriented identifier helpers, with `idna/` kept internal in v1 |
| RDF | `@beep/semantic-web/rdf` | yes | RDF/JS-aligned terms, literals, quads, datasets, prefixes, and namespace helpers |
| Vocabulary helpers | `@beep/semantic-web/vocab/*` | yes | reusable vocabulary term modules such as `rdf`, `rdfs`, `owl`, `prov`, `xsd`, and `oa` |
| JSON-LD | `@beep/semantic-web/jsonld` | yes | document, context, framing, normalization, and projection-facing values plus JSON-LD-facing seams |
| Provenance | `@beep/semantic-web/prov` | yes | minimal stable PROV profile and extension tier |
| Evidence | `@beep/semantic-web/evidence` | yes | evidence anchors, selectors, Web Annotation-compatible seam, and bounded evidence projections |
| Services | `@beep/semantic-web/services/*` | yes | Effect v4 service contracts for JSON-LD, canonicalization, SHACL, provenance, and minimal query seams |
| Adapters | `@beep/semantic-web/adapters/*` | yes | concrete backend integrations that satisfy the service contracts |
| Experimental | `@beep/semantic-web/experimental/*` | no | ontology-builder and similar experimental work only |

## Public Export Policy

The stable v1 export posture is:

- root exports are limited to `VERSION`, `IRI`, `AbsoluteIRI`, `IRIReference`, and `RelativeIRIReference`
- family-specific module paths remain canonical even when the root offers convenience exports
- there is no stable `@beep/semantic-web/idna` public module in v1
- there are no root exports for `uri`, `rdf`, `vocab/*`, `jsonld`, `prov`, `evidence`, `services/*`, `adapters/*`, or `experimental/*`
- the wildcard export map in [`packages/common/semantic-web/package.json`](../../../packages/common/semantic-web/package.json) is current implementation scaffolding, not the long-term package boundary contract

## Upstream Classification

### Canonical priority order

- `core v1 adapter targets`
  - `jsonld-streaming-parser.js`
  - `jsonld-streaming-serializer.js`
  - `shacl-engine`
- `core implementation references`
  - `jsonld.js`
  - `jsonld-context-parser.js`
  - `rdf-canonize`
- `deferred but important query research`
  - `traqula`
  - `comunica`
- `secondary comparison references`
  - `rdf-validate-shacl`
  - `shex.js`
  - `clownface`
  - `rdfine`
- `exploratory or later-ingestion references`
  - `GraphQL-LD.js`
  - `rdfa-streaming-parser.js`
  - `microdata-rdf-streaming-parser.js`

| Reference | Classification | Priority Tier | Package Role | Hidden Pitfall |
|---|---|---|---|---|
| [`.repos/semantic-web/jsonld-streaming-parser.js`](../../../.repos/semantic-web/jsonld-streaming-parser.js) | `adapter target` | `core` | streaming `JSON-LD -> RDF/JS` seam | remote contexts and streaming-profile behavior can change runtime characteristics |
| [`.repos/semantic-web/jsonld-streaming-serializer.js`](../../../.repos/semantic-web/jsonld-streaming-serializer.js) | `adapter target` | `core` | streaming `RDF/JS -> JSON-LD` seam | the serializer intentionally omits some whole-document behaviors such as RDF list recovery and deduplication |
| [`.repos/semantic-web/shacl-engine`](../../../.repos/semantic-web/shacl-engine) | `adapter target` | `core` | SHACL validation backend | SPARQL support is opt-in and should stay explicit |
| [`.repos/semantic-web/jsonld.js`](../../../.repos/semantic-web/jsonld.js) | `implementation reference` | `core` | document-oriented JSON-LD algorithms | remote loading and document-loader policy must stay bounded |
| [`.repos/semantic-web/jsonld-context-parser.js`](../../../.repos/semantic-web/jsonld-context-parser.js) | `implementation reference` | `core` | context normalization and IRI compaction and expansion behavior | raw upstream options are too wide for the package's default public API |
| [`.repos/semantic-web/rdf-canonize`](../../../.repos/semantic-web/rdf-canonize) | `implementation reference` | `core` | dataset canonicalization and fingerprinting backend | complexity controls and abort policy must be part of the contract |
| [`.repos/semantic-web/traqula`](../../../.repos/semantic-web/traqula) | `research-only reference` | `important deferred` | future SPARQL AST work | useful for parser and generator research, but not a v1 foundation boundary |
| [`.repos/semantic-web/comunica`](../../../.repos/semantic-web/comunica) | `research-only reference` | `important deferred` | future query-runtime work | too large and engine-specific to define the v1 package identity |
| [`.repos/semantic-web/rdf-validate-shacl`](../../../.repos/semantic-web/rdf-validate-shacl) | `research-only reference` | `secondary comparison` | alternate SHACL validation reference | easy to mistake for the canonical backend decision when it is primarily a comparison point |
| [`.repos/semantic-web/shex.js`](../../../.repos/semantic-web/shex.js) | `research-only reference` | `secondary comparison` | alternate shape-language reference so SHACL is not the only validation lens | can pull the design toward ShEx-specific modeling too early |
| [`.repos/semantic-web/clownface`](../../../.repos/semantic-web/clownface) | `research-only reference` | `secondary comparison` | graph traversal and node-navigation programming model reference | its programming model is useful to study, but should not define the package's schema-first identity |
| [`.repos/semantic-web/rdfine`](../../../.repos/semantic-web/rdfine) | `research-only reference` | `secondary comparison` | ontology-wrapper and object-mapping reference | easy to drift into object-wrapper-first design instead of values plus adapters |
| [`.repos/semantic-web/GraphQL-LD.js`](../../../.repos/semantic-web/GraphQL-LD.js) | `research-only reference` | `exploratory` | linked-data query exploration for JSON-LD-facing consumers | interesting, but too far from the current v1 foundation scope |
| [`.repos/semantic-web/rdfa-streaming-parser.js`](../../../.repos/semantic-web/rdfa-streaming-parser.js) | `research-only reference` | `later-ingestion` | RDFa ingestion reference for HTML-embedded semantic data | useful only if HTML-embedded semantics become part of the first ingestion story |
| [`.repos/semantic-web/microdata-rdf-streaming-parser.js`](../../../.repos/semantic-web/microdata-rdf-streaming-parser.js) | `research-only reference` | `later-ingestion` | Microdata-to-RDF ingestion reference for HTML-embedded semantic data | useful only if HTML-embedded semantics become part of the first ingestion story |

## Exploratory Artifact Lineage

| Artifact | Status | Rationale |
|---|---|---|
| `research/2026-03-08-initial-exploration.md` | preserved | evidence and provenance for the current topology |
| `research/2026-03-08-effect-v4-module-selection.md` | preserved | Effect v4 source-backed module-fit evidence |
| `design/foundation-decisions.md` | preserved and elevated | locked defaults for the formal spec |
| `design/semantic-schema-metadata.md` | preserved and refined | promoted into formal metadata policy |
| `handoffs/NEXT_SESSION_SPEC_PROMPT.md` | superseded but preserved | replaced operationally by the formal handoffs and prompts |

## Locked Defaults Carried Forward

- `idna/` stays internal to the `uri/` family in v1 and is not promoted to a first-class public submodule.
- the stable root export surface is curated and minimal; in v1 it is `VERSION` plus the IRI family only.
- temporary `@beep/schema` compatibility re-exports are contingency-only and require migration-inventory evidence.
- `IRI` and `URI` remain separate first-class public concepts in v1, with IRI as the semantic default.
- `IRI` and `ProvO` are seed assets and migration inputs, not the whole package design.
- `comunica` remains a research-only reference in v1 and must not shape the stable public adapter contract.

## Residual Open Questions

| Question | Options | Recommended Default |
|---|---|---|
| How broad should the stable v1 SPARQL contract be? | `no public SPARQL contract in v1`, `minimal query contract only`, `parser plus runtime surfaces in v1` | `minimal query contract only`; keep Traqula and Comunica as research inputs until stronger local need exists |
| Should the first adapter-focused implementation slice include a public Web Annotation adapter? | `core seam plus anchor values only`, `core seam plus public Web Annotation adapter in the first adapter slice` | implement the seam and core evidence-anchor values first; add the public adapter in the first adapter slice only if it does not slow core value delivery |
| Should `SemanticSchemaMetadata.specifications` stay descriptive-only or gain machine-checkable enforcement in v1? | `typed but descriptive`, `partially machine-checkable in v1` | `typed but descriptive in v1`; avoid overfitting the first release around citation-enforcement mechanics |

## Outcome

This P0 output now finalizes the v1 module families, the long-term `@beep/schema` boundary, the `IRI` and `ProvO` seed-asset posture, the internal `idna/` posture, the curated root-export surface, and the upstream-library classification. Later phases should execute against these decisions rather than reopen them.
