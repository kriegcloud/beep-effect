# @beep/semantic-web — Effect v4 Module Selection

## Purpose

Capture which local Effect v4 modules are the best fit for the planned `@beep/semantic-web` package and which ones should be treated as optional tools or avoided as primary design surfaces.

This note is intentionally decision-oriented. It is not a full survey of Effect v4.

## Recommended Classification

| Module | Classification | Use In `@beep/semantic-web` | Key Evidence |
|---|---|---|---|
| `Schema.toArbitrary` | `CORE_V1` | property-based verification for IRI, term, quad, dataset, and adapter boundaries | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8386), [`toArbitrary.test.ts`](../../../.repos/effect-v4/packages/effect/test/schema/toArbitrary.test.ts) |
| `Schema.toFormatter` | `OPTIONAL_V1` | schema-derived debug output and diagnostics | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8413) |
| `Schema.toEquivalence` | `CORE_V1` | default equality surface for schema-modeled semantic-web values | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8570), [`toEquivalence.test.ts`](../../../.repos/effect-v4/packages/effect/test/schema/toEquivalence.test.ts) |
| `Schema.toRepresentation` | `INTERNAL_ONLY` | schema introspection and tooling only | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8582) |
| `Schema.toJsonSchemaDocument` | `OPTIONAL_V1` | generated JSON-facing docs and contract export | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8619), [`toJsonSchemaDocument.test.ts`](../../../.repos/effect-v4/packages/effect/test/schema/toJsonSchemaDocument.test.ts) |
| `Schema.toCodecJson` | `OPTIONAL_V1` | JSON boundary codecs for DTO-like or JSON-LD-adjacent values that really are JSON | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8637) |
| `Schema.toCodecIso` | `INTERNAL_ONLY` | domain-to-representation bridging where an actual isomorphism exists | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8645) |
| `Schema.toCodecStringTree` | `SKIP_FOR_NOW` | not a strong semantic-web fit; more generic serialization tooling | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8673) |
| `Schema.toEncoderXml` | `SKIP_FOR_NOW` | generic XML encoder, not RDF/XML | [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8706) |
| `Equivalence` | `CORE_V1` | explicit normalized equality for domain values | [`Equivalence.ts`](../../../.repos/effect-v4/packages/effect/src/Equivalence.ts#L190) |
| `JsonSchema` | `OPTIONAL_V1` | external docs and JSON/OpenAPI bridge surfaces | [`JsonSchema.ts`](../../../.repos/effect-v4/packages/effect/src/JsonSchema.ts#L248), [`JsonSchema.ts`](../../../.repos/effect-v4/packages/effect/src/JsonSchema.ts#L641) |
| `Hash` | `INTERNAL_ONLY` | hashing immutable canonical values and fingerprints after normalization or canonicalization | [`Hash.ts`](../../../.repos/effect-v4/packages/effect/src/Hash.ts#L85) |
| `Equal` | `INTERNAL_ONLY` | custom class integration and hash-based collections | [`Equal.ts`](../../../.repos/effect-v4/packages/effect/src/Equal.ts#L236) |
| `Graph` | `INTERNAL_ONLY` | algorithmic projections, not primary RDF model | [`Graph.ts`](../../../.repos/effect-v4/packages/effect/src/Graph.ts#L247), [`Graph.ts`](../../../.repos/effect-v4/packages/effect/src/Graph.ts#L2737), [`Graph.ts`](../../../.repos/effect-v4/packages/effect/src/Graph.ts#L3877) |
| `JsonPatch` and `JsonPointer` | `SELECTIVE_INTERNAL` | JSON-LD document editing or versioning only | [`JsonPatch.ts`](../../../.repos/effect-v4/packages/effect/src/JsonPatch.ts#L227), [`JsonPatch.ts`](../../../.repos/effect-v4/packages/effect/src/JsonPatch.ts#L334), [`JsonPointer.ts`](../../../.repos/effect-v4/packages/effect/src/JsonPointer.ts#L90) |
| `Encoding` | `SELECTIVE_INTERNAL` | digest and binary-text boundary helpers | [`Encoding.ts`](../../../.repos/effect-v4/packages/effect/src/Encoding.ts) |
| `Formatter` and `Inspectable` | `SELECTIVE_INTERNAL` | developer ergonomics, logs, debugging, REPL output | [`Formatter.ts`](../../../.repos/effect-v4/packages/effect/src/Formatter.ts), [`Inspectable.ts`](../../../.repos/effect-v4/packages/effect/src/Inspectable.ts) |
| `Reducer` and `Combiner` | `SELECTIVE_INTERNAL` | merge strategies for contexts, prefix maps, reports, or accumulations | [`Reducer.ts`](../../../.repos/effect-v4/packages/effect/src/Reducer.ts#L109), [`Combiner.ts`](../../../.repos/effect-v4/packages/effect/src/Combiner.ts#L94) |
| `Differ` | `SKIP_FOR_NOW` | only relevant if the package defines a domain patch algebra later | [`Differ.ts`](../../../.repos/effect-v4/packages/effect/src/Differ.ts#L9) |

## Best Of The Best

If the package wants the strongest default choices from the beginning, the high-confidence picks are:

1. `Schema.toEquivalence(...)` as the default equality surface for schema-modeled domain values
2. `Schema.toArbitrary(...)` for property-based verification of IRI, term, quad, and adapter boundaries
3. `Equivalence` for explicit non-structural comparison rules after normalization
4. selective `Schema.toJsonSchemaDocument(...)` plus `JsonSchema` for external JSON contract generation
5. `Hash` only after canonicalization, never as a substitute for semantic graph identity

## Module Notes

### `Schema` advanced helpers

These are the strongest fit for the package.

- `toArbitrary` should be part of the verification story from the start
- `toEquivalence` should be preferred over ad-hoc equality for schema-modeled values
- `toFormatter` is valuable for diagnostics and readable tooling output
- `toJsonSchemaDocument` is useful when the package needs JSON/OpenAPI-facing documentation or machine-readable contracts
- `toCodecJson` is a good JSON-boundary helper when the semantic value genuinely has a JSON representation
- `toCodecIso` is useful, but should stay secondary until the public module topology is clearer

Important non-fit:

- `toCodecStringTree` at [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8673) is not a strong semantic-web default
- `toEncoderXml` at [`Schema.ts`](../../../.repos/effect-v4/packages/effect/src/Schema.ts#L8706) is a generic XML encoder, not an RDF/XML serializer

### `Equivalence`

This is a better semantic default than raw structural equality for the package.

Examples of likely uses:

- normalized IRI comparison
- RDF term comparison after canonical normalization rules
- prefix-map or context comparison where order or formatting differences should not matter

### `JsonSchema`

This is useful, but only for the JSON-facing side of the package.

Good uses:

- generated JSON docs for JSON-LD-friendly DTOs
- OpenAPI-facing request and response shapes
- external schema publication for non-RDF callers

Trap:

- JSON Schema does not replace SHACL, OWL, or RDF graph constraints
- `resolve$ref` in this module only resolves against top-level definitions and is not a general semantic reference system

### `Hash` and `Equal`

These are useful only with discipline.

Important local behavior:

- `Equal` extends `Hash` at [`Equal.ts`](../../../.repos/effect-v4/packages/effect/src/Equal.ts#L167)
- `Equal.equals(...)` uses hash-first comparison at [`Equal.ts`](../../../.repos/effect-v4/packages/effect/src/Equal.ts#L236)
- `Hash.hash(...)` caches object hashes and assumes immutability at [`Hash.ts`](../../../.repos/effect-v4/packages/effect/src/Hash.ts#L85)

Implication for semantic-web work:

- do not use raw structural `Equal` or `Hash` as RDF semantic identity
- prefer `Schema.toEquivalence(...)` for value-level equality
- use `Hash` only on immutable canonicalized values, or on explicit fingerprint results such as canonical RDF dataset serializations

### `Graph`

`Graph` is interesting, but should not be the canonical RDF graph model.

Good uses:

- ontology dependency DAGs
- bounded reasoning worklists
- traversal and path analysis over derived projections
- visualization via Mermaid or GraphViz from derived semantic projections

Traps:

- graph equality and hashing include internal node and edge indices at [`Graph.ts`](../../../.repos/effect-v4/packages/effect/src/Graph.ts#L138) and [`Graph.ts`](../../../.repos/effect-v4/packages/effect/src/Graph.ts#L171)
- that means indexed graph identity is not the same as RDF graph isomorphism
- mutable graphs exist, which makes cached `Equal` and `Hash` semantics especially risky if values are compared or hashed before mutation is complete

Conclusion:

- use `Graph` only as an internal algorithmic projection layer
- do not build the primary RDF dataset abstraction on top of it

### `JsonPatch` and `JsonPointer`

These are useful only if the package operates on JSON-LD documents as documents.

Good uses:

- editing JSON-LD source documents
- generating UI-friendly document diffs
- versioning JSON-LD forms or source blobs

Traps:

- `JsonPatch.get(...)` computes structural JSON diffs, not RDF semantic diffs
- `JsonPatch.apply(...)` throws on invalid paths, so it needs an Effect boundary wrapper if used in library code

Conclusion:

- use them at the JSON-LD document layer only
- do not use them as the semantic diff story for RDF terms, quads, or datasets

### `Reducer` and `Combiner`

These are useful as internal algebraic building blocks.

Likely good fits:

- merge strategies for prefix maps
- JSON-LD context accumulation
- provenance aggregation
- report or validation result accumulation

They are helpful, but they should not define the public package identity.

### `Differ`

`Differ` is only an interface in this file and is not enough on its own to justify first-class design attention right now.

Only revisit it if the package later introduces:

- ontology evolution patches
- context migration patches
- graph-shape or schema-shape patch types

## Corroborating Local Tests

The confidence level here is strengthened by nearby local tests covering the most relevant behavior:

- [`toEquivalence.test.ts`](../../../.repos/effect-v4/packages/effect/test/schema/toEquivalence.test.ts) confirms `Schema.toEquivalence(...)` is heavily exercised across schema shapes
- [`toArbitrary.test.ts`](../../../.repos/effect-v4/packages/effect/test/schema/toArbitrary.test.ts) confirms `Schema.toArbitrary(...)` is part of the intended schema toolchain
- [`toJsonSchemaDocument.test.ts`](../../../.repos/effect-v4/packages/effect/test/schema/toJsonSchemaDocument.test.ts) confirms `Schema.toJsonSchemaDocument(...)` is a real supported path, not just an export stub
- [`JsonSchema.test.ts`](../../../.repos/effect-v4/packages/effect/test/JsonSchema.test.ts) shows broad dialect-conversion coverage
- [`JsonPatch.test.ts`](../../../.repos/effect-v4/packages/effect/test/JsonPatch.test.ts) confirms structural diff behavior and exception-throwing invalid-path behavior
- [`Graph.test.ts`](../../../.repos/effect-v4/packages/effect/test/Graph.test.ts) and [`Pathfinding.test.ts`](../../../.repos/effect-v4/packages/effect/test/Pathfinding.test.ts) confirm `Graph` is a substantial algorithmic utility, not a semantic-web-specific graph model
- [`Equal.test.ts`](../../../.repos/effect-v4/packages/effect/test/Equal.test.ts) and [`Equivalence.test.ts`](../../../.repos/effect-v4/packages/effect/test/Equivalence.test.ts) reinforce the distinction between structural protocol equality and explicit equivalence relations

## Default Policy

If no stronger local evidence exists later, use these defaults:

1. equality for domain values comes from `Schema.toEquivalence(...)` or explicit `Equivalence`
2. graph or dataset identity never comes from raw `Graph`, `Equal`, or `Hash`
3. graph-level identity requires canonicalization before hashing
4. `JsonSchema` is allowed for JSON-facing boundaries, but never as a substitute for SHACL or ontology semantics
5. `Graph` is allowed only for derived internal projections
6. `JsonPatch` is allowed only for JSON-LD document editing, not RDF semantic deltas
7. generic XML encoding is not RDF/XML
