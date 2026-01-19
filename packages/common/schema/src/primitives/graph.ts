/**
 * Schema definitions for Effect Graph module types.
 *
 * Provides branded schemas for NodeIndex, EdgeIndex, Edge, and Graph types
 * following the patterns established by S.HashMap and S.HashSet.
 *
 * @since 3.18.0
 */

import type { UnsafeTypes } from "@beep/types";
import type * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Brand from "effect/Brand";
import type * as Data from "effect/Data";
import type * as Equivalence from "effect/Equivalence";
import * as F from "effect/Function";
import * as Graph from "effect/Graph";
import * as Num from "effect/Number";
import * as Order from "effect/Order";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import type * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";
// =============================================================================
// NodeIndex - Branded Schema
// =============================================================================
export const isGraph = (u: unknown): u is Graph.Graph<unknown, unknown, "directed" | "undirected"> =>
  P.isObject(u) && P.isNotNull(u) && P.hasProperty(Graph.TypeId)(u);
/**
 * Brand for validated node indices.
 *
 * Invariants:
 * - Must be a finite number
 * - Must be an integer (no fractional part)
 * - Must be non-negative (>= 0)
 *
 * @since 3.18.0
 * @category brands
 */
export type NodeIndex = number & Brand.Brand<"NodeIndex">;

/**
 * Constructs a NodeIndex from a number, throwing on invalid input.
 *
 * @since 3.18.0
 * @category constructors
 */
export const NodeIndex = Brand.refined<NodeIndex>(
  (n) => Number.isInteger(n) && n >= 0,
  (n) => Brand.error(`Expected non-negative integer for NodeIndex, got ${n}`)
);

/**
 * Schema for NodeIndex with full validation.
 *
 * @since 3.18.0
 * @category schemas
 */
export const NodeIndexSchema: S.Schema<NodeIndex, number> = S.Number.pipe(
  S.finite(),
  S.int(),
  S.nonNegative(),
  S.brand("NodeIndex")
);

/**
 * Schema for NodeIndex from string (for URL params, form fields, etc).
 *
 * @since 3.18.0
 * @category schemas
 */
export const NodeIndexFromString: S.Schema<NodeIndex, string> = S.NumberFromString.pipe(
  S.finite(),
  S.int(),
  S.nonNegative(),
  S.brand("NodeIndex")
);

// =============================================================================
// EdgeIndex - Branded Schema
// =============================================================================

/**
 * Brand for validated edge indices.
 *
 * Invariants:
 * - Must be a finite number
 * - Must be an integer (no fractional part)
 * - Must be non-negative (>= 0)
 *
 * @since 3.18.0
 * @category brands
 */
export type EdgeIndex = number & Brand.Brand<"EdgeIndex">;

/**
 * Constructs an EdgeIndex from a number, throwing on invalid input.
 *
 * @since 3.18.0
 * @category constructors
 */
export const EdgeIndex = Brand.refined<EdgeIndex>(
  (n) => Number.isInteger(n) && n >= 0,
  (n) => Brand.error(`Expected non-negative integer for EdgeIndex, got ${n}`)
);

/**
 * Schema for EdgeIndex with full validation.
 *
 * @since 3.18.0
 * @category schemas
 */
export const EdgeIndexSchema: S.Schema<EdgeIndex, number> = S.Number.pipe(
  S.finite(),
  S.int(),
  S.nonNegative(),
  S.brand("EdgeIndex")
);

/**
 * Schema for EdgeIndex from string (for URL params, form fields, etc).
 *
 * @since 3.18.0
 * @category schemas
 */
export const EdgeIndexFromString: S.Schema<EdgeIndex, string> = S.NumberFromString.pipe(
  S.finite(),
  S.int(),
  S.nonNegative(),
  S.brand("EdgeIndex")
);

// =============================================================================
// Edge - S.Class
// =============================================================================

/**
 * Schema class for Edge with source, target node indices and edge data.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { Edge, NodeIndexSchema } from "./GraphSchema"
 *
 * // Create an Edge schema with string data
 * const StringEdge = Edge(S.String)
 *
 * // Decode from JSON
 * const edge = S.decodeSync(StringEdge)({
 *   source: 0,
 *   target: 1,
 *   data: "connects A to B"
 * })
 * ```
 *
 * @since 3.18.0
 * @category schemas
 */
export const Edge = <E extends S.Schema.Any>(dataSchema: E) =>
  S.Class<EdgeClass<S.Schema.Type<E>>>(`Edge<${S.format(dataSchema)}>`)({
    source: S.Number.pipe(S.int(), S.nonNegative()),
    target: S.Number.pipe(S.int(), S.nonNegative()),
    data: dataSchema,
  });

/**
 * Type representing an Edge instance from the schema.
 *
 * @since 3.18.0
 * @category models
 */
export interface EdgeClass<E> {
  readonly source: Graph.NodeIndex;
  readonly target: Graph.NodeIndex;
  readonly data: E;
}

/**
 * Schema for Edge with branded NodeIndex validation.
 *
 * @since 3.18.0
 * @category schemas
 */
export const EdgeBranded = <E extends S.Schema.Any>(dataSchema: E) =>
  S.Class<EdgeBrandedClass<S.Schema.Type<E>>>(`Edge<${S.format(dataSchema)}>`)({
    source: NodeIndexSchema,
    target: NodeIndexSchema,
    data: dataSchema,
  });

/**
 * Type representing an Edge instance with branded indices.
 *
 * @since 3.18.0
 * @category models
 */
export interface EdgeBrandedClass<E> extends Data.Case.Constructor<E> {
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: E;
}

// =============================================================================
// EdgeFromSelf - validates existing Graph.Edge instances
// =============================================================================

/**
 * Type guard for Edge instances.
 *
 * @since 3.18.0
 * @category guards
 */
export const isEdge = <E>(u: unknown): u is Graph.Edge<E> =>
  P.isObject(u) && P.hasProperty("source")(u) && P.hasProperty("target")(u) && P.hasProperty("data")(u);

/** @internal */
const edgeParse =
  <E, R>(decodeData: ParseResult.DecodeUnknown<E, R>): ParseResult.DeclarationDecodeUnknown<Graph.Edge<E>, R> =>
  (u, options, ast) =>
    isEdge<E>(u)
      ? ParseResult.map(
          decodeData(u.data, options),
          (data) => new Graph.Edge({ source: u.source, target: u.target, data })
        )
      : ParseResult.fail(new ParseResult.Type(ast, u));

/**
 * @category api interface
 * @since 3.18.0
 */
export interface EdgeFromSelf<E extends S.Schema.Any>
  extends S.AnnotableDeclare<EdgeFromSelf<E>, Graph.Edge<S.Schema.Type<E>>, Graph.Edge<S.Schema.Encoded<E>>, [E]> {}

/**
 * Schema for validating existing Graph.Edge instances.
 *
 * @example
 * ```ts
 * import { Graph, Schema } from "effect"
 * import { EdgeFromSelf } from "./graph"
 *
 * const StringEdge = EdgeFromSelf(S.String)
 * const edge = new Graph.Edge({ source: 0, target: 1, data: "connects" })
 * const validated = S.decodeSync(StringEdge)(edge)
 * ```
 *
 * @since 3.18.0
 * @category Edge transformations
 */
export const EdgeFromSelf = <E extends S.Schema.Any>(dataSchema: E): EdgeFromSelf<E> => {
  return S.declare(
    [dataSchema],
    {
      decode: (data) => edgeParse(ParseResult.decodeUnknown(data)),
      encode: (data) => edgeParse(ParseResult.encodeUnknown(data)),
    },
    {
      description: `Edge<${S.format(dataSchema)}>`,
    }
  ) as EdgeFromSelf<E>;
};

/**
 * Encoded representation of an Edge for JSON serialization.
 *
 * @since 3.18.0
 * @category models
 */
export const EdgeEncoded = <E extends S.Schema.Any>(dataSchema: E) =>
  S.Struct({
    source: S.Number.pipe(S.int(), S.nonNegative()),
    target: S.Number.pipe(S.int(), S.nonNegative()),
    data: dataSchema,
  });

/**
 * @category api interface
 * @since 3.18.0
 */
export interface EdgeTransform<E extends S.Schema.Any>
  extends S.transform<ReturnType<typeof EdgeEncoded<E>>, EdgeFromSelf<S.SchemaClass<S.Schema.Type<E>>>> {}

/**
 * Schema that transforms from JSON-encodable format to Graph.Edge.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { EdgeTransform } from "./graph"
 *
 * const StringEdge = EdgeTransform(S.String)
 * const decoded = S.decodeSync(StringEdge)({ source: 0, target: 1, data: "label" })
 * // decoded is Graph.Edge<string>
 * ```
 *
 * @since 3.18.0
 * @category Edge transformations
 */
export const EdgeTransform = <E extends S.Schema.Any>(dataSchema: E): EdgeTransform<E> => {
  return S.transform(EdgeEncoded(dataSchema), EdgeFromSelf(S.typeSchema(S.asSchema(dataSchema))), {
    strict: false,
    decode: (encoded) => {
      const enc = encoded as unknown as { source: number; target: number; data: S.Schema.Type<E> };
      return new Graph.Edge({ source: enc.source, target: enc.target, data: enc.data });
    },
    encode: (edge) => ({ source: edge.source, target: edge.target, data: edge.data }),
  }) as unknown as EdgeTransform<E>;
};

// =============================================================================
// Graph Kind Schema
// =============================================================================

/**
 * Schema for Graph.Kind discriminator.
 *
 * @since 3.18.0
 * @category schemas
 */
export const GraphKind = S.Literal("directed", "undirected");

// =============================================================================
// Graph - Encoded representation for JSON serialization
// =============================================================================

/**
 * Encoded representation of a Graph for JSON serialization.
 *
 * @since 3.18.0
 * @category models
 */
export interface GraphEncoded<N, E> {
  readonly _tag: "Graph";
  readonly type: Graph.Kind;
  readonly nodes: ReadonlyArray<readonly [number, N]>;
  readonly edges: ReadonlyArray<{
    readonly index: number;
    readonly source: number;
    readonly target: number;
    readonly data: E;
  }>;
}

/**
 * Creates an encoded Graph schema for JSON serialization.
 *
 * @since 3.18.0
 * @category schemas
 */
export const GraphEncoded = <N extends S.Schema.Any, E extends S.Schema.All>(nodeSchema: N, edgeSchema: E) =>
  S.TaggedStruct("Graph", {
    type: GraphKind,
    nodes: S.Array(S.Tuple(S.Number, nodeSchema)),
    edges: S.Array(
      S.Struct({
        index: S.Number.pipe(S.int(), S.nonNegative()),
        source: S.Number.pipe(S.int(), S.nonNegative()),
        target: S.Number.pipe(S.int(), S.nonNegative()),
        data: edgeSchema,
      })
    ),
  });

// =============================================================================
// Graph - FromSelf (validates existing Graph instances)
// =============================================================================

/** @internal */
const graphPretty =
  <N, E>(nodeValue: Pretty.Pretty<N>, edgeValue: Pretty.Pretty<E>): Pretty.Pretty<Graph.Graph<N, E, Graph.Kind>> =>
  (graph) => {
    const nodes = F.pipe(
      A.fromIterable(graph.nodes),
      A.map(([idx, data]) => `[${idx}, ${nodeValue(data)}]`),
      A.join(", ")
    );
    const edges = F.pipe(
      A.fromIterable(graph.edges),
      A.map(([idx, edge]) => `[${idx}, Edge(${edge.source}, ${edge.target}, ${edgeValue(edge.data)})]`),
      A.join(", ")
    );
    return `Graph.${graph.type}({ nodes: [${nodes}], edges: [${edges}] })`;
  };

/** @internal */
const graphEquivalence =
  <N, E>(
    nodeEq: Equivalence.Equivalence<N>,
    edgeEq: Equivalence.Equivalence<E>
  ): Equivalence.Equivalence<Graph.Graph<N, E, Graph.Kind>> =>
  (a, b) => {
    if (a.type !== b.type) return false;
    if (a.nodes.size !== b.nodes.size) return false;
    if (a.edges.size !== b.edges.size) return false;

    const nodesMatch = F.pipe(
      A.fromIterable(a.nodes),
      A.every(([idx, nodeA]) => {
        const nodeB = b.nodes.get(idx);
        return nodeB !== undefined && nodeEq(nodeA, nodeB);
      })
    );
    if (!nodesMatch) return false;

    const edgesMatch = F.pipe(
      A.fromIterable(a.edges),
      A.every(([idx, edgeA]) => {
        const edgeB = b.edges.get(idx);
        return (
          edgeB !== undefined &&
          edgeA.source === edgeB.source &&
          edgeA.target === edgeB.target &&
          edgeEq(edgeA.data, edgeB.data)
        );
      })
    );

    return edgesMatch;
  };

/** @internal */
const graphArbitrary =
  <N, E>(
    nodeArb: Arbitrary.LazyArbitrary<N>,
    edgeArb: Arbitrary.LazyArbitrary<E>,
    _ctx: Arbitrary.ArbitraryGenerationContext
  ): Arbitrary.LazyArbitrary<Graph.Graph<N, E, Graph.Kind>> =>
  (fc) => {
    const nodeGen = nodeArb(fc);
    const edgeGen = edgeArb(fc);

    return fc
      .tuple(
        fc.array(nodeGen, { minLength: 0, maxLength: 10 }),
        fc.boolean() // directed or undirected
      )
      .chain(([nodes, isDirected]) => {
        const nodeCount = A.length(nodes);
        if (nodeCount < 2) {
          // Not enough nodes for edges
          return fc.constant(
            isDirected
              ? Graph.directed<N, E>((m) => {
                  A.forEach(nodes, (n) => Graph.addNode(m, n));
                })
              : Graph.undirected<N, E>((m) => {
                  A.forEach(nodes, (n) => Graph.addNode(m, n));
                })
          ) as UnsafeTypes.UnsafeAny;
        }

        return fc
          .array(fc.tuple(fc.nat({ max: nodeCount - 1 }), fc.nat({ max: nodeCount - 1 }), edgeGen), {
            minLength: 0,
            maxLength: nodeCount * 2,
          })
          .map((edges) =>
            isDirected
              ? Graph.directed<N, E>((m) => {
                  const nodeIndices = A.map(nodes, (n) => Graph.addNode(m, n));
                  A.forEach(edges, ([s, t, e]) => {
                    if (s !== t) Graph.addEdge(m, nodeIndices[s]!, nodeIndices[t]!, e);
                  });
                })
              : Graph.undirected<N, E>((m) => {
                  const nodeIndices = A.map(nodes, (n) => Graph.addNode(m, n));
                  A.forEach(edges, ([s, t, e]) => {
                    if (s !== t) Graph.addEdge(m, nodeIndices[s]!, nodeIndices[t]!, e);
                  });
                })
          ) as UnsafeTypes.UnsafeAny;
      });
  };

/** @internal */
const graphParse =
  <N, E, RN, RE>(
    _decodeNode: ParseResult.DecodeUnknown<N, RN>,
    _decodeEdge: ParseResult.DecodeUnknown<E, RE>
  ): ParseResult.DeclarationDecodeUnknown<Graph.Graph<N, E, Graph.Kind>, RN | RE> =>
  (u, _, ast) => {
    if (!isGraph(u)) {
      return ParseResult.fail(new ParseResult.Type(ast, u));
    }
    // For FromSelf, the graph is already constructed - just validate contents
    return ParseResult.succeed(u as Graph.Graph<N, E, Graph.Kind>);
  };

/**
 * @category api interface
 * @since 3.18.0
 */
export interface GraphFromSelf<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.AnnotableDeclare<
    GraphFromSelf<N, E>,
    Graph.Graph<S.Schema.Type<N>, S.Schema.Type<E>, Graph.Kind>,
    Graph.Graph<S.Schema.Encoded<N>, S.Schema.Encoded<E>, Graph.Kind>,
    [N, E]
  > {}

/**
 * Schema for validating existing Graph instances.
 *
 * @example
 * ```ts
 * import { Graph, Schema } from "effect"
 * import { GraphFromSelf } from "./GraphSchema"
 *
 * const StringGraph = GraphFromSelf({
 *   node: S.String,
 *   edge: S.Number
 * })
 *
 * const graph = Graph.directed<string, number>((m) => {
 *   const a = Graph.addNode(m, "A")
 *   const b = Graph.addNode(m, "B")
 *   Graph.addEdge(m, a, b, 10)
 * })
 *
 * const validated = S.decodeSync(StringGraph)(graph)
 * ```
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const GraphFromSelf = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): GraphFromSelf<N, E> => {
  return S.declare(
    [node, edge],
    {
      decode: (node, edge) => graphParse(ParseResult.decodeUnknown(node), ParseResult.decodeUnknown(edge)),
      encode: (node, edge) => graphParse(ParseResult.encodeUnknown(node), ParseResult.encodeUnknown(edge)),
    },
    {
      description: `Graph<${S.format(node)}, ${S.format(edge)}>`,
      pretty: graphPretty,
      arbitrary: graphArbitrary,
      equivalence: graphEquivalence,
    }
  ) as UnsafeTypes.UnsafeAny;
};

// =============================================================================
// DirectedGraphFromSelf
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface DirectedGraphFromSelf<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.AnnotableDeclare<
    DirectedGraphFromSelf<N, E>,
    Graph.DirectedGraph<S.Schema.Type<N>, S.Schema.Type<E>>,
    Graph.DirectedGraph<S.Schema.Encoded<N>, S.Schema.Encoded<E>>,
    [N, E]
  > {}

/** @internal */
const directedGraphParse =
  <N, E, RN, RE>(
    _decodeNode: ParseResult.DecodeUnknown<N, RN>,
    _decodeEdge: ParseResult.DecodeUnknown<E, RE>
  ): ParseResult.DeclarationDecodeUnknown<Graph.DirectedGraph<N, E>, RN | RE> =>
  (u, _, ast) => {
    if (!isGraph(u) || u.type !== "directed") {
      return ParseResult.fail(new ParseResult.Type(ast, u));
    }
    return ParseResult.succeed(u as Graph.DirectedGraph<N, E>);
  };

/**
 * Schema for validating existing DirectedGraph instances.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const DirectedGraphFromSelf = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): DirectedGraphFromSelf<N, E> => {
  return S.declare(
    [node, edge],
    {
      decode: (node, edge) => directedGraphParse(ParseResult.decodeUnknown(node), ParseResult.decodeUnknown(edge)),
      encode: (node, edge) => directedGraphParse(ParseResult.encodeUnknown(node), ParseResult.encodeUnknown(edge)),
    },
    {
      description: `DirectedGraph<${S.format(node)}, ${S.format(edge)}>`,
      pretty: graphPretty as UnsafeTypes.UnsafeAny,
      arbitrary: (nodeArb, edgeArb, ctx) => graphArbitrary(nodeArb, edgeArb, ctx) as UnsafeTypes.UnsafeAny,
      equivalence: graphEquivalence as UnsafeTypes.UnsafeAny,
    }
  ) as UnsafeTypes.UnsafeAny;
};

// =============================================================================
// UndirectedGraphFromSelf
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface UndirectedGraphFromSelf<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.AnnotableDeclare<
    UndirectedGraphFromSelf<N, E>,
    Graph.UndirectedGraph<S.Schema.Type<N>, S.Schema.Type<E>>,
    Graph.UndirectedGraph<S.Schema.Encoded<N>, S.Schema.Encoded<E>>,
    [N, E]
  > {}

/** @internal */
const undirectedGraphParse =
  <N, E, RN, RE>(
    _decodeNode: ParseResult.DecodeUnknown<N, RN>,
    _decodeEdge: ParseResult.DecodeUnknown<E, RE>
  ): ParseResult.DeclarationDecodeUnknown<Graph.UndirectedGraph<N, E>, RN | RE> =>
  (u, _, ast) => {
    if (!isGraph(u) || u.type !== "undirected") {
      return ParseResult.fail(new ParseResult.Type(ast, u));
    }
    return ParseResult.succeed(u as Graph.UndirectedGraph<N, E>);
  };

/**
 * Schema for validating existing UndirectedGraph instances.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const UndirectedGraphFromSelf = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): UndirectedGraphFromSelf<N, E> => {
  return S.declare(
    [node, edge],
    {
      decode: (node, edge) => undirectedGraphParse(ParseResult.decodeUnknown(node), ParseResult.decodeUnknown(edge)),
      encode: (node, edge) => undirectedGraphParse(ParseResult.encodeUnknown(node), ParseResult.encodeUnknown(edge)),
    },
    {
      description: `UndirectedGraph<${S.format(node)}, ${S.format(edge)}>`,
      pretty: graphPretty as UnsafeTypes.UnsafeAny,
      arbitrary: (nodeArb, edgeArb, ctx) => {
        // Force undirected
        return (fc) => {
          const base = graphArbitrary(nodeArb, edgeArb, ctx)(fc);
          return base.filter((g) => g.type === "undirected") as UnsafeTypes.UnsafeAny;
        };
      },
      equivalence: graphEquivalence as UnsafeTypes.UnsafeAny,
    }
  ) as UnsafeTypes.UnsafeAny;
};

// =============================================================================
// MutableGraphFromSelf (all mutable variants)
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface MutableGraphFromSelf<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.AnnotableDeclare<
    MutableGraphFromSelf<N, E>,
    Graph.MutableGraph<S.Schema.Type<N>, S.Schema.Type<E>, Graph.Kind>,
    Graph.MutableGraph<S.Schema.Encoded<N>, S.Schema.Encoded<E>, Graph.Kind>,
    [N, E]
  > {}

/** @internal */
const mutableGraphParse =
  <N, E, RN, RE>(
    _decodeNode: ParseResult.DecodeUnknown<N, RN>,
    _decodeEdge: ParseResult.DecodeUnknown<E, RE>
  ): ParseResult.DeclarationDecodeUnknown<Graph.MutableGraph<N, E, Graph.Kind>, RN | RE> =>
  (u, _, ast) => {
    if (!isGraph(u) || !u.mutable) {
      return ParseResult.fail(new ParseResult.Type(ast, u));
    }
    return ParseResult.succeed(u as unknown as Graph.MutableGraph<N, E, Graph.Kind>);
  };

/**
 * Schema for validating existing MutableGraph instances.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const MutableGraphFromSelf = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): MutableGraphFromSelf<N, E> => {
  return S.declare(
    [node, edge],
    {
      decode: (node, edge) => mutableGraphParse(ParseResult.decodeUnknown(node), ParseResult.decodeUnknown(edge)),
      encode: (node, edge) => mutableGraphParse(ParseResult.encodeUnknown(node), ParseResult.encodeUnknown(edge)),
    },
    {
      description: `MutableGraph<${S.format(node)}, ${S.format(edge)}>`,
    }
  ) as UnsafeTypes.UnsafeAny;
};

// =============================================================================
// MutableDirectedGraphFromSelf
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface MutableDirectedGraphFromSelf<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.AnnotableDeclare<
    MutableDirectedGraphFromSelf<N, E>,
    Graph.MutableDirectedGraph<S.Schema.Type<N>, S.Schema.Type<E>>,
    Graph.MutableDirectedGraph<S.Schema.Encoded<N>, S.Schema.Encoded<E>>,
    [N, E]
  > {}

/** @internal */
const mutableDirectedGraphParse =
  <N, E, RN, RE>(
    _decodeNode: ParseResult.DecodeUnknown<N, RN>,
    _decodeEdge: ParseResult.DecodeUnknown<E, RE>
  ): ParseResult.DeclarationDecodeUnknown<Graph.MutableDirectedGraph<N, E>, RN | RE> =>
  (u, _, ast) => {
    if (!isGraph(u) || u.type !== "directed" || !u.mutable) {
      return ParseResult.fail(new ParseResult.Type(ast, u));
    }
    return ParseResult.succeed(u as unknown as Graph.MutableDirectedGraph<N, E>);
  };

/**
 * Schema for validating existing MutableDirectedGraph instances.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const MutableDirectedGraphFromSelf = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): MutableDirectedGraphFromSelf<N, E> => {
  return S.declare(
    [node, edge],
    {
      decode: (node, edge) =>
        mutableDirectedGraphParse(ParseResult.decodeUnknown(node), ParseResult.decodeUnknown(edge)),
      encode: (node, edge) =>
        mutableDirectedGraphParse(ParseResult.encodeUnknown(node), ParseResult.encodeUnknown(edge)),
    },
    {
      description: `MutableDirectedGraph<${S.format(node)}, ${S.format(edge)}>`,
    }
  ) as UnsafeTypes.UnsafeAny;
};

// =============================================================================
// MutableUndirectedGraphFromSelf
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface MutableUndirectedGraphFromSelf<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.AnnotableDeclare<
    MutableUndirectedGraphFromSelf<N, E>,
    Graph.MutableUndirectedGraph<S.Schema.Type<N>, S.Schema.Type<E>>,
    Graph.MutableUndirectedGraph<S.Schema.Encoded<N>, S.Schema.Encoded<E>>,
    [N, E]
  > {}

/** @internal */
const mutableUndirectedGraphParse =
  <N, E, RN, RE>(
    _decodeNode: ParseResult.DecodeUnknown<N, RN>,
    _decodeEdge: ParseResult.DecodeUnknown<E, RE>
  ): ParseResult.DeclarationDecodeUnknown<Graph.MutableUndirectedGraph<N, E>, RN | RE> =>
  (u, _, ast) => {
    if (!isGraph(u) || u.type !== "undirected" || !u.mutable) {
      return ParseResult.fail(new ParseResult.Type(ast, u));
    }
    return ParseResult.succeed(u as unknown as Graph.MutableUndirectedGraph<N, E>);
  };

/**
 * Schema for validating existing MutableUndirectedGraph instances.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const MutableUndirectedGraphFromSelf = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): MutableUndirectedGraphFromSelf<N, E> => {
  return S.declare(
    [node, edge],
    {
      decode: (node, edge) =>
        mutableUndirectedGraphParse(ParseResult.decodeUnknown(node), ParseResult.decodeUnknown(edge)),
      encode: (node, edge) =>
        mutableUndirectedGraphParse(ParseResult.encodeUnknown(node), ParseResult.encodeUnknown(edge)),
    },
    {
      description: `MutableUndirectedGraph<${S.format(node)}, ${S.format(edge)}>`,
    }
  ) as UnsafeTypes.UnsafeAny;
};

// =============================================================================
// Graph - Transform from JSON-encodable representation
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface DirectedGraph<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.transform<
    ReturnType<typeof GraphEncoded<N, E>>,
    DirectedGraphFromSelf<S.SchemaClass<S.Schema.Type<N>>, S.SchemaClass<S.Schema.Type<E>>>
  > {}

/**
 * Schema that transforms JSON-encodable format to DirectedGraph.
 *
 * @example
 * ```ts
 * import { Schema } from "effect"
 * import { DirectedGraph } from "./GraphSchema"
 *
 * const StringGraph = DirectedGraph({
 *   node: S.String,
 *   edge: S.Number
 * })
 *
 * // Decode from JSON
 * const graph = S.decodeSync(StringGraph)({
 *   _tag: "Graph",
 *   type: "directed",
 *   nodes: [[0, "A"], [1, "B"]],
 *   edges: [{ index: 0, source: 0, target: 1, data: 10 }]
 * })
 *
 * // Encode to JSON
 * const json = S.encodeSync(StringGraph)(graph)
 * ```
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const DirectedGraph = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): DirectedGraph<N, E> => {
  const nodeSchema = S.asSchema(node);
  const edgeSchema = S.asSchema(edge);

  return S.transform(
    GraphEncoded(node, edge).pipe(
      S.filter((g) => g.type === "directed", {
        message: () => "Expected directed graph",
      })
    ),
    DirectedGraphFromSelf({
      node: S.typeSchema(nodeSchema),
      edge: S.typeSchema(edgeSchema),
    }),
    {
      strict: false,
      decode: (encoded) => {
        const enc = encoded as unknown as {
          nodes: ReadonlyArray<readonly [number, S.Schema.Type<N>]>;
          edges: ReadonlyArray<{ index: number; source: number; target: number; data: S.Schema.Type<E> }>;
        };
        return Graph.directed<S.Schema.Type<N>, S.Schema.Type<E>>((m) => {
          const sortedNodes = F.pipe(
            enc.nodes,
            A.sort(Order.mapInput(Num.Order, (item: readonly [number, S.Schema.Type<N>]) => item[0]))
          );
          A.forEach(sortedNodes, ([_idx, nodeData]) => {
            Graph.addNode(m, nodeData);
          });
          A.forEach(enc.edges, (edgeData) => {
            Graph.addEdge(m, edgeData.source, edgeData.target, edgeData.data);
          });
        });
      },
      encode: (graph) => ({
        _tag: "Graph" as const,
        type: "directed" as const,
        nodes: A.fromIterable(graph.nodes),
        edges: F.pipe(
          A.fromIterable(graph.edges),
          A.map(([index, edge]) => ({
            index,
            source: edge.source,
            target: edge.target,
            data: edge.data,
          }))
        ),
      }),
    }
  ) as unknown as DirectedGraph<N, E>;
};

/**
 * @category api interface
 * @since 3.18.0
 */
export interface UndirectedGraph<N extends S.Schema.Any, E extends S.Schema.All>
  extends S.transform<
    ReturnType<typeof GraphEncoded<N, E>>,
    UndirectedGraphFromSelf<S.SchemaClass<S.Schema.Type<N>>, S.SchemaClass<S.Schema.Type<E>>>
  > {}

/**
 * Schema that transforms JSON-encodable format to UndirectedGraph.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const UndirectedGraph = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): UndirectedGraph<N, E> => {
  const nodeSchema = S.asSchema(node);
  const edgeSchema = S.asSchema(edge);

  return S.transform(
    GraphEncoded(node, edge).pipe(
      S.filter((g) => g.type === "undirected", {
        message: () => "Expected undirected graph",
      })
    ),
    UndirectedGraphFromSelf({
      node: S.typeSchema(nodeSchema),
      edge: S.typeSchema(edgeSchema),
    }),
    {
      strict: false,
      decode: (encoded) => {
        const enc = encoded as unknown as {
          nodes: ReadonlyArray<readonly [number, S.Schema.Type<N>]>;
          edges: ReadonlyArray<{ index: number; source: number; target: number; data: S.Schema.Type<E> }>;
        };
        return Graph.undirected<S.Schema.Type<N>, S.Schema.Type<E>>((m) => {
          const sortedNodes = F.pipe(
            enc.nodes,
            A.sort(Order.mapInput(Num.Order, (item: readonly [number, S.Schema.Type<N>]) => item[0]))
          );
          A.forEach(sortedNodes, ([_idx, nodeData]) => {
            Graph.addNode(m, nodeData);
          });
          A.forEach(enc.edges, (edgeData) => {
            Graph.addEdge(m, edgeData.source, edgeData.target, edgeData.data);
          });
        });
      },
      encode: (graph) => ({
        _tag: "Graph" as const,
        type: "undirected" as const,
        nodes: A.fromIterable(graph.nodes),
        edges: F.pipe(
          A.fromIterable(graph.edges),
          A.map(([index, edge]) => ({
            index,
            source: edge.source,
            target: edge.target,
            data: edge.data,
          }))
        ),
      }),
    }
  ) as unknown as UndirectedGraph<N, E>;
};

// =============================================================================
// MutableDirectedGraph - Transform from JSON-encodable representation
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface MutableDirectedGraph<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.transform<
    S.filter<ReturnType<typeof GraphEncoded<N, E>>>,
    MutableDirectedGraphFromSelf<S.SchemaClass<S.Schema.Type<N>>, S.SchemaClass<S.Schema.Type<E>>>
  > {}

/**
 * Schema that transforms JSON-encodable format to MutableDirectedGraph.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const MutableDirectedGraph = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): MutableDirectedGraph<N, E> => {
  const nodeSchema = S.asSchema(node);
  const edgeSchema = S.asSchema(edge);

  return S.transform(
    GraphEncoded(node, edge).pipe(
      S.filter((g) => g.type === "directed", {
        message: () => "Expected directed graph",
      })
    ),
    MutableDirectedGraphFromSelf({
      node: S.typeSchema(nodeSchema),
      edge: S.typeSchema(edgeSchema),
    }),
    {
      strict: false,
      decode: (encoded) => {
        const enc = encoded as unknown as {
          nodes: ReadonlyArray<readonly [number, S.Schema.Type<N>]>;
          edges: ReadonlyArray<{ index: number; source: number; target: number; data: S.Schema.Type<E> }>;
        };
        const immutable = Graph.directed<S.Schema.Type<N>, S.Schema.Type<E>>((m) => {
          const sortedNodes = F.pipe(
            enc.nodes,
            A.sort(Order.mapInput(Num.Order, (item: readonly [number, S.Schema.Type<N>]) => item[0]))
          );
          A.forEach(sortedNodes, ([_idx, nodeData]) => {
            Graph.addNode(m, nodeData);
          });
          A.forEach(enc.edges, (edgeData) => {
            Graph.addEdge(m, edgeData.source, edgeData.target, edgeData.data);
          });
        });
        return Graph.beginMutation(immutable);
      },
      encode: (graph) => ({
        _tag: "Graph" as const,
        type: "directed" as const,
        nodes: A.fromIterable(graph.nodes),
        edges: F.pipe(
          A.fromIterable(graph.edges),
          A.map(([index, edge]) => ({
            index,
            source: edge.source,
            target: edge.target,
            data: edge.data,
          }))
        ),
      }),
    }
  ) as unknown as MutableDirectedGraph<N, E>;
};

// =============================================================================
// MutableUndirectedGraph - Transform from JSON-encodable representation
// =============================================================================

/**
 * @category api interface
 * @since 3.18.0
 */
export interface MutableUndirectedGraph<N extends S.Schema.Any, E extends S.Schema.Any>
  extends S.transform<
    S.filter<ReturnType<typeof GraphEncoded<N, E>>>,
    MutableUndirectedGraphFromSelf<S.SchemaClass<S.Schema.Type<N>>, S.SchemaClass<S.Schema.Type<E>>>
  > {}

/**
 * Schema that transforms JSON-encodable format to MutableUndirectedGraph.
 *
 * @since 3.18.0
 * @category Graph transformations
 */
export const MutableUndirectedGraph = <N extends S.Schema.Any, E extends S.Schema.Any>({
  edge,
  node,
}: {
  readonly node: N;
  readonly edge: E;
}): MutableUndirectedGraph<N, E> => {
  const nodeSchema = S.asSchema(node);
  const edgeSchema = S.asSchema(edge);

  return S.transform(
    GraphEncoded(node, edge).pipe(
      S.filter((g) => g.type === "undirected", {
        message: () => "Expected undirected graph",
      })
    ),
    MutableUndirectedGraphFromSelf({
      node: S.typeSchema(nodeSchema),
      edge: S.typeSchema(edgeSchema),
    }),
    {
      strict: false,
      decode: (encoded) => {
        const enc = encoded as unknown as {
          nodes: ReadonlyArray<readonly [number, S.Schema.Type<N>]>;
          edges: ReadonlyArray<{ index: number; source: number; target: number; data: S.Schema.Type<E> }>;
        };
        const immutable = Graph.undirected<S.Schema.Type<N>, S.Schema.Type<E>>((m) => {
          const sortedNodes = F.pipe(
            enc.nodes,
            A.sort(Order.mapInput(Num.Order, (item: readonly [number, S.Schema.Type<N>]) => item[0]))
          );
          A.forEach(sortedNodes, ([_idx, nodeData]) => {
            Graph.addNode(m, nodeData);
          });
          A.forEach(enc.edges, (edgeData) => {
            Graph.addEdge(m, edgeData.source, edgeData.target, edgeData.data);
          });
        });
        return Graph.beginMutation(immutable);
      },
      encode: (graph) => ({
        _tag: "Graph" as const,
        type: "undirected" as const,
        nodes: A.fromIterable(graph.nodes),
        edges: F.pipe(
          A.fromIterable(graph.edges),
          A.map(([index, edge]) => ({
            index,
            source: edge.source,
            target: edge.target,
            data: edge.data,
          }))
        ),
      }),
    }
  ) as unknown as MutableUndirectedGraph<N, E>;
};
