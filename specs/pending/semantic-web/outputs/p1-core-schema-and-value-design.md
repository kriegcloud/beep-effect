# P1 — Core Schema and Value Design

## Purpose

Define the public schema and value families that give `@beep/semantic-web` its
core identity, close module ownership for those families, and lock the equality,
normalization, and canonicalization rules that P2 and P3 must treat as settled.

## Source-Grounded Inputs

- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts)
  proves the current repo has a strict RFC 3987 syntax boundary and that
  syntax validation must not silently absorb normalization, comparison, or
  transport policy.
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts)
  proves the repo already has a broad local PROV-O seed surface, including the
  minimal core and the early derivation-oriented extension tier.
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts)
  provides local prior art for canonical URI and IRI strings, normalization,
  resolution, and equality helpers.
- [`design/foundation-decisions.md`](../design/foundation-decisions.md),
  [`design/semantic-schema-metadata.md`](../design/semantic-schema-metadata.md),
  and [`outputs/p0-package-topology-and-boundaries.md`](./p0-package-topology-and-boundaries.md)
  already lock the public module map and the cross-cutting defaults that P1
  must preserve.

## Locked Defaults Carried Forward

- `Schema.toEquivalence(...)` remains the default equality surface for
  schema-modeled semantic-web values.
- Explicit `Equivalence` instances are allowed where normalization or
  canonicalization rules make raw schema equivalence insufficient.
- Effect `Graph` stays projection-only and must not become the primary RDF
  semantic model.
- `Hash` and `Equal` stay internal-only semantic tools and are not RDF or
  provenance identity on raw values.
- `JsonPatch` and `JsonPointer` stay confined to JSON-LD document-layer editing
  and diffs.
- `IRI` remains the semantic default identifier surface and `URI` remains the
  transport and interoperability companion surface.
- PROV-O remains the interoperable provenance backbone, but provenance still
  requires explicit evidence anchors, bounded projections, and explicit
  lifecycle time fields.

## Public Schema Family Assignment

| Public Family | Public Path | Stable Public Schemas / Values | Metadata Posture | Design Notes |
|---|---|---|---|---|
| IRI identifiers | `@beep/semantic-web/iri` | `IRIReference`, `RelativeIRIReference`, `AbsoluteIRI`, canonical IRI string / value surfaces | required | semantic-first identifier family; seed from the current `IRI.ts` syntax boundary |
| URI identifiers | `@beep/semantic-web/uri` | URI references, absolute URIs, canonical URI string / value surfaces, URI component models, resolve / normalize helpers | required | transport and interoperability companion family; IDNA stays internal to this family |
| CURIE and prefixed-name identifiers | `@beep/semantic-web/rdf` | CURIE or prefixed-name values, prefix bindings, prefix maps, namespace declarations | required | CURIE ownership stays with RDF namespace machinery rather than becoming a third top-level identifier root |
| RDF term core | `@beep/semantic-web/rdf` | `NamedNode`, `BlankNode`, `Literal`, `DefaultGraph`, datatype and language-tag helper values | required | RDF/JS-aligned term layer is the primary semantic value model |
| RDF statement and dataset core | `@beep/semantic-web/rdf` | `Quad`, dataset values, dataset entry collections, canonical dataset view wrappers | required | dataset semantics stay distinct from Effect `Graph` and from raw hash-based identity |
| RDF namespace and compaction helpers | `@beep/semantic-web/rdf` | namespace values, namespace builders, expansion / compaction helpers, prefix registries | required | generic namespace values live in `rdf`; concrete standard vocabularies live in `vocab/*` |
| JSON-LD document constructs | `@beep/semantic-web/jsonld` | contexts, documents, frames, node / value / list / set / graph object families, remote-document refs | required for durable public document schemas | JSON-LD is first-class, but document-layer identity is not RDF semantic identity |
| JSON-LD document editing helpers | `@beep/semantic-web/jsonld` | document-layer patch or pointer helpers, document diff DTOs | required when public | `JsonPatch` and `JsonPointer` stay document-layer only |
| PROV core profile values | `@beep/semantic-web/prov` | `Entity`, `Activity`, `Agent`, `SoftwareAgent`, `Usage`, `Generation`, `Association`, `ProvDateTime`, bounded provenance bundle shapes | required | minimal stable core required in v1 |
| PROV early extension tier | `@beep/semantic-web/prov` | `Plan`, `Derivation`, `PrimarySource`, `Quotation`, `Revision`, `Delegation`, `Attribution`, `Start`, `End`, `Collection`, `Person`, `Organization` | required | seed from `ProvO.ts`; carried as the early extension tier, not as proof-only leftovers |
| Lifecycle provenance adjuncts | `@beep/semantic-web/prov` | explicit lifecycle time fields and supporting shapes such as `observedAt`, `publishedAt`, `ingestedAt`, `assertedAt`, `derivedAt`, `effectiveAt`, `supersededAt` | required when exported | these stay explicit and must not be folded into `prov:startedAtTime` / `prov:endedAtTime` |
| Evidence anchor core | `@beep/semantic-web/evidence` | evidence anchor ids, target refs, document or resource anchors, anchor bundles or packets | required | adapter-neutral anchor family that provenance can point at directly |
| Evidence selector families | `@beep/semantic-web/evidence` | text-quote selectors, text-position selectors, fragment selectors, span or pointer selectors, bounded evidence projections | required | Web Annotation-compatible seam without requiring Web Annotation as the only operational model |
| Vocabulary term families | `@beep/semantic-web/vocab/*` | concrete term modules for `rdf`, `rdfs`, `owl`, `prov`, `xsd`, `oa`, and repo-relevant vocabularies | required | concrete terms and namespace constants live here; generic prefix / namespace mechanics stay in `rdf` |
| Public service-contract schemas | `@beep/semantic-web/services/*` | contract DTOs for JSON-LD, canonicalization, SHACL, provenance projection, and minimal query seams | required | detailed contract design is deferred to P3, but ownership is closed here |
| Public adapter-boundary schemas | `@beep/semantic-web/adapters/*` | adapter-local representation DTOs and mapping result shapes | optional | public when needed for adapter boundaries, but not part of the core semantic value identity |
| Experimental ontology or builder values | `@beep/semantic-web/experimental/*` | ontology builder DSLs and non-v1-stable semantic helpers | avoid for v1 stability claims | explicitly outside the stable P1 core contract |

## Metadata Policy

### Required

Semantic schema metadata is required for:

- public `iri` and `uri` schemas, including canonical string or value wrappers
- public CURIE, prefixed-name, prefix, and namespace schemas
- public RDF term, quad, dataset, and canonical dataset view schemas
- public JSON-LD document, context, and framing schemas
- public provenance and evidence-anchor schemas
- public vocabulary term and namespace modules
- public service-contract schemas

### Optional

Semantic schema metadata is optional for:

- adapter-local DTOs that exist only to cross a public adapter seam
- migration shims and transition helpers
- test-only schemas
- bounded canonicalization result wrappers whose semantics are already fully
  inherited from a better-documented public family

### Intentionally Avoided

Semantic schema metadata should be intentionally avoided for:

- tiny private helper schemas
- trivial tuple, record, or parser fragments
- internal dataset index keys or cache wrappers
- internal IDNA helpers and other `uri/` scaffolding that are not public
- internal canonicalization plumbing whose meaning is already expressed by the
  public schema that contains it

### Metadata Kind Mapping

The closed v1 `SemanticSchemaMetadata.kind` domain maps to the public families
as follows:

| Family | `kind` |
|---|---|
| `iri`, `uri`, CURIE, prefixed-name | `identifier` |
| RDF terms, quads, datasets, prefixes, namespaces | `rdfConstruct` |
| JSON-LD documents, contexts, frames, document-layer patch helpers | `jsonldConstruct` |
| PROV values, lifecycle provenance adjuncts, evidence anchors, evidence selectors | `provenanceConstruct` |
| vocabulary term modules | `vocabularyTerm` |
| public service contracts | `serviceContract` |
| public adapter-boundary DTOs | `adapterBoundary` |

Evidence anchors intentionally stay inside the coarse
`provenanceConstruct` bucket in v1 rather than introducing a new `kind`
literal and reopening the locked metadata-domain decision.

## Equality, Normalization, and Canonicalization Policy

| Family | Default Equality Surface | Default Normalization Policy | Canonicalization Policy | Hidden Pitfall |
|---|---|---|---|---|
| IRI identifiers | `Schema.toEquivalence(...)` on validated IRI schemas | syntax and trimmed-input boundary only; no implicit IRI-to-URI mapping, IDNA, scheme-specific rewrite, or silent percent-decoding | required before hashing, fingerprints, signatures, or any API that promises canonical semantic identifiers | treating RFC 3987 syntax success as proof that two differently encoded IRIs are already the same semantic identity |
| URI identifiers | `Schema.toEquivalence(...)` on canonical normalized URI string or value models | normalization is owned by `uri/`: scheme and host case folding, unreserved percent-decoding, path or port cleanup, and internal IDNA policy where applicable | required before hashing, transport cache keys, or signed normalized exports; canonical URI serialization is the family default when a canonical surface is exposed | leaking transport normalization back into `iri/` or exposing IDNA internals as a stable public submodule |
| CURIE, prefixed-name, prefix, namespace | `Schema.toEquivalence(...)` on normalized bindings or on expanded canonical IRI targets | trimmed prefix tokens, deterministic expansion or compaction against an explicit prefix map, namespace IRIs normalized under identifier rules | required when sharing compact forms or prefix registries across documents or adapters | treating preferred prefix text as identity when only the expanded IRI is stable across prefix maps |
| RDF terms | `Schema.toEquivalence(...)` on term schemas | `NamedNode` identity follows canonical identifier rules; `Literal` preserves lexical form and normalizes datatype ids and language-tag casing only; `BlankNode` equality is local label equality only | required before hashing or signing term collections that may include blank nodes or datatype aliases | treating blank-node labels or lexical variants as RDF semantic identity |
| RDF quads and datasets | raw shaped values use `Schema.toEquivalence(...)`; semantic graph identity requires an explicit canonicalization step | deterministic internal ordering is allowed for storage or tests, but order is not semantic identity | required for dataset equality across blank-node renaming, fingerprints, signatures, and graph-level identity claims | using Effect `Graph`, raw array order, `Hash`, or `Equal` as RDF dataset identity |
| JSON-LD documents and contexts | `Schema.toEquivalence(...)` on document-layer shapes only | validation and bounded document normalization only; no claim that compacted, expanded, and source document forms are semantically interchangeable without an adapter step | canonicalization is explicit and adapter-driven, either as JSON-LD normalization or after conversion to RDF dataset canonicalization | using document equality, `JsonPatch`, or `JsonPointer` as the semantic diff story for RDF content |
| Provenance values | `Schema.toEquivalence(...)` on PROV values and bounded projection schemas | identifiers normalize under `iri/` or `uri/`; `ProvDateTime` decodes to a canonical time value; lifecycle time fields stay explicit rather than being folded into activity times | required when exporting provenance as RDF bundles, hashing projections, or signing bounded audit packets | collapsing lifecycle fields into `prov:startedAtTime` / `prov:endedAtTime` or assuming one unbounded global provenance graph is the core value model |
| Evidence anchors and selectors | `Schema.toEquivalence(...)` on normalized anchor values of the same selector kind | normalize referenced identifiers and selector-specific scalar fields, but preserve selector semantics such as exact quote text or explicit offsets | required when mapping to Web Annotation, emitting signed evidence packets, or deduplicating across heterogeneous selectors | assuming two different selector kinds are semantically identical because they seem to target the same passage |
| Vocabulary terms | `Schema.toEquivalence(...)` on canonical term IRIs and term schemas | canonical IRI is the stable identity; preferred prefix, local name, aliases, and deprecation notes are descriptive metadata only | required when producing stable registries, fingerprints, or export bundles that compare terms across vocabularies | using local names or preferred prefixes as durable identity instead of the canonical term IRI |
| Public service contracts | `Schema.toEquivalence(...)` on contract DTOs only | normalize contained core values according to their owning families; contract wrappers do not invent new semantic identity rules | canonicalize only when a service contract explicitly declares a canonical output representation | letting transport DTO structure replace the semantics of the contained identifier, RDF, provenance, or evidence values |
| Public adapter DTOs | incidental shape equality only | adapter-local normalization may exist, but it is not promoted to package-wide semantic identity | canonicalization is adapter-specific and must not silently redefine core family semantics | allowing one backend’s DTO quirks to become the package’s normative value semantics |

## Cross-Family Consequences

- `Hash` and `Equal` may be used for memoization or cache keys only after the
  relevant family has already been canonicalized or fingerprinted.
- No family may use Effect `Graph` as its canonical public value model. If a
  graph projection is useful, it is derived from RDF datasets or provenance
  bundles and remains projection-only.
- JSON Schema or other JSON-facing codecs remain documentation and boundary
  helpers. They do not replace RDF, PROV, vocabulary, or identifier semantics.
- Vocabulary modules own concrete canonical term values. Generic namespace and
  prefix mechanics remain in `rdf`, which prevents prefix registries from being
  reopened as separate top-level ownership.
- The `ProvO.ts` seed asset is migration input and evidence, but the stable v1
  PROV profile remains intentionally smaller than the whole seed surface. The
  early extension tier is public, but it is still described as extension tier.

## Outcome

P1 now closes the public value-family ownership, metadata coverage, and
per-family identity policy for `@beep/semantic-web`. P2 and P3 should treat the
following as settled:

- which module family owns each stable semantic-web value family
- where semantic schema metadata is required, optional, or intentionally avoided
- when `Schema.toEquivalence(...)` is sufficient and when canonicalization is
  required first
- why `Graph`, `Hash`, `Equal`, `JsonPatch`, and `JsonPointer` do not reopen
  RDF or provenance identity decisions

The phase exit gate is therefore satisfied once later phases reuse these rules
instead of redefining identifier ownership, dataset identity, provenance
semantics, or evidence-anchor behavior.
