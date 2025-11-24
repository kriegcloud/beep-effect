import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export const NodeId = S.NonEmptyTrimmedString.pipe(S.brand("NodeId"));
export type NodeId = S.Schema.Type<typeof NodeId>;

export const DirectedAcyclicGraph = S.HashMap({
  key: NodeId,
  value: S.HashSet(NodeId),
});
export type DirectedAcyclicGraph = S.Schema.Type<typeof DirectedAcyclicGraph>;

export const DependencyGraph = DirectedAcyclicGraph;
export type DependencyGraph = DirectedAcyclicGraph;

export const TaskList = S.Array(S.HashSet(NodeId));
export type TaskList = S.Schema.Type<typeof TaskList>;

type NodeIndex = Graph.NodeIndex;
type IndexInDegrees = HashMap.HashMap<NodeIndex, number>;

const ensureNodeIndex = (
  mutable: Graph.MutableDirectedGraph<NodeId, void>,
  indices: HashMap.HashMap<NodeId, NodeIndex>,
  id: NodeId
): { indices: HashMap.HashMap<NodeId, NodeIndex>; index: NodeIndex } => {
  const existing = HashMap.get(id)(indices);

  if (O.isSome(existing)) {
    return { indices, index: existing.value };
  }

  const created = Graph.addNode(mutable, id);
  return { indices: HashMap.set(id, created)(indices), index: created };
};

const buildGraph = (dag: DirectedAcyclicGraph) => {
  let indexById = HashMap.empty<NodeId, NodeIndex>();

  const graph = Graph.directed<NodeId, void>((mutable) => {
    HashMap.forEach(dag, (neighbors, id) => {
      const ensured = ensureNodeIndex(mutable, indexById, id);
      indexById = ensured.indices;

      HashSet.forEach(neighbors, (neighborId) => {
        const neighborEnsured = ensureNodeIndex(mutable, indexById, neighborId);
        indexById = neighborEnsured.indices;
        Graph.addEdge(mutable, ensured.index, neighborEnsured.index, undefined);
      });
    });
  });

  let idByIndex = HashMap.empty<NodeIndex, NodeId>();
  HashMap.forEach(indexById, (index, id) => {
    idByIndex = HashMap.set(index, id)(idByIndex);
  });

  return { graph, indexById, idByIndex };
};

const countIndexInDegrees = (
  graph: Graph.DirectedGraph<NodeId, void>,
  indices: HashMap.HashMap<NodeId, NodeIndex>
): IndexInDegrees => {
  let degrees = HashMap.empty<NodeIndex, number>();

  HashMap.forEach(indices, (nodeIndex) => {
    degrees = HashMap.set(nodeIndex, 0)(degrees);
  });

  HashMap.forEach(indices, (nodeIndex) => {
    degrees = F.pipe(
      Graph.neighbors(graph, nodeIndex),
      A.reduce(degrees, (acc, neighborIndex) =>
        HashMap.set(
          neighborIndex,
          F.pipe(
            HashMap.get(neighborIndex)(acc),
            O.getOrElse(() => 0),
            (count) => count + 1
          )
        )(acc)
      )
    );
  });

  return degrees;
};

const getRootsAndNonRootsByIndex = (counts: IndexInDegrees) => {
  let roots = HashSet.empty<NodeIndex>();
  let nonRoots = HashSet.empty<NodeIndex>();

  HashMap.forEach(counts, (degree, index) => {
    if (degree === 0) {
      roots = HashSet.add(index)(roots);
    } else {
      nonRoots = HashSet.add(index)(nonRoots);
    }
  });

  return { roots, nonRoots };
};

export const toposortWithGraph = (dag: DirectedAcyclicGraph): TaskList => {
  const { graph, indexById, idByIndex } = buildGraph(dag);

  if (!Graph.isAcyclic(graph)) {
    throw new Error("Cycle(s) detected; toposort only works on acyclic graphs.");
  }

  let inDegrees = countIndexInDegrees(graph, indexById);
  let { roots } = getRootsAndNonRootsByIndex(inDegrees);
  let sorted = A.empty<HashSet.HashSet<NodeId>>();

  while (HashSet.size(roots) > 0) {
    const currentBatch = HashSet.reduce(roots, HashSet.empty<NodeId>(), (acc, index) =>
      F.pipe(
        HashMap.get(index)(idByIndex),
        O.match({
          onNone: () => acc,
          onSome: (id) => HashSet.add(id)(acc),
        })
      )
    );

    sorted = F.pipe(sorted, A.append(currentBatch));

    let newRoots = HashSet.empty<NodeIndex>();

    HashSet.forEach(roots, (rootIndex) => {
      const updated = F.pipe(
        Graph.neighbors(graph, rootIndex),
        A.reduce({ degrees: inDegrees, pending: newRoots }, (state, neighborIndex) => {
          const currentDegree = F.pipe(
            HashMap.get(neighborIndex)(state.degrees),
            O.getOrElse(() => 0)
          );
          const nextDegree = currentDegree - 1;
          const updatedDegrees = HashMap.set(neighborIndex, nextDegree)(state.degrees);
          const updatedPending = nextDegree === 0 ? HashSet.add(neighborIndex)(state.pending) : state.pending;

          return { degrees: updatedDegrees, pending: updatedPending };
        })
      );

      inDegrees = updated.degrees;
      newRoots = updated.pending;
    });

    roots = newRoots;
  }

  const { nonRoots } = getRootsAndNonRootsByIndex(inDegrees);

  if (HashSet.size(nonRoots) > 0) {
    const cyclicNodes = F.pipe(
      nonRoots,
      HashSet.reduce(A.empty<NodeId>(), (acc, index) =>
        F.pipe(
          HashMap.get(index)(idByIndex),
          O.match({
            onNone: () => acc,
            onSome: (id) => F.pipe(acc, A.append(id)),
          })
        )
      ),
      (nodes) => A.join(nodes, ", ")
    );

    throw new Error(`Cycle(s) detected; toposort only works on acyclic graphs. Cyclic nodes: ${cyclicNodes}`);
  }

  return sorted;
};
