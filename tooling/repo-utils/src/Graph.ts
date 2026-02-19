/**
 * Graph algorithms for dependency analysis in monorepo workspaces.
 *
 * Wraps the built-in Effect v4 `Graph` module, converting between
 * `HashMap<string, HashSet<string>>` adjacency lists (the natural shape for
 * package dependency data) and the indexed `Graph.DirectedGraph` structure
 * that the Effect algorithms operate on.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, Graph as EffectGraph, HashMap, HashSet } from "effect"
import { CyclicDependencyError } from "./errors/index.js"

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Convert a `HashMap<string, HashSet<string>>` adjacency list into an
 * `EffectGraph.DirectedGraph<string, void>` and a bidirectional lookup
 * between package names and node indices.
 *
 * @internal
 */
const fromAdjacencyList = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): {
  graph: EffectGraph.DirectedGraph<string, void>
  nameToIndex: Map<string, EffectGraph.NodeIndex>
  indexToName: Map<EffectGraph.NodeIndex, string>
} => {
  const nameToIndex = new Map<string, EffectGraph.NodeIndex>()
  const indexToName = new Map<EffectGraph.NodeIndex, string>()

  const graph = EffectGraph.directed<string, void>((mutable) => {
    // First pass: add all nodes (keys AND their deps, in case a dep
    // appears only as a value and not as a key).
    const allNames = new Set<string>()
    for (const [name, deps] of adjacencyList) {
      allNames.add(name)
      for (const dep of deps) {
        allNames.add(dep)
      }
    }

    for (const name of allNames) {
      const idx = EffectGraph.addNode(mutable, name)
      nameToIndex.set(name, idx)
      indexToName.set(idx, name)
    }

    // Second pass: add edges (package -> dependency)
    for (const [name, deps] of adjacencyList) {
      const sourceIdx = nameToIndex.get(name)!
      for (const dep of deps) {
        const targetIdx = nameToIndex.get(dep)!
        EffectGraph.addEdge(mutable, sourceIdx, targetIdx, undefined as void)
      }
    }
  })

  return { graph, nameToIndex, indexToName }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute a topological ordering (dependency-first build order) of packages
 * described by the given adjacency list using Kahn's algorithm.
 *
 * Dependencies appear **before** their dependents in the returned array so
 * that every package is built after all of its dependencies.
 *
 * Fails with {@link CyclicDependencyError} when the graph contains cycles.
 *
 * @example
 * ```ts
 * import { Effect, HashMap, HashSet } from "effect"
 * import { topologicalSort } from "@beep/repo-utils/Graph"
 *
 * const adj = HashMap.make(
 *   ["A", HashSet.make("B")],
 *   ["B", HashSet.make("C")],
 *   ["C", HashSet.empty()]
 * )
 *
 * const program = Effect.gen(function*() {
 *   const order = yield* topologicalSort(adj)
 *   console.log(order) // ["C", "B", "A"]
 * })
 * ```
 *
 * @since 0.0.0
 * @category algorithms
 */
export const topologicalSort = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<ReadonlyArray<string>, CyclicDependencyError> =>
  Effect.gen(function* () {
    // Empty graph – nothing to sort
    if (HashMap.size(adjacencyList) === 0) {
      return [] as ReadonlyArray<string>
    }

    const { graph } = fromAdjacencyList(adjacencyList)

    // Check for cycles first (isAcyclic is cheap and cached)
    if (!EffectGraph.isAcyclic(graph)) {
      const cycles = yield* detectCycles(adjacencyList)
      return yield* Effect.fail(
        new CyclicDependencyError({
          message: `Cyclic dependencies detected: ${cycles.map((c) => c.join(" -> ")).join("; ")}`,
          cycles,
        })
      )
    }

    // Use the built-in topological sort.
    // The topo sort outputs zero-in-degree nodes first. In our graph where
    // edges go from package -> dependency, roots/dependents have zero
    // in-degree. Reversing gives us dependency-first (build) order.
    const walker = EffectGraph.topo(graph)
    const result: string[] = []
    for (const value of EffectGraph.values(walker)) {
      result.push(value)
    }
    result.reverse()
    return result as ReadonlyArray<string>
  })

/**
 * Detect all cycles in a directed dependency graph.
 *
 * Uses strongly connected components (Kosaraju's algorithm via the built-in
 * `Graph.stronglyConnectedComponents`) and then reconstructs explicit cycle
 * paths of the form `[pkg1, pkg2, ..., pkg1]`.
 *
 * Returns an empty array when the graph is acyclic.
 *
 * @example
 * ```ts
 * import { Effect, HashMap, HashSet } from "effect"
 * import { detectCycles } from "@beep/repo-utils/Graph"
 *
 * const adj = HashMap.make(
 *   ["A", HashSet.make("B")],
 *   ["B", HashSet.make("C")],
 *   ["C", HashSet.make("A")]
 * )
 *
 * const program = Effect.gen(function*() {
 *   const cycles = yield* detectCycles(adj)
 *   // cycles contains [["A", "B", "C", "A"]] (or similar rotation)
 * })
 * ```
 *
 * @since 0.0.0
 * @category algorithms
 */
export const detectCycles = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<ReadonlyArray<ReadonlyArray<string>>> =>
  Effect.sync(() => {
    if (HashMap.size(adjacencyList) === 0) {
      return []
    }

    const { graph, indexToName } = fromAdjacencyList(adjacencyList)

    // Quick check – if acyclic, short-circuit
    if (EffectGraph.isAcyclic(graph)) {
      return []
    }

    const sccs = EffectGraph.stronglyConnectedComponents(graph)

    // Filter to SCCs with more than one node, or a single node with a
    // self-edge.
    const cyclePaths: Array<ReadonlyArray<string>> = []

    for (const scc of sccs) {
      if (scc.length > 1) {
        // Reconstruct a cycle path through this SCC.
        // We walk the SCC members in their SCC order, following edges
        // that stay within the component.
        const memberSet = new Set(scc)
        const names = scc.map((idx) => indexToName.get(idx)!)

        // Build a path by DFS within the SCC starting from the first member
        const path = buildCyclePath(graph, scc[0], memberSet, indexToName)
        if (path.length > 0) {
          cyclePaths.push(path)
        } else {
          // Fallback: just list the members with the first repeated
          cyclePaths.push([...names, names[0]])
        }
      } else if (scc.length === 1) {
        // Check for self-loop
        const nodeIdx = scc[0]
        const name = indexToName.get(nodeIdx)!
        const selfEdge = EffectGraph.findEdge(
          graph,
          (_data, source, target) => source === nodeIdx && target === nodeIdx
        )
        if (selfEdge !== undefined) {
          cyclePaths.push([name, name])
        }
      }
    }

    return cyclePaths
  })

/**
 * Build an explicit cycle path through an SCC by DFS, returning a path of
 * the form `[start, ..., start]`.
 *
 * @internal
 */
const buildCyclePath = (
  graph: EffectGraph.DirectedGraph<string, void>,
  startIdx: EffectGraph.NodeIndex,
  memberSet: Set<EffectGraph.NodeIndex>,
  indexToName: Map<EffectGraph.NodeIndex, string>
): ReadonlyArray<string> => {
  // DFS within the SCC to find a cycle back to startIdx
  const stack: Array<{ node: EffectGraph.NodeIndex; path: EffectGraph.NodeIndex[] }> = [
    { node: startIdx, path: [startIdx] },
  ]
  const visited = new Set<EffectGraph.NodeIndex>()

  while (stack.length > 0) {
    const { node, path } = stack.pop()!

    // Get outgoing neighbors that are within the SCC
    const neighbors = EffectGraph.neighborsDirected(graph, node, "outgoing")
    for (const neighbor of neighbors) {
      if (!memberSet.has(neighbor)) continue

      if (neighbor === startIdx && path.length > 1) {
        // Found a cycle back to start
        return [...path.map((idx) => indexToName.get(idx)!), indexToName.get(startIdx)!]
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        stack.push({ node: neighbor, path: [...path, neighbor] })
      }
    }
  }

  return []
}

/**
 * Compute the transitive closure of dependencies for a single package.
 *
 * Returns a `HashSet` of all packages that the given package depends on,
 * directly or transitively.  The starting package itself is **not** included
 * unless it participates in a cycle.
 *
 * Uses BFS traversal via the built-in `Graph.bfs`.
 *
 * @example
 * ```ts
 * import { Effect, HashMap, HashSet } from "effect"
 * import { computeTransitiveClosure } from "@beep/repo-utils/Graph"
 *
 * const adj = HashMap.make(
 *   ["A", HashSet.make("B")],
 *   ["B", HashSet.make("C")],
 *   ["C", HashSet.empty()]
 * )
 *
 * const program = Effect.gen(function*() {
 *   const deps = yield* computeTransitiveClosure(adj, "A")
 *   // deps = HashSet("B", "C")
 * })
 * ```
 *
 * @since 0.0.0
 * @category algorithms
 */
export const computeTransitiveClosure = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>,
  pkg: string
): Effect.Effect<HashSet.HashSet<string>> =>
  Effect.sync(() => {
    if (HashMap.size(adjacencyList) === 0) {
      return HashSet.empty<string>()
    }

    const { graph, nameToIndex, indexToName } = fromAdjacencyList(adjacencyList)

    const startIdx = nameToIndex.get(pkg)
    if (startIdx === undefined) {
      // Package not in graph – no transitive deps
      return HashSet.empty<string>()
    }

    // BFS from the starting package, collecting all reachable nodes
    const walker = EffectGraph.bfs(graph, { start: [startIdx] })
    let result = HashSet.empty<string>()

    for (const [idx, _value] of walker) {
      // Skip the starting node itself
      if (idx === startIdx) continue
      const name = indexToName.get(idx)
      if (name !== undefined) {
        result = HashSet.add(result, name)
      }
    }

    return result
  })
