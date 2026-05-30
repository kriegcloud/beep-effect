/**
 * Text-graph IR: node/edge schemas (and, in later increments, the graph engine).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Annotated text graph: structural nodes enriched with linguistic-annotation
 * nodes (POS/entity/lemma/dependency) produced by an `NLPBackend`.
 *
 * @example
 * ```typescript
 * import { AnnotatedTextGraph } from "@beep/nlp/Graph"
 *
 * console.log(AnnotatedTextGraph.empty())
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as AnnotatedTextGraph from "./AnnotatedTextGraph.ts";
/**
 * The categorical text-graph engine (DAG over `effect/Graph` with cata/ana/map).
 *
 * @example
 * ```typescript
 * import { EffectGraph } from "@beep/nlp/Graph"
 *
 * console.log(EffectGraph.empty<string>())
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as EffectGraph from "./EffectGraph.ts";
/**
 * The graph-operation execution engine: operations as graph morphisms, applied
 * to leaf nodes under a strategy with result caching (Errors/Types/Operation/
 * ResultStore/Executor).
 *
 * @example
 * ```typescript
 * import { GraphOperations } from "@beep/nlp/Graph"
 *
 * console.log(GraphOperations.Operation.identity<string>().name)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as GraphOperations from "./GraphOperations/index.ts";
/**
 * Generic categorical operations over `effect/Graph` directed graphs
 * (functorial maps, folds, the search adjunction, traversals, streaming).
 *
 * @example
 * ```typescript
 * import { GraphOps } from "@beep/nlp/Graph"
 *
 * console.log(GraphOps.empty<string, number>())
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as GraphOps from "./GraphOps.ts";
/**
 * Graph node & edge schema classes (the handoff-contract basis).
 *
 * @example
 * ```typescript
 * import { Schema } from "@beep/nlp/Graph"
 *
 * console.log(Schema.TextNode)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as Schema from "./Schema.ts";
/**
 * Categorical type classes for text operations on graphs (Functor/Monad/
 * Traversable/Foldable + the free⊣forgetful adjunction).
 *
 * @example
 * ```typescript
 * import { TypeClass } from "@beep/nlp/Graph"
 *
 * console.log(TypeClass.mapOperation("upper", (s: string) => s.toUpperCase()).name)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as TypeClass from "./TypeClass.ts";
