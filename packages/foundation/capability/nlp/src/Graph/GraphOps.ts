/**
 * GraphOps - generic categorical operations over `effect/Graph` directed graphs.
 *
 * Structure-preserving and structure-querying operations with mathematical
 * foundations: functorial `mapNodes`/`mapEdges`/`bimap`, monoidal folds, the
 * search adjunction (`query ⊣ index`), effectful traversals, and streaming for
 * large graphs. Graphs form a category whose morphisms are structure-preserving
 * maps; functors preserve identity and composition; the index/query pair is an
 * adjunction.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - type-changing `mapNodes`/`mapEdges`/`bimap`/`mapNodesEffect` RECONSTRUCT the
 *   graph with an old→new index remap (adjunct used `@ts-expect-error` +
 *   `as any` because v4's in-place `Graph.mapNodes` cannot change the node type).
 * - native `Map`/`Set` become `HashMap`/`HashSet` (and `MutableHashMap` for the
 *   local index remap); `Array#push`/`forEach`/`!` become `effect/Array` + folds.
 * - `merge` remaps and copies the second graph's edges (adjunct left edges a TODO).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, O, thunkTrue } from "@beep/utils";
import { Effect, Graph, HashMap, HashSet, MutableHashMap, Stream } from "effect";
import { identity } from "effect/Function";
import * as R from "effect/Record";

const $I = $NlpId.create("Graph/GraphOps");

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * A directed graph with node data `A` and edge data `E`.
 *
 * @since 0.0.0
 * @category models
 */
export type DirectedGraph<A, E> = Graph.DirectedGraph<A, E>;

/**
 * A node index within a graph.
 *
 * @since 0.0.0
 * @category models
 */
export type NodeIndex = Graph.NodeIndex;

/**
 * A graph walker for ordered traversals.
 *
 * @since 0.0.0
 * @category models
 */
export type NodeWalker<A> = Graph.NodeWalker<A>;

/**
 * An immutable search index mapping search keys to node indices, paired with the
 * key-extraction function that produced it (the `index` side of `query ⊣ index`).
 *
 * @since 0.0.0
 * @category models
 */
export interface SearchIndex<K, A> {
  readonly index: HashMap.HashMap<K, ReadonlyArray<NodeIndex>>;
  readonly keyFn: (node: A) => ReadonlyArray<K>;
}

/**
 * Traversal order for ordered folds and walks.
 *
 * @since 0.0.0
 * @category schemas
 */
export const TraversalOrder = LiteralKit(["dfs", "bfs", "topo"]).annotate(
  $I.annote("TraversalOrder", {
    description: "Graph traversal order for ordered folds and walkers.",
  })
);

export type TraversalOrder = typeof TraversalOrder.Type;

// =============================================================================
// Internal: structural reconstruction with index remapping
// =============================================================================

const reconstruct = <A, E, B, F>(
  graph: DirectedGraph<A, E>,
  keepNode: (node: A, index: NodeIndex) => boolean,
  nodeF: (node: A, index: NodeIndex) => B,
  keepEdge: (edge: E) => boolean,
  edgeF: (edge: E) => F
): DirectedGraph<B, F> => {
  const indexMap = MutableHashMap.empty<NodeIndex, NodeIndex>();
  return Graph.directed<B, F>((mutable) => {
    for (const [oldIndex, node] of Graph.nodes(graph)) {
      if (keepNode(node, oldIndex)) {
        MutableHashMap.set(indexMap, oldIndex, Graph.addNode(mutable, nodeF(node, oldIndex)));
      }
    }
    for (const edgeIndex of Graph.indices(graph.pipe(Graph.edges))) {
      O.match(Graph.getEdge(graph, edgeIndex), {
        onNone: () => {},
        onSome: (edge) => {
          if (!keepEdge(edge.data)) return;
          const from = MutableHashMap.get(indexMap, edge.source);
          const to = MutableHashMap.get(indexMap, edge.target);
          if (O.isSome(from) && O.isSome(to)) {
            Graph.addEdge(mutable, from.value, to.value, edgeF(edge.data));
          }
        },
      });
    }
  });
};

const createWalker = <A, E>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder
): NodeWalker<A> => {
  const options = A.length(start) > 0 ? { start: A.fromIterable(start) } : undefined;
  return TraversalOrder.$match(order, {
    bfs: () => Graph.bfs(graph, options),
    dfs: () => Graph.dfs(graph, options),
    topo: () => Graph.topo(graph),
  });
};

// =============================================================================
// Functorial Operations (Structure-Preserving Transformations)
// =============================================================================

/**
 * Map over node data, preserving edges (Functor; obeys identity/composition).
 *
 * @since 0.0.0
 * @category mapping
 */
export const mapNodes = <A, B, E>(graph: DirectedGraph<A, E>, f: (node: A) => B): DirectedGraph<B, E> =>
  reconstruct<A, E, B, E>(graph, thunkTrue, f, thunkTrue, identity);

/**
 * Map over edge data, preserving nodes (Functor).
 *
 * @since 0.0.0
 * @category mapping
 */
export const mapEdges = <A, E, F>(graph: DirectedGraph<A, E>, f: (edge: E) => F): DirectedGraph<A, F> =>
  reconstruct<A, E, A, F>(graph, thunkTrue, identity, thunkTrue, (edge) => f(edge));

/**
 * Map over both node and edge data simultaneously (Bifunctor).
 *
 * @since 0.0.0
 * @category mapping
 */
export const bimap = <A, B, E, F>(
  graph: DirectedGraph<A, E>,
  nodeF: (node: A) => B,
  edgeF: (edge: E) => F
): DirectedGraph<B, F> =>
  reconstruct<A, E, B, F>(
    graph,
    thunkTrue,
    (node) => nodeF(node),
    thunkTrue,
    (edge) => edgeF(edge)
  );

// =============================================================================
// Filtering and Selection
// =============================================================================

/**
 * Keep only nodes matching the predicate; edges touching dropped nodes are removed.
 *
 * @since 0.0.0
 * @category filtering
 */
export const filterNodes = <A, E>(graph: DirectedGraph<A, E>, predicate: (node: A) => boolean): DirectedGraph<A, E> =>
  reconstruct<A, E, A, E>(graph, (node) => predicate(node), identity, thunkTrue, identity);

/**
 * Keep only edges matching the predicate; all nodes are preserved.
 *
 * @since 0.0.0
 * @category filtering
 */
export const filterEdges = <A, E>(graph: DirectedGraph<A, E>, predicate: (edge: E) => boolean): DirectedGraph<A, E> =>
  reconstruct<A, E, A, E>(graph, thunkTrue, identity, (edge) => predicate(edge), identity);

/**
 * Find all node indices whose data matches the predicate.
 *
 * @since 0.0.0
 * @category getters
 */
export const findNodes = <A, E>(
  graph: DirectedGraph<A, E>,
  predicate: (node: A) => boolean
): ReadonlyArray<NodeIndex> => Graph.findNodes(graph, predicate);

// =============================================================================
// Folds and Aggregations (Monoid Homomorphisms)
// =============================================================================

/**
 * Fold over all node data in unspecified order.
 *
 * @since 0.0.0
 * @category folding
 */
export const foldNodes = <A, E, B>(graph: DirectedGraph<A, E>, initial: B, f: (acc: B, node: A) => B): B =>
  A.reduce(A.fromIterable(graph.pipe(Graph.nodes, Graph.values)), initial, (acc, node) => f(acc, node));

/**
 * Fold over node data in a specific traversal order.
 *
 * @since 0.0.0
 * @category folding
 */
export const foldTraversal = <A, E, B>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder,
  initial: B,
  f: (acc: B, node: A, index: NodeIndex) => B
): B =>
  A.reduce(A.fromIterable(Graph.entries(createWalker(graph, start, order))), initial, (acc, [index, node]) =>
    f(acc, node, index)
  );

/**
 * Collect all node data into an array (order unspecified).
 *
 * @since 0.0.0
 * @category getters
 */
export const collectNodes = <A, E>(graph: DirectedGraph<A, E>): ReadonlyArray<A> =>
  A.fromIterable(graph.pipe(Graph.nodes, Graph.values));

/**
 * Collect node data in a traversal order.
 *
 * @since 0.0.0
 * @category getters
 */
export const collectTraversal = <A, E>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder
): ReadonlyArray<A> => foldTraversal(graph, start, order, A.empty<A>(), (acc, node) => A.append(acc, node));

// =============================================================================
// Traversal Utilities
// =============================================================================

/**
 * Root node indices (no incoming edges).
 *
 * @since 0.0.0
 * @category getters
 */
export const getRoots = <A, E>(graph: DirectedGraph<A, E>): ReadonlyArray<NodeIndex> =>
  A.fromIterable(Graph.indices(Graph.externals(graph, { direction: "incoming" })));

/**
 * Leaf node indices (no outgoing edges).
 *
 * @since 0.0.0
 * @category getters
 */
export const getLeaves = <A, E>(graph: DirectedGraph<A, E>): ReadonlyArray<NodeIndex> =>
  A.fromIterable(Graph.indices(Graph.externals(graph, { direction: "outgoing" })));

/**
 * Child node indices of a node.
 *
 * @since 0.0.0
 * @category getters
 */
export const getChildren = <A, E>(graph: DirectedGraph<A, E>, nodeIndex: NodeIndex): ReadonlyArray<NodeIndex> =>
  Graph.neighbors(graph, nodeIndex);

/**
 * Node data at an index, if present.
 *
 * @since 0.0.0
 * @category getters
 */
export const getNode = <A, E>(graph: DirectedGraph<A, E>, nodeIndex: NodeIndex): O.Option<A> =>
  Graph.getNode(graph, nodeIndex);

// =============================================================================
// Search Operations (Adjoint Functors: Query ⊣ Index)
// =============================================================================

/**
 * Build a search index from a graph (the `index` functor of `query ⊣ index`).
 *
 * @since 0.0.0
 * @category queries
 */
export const buildIndex = <A, E, K>(
  graph: DirectedGraph<A, E>,
  keyFn: (node: A) => ReadonlyArray<K>
): SearchIndex<K, A> => {
  const index = A.reduce(
    A.fromIterable(graph.pipe(Graph.nodes, Graph.entries)),
    HashMap.empty<K, ReadonlyArray<NodeIndex>>(),
    (acc, [nodeIndex, node]) =>
      A.reduce(keyFn(node), acc, (map, key) =>
        HashMap.modifyAt(map, key, (existing) =>
          O.match(existing, {
            onNone: () => O.some(A.of(nodeIndex)),
            onSome: (indices) => O.some(A.append(indices, nodeIndex)),
          })
        )
      )
  );
  return { index, keyFn };
};

/**
 * Query a search index for a single key (the `query` functor of `query ⊣ index`).
 *
 * @since 0.0.0
 * @category queries
 */
export const queryIndex = <K, A>(searchIndex: SearchIndex<K, A>, key: K): ReadonlyArray<NodeIndex> =>
  O.getOrElse(HashMap.get(searchIndex.index, key), A.empty<NodeIndex>);

/**
 * Query a search index for any of several keys (union semantics, deduplicated).
 *
 * @since 0.0.0
 * @category queries
 */
export const queryIndexUnion = <K, A>(
  searchIndex: SearchIndex<K, A>,
  keys: ReadonlyArray<K>
): ReadonlyArray<NodeIndex> =>
  A.fromIterable(
    A.reduce(keys, HashSet.empty<NodeIndex>(), (set, key) =>
      A.reduce(queryIndex(searchIndex, key), set, (acc, nodeIndex) => HashSet.add(acc, nodeIndex))
    )
  );

/**
 * Query a search index for all of several keys (intersection semantics).
 *
 * @since 0.0.0
 * @category queries
 */
export const queryIndexIntersection = <K, A>(
  searchIndex: SearchIndex<K, A>,
  keys: ReadonlyArray<K>
): ReadonlyArray<NodeIndex> =>
  O.match(A.head(keys), {
    onNone: A.empty<NodeIndex>,
    onSome: (firstKey) => {
      const firstResults = A.fromIterable(HashSet.fromIterable(queryIndex(searchIndex, firstKey)));
      const restSets = A.map(A.drop(keys, 1), (key) => HashSet.fromIterable(queryIndex(searchIndex, key)));
      return A.filter(firstResults, (nodeIndex) =>
        A.reduce(restSets, true, (ok, set) => ok && HashSet.has(set, nodeIndex))
      );
    },
  });

// =============================================================================
// Effect-Based Operations
// =============================================================================

/**
 * Traverse the graph in order, running an effect per node (effects sequenced).
 *
 * @since 0.0.0
 * @category sequencing
 */
export const traverseNodes = <A, E, R, Err>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder,
  f: (node: A, index: NodeIndex) => Effect.Effect<void, Err, R>
): Effect.Effect<void, Err, R> =>
  Effect.forEach(A.fromIterable(Graph.entries(createWalker(graph, start, order))), ([index, node]) => f(node, index), {
    discard: true,
  });

/**
 * Traverse the graph in order, running an effect per node and collecting results.
 *
 * @since 0.0.0
 * @category sequencing
 */
export const traverseNodesCollect = <A, E, B, Err, R>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder,
  f: (node: A, index: NodeIndex) => Effect.Effect<B, Err, R>
): Effect.Effect<ReadonlyArray<B>, Err, R> =>
  Effect.forEach(A.fromIterable(Graph.entries(createWalker(graph, start, order))), ([index, node]) => f(node, index));

/**
 * Map over node data with an effectful function, returning a new graph.
 *
 * @since 0.0.0
 * @category mapping
 */
export const mapNodesEffect = Effect.fn("mapNodesEffect")(function* <A, B, E, Err, R>(
  graph: DirectedGraph<A, E>,
  f: (node: A, index: NodeIndex) => Effect.Effect<B, Err, R>
): Effect.fn.Return<DirectedGraph<B, E>, Err, R> {
  const pairs = yield* Effect.forEach(A.fromIterable(graph.pipe(Graph.nodes, Graph.entries)), ([index, node]) =>
    Effect.map(f(node, index), (transformed) => [index, transformed] as const)
  );
  const indexMap = MutableHashMap.empty<NodeIndex, NodeIndex>();
  return Graph.directed<B, E>((mutable) => {
    A.forEach(pairs, ([oldIndex, transformed]) => {
      MutableHashMap.set(indexMap, oldIndex, Graph.addNode(mutable, transformed));
    });
    for (const edgeIndex of Graph.indices(graph.pipe(Graph.edges))) {
      O.match(Graph.getEdge(graph, edgeIndex), {
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
});

// =============================================================================
// Streaming Operations
// =============================================================================

/**
 * Stream node data in a traversal order.
 *
 * @since 0.0.0
 * @category streams
 */
export const streamNodes = <A, E>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder
): Stream.Stream<A> => Stream.fromIterable(Graph.values(createWalker(graph, start, order)));

/**
 * Stream `[index, node]` entries in a traversal order.
 *
 * @since 0.0.0
 * @category streams
 */
export const streamNodesWithIndex = <A, E>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder
): Stream.Stream<readonly [NodeIndex, A]> => Stream.fromIterable(Graph.entries(createWalker(graph, start, order)));

/**
 * Stream node data in fixed-size batches.
 *
 * @since 0.0.0
 * @category streams
 */
export const batchNodes = <A, E>(
  graph: DirectedGraph<A, E>,
  start: ReadonlyArray<NodeIndex>,
  order: TraversalOrder,
  batchSize: number
): Stream.Stream<ReadonlyArray<A>> => Stream.grouped(streamNodes(graph, start, order), batchSize);

// =============================================================================
// Graph Properties and Validation
// =============================================================================

/**
 * Whether the graph is acyclic (a DAG).
 *
 * @since 0.0.0
 * @category utilities
 */
export const isAcyclic = <A, E>(graph: DirectedGraph<A, E>): boolean => Graph.isAcyclic(graph);

/**
 * Strongly connected components.
 *
 * @since 0.0.0
 * @category utilities
 */
export const stronglyConnectedComponents = <A, E>(
  graph: DirectedGraph<A, E>
): ReadonlyArray<ReadonlyArray<NodeIndex>> => Graph.stronglyConnectedComponents(graph);

/**
 * Number of nodes.
 *
 * @since 0.0.0
 * @category getters
 */
export const nodeCount = <A, E>(graph: DirectedGraph<A, E>): number => Graph.nodeCount(graph);

/**
 * Number of edges.
 *
 * @since 0.0.0
 * @category getters
 */
export const edgeCount = <A, E>(graph: DirectedGraph<A, E>): number => Graph.edgeCount(graph);

/**
 * Whether the graph has no nodes.
 *
 * @since 0.0.0
 * @category getters
 */
export const isEmpty = <A, E>(graph: DirectedGraph<A, E>): boolean => nodeCount(graph) === 0;

// =============================================================================
// Constructors & Combinators
// =============================================================================

/**
 * Create an empty directed graph.
 *
 * @since 0.0.0
 * @category constructors
 */
export const empty = <A, E>(): DirectedGraph<A, E> => Graph.directed<A, E>();

/**
 * Create a graph with a single node.
 *
 * @since 0.0.0
 * @category constructors
 */
export const singleton = <A, E>(node: A): DirectedGraph<A, E> =>
  Graph.directed<A, E>((mutable) => {
    Graph.addNode(mutable, node);
  });

/**
 * Merge two graphs, copying the second graph's nodes and edges into the first
 * with a fresh index remap (the second graph's indices are reallocated).
 *
 * @since 0.0.0
 * @category combinators
 */
export const merge = <A, E>(g1: DirectedGraph<A, E>, g2: DirectedGraph<A, E>): DirectedGraph<A, E> => {
  const indexMap = MutableHashMap.empty<NodeIndex, NodeIndex>();
  return Graph.mutate(g1, (mutable) => {
    for (const [oldIndex, node] of Graph.nodes(g2)) {
      MutableHashMap.set(indexMap, oldIndex, Graph.addNode(mutable, node));
    }
    for (const edgeIndex of Graph.indices(g2.pipe(Graph.edges))) {
      O.match(Graph.getEdge(g2, edgeIndex), {
        onNone: R.empty,
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
