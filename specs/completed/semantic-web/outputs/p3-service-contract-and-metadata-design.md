# P3 — Service Contract and Metadata Design

## Purpose

Define the public service contracts for provenance, validation, query, and
representation work in `@beep/semantic-web`, and lock how semantic schema
metadata is surfaced to tooling without widening metadata usage beyond the
bounded policy already established in P1 and the design notes.

## Source-Grounded Inputs

- [`outputs/p1-core-schema-and-value-design.md`](./p1-core-schema-and-value-design.md)
  already closes public schema-family ownership, metadata coverage, and
  equality-versus-canonicalization rules.
- [`outputs/p2-adapter-and-representation-design.md`](./p2-adapter-and-representation-design.md)
  already closes the JSON-LD, SHACL, canonicalization, and query seam posture.
- [`design/provenance-and-evidence.md`](../design/provenance-and-evidence.md)
  already closes the minimal PROV profile, evidence-anchor posture, bounded
  projection rule, lifecycle-time rule, and Web Annotation seam.
- [`design/semantic-schema-metadata.md`](../design/semantic-schema-metadata.md)
  already closes the annotation key, helper pattern, required fields, and
  required-versus-optional-versus-avoided usage policy.
- [Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md](../../../pending/expert-memory-big-picture/research/Assessment%20of%20W3C%20PROV-O%20for%20Provenance%20in%20an%20Expert-Memory%20System.md)
  reinforces that PROV-O is the interoperable lineage backbone, not the whole
  operational provenance system.

## Locked Defaults Carried Forward

- `@beep/semantic-web` keeps the `foundation + adapters` posture.
- Public service contracts live under `@beep/semantic-web/services/*`.
- Public adapter integrations live under `@beep/semantic-web/adapters/*`.
- JSON-LD is first-class at the document, context, framing, and streaming
  layers.
- SHACL validation is public, but optional SHACL SPARQL behavior stays outside
  the stable baseline.
- Query remains minimal and engine-agnostic in v1.
- PROV-O remains the provenance backbone, paired with explicit evidence anchors,
  bounded projections, and explicit lifecycle time fields.
- Web Annotation remains an optional adapter seam and must not become a hard
  package-wide dependency.
- Semantic schema metadata remains selective rather than universal; trivial
  internal helpers stay intentionally unannotated.

## Service Contract Taxonomy

The stable contract layer distinguishes:

- foundation-level public surfaces:
  package-owned service module names, request/result/error schema families,
  bounded policy knobs, and semantic metadata with `kind = serviceContract`
- runtime backing posture:
  whether the contract is foundation-native, implementation-reference-backed,
  adapter-target-backed, or research-only extension-backed

The stable contract set for v1 is:

| Contract | Public Path | v1 Status | Primary Concern | Foundation-Level Public Surface | Runtime Backing Posture |
|---|---|---|---|---|---|
| provenance | `services/provenance` | required | provenance projection, summarization, bounded export | yes | foundation-native |
| JSON-LD context | `services/jsonld-context` | required | bounded context parse, validate, normalize, expand, compact | yes | implementation-reference-backed |
| JSON-LD document | `services/jsonld-document` | required | compact, expand, flatten, frame, `toRDF`, `fromRDF`, bounded document normalization | yes | implementation-reference-backed |
| canonicalization | `services/canonicalization` | required | dataset canonicalization and fingerprint preparation | yes | implementation-reference-backed |
| SHACL validation | `services/shacl-validation` | required | RDF dataset and shapes validation | yes | adapter-target-backed |
| SPARQL query | `services/sparql-query` | extension-tier | engine-agnostic query execution seam | yes | research-only extension-backed |

## Contract Matrix

| Contract | Role | Request Schema Families | Result Schema Families | Error Schema Families | Bounded Policy Knobs | Boundary Decision | Backing Notes |
|---|---|---|---|---|---|---|---|
| `services/provenance` | project package-owned provenance and evidence values into bounded views, summaries, and export bundles | provenance projection inputs, summary inputs, bounded export inputs, projection-scope selectors, lifecycle-field inclusion options | provenance views, provenance summaries, bounded provenance bundles, export packets | invalid projection scope, unsupported export profile, lifecycle mismatch, missing evidence anchor, bounded-work rejection | projection scope, summary depth, export profile, evidence inclusion policy, lifecycle-field inclusion, output size or bundle limits | foundation-level contract over `prov/`, `evidence/`, and vocabulary-owned terms | no external library is required for the baseline contract; Web Annotation mapping stays outside this service |
| `services/jsonld-context` | parse, validate, normalize, merge, expand, and compact JSON-LD contexts under bounded policy | inline context inputs, remote-context refs, merge or composition inputs, base-IRI-aware normalization inputs, bounded loader policy inputs | normalized context values, expanded terms, compacted IRIs, validated context packets | invalid context, remote-context policy violation, recursion-depth overflow, unsupported context feature, loader failure | remote-context enable or disable, recursion depth, validation strictness, base IRI, bounded loader policy | stable public representation contract | backed by `jsonld-context-parser.js` as an implementation reference; raw upstream option breadth stays out of the public API |
| `services/jsonld-document` | operate on JSON-LD documents and bridge them to and from RDF-aligned representations | compact, expand, flatten, frame, `toRDF`, `fromRDF`, remote-document loader inputs, safe-mode or bounded-normalization inputs | compacted documents, expanded documents, flattened documents, framed documents, RDF bridging packets, normalized document outputs | invalid document, document-loader failure, lossy transformation rejection, framing failure, bridging failure | document-loader policy, safe-mode posture, framing mode, base IRI, bounded normalization profile | stable public representation contract | backed by `jsonld.js` as an implementation reference; framing stays public, but document equality never becomes RDF semantic identity |
| `services/canonicalization` | canonicalize RDF datasets and derive stable fingerprint inputs from canonical results | dataset canonicalization inputs, algorithm selection, abort or deadline inputs, work-limit inputs, fingerprint derivation inputs | canonical dataset views, canonical serialization artifacts, fingerprint inputs or outputs, canonicalization reports | unsupported algorithm, abort, work-limit exceeded, dataset canonicalization failure | algorithm identifier, abort signal, deadline, work limit, canonical output profile, fingerprint profile | stable public validation-adjacent or representation-adjacent contract | backed by `rdf-canonize` as an implementation reference; canonicalization remains required before graph-level hashing or signature-oriented comparison |
| `services/shacl-validation` | validate RDF-aligned data against SHACL shapes | validation request inputs, RDF data dataset inputs, shapes dataset inputs, validation-profile inputs, optional extension flags | validation reports, conformance summaries, violation collections, bounded validation outputs | invalid shapes, invalid data dataset, validation engine failure, unsupported optional extension | validation profile, severity filtering, report detail level, optional extension enablement | stable public validation contract | backed by `shacl-engine` as the initial adapter target; SHACL core is baseline and SPARQL plugin behavior stays extension-tier |
| `services/sparql-query` | expose minimal engine-agnostic query execution without importing parser or runtime-specific types into the stable contract | query execution inputs, bound values, dataset or source inputs, result-shape selection, bounded execution options | result bindings, boolean results, graph or quad results, execution summaries | unsupported query profile, execution timeout, source failure, engine rejection | timeout, result-size limit, source selection, query profile, read-only execution posture | stable public query contract, but extension-tier in v1 | no parser AST, generated query artifact, algebra transform, or engine runtime object enters the stable surface; concrete engines remain deferred research or adapter work |

## Foundation-Level Versus Adapter-Backed Boundaries

### Foundation-Level Contracts

The following are foundation-level because the package must own the stable
public semantic meaning even if implementations change:

- `services/provenance`
- `services/jsonld-context`
- `services/jsonld-document`
- `services/canonicalization`
- `services/shacl-validation`
- `services/sparql-query`

For every contract above, the package owns:

- the module path and service identity
- the request, result, and error schema families
- the bounded policy knobs that callers can rely on
- the metadata annotation with `SemanticSchemaMetadata.kind = serviceContract`

### Runtime Backing Split

The backing posture is intentionally narrower than the public contract set:

- `services/provenance` is foundation-native in v1 because bounded projection,
  summarization, and export over package-owned provenance and evidence values do
  not require a concrete third-party runtime to define baseline semantics.
- `services/jsonld-context`, `services/jsonld-document`, and
  `services/canonicalization` are implementation-reference-backed. Their
  semantics are public and stable, but the initial implementation posture is
  informed by `jsonld-context-parser.js`, `jsonld.js`, and `rdf-canonize`
  without promoting those libraries to public identity.
- `services/shacl-validation` is adapter-target-backed because the stable
  contract depends on an interchangeable validation backend, with
  `shacl-engine` as the first-class target.
- `services/sparql-query` is research-only extension-backed in v1. The stable
  contract is deliberately minimal, and concrete engine or parser work remains
  outside the baseline package promise.

## Provenance Contract Posture

### Canonical Provenance Service Name

The stable public provenance contract name is:

- `services/provenance`

The package should not keep `services/provenance-projection` as the public
module name. Projection, summarization, and bounded export are operations of the
single provenance service contract rather than separate public ownership roots.

### Minimal Stable PROV Core

- `prov:Entity`
- `prov:Activity`
- `prov:Agent`
- `prov:SoftwareAgent`
- `prov:used`
- `prov:wasGeneratedBy`
- `prov:wasAssociatedWith`
- `prov:startedAtTime`
- `prov:endedAtTime`

### Early Extension Tier

- `prov:hadPrimarySource`
- `prov:wasQuotedFrom`
- `prov:wasRevisionOf`
- `prov:wasDerivedFrom`
- `prov:Plan`

### Required Provenance Guardrails

- evidence anchors remain explicit and first-class
- provenance outputs are bounded views, summaries, or export bundles rather
  than one unbounded global provenance graph
- lifecycle and domain time semantics remain explicit fields such as
  `observedAt`, `publishedAt`, `ingestedAt`, `assertedAt`, `derivedAt`,
  `effectiveAt`, and `supersededAt`
- policy, access control, and operational storage remain outside PROV-O itself

### Web Annotation Posture

Web Annotation remains optional adapter behavior:

- evidence-anchor core values stay owned by `evidence/`
- provenance service inputs and outputs must work without Web Annotation objects
- `adapters/web-annotation` may map package-owned evidence anchors to and from
  Web Annotation-compatible representations
- no public service contract may require Web Annotation as the only persisted,
  exchanged, or inspected evidence form

## Metadata Tooling Policy

### Required Metadata Coverage

Semantic schema metadata remains required for:

- important public semantic schema families already identified in P1
- public service-contract schemas under `services/*`

Semantic schema metadata remains optional for:

- adapter-local DTOs exposed only to cross a public adapter seam
- migration shims and transition helpers
- test-only schemas

Semantic schema metadata remains intentionally avoided for:

- tiny private helper schemas
- trivial tuple or record fragments
- internal scaffolding and plumbing
- adapter-local scaffolding whose meaning is already expressed by the public
  schema family that contains it

### Inspection Surface

Tooling should inspect metadata through the bounded helper pattern defined in
[`design/semantic-schema-metadata.md`](../design/semantic-schema-metadata.md):

- metadata is stored on the schema annotation key `semanticSchemaMetadata`
- metadata payloads are validated when attached to the schema
- a typed retrieval helper reads the annotation for tooling and docs
- a constructor helper attaches validated metadata during schema construction

This means:

- metadata inspection is a foundation helper surface, not a separate service
  contract
- metadata is not required to appear as a runtime field on decoded values
- tooling must treat missing metadata on trivial helpers as normal rather than
  as a package-policy failure
- tooling may rely on metadata presence for required public families and public
  service-contract schemas

### Contract Metadata Expectations

Public service-contract schemas should record, at minimum:

- `kind = serviceContract`
- `overview`
- `status`
- `specifications`
- `equivalenceBasis`

They should additionally record when semantically applicable:

- `representations`
- `canonicalizationRequired`
- `provenanceProfile`
- `evidenceAnchoring`
- `timeSemantics`

`SemanticSchemaMetadata.specifications` remains strongly typed but descriptive in
v1. P3 does not introduce machine-enforced citation mechanics.

## Consequences For P4

P4 should now treat the following as settled:

- the stable public provenance contract name is `services/provenance`
- the required public contract set is explicit
- every contract has a closed boundary between public ownership and runtime
  backing posture
- metadata inspection belongs to bounded helper surfaces rather than to a
  universal runtime field or a new metadata service
- Web Annotation stays optional adapter behavior and does not become a package
  dependency
- query remains execution-only and engine-agnostic in v1

## Outcome

P3 now closes the service-contract layer for `@beep/semantic-web` without
reopening prior phase decisions. Later implementation work can define service
classes, request/result/error schemas, and adapter modules against this output
without revisiting service ownership, provenance naming, metadata inspection, or
Web Annotation dependency policy.
