---
title: Kind.ts
nav_order: 38
parent: "@beep/nlp"
---

## Kind.ts overview

Ontology/Kind - Type-level ontology for text-processing categories.

Makes the categorical structure explicit:
- `TextKind`: the objects in the category of discourse
- `TypedText`: payloads tagged with their ontological kind
- Smart constructors: safe ways to create typed text
- Kind relations: the partial-order ("contains") structure

The kinds form a poset under containment
(`Document > Paragraph > Sentence > Token > Character`) with orthogonal
annotation kinds (POS, Lemma, Entity, Relation, Dependency, Chunk, Embedding).
Free operations increase granularity (move down the poset); forgetful
operations decrease it (move up).

Effect v4 `@beep/nlp` implementation.
`Schema.Union(Schema.Literal(...))` is replaced by `@beep/schema`'s
`LiteralKit` per repo convention.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Character](#character)
  - [Chunk](#chunk)
  - [Dependency](#dependency)
  - [Document](#document)
  - [Embedding](#embedding)
  - [Entity](#entity)
  - [Lemma](#lemma)
  - [POS](#pos)
  - [Paragraph](#paragraph)
  - [Relation](#relation)
  - [Sentence](#sentence)
  - [Token](#token)
- [getters](#getters)
  - [content](#content)
  - [getValidChildren](#getvalidchildren)
  - [kindOf](#kindof)
- [mapping](#mapping)
  - [mapContent](#mapcontent)
  - [recast](#recast)
  - [withMetadata](#withmetadata)
- [models](#models)
  - [KindContainment (class)](#kindcontainment-class)
  - [TextKind](#textkind)
  - [TextKind (type alias)](#textkind-type-alias)
  - [TypedText (interface)](#typedtext-interface)
- [predicates](#predicates)
  - [canContain](#cancontain)
  - [isKind](#iskind)
- [schemas](#schemas)
  - [TextKindSchema](#textkindschema)
  - [TypedTextSchema](#typedtextschema)
---

# constructors

## Character

Create character-level typed text for the atomic textual stratum.

**Example**

```ts
import { Character } from "@beep/nlp/Ontology/Kind"

console.log(Character("a").kind) // "Character"
```

**Signature**

```ts
declare const Character: (content: string, metadata?: Record<string, unknown>) => TypedText<"Character">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L247)

Since v0.0.0

## Chunk

Create chunk-level typed text for shallow-parsing constituents.

**Example**

```ts
import { Chunk } from "@beep/nlp/Ontology/Kind"

console.log(Chunk("the dog").kind) // "Chunk"
```

**Signature**

```ts
declare const Chunk: (content: string, metadata?: Record<string, unknown>) => TypedText<"Chunk">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L326)

Since v0.0.0

## Dependency

Create dependency-level typed text for syntactic dependency arcs.

**Example**

```ts
import { Dependency } from "@beep/nlp/Ontology/Kind"

console.log(Dependency("nsubj", { head: "runs" }).kind) // "Dependency"
```

**Signature**

```ts
declare const Dependency: (content: string, metadata?: Record<string, unknown>) => TypedText<"Dependency">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L310)

Since v0.0.0

## Document

Create document-level typed text at the top of the structural hierarchy.

**Example**

```ts
import { Document } from "@beep/nlp/Ontology/Kind"

console.log(Document("This is a document.").kind) // "Document"
```

**Signature**

```ts
declare const Document: (content: string, metadata?: Record<string, unknown>) => TypedText<"Document">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L184)

Since v0.0.0

## Embedding

Create embedding-level typed text for vector-space metadata about content.

**Example**

```ts
import { Embedding } from "@beep/nlp/Ontology/Kind"

console.log(Embedding("apple", { model: "word2vec" }).kind) // "Embedding"
```

**Signature**

```ts
declare const Embedding: (content: string, metadata?: Record<string, unknown>) => TypedText<"Embedding">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L294)

Since v0.0.0

## Entity

Create entity-level typed text for a semantic mention extracted from prose.

**Example**

```ts
import { Entity } from "@beep/nlp/Ontology/Kind"

console.log(Entity("Apple Inc.", { type: "ORG" }).kind) // "Entity"
```

**Signature**

```ts
declare const Entity: (content: string, metadata?: Record<string, unknown>) => TypedText<"Entity">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L263)

Since v0.0.0

## Lemma

Create lemma-level typed text for canonical token forms.

**Example**

```ts
import { Lemma } from "@beep/nlp/Ontology/Kind"

console.log(Lemma("run", { original: "running" }).kind) // "Lemma"
```

**Signature**

```ts
declare const Lemma: (content: string, metadata?: Record<string, unknown>) => TypedText<"Lemma">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L356)

Since v0.0.0

## POS

Create POS-level typed text for part-of-speech annotations.

**Example**

```ts
import { POS } from "@beep/nlp/Ontology/Kind"

console.log(POS("dog", { tag: "NN" }).kind) // "POS"
```

**Signature**

```ts
declare const POS: (content: string, metadata?: Record<string, unknown>) => TypedText<"POS">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L341)

Since v0.0.0

## Paragraph

Create paragraph-level typed text for a logical block in a document.

**Example**

```ts
import { Paragraph } from "@beep/nlp/Ontology/Kind"

console.log(Paragraph("A paragraph.").kind) // "Paragraph"
```

**Signature**

```ts
declare const Paragraph: (content: string, metadata?: Record<string, unknown>) => TypedText<"Paragraph">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L200)

Since v0.0.0

## Relation

Create relation-level typed text for a semantic edge between entities.

**Example**

```ts
import { Relation } from "@beep/nlp/Ontology/Kind"

console.log(Relation("founded", { type: "FOUNDER_OF" }).kind) // "Relation"
```

**Signature**

```ts
declare const Relation: (content: string, metadata?: Record<string, unknown>) => TypedText<"Relation">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L278)

Since v0.0.0

## Sentence

Create sentence-level typed text for a complete utterance or statement.

**Example**

```ts
import { Sentence } from "@beep/nlp/Ontology/Kind"

console.log(Sentence("A sentence.").kind) // "Sentence"
```

**Signature**

```ts
declare const Sentence: (content: string, metadata?: Record<string, unknown>) => TypedText<"Sentence">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L216)

Since v0.0.0

## Token

Create token-level typed text for one word, symbol, or punctuation mark.

**Example**

```ts
import { Token } from "@beep/nlp/Ontology/Kind"

console.log(Token("word").kind) // "Token"
```

**Signature**

```ts
declare const Token: (content: string, metadata?: Record<string, unknown>) => TypedText<"Token">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L232)

Since v0.0.0

# getters

## content

Extract raw content from typed text.

**Example**

```ts
import { Document, content } from "@beep/nlp/Ontology/Kind"

console.log(content(Document("hello"))) // "hello"
```

**Signature**

```ts
declare const content: <K extends TextKind>(text: TypedText<K>) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L478)

Since v0.0.0

## getValidChildren

Get all valid child kinds for a given parent kind.

**Example**

```ts
import { getValidChildren } from "@beep/nlp/Ontology/Kind"

console.log(getValidChildren("Token")) // ["Character", "POS", "Lemma"]
```

**Signature**

```ts
declare const getValidChildren: (kind: TextKind) => ReadonlyArray<TextKind>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L459)

Since v0.0.0

## kindOf

Get the kind of a typed text.

**Example**

```ts
import { Token, kindOf } from "@beep/nlp/Ontology/Kind"

console.log(kindOf(Token("word"))) // "Token"
```

**Signature**

```ts
declare const kindOf: <K extends TextKind>(text: TypedText<K>) => K
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L493)

Since v0.0.0

# mapping

## mapContent

Map over the content of typed text, preserving its kind.

**Example**

```ts
import { Token, mapContent } from "@beep/nlp/Ontology/Kind"

console.log(mapContent(Token("dog"), (s) => s.toUpperCase()).content) // "DOG"
```

**Signature**

```ts
declare const mapContent: { <K extends TextKind>(text: TypedText<K>, f: (content: string) => string): TypedText<K>; <K extends TextKind>(f: (content: string) => string): (text: TypedText<K>) => TypedText<K>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L508)

Since v0.0.0

## recast

Re-tag typed text to a new kind (use only when the transition is valid).

**Example**

```ts
import { Token, recast } from "@beep/nlp/Ontology/Kind"

console.log(recast(Token("word"), "Lemma").kind) // "Lemma"
```

**Signature**

```ts
declare const recast: { <K extends TextKind>(text: TypedText<TextKind>, newKind: K): TypedText<K>; <K extends TextKind>(newKind: K): (text: TypedText<TextKind>) => TypedText<K>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L574)

Since v0.0.0

## withMetadata

Merge additional metadata into typed text.

**Example**

```ts
import { Entity, withMetadata } from "@beep/nlp/Ontology/Kind"

console.log(withMetadata(Entity("Acme"), { type: "ORG" }).metadata) // { type: "ORG" }
```

**Signature**

```ts
declare const withMetadata: { <K extends TextKind>(text: TypedText<K>, metadata: Record<string, unknown>): TypedText<K>; (metadata: Record<string, unknown>): <K extends TextKind>(text: TypedText<K>) => TypedText<K>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L532)

Since v0.0.0

# models

## KindContainment (class)

Structural containment hierarchy for valid parent-child kind relationships.

**Example**

```ts
import { KindContainment } from "@beep/nlp/Ontology/Kind"

console.log(KindContainment.containment.Sentence.includes("Token")) // true
```

**Signature**

```ts
declare class KindContainment
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L380)

Since v0.0.0

## TextKind

Textual strata in the NLP category (the object layer).

Forms a poset under containment plus orthogonal annotation kinds.

**Example**

```ts
import { TextKind } from "@beep/nlp/Ontology/Kind"

console.log(TextKind.is.Document("Document")) // true
```

**Signature**

```ts
declare const TextKind: LiteralKit<readonly ["Document", "Paragraph", "Sentence", "Token", "Character", "POS", "Lemma", "Entity", "Relation", "Dependency", "Chunk", "Embedding"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L50)

Since v0.0.0

## TextKind (type alias)

Runtime type for `TextKind`.

**Example**

```ts
import type { TextKind } from "@beep/nlp/Ontology/Kind"

const kind: TextKind = "Sentence"
console.log(kind)
```

**Signature**

```ts
type TextKind = typeof TextKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L85)

Since v0.0.0

## TypedText (interface)

Text content tagged with its ontological kind.

Pairs raw content with its position in the categorical hierarchy, enabling
type-level enforcement of valid operations.

**Example**

```ts
import type { TypedText } from "@beep/nlp/Ontology/Kind"

const doc: TypedText<"Document"> = { kind: "Document", content: "hello" }
console.log(doc.kind)
```

**Signature**

```ts
export interface TypedText<K extends TextKind> {
  readonly content: string;
  readonly kind: K;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L129)

Since v0.0.0

# predicates

## canContain

Check whether `parent` can contain `child` per the containment poset.

**Example**

```ts
import { canContain } from "@beep/nlp/Ontology/Kind"

console.log(canContain("Document", "Sentence")) // true
console.log(canContain("Token", "Document")) // false
```

**Signature**

```ts
declare const canContain: { (parent: TextKind, child: TextKind): boolean; (child: TextKind): (parent: TextKind) => boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L441)

Since v0.0.0

## isKind

Type guard: whether a value is a `TypedText` of a specific kind.

**Example**

```ts
import { Token, isKind } from "@beep/nlp/Ontology/Kind"

console.log(isKind("Token")(Token("word"))) // true
```

**Signature**

```ts
declare const isKind: <K extends TextKind>(kind: K) => (value: TypedText<TextKind>) => value is TypedText<K>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L556)

Since v0.0.0

# schemas

## TextKindSchema

Runtime schema for validating values at the ontology kind boundary.

**Example**

```ts
import { TextKindSchema } from "@beep/nlp/Ontology/Kind"

const kind = TextKindSchema.make("Sentence")
console.log(kind) // "Sentence"
```

**Signature**

```ts
declare const TextKindSchema: S.Schema<"Token" | "Sentence" | "Document" | "Paragraph" | "Character" | "POS" | "Lemma" | "Entity" | "Relation" | "Dependency" | "Chunk" | "Embedding">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L101)

Since v0.0.0

## TypedTextSchema

Build a schema for text payloads constrained to one ontology kind schema.

**Example**

```ts
import * as S from "effect/Schema"
import { TypedTextSchema } from "@beep/nlp/Ontology/Kind"

const schema = TypedTextSchema(S.Literal("Token"))
const token = schema.make({ kind: "Token", content: "Effect" })
console.log(token.kind) // "Token"
```

**Signature**

```ts
declare const TypedTextSchema: <K extends TextKind>(kind: S.Schema<K>) => AnnotatedSchema<S.Struct<{ readonly kind: S.Schema<K>; readonly content: S.String; readonly metadata: S.optionalKey<S.$Record<S.String, S.Unknown>>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Ontology/Kind.ts#L151)

Since v0.0.0