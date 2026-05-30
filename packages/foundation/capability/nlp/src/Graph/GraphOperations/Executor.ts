/**
 * GraphOperations/Executor - the graph-operation execution engine.
 *
 * Applies a {@link GraphOperation} to every leaf node of an
 * {@link EffectGraph}, collecting the new nodes, per-node errors, and
 * aggregated {@link Types.ExecutionMetrics}, with optional result caching via the
 * {@link ResultStore.ResultStore}. Sequential and parallel strategies are
 * implemented; batch/streaming fall back to sequential.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - `Context.GenericTag` becomes the `Context.Service` class form; service methods
 *   use `Effect.fn` so they appear in traces.
 * - `Date.now()` becomes `Clock.currentTimeMillis`; native `Map`/array mutation
 *   becomes `effect/Array`/`Effect.forEach`.
 * - `Effect.either` (returning `Either`) becomes `Effect.result` (returning
 *   `Result`); the `result._tag === "Left"`/`as E` casts become `Result.match`.
 * - the `opts.strategy._tag` switch becomes `Match.valueTags`; the `as any` strategy
 *   access and the `mapError` tag-sniffing block are gone (errors are typed).
 * - results are type-erased ({@link ResultStore.AnyOperationResult}): fresh
 *   `GraphNode<B>`/`E` values widen covariantly into `OperationResult<unknown, unknown>`
 *   and cached values are already erased, so caching round-trips with no assertions.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { A, dual } from "@beep/utils";
import { Clock, Context, Duration, Effect, Layer, Match, Result } from "effect";
import * as O from "effect/Option";
import { getChildren, toArray } from "../EffectGraph.ts";
import { ExecutionError } from "./Errors.ts";
import * as ResultStore from "./ResultStore.ts";
import * as Types from "./Types.ts";
import type { EffectGraph, GraphNode } from "../EffectGraph.ts";
import type { GraphOperation } from "./Operation.ts";

const $I = $NlpId.create("Graph/GraphOperations/Executor");

// =============================================================================
// Service Shape & Tag
// =============================================================================

interface Application {
  readonly errors: ReadonlyArray<unknown>;
  readonly fromCache: boolean;
  readonly newNodes: ReadonlyArray<GraphNode<unknown>>;
}

interface ExecutionFold {
  readonly errors: ReadonlyArray<unknown>;
  readonly metrics: Types.ExecutionMetrics;
  readonly newNodes: ReadonlyArray<GraphNode<unknown>>;
}

/**
 * Structural service contract for applying operations to graph leaves.
 *
 * @remarks
 * `execute` samples the current leaf set, applies the operation to those leaves,
 * and returns a type-erased result because cached values may come from different
 * concrete operations. Operation failures are collected in the result's `errors`
 * array; storage failures surface through the `ExecutionError` channel.
 *
 * @example
 * ```ts
 * import type { GraphExecutorShape } from "@beep/nlp/Graph/GraphOperations/Executor"
 *
 * const readExecute = (executor: GraphExecutorShape) => executor.execute
 *
 * console.log(readExecute)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface GraphExecutorShape {
  readonly estimateCost: <A, B, R, E>(
    graph: EffectGraph<A>,
    operation: GraphOperation<A, B, R, E>
  ) => Effect.Effect<Types.OperationCost>;
  readonly execute: <A, B, R, E>(
    graph: EffectGraph<A>,
    operation: GraphOperation<A, B, R, E>,
    options?: Partial<Types.ExecutionOptions>
  ) => Effect.Effect<Types.OperationResult<unknown, unknown>, ExecutionError, R | ResultStore.ResultStore>;
  readonly validate: <A, B, R, E>(
    graph: EffectGraph<A>,
    operation: GraphOperation<A, B, R, E>
  ) => Effect.Effect<Types.ValidationResult>;
}

/**
 * Service tag for the graph-operation execution engine.
 *
 * @remarks
 * Provide this service together with a {@link ResultStore.ResultStore} when
 * calling `execute`, because execution reads the store at run time to reuse or
 * write cached leaf results.
 *
 * @example
 * ```ts
 * import { GraphExecutor } from "@beep/nlp/Graph/GraphOperations/Executor"
 *
 * console.log(GraphExecutor.key)
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export class GraphExecutor extends Context.Service<GraphExecutor, GraphExecutorShape>()($I`GraphExecutor`) {}

// =============================================================================
// Helpers
// =============================================================================

const getLeafNodes = <A>(graph: EffectGraph<A>): ReadonlyArray<GraphNode<A>> =>
  A.filter(toArray(graph), (node) => A.length(getChildren(graph, node.id)) === 0);

const concurrencyOf = (strategy: Types.ExecutionStrategy): number =>
  Match.value(strategy).pipe(
    Match.tag("Parallel", (s) => s.concurrency),
    Match.orElse(() => 1)
  );

/** Apply the operation to one node, caching on success, yielding nodes + errors. */
const applyOne: {
  <A, B, R, E>(
    store: ResultStore.ResultStoreShape,
    operation: GraphOperation<A, B, R, E>,
    cache: boolean,
    leafNode: GraphNode<A>
  ): Effect.Effect<Application, ExecutionError, R>;
  <A, B, R, E>(
    operation: GraphOperation<A, B, R, E>,
    cache: boolean,
    leafNode: GraphNode<A>
  ): (store: ResultStore.ResultStoreShape) => Effect.Effect<Application, ExecutionError, R>;
} = dual(
  4,
  Effect.fn("applyOne")(function* <A, B, R, E>(
    store: ResultStore.ResultStoreShape,
    operation: GraphOperation<A, B, R, E>,
    cache: boolean,
    leafNode: GraphNode<A>
  ): Effect.fn.Return<Application, ExecutionError, R> {
    const key = ResultStore.ResultKey.new(operation.name, leafNode.id);
    const cached = cache
      ? yield* Effect.mapError(store.get(key), (e) =>
          ExecutionError.make({
            cause: O.some(e),
            message: "Storage retrieve failed",
          })
        )
      : O.none<ResultStore.AnyOperationResult>();

    if (O.isSome(cached)) {
      return {
        errors: cached.value.errors,
        fromCache: true,
        newNodes: cached.value.newNodes,
      };
    }

    const result = yield* Effect.result(operation.apply(leafNode));
    return yield* Result.match(result, {
      onFailure: (failure): Effect.Effect<Application, ExecutionError> =>
        Effect.succeed({
          errors: A.of(failure),
          fromCache: false,
          newNodes: A.empty<GraphNode<unknown>>(),
        }),
      onSuccess: (newNodes): Effect.Effect<Application, ExecutionError> =>
        Effect.as(cache ? cacheResult(store, key, newNodes) : Effect.void, {
          errors: A.empty<unknown>(),
          fromCache: false,
          newNodes,
        }),
    });
  })
);

const cacheResult: {
  <B>(
    store: ResultStore.ResultStoreShape,
    key: ResultStore.ResultKey,
    newNodes: ReadonlyArray<GraphNode<B>>
  ): Effect.Effect<void, ExecutionError>;
  <B>(
    key: ResultStore.ResultKey,
    newNodes: ReadonlyArray<GraphNode<B>>
  ): (store: ResultStore.ResultStoreShape) => Effect.Effect<void, ExecutionError>;
} = dual(
  3,
  Effect.fn("cacheResult")(function* <B>(
    store: ResultStore.ResultStoreShape,
    key: ResultStore.ResultKey,
    newNodes: ReadonlyArray<GraphNode<B>>
  ): Effect.fn.Return<void, ExecutionError> {
    const opResult = yield* Types.makeOperationResult(
      yield* Types.generateExecutionId,
      O.none(),
      newNodes,
      A.empty<unknown>(),
      Types.ExecutionMetrics.empty()
    );
    yield* Effect.mapError(store.store(key, opResult), (e) =>
      ExecutionError.make({ cause: O.some(e), message: "Storage store failed" })
    );
  })
);

const foldApplications: {
  (applications: ReadonlyArray<Application>, nodesProcessed: number, durationMs: number): ExecutionFold;
  (nodesProcessed: number, durationMs: number): (applications: ReadonlyArray<Application>) => ExecutionFold;
} = dual(
  3,
  (applications: ReadonlyArray<Application>, nodesProcessed: number, durationMs: number): ExecutionFold => ({
    errors: A.flatMap(applications, (r) => r.errors),
    metrics: {
      cacheHits: A.length(A.filter(applications, (r) => r.fromCache)),
      cacheMisses: A.length(A.filter(applications, (r) => !r.fromCache)),
      duration: Duration.millis(durationMs),
      nodesCreated: A.reduce(applications, 0, (sum, r) => sum + A.length(r.newNodes)),
      nodesProcessed,
      tokensConsumed: 0,
    },
    newNodes: A.flatMap(applications, (r) => r.newNodes),
  })
);

const runStrategy: {
  <A, B, R, E>(
    store: ResultStore.ResultStoreShape,
    leafNodes: ReadonlyArray<GraphNode<A>>,
    operation: GraphOperation<A, B, R, E>,
    cache: boolean,
    concurrency: number
  ): Effect.Effect<ExecutionFold, ExecutionError, R>;
  <A, B, R, E>(
    leafNodes: ReadonlyArray<GraphNode<A>>,
    operation: GraphOperation<A, B, R, E>,
    cache: boolean,
    concurrency: number
  ): (store: ResultStore.ResultStoreShape) => Effect.Effect<ExecutionFold, ExecutionError, R>;
} = dual(
  5,
  Effect.fn("runStrategy")(function* <A, B, R, E>(
    store: ResultStore.ResultStoreShape,
    leafNodes: ReadonlyArray<GraphNode<A>>,
    operation: GraphOperation<A, B, R, E>,
    cache: boolean,
    concurrency: number
  ): Effect.fn.Return<ExecutionFold, ExecutionError, R> {
    const startTime = yield* Clock.currentTimeMillis;
    const applications = yield* Effect.forEach(leafNodes, (leafNode) => applyOne(store, operation, cache, leafNode), {
      concurrency,
    });
    const endTime = yield* Clock.currentTimeMillis;
    return foldApplications(applications, A.length(leafNodes), endTime - startTime);
  })
);

// =============================================================================
// Implementation
// =============================================================================

const makeGraphExecutor = Effect.succeed(
  GraphExecutor.of({
    estimateCost: Effect.fn("GraphExecutor.estimateCost")(function* (graph, operation) {
      const leafNodes = getLeafNodes(graph);
      return yield* O.match(A.head(leafNodes), {
        onNone: () => Effect.succeed(Types.OperationCost.zero()),
        onSome: (sample) =>
          Effect.map(operation.estimateCost(sample), (cost) => Types.OperationCost.scale(cost, A.length(leafNodes))),
      });
    }),

    execute: Effect.fn("GraphExecutor.execute")(function* (graph, operation, options = {}) {
      const opts: Types.ExecutionOptions = { ...Types.ExecutionOptions.default(), ...options };
      const executionId = yield* Types.generateExecutionId;
      const store = yield* ResultStore.ResultStore;
      const leafNodes = getLeafNodes(graph);

      const fold: ExecutionFold =
        A.length(leafNodes) === 0
          ? {
              errors: A.empty<unknown>(),
              metrics: Types.ExecutionMetrics.empty(),
              newNodes: A.empty<GraphNode<unknown>>(),
            }
          : yield* runStrategy(store, leafNodes, operation, opts.cache, concurrencyOf(opts.strategy));

      return yield* Types.makeOperationResult(executionId, graph, fold.newNodes, fold.errors, fold.metrics);
    }),

    validate: Effect.fn("GraphExecutor.validate")(function* (graph, operation) {
      const leafNodes = getLeafNodes(graph);
      if (A.length(leafNodes) === 0) {
        return Types.ValidationResult.withWarnings(Types.ValidationResult.valid(), [
          "No leaf nodes to apply operation to",
        ]);
      }
      const validations = yield* Effect.forEach(leafNodes, (node) => operation.validate(node), { concurrency: 4 });
      const errors = A.flatMap(validations, (v) => v.errors);
      const warnings = A.flatMap(validations, (v) => v.warnings);
      return A.length(errors) === 0
        ? { errors: A.empty<string>(), valid: true, warnings }
        : { errors, valid: false, warnings };
    }),
  })
);

/**
 * Live {@link GraphExecutor} layer.
 *
 * @remarks
 * The layer constructs only the executor service. Effects returned from
 * `GraphExecutor.execute` still require a {@link ResultStore.ResultStore}
 * environment so callers can choose the cache implementation per run.
 *
 * @example
 * ```ts
 * import { GraphExecutorLive } from "@beep/nlp/Graph/GraphOperations/Executor"
 *
 * console.log(GraphExecutorLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const GraphExecutorLive: Layer.Layer<GraphExecutor> = Layer.effect(GraphExecutor, makeGraphExecutor);

/**
 * Test layer providing both the executor and its in-memory result store.
 *
 * @remarks
 * Use this layer for examples and tests that run `execute` directly. It starts
 * with an empty cache and satisfies the executor's run-time
 * {@link ResultStore.ResultStore} requirement.
 *
 * @example
 * ```ts
 * import { GraphExecutorTest } from "@beep/nlp/Graph/GraphOperations/Executor"
 *
 * console.log(GraphExecutorTest)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const GraphExecutorTest: Layer.Layer<GraphExecutor | ResultStore.ResultStore> = Layer.merge(
  GraphExecutorLive,
  ResultStore.ResultStoreTest
);
