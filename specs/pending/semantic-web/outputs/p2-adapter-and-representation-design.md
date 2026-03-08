# P2 — Adapter and Representation Design

## Purpose

Define the public representation seams and adapter posture for
`@beep/semantic-web` so that later service-contract work can distinguish:

- stable public semantic-web value surfaces
- stable public representation seams
- concrete adapter targets
- implementation references
- research-only runtimes that must not shape the v1 package boundary

## Source-Grounded Inputs

- [`.repos/semantic-web/jsonld-streaming-parser.js/README.md`](../../../.repos/semantic-web/jsonld-streaming-parser.js/README.md)
  shows a streaming JSON-LD 1.1 parser that emits RDF/JS quads, supports the
  RDF/JS Sink interface, and exposes options whose breadth must not leak
  directly into the public default contract.
- [`.repos/semantic-web/jsonld-streaming-serializer.js/README.md`](../../../.repos/semantic-web/jsonld-streaming-serializer.js/README.md)
  shows a streaming RDF/JS-to-JSON-LD serializer with explicit restrictions
  around list recovery, deduplication, and some non-streaming features.
- [`.repos/semantic-web/jsonld.js/README.md`](../../../.repos/semantic-web/jsonld.js/README.md)
  shows document-oriented JSON-LD algorithms for `compact`, `expand`,
  `flatten`, `frame`, `toRDF`, `fromRDF`, and `canonize`, plus bounded
  document-loader and safe-mode concerns.
- [`.repos/semantic-web/jsonld-context-parser.js/README.md`](../../../.repos/semantic-web/jsonld-context-parser.js/README.md)
  shows a dedicated context parser that normalizes and validates contexts,
  expands and compacts IRIs, and enforces remote-context depth limits.
- [`.repos/semantic-web/shacl-engine/README.md`](../../../.repos/semantic-web/shacl-engine/README.md)
  shows a SHACL validator over RDF/JS `DatasetCore` with baseline SHACL core
  support and optional SPARQL plugin behavior.
- [`.repos/semantic-web/rdf-canonize/README.md`](../../../.repos/semantic-web/rdf-canonize/README.md)
  shows RDF dataset canonicalization with explicit abort-signal and work-limit
  controls, which the public seam must preserve.
- [`.repos/semantic-web/rdfjs/types/data-model.d.ts`](../../../.repos/semantic-web/rdfjs/types/data-model.d.ts),
  [`.repos/semantic-web/rdfjs/types/dataset.d.ts`](../../../.repos/semantic-web/rdfjs/types/dataset.d.ts),
  and [`.repos/semantic-web/rdfjs/types/stream.d.ts`](../../../.repos/semantic-web/rdfjs/types/stream.d.ts)
  provide the local RDF/JS interoperability baseline for terms, quads,
  `DataFactory`, `DatasetCore`, and quad-stream interfaces.
- [`.repos/semantic-web/traqula/README.md`](../../../.repos/semantic-web/traqula/README.md)
  and [`.repos/semantic-web/comunica/README.md`](../../../.repos/semantic-web/comunica/README.md)
  confirm that query parser/generator/AST work and engine runtime work are both
  substantial enough to remain research-only in v1.
- [`outputs/p0-package-topology-and-boundaries.md`](./p0-package-topology-and-boundaries.md)
  and [`outputs/p1-core-schema-and-value-design.md`](./p1-core-schema-and-value-design.md)
  already lock the module map, value ownership, metadata posture, and the
  equality-versus-canonicalization rules that this phase must preserve.

## Locked Defaults Carried Forward

- `@beep/semantic-web` keeps the `foundation + adapters` posture.
- JSON-LD is first-class at the document, context, framing, and streaming
  representation layers.
- RDF/JS-aligned values remain the primary interoperability model for RDF terms,
  quads, and datasets.
- `Schema.toEquivalence(...)` remains the default equality surface for
  schema-modeled values, while RDF dataset identity still requires explicit
  canonicalization.
- `JsonPatch` and `JsonPointer` remain document-layer only.
- JSON Schema remains JSON-facing documentation and boundary tooling only and is
  not SHACL or OWL semantics.
- Generic XML encoding remains distinct from RDF/XML.
- `traqula` and `comunica` remain research-only in v1 and must not define the
  stable public adapter contract.
- The stable v1 query posture is a minimal engine-agnostic seam only.
- RDF-star and JSON-LD-star remain extension-only capabilities in v1 rather
  than baseline required behavior.

## Representation Layers

| Layer | v1 Posture | Stable Public Meaning | Hidden Pitfall |
|---|---|---|---|
| semantic domain values | first-class | identifiers, RDF values, provenance, evidence, vocabularies | treating adapter DTOs as the semantic truth instead of the domain values they carry |
| RDF/JS interop | first-class | interop boundary for terms, quads, datasets, factories, and quad streams | promoting one concrete RDF/JS library into package identity |
| JSON-LD contexts and documents | first-class | document-layer modeling plus document-to-RDF bridging seams | confusing document equality with RDF semantic identity |
| JSON-LD streaming | first-class | streaming parse and serialize seams over text or byte streams and quad streams | assuming whole-document behavior is always preserved under streaming |
| framing | first-class | document-shaping seam in the public contract | confusing framing with canonicalization or semantic normalization |
| SHACL validation | first-class | adapter-backed validation seam over RDF/JS data and shapes | assuming SHACL plugin breadth is baseline behavior |
| dataset canonicalization | first-class | canonicalization and fingerprint seam over RDF datasets | confusing fingerprints with raw graph identity or skipping work limits |
| query | extension-tier | minimal engine-agnostic seam only | importing parser or engine-specific runtime types into the stable contract |
| JSON-facing contract export | selective | docs and JSON boundary support only | treating JSON Schema as semantic constraint truth |
| RDF/XML | deferred | not part of the v1 baseline | claiming generic XML support as RDF/XML support |

## Public JSON-LD Seams

### Seam Matrix

| Seam | Stable Public Surface | v1 Status | Initial Backend Posture | Required Boundary Notes |
|---|---|---|---|---|
| `jsonld/context` | parse, validate, normalize, merge, expand, and compact context values | required | `jsonld-context-parser.js` as implementation reference | remote contexts stay policy-controlled; recursive depth limits and validation toggles must not become unbounded public defaults |
| `jsonld/document` | compact, expand, flatten, `toRDF`, `fromRDF`, and bounded document normalization | required | `jsonld.js` as implementation reference | document-layer shapes are public; document identity is not RDF semantic identity |
| `jsonld/stream-parse` | streaming `JSON-LD text or byte stream -> RDF/JS quad stream` | required | `jsonld-streaming-parser.js` as adapter target | contract must distinguish true streaming from buffered fallback and keep remote-context loading bounded |
| `jsonld/stream-serialize` | streaming `RDF/JS quad stream -> JSON-LD text stream` | required | `jsonld-streaming-serializer.js` as adapter target | contract must document restricted list recovery, no global deduplication, and other whole-document omissions |
| `jsonld/frame` | framing input, frame values, and framed document outputs | required | `jsonld.js` as implementation reference | framing is public contract behavior even if later implementation slices stage helpers incrementally |

### Context Seam

The public context seam exists to normalize and validate JSON-LD context values
without making raw upstream parser options part of the stable package identity.

The seam must support:

- inline context values
- remote context references
- array context composition
- base-IRI-aware normalization
- term expansion and IRI compaction behavior consistent with JSON-LD context semantics

The seam must not imply:

- unrestricted remote fetching
- infinite remote-context recursion
- that every upstream parser option is part of the stable public contract

### Document Seam

The public document seam exists for JSON-LD as a document representation,
including bounded transformation between document-layer values and RDF-aligned
representations.

The seam must cover:

- compacted, expanded, and flattened document workflows
- bounded `toRDF` and `fromRDF` bridging
- document-loader policy hooks
- safe-mode style failure posture for lossy or unsafe processing when a caller
  needs canonical or signable results

The seam must not claim:

- that compacted, expanded, and source documents are interchangeable semantic
  identities
- that JSON-LD document diffs are RDF semantic diffs
- that document-layer patching replaces canonical RDF comparison

### Streaming Parse Seam

The streaming parse seam is a first-class adapter target because the parser:

- emits RDF/JS quads
- already fits the RDF/JS Sink model
- can operate on streams larger than memory
- exposes a distinct streaming-profile behavior that materially changes runtime
  semantics

The stable seam must therefore state:

- whether parsing is true streaming or buffered fallback
- whether a streaming profile is assumed
- how remote contexts are loaded or disabled
- how non-streaming documents are handled when the backend must buffer

### Streaming Serialize Seam

The streaming serialize seam is a first-class adapter target because the
serializer provides an explicit `RDF/JS quad stream -> JSON-LD stream`
interoperability path.

The stable seam must therefore state:

- whether the output is compacted with a provided context or base IRI
- that some whole-document behaviors remain unavailable in streaming mode
- that RDF list recovery is not guaranteed without explicit helper use
- that duplicate suppression is not baseline streaming behavior

### Framing Seam

Framing stays in the public JSON-LD contract in v1.

This seam exists to shape document outputs for caller-facing tree structures.
It belongs in the stable contract because it is a common JSON-LD-facing
workflow, even though it is not a semantic identity or canonicalization story.

The seam must therefore preserve:

- explicit frame inputs as public values
- explicit framed outputs as document-layer results
- clear separation from canonicalization and dataset equality

## RDF/JS Interoperability Baseline

### Baseline Interfaces

The stable interop baseline for RDF-facing adapters is:

- `Term`
- `NamedNode`
- `BlankNode`
- `Literal`
- `DefaultGraph`
- `Quad`
- `DataFactory`
- `DatasetCore`
- quad-stream `Stream`
- quad-stream `Source`
- quad-stream `Sink`

The baseline is sufficient for v1 adapters because:

- `jsonld-streaming-parser.js` and `jsonld-streaming-serializer.js` both operate
  over RDF/JS quads and stream conventions
- `shacl-engine` expects RDF/JS `DatasetCore` plus a `DataFactory`
- later canonicalization and query seams need a concrete interoperability
  baseline without choosing one specific in-memory store implementation

### Baseline Rules

- `@beep/semantic-web/rdf` owns the package’s stable RDF value model, while
  RDF/JS is the baseline interoperability target rather than the canonical
  package-wide domain semantics.
- The v1 baseline must not require one concrete dataset implementation such as
  a particular store package.
- `Quad.equals(...)` or dataset structural equality are interoperability
  behaviors only and must not be treated as graph-level semantic identity.
- RDF/JS compatibility may include `DataFactory` injection points where a
  backend requires them, but `@beep/semantic-web` must not adopt one concrete
  factory as part of its public identity.
- RDF-star-capable terms or quoted triples may appear as extension-only adapter
  capability, but they are not required baseline behavior in v1.

## Adapter Posture By Concern

| Concern | Stable Public Seam | Backend Classification | v1 Posture | Key Constraints |
|---|---|---|---|---|
| JSON-LD contexts | yes | `jsonld-context-parser.js` implementation reference | required | bounded remote-context policy, normalized output, no unbounded raw option surface |
| JSON-LD documents | yes | `jsonld.js` implementation reference | required | compact / expand / flatten / bridge behavior is public; document equality is not RDF identity |
| JSON-LD framing | yes | `jsonld.js` implementation reference | required | framing is public, but not canonicalization |
| JSON-LD streaming parse | yes | `jsonld-streaming-parser.js` adapter target | required | stream profile and fallback behavior must be explicit |
| JSON-LD streaming serialize | yes | `jsonld-streaming-serializer.js` adapter target | required | list and dedupe restrictions must be explicit |
| SHACL validation | yes | `shacl-engine` adapter target | required | baseline is SHACL validation over RDF/JS datasets; SPARQL plugin behavior is optional |
| dataset canonicalization | yes | `rdf-canonize` implementation reference | required | algorithm naming, abort posture, and complexity limits must be part of the seam |
| query | yes | `traqula` and `comunica` research-only | extension-tier | minimal engine-agnostic seam only; no AST or engine runtime types in stable v1 |
| RDF/XML | no | no v1 target | deferred | generic XML encoding is not sufficient evidence of RDF/XML support |

## SHACL Posture

The public SHACL seam is adapter-backed and defined over RDF/JS-aligned shapes
and data datasets.

The baseline v1 posture is:

- SHACL validation is public
- the initial adapter target is `shacl-engine`
- SHACL core behavior is baseline
- SPARQL-based constraints and targets are extension behavior, not baseline
- SHACL JavaScript extensions and SHACL-AF stay outside the stable v1 baseline

This keeps the seam useful without baking the entire optional plugin ecosystem
into the stable package identity.

## Canonicalization Posture

The public canonicalization seam exists for graph-level comparison,
fingerprinting, signing preparation, and bounded canonical export.

The v1 posture is:

- canonicalization is a stable public seam
- `rdf-canonize` is the initial implementation reference
- algorithm naming must be explicit
- abort-signal and complexity-control posture are part of the seam, not
  incidental implementation details

The seam must explicitly distinguish:

- canonicalization results
- fingerprints derived from canonical results
- raw RDF/JS values and datasets before canonicalization

The seam must also preserve the P1 default that canonicalization is required
before graph-level hashing or signature-oriented comparisons.

## Query Posture

The stable v1 query seam is intentionally minimal and engine-agnostic.

This means P2 should lock the following:

- there is a public query seam for later service-contract work
- the stable seam is limited to engine-agnostic query request and result shapes
- parser ASTs, generated query text, algebra transforms, and engine runtime
  objects are not baseline public contract surfaces

`traqula` stays research-only because it is a parser, generator, and
transformation framework that is too query-tooling-specific to define the v1
foundation package identity.

`comunica` stays research-only because it is a large modular query framework
whose runtime shape, source model, and engine family breadth would overdefine
the v1 package boundary.

## Extension-Only Capability Policy

The following capabilities may be exposed by specific adapters, but they are not
baseline public behavior in v1:

- RDF-star and quoted triples
- JSON-LD-star parsing or serialization behavior
- SHACL SPARQL plugin behavior
- backend-specific document-loader knobs beyond the bounded public policy
- parser, AST, or engine-runtime query types

When later implementation surfaces one of these capabilities, it should be
documented as adapter-specific or extension-tier rather than being retrofitted
into the baseline seam definition.

## Representation Traps And Non-Goals

- JSON Schema may describe JSON-facing DTOs or docs, but it is not SHACL and it
  is not OWL semantics.
- Generic XML encoding via Effect schema helpers is not RDF/XML support.
- JSON-LD document patching remains document-layer only and must not be
  described as RDF semantic delta support.
- Framing shapes document trees; it does not canonicalize RDF semantics.
- RDF/JS interoperability does not make RDF/JS structural equality the package’s
  semantic identity rule.
- Canonical fingerprints are derived artifacts and must not be confused with raw
  dataset equality before canonicalization.
- Adapter-specific DTO quirks or option breadth must not become normative value
  semantics for the whole package.

## P3 Implications

P3 should treat the following as settled:

- `services/jsonld-context` is a required stable contract over bounded context
  parsing and normalization
- `services/jsonld-document` is a required stable contract over document-layer
  transformation and document/RDF bridging, with framing retained in the public
  contract
- `services/canonicalization` is a required stable contract with explicit abort
  and work-limit posture
- `services/shacl-validation` is a required stable contract over RDF/JS-aligned
  datasets, with SPARQL plugin behavior kept extension-tier
- `services/sparql-query` remains extension-tier and minimal in v1, with no
  parser or engine-specific public types

## Outcome

P2 now makes the representation boundaries explicit enough that later
service-contract work does not need to guess:

- which JSON-LD behaviors are stable public seams
- which RDF/JS interfaces define the interoperability baseline
- which runtimes are adapter targets versus implementation references versus
  research-only inputs
- where v1 intentionally stops to avoid overclaiming SHACL, query, XML, JSON
  patching, or canonicalization behavior

The phase exit gate is satisfied once later phases reuse these seam definitions
instead of inferring contract ownership from upstream libraries or placeholder
notes.
