/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Graph as Graph_ } from "effect";
import type { GraphKindValue } from "./Graph.shared.ts";

/**
 * Guard for Effect `Graph.Edge` values.
 *
 * @param value - Unknown input to test.
 * @returns `true` when `value` is a `Graph.Edge`.
 * @since 0.0.0
 * @category guards
 */
export const isEdge = <Data>(value: unknown): value is Graph_.Edge<Data> => value instanceof Graph_.Edge;

/**
 * Guard for Effect graph values, including mutable variants.
 *
 * @param value - Unknown input to test.
 * @returns `true` when `value` is an Effect graph.
 * @since 0.0.0
 * @category guards
 */
export const isGraph = <Node, Edge>(
  value: unknown
): value is Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue> =>
  Graph_.isGraph(value);
