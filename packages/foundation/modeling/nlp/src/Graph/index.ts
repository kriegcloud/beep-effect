/**
 * Text-graph IR: node/edge schemas (and, in later increments, the graph engine).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Generic categorical operations over `effect/Graph` directed graphs
 * (functorial maps, folds, indexed search, traversals, streaming).
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
