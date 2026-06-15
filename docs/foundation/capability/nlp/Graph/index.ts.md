---
title: index.ts
nav_order: 28
parent: "@beep/nlp"
---

## index.ts overview

Annotated text graph: structural nodes enriched with linguistic-annotation
nodes (POS/entity/lemma/dependency) produced by an `NLPBackend`.

**Example**

```ts
```typescript
import { AnnotatedTextGraph } from "@beep/nlp/Graph"

console.log(AnnotatedTextGraph.empty())
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [EffectGraph (namespace export)](#effectgraph-namespace-export)
- [GraphOperations (namespace export)](#graphoperations-namespace-export)
- [GraphOps (namespace export)](#graphops-namespace-export)
- [Schema (namespace export)](#schema-namespace-export)
- [TypeClass (namespace export)](#typeclass-namespace-export)
---

# models

## AnnotatedTextGraph (namespace export)

Re-exports all named exports from the "./AnnotatedTextGraph.ts" module as `AnnotatedTextGraph`.

**Example**

```ts
```typescript
import { AnnotatedTextGraph } from "@beep/nlp/Graph"

console.log(AnnotatedTextGraph.empty())
```
```

**Signature**

```ts
export * as AnnotatedTextGraph from "./AnnotatedTextGraph.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/index.ts#L22)

Since v0.0.0

## EffectGraph (namespace export)

Re-exports all named exports from the "./EffectGraph.ts" module as `EffectGraph`.

**Example**

```ts
```typescript
import { EffectGraph } from "@beep/nlp/Graph"

console.log(EffectGraph.empty<string>())
```
```

**Signature**

```ts
export * as EffectGraph from "./EffectGraph.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/index.ts#L36)

Since v0.0.0

## GraphOperations (namespace export)

Re-exports all named exports from the "./GraphOperations/index.ts" module as `GraphOperations`.

**Example**

```ts
```typescript
import { GraphOperations } from "@beep/nlp/Graph"

console.log(GraphOperations.Operation.identity<string>().name)
```
```

**Signature**

```ts
export * as GraphOperations from "./GraphOperations/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/index.ts#L52)

Since v0.0.0

## GraphOps (namespace export)

Re-exports all named exports from the "./GraphOps.ts" module as `GraphOps`.

**Example**

```ts
```typescript
import { GraphOps } from "@beep/nlp/Graph"

console.log(GraphOps.empty<string, number>())
```
```

**Signature**

```ts
export * as GraphOps from "./GraphOps.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/index.ts#L67)

Since v0.0.0

## Schema (namespace export)

Re-exports all named exports from the "./Schema.ts" module as `Schema`.

**Example**

```ts
```typescript
import { Schema } from "@beep/nlp/Graph"

console.log(Schema.TextNode)
```
```

**Signature**

```ts
export * as Schema from "./Schema.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/index.ts#L81)

Since v0.0.0

## TypeClass (namespace export)

Re-exports all named exports from the "./TypeClass.ts" module as `TypeClass`.

**Example**

```ts
```typescript
import { TypeClass } from "@beep/nlp/Graph"

console.log(TypeClass.mapOperation("upper", (s: string) => s.toUpperCase()).name)
```
```

**Signature**

```ts
export * as TypeClass from "./TypeClass.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/index.ts#L96)

Since v0.0.0