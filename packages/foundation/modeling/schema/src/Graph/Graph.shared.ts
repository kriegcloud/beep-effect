/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import { A, dual, Str } from "@beep/utils";
import { flow, Graph as Graph_, Number as Num, Option, Order, pipe, SchemaIssue } from "effect";
import * as P from "effect/Predicate";
import { LiteralKit } from "../LiteralKit/index.ts";

/**
 * Internal identity composer.
 *
 *
 * @internal
 * @category symbols
 * @since 0.0.0
 */
export const $I = $SchemaId.create("Graph");

/** @internal */
/**
 * Public schema module export.
 *
 * @category type-level
 * @since 0.0.0
 */
export const GraphKindValue = LiteralKit(["directed", "undirected"]).pipe(
  $I.annoteSchema("GraphKindValue", {
    description: "Public schema module export.",
  })
);

/**
 * Companion type for {@link GraphKindValue}
 */
export type GraphKindValue = typeof GraphKindValue.Type;

/** @internal */
/**
 * Public schema module export.
 *
 * @category type-level
 * @since 0.0.0
 */
export type RawEdgeEncoded<Data> = Readonly<{
  readonly source: number;
  readonly target: number;
  readonly data: Data;
}>;

/** @internal */
/**
 * Public schema module export.
 *
 * @category type-level
 * @since 0.0.0
 */
export type RawGraphEncoded<Node, Edge, Kind extends GraphKindValue = GraphKindValue> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [number, Node]>;
  readonly edges: ReadonlyArray<{
    readonly index: number;
    readonly source: number;
    readonly target: number;
    readonly data: Edge;
  }>;
}>;

const nodeEntryOrder = Order.mapInput(Num.Order, ([index]: readonly [number, unknown]) => index);

const edgeEntryOrder = Order.mapInput(Num.Order, (edge: { readonly index: number }) => edge.index);

/** @internal */
/**
 * Public schema module export.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeInvalidGraphIssue = (actual: unknown, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(Option.some(actual), { message });

/** @internal */
/**
 * Public schema module export.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeGraphConstructionIssue = (
  actual: unknown,
  entity: "node" | "edge",
  expected: number,
  received: number
): SchemaIssue.InvalidValue => makeInvalidGraphIssue(actual, `Expected ${entity} index ${expected}, got ${received}`);

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const sortRawNodeEntries = <Node>(
  nodes: RawGraphEncoded<Node, never>["nodes"]
): RawGraphEncoded<Node, never>["nodes"] =>
  flow(
    A.map(([index, node]): readonly [number, Node] => [index, node]),
    A.sort(nodeEntryOrder)
  )(nodes);

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const sortRawEdgeEntries = <Edge>(
  edges: RawGraphEncoded<never, Edge>["edges"]
): RawGraphEncoded<never, Edge>["edges"] => A.sort(edgeEntryOrder)(edges);

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const toRawEdgeEncoded = <Data>(edge: Graph_.Edge<Data>): RawEdgeEncoded<Data> => ({
  source: edge.source,
  target: edge.target,
  data: edge.data,
});

/** @internal */
/**
 * Public schema module export.
 *
 * @category symbols
 * @since 0.0.0
 */
export const toRawGraphEncoded = <Node, Edge, Kind extends GraphKindValue>(
  graph: Graph_.Graph<Node, Edge, Kind> | Graph_.MutableGraph<Node, Edge, Kind>
): RawGraphEncoded<Node, Edge, Kind> => ({
  _tag: "Graph",
  type: graph.type,
  nodes: pipe(
    graph,
    Graph_.nodes,
    Graph_.entries,
    A.fromIterable,
    A.map(([index, node]): readonly [number, Node] => [index, node]),
    A.sort(nodeEntryOrder)
  ),
  edges: pipe(
    graph,
    Graph_.edges,
    Graph_.entries,
    A.fromIterable,
    A.map(([index, edge]) => ({
      index,
      source: edge.source,
      target: edge.target,
      data: edge.data,
    })),
    A.sort(edgeEntryOrder)
  ),
});

/** @internal */
/**
 * Public schema module export.
 *
 * @category formatting
 * @since 0.0.0
 */
export const formatGraph: {
  <Node, Edge, Kind extends GraphKindValue>(
    graph: Graph_.Graph<Node, Edge, Kind> | Graph_.MutableGraph<Node, Edge, Kind>,
    formatNode: (node: Node) => string,
    formatEdge: (edge: Edge) => string
  ): string;
  <Node, Edge, Kind extends GraphKindValue>(
    formatNode: (node: Node) => string,
    formatEdge: (edge: Edge) => string
  ): (graph: Graph_.Graph<Node, Edge, Kind> | Graph_.MutableGraph<Node, Edge, Kind>) => string;
} = dual(
  3,
  <Node, Edge, Kind extends GraphKindValue>(
    graph: Graph_.Graph<Node, Edge, Kind> | Graph_.MutableGraph<Node, Edge, Kind>,
    formatNode: (node: Node) => string,
    formatEdge: (edge: Edge) => string
  ): string => {
    const encoded = toRawGraphEncoded(graph);
    const nodes = pipe(
      encoded.nodes,
      A.map(([index, node]) => `[${index}, ${formatNode(node)}]`),
      A.join(", ")
    );
    const edges = pipe(
      encoded.edges,
      A.map(({ index, source, target, data }) => `[${index}, Edge(${source}, ${target}, ${formatEdge(data)})]`),
      A.join(", ")
    );

    return `Graph.${encoded.type}({ nodes: [${nodes}], edges: [${edges}] })`;
  }
);

/** @internal */
/**
 * Public schema module export.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeGraphEquivalence: {
  <Node, Edge>(
    nodeEquivalence: (self: Node, that: Node) => boolean,
    edgeEquivalence: (self: Edge, that: Edge) => boolean
  ): (
    self: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>,
    that: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>
  ) => boolean;
  <Node, Edge>(
    edgeEquivalence: (self: Edge, that: Edge) => boolean
  ): (
    nodeEquivalence: (self: Node, that: Node) => boolean
  ) => (
    self: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>,
    that: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>
  ) => boolean;
} = dual(
  2,
  <Node, Edge>(
    nodeEquivalence: (self: Node, that: Node) => boolean,
    edgeEquivalence: (self: Edge, that: Edge) => boolean
  ) =>
    (
      self: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>,
      that: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>
    ): boolean => {
      const selfEncoded = toRawGraphEncoded(self);
      const thatEncoded = toRawGraphEncoded(that);

      if (
        selfEncoded.type !== thatEncoded.type ||
        selfEncoded.nodes.length !== thatEncoded.nodes.length ||
        selfEncoded.edges.length !== thatEncoded.edges.length
      ) {
        return false;
      }

      for (const [index, selfNode] of selfEncoded.nodes.entries()) {
        const thatNode = thatEncoded.nodes[index];

        if (thatNode === undefined) {
          return false;
        }

        if (selfNode[0] !== thatNode[0] || !nodeEquivalence(selfNode[1], thatNode[1])) {
          return false;
        }
      }

      for (const [index, selfEdge] of selfEncoded.edges.entries()) {
        const thatEdge = thatEncoded.edges[index];

        if (thatEdge === undefined) {
          return false;
        }

        if (
          selfEdge.index !== thatEdge.index ||
          selfEdge.source !== thatEdge.source ||
          selfEdge.target !== thatEdge.target ||
          !edgeEquivalence(selfEdge.data, thatEdge.data)
        ) {
          return false;
        }
      }

      return true;
    }
);

/** @internal */
/**
 * Public schema module export.
 *
 * @category guards
 * @since 0.0.0
 */
export const isImmutableGraphValue = <Node, Edge>(value: unknown): value is Graph_.Graph<Node, Edge, GraphKindValue> =>
  P.isObject(value) && P.hasProperty("mutable")(value) && value.mutable === false && Graph_.isGraph(value);

/** @internal */
/**
 * Public schema module export.
 *
 * @category guards
 * @since 0.0.0
 */
export const isMutableGraphValue = <Node, Edge>(
  value: unknown
): value is Graph_.MutableGraph<Node, Edge, GraphKindValue> =>
  P.isObject(value) && P.hasProperty("mutable")(value) && value.mutable === true && Graph_.isGraph(value);

/** @internal */
/**
 * Public schema module export.
 *
 * @category formatting
 * @since 0.0.0
 */
export const trimGraphDescription = (value: string): string => Str.trim(value);
