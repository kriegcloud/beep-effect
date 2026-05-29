/**
 * GraphOperations - the graph-operation execution engine.
 *
 * Operations are morphisms in the category of graphs; the executor applies them
 * to a graph's leaf nodes under a chosen strategy, caching results. The
 * {@link Catalog} provides standard backend-backed + pure operations; the legacy
 * `Schemas` serialization layer is deferred (see the operations-serialization gap).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * The standard catalog of NLP graph operations (backend-backed + pure).
 *
 * @example
 * ```typescript
 * import { Catalog } from "@beep/nlp/Graph/GraphOperations"
 *
 * console.log(Catalog.tokenize.name)
 * ```
 *
 * @since 0.0.0
 * @category catalog
 */
export * as Catalog from "./Catalog.ts";
/**
 * Failures raised during graph-operation execution.
 *
 * @example
 * ```typescript
 * import { Errors } from "@beep/nlp/Graph/GraphOperations"
 *
 * console.log(Errors.ExecutionError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export * as Errors from "./Errors.ts";
/**
 * The graph-operation execution engine (strategies, metrics, caching).
 *
 * @example
 * ```typescript
 * import { Executor } from "@beep/nlp/Graph/GraphOperations"
 *
 * console.log(Executor.GraphExecutor.key)
 * ```
 *
 * @since 0.0.0
 * @category execution
 */
export * as Executor from "./Executor.ts";
/**
 * The core graph-operation abstraction (a morphism over graph nodes).
 *
 * @example
 * ```typescript
 * import { Operation } from "@beep/nlp/Graph/GraphOperations"
 *
 * console.log(Operation.identity<string>().name)
 * ```
 *
 * @since 0.0.0
 * @category operations
 */
export * as Operation from "./Operation.ts";
/**
 * Result caching for graph operations.
 *
 * @example
 * ```typescript
 * import { ResultStore } from "@beep/nlp/Graph/GraphOperations"
 *
 * console.log(ResultStore.ResultStore.key)
 * ```
 *
 * @since 0.0.0
 * @category storage
 */
export * as ResultStore from "./ResultStore.ts";
/**
 * Core value types: strategies, metrics, costs, options, execution ids, results.
 *
 * @example
 * ```typescript
 * import { Types } from "@beep/nlp/Graph/GraphOperations"
 *
 * console.log(Types.ExecutionStrategy.Parallel(4))
 * ```
 *
 * @since 0.0.0
 * @category types
 */
export * as Types from "./Types.ts";
