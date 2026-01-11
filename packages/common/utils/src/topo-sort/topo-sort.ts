/**
 * @since 0.1.0
 */

import { $UtilsId } from "@beep/identity/packages";
import { thunkZero } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $UtilsId.create("topo-sort/topo-sort");

export const NodeId = S.NonEmptyTrimmedString.pipe(
  S.brand("NodeId"),
  S.annotations(
    $I.annotations("NodeId", {
      description: "Branded string identifier for directed acyclic graph nodes",
    })
  )
);
export type NodeId = S.Schema.Type<typeof NodeId>;

export const DirectedAcyclicGraph = S.HashMap({
  key: NodeId,
  value: S.HashSet(NodeId),
}).annotations(
  $I.annotations("DirectedAcyclicGraph", {
    description: "HashMap representing a directed acyclic graph with node dependencies",
  })
);
export type DirectedAcyclicGraph = S.Schema.Type<typeof DirectedAcyclicGraph>;

export const DependencyGraph = DirectedAcyclicGraph;
export type DependencyGraph = DirectedAcyclicGraph;

export const TaskList = S.Array(S.HashSet(NodeId)).annotations(
  $I.annotations("TaskList", {
    description: "Array of parallel task batches from topological sort",
  })
);
export type TaskList = S.Schema.Type<typeof TaskList>;

type InDegrees = HashMap.HashMap<NodeId, number>;

const ensureNodeWithZeroDegree = (counts: InDegrees, id: NodeId): InDegrees =>
  HashMap.has(id)(counts) ? counts : HashMap.set(id, 0)(counts);

const countInDegrees = (dag: DirectedAcyclicGraph): InDegrees => {
  let counts = HashMap.empty<NodeId, number>();

  HashMap.forEach(dag, (dependents, vertex) => {
    counts = ensureNodeWithZeroDegree(counts, vertex);

    HashSet.forEach(dependents, (dependent) => {
      const nextCount = F.pipe(HashMap.get(dependent)(counts), O.getOrElse(thunkZero), (value) => value + 1);

      counts = HashMap.set(dependent, nextCount)(counts);
    });
  });

  return counts;
};

const getRootsAndNonRoots = (counts: InDegrees) => {
  let roots = HashSet.empty<NodeId>();
  let nonRoots = HashSet.empty<NodeId>();

  HashMap.forEach(counts, (degree, id) => {
    if (degree === 0) {
      roots = HashSet.add(id)(roots);
    } else {
      nonRoots = HashSet.add(id)(nonRoots);
    }
  });

  return { roots, nonRoots };
};

const reverse = (deps: DirectedAcyclicGraph): DependencyGraph => {
  let reversed = HashMap.empty<NodeId, HashSet.HashSet<NodeId>>();

  HashMap.forEach(deps, (dependsOn, name) => {
    if (!HashMap.has(name)(reversed)) {
      reversed = HashMap.set(name, HashSet.empty<NodeId>())(reversed);
    }

    HashSet.forEach(dependsOn, (dependsOnName) => {
      if (!HashMap.has(dependsOnName)(reversed)) {
        reversed = HashMap.set(dependsOnName, HashSet.empty<NodeId>())(reversed);
      }

      const dependents = F.pipe(
        HashMap.get(dependsOnName)(reversed),
        O.getOrElse(() => HashSet.empty<NodeId>())
      );

      reversed = HashMap.set(dependsOnName, HashSet.add(name)(dependents))(reversed);
    });
  });

  return reversed;
};

export const toposort = (dag: DirectedAcyclicGraph): TaskList => {
  let inDegrees = countInDegrees(dag);
  let { roots } = getRootsAndNonRoots(inDegrees);
  let sorted = A.empty<HashSet.HashSet<NodeId>>();

  while (HashSet.size(roots) > 0) {
    sorted = F.pipe(sorted, A.append(roots));

    let newRoots = HashSet.empty<NodeId>();

    HashSet.forEach(roots, (root) => {
      F.pipe(
        HashMap.get(root)(dag),
        O.match({
          onNone: () => undefined,
          onSome: (dependents) =>
            HashSet.forEach(dependents, (dependent) => {
              const currentDegree = F.pipe(HashMap.get(dependent)(inDegrees), O.getOrElse(thunkZero));

              const nextDegree = currentDegree - 1;
              inDegrees = HashMap.set(dependent, nextDegree)(inDegrees);

              if (nextDegree === 0) {
                newRoots = HashSet.add(dependent)(newRoots);
              }
            }),
        })
      );
    });

    roots = newRoots;
  }

  const { nonRoots } = getRootsAndNonRoots(inDegrees);

  if (HashSet.size(nonRoots) > 0) {
    const cyclicNodes = F.pipe(
      nonRoots,
      HashSet.reduce(A.empty<NodeId>(), (acc, node) => F.pipe(acc, A.append(node))),
      (nodes) => A.join(nodes, ", ")
    );

    throw new Error(`Cycle(s) detected; toposort only works on acyclic graphs. Cyclic nodes: ${cyclicNodes}`);
  }

  return sorted;
};

export const toposortReverse = (deps: DependencyGraph): TaskList => F.pipe(deps, reverse, toposort);

export const createDependencyGraph = (): DependencyGraph => HashMap.empty<NodeId, HashSet.HashSet<NodeId>>();

export const addDependency = (graph: DependencyGraph, from: NodeId, to: NodeId): DependencyGraph => {
  const ensured = HashMap.has(from)(graph) ? graph : HashMap.set(from, HashSet.empty<NodeId>())(graph);

  const updatedDependents = F.pipe(
    HashMap.get(from)(ensured),
    O.getOrElse(() => HashSet.empty<NodeId>()),
    HashSet.add(to)
  );

  return HashMap.set(from, updatedDependents)(ensured);
};

export const removeDependency = (
  graph: DependencyGraph,
  from: NodeId,
  to: NodeId
): { graph: DependencyGraph; removed: boolean } => {
  const maybeDependents = HashMap.get(from)(graph);

  if (O.isNone(maybeDependents)) {
    return { graph, removed: false };
  }

  const dependents = maybeDependents.value;

  if (!HashSet.has(to)(dependents)) {
    return { graph, removed: false };
  }

  return {
    graph: HashMap.set(from, HashSet.remove(to)(dependents))(graph),
    removed: true,
  };
};

export const hasDependency = (graph: DependencyGraph, from: NodeId, to: NodeId): boolean =>
  F.pipe(
    HashMap.get(from)(graph),
    O.map(HashSet.has(to)),
    O.getOrElse(() => false)
  );
