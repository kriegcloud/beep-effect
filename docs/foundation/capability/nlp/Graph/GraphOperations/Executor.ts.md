---
title: Executor.ts
nav_order: 22
parent: "@beep/nlp"
---

## Executor.ts overview

GraphOperations/Executor - the graph-operation execution engine.

Applies a `GraphOperation` to every leaf node of an
`EffectGraph`, collecting the new nodes, per-node errors, and
aggregated `Types.ExecutionMetrics`, with optional result caching via the
`ResultStore.ResultStore`. Sequential and parallel strategies are
implemented; batch/streaming fall back to sequential.

Effect v4 `@beep/nlp` implementation notes:
- `Context.GenericTag` becomes the `Context.Service` class form; service methods
  use `Effect.fn` so they appear in traces.
- `Date.now()` becomes `Clock.currentTimeMillis`; keyed collection / array mutation
  becomes `HashMap`/`effect/Array`/`Effect.forEach`.
- `Effect.either` (returning `Either`) becomes `Effect.result` (returning
  `Result`); the `result._tag === "Left"`/`as E` casts become `Result.match`.
- the `opts.strategy._tag` switch becomes `Match.valueTags`; the `as any` strategy
  access and the `mapError` tag-sniffing block are gone (errors are typed).
- results are type-erased (`ResultStore.AnyOperationResult`): fresh
  `GraphNode<B>`/`E` values widen covariantly into `OperationResult<unknown, unknown>`
  and cached values are already erased, so caching round-trips with no assertions.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [GraphExecutorLive](#graphexecutorlive)
  - [GraphExecutorTest](#graphexecutortest)
- [models](#models)
  - [GraphExecutorShape (interface)](#graphexecutorshape-interface)
- [services](#services)
  - [GraphExecutor (class)](#graphexecutor-class)
---

# layers

## GraphExecutorLive

Live `GraphExecutor` layer.

**Example**

```ts
import { GraphExecutorLive } from "@beep/nlp/Graph/GraphOperations/Executor"

console.log(GraphExecutorLive)
```

**Signature**

```ts
declare const GraphExecutorLive: Layer.Layer<GraphExecutor, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Executor.ts#L433)

Since v0.0.0

## GraphExecutorTest

Test layer providing both the executor and its in-memory result store.

**Example**

```ts
import { GraphExecutorTest } from "@beep/nlp/Graph/GraphOperations/Executor"

console.log(GraphExecutorTest)
```

**Signature**

```ts
declare const GraphExecutorTest: Layer.Layer<GraphExecutor | ResultStore.ResultStore, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Executor.ts#L453)

Since v0.0.0

# models

## GraphExecutorShape (interface)

Structural service contract for applying operations to graph leaves.

**Example**

```ts
import type { GraphExecutorShape } from "@beep/nlp/Graph/GraphOperations/Executor"

const readExecute = (executor: GraphExecutorShape) => executor.execute

console.log(readExecute)
```

**Signature**

```ts
export interface GraphExecutorShape {
  readonly estimateCost: {
    <A, B, R, E>(graph: EffectGraph<A>, operation: GraphOperation<A, B, R, E>): Effect.Effect<Types.OperationCost>;
    <A, B, R, E>(operation: GraphOperation<A, B, R, E>): (graph: EffectGraph<A>) => Effect.Effect<Types.OperationCost>;
  };
  readonly execute: {
    <A, B, R, E>(
      graph: EffectGraph<A>,
      operation: GraphOperation<A, B, R, E>,
      options?: Partial<Types.ExecutionOptions>
    ): Effect.Effect<Types.OperationResult<unknown, unknown>, ExecutionError, R | ResultStore.ResultStore>;
    <A, B, R, E>(
      operation: GraphOperation<A, B, R, E>,
      options?: Partial<Types.ExecutionOptions>
    ): (
      graph: EffectGraph<A>
    ) => Effect.Effect<Types.OperationResult<unknown, unknown>, ExecutionError, R | ResultStore.ResultStore>;
  };
  readonly validate: {
    <A, B, R, E>(graph: EffectGraph<A>, operation: GraphOperation<A, B, R, E>): Effect.Effect<Types.ValidationResult>;
    <A, B, R, E>(
      operation: GraphOperation<A, B, R, E>
    ): (graph: EffectGraph<A>) => Effect.Effect<Types.ValidationResult>;
  };
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Executor.ts#L78)

Since v0.0.0

# services

## GraphExecutor (class)

Service tag for the graph-operation execution engine.

**Example**

```ts
import { GraphExecutor } from "@beep/nlp/Graph/GraphOperations/Executor"

console.log(GraphExecutor.key)
```

**Signature**

```ts
declare class GraphExecutor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Executor.ts#L122)

Since v0.0.0