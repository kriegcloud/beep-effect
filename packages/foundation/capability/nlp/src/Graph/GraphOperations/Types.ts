/**
 * GraphOperations/Types - core value types for the graph-operations engine.
 *
 * Execution strategies, metrics, cost estimation, validation results, options,
 * execution ids, and operation results. {@link ExecutionMetrics} forms a monoid
 * (its {@link ExecutionMetrics.combine} is associative with {@link ExecutionMetrics.empty}
 * as identity), which is how per-node results aggregate into a run total.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - `ExecutionId` is a `Brand.nominal` branded string with an EFFECTFUL
 *   {@link generateExecutionId} (reads `Clock` + `effect/Random`) instead of an
 *   inline `crypto.randomUUID()`.
 * - {@link makeOperationResult} reads `Clock` for its timestamp instead of
 *   `Date.now()`.
 * - `timeout` is an `Option<Duration>` (no `null`); native array spreads become
 *   `effect/Array`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import { Brand, Clock, Duration, Effect, Random } from "effect";
import * as O from "effect/Option";
import type { GraphNode } from "../EffectGraph.ts";

// =============================================================================
// Execution Strategy
// =============================================================================

/**
 * Strategy determining how an operation is executed across the graph's nodes.
 *
 * @since 0.0.0
 * @category models
 */
export type ExecutionStrategy =
  | { readonly _tag: "Sequential" }
  | { readonly _tag: "Parallel"; readonly concurrency: number }
  | { readonly _tag: "Batch"; readonly batchSize: number }
  | { readonly _tag: "Streaming" };

/**
 * Constructors for the {@link ExecutionStrategy} variants.
 *
 * @example
 * ```ts
 * import { ExecutionStrategy } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(ExecutionStrategy.Parallel(4))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const ExecutionStrategy = {
  Sequential: { _tag: "Sequential" } as ExecutionStrategy,
  Parallel: (concurrency: number): ExecutionStrategy => ({ _tag: "Parallel", concurrency }),
  Batch: (batchSize: number): ExecutionStrategy => ({ _tag: "Batch", batchSize }),
  Streaming: { _tag: "Streaming" } as ExecutionStrategy,
};

// =============================================================================
// Execution Metrics (Monoid)
// =============================================================================

/**
 * Metrics collected while executing an operation.
 *
 * @since 0.0.0
 * @category models
 */
export interface ExecutionMetrics {
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly duration: Duration.Duration;
  readonly nodesCreated: number;
  readonly nodesProcessed: number;
  /** Tokens consumed by LLM-backed operations. */
  readonly tokensConsumed: number;
}

/**
 * The {@link ExecutionMetrics} monoid: {@link ExecutionMetrics.empty} is the
 * identity and {@link ExecutionMetrics.combine} the associative aggregation.
 *
 * @example
 * ```ts
 * import { ExecutionMetrics } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(ExecutionMetrics.combine(ExecutionMetrics.empty(), ExecutionMetrics.empty()))
 * ```
 *
 * @since 0.0.0
 * @category instances
 */
export const ExecutionMetrics = {
  empty: (): ExecutionMetrics => ({
    cacheHits: 0,
    cacheMisses: 0,
    duration: Duration.zero,
    nodesCreated: 0,
    nodesProcessed: 0,
    tokensConsumed: 0,
  }),
  combine: (m1: ExecutionMetrics, m2: ExecutionMetrics): ExecutionMetrics => ({
    cacheHits: m1.cacheHits + m2.cacheHits,
    cacheMisses: m1.cacheMisses + m2.cacheMisses,
    duration: Duration.sum(m1.duration, m2.duration),
    nodesCreated: m1.nodesCreated + m2.nodesCreated,
    nodesProcessed: m1.nodesProcessed + m2.nodesProcessed,
    tokensConsumed: m1.tokensConsumed + m2.tokensConsumed,
  }),
};

// =============================================================================
// Operation Cost Estimation
// =============================================================================

/**
 * Asymptotic complexity class used to scale an {@link OperationCost}.
 *
 * @since 0.0.0
 * @category models
 */
export type Complexity = "O(1)" | "O(n)" | "O(n log n)" | "O(n^2)";

/**
 * Estimated cost of applying an operation.
 *
 * @since 0.0.0
 * @category models
 */
export interface OperationCost {
  readonly complexity: Complexity;
  readonly estimatedTime: Duration.Duration;
  /** Memory cost in bytes. */
  readonly memoryCost: number;
  /** LLM token cost. */
  readonly tokenCost: number;
}

/**
 * Constructors/combinators for {@link OperationCost}.
 *
 * @example
 * ```ts
 * import { OperationCost } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(OperationCost.scale(OperationCost.zero(), 10))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const OperationCost = {
  zero: (): OperationCost => ({
    complexity: "O(1)",
    estimatedTime: Duration.zero,
    memoryCost: 0,
    tokenCost: 0,
  }),
  scale: (cost: OperationCost, nodeCount: number): OperationCost => {
    const timeMultiplier =
      cost.complexity === "O(1)"
        ? 1
        : cost.complexity === "O(n)"
          ? nodeCount
          : cost.complexity === "O(n log n)"
            ? nodeCount * Math.log2(nodeCount)
            : nodeCount * nodeCount;
    return {
      complexity: cost.complexity,
      estimatedTime: Duration.times(cost.estimatedTime, timeMultiplier),
      memoryCost: cost.memoryCost * nodeCount,
      tokenCost: cost.tokenCost * nodeCount,
    };
  },
};

// =============================================================================
// Validation Result
// =============================================================================

/**
 * Result of validating that an operation can be applied.
 *
 * @since 0.0.0
 * @category models
 */
export interface ValidationResult {
  readonly errors: ReadonlyArray<string>;
  readonly valid: boolean;
  readonly warnings: ReadonlyArray<string>;
}

/**
 * Constructors/combinators for {@link ValidationResult}.
 *
 * @example
 * ```ts
 * import { ValidationResult } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(ValidationResult.valid())
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const ValidationResult = {
  valid: (): ValidationResult => ({ errors: A.empty<string>(), valid: true, warnings: A.empty<string>() }),
  invalid: (errors: ReadonlyArray<string>): ValidationResult => ({ errors, valid: false, warnings: A.empty<string>() }),
  withWarnings: (result: ValidationResult, warnings: ReadonlyArray<string>): ValidationResult => ({
    ...result,
    warnings: A.appendAll(result.warnings, warnings),
  }),
};

// =============================================================================
// Operation Category
// =============================================================================

/**
 * Category of an operation (its morphism shape).
 *
 * @since 0.0.0
 * @category models
 */
export type OperationCategory = "transformation" | "expansion" | "aggregation" | "filtering" | "composition" | "llm";

// =============================================================================
// Execution Options
// =============================================================================

/**
 * Options controlling a single execution.
 *
 * @since 0.0.0
 * @category models
 */
export interface ExecutionOptions {
  readonly cache: boolean;
  readonly strategy: ExecutionStrategy;
  readonly timeout: O.Option<Duration.Duration>;
  readonly trace: boolean;
}

/**
 * Constructors for {@link ExecutionOptions}.
 *
 * @example
 * ```ts
 * import { ExecutionOptions } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(ExecutionOptions.parallel(4))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const ExecutionOptions = {
  default: (): ExecutionOptions => ({
    cache: true,
    strategy: ExecutionStrategy.Sequential,
    timeout: O.none(),
    trace: false,
  }),
  sequential: (): ExecutionOptions => ({ ...ExecutionOptions.default(), strategy: ExecutionStrategy.Sequential }),
  parallel: (concurrency = 4): ExecutionOptions => ({
    ...ExecutionOptions.default(),
    strategy: ExecutionStrategy.Parallel(concurrency),
  }),
};

// =============================================================================
// Execution ID
// =============================================================================

/**
 * Unique identifier for one execution.
 *
 * @since 0.0.0
 * @category models
 */
export type ExecutionId = string & Brand.Brand<"ExecutionId">;

/**
 * Constructor for {@link ExecutionId}.
 *
 * @example
 * ```ts
 * import { makeExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(makeExecutionId("exec-1"))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeExecutionId: Brand.Constructor<ExecutionId> = Brand.nominal<ExecutionId>();

/**
 * Generate a fresh {@link ExecutionId} (timestamp + random suffix).
 *
 * @example
 * ```ts
 * import { generateExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(generateExecutionId)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const generateExecutionId: Effect.Effect<ExecutionId> = Effect.gen(function* () {
  const ms = yield* Clock.currentTimeMillis;
  const rand = yield* Random.nextInt;
  return makeExecutionId(`exec-${ms}-${rand}`);
});

// =============================================================================
// Operation Result
// =============================================================================

/**
 * Result of executing an operation over a graph.
 *
 * @since 0.0.0
 * @category models
 */
export interface OperationResult<B, E> {
  readonly errors: ReadonlyArray<E>;
  readonly executionId: ExecutionId;
  readonly metrics: ExecutionMetrics;
  readonly newNodes: ReadonlyArray<GraphNode<B>>;
  /** Opaque reference to the originating graph. */
  readonly originalGraph: unknown;
  readonly timestamp: number;
}

/**
 * Build an {@link OperationResult} (effectful: reads `Clock` for the timestamp).
 *
 * @example
 * ```ts
 * import { ExecutionMetrics, makeOperationResult, makeExecutionId } from "@beep/nlp/Graph/GraphOperations/Types"
 *
 * console.log(makeOperationResult(makeExecutionId("e"), null, [], [], ExecutionMetrics.empty()))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeOperationResult = <B, E>(
  executionId: ExecutionId,
  originalGraph: unknown,
  newNodes: ReadonlyArray<GraphNode<B>>,
  errors: ReadonlyArray<E>,
  metrics: ExecutionMetrics
): Effect.Effect<OperationResult<B, E>> =>
  Effect.map(
    Clock.currentTimeMillis,
    (timestamp): OperationResult<B, E> => ({ errors, executionId, metrics, newNodes, originalGraph, timestamp })
  );
