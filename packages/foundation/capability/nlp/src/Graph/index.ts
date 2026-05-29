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
 * @category graph
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
 * @category graph
 */
export * as EffectGraph from "./EffectGraph.ts";
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
 * @category graph
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
 * @category graph
 */
export * as Schema from "./Schema.ts";
