---
title: Types.ts
nav_order: 26
parent: "@beep/nlp"
---

## Types.ts overview

GraphOperations/Types - core value types for the graph-operations engine.

Execution strategies, metrics, cost estimation, validation results, options,
execution ids, and operation results. `ExecutionMetrics` forms a monoid
(its `ExecutionMetrics.combine` is associative with `ExecutionMetrics.empty`
as identity), which is how per-node results aggregate into a run total.

Effect v4 `@beep/nlp` implementation notes:
- `ExecutionId` is a `Brand.nominal` branded string with an EFFECTFUL
  `generateExecutionId` (reads `Clock` + `effect/Random`) instead of an
  inline `crypto.randomUUID()`.
- `makeOperationResult` reads `Clock` for its timestamp instead of
  `Date.now()`.
- `timeout` is an `Option<Duration>` (no `null`); native array spreads become
  `effect/Array`.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [generateExecutionId](#generateexecutionid)
  - [makeExecutionId](#makeexecutionid)
  - [makeOperationResult](#makeoperationresult)
- [models](#models)
  - [Complexity](#complexity)
  - [Complexity (type alias)](#complexity-type-alias)
  - [ConstantOperationCost (class)](#constantoperationcost-class)
  - [ExecutionId](#executionid)
  - [ExecutionId (type alias)](#executionid-type-alias)
  - [ExecutionMetrics (class)](#executionmetrics-class)
  - [ExecutionOptions (class)](#executionoptions-class)
  - [ExecutionStrategy](#executionstrategy)
  - [ExecutionStrategy (type alias)](#executionstrategy-type-alias)
  - [LinearOperationCost (class)](#linearoperationcost-class)
  - [LinearithmicOperationCost (class)](#linearithmicoperationcost-class)
  - [OperationCategory](#operationcategory)
  - [OperationCategory (type alias)](#operationcategory-type-alias)
  - [OperationCost](#operationcost)
  - [OperationCost (type alias)](#operationcost-type-alias)
  - [OperationResult (interface)](#operationresult-interface)
  - [QuadraticOperationCost (class)](#quadraticoperationcost-class)
  - [ValidationResult (class)](#validationresult-class)
---

# constructors

## generateExecutionId

Generate a fresh execution id from the Effect clock and random service.

**Example**

```ts
import { Effect } from "effect"
import { generateExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"

const program = Effect.map(generateExecutionId, (id) => id.startsWith("exec-"))
console.log(Effect.runSync(program)) // true
```

**Signature**

```ts
declare const generateExecutionId: Effect.Effect<string & Brand.Brand<"ExecutionId">, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L670)

Since v0.0.0

## makeExecutionId

Constructor for `ExecutionId`.

**Example**

```ts
import { makeExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"

console.log(makeExecutionId("exec-1"))
```

**Signature**

```ts
declare const makeExecutionId: Brand.Constructor<string & Brand.Brand<"ExecutionId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L652)

Since v0.0.0

## makeOperationResult

Build an operation result and stamp it with the current Effect clock time.

**Example**

```ts
import { Effect } from "effect"
import { ExecutionMetrics, makeOperationResult, makeExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"

const program = makeOperationResult(
  makeExecutionId("exec-example"),
  "source graph",
  [],
  [],
  ExecutionMetrics.empty()
)

console.log(Effect.runSync(program).newNodes.length) // 0
```

**Signature**

```ts
declare const makeOperationResult: { <B, E>(executionId: ExecutionId, originalGraph: unknown, newNodes: ReadonlyArray<GraphNode<B>>, errors: ReadonlyArray<E>, metrics: ExecutionMetrics): Effect.Effect<OperationResult<B, E>>; <B, E>(originalGraph: unknown, newNodes: ReadonlyArray<GraphNode<B>>, errors: ReadonlyArray<E>, metrics: ExecutionMetrics): (executionId: ExecutionId) => Effect.Effect<OperationResult<B, E>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L732)

Since v0.0.0

# models

## Complexity

Asymptotic complexity vocabulary used when scaling operation cost estimates.

**Example**

```ts
import { Complexity } from "@beep/nlp/Graph/GraphOperations/Types"

console.log(Complexity.is["O(n)"]("O(n)")) // true
```

**Signature**

```ts
declare const Complexity: AnnotatedSchema<LiteralKit<readonly ["O(1)", "O(n)", "O(n log n)", "O(n^2)"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L177)

Since v0.0.0

## Complexity (type alias)

Runtime type represented by `Complexity`.

**Example**

```ts
import type { Complexity } from "@beep/nlp/Graph/GraphOperations/Types"

const complexity: Complexity = "O(n log n)"
console.log(complexity)
```

**Signature**

```ts
type Complexity = typeof Complexity.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L197)

Since v0.0.0

## ConstantOperationCost (class)

Cost estimate for an operation whose time does not grow with leaf count.

**Example**

```ts
import { Duration } from "effect"
import { ConstantOperationCost } from "@beep/nlp/Graph/GraphOperations/Types"

const cost = ConstantOperationCost.make({
  complexity: "O(1)",
  estimatedTime: Duration.millis(1),
  memoryCost: 0,
  tokenCost: 0
})

console.log(cost.complexity) // "O(1)"
```

**Signature**

```ts
declare class ConstantOperationCost
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L220)

Since v0.0.0

## ExecutionId

Branded identifier for one graph-operation execution.

**Example**

```ts
import { ExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"

const id: ExecutionId = ExecutionId.make("exec-1")
console.log(id)
```

**Signature**

```ts
declare const ExecutionId: AnnotatedSchema<S.brand<S.String, "ExecutionId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L617)

Since v0.0.0

## ExecutionId (type alias)

Runtime type represented by `ExecutionId`.

**Example**

```ts
import { ExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"

const id: ExecutionId = ExecutionId.make("exec-1")
console.log(id)
```

**Signature**

```ts
type ExecutionId = typeof ExecutionId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L637)

Since v0.0.0

## ExecutionMetrics (class)

Metrics accumulated while applying an operation to graph leaves.

**Example**

```ts
import { ExecutionMetrics } from "@beep/nlp/Graph/GraphOperations/Types"

const combined = ExecutionMetrics.combine(
  ExecutionMetrics.empty(),
  ExecutionMetrics.make({ ...ExecutionMetrics.empty(), nodesProcessed: 2 })
)

console.log(combined.nodesProcessed) // 2
```

**Signature**

```ts
declare class ExecutionMetrics
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L123)

Since v0.0.0

## ExecutionOptions (class)

Options controlling one executor run.

**Example**

```ts
import { ExecutionOptions } from "@beep/nlp/Graph/GraphOperations/Types"

const options = ExecutionOptions.parallel(8)
console.log(options.strategy._tag) // "Parallel"
```

**Signature**

```ts
declare class ExecutionOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L571)

Since v0.0.0

## ExecutionStrategy

Strategy describing how an operation is scheduled across the current leaf set.

**Example**

```ts
import { ExecutionStrategy } from "@beep/nlp/Graph/GraphOperations/Types"

const strategy = ExecutionStrategy.Parallel(4)
console.log(strategy.concurrency) // 4
```

**Signature**

```ts
declare const ExecutionStrategy: AnnotatedSchema<S.TaggedUnion<{ readonly Sequential: S.TaggedStruct<"Sequential", {}>; readonly Parallel: S.TaggedStruct<"Parallel", { readonly concurrency: S.Finite; }>; readonly Batch: S.TaggedStruct<"Batch", { readonly batchSize: S.Finite; }>; readonly Streaming: S.TaggedStruct<"Streaming", {}>; }> & { Sequential: { readonly _tag: "Sequential"; }; Parallel: (concurrency: number) => { readonly _tag: "Parallel"; readonly concurrency: number; }; Batch: (batchSize: number) => { readonly _tag: "Batch"; readonly batchSize: number; }; Streaming: { readonly _tag: "Streaming"; }; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L57)

Since v0.0.0

## ExecutionStrategy (type alias)

Runtime type represented by `ExecutionStrategy`.

**Example**

```ts
import { ExecutionStrategy } from "@beep/nlp/Graph/GraphOperations/Types"

const strategy: ExecutionStrategy = ExecutionStrategy.Sequential
console.log(strategy._tag) // "Sequential"
```

**Signature**

```ts
type ExecutionStrategy = typeof ExecutionStrategy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L94)

Since v0.0.0

## LinearOperationCost (class)

Cost estimate for work that grows linearly with leaf count.

**Example**

```ts
import { Duration } from "effect"
import { LinearOperationCost } from "@beep/nlp/Graph/GraphOperations/Types"

const cost = LinearOperationCost.make({
  complexity: "O(n)",
  estimatedTime: Duration.millis(2),
  memoryCost: 128,
  tokenCost: 4
})

console.log(cost.tokenCost) // 4
```

**Signature**

```ts
declare class LinearOperationCost
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L259)

Since v0.0.0

## LinearithmicOperationCost (class)

Cost estimate for work that grows at `n log n`.

**Example**

```ts
import { Duration } from "effect"
import { LinearithmicOperationCost } from "@beep/nlp/Graph/GraphOperations/Types"

const cost = LinearithmicOperationCost.make({
  complexity: "O(n log n)",
  estimatedTime: Duration.millis(3),
  memoryCost: 256,
  tokenCost: 0
})

console.log(cost.memoryCost) // 256
```

**Signature**

```ts
declare class LinearithmicOperationCost
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L298)

Since v0.0.0

## OperationCategory

Operation category vocabulary describing a graph morphism's shape.

**Example**

```ts
import { OperationCategory } from "@beep/nlp/Graph/GraphOperations/Types"

console.log(OperationCategory.is.expansion("expansion")) // true
```

**Signature**

```ts
declare const OperationCategory: LiteralKit<readonly ["transformation", "expansion", "aggregation", "filtering", "composition", "llm"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L522)

Since v0.0.0

## OperationCategory (type alias)

Runtime type represented by `OperationCategory`.

**Example**

```ts
import type { OperationCategory } from "@beep/nlp/Graph/GraphOperations/Types"

const category: OperationCategory = "transformation"
console.log(category)
```

**Signature**

```ts
type OperationCategory = typeof OperationCategory.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L545)

Since v0.0.0

## OperationCost

Tagged union of operation cost estimates with scaling helpers.

**Example**

```ts
import { Duration } from "effect"
import { OperationCost } from "@beep/nlp/Graph/GraphOperations/Types"

const cost = OperationCost.cases["O(n)"].make({
  estimatedTime: Duration.millis(2),
  memoryCost: 10,
  tokenCost: 1
})

console.log(OperationCost.scale(cost, 3).memoryCost) // 30
```

**Signature**

```ts
declare const OperationCost: AnnotatedSchema<S.Union<readonly [typeof ConstantOperationCost, typeof LinearOperationCost, typeof LinearithmicOperationCost, typeof QuadraticOperationCost]> & TaggedUnionUtils<"complexity", readonly [typeof ConstantOperationCost, typeof LinearOperationCost, typeof LinearithmicOperationCost, typeof QuadraticOperationCost], [typeof ConstantOperationCost, typeof LinearOperationCost, typeof LinearithmicOperationCost, typeof QuadraticOperationCost]> & { zero: () => ConstantOperationCost; scale: { (cost: OperationCost, nodeCount: number): OperationCost; (nodeCount: number): (cost: OperationCost) => OperationCost; }; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L380)

Since v0.0.0

## OperationCost (type alias)

Companion type for `OperationCost`.

**Example**

```ts
import { Duration } from "effect"
import { OperationCost } from "@beep/nlp/Graph/GraphOperations/Types"

const cost: OperationCost = OperationCost.cases["O(1)"].make({
  estimatedTime: Duration.millis(1),
  memoryCost: 0,
  tokenCost: 0,
})

console.log(cost.complexity) // "O(1)"
```

**Signature**

```ts
type OperationCost = typeof OperationCost.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L444)

Since v0.0.0

## OperationResult (interface)

Result of applying one operation to the sampled graph leaves.

**Example**

```ts
import type { OperationResult } from "@beep/nlp/Graph/GraphOperations/Types"

const createdCount = <A, E>(result: OperationResult<A, E>) => result.newNodes.length
console.log(createdCount)
```

**Signature**

```ts
export interface OperationResult<B, E> {
  readonly errors: ReadonlyArray<E>;
  readonly executionId: ExecutionId;
  readonly metrics: ExecutionMetrics;
  readonly newNodes: ReadonlyArray<GraphNode<B>>;
  /** Opaque reference to the originating graph. */
  readonly originalGraph: unknown;
  readonly timestamp: number;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L700)

Since v0.0.0

## QuadraticOperationCost (class)

Cost estimate for pairwise or otherwise quadratic graph work.

**Example**

```ts
import { Duration } from "effect"
import { QuadraticOperationCost } from "@beep/nlp/Graph/GraphOperations/Types"

const cost = QuadraticOperationCost.make({
  complexity: "O(n^2)",
  estimatedTime: Duration.millis(5),
  memoryCost: 512,
  tokenCost: 0
})

console.log(cost.complexity) // "O(n^2)"
```

**Signature**

```ts
declare class QuadraticOperationCost
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L337)

Since v0.0.0

## ValidationResult (class)

Result of checking whether an operation may run against graph leaves.

**Example**

```ts
import { ValidationResult } from "@beep/nlp/Graph/GraphOperations/Types"

const result = ValidationResult.withWarnings(
  ValidationResult.valid(),
  ["No leaf nodes to process"]
)

console.log(result.warnings.length) // 1
```

**Signature**

```ts
declare class ValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Types.ts#L472)

Since v0.0.0