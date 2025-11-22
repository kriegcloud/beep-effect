import type { Graph } from "./Graph.ts";
import * as internal from "./internal/graphviz.ts";

/**
 * Formats the graph in GraphViz DOT language format.
 *
 * @see https://graphviz.org/doc/info/lang.html
 *
 * @since 0.1.0
 * @category combinators
 */
export const toDot: (
  self: Graph.Any,
  config?: {
    readonly nodeIndexLabel?: boolean | undefined;
    readonly edgeIndexLabel?: boolean | undefined;
    readonly edgeNoLabel?: boolean | undefined;
    readonly nodeNoLabel?: boolean | undefined;
    readonly graphContentOnly?: boolean | undefined;
  }
) => string = internal.toDot;
