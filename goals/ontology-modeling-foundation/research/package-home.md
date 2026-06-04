# Package Home Rationale

## Decision

Create `@beep/ontology` as a new foundation/modeling package and create
`@beep/rdf` as the shared RDF value-model package. Keep `@beep/semantic-web`
for capability-level behavior and compatibility re-exports.

## Why Not Fold Ontology Into `@beep/semantic-web`

Ontology authoring is a modeling concern in this repo: it defines schemas,
annotation payloads, validation surfaces, and pure projections. Folding that
into a capability package would blur the boundary between domain modeling and
future active semantic-web behavior such as fetching, reasoning, storage, or
remote graph integration.

## Why Use `@beep/rdf`

RDF value models are reusable outside ontology authoring. JSON-LD, IRI, URI,
RDF terms, and vocabularies are substrate concepts for ontology packages,
semantic-web capabilities, graph ingestion, and future legal ontology tooling.
`@beep/rdf` keeps those values available without forcing downstream packages to
depend on capability-level modules.

## Why Use `@beep/identity`

The ontology DSL benefits from identity composition because the same names feed
schema identifiers, annotation identifiers, IRI term derivation, and
relationship reference resolution. A thin identity wrapper removes duplicated
`schemaIdentity`, `identifier`, label, and comment plumbing while preserving the
Effect Schema annotation path.
