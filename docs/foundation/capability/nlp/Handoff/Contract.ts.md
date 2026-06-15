---
title: Contract.ts
nav_order: 32
parent: "@beep/nlp"
---

## Contract.ts overview

Handoff/Contract - the product-neutral generic graph IR handoff contract.

The versioned, documented schema that `@beep/nlp` emits for downstream
consumers (e.g. the `ip-law-knowledge-graph` initiative) to decode. It is a
generic text-annotation IR — `TextChunk`s carved from a document, the
`Mention`s/`Entity`s/`Relation`s extracted from them, each
carrying a character `Span` and PROV-O-aligned `Provenance` — with
NO product vocabulary. The generic `Entity.type`/`Relation.type`
discriminants are what a downstream mapping turns into concrete
knowledge-graph node/edge types.

Schema-first per repo law: every type is an `S.Class` with an `$NlpId`
identifier + annotation; identifiers are branded (`S.brand`) for construction
safety but encode to plain strings for serialization-clean cross-references.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeProvenance](#makeprovenance)
- [identifiers](#identifiers)
  - [ChunkId](#chunkid)
  - [ChunkId (type alias)](#chunkid-type-alias)
  - [EntityId](#entityid)
  - [EntityId (type alias)](#entityid-type-alias)
  - [MentionId](#mentionid)
  - [MentionId (type alias)](#mentionid-type-alias)
  - [RelationId](#relationid)
  - [RelationId (type alias)](#relationid-type-alias)
- [models](#models)
  - [AnnotatedDocument (class)](#annotateddocument-class)
  - [Entity (class)](#entity-class)
  - [Mention (class)](#mention-class)
  - [Provenance (class)](#provenance-class)
  - [Relation (class)](#relation-class)
  - [Span](#span)
  - [Span (type alias)](#span-type-alias)
  - [TextChunk (class)](#textchunk-class)
- [schemas](#schemas)
  - [ChunkKind](#chunkkind)
---

# constructors

## makeProvenance

Build a `Provenance` stamped with the current time (effectful: reads
`Clock` for `timestamp`).

**Example**

```ts
import { makeProvenance } from "@beep/nlp/Handoff/Contract"

console.log(makeProvenance("doc-1", "wink-nlp"))
```

**Signature**

```ts
declare const makeProvenance: { (source: string, generatedBy: string, confidence?: number): Effect.Effect<Provenance>; (generatedBy: string, confidence?: number): (source: string) => Effect.Effect<Provenance>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L394)

Since v0.0.0

# identifiers

## ChunkId

Stable identifier for a `TextChunk`.

**Example**

```ts
import { ChunkId } from "@beep/nlp/Handoff/Contract"

console.log(ChunkId.make("chunk-1"))
```

**Signature**

```ts
declare const ChunkId: AnnotatedSchema<S.brand<S.String, "ChunkId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L44)

Since v0.0.0

## ChunkId (type alias)

Runtime type of `ChunkId`.

**Signature**

```ts
type ChunkId = typeof ChunkId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L55)

Since v0.0.0

## EntityId

Stable identifier for an `Entity`.

**Example**

```ts
import { EntityId } from "@beep/nlp/Handoff/Contract"

console.log(EntityId.make("entity-1"))
```

**Signature**

```ts
declare const EntityId: AnnotatedSchema<S.brand<S.String, "EntityId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L96)

Since v0.0.0

## EntityId (type alias)

Runtime type of `EntityId`.

**Signature**

```ts
type EntityId = typeof EntityId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L107)

Since v0.0.0

## MentionId

Stable identifier for a `Mention`.

**Example**

```ts
import { MentionId } from "@beep/nlp/Handoff/Contract"

console.log(MentionId.make("mention-1"))
```

**Signature**

```ts
declare const MentionId: AnnotatedSchema<S.brand<S.String, "MentionId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L70)

Since v0.0.0

## MentionId (type alias)

Runtime type of `MentionId`.

**Signature**

```ts
type MentionId = typeof MentionId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L81)

Since v0.0.0

## RelationId

Stable identifier for a `Relation`.

**Example**

```ts
import { RelationId } from "@beep/nlp/Handoff/Contract"

console.log(RelationId.make("relation-1"))
```

**Signature**

```ts
declare const RelationId: AnnotatedSchema<S.brand<S.String, "RelationId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L122)

Since v0.0.0

## RelationId (type alias)

Runtime type of `RelationId`.

**Signature**

```ts
type RelationId = typeof RelationId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L133)

Since v0.0.0

# models

## AnnotatedDocument (class)

The top-level handoff envelope: a fully annotated document — its chunks,
entities, and relations — emitted by `@beep/nlp` for downstream consumption.
The `version` pins the contract revision.

**Example**

```ts
import { AnnotatedDocument } from "@beep/nlp/Handoff/Contract"

console.log(AnnotatedDocument)
```

**Signature**

```ts
declare class AnnotatedDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L367)

Since v0.0.0

## Entity (class)

An entity: a canonical thing referred to by one or more `Mention`s. Its
`type` is a GENERIC discriminant a downstream mapping turns into a concrete
knowledge-graph node type.

**Example**

```ts
import { Entity } from "@beep/nlp/Handoff/Contract"

console.log(Entity)
```

**Signature**

```ts
declare class Entity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L307)

Since v0.0.0

## Mention (class)

A surface mention occurrence: where a span of text within a chunk refers to
something nameable.

**Example**

```ts
import { Mention } from "@beep/nlp/Handoff/Contract"

console.log(Mention)
```

**Signature**

```ts
declare class Mention
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L279)

Since v0.0.0

## Provenance (class)

PROV-O-aligned provenance for a piece of derived annotation: where it came
from (`source`), what produced it (`generatedBy` ~ `prov:wasGeneratedBy`),
when (`timestamp` ~ `prov:generatedAtTime`, epoch ms), and an optional
producer confidence in `[0, 1]`.

**Example**

```ts
import { Provenance } from "@beep/nlp/Handoff/Contract"

console.log(Provenance.make({ source: "doc-1", generatedBy: "wink-nlp", timestamp: 0 }))
```

**Signature**

```ts
declare class Provenance
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L225)

Since v0.0.0

## Relation (class)

A directed relation between two `Entity`s. Its `type` is a GENERIC
predicate a downstream mapping turns into a concrete knowledge-graph edge type.

**Example**

```ts
import { Relation } from "@beep/nlp/Handoff/Contract"

console.log(Relation)
```

**Signature**

```ts
declare class Relation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L336)

Since v0.0.0

## Span

A half-open character span `[start, end)` into the source text.

**Example**

```ts
import { NonNegativeInt } from "@beep/schema"
import { Span } from "@beep/nlp/Handoff/Contract"

console.log(Span.make({ start: NonNegativeInt.make(0), end: NonNegativeInt.make(5) }))
```

**Signature**

```ts
declare const Span: AnnotatedSchema<S.decodeTo<S.declareConstructor<SpanFields, { readonly end: number; readonly start: number; }, readonly [S.Struct<{ readonly end: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly start: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; }>], { readonly end: number & Brand<"Int"> & Brand<"NonNegativeInt">; readonly start: number & Brand<"Int"> & Brand<"NonNegativeInt">; }>, S.Struct<{ readonly end: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; readonly start: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>; }>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L176)

Since v0.0.0

## Span (type alias)

Runtime type of `Span`.

**Signature**

```ts
type Span = typeof Span.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L207)

Since v0.0.0

## TextChunk (class)

A contiguous chunk of source text at a given granularity, with its span and
provenance. The atomic unit of the handoff IR.

**Example**

```ts
import { TextChunk } from "@beep/nlp/Handoff/Contract"

console.log(TextChunk)
```

**Signature**

```ts
declare class TextChunk
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L252)

Since v0.0.0

# schemas

## ChunkKind

Closed vocabulary of `TextChunk` granularities.

**Example**

```ts
import { ChunkKind } from "@beep/nlp/Handoff/Contract"

console.log(ChunkKind.is.sentence("sentence")) // true
```

**Signature**

```ts
declare const ChunkKind: LiteralKit<readonly ["document", "paragraph", "sentence", "token"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Handoff/Contract.ts#L148)

Since v0.0.0