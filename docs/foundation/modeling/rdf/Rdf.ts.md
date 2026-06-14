---
title: Rdf.ts
nav_order: 4
parent: "@beep/rdf"
---

## Rdf.ts overview

RDF/JS-aligned value families for `@beep/rdf`.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [BlankNode (class)](#blanknode-class)
  - [Curie](#curie)
  - [Curie (type alias)](#curie-type-alias)
  - [Dataset (class)](#dataset-class)
  - [DefaultGraph (class)](#defaultgraph-class)
  - [GraphTerm](#graphterm)
  - [GraphTerm (type alias)](#graphterm-type-alias)
  - [LanguageTag](#languagetag)
  - [LanguageTag (type alias)](#languagetag-type-alias)
  - [Literal (class)](#literal-class)
  - [NamedNode (class)](#namednode-class)
  - [NamespaceBinding (class)](#namespacebinding-class)
  - [ObjectTerm](#objectterm)
  - [ObjectTerm (type alias)](#objectterm-type-alias)
  - [PrefixLabel](#prefixlabel)
  - [PrefixLabel (type alias)](#prefixlabel-type-alias)
  - [PrefixMap](#prefixmap)
  - [PrefixMap (type alias)](#prefixmap-type-alias)
  - [Quad (class)](#quad-class)
  - [Subject](#subject)
  - [Subject (type alias)](#subject-type-alias)
  - [Term](#term)
  - [Term (type alias)](#term-type-alias)
- [utilities](#utilities)
  - [MakeLiteralOptions (class)](#makeliteraloptions-class)
  - [MakeQuadOptions (class)](#makequadoptions-class)
  - [areDatasetsEquivalent](#aredatasetsequivalent)
  - [makeBlankNode](#makeblanknode)
  - [makeDataset](#makedataset)
  - [makeLiteral](#makeliteral)
  - [makeNamedNode](#makenamednode)
  - [makeQuad](#makequad)
  - [serializeQuad](#serializequad)
  - [serializeTerm](#serializeterm)
  - [sortDatasetQuads](#sortdatasetquads)
---

# models

## BlankNode (class)

RDF blank node value.

**Example**

```ts
import { BlankNode } from "@beep/rdf/Rdf"

console.log(BlankNode)
```

**Signature**

```ts
declare class BlankNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L376)

Since v0.0.0

## Curie

CURIE-style compact IRI expression.

**Example**

```ts
import { Curie } from "@beep/rdf/Rdf"

console.log(Curie)
```

**Signature**

```ts
declare const Curie: AnnotatedSchema<S.brand<S.String, "Curie">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L263)

Since v0.0.0

## Curie (type alias)

Type for `Curie`.

**Example**

```ts
import type { Curie } from "@beep/rdf/Rdf"

const acceptCurie = (value: Curie) => value
console.log(acceptCurie)
```

**Signature**

```ts
type Curie = typeof Curie.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L285)

Since v0.0.0

## Dataset (class)

Dataset wrapper for RDF quads.

**Example**

```ts
import { Dataset } from "@beep/rdf/Rdf"

console.log(Dataset)
```

**Signature**

```ts
declare class Dataset
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L666)

Since v0.0.0

## DefaultGraph (class)

RDF default graph term.

**Example**

```ts
import { DefaultGraph } from "@beep/rdf/Rdf"

console.log(DefaultGraph)
```

**Signature**

```ts
declare class DefaultGraph
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L443)

Since v0.0.0

## GraphTerm

RDF graph term union.

**Example**

```ts
import { GraphTerm } from "@beep/rdf/Rdf"

console.log(GraphTerm)
```

**Signature**

```ts
declare const GraphTerm: AnnotatedSchema<S.Union<readonly [typeof NamedNode, typeof BlankNode, typeof DefaultGraph]> & TaggedUnionUtils<"termType", readonly [typeof NamedNode, typeof BlankNode, typeof DefaultGraph], [typeof NamedNode, typeof BlankNode, typeof DefaultGraph]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L604)

Since v0.0.0

## GraphTerm (type alias)

Type for `GraphTerm`.

**Example**

```ts
import type { GraphTerm } from "@beep/rdf/Rdf"

const acceptGraphTerm = (value: GraphTerm) => value
console.log(acceptGraphTerm)
```

**Signature**

```ts
type GraphTerm = typeof GraphTerm.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L625)

Since v0.0.0

## LanguageTag

RDF literal language tag.

**Example**

```ts
import { LanguageTag } from "@beep/rdf/Rdf"

console.log(LanguageTag)
```

**Signature**

```ts
declare const LanguageTag: AnnotatedSchema<S.brand<S.String, "LanguageTag">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L300)

Since v0.0.0

## LanguageTag (type alias)

Type for `LanguageTag`.

**Example**

```ts
import type { LanguageTag } from "@beep/rdf/Rdf"

const acceptLanguageTag = (value: LanguageTag) => value
console.log(acceptLanguageTag)
```

**Signature**

```ts
type LanguageTag = typeof LanguageTag.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L335)

Since v0.0.0

## Literal (class)

RDF literal value.

**Example**

```ts
import { Literal } from "@beep/rdf/Rdf"

console.log(Literal)
```

**Signature**

```ts
declare class Literal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L415)

Since v0.0.0

## NamedNode (class)

RDF named node value.

**Example**

```ts
import { NamedNode } from "@beep/rdf/Rdf"

console.log(NamedNode)
```

**Signature**

```ts
declare class NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L350)

Since v0.0.0

## NamespaceBinding (class)

Prefix-to-namespace binding for RDF compaction and expansion.

**Example**

```ts
import { NamespaceBinding } from "@beep/rdf/Rdf"

console.log(NamespaceBinding)
```

**Signature**

```ts
declare class NamespaceBinding
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L689)

Since v0.0.0

## ObjectTerm

RDF object term union.

**Example**

```ts
import { ObjectTerm } from "@beep/rdf/Rdf"

console.log(ObjectTerm)
```

**Signature**

```ts
declare const ObjectTerm: AnnotatedSchema<S.Union<readonly [typeof NamedNode, typeof BlankNode, typeof Literal]> & TaggedUnionUtils<"termType", readonly [typeof NamedNode, typeof BlankNode, typeof Literal], [typeof NamedNode, typeof BlankNode, typeof Literal]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L568)

Since v0.0.0

## ObjectTerm (type alias)

Type for `ObjectTerm`.

**Example**

```ts
import type { ObjectTerm } from "@beep/rdf/Rdf"

const acceptObjectTerm = (value: ObjectTerm) => value
console.log(acceptObjectTerm)
```

**Signature**

```ts
type ObjectTerm = typeof ObjectTerm.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L589)

Since v0.0.0

## PrefixLabel

Prefix label used by RDF namespace bindings.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { PrefixLabel } from "@beep/rdf/Rdf"

const decoded = S.decodeUnknownSync(PrefixLabel)("schema")
console.log(decoded) // "schema"
```
```

**Signature**

```ts
declare const PrefixLabel: AnnotatedSchema<S.brand<S.String, "PrefixLabel">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L214)

Since v0.0.0

## PrefixLabel (type alias)

Type for `PrefixLabel`.

**Example**

```ts
import type { PrefixLabel } from "@beep/rdf/Rdf"

const acceptPrefixLabel = (value: PrefixLabel) => value
console.log(acceptPrefixLabel)
```

**Signature**

```ts
type PrefixLabel = typeof PrefixLabel.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L248)

Since v0.0.0

## PrefixMap

Prefix map keyed by `PrefixLabel`.

**Example**

```ts
import { PrefixMap } from "@beep/rdf/Rdf"

console.log(PrefixMap)
```

**Signature**

```ts
declare const PrefixMap: AnnotatedSchema<S.$Record<AnnotatedSchema<S.brand<S.String, "PrefixLabel">>, AnnotatedSchema<S.brand<S.String, "IRI">>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L713)

Since v0.0.0

## PrefixMap (type alias)

Type for `PrefixMap`.

**Example**

```ts
import type { PrefixMap } from "@beep/rdf/Rdf"

const acceptPrefixMap = (value: PrefixMap) => value
console.log(acceptPrefixMap)
```

**Signature**

```ts
type PrefixMap = typeof PrefixMap.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L747)

Since v0.0.0

## Quad (class)

RDF quad value aligned with RDF/JS.

**Example**

```ts
import { Quad } from "@beep/rdf/Rdf"

console.log(Quad)
```

**Signature**

```ts
declare class Quad
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L640)

Since v0.0.0

## Subject

RDF subject term union.

**Example**

```ts
import { Subject } from "@beep/rdf/Rdf"

console.log(Subject)
```

**Signature**

```ts
declare const Subject: AnnotatedSchema<S.Union<readonly [typeof NamedNode, typeof BlankNode]> & TaggedUnionUtils<"termType", readonly [typeof NamedNode, typeof BlankNode], [typeof NamedNode, typeof BlankNode]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L532)

Since v0.0.0

## Subject (type alias)

Type for `Subject`.

**Example**

```ts
import type { Subject } from "@beep/rdf/Rdf"

const acceptSubject = (value: Subject) => value
console.log(acceptSubject)
```

**Signature**

```ts
type Subject = typeof Subject.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L553)

Since v0.0.0

## Term

RDF term union.

**Example**

```ts
import { Term } from "@beep/rdf/Rdf"

console.log(Term)
```

**Signature**

```ts
declare const Term: AnnotatedSchema<S.Union<readonly [typeof NamedNode, typeof BlankNode, typeof Literal, typeof DefaultGraph]> & TaggedUnionUtils<"termType", readonly [typeof NamedNode, typeof BlankNode, typeof Literal, typeof DefaultGraph], [typeof NamedNode, typeof BlankNode, typeof Literal, typeof DefaultGraph]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L480)

Since v0.0.0

## Term (type alias)

Type for `Term`.

**Example**

```ts
import type { Term } from "@beep/rdf/Rdf"

const acceptTerm = (value: Term) => value
console.log(acceptTerm)
```

**Signature**

```ts
type Term = typeof Term.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L517)

Since v0.0.0

# utilities

## MakeLiteralOptions (class)

Optional language settings for `makeLiteral`.

**Example**

```ts
import type { MakeLiteralOptions } from "@beep/rdf/Rdf"

const options: MakeLiteralOptions = { language: "en" }
console.log(options)
```

**Signature**

```ts
declare class MakeLiteralOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L812)

Since v0.0.0

## MakeQuadOptions (class)

Object and optional graph settings for `makeQuad`.

**Example**

```ts
import type { MakeQuadOptions } from "@beep/rdf/Rdf"

const acceptOptions = (options: MakeQuadOptions) => options
console.log(acceptOptions)
```

**Signature**

```ts
declare class MakeQuadOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L877)

Since v0.0.0

## areDatasetsEquivalent

Compare datasets by sorted quad serialization.

**Example**

```ts
```typescript
import { makeDataset, areDatasetsEquivalent } from "@beep/rdf/Rdf"

const a = makeDataset([])
const b = makeDataset([])
console.log(areDatasetsEquivalent(a, b)) // true
```
```

**Signature**

```ts
declare const areDatasetsEquivalent: { (right: Dataset): (left: Dataset) => boolean; (left: Dataset, right: Dataset): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L1045)

Since v0.0.0

## makeBlankNode

Build a blank node from a non-empty label.

**Example**

```ts
```typescript
import { makeBlankNode } from "@beep/rdf/Rdf"

const node = makeBlankNode("b0")
console.log(node.termType) // "BlankNode"
console.log(node.value) // "b0"
```
```

**Signature**

```ts
declare const makeBlankNode: (value: string) => BlankNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L792)

Since v0.0.0

## makeDataset

Build a dataset from quads.

**Example**

```ts
```typescript
import { makeNamedNode, makeLiteral, makeQuad, makeDataset } from "@beep/rdf/Rdf"

const quad = makeQuad(
  makeNamedNode("https://example.org/alice"),
  makeNamedNode("https://schema.org/name"),
  makeLiteral("Alice", "http://www.w3.org/2001/XMLSchema#string")
)
const dataset = makeDataset([quad])
console.log(dataset.quads.length) // 1
```
```

**Signature**

```ts
declare const makeDataset: (quads: ReadonlyArray<Quad>) => Dataset
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L953)

Since v0.0.0

## makeLiteral

Build an RDF literal.

**Example**

```ts
```typescript
import { makeLiteral } from "@beep/rdf/Rdf"

const lit = makeLiteral("hello", "http://www.w3.org/2001/XMLSchema#string", { language: "en" })
console.log(lit.termType) // "Literal"
console.log(lit.value) // "hello"
```
```

**Signature**

```ts
declare const makeLiteral: { (value: string, datatype: string): Literal; (value: string, datatype: string, options: MakeLiteralOptions): Literal; (value: string, datatype: string, language: string): Literal; (datatype: string): (value: string) => Literal; (datatype: string, options: MakeLiteralOptions): (value: string) => Literal; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L855)

Since v0.0.0

## makeNamedNode

Build a named node from an IRI string.

**Example**

```ts
```typescript
import { makeNamedNode } from "@beep/rdf/Rdf"

const node = makeNamedNode("https://schema.org/Person")
console.log(node.termType) // "NamedNode"
console.log(node.value) // "https://schema.org/Person"
```
```

**Signature**

```ts
declare const makeNamedNode: (value: string) => NamedNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L766)

Since v0.0.0

## makeQuad

Build an RDF quad.

**Example**

```ts
```typescript
import { makeNamedNode, makeLiteral, makeQuad } from "@beep/rdf/Rdf"

const subject = makeNamedNode("https://example.org/alice")
const predicate = makeNamedNode("https://schema.org/name")
const object = makeLiteral("Alice", "http://www.w3.org/2001/XMLSchema#string")
const quad = makeQuad(subject, predicate, object)
console.log(quad.subject.value) // "https://example.org/alice"
```
```

**Signature**

```ts
declare const makeQuad: { (subject: Subject, predicate: NamedNode, object: ObjectTerm): Quad; (subject: Subject, predicate: NamedNode, options: MakeQuadOptions): Quad; (predicate: NamedNode, object: ObjectTerm): (subject: Subject) => Quad; (predicate: NamedNode, options: MakeQuadOptions): (subject: Subject) => Quad; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L917)

Since v0.0.0

## serializeQuad

Serialize an RDF quad to a deterministic lexical form.

**Example**

```ts
```typescript
import { makeNamedNode, makeLiteral, makeQuad, serializeQuad } from "@beep/rdf/Rdf"

const quad = makeQuad(
  makeNamedNode("https://example.org/alice"),
  makeNamedNode("https://schema.org/name"),
  makeLiteral("Alice", "http://www.w3.org/2001/XMLSchema#string")
)
console.log(typeof serializeQuad(quad)) // "string"
```
```

**Signature**

```ts
declare const serializeQuad: (quad: Quad) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L1002)

Since v0.0.0

## serializeTerm

Serialize an RDF term to a deterministic lexical form.

**Example**

```ts
```typescript
import { makeNamedNode, serializeTerm } from "@beep/rdf/Rdf"

const serialized = serializeTerm(makeNamedNode("https://example.org/x"))
console.log(serialized) // "<https://example.org/x>"
```
```

**Signature**

```ts
declare const serializeTerm: (term: Term) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L971)

Since v0.0.0

## sortDatasetQuads

Sort dataset quads by deterministic quad serialization.

**Example**

```ts
```typescript
import { makeDataset, sortDatasetQuads } from "@beep/rdf/Rdf"

const dataset = makeDataset([])
const sorted = sortDatasetQuads(dataset)
console.log(sorted.length) // 0
```
```

**Signature**

```ts
declare const sortDatasetQuads: (dataset: Dataset) => ReadonlyArray<Quad>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/rdf/src/Rdf.ts#L1024)

Since v0.0.0