/**
 * Text-graph IR: node/edge schemas (and, in later increments, the graph engine).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

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
