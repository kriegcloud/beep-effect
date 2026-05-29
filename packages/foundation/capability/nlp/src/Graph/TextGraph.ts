/**
 * TextGraph - text processing over Effect's in-core `effect/Graph`.
 *
 * Builds and manipulates directed graphs of {@link Schema.TextNode} data linked by
 * {@link Schema.TextEdge} relationships, integrating with the package's
 * {@link Tokenization} service for sentence/token extraction.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - node-creating constructors (`singleton`/`fromDocument`/`tokenizeNodes`) are
 *   EFFECTFUL, reading `Clock` for the node timestamp (was `Date.now()`).
 * - `fromDocument`/`tokenizeNodes` consume the existing `Core/Tokenization` service
 *   (mapping `Sentence.text` / `Token.text`) instead of adjunct's separate
 *   `NLPService` - the gap-table "merge" applied inline.
 * - `addChildren` fails with a tagged {@link GraphCycleError} instead of `throw`.
 * - native `Array.from`/`forEach` become `effect/Array`; the `@effect/printer`
 *   formatter is dropped (`show` renders plain text).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { A } from "@beep/utils";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Graph from "effect/Graph";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Tok from "../Core/Tokenization.ts";
import { TextEdge, TextNode } from "./Schema.ts";

const $I = $NlpId.create("Graph/TextGraph");

/**
 * A text-processing graph: `TextNode` data with `TextEdge` relationships.
 *
 * @since 0.0.0
 * @category models
 */
export type TextGraph = Graph.DirectedGraph<TextNode, TextEdge>;

/**
 * Mutable text graph used during construction.
 *
 * @since 0.0.0
 * @category models
 */
export type MutableTextGraph = Graph.MutableDirectedGraph<TextNode, TextEdge>;

/**
 * Raised when adding children would introduce a cycle (graphs must stay acyclic).
 *
 * @example
 * ```ts
 * import { GraphCycleError } from "@beep/nlp/Graph/TextGraph"
 *
 * console.log(GraphCycleError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class GraphCycleError extends TaggedErrorClass<GraphCycleError>($I`GraphCycleError`)(
  "GraphCycleError",
  {
    parentIndex: S.Number,
  },
  $I.annote("GraphCycleError", {
    description: "Raised when a text-graph mutation would create a cycle.",
  })
) {}

const makeTextNode = (fields: {
  readonly text: string;
  readonly type: TextNode["type"];
  readonly operation?: string;
}): Effect.Effect<TextNode> =>
  Effect.map(Clock.currentTimeMillis, (timestamp) =>
    TextNode.make({
      text: fields.text,
      type: fields.type,
      timestamp,
      ...(fields.operation === undefined ? {} : { operation: fields.operation }),
    })
  );

// =============================================================================
// Constructors
// =============================================================================

/**
 * Create an empty text graph.
 *
 * @example
 * ```ts
 * import { empty } from "@beep/nlp/Graph/TextGraph"
 *
 * console.log(empty())
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const empty = (): TextGraph => Graph.directed<TextNode, TextEdge>();

/**
 * Create a text graph with a single root node (effectful: reads `Clock`).
 *
 * @example
 * ```ts
 * import { singleton } from "@beep/nlp/Graph/TextGraph"
 *
 * console.log(singleton("Hello.", "document"))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const singleton = (text: string, type: TextNode["type"]): Effect.Effect<TextGraph> =>
  Effect.map(makeTextNode({ text, type }), (node) =>
    Graph.directed<TextNode, TextEdge>((mutable) => {
      Graph.addNode(mutable, node);
    })
  );

/**
 * Build a text graph from a document by splitting it into sentence children.
 *
 * @example
 * ```ts
 * import { fromDocument } from "@beep/nlp/Graph/TextGraph"
 *
 * console.log(fromDocument("One. Two."))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const fromDocument = (text: string): Effect.Effect<TextGraph, Tok.TokenizationError, Tok.Tokenization> =>
  Effect.gen(function* () {
    const sentenceModels = yield* Tok.sentences(text);
    const docNode = yield* makeTextNode({ text, type: "document", operation: "root" });
    const sentenceNodes = yield* Effect.forEach(sentenceModels, (sentence) =>
      makeTextNode({ text: sentence.text, type: "sentence", operation: "sentencize" })
    );
    return Graph.directed<TextNode, TextEdge>((mutable) => {
      const docIndex = Graph.addNode(mutable, docNode);
      A.forEach(sentenceNodes, (sentenceNode) => {
        const sentenceIndex = Graph.addNode(mutable, sentenceNode);
        Graph.addEdge(mutable, docIndex, sentenceIndex, TextEdge.make({ relation: "contains" }));
      });
    });
  });

// =============================================================================
// Graph Operations
// =============================================================================

/**
 * Add child nodes under a parent, validating the result stays acyclic.
 *
 * @since 0.0.0
 * @category combinators
 */
export const addChildren = (
  graph: TextGraph,
  parentIndex: Graph.NodeIndex,
  children: ReadonlyArray<TextNode>,
  relation: TextEdge["relation"]
): Effect.Effect<TextGraph, GraphCycleError> => {
  const candidate = Graph.mutate(graph, (mutable) => {
    A.forEach(children, (child) => {
      const childIndex = Graph.addNode(mutable, child);
      Graph.addEdge(mutable, parentIndex, childIndex, TextEdge.make({ relation }));
    });
  });
  return Graph.isAcyclic(candidate) ? Effect.succeed(candidate) : Effect.fail(GraphCycleError.make({ parentIndex }));
};

/**
 * Tokenize every sentence node, adding token children (idempotent: skips
 * sentences that already have token children).
 *
 * @since 0.0.0
 * @category combinators
 */
export const tokenizeNodes = (graph: TextGraph): Effect.Effect<TextGraph, Tok.TokenizationError, Tok.Tokenization> =>
  Effect.gen(function* () {
    let result = graph;

    const sentenceEntries = A.getSomes(
      A.map(A.fromIterable(graph.pipe(Graph.nodes, Graph.indices)), (idx) =>
        O.flatMap(Graph.getNode(graph, idx), (node) => (node.type === "sentence" ? O.some({ idx, node }) : O.none()))
      )
    );

    for (const { idx, node } of sentenceEntries) {
      const alreadyTokenized = A.some(getChildren(result, idx), (childIdx) =>
        O.match(Graph.getNode(result, childIdx), {
          onNone: () => false,
          onSome: (childNode) => childNode.type === "token",
        })
      );
      if (alreadyTokenized) continue;

      const tokens = yield* Tok.tokenize(node.text);
      const tokenNodes = yield* Effect.forEach(tokens, (token) =>
        makeTextNode({ text: token.text, type: "token", operation: "tokenize" })
      );
      result = Graph.mutate(result, (mutable) => {
        A.forEach(tokenNodes, (tokenNode) => {
          const tokenIndex = Graph.addNode(mutable, tokenNode);
          Graph.addEdge(mutable, idx, tokenIndex, TextEdge.make({ relation: "contains" }));
        });
      });
    }

    return result;
  });

const rebuild = (
  graph: TextGraph,
  keep: (node: TextNode) => boolean,
  transform: (node: TextNode) => TextNode
): TextGraph => {
  const indexMap = MutableHashMap.empty<Graph.NodeIndex, Graph.NodeIndex>();
  return Graph.directed<TextNode, TextEdge>((mutable) => {
    for (const [oldIdx, node] of Graph.nodes(graph)) {
      if (keep(node)) {
        MutableHashMap.set(indexMap, oldIdx, Graph.addNode(mutable, transform(node)));
      }
    }
    for (const edgeIdx of Graph.indices(graph.pipe(Graph.edges))) {
      O.match(Graph.getEdge(graph, edgeIdx), {
        onNone: () => {},
        onSome: (edge) => {
          const from = MutableHashMap.get(indexMap, edge.source);
          const to = MutableHashMap.get(indexMap, edge.target);
          if (O.isSome(from) && O.isSome(to)) {
            Graph.addEdge(mutable, from.value, to.value, edge.data);
          }
        },
      });
    }
  });
};

/**
 * Map over all node data, preserving structure (reconstructs the graph).
 *
 * @since 0.0.0
 * @category mapping
 */
export const mapNodes = (graph: TextGraph, f: (node: TextNode) => TextNode): TextGraph => rebuild(graph, () => true, f);

/**
 * Keep only nodes matching the predicate (and edges between kept nodes).
 *
 * @since 0.0.0
 * @category filtering
 */
export const filterNodes = (graph: TextGraph, predicate: (node: TextNode) => boolean): TextGraph =>
  rebuild(graph, predicate, (node) => node);

// =============================================================================
// Traversal
// =============================================================================

/**
 * Depth-first node walker.
 *
 * @since 0.0.0
 * @category traversal
 */
export const dfs = (graph: TextGraph, start?: ReadonlyArray<Graph.NodeIndex>): Graph.NodeWalker<TextNode> =>
  Graph.dfs(graph, start !== undefined ? { start: A.fromIterable(start) } : undefined);

/**
 * Breadth-first node walker.
 *
 * @since 0.0.0
 * @category traversal
 */
export const bfs = (graph: TextGraph, start?: ReadonlyArray<Graph.NodeIndex>): Graph.NodeWalker<TextNode> =>
  Graph.bfs(graph, start !== undefined ? { start: A.fromIterable(start) } : undefined);

/**
 * Topological node walker (parents before children).
 *
 * @since 0.0.0
 * @category traversal
 */
export const topo = (graph: TextGraph): Graph.NodeWalker<TextNode> => Graph.topo(graph);

/**
 * All nodes as an array.
 *
 * @since 0.0.0
 * @category getters
 */
export const toArray = (graph: TextGraph): ReadonlyArray<TextNode> =>
  A.fromIterable(graph.pipe(Graph.nodes, Graph.values));

// =============================================================================
// Queries
// =============================================================================

/**
 * Number of nodes.
 *
 * @since 0.0.0
 * @category getters
 */
export const nodeCount = (graph: TextGraph): number => Graph.nodeCount(graph);

/**
 * Number of edges.
 *
 * @since 0.0.0
 * @category getters
 */
export const edgeCount = (graph: TextGraph): number => Graph.edgeCount(graph);

/**
 * Find node indices by node type.
 *
 * @since 0.0.0
 * @category getters
 */
export const findNodesByType = (graph: TextGraph, type: TextNode["type"]): ReadonlyArray<Graph.NodeIndex> =>
  Graph.findNodes(graph, (node) => node.type === type);

/**
 * Root node indices (no incoming edges).
 *
 * @since 0.0.0
 * @category getters
 */
export const getRoots = (graph: TextGraph): ReadonlyArray<Graph.NodeIndex> =>
  A.fromIterable(Graph.indices(Graph.externals(graph, { direction: "incoming" })));

/**
 * Leaf node indices (no outgoing edges).
 *
 * @since 0.0.0
 * @category getters
 */
export const getLeaves = (graph: TextGraph): ReadonlyArray<Graph.NodeIndex> =>
  A.fromIterable(Graph.indices(Graph.externals(graph, { direction: "outgoing" })));

/**
 * Child node indices of a node.
 *
 * @since 0.0.0
 * @category getters
 */
export const getChildren = (graph: TextGraph, nodeIndex: Graph.NodeIndex): ReadonlyArray<Graph.NodeIndex> =>
  Graph.neighbors(graph, nodeIndex);

// =============================================================================
// Visualization & algorithms
// =============================================================================

/**
 * Export the graph to GraphViz DOT format.
 *
 * @since 0.0.0
 * @category formatting
 */
export const toGraphViz = (graph: TextGraph): string =>
  Graph.toGraphViz(graph, {
    nodeLabel: (node) => `${node.type}: ${node.text.slice(0, 30)}...`,
    edgeLabel: (edge) => edge.relation,
    graphName: "TextProcessingGraph",
  });

/**
 * Export the graph to a Mermaid diagram.
 *
 * @since 0.0.0
 * @category formatting
 */
export const toMermaid = (graph: TextGraph): string =>
  Graph.toMermaid(graph, {
    nodeLabel: (node) => `${node.type}: ${node.text.slice(0, 20)}`,
    edgeLabel: (edge) => edge.relation,
    direction: "TB",
    nodeShape: (node) => {
      switch (node.type) {
        case "document":
          return "rounded";
        case "token":
          return "circle";
        default:
          return "rectangle";
      }
    },
  });

/**
 * Render the graph as an indented plain-text tree (roots downward).
 *
 * @since 0.0.0
 * @category formatting
 */
export const show = (graph: TextGraph): string => {
  const lines = A.empty<string>();
  const visit = (nodeIndex: Graph.NodeIndex, indent: number): void => {
    O.match(Graph.getNode(graph, nodeIndex), {
      onNone: () => {},
      onSome: (node) => {
        const op = node.operation ?? "node";
        lines.push(`${"  ".repeat(indent)}[${op}] ${node.type}: ${node.text.slice(0, 40)}`);
        A.forEach(getChildren(graph, nodeIndex), (childIdx) => visit(childIdx, indent + 1));
      },
    });
  };
  A.forEach(getRoots(graph), (rootIdx) => visit(rootIdx, 0));
  return A.join(lines, "\n");
};

/**
 * Whether the graph is acyclic (a DAG).
 *
 * @since 0.0.0
 * @category algorithms
 */
export const isAcyclic = (graph: TextGraph): boolean => Graph.isAcyclic(graph);

/**
 * Strongly connected components.
 *
 * @since 0.0.0
 * @category algorithms
 */
export const stronglyConnectedComponents = (graph: TextGraph): ReadonlyArray<ReadonlyArray<Graph.NodeIndex>> =>
  Graph.stronglyConnectedComponents(graph);
