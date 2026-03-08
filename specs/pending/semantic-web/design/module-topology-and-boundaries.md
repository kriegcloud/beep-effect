# Module Topology and Boundaries

## Purpose

Define the initial public module topology for `@beep/semantic-web`, make the boundary with `@beep/schema` explicit, and classify which locally vendored semantic-web libraries are adapter targets versus references.

## Evidence Basis

### Source-grounded facts

- [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) is effectively empty.
- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) provides a strong RFC 3987 syntax boundary but intentionally leaves normalization, comparison, and mapping policy to callers.
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) already models a broad PROV-O surface with core and extension-oriented constructs.
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) provides local prior art for parse / normalize / resolve / equal helpers plus separate `URI` and `IRI` value models.
- The semantic-web subtree set under [`.repos/semantic-web`](../../../.repos/semantic-web) now provides concrete JSON-LD, SHACL, canonicalization, query, and streaming references.

### Assumptions

- `@beep/schema` remains the owner of generic schema building blocks and repo-wide schema laws.
- `@beep/semantic-web` should depend on `@beep/schema` rather than absorbing generic helpers into semantic-web ownership.

## Boundary With `@beep/schema`

| Concern | Owner | Boundary Rule |
|---|---|---|
| Generic schema helpers and literal tooling | `@beep/schema` | Keep generic schema utilities generic |
| Public semantic identifiers and RDF / JSON-LD / provenance / evidence values | `@beep/semantic-web` | Public domain ownership lives here |
| Semantic schema metadata helpers for semantic-web families | `@beep/semantic-web` | Domain-specific pattern belongs with the domain package |
| Existing `IRI` and `ProvO` proof modules | migrate to `@beep/semantic-web` ownership | Treat as seed assets and evidence, not final package boundaries |
| Consumer discovery path | `@beep/semantic-web` | Avoid permanent dual entry points |

## Initial Public Module Map

| Module Family | Public Path | Required In v1 | Role |
|---|---|---|---|
| IRI | `@beep/semantic-web/iri` | yes | semantic-first identifiers, canonical strings, decode / normalize / equivalence policy |
| URI | `@beep/semantic-web/uri` | yes | transport and interoperability-oriented identifiers, parse / normalize / resolve / serialize |
| RDF | `@beep/semantic-web/rdf` | yes | RDF/JS-aligned terms, literals, quads, datasets, prefixes, namespace helpers |
| Vocabularies | `@beep/semantic-web/vocab/*` | yes | stable vocabulary term modules such as `rdf`, `rdfs`, `owl`, `prov`, `xsd`, `oa` |
| JSON-LD | `@beep/semantic-web/jsonld` | yes | document, context, framing, normalization, and JSON-LD-specific representation seams |
| Provenance | `@beep/semantic-web/prov` | yes | minimal stable PROV profile and extension tier |
| Evidence | `@beep/semantic-web/evidence` | yes | evidence anchors, selectors, Web Annotation mapping seam, bounded evidence projections |
| Services | `@beep/semantic-web/services/*` | yes | Effect v4 service contracts for JSON-LD, canonicalization, SHACL, provenance, and minimal query seams |
| Adapters | `@beep/semantic-web/adapters/*` | yes | concrete library integrations that satisfy the service contracts |
| Experimental | `@beep/semantic-web/experimental/*` | no | ontology-builder and related experimental work only |

## Seed Asset Migration Posture

| Current Asset | v1 Package Role | Migration Stance |
|---|---|---|
| [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts) | syntax boundary and validation seed | promote public semantic ownership into `@beep/semantic-web/iri`; preserve generic helpers in `@beep/schema` where still generic |
| [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts) | provenance seed asset | promote public provenance ownership into `@beep/semantic-web/prov`; retain only generic helper dependencies in `@beep/schema` |
| [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts) | package stub | replace with the module map defined here during implementation |
| [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts) | local prior art | mine for semantics and helper shape, but do not copy mutable global scheme registration or Effect v3-era assumptions blindly |

## Upstream Library Classification

| Reference | Classification | Package Role | Hidden Pitfall |
|---|---|---|---|
| [`.repos/semantic-web/jsonld-streaming-parser.js`](../../../.repos/semantic-web/jsonld-streaming-parser.js) | `adapter target` | streaming `JSON-LD -> RDF/JS` seam | Remote contexts and streaming-profile behavior can change runtime characteristics |
| [`.repos/semantic-web/jsonld-streaming-serializer.js`](../../../.repos/semantic-web/jsonld-streaming-serializer.js) | `adapter target` | streaming `RDF/JS -> JSON-LD` seam | Streaming serializer intentionally omits some whole-document behaviors such as RDF list recovery and deduplication |
| [`.repos/semantic-web/shacl-engine`](../../../.repos/semantic-web/shacl-engine) | `adapter target` | SHACL validation backend | SPARQL support is opt-in and should stay explicit |
| [`.repos/semantic-web/jsonld.js`](../../../.repos/semantic-web/jsonld.js) | `implementation reference` | document-oriented JSON-LD algorithms | Remote loading and document-loader policy must stay bounded |
| [`.repos/semantic-web/jsonld-context-parser.js`](../../../.repos/semantic-web/jsonld-context-parser.js) | `implementation reference` | context normalization and IRI compaction / expansion behavior | Raw upstream options are too wide for the package’s default public API |
| [`.repos/semantic-web/rdf-canonize`](../../../.repos/semantic-web/rdf-canonize) | `implementation reference` | dataset canonicalization and fingerprinting backend | Complexity controls and abort policy must be part of the contract |
| [`.repos/semantic-web/traqula`](../../../.repos/semantic-web/traqula) | `research-only reference` | future SPARQL AST work | Useful for parser / generator research, but not a v1 foundation boundary |
| [`.repos/semantic-web/comunica`](../../../.repos/semantic-web/comunica) | `research-only reference` | future query-runtime work | Too large and engine-specific to define the v1 package identity |

## Public Export Policy

The initial public export posture should be:

- stable public families under focused module paths
- no “everything from root” maximal export surface
- no permanent semantic-web ownership through `@beep/schema`
- no experimental ontology-builder exports from the stable root surface

## Acceptance Criteria

This design is ready for implementation planning once:

- the module map is explicit
- the `@beep/schema` boundary is explicit
- seed assets have a migration posture
- upstream references are classified with rationale

## Open Question

Should the first stable root export surface include selected convenience re-exports for `iri`, `uri`, `rdf`, `jsonld`, and `prov`, or should consumers always use family-specific paths?

Recommended default:

- allow a small root surface for the package’s most universal values
- keep family-specific paths as the primary documentation and dependency boundary
