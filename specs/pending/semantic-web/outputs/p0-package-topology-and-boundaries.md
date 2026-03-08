# P0 — Package Topology and Boundaries

## Purpose

Lock the initial public module topology for `@beep/semantic-web`, define the boundary with `@beep/schema`, classify upstream references, and record how exploratory artifacts are preserved or superseded.

## Evidence Basis

- [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) is a stub, so the package identity still needs to be defined.
- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) is a strong syntax boundary but not the whole identifier policy.
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) proves local PROV modeling depth.
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) proves local prior art for separate `URI` and `IRI` surfaces.
- The vendored semantic-web subtree set provides concrete JSON-LD, SHACL, canonicalization, query, and streaming references.

## Boundary Decision

| Concern | Canonical Owner | Decision |
|---|---|---|
| generic schema tooling and repo-wide schema laws | `@beep/schema` | stays generic |
| public semantic-web values, vocabularies, service contracts, metadata helpers, and adapters | `@beep/semantic-web` | canonical public owner |
| current `IRI` and `ProvO` proof modules | migrate to `@beep/semantic-web` public ownership | keep proof modules only as migration inputs |
| temporary compatibility re-exports | `@beep/schema` only if migration inventory proves they are needed | do not plan shims by default |
| consumer discovery path | `@beep/semantic-web` | long-term canonical import path |

## Public Module Topology

| Module Family | Public Path | v1 Role |
|---|---|---|
| IRI | `@beep/semantic-web/iri` | semantic-first identifier values and canonical strings |
| URI | `@beep/semantic-web/uri` | transport and interoperability-oriented identifier helpers with internal IDNA behavior in v1 |
| RDF | `@beep/semantic-web/rdf` | RDF/JS-aligned terms, quads, datasets, prefixes, namespaces |
| Vocabulary helpers | `@beep/semantic-web/vocab/*` | reusable vocabulary term modules |
| JSON-LD | `@beep/semantic-web/jsonld` | document, context, framing, and projection-facing values |
| Provenance | `@beep/semantic-web/prov` | minimal stable PROV profile and extension tier |
| Evidence | `@beep/semantic-web/evidence` | evidence anchors and Web Annotation seam |
| Services | `@beep/semantic-web/services/*` | Effect v4 service contracts |
| Adapters | `@beep/semantic-web/adapters/*` | concrete backend integrations |
| Experimental | `@beep/semantic-web/experimental/*` | ontology-builder and similar experimental work |

## Upstream Classification

| Reference | Classification | Notes |
|---|---|---|
| `jsonld-streaming-parser.js` | `adapter target` | streaming `JSON-LD -> RDF/JS` |
| `jsonld-streaming-serializer.js` | `adapter target` | streaming `RDF/JS -> JSON-LD` |
| `shacl-engine` | `adapter target` | SHACL validation backend |
| `jsonld.js` | `implementation reference` | document-level JSON-LD algorithms |
| `jsonld-context-parser.js` | `implementation reference` | context normalization behavior |
| `rdf-canonize` | `implementation reference` | canonicalization and fingerprinting backend |
| `traqula` | `research-only reference` | future SPARQL AST tooling |
| `comunica` | `research-only reference` | future SPARQL runtime research |

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
- the stable root export surface is curated and minimal; family-specific paths remain canonical.
- temporary `@beep/schema` compatibility re-exports are contingency-only and require migration-inventory evidence.

## Outcome

P0 is complete. The package now has a stable public topology, a boundary with `@beep/schema`, explicit upstream-library classification, and explicit exploratory artifact lineage.
