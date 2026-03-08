# @beep/semantic-web — Initial Exploration

## Status

Working research snapshot capturing what has already been explored, what was cloned locally, and what still needs resolution before formal planning.

## Confirmed Decisions So Far

- `@beep/semantic-web` should become the canonical owner of semantic-web foundation modules in this repo.
- JSON-LD should be first-class in the initial package surface.
- The package should emphasize `foundation + adapters`.
- `IRI` and `ProvO` should be treated as inputs to the package design, not as the whole design.
- Ontology builder or combinator DSL work should stay experimental unless later exploration justifies promoting it.
- `SPARQL.js` should not be used as the main query parser reference; `traqula` is the preferred modern reference direction.

## Local Evidence Reviewed

### Current repo assets

- [`packages/common/schema/src/internal/IRI/IRI.ts`](../../../packages/common/schema/src/internal/IRI/IRI.ts)
  - strong RFC 3987 syntax and boundary validation
- [`packages/common/schema/src/internal/ProvO/ProvO.ts`](../../../packages/common/schema/src/internal/ProvO/ProvO.ts)
  - schema-first PROV-O modeling with richer literal and inline-object handling
- [`packages/common/semantic-web/README.md`](../../../packages/common/semantic-web/README.md)
  - current package stub exists but is not a meaningful design source yet
- [`packages/common/semantic-web/src/index.ts`](../../../packages/common/semantic-web/src/index.ts)
  - effectively only exports `VERSION`

### Older semantic-web prior art

- [`.repos/beep-effect/packages/common/semantic-web/README.md`](../../../.repos/beep-effect/packages/common/semantic-web/README.md)
  - confirms older work already treated IDNA and URI / IRI as Effect-first semantic-web concerns
- [`.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`](../../../.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts)
  - richer parse / normalize / resolve / serialize surface than the current proof `IRI` module

### Effect v4 source-of-truth evidence

- [`.repos/effect-v4/packages/effect/src/Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts)
  - confirms `Schema.toArbitrary(...)`
  - confirms `Schema.toFormatter(...)`
  - confirms `Schema.toEquivalence(...)`
  - does not yet confirm an obvious schema-derived hash helper

## Imported Semantic-Web Reference Subtrees

The following repositories were added under `/.repos/semantic-web` using `git subtree add --squash`.

| Local Path | Upstream Repo | Branch | Imported Upstream Commit | Why It Matters |
|---|---|---|---|---|
| `.repos/semantic-web/GraphQL-LD.js` | `rubensworks/GraphQL-LD.js` | `master` | `b858ba73b9` | exploratory query surface for JSON-LD-linked data workflows |
| `.repos/semantic-web/shex.js` | `shexjs/shex.js` | `main` | `b617c36849` | shape-language comparison point so SHACL is not the only validation lens |
| `.repos/semantic-web/clownface` | `zazuko/clownface` | `master` | `70e6375aef` | graph traversal / node navigation programming model reference |
| `.repos/semantic-web/rdfine` | `tpluscode/rdfine` | `master` | `28c7080fcd` | object-mapping and ontology-wrapper reference material |
| `.repos/semantic-web/rdf-validate-shacl` | `zazuko/rdf-validate-shacl` | `master` | `b92aa88811` | secondary SHACL validation reference |
| `.repos/semantic-web/traqula` | `comunica/traqula` | `main` | `100f8110af` | modular SPARQL parser / generator / transformer reference |
| `.repos/semantic-web/shacl-engine` | `rdf-ext/shacl-engine` | `master` | `b829b8ecb5` | primary SHACL engine candidate reference |
| `.repos/semantic-web/comunica` | `comunica/comunica` | `master` | `bd36eea894` | primary SPARQL and query-runtime reference |
| `.repos/semantic-web/rdf-canonize` | `digitalbazaar/rdf-canonize` | `main` | `8758a250e1` | RDF dataset canonicalization and semantic fingerprinting reference |
| `.repos/semantic-web/jsonld.js` | `digitalbazaar/jsonld.js` | `main` | `7a93609e47` | JSON-LD algorithms, framing, compaction, expansion, and normalization reference |
| `.repos/semantic-web/jsonld-context-parser.js` | `rubensworks/jsonld-context-parser.js` | `master` | `fcd2cc03c2` | JSON-LD context parsing and resolution reference |
| `.repos/semantic-web/jsonld-streaming-serializer.js` | `rubensworks/jsonld-streaming-serializer.js` | `master` | `0b4253e538` | JSON-LD streaming serializer reference |
| `.repos/semantic-web/jsonld-streaming-parser.js` | `rubensworks/jsonld-streaming-parser.js` | `master` | `4f22c20a99` | JSON-LD streaming parser reference |

## Working Shape Hypothesis

The current best-fit package topology looks like this.

### Core values

- `iri/`
- `uri/`
- `rdf/` for terms, quads, datasets, prefixes, namespaces
- `prov/`
- vocabulary modules such as `rdf`, `rdfs`, `owl`, `prov`

### Adapters

- RDF/JS interop
- N3 and RDF serialization formats
- JSON-LD document and context adapters
- RDF/XML ingestion

### Service contracts

- provenance services
- reasoning services
- SHACL validation services
- SPARQL services

### Experimental

- ontology builders
- ontology-driven schema combinators

## Tensions That Still Need Design Work

### IRI versus URI ownership

The current proof `IRI` module and the older `uri` module should probably both inform the final design, but they should not be merged mechanically.

The open question is whether the public surface should include:

- a strict `IRI` boundary schema
- a richer `URI` or `IRI` component model
- branded canonical strings
- parse / resolve / normalize helpers

### Package boundary with `@beep/schema`

Open questions:

- should `IRI` and `ProvO` move entirely into `@beep/semantic-web`
- should `@beep/schema` re-export semantic-web primitives
- what stays generic enough to live outside the semantic-web package

### Hashing and semantic equivalence

Local Effect v4 evidence currently supports schema-derived equivalence and formatter generation, but not obviously hashing.

The likely design implication is:

- use `Schema.toEquivalence(...)` where semantic equality follows schema structure
- define explicit hash or canonicalization helpers where semantic-web identity needs stronger guarantees
- evaluate `rdf-canonize` as part of the strategy for dataset-level fingerprints

### JSON-LD scope

JSON-LD being first-class likely means v1 needs more than quad conversion.

Open questions:

- which JSON-LD document operations should be public in v1
- whether context parsing is exposed directly or hidden behind service boundaries
- whether framing is in scope for the first implementation pass

## Optional Future Subtree Candidates

These were discussed as potentially useful later, but were not added in this pass:

- `rubensworks/rdfa-streaming-parser.js`
- `rubensworks/microdata-rdf-streaming-parser.js`

They would be useful if HTML-embedded semantic data becomes part of the initial ingestion story.

## Recommended Next Artifact

The next useful artifact is a design note that decides:

1. the initial public module map
2. the package boundary with `@beep/schema`
3. whether `IRI` and `URI` remain separate public concepts
4. the minimum JSON-LD surface for v1
5. which libraries are adapter targets versus research-only references
