/**
 * Schemas for Effect `Graph` values and graph-adjacent primitives.
 *
 * @since 0.0.0
 * @module @beep/schema/Graph
 */

import { $SchemaId } from "@beep/identity/packages";
import {
  Effect,
  Graph as Graph_,
  Number as Num,
  Option,
  Order,
  pipe,
  SchemaIssue,
  SchemaParser,
  SchemaTransformation,
} from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { isNonNegative } from "./Number.ts";

const $I = $SchemaId.create("Graph");

type GraphKindValue = "directed" | "undirected";

type RawEdgeEncoded<Data> = Readonly<{
  readonly source: number;
  readonly target: number;
  readonly data: Data;
}>;

type RawGraphEncoded<Node, Edge, Kind extends GraphKindValue = GraphKindValue> = Readonly<{
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

const makeInvalidGraphIssue = (actual: unknown, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(Option.some(actual), { message });

const makeGraphConstructionIssue = (
  actual: unknown,
  entity: "node" | "edge",
  expected: number,
  received: number
): SchemaIssue.InvalidValue => makeInvalidGraphIssue(actual, `Expected ${entity} index ${expected}, got ${received}`);

const sortRawNodeEntries = <Node>(
  nodes: RawGraphEncoded<Node, never>["nodes"]
): RawGraphEncoded<Node, never>["nodes"] =>
  pipe(
    nodes,
    A.map(([index, node]): readonly [number, Node] => [index, node]),
    A.sort(nodeEntryOrder)
  );

const sortRawEdgeEntries = <Edge>(
  edges: RawGraphEncoded<never, Edge>["edges"]
): RawGraphEncoded<never, Edge>["edges"] => pipe(edges, A.sort(edgeEntryOrder));

const toRawEdgeEncoded = <Data>(edge: Graph_.Edge<Data>): RawEdgeEncoded<Data> => ({
  source: edge.source,
  target: edge.target,
  data: edge.data,
});

const toRawGraphEncoded = <Node, Edge, Kind extends GraphKindValue>(
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

const formatGraph = <Node, Edge, Kind extends GraphKindValue>(
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
};

const makeGraphEquivalence =
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

    for (let index = 0; index < selfEncoded.nodes.length; index++) {
      const selfNode = selfEncoded.nodes[index];
      const thatNode = thatEncoded.nodes[index];

      if (selfNode === undefined || thatNode === undefined) {
        return false;
      }

      if (selfNode[0] !== thatNode[0] || !nodeEquivalence(selfNode[1], thatNode[1])) {
        return false;
      }
    }

    for (let index = 0; index < selfEncoded.edges.length; index++) {
      const selfEdge = selfEncoded.edges[index];
      const thatEdge = thatEncoded.edges[index];

      if (selfEdge === undefined || thatEdge === undefined) {
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
  };

const populateMutableGraph = <Node, Edge, Kind extends GraphKindValue>(
  mutable: Graph_.MutableGraph<Node, Edge, Kind>,
  encoded: GraphEncoded<Node, Edge, Kind>,
  actual: unknown
): Effect.Effect<Graph_.MutableGraph<Node, Edge, Kind>, SchemaIssue.Issue> =>
  Effect.gen(function* () {
    for (const [expectedIndex, node] of sortRawNodeEntries(encoded.nodes)) {
      const receivedIndex = Graph_.addNode(mutable, node);

      if (receivedIndex !== expectedIndex) {
        return yield* Effect.fail(makeGraphConstructionIssue(actual, "node", expectedIndex, receivedIndex));
      }
    }

    for (const { index, source, target, data } of sortRawEdgeEntries(encoded.edges)) {
      const receivedIndex = yield* Effect.try({
        try: () => Graph_.addEdge(mutable, source, target, data),
        catch: (cause) =>
          makeInvalidGraphIssue(actual, P.isError(cause) ? cause.message : "Failed to construct graph edge"),
      });

      if (receivedIndex !== index) {
        return yield* Effect.fail(makeGraphConstructionIssue(actual, "edge", index, receivedIndex));
      }
    }

    return mutable;
  });

const rebuildImmutableGraph = <Node, Edge>(
  encoded: GraphEncoded<Node, Edge>,
  actual: unknown,
  expectedType?: GraphKindValue
): Effect.Effect<Graph_.Graph<Node, Edge, GraphKindValue>, SchemaIssue.Issue> => {
  if (expectedType !== undefined && encoded.type !== expectedType) {
    return Effect.fail(makeInvalidGraphIssue(actual, `Expected ${expectedType} graph, got ${encoded.type}`));
  }

  if (encoded.type === "directed") {
    return pipe(
      populateMutableGraph(Graph_.beginMutation(Graph_.directed<Node, Edge>()), encoded, actual),
      Effect.map(Graph_.endMutation)
    );
  }

  return pipe(
    populateMutableGraph(Graph_.beginMutation(Graph_.undirected<Node, Edge>()), encoded, actual),
    Effect.map(Graph_.endMutation)
  );
};

const rebuildMutableGraph = <Node, Edge>(
  encoded: GraphEncoded<Node, Edge>,
  actual: unknown,
  expectedType?: GraphKindValue
): Effect.Effect<Graph_.MutableGraph<Node, Edge, GraphKindValue>, SchemaIssue.Issue> =>
  pipe(rebuildImmutableGraph(encoded, actual, expectedType), Effect.map(Graph_.beginMutation));

const isImmutableGraphValue = <Node, Edge>(value: unknown): value is Graph_.Graph<Node, Edge, GraphKindValue> =>
  P.isObject(value) && P.hasProperty("mutable")(value) && value.mutable === false && Graph_.isGraph(value);

const isMutableGraphValue = <Node, Edge>(value: unknown): value is Graph_.MutableGraph<Node, Edge, GraphKindValue> =>
  P.isObject(value) && P.hasProperty("mutable")(value) && value.mutable === true && Graph_.isGraph(value);

/**
 * Branded schema for graph node indices.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NodeIndex = S.Int.check(isNonNegative).pipe(
  S.brand("NodeIndex"),
  $I.annoteSchema("NodeIndex", {
    description: "A branded non-negative graph node index.",
  })
);

/**
 * Type for {@link NodeIndex}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NodeIndex = typeof NodeIndex.Type;

/**
 * String-backed schema for graph node indices.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NodeIndexFromString = S.NumberFromString.pipe(
  S.decodeTo(NodeIndex),
  $I.annoteSchema("NodeIndexFromString", {
    description: "A graph node index decoded from a string.",
  })
);

/**
 * Branded schema for graph edge indices.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EdgeIndex = S.Int.check(isNonNegative).pipe(
  S.brand("EdgeIndex"),
  $I.annoteSchema("EdgeIndex", {
    description: "A branded non-negative graph edge index.",
  })
);

/**
 * Type for {@link EdgeIndex}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EdgeIndex = typeof EdgeIndex.Type;

/**
 * String-backed schema for graph edge indices.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EdgeIndexFromString = S.NumberFromString.pipe(
  S.decodeTo(EdgeIndex),
  $I.annoteSchema("EdgeIndexFromString", {
    description: "A graph edge index decoded from a string.",
  })
);

/**
 * Schema for graph kind discriminators.
 *
 * @since 0.0.0
 * @category Validation
 */
export const GraphKind = S.Literals(["directed", "undirected"]).pipe(
  $I.annoteSchema("GraphKind", {
    description: "The graph kind discriminator used by Effect Graph values.",
  })
);

/**
 * Type for {@link GraphKind}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GraphKind = typeof GraphKind.Type;

/**
 * Encoded edge representation used by graph codecs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EdgeEncoded<Data> = Readonly<{
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: Data;
}>;

/**
 * Encoded graph representation used by graph codecs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GraphEncoded<Node, Edge, Kind extends GraphKindValue = GraphKindValue> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [NodeIndex, Node]>;
  readonly edges: ReadonlyArray<{
    readonly index: EdgeIndex;
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: Edge;
  }>;
}>;

type EdgeIso<Data extends S.Top> = Readonly<{
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: Data["Iso"];
}>;

type GraphIso<Node extends S.Top, Edge extends S.Top, Kind extends GraphKindValue = GraphKindValue> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [NodeIndex, Node["Iso"]]>;
  readonly edges: ReadonlyArray<{
    readonly index: EdgeIndex;
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: Edge["Iso"];
  }>;
}>;

/**
 * Schema type for encoded graph edges.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface EdgeEncodedSchema<Data extends S.Top>
  extends S.Codec<
    EdgeEncoded<Data["Type"]>,
    EdgeEncoded<Data["Encoded"]>,
    Data["DecodingServices"],
    Data["EncodingServices"]
  > {
  readonly "~rebuild.out": this;
  readonly data: Data;
}

/**
 * Schema type for encoded graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface GraphEncodedSchema<Node extends S.Top, Edge extends S.Top>
  extends S.Codec<
    GraphEncoded<Node["Type"], Edge["Type"]>,
    GraphEncoded<Node["Encoded"], Edge["Encoded"]>,
    Node["DecodingServices"] | Edge["DecodingServices"],
    Node["EncodingServices"] | Edge["EncodingServices"]
  > {
  readonly "~rebuild.out": this;
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Guard for Effect `Graph.Edge` values.
 *
 * @param value - Unknown input to test.
 * @returns `true` when `value` is a `Graph.Edge`.
 * @since 0.0.0
 * @category Guards
 */
export const isEdge = <Data>(value: unknown): value is Graph_.Edge<Data> => value instanceof Graph_.Edge;

/**
 * Guard for Effect graph values, including mutable variants.
 *
 * @param value - Unknown input to test.
 * @returns `true` when `value` is an Effect graph.
 * @since 0.0.0
 * @category Guards
 */
export const isGraph = <Node, Edge>(
  value: unknown
): value is Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue> =>
  Graph_.isGraph(value);

/**
 * Schema for encoded graph edges.
 *
 * @param data - Schema for edge payloads.
 * @returns Schema for the encoded edge representation.
 * @since 0.0.0
 * @category Validation
 */
export const EdgeEncoded = <Data extends S.Top>(data: Data): EdgeEncodedSchema<Data> => {
  const schema = S.Struct({
    source: NodeIndex,
    target: NodeIndex,
    data,
  });

  return S.make<EdgeEncodedSchema<Data>>(schema.ast, { data }).pipe(
    $I.annoteSchema("EdgeEncoded", {
      description: "The encoded representation of an Effect graph edge.",
    })
  );
};

/**
 * Schema for validating existing `Graph.Edge` instances.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface EdgeFromSelf<Data extends S.Top>
  extends S.declareConstructor<
    Graph_.Edge<Data["Type"]>,
    Graph_.Edge<Data["Encoded"]>,
    readonly [Data],
    EdgeIso<Data>
  > {
  readonly data: Data;
}

/**
 * Schema for transforming encoded edge payloads into `Graph.Edge` instances.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface EdgeTransform<Data extends S.Top>
  extends S.decodeTo<EdgeFromSelf<S.toType<Data>>, EdgeEncodedSchema<Data>> {
  readonly "~rebuild.out": this;
  readonly data: Data;
}

/**
 * Schema for graph edges.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface Edge<Data extends S.Top> extends EdgeTransform<Data> {}

/**
 * Schema for validating existing `Graph.Edge` instances while applying the
 * provided payload schema.
 *
 * @param data - Schema for edge payloads.
 * @returns Schema that validates runtime `Graph.Edge` values.
 * @since 0.0.0
 * @category Validation
 */
export const EdgeFromSelf = <Data extends S.Top>(data: Data): EdgeFromSelf<Data> => {
  const schema = S.declareConstructor<Graph_.Edge<Data["Type"]>, Graph_.Edge<Data["Encoded"]>, EdgeIso<Data>>()(
    [data],
    ([data]) => {
      const encoded = EdgeEncoded(data);

      return (input, ast, options) => {
        if (!isEdge(input)) {
          return Effect.fail(new SchemaIssue.InvalidType(ast, Option.some(input)));
        }

        return Effect.flatMap(SchemaParser.decodeUnknownEffect(encoded)(toRawEdgeEncoded(input), options), (edge) =>
          Effect.succeed(
            new Graph_.Edge({
              source: edge.source,
              target: edge.target,
              data: edge.data,
            })
          )
        );
      };
    },
    {
      typeConstructor: {
        _tag: "effect/Graph.Edge",
      },
      generation: {
        runtime: "EdgeFromSelf(?)",
        Type: "Graph.Edge<?>",
        importDeclaration: 'import * as Graph from "effect/Graph"',
      },
      expected: "Graph.Edge",
      description: "Schema for existing Effect graph edges.",
      toEquivalence:
        ([data]) =>
        (self, that) =>
          self.source === that.source && self.target === that.target && data(self.data, that.data),
      toFormatter:
        ([data]) =>
        (edge) =>
          `Edge(${edge.source}, ${edge.target}, ${data(edge.data)})`,
    }
  );

  return S.make<EdgeFromSelf<Data>>(schema.ast, { data }).pipe(
    $I.annoteSchema("EdgeFromSelf", {
      description: "Schema for validating existing Effect graph edge values.",
    })
  );
};

/**
 * Schema that transforms encoded edge objects into `Graph.Edge` instances and
 * encodes them back to the same object shape.
 *
 * @param data - Schema for edge payloads.
 * @returns Edge transform schema.
 * @since 0.0.0
 * @category Validation
 */
export const EdgeTransform = <Data extends S.Top>(data: Data): EdgeTransform<Data> => {
  const decodedEdge = EdgeEncoded(S.toType(data));
  const schema = EdgeEncoded(data).pipe(
    S.decodeTo(
      EdgeFromSelf(S.toType(data)),
      SchemaTransformation.transformOrFail({
        decode: (encoded) =>
          Effect.succeed(
            new Graph_.Edge({
              source: encoded.source,
              target: encoded.target,
              data: encoded.data,
            })
          ),
        encode: (edge, options) => SchemaParser.decodeUnknownEffect(decodedEdge)(toRawEdgeEncoded(edge), options),
      })
    )
  );

  return S.make<EdgeTransform<Data>>(schema.ast, {
    from: schema.from,
    to: schema.to,
    data,
  }).pipe(
    $I.annoteSchema("EdgeTransform", {
      description: "Schema for transforming encoded graph edges into Effect Graph.Edge values.",
    })
  );
};

/**
 * Schema for graph edges. This is an alias of {@link EdgeTransform}.
 *
 * @param data - Schema for edge payloads.
 * @returns Edge schema.
 * @since 0.0.0
 * @category Validation
 */
export const Edge = <Data extends S.Top>(data: Data): Edge<Data> =>
  ((schema) =>
    S.make<Edge<Data>>(schema.ast, {
      from: schema.from,
      to: schema.to,
      data,
    }).pipe(
      $I.annoteSchema("Edge", {
        description: "Schema for Effect graph edges.",
      })
    ))(EdgeTransform(data));

/**
 * Schema for encoded graphs.
 *
 * @param node - Schema for node payloads.
 * @param edge - Schema for edge payloads.
 * @returns Encoded graph schema.
 * @since 0.0.0
 * @category Validation
 */
export const GraphEncoded = <Node extends S.Top, Edge extends S.Top>(
  node: Node,
  edge: Edge
): GraphEncodedSchema<Node, Edge> => {
  const schema = S.TaggedStruct("Graph", {
    type: GraphKind,
    nodes: S.Array(S.Tuple([NodeIndex, node])),
    edges: S.Array(
      S.Struct({
        index: EdgeIndex,
        source: NodeIndex,
        target: NodeIndex,
        data: edge,
      })
    ),
  });

  return S.make<GraphEncodedSchema<Node, Edge>>(schema.ast, { node, edge }).pipe(
    $I.annoteSchema("GraphEncoded", {
      description: "The encoded representation of an Effect graph value.",
    })
  );
};

/**
 * Schema for validating existing immutable Effect graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface GraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.Graph<Node["Type"], Edge["Type"], GraphKindValue>,
    Graph_.Graph<Node["Encoded"], Edge["Encoded"], GraphKindValue>,
    readonly [Node, Edge],
    GraphIso<Node, Edge>
  > {
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for validating existing immutable directed Effect graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface DirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.DirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.DirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "directed">
  > {
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for validating existing immutable undirected Effect graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface UndirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.UndirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.UndirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "undirected">
  > {
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for validating existing mutable Effect graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.MutableGraph<Node["Type"], Edge["Type"], GraphKindValue>,
    Graph_.MutableGraph<Node["Encoded"], Edge["Encoded"], GraphKindValue>,
    readonly [Node, Edge],
    GraphIso<Node, Edge>
  > {
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for validating existing mutable directed Effect graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableDirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.MutableDirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.MutableDirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "directed">
  > {
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for validating existing mutable undirected Effect graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableUndirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.MutableUndirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.MutableUndirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "undirected">
  > {
  readonly edge: Edge;
  readonly node: Node;
}

const makeImmutableGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(
  name: "GraphFromSelf" | "DirectedGraphFromSelf" | "UndirectedGraphFromSelf",
  options: {
    readonly node: Node;
    readonly edge: Edge;
  },
  expectedType?: GraphKindValue
) => {
  return S.declareConstructor<
    Graph_.Graph<Node["Type"], Edge["Type"], GraphKindValue>,
    Graph_.Graph<Node["Encoded"], Edge["Encoded"], GraphKindValue>,
    GraphIso<Node, Edge>
  >()(
    [options.node, options.edge],
    ([node, edge]) => {
      const encoded = GraphEncoded(node, edge);

      return (input, ast, parseOptions) => {
        if (!isImmutableGraphValue(input) || (expectedType !== undefined && input.type !== expectedType)) {
          return Effect.fail(new SchemaIssue.InvalidType(ast, Option.some(input)));
        }

        return Effect.flatMap(
          SchemaParser.decodeUnknownEffect(encoded)(toRawGraphEncoded(input), parseOptions),
          (graph) => rebuildImmutableGraph(graph, input, expectedType)
        );
      };
    },
    {
      typeConstructor: {
        _tag: "effect/Graph",
      },
      generation: {
        runtime: `${name}(?, ?)`,
        Type:
          expectedType === undefined
            ? "Graph.Graph<?, ?, ? extends directed | undirected>"
            : expectedType === "directed"
              ? "Graph.DirectedGraph<?, ?>"
              : "Graph.UndirectedGraph<?, ?>",
        importDeclaration: 'import * as Graph from "effect/Graph"',
      },
      expected: name,
      description: `Schema for existing ${expectedType ?? ""} Effect graph values.`.trim(),
      toEquivalence: ([node, edge]) => makeGraphEquivalence(node, edge),
      toFormatter:
        ([node, edge]) =>
        (graph) =>
          formatGraph(graph, node, edge),
    }
  );
};

const makeMutableGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(
  name: "MutableGraphFromSelf" | "MutableDirectedGraphFromSelf" | "MutableUndirectedGraphFromSelf",
  options: {
    readonly node: Node;
    readonly edge: Edge;
  },
  expectedType?: GraphKindValue
) => {
  return S.declareConstructor<
    Graph_.MutableGraph<Node["Type"], Edge["Type"], GraphKindValue>,
    Graph_.MutableGraph<Node["Encoded"], Edge["Encoded"], GraphKindValue>,
    GraphIso<Node, Edge>
  >()(
    [options.node, options.edge],
    ([node, edge]) => {
      const encoded = GraphEncoded(node, edge);

      return (input, ast, parseOptions) => {
        if (!isMutableGraphValue(input) || (expectedType !== undefined && input.type !== expectedType)) {
          return Effect.fail(new SchemaIssue.InvalidType(ast, Option.some(input)));
        }

        return Effect.flatMap(
          SchemaParser.decodeUnknownEffect(encoded)(toRawGraphEncoded(input), parseOptions),
          (graph) => rebuildMutableGraph(graph, input, expectedType)
        );
      };
    },
    {
      typeConstructor: {
        _tag: "effect/Graph.MutableGraph",
      },
      generation: {
        runtime: `${name}(?, ?)`,
        Type:
          expectedType === undefined
            ? "Graph.MutableGraph<?, ?, ? extends directed | undirected>"
            : expectedType === "directed"
              ? "Graph.MutableDirectedGraph<?, ?>"
              : "Graph.MutableUndirectedGraph<?, ?>",
        importDeclaration: 'import * as Graph from "effect/Graph"',
      },
      expected: name,
      description: `Schema for existing mutable ${expectedType ?? ""} Effect graph values.`.trim(),
      toEquivalence: ([node, edge]) => makeGraphEquivalence(node, edge),
      toFormatter:
        ([node, edge]) =>
        (graph) =>
          formatGraph(graph, node, edge),
    }
  );
};

/**
 * Schema for validating existing immutable Effect graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Immutable graph validator schema.
 * @since 0.0.0
 * @category Validation
 */
export const GraphFromSelf = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): GraphFromSelf<Node, Edge> =>
  S.make<GraphFromSelf<Node, Edge>>(makeImmutableGraphFromSelf("GraphFromSelf", options).ast, options).pipe(
    $I.annoteSchema("GraphFromSelf", {
      description: "Schema for validating existing immutable Effect graph values.",
    })
  );

/**
 * Schema for validating existing immutable directed Effect graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Immutable directed graph validator schema.
 * @since 0.0.0
 * @category Validation
 */
export const DirectedGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): DirectedGraphFromSelf<Node, Edge> =>
  S.make<DirectedGraphFromSelf<Node, Edge>>(
    makeImmutableGraphFromSelf("DirectedGraphFromSelf", options, "directed").ast,
    options
  ).pipe(
    $I.annoteSchema("DirectedGraphFromSelf", {
      description: "Schema for validating existing immutable directed Effect graph values.",
    })
  );

/**
 * Schema for validating existing immutable undirected Effect graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Immutable undirected graph validator schema.
 * @since 0.0.0
 * @category Validation
 */
export const UndirectedGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): UndirectedGraphFromSelf<Node, Edge> =>
  S.make<UndirectedGraphFromSelf<Node, Edge>>(
    makeImmutableGraphFromSelf("UndirectedGraphFromSelf", options, "undirected").ast,
    options
  ).pipe(
    $I.annoteSchema("UndirectedGraphFromSelf", {
      description: "Schema for validating existing immutable undirected Effect graph values.",
    })
  );

/**
 * Schema for validating existing mutable Effect graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Mutable graph validator schema.
 * @since 0.0.0
 * @category Validation
 */
export const MutableGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): MutableGraphFromSelf<Node, Edge> =>
  S.make<MutableGraphFromSelf<Node, Edge>>(makeMutableGraphFromSelf("MutableGraphFromSelf", options).ast, options).pipe(
    $I.annoteSchema("MutableGraphFromSelf", {
      description: "Schema for validating existing mutable Effect graph values.",
    })
  );

/**
 * Schema for validating existing mutable directed Effect graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Mutable directed graph validator schema.
 * @since 0.0.0
 * @category Validation
 */
export const MutableDirectedGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): MutableDirectedGraphFromSelf<Node, Edge> =>
  S.make<MutableDirectedGraphFromSelf<Node, Edge>>(
    makeMutableGraphFromSelf("MutableDirectedGraphFromSelf", options, "directed").ast,
    options
  ).pipe(
    $I.annoteSchema("MutableDirectedGraphFromSelf", {
      description: "Schema for validating existing mutable directed Effect graph values.",
    })
  );

/**
 * Schema for validating existing mutable undirected Effect graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Mutable undirected graph validator schema.
 * @since 0.0.0
 * @category Validation
 */
export const MutableUndirectedGraphFromSelf = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): MutableUndirectedGraphFromSelf<Node, Edge> =>
  S.make<MutableUndirectedGraphFromSelf<Node, Edge>>(
    makeMutableGraphFromSelf("MutableUndirectedGraphFromSelf", options, "undirected").ast,
    options
  ).pipe(
    $I.annoteSchema("MutableUndirectedGraphFromSelf", {
      description: "Schema for validating existing mutable undirected Effect graph values.",
    })
  );

/**
 * Schema for decoding encoded graph payloads into immutable directed graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface DirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<DirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly "~rebuild.out": this;
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for decoding encoded graph payloads into immutable undirected graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface UndirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<UndirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly "~rebuild.out": this;
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for decoding encoded graph payloads into mutable directed graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableDirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<MutableDirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly "~rebuild.out": this;
  readonly edge: Edge;
  readonly node: Node;
}

/**
 * Schema for decoding encoded graph payloads into mutable undirected graphs.
 *
 * @since 0.0.0
 * @category Validation
 */
export interface MutableUndirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<MutableUndirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly "~rebuild.out": this;
  readonly edge: Edge;
  readonly node: Node;
}

const makeGraphTransform = <Node extends S.Top, Edge extends S.Top>(
  options: {
    readonly node: Node;
    readonly edge: Edge;
  },
  mutable: boolean,
  expectedType: GraphKindValue
) => {
  const decodedGraph = GraphEncoded(S.toType(options.node), S.toType(options.edge));

  if (mutable) {
    const target =
      expectedType === "directed"
        ? MutableDirectedGraphFromSelf({
            node: S.toType(options.node),
            edge: S.toType(options.edge),
          })
        : MutableUndirectedGraphFromSelf({
            node: S.toType(options.node),
            edge: S.toType(options.edge),
          });

    return GraphEncoded(options.node, options.edge).pipe(
      S.decodeTo(
        target,
        SchemaTransformation.transformOrFail({
          decode: (encoded) => rebuildMutableGraph(encoded, encoded, expectedType),
          encode: (graph, parseOptions) =>
            SchemaParser.decodeUnknownEffect(decodedGraph)(toRawGraphEncoded(graph), parseOptions),
        })
      )
    );
  }

  const target =
    expectedType === "directed"
      ? DirectedGraphFromSelf({
          node: S.toType(options.node),
          edge: S.toType(options.edge),
        })
      : UndirectedGraphFromSelf({
          node: S.toType(options.node),
          edge: S.toType(options.edge),
        });

  return GraphEncoded(options.node, options.edge).pipe(
    S.decodeTo(
      target,
      SchemaTransformation.transformOrFail({
        decode: (encoded) => rebuildImmutableGraph(encoded, encoded, expectedType),
        encode: (graph, parseOptions) =>
          SchemaParser.decodeUnknownEffect(decodedGraph)(toRawGraphEncoded(graph), parseOptions),
      })
    )
  );
};

/**
 * Schema for immutable directed graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Directed graph transform schema.
 * @since 0.0.0
 * @category Validation
 */
export const DirectedGraph = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): DirectedGraph<Node, Edge> =>
  ((schema) =>
    S.make<DirectedGraph<Node, Edge>>(schema.ast, {
      from: schema.from,
      to: schema.to,
      node: options.node,
      edge: options.edge,
    }).pipe(
      $I.annoteSchema("DirectedGraph", {
        description: "Schema for decoding encoded directed graph payloads into immutable Effect graph values.",
      })
    ))(makeGraphTransform(options, false, "directed"));

/**
 * Schema for immutable undirected graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Undirected graph transform schema.
 * @since 0.0.0
 * @category Validation
 */
export const UndirectedGraph = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): UndirectedGraph<Node, Edge> =>
  ((schema) =>
    S.make<UndirectedGraph<Node, Edge>>(schema.ast, {
      from: schema.from,
      to: schema.to,
      node: options.node,
      edge: options.edge,
    }).pipe(
      $I.annoteSchema("UndirectedGraph", {
        description: "Schema for decoding encoded undirected graph payloads into immutable Effect graph values.",
      })
    ))(makeGraphTransform(options, false, "undirected"));

/**
 * Schema for mutable directed graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Mutable directed graph transform schema.
 * @since 0.0.0
 * @category Validation
 */
export const MutableDirectedGraph = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): MutableDirectedGraph<Node, Edge> =>
  ((schema) =>
    S.make<MutableDirectedGraph<Node, Edge>>(schema.ast, {
      from: schema.from,
      to: schema.to,
      node: options.node,
      edge: options.edge,
    }).pipe(
      $I.annoteSchema("MutableDirectedGraph", {
        description: "Schema for decoding encoded directed graph payloads into mutable Effect graph values.",
      })
    ))(makeGraphTransform(options, true, "directed"));

/**
 * Schema for mutable undirected graphs.
 *
 * @param options - Schemas for node and edge payloads.
 * @returns Mutable undirected graph transform schema.
 * @since 0.0.0
 * @category Validation
 */
export const MutableUndirectedGraph = <Node extends S.Top, Edge extends S.Top>(options: {
  readonly node: Node;
  readonly edge: Edge;
}): MutableUndirectedGraph<Node, Edge> =>
  ((schema) =>
    S.make<MutableUndirectedGraph<Node, Edge>>(schema.ast, {
      from: schema.from,
      to: schema.to,
      node: options.node,
      edge: options.edge,
    }).pipe(
      $I.annoteSchema("MutableUndirectedGraph", {
        description: "Schema for decoding encoded undirected graph payloads into mutable Effect graph values.",
      })
    ))(makeGraphTransform(options, true, "undirected"));
