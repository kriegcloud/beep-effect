---
title: index.ts
nav_order: 35
parent: "@beep/nlp"
---

## index.ts overview

Algebraic structures (monoids) for NLP aggregation.

**Example**

```ts
```typescript
import { Algebra } from "@beep/nlp"

console.log(Algebra.Monoid.fold(Algebra.Monoid.NumberSum)([1, 2, 3])) // 6
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [interop](#interop)
  - [Handoff (namespace export)](#handoff-namespace-export)
- [models](#models)
  - [Core (namespace export)](#core-namespace-export)
  - [Graph (namespace export)](#graph-namespace-export)
  - [Ontology (namespace export)](#ontology-namespace-export)
- [normalization](#normalization)
  - [PathText (namespace export)](#pathtext-namespace-export)
  - [QueryText (namespace export)](#querytext-namespace-export)
  - [VariantText (namespace export)](#varianttext-namespace-export)
- [parsing](#parsing)
  - [IdentifierText (namespace export)](#identifiertext-namespace-export)
- [ports](#ports)
  - [Backend (namespace export)](#backend-namespace-export)
- [services](#services)
  - [NLPService (namespace export)](#nlpservice-namespace-export)
- [tools](#tools)
  - [Tools (namespace export)](#tools-namespace-export)
---

# combinators

## Algebra (namespace export)

Re-exports all named exports from the "./Algebra/index.ts" module as `Algebra`.

**Example**

```ts
```typescript
import { Algebra } from "@beep/nlp"

console.log(Algebra.Monoid.fold(Algebra.Monoid.NumberSum)([1, 2, 3])) // 6
```
```

**Signature**

```ts
export * as Algebra from "./Algebra/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L22)

Since v0.0.0

# interop

## Handoff (namespace export)

Re-exports all named exports from the "./Handoff/index.ts" module as `Handoff`.

**Example**

```ts
```typescript
import { Handoff } from "@beep/nlp"

console.log(Handoff.Contract.AnnotatedDocument)
```
```

**Signature**

```ts
export * as Handoff from "./Handoff/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L80)

Since v0.0.0

# models

## Core (namespace export)

Re-exports all named exports from the "./Core/index.ts" module as `Core`.

**Example**

```ts
```typescript
import { Core } from "@beep/nlp"

const tokenize = Core.tokenize
console.log(tokenize)
```
```

**Signature**

```ts
export * as Core from "./Core/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L51)

Since v0.0.0

## Graph (namespace export)

Re-exports all named exports from the "./Graph/index.ts" module as `Graph`.

**Example**

```ts
```typescript
import { Graph } from "@beep/nlp"

console.log(Graph.Schema.TextNode)
```
```

**Signature**

```ts
export * as Graph from "./Graph/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L65)

Since v0.0.0

## Ontology (namespace export)

Re-exports all named exports from the "./Ontology/index.ts" module as `Ontology`.

**Example**

```ts
```typescript
import { Ontology } from "@beep/nlp"

console.log(Ontology.Kind.canContain("Document", "Sentence")) // true
```
```

**Signature**

```ts
export * as Ontology from "./Ontology/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L116)

Since v0.0.0

# normalization

## PathText (namespace export)

Re-exports all named exports from the "./PathText.ts" module as `PathText`.

**Example**

```ts
```typescript
import { PathText } from "@beep/nlp"

const normalized = PathText.normalizePathPhrase("src\\utils")
console.log(normalized) // "src/utils"
```
```

**Signature**

```ts
export * as PathText from "./PathText.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L131)

Since v0.0.0

## QueryText (namespace export)

Re-exports all named exports from the "./QueryText.ts" module as `QueryText`.

**Example**

```ts
```typescript
import { QueryText } from "@beep/nlp"

const normalized = QueryText.normalizeQuestion("  hello   world  ")
console.log(normalized) // "hello world"
```
```

**Signature**

```ts
export * as QueryText from "./QueryText.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L146)

Since v0.0.0

## VariantText (namespace export)

Re-exports all named exports from the "./VariantText.ts" module as `VariantText`.

**Example**

```ts
```typescript
import { VariantText } from "@beep/nlp"

const deduped = VariantText.orderedDedupe(["foo", "bar", "foo"])
console.log(deduped) // ["foo", "bar"]
```
```

**Signature**

```ts
export * as VariantText from "./VariantText.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L176)

Since v0.0.0

# parsing

## IdentifierText (namespace export)

Re-exports all named exports from the "./IdentifierText.ts" module as `IdentifierText`.

**Example**

```ts
```typescript
import { IdentifierText } from "@beep/nlp"

const result = IdentifierText.tokens("myVariable")
console.log(result) // ["my", "variable"]
```
```

**Signature**

```ts
export * as IdentifierText from "./IdentifierText.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L95)

Since v0.0.0

# ports

## Backend (namespace export)

Re-exports all named exports from the "./Backend/index.ts" module as `Backend`.

**Example**

```ts
```typescript
import { Backend } from "@beep/nlp"

console.log(Backend.NLPBackend.NLPBackend.key)
```
```

**Signature**

```ts
export * as Backend from "./Backend/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L36)

Since v0.0.0

# services

## NLPService (namespace export)

Re-exports all named exports from the "./NLPService.ts" module as `NLPService`.

**Signature**

```ts
export * as NLPService from "./NLPService.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L102)

Since v0.0.0

# tools

## Tools (namespace export)

Re-exports all named exports from the "./Tools/index.ts" module as `Tools`.

**Example**

```ts
```typescript
import { Tools } from "@beep/nlp"

const tokenizeTool = Tools.Tokenize
console.log(tokenizeTool.name)
```
```

**Signature**

```ts
export * as Tools from "./Tools/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/index.ts#L161)

Since v0.0.0