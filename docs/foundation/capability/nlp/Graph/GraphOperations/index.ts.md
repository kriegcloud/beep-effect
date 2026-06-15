---
title: index.ts
nav_order: 23
parent: "@beep/nlp"
---

## index.ts overview

The standard catalog of NLP graph operations (backend-backed + pure).

**Example**

```ts
```typescript
import { Catalog } from "@beep/nlp/Graph/GraphOperations"

console.log(Catalog.tokenize.name)
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [Errors (namespace export)](#errors-namespace-export)
- [repositories](#repositories)
  - [ResultStore (namespace export)](#resultstore-namespace-export)
- [types](#types)
  - [Types (namespace export)](#types-namespace-export)
- [use-cases](#use-cases)
  - [Executor (namespace export)](#executor-namespace-export)
  - [Operation (namespace export)](#operation-namespace-export)
---

# constants

## Catalog (namespace export)

Re-exports all named exports from the "./Catalog.ts" module as `Catalog`.

**Example**

```ts
```typescript
import { Catalog } from "@beep/nlp/Graph/GraphOperations"

console.log(Catalog.tokenize.name)
```
```

**Signature**

```ts
export * as Catalog from "./Catalog.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/index.ts#L26)

Since v0.0.0

# errors

## Errors (namespace export)

Re-exports all named exports from the "./Errors.ts" module as `Errors`.

**Example**

```ts
```typescript
import { Errors } from "@beep/nlp/Graph/GraphOperations"

console.log(Errors.ExecutionError)
```
```

**Signature**

```ts
export * as Errors from "./Errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/index.ts#L40)

Since v0.0.0

# repositories

## ResultStore (namespace export)

Re-exports all named exports from the "./ResultStore.ts" module as `ResultStore`.

**Example**

```ts
```typescript
import { ResultStore } from "@beep/nlp/Graph/GraphOperations"

console.log(ResultStore.ResultStore.key)
```
```

**Signature**

```ts
export * as ResultStore from "./ResultStore.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/index.ts#L82)

Since v0.0.0

# types

## Types (namespace export)

Re-exports all named exports from the "./Types.ts" module as `Types`.

**Example**

```ts
```typescript
import { Types } from "@beep/nlp/Graph/GraphOperations"

console.log(Types.ExecutionStrategy.Parallel(4))
```
```

**Signature**

```ts
export * as Types from "./Types.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/index.ts#L96)

Since v0.0.0

# use-cases

## Executor (namespace export)

Re-exports all named exports from the "./Executor.ts" module as `Executor`.

**Example**

```ts
```typescript
import { Executor } from "@beep/nlp/Graph/GraphOperations"

console.log(Executor.GraphExecutor.key)
```
```

**Signature**

```ts
export * as Executor from "./Executor.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/index.ts#L54)

Since v0.0.0

## Operation (namespace export)

Re-exports all named exports from the "./Operation.ts" module as `Operation`.

**Example**

```ts
```typescript
import { Operation } from "@beep/nlp/Graph/GraphOperations"

console.log(Operation.identity<string>().name)
```
```

**Signature**

```ts
export * as Operation from "./Operation.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/index.ts#L68)

Since v0.0.0