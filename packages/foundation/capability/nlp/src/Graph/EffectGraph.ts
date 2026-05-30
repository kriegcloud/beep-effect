/**
 * EffectGraph - a categorical approach to text processing as graph transformations.
 *
 * Models text processing as morphisms in a category where objects are nodes in a
 * directed acyclic graph and morphisms are operations that transform nodes
 * (potentially creating children). Composition preserves the DAG property.
 *
 * Theoretical foundations: catamorphism (bottom-up fold), F-algebra (`F a -> a`),
 * and adjunctions (operations as adjoint functors). Built on Effect's in-core
 * `effect/Graph` module.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - `makeNode`/`singleton`/`ana` are EFFECTFUL (read `Clock` for the timestamp and an
 *   `effect/Random`-based id generator) instead of calling `Date.now()` +
 *   `crypto.randomUUID()` inline, both of which are repo-law violations.
 * - `NodeId` is a `Brand.nominal` branded string (no `as`).
 * - native `Map`/`Set` become `MutableHashMap`/`MutableHashSet`; native array methods
 *   become `effect/Array`; partial `getOrThrow`/`!` become `Option` handling.
 * - `Data.TaggedError` becomes `TaggedErrorClass` from `@beep/schema`.
 * - the terminal `Formatter` (which depended on the dropped `@effect/printer`) is gone;
 *   `show` renders the plain-text tree.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { A } from "@beep/utils";
import { Brand, Clock, Effect, Graph, HashMap, MutableHashMap, MutableHashSet, Random } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $NlpId.create("Graph/EffectGraph");

// =============================================================================
// Core Data Types
// =============================================================================

/**
 * Unique identifier for graph nodes.
 *
 * @example
 * ```ts
 * import type { NodeId } from "@beep/nlp/Graph/EffectGraph"
 *
 * type Example = NodeId
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type NodeId = string & Brand.Brand<"NodeId">;

/**
 * Constructor for {@link NodeId}.
 *
 * @example
 * ```ts
 * import { makeNodeId } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(makeNodeId("node-1"))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeNodeId: Brand.Constructor<NodeId> = Brand.nominal<NodeId>();

/**
 * Generate a fresh, unique {@link NodeId} (timestamp + random suffix).
 *
 * @example
 * ```ts
 * import { generateNodeId } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(generateNodeId)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const generateNodeId: Effect.Effect<NodeId> = Effect.gen(function* () {
  const ms = yield* Clock.currentTimeMillis;
  const rand = yield* Random.nextInt;
  return makeNodeId(`node-${ms}-${rand}`);
});

/**
 * Error raised when a node is not found in the graph.
 *
 * @example
 * ```ts
 * import { NodeNotFoundError } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(NodeNotFoundError)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class NodeNotFoundError extends TaggedErrorClass<NodeNotFoundError>($I`NodeNotFoundError`)(
  "NodeNotFoundError",
  {
    nodeId: S.String,
  },
  $I.annote("NodeNotFoundError", {
    description: "Raised when a graph node id cannot be resolved during traversal.",
  })
) {}

/**
 * Per-node processing metadata.
 *
 * @since 0.0.0
 * @category models
 */
export interface NodeMetadata {
  readonly depth: number;
  readonly operation: O.Option<string>;
  readonly timestamp: number;
}

/**
 * A node in the directed acyclic graph: an id, a data payload, an optional parent
 * reference, and processing metadata.
 *
 * @since 0.0.0
 * @category models
 */
export interface GraphNode<A> {
  readonly data: A;
  readonly id: NodeId;
  readonly metadata: NodeMetadata;
  readonly parentId: O.Option<NodeId>;
}

interface GraphEdge {
  readonly relation: "child";
}

/**
 * A directed acyclic graph of {@link GraphNode}s, backed by `effect/Graph` with
 * id<->index mappings maintained alongside.
 *
 * @since 0.0.0
 * @category models
 */
export interface EffectGraph<A> {
  readonly graph: Graph.DirectedGraph<GraphNode<A>, GraphEdge>;
  readonly indexToNodeId: HashMap.HashMap<Graph.NodeIndex, NodeId>;
  readonly nodeIdToIndex: HashMap.HashMap<NodeId, Graph.NodeIndex>;
}

// =============================================================================
// Constructors
// =============================================================================

/**
 * Create a new {@link GraphNode} (effectful: reads `Clock` + a random id).
 *
 * @example
 * ```ts
 * import { makeNode } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(makeNode("hello"))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeNode = <A>(
  data: A,
  parentId: O.Option<NodeId> = O.none(),
  operation: O.Option<string> = O.none()
): Effect.Effect<GraphNode<A>> =>
  Effect.gen(function* () {
    const timestamp = yield* Clock.currentTimeMillis;
    const id = yield* generateNodeId;
    return {
      id,
      data,
      parentId,
      metadata: {
        operation,
        timestamp,
        // recalculated when added to a graph under a parent
        depth: O.match(parentId, { onNone: () => 0, onSome: () => 1 }),
      },
    };
  });

/**
 * Create an empty {@link EffectGraph}.
 *
 * @example
 * ```ts
 * import { empty } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(empty<string>())
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const empty = <A>(): EffectGraph<A> => ({
  graph: Graph.directed<GraphNode<A>, GraphEdge>(),
  nodeIdToIndex: HashMap.empty(),
  indexToNodeId: HashMap.empty(),
});

/**
 * Create an {@link EffectGraph} with a single root node (effectful via {@link makeNode}).
 *
 * @example
 * ```ts
 * import { singleton } from "@beep/nlp/Graph/EffectGraph"
 *
 * console.log(singleton("root"))
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const singleton = <A>(data: A): Effect.Effect<EffectGraph<A>> =>
  Effect.gen(function* () {
    const node = yield* makeNode(data);
    let nodeIndex: O.Option<Graph.NodeIndex> = O.none();
    const graph = Graph.directed<GraphNode<A>, GraphEdge>((mutable) => {
      nodeIndex = O.some(Graph.addNode(mutable, node));
    });
    return O.match(nodeIndex, {
      onNone: () => empty<A>(),
      onSome: (idx) => ({
        graph,
        nodeIdToIndex: HashMap.make([node.id, idx]),
        indexToNodeId: HashMap.make([idx, node.id]),
      }),
    });
  });

// =============================================================================
// Graph Operations
// =============================================================================

/**
 * Add a node to the graph, recalculating its depth from its parent and linking
 * the parent->child edge when a parent is present.
 *
 * @since 0.0.0
 * @category combinators
 */
export const addNode = <A>(effectGraph: EffectGraph<A>, node: GraphNode<A>): EffectGraph<A> => {
  // Recalculate depth from the parent (pure: takes a pre-made node).
  const updatedNode: GraphNode<A> = O.match(node.parentId, {
    onNone: () => node,
    onSome: (parentId) => {
      const parentNode = O.flatMap(HashMap.get(effectGraph.nodeIdToIndex, parentId), (idx) =>
        Graph.getNode(effectGraph.graph, idx)
      );
      const parentDepth = O.match(parentNode, {
        onNone: () => 0,
        onSome: (p) => p.metadata.depth,
      });
      return { ...node, metadata: { ...node.metadata, depth: parentDepth + 1 } };
    },
  });

  let newNodeIndex: O.Option<Graph.NodeIndex> = O.none();
  const newGraph = Graph.mutate(effectGraph.graph, (mutable) => {
    const nodeIndex = Graph.addNode(mutable, updatedNode);
    newNodeIndex = O.some(nodeIndex);
    O.match(node.parentId, {
      onNone: () => {},
      onSome: (parentId) =>
        O.match(HashMap.get(effectGraph.nodeIdToIndex, parentId), {
          onNone: () => {},
          onSome: (pIdx) => {
            Graph.addEdge(mutable, pIdx, nodeIndex, { relation: "child" });
          },
        }),
    });
  });

  return O.match(newNodeIndex, {
    onNone: () => effectGraph,
    onSome: (idx) => ({
      graph: newGraph,
      nodeIdToIndex: HashMap.set(effectGraph.nodeIdToIndex, updatedNode.id, idx),
      indexToNodeId: HashMap.set(effectGraph.indexToNodeId, idx, updatedNode.id),
    }),
  });
};

/**
 * Get a node by id.
 *
 * @since 0.0.0
 * @category getters
 */
export const getNode = <A>(graph: EffectGraph<A>, nodeId: NodeId): O.Option<GraphNode<A>> =>
  O.flatMap(HashMap.get(graph.nodeIdToIndex, nodeId), (idx) => Graph.getNode(graph.graph, idx));

/**
 * Get all children of a node.
 *
 * @since 0.0.0
 * @category getters
 */
export const getChildren = <A>(graph: EffectGraph<A>, nodeId: NodeId): ReadonlyArray<GraphNode<A>> =>
  O.match(HashMap.get(graph.nodeIdToIndex, nodeId), {
    onNone: () => A.empty<GraphNode<A>>(),
    onSome: (idx) =>
      A.getSomes(A.map(Graph.neighbors(graph.graph, idx), (childIdx) => Graph.getNode(graph.graph, childIdx))),
  });

/**
 * Get all root nodes (those with no incoming edges).
 *
 * @since 0.0.0
 * @category getters
 */
export const getRoots = <A>(graph: EffectGraph<A>): ReadonlyArray<GraphNode<A>> =>
  A.getSomes(
    A.map(A.fromIterable(Graph.indices(Graph.externals(graph.graph, { direction: "incoming" }))), (idx) =>
      Graph.getNode(graph.graph, idx)
    )
  );

// =============================================================================
// Catamorphism / Anamorphism
// =============================================================================

/**
 * F-algebra: collapse a node and its already-processed children into a result.
 *
 * @since 0.0.0
 * @category models
 */
export type GraphAlgebra<A, B> = (node: GraphNode<A>, children: ReadonlyArray<B>) => B;

/**
 * Catamorphism: bottom-up fold over the graph (children before parents).
 *
 * @since 0.0.0
 * @category folding
 */
export const cata = <A, B>(
  graph: EffectGraph<A>,
  algebra: GraphAlgebra<A, B>
): Effect.Effect<ReadonlyArray<B>, NodeNotFoundError> => {
  const memo = MutableHashMap.empty<NodeId, B>();

  const go = (nodeId: NodeId): Effect.Effect<B, NodeNotFoundError> =>
    Effect.gen(function* () {
      const cached = MutableHashMap.get(memo, nodeId);
      if (O.isSome(cached)) {
        return cached.value;
      }
      const node = yield* O.match(getNode(graph, nodeId), {
        onNone: () => Effect.fail(NodeNotFoundError.make({ nodeId })),
        onSome: (n) => Effect.succeed(n),
      });
      // children first (bottom-up); sequential to bound memory on deep graphs
      const processedChildren = yield* Effect.all(
        A.map(getChildren(graph, nodeId), (child) => go(child.id)),
        { concurrency: 1 }
      );
      const result = algebra(node, processedChildren);
      MutableHashMap.set(memo, nodeId, result);
      return result;
    });

  return Effect.all(
    A.map(getRoots(graph), (root) => go(root.id)),
    { concurrency: 1 }
  );
};

/**
 * Coalgebra: from a seed, produce node data and child seeds.
 *
 * @since 0.0.0
 * @category models
 */
export type GraphCoalgebra<A, B> = (seed: B) => Effect.Effect<readonly [A, ReadonlyArray<B>]>;

/**
 * Anamorphism: top-down unfold building a graph from a seed (dual of {@link cata}).
 *
 * @since 0.0.0
 * @category folding
 */
export const ana = <A, B>(seed: B, coalgebra: GraphCoalgebra<A, B>): Effect.Effect<EffectGraph<A>> =>
  Effect.gen(function* () {
    let graph = empty<A>();

    const go = (currentSeed: B, parentId: O.Option<NodeId>): Effect.Effect<NodeId> =>
      Effect.gen(function* () {
        const [data, childSeeds] = yield* coalgebra(currentSeed);
        const node = yield* makeNode(data, parentId);
        graph = addNode(graph, node);
        yield* Effect.all(
          A.map(childSeeds, (childSeed) => go(childSeed, O.some(node.id))),
          { concurrency: 1 }
        );
        return node.id;
      });

    yield* go(seed, O.none());
    return graph;
  });

// =============================================================================
// Functor / utilities
// =============================================================================

/**
 * Map over all node data, preserving graph structure (the Functor instance).
 *
 * @since 0.0.0
 * @category mapping
 */
export const map = <A, B>(graph: EffectGraph<A>, f: (a: A) => B): EffectGraph<B> => {
  const nodeMap = MutableHashMap.empty<NodeId, Graph.NodeIndex>();
  const indexMap = MutableHashMap.empty<Graph.NodeIndex, Graph.NodeIndex>();

  const newGraph = Graph.directed<GraphNode<B>, GraphEdge>((mutable) => {
    // map node data, tracking the id/index remapping
    for (const [oldIdx, node] of Graph.nodes(graph.graph)) {
      const mappedNode: GraphNode<B> = { ...node, data: f(node.data) };
      const newIdx = Graph.addNode(mutable, mappedNode);
      MutableHashMap.set(nodeMap, node.id, newIdx);
      MutableHashMap.set(indexMap, oldIdx, newIdx);
    }
    // re-link edges using the new indices
    for (const edgeIdx of Graph.indices(graph.graph.pipe(Graph.edges))) {
      O.match(Graph.getEdge(graph.graph, edgeIdx), {
        onNone: () => {},
        onSome: (edge) => {
          const from = MutableHashMap.get(indexMap, edge.source);
          const to = MutableHashMap.get(indexMap, edge.target);
          if (O.isSome(from) && O.isSome(to)) {
            Graph.addEdge(mutable, from.value, to.value, { relation: "child" });
          }
        },
      });
    }
  });

  const entries = A.fromIterable(nodeMap);
  return {
    graph: newGraph,
    nodeIdToIndex: HashMap.fromIterable(A.map(entries, ([id, idx]) => [id, idx] as const)),
    indexToNodeId: HashMap.fromIterable(A.map(entries, ([id, idx]) => [idx, id] as const)),
  };
};

/**
 * Collect all nodes as an array (topologically ordered by the backing graph).
 *
 * @since 0.0.0
 * @category getters
 */
export const toArray = <A>(graph: EffectGraph<A>): ReadonlyArray<GraphNode<A>> =>
  A.fromIterable(graph.graph.pipe(Graph.nodes, Graph.values));

/**
 * Number of nodes in the graph.
 *
 * @since 0.0.0
 * @category getters
 */
export const size = <A>(graph: EffectGraph<A>): number => Graph.nodeCount(graph.graph);

/**
 * Render the graph as an indented plain-text tree.
 *
 * @since 0.0.0
 * @category formatting
 */
export const show = <A>(graph: EffectGraph<A>, showData: (a: A) => string): string => {
  const lines = A.empty<string>();
  const visited = MutableHashSet.empty<NodeId>();

  const visit = (nodeId: NodeId, indent: number): void => {
    if (MutableHashSet.has(visited, nodeId)) return;
    MutableHashSet.add(visited, nodeId);
    O.match(getNode(graph, nodeId), {
      onNone: () => {},
      onSome: (node) => {
        const op = O.getOrElse(node.metadata.operation, () => "root");
        lines.push(`${"  ".repeat(indent)}[${op}] ${showData(node.data)}`);
        for (const child of getChildren(graph, nodeId)) {
          visit(child.id, indent + 1);
        }
      },
    });
  };

  for (const root of getRoots(graph)) {
    visit(root.id, 0);
  }
  return A.join(lines, "\n");
};
