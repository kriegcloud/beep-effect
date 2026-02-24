/**
 * Graph utilities for dependency analysis.
 *
 * Provides topological sorting using Kahn's algorithm, cycle detection,
 * and transitive closure computation for dependency graphs.
 *
 * @module @beep/tooling-utils/repo/Graph
 * @since 0.1.0
 * @category Utils
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";

/**
 * Error thrown when a circular dependency is detected in the dependency graph.
 *
 * @example
 * ```typescript
 * import { CyclicDependencyError } from "@beep/tooling-utils/repo/Graph"
 *
 * const error = new CyclicDependencyError({
 *   packages: ["@beep/a", "@beep/b"],
 *   cycles: [["@beep/a", "@beep/b", "@beep/a"]]
 * })
 * ```
 *
 * @category Errors
 * @since 0.1.0
 */
export class CyclicDependencyError extends S.TaggedError<CyclicDependencyError>()("CyclicDependencyError", {
  /**
   * List of package names that participate in cycles.
   */
  packages: S.Array(S.String),
  /**
   * Detected cycle paths (each cycle is an array of package names forming a loop).
   */
  cycles: S.Array(S.Array(S.String)),
}) {}

/**
 * Alphabetical ordering for strings (for deterministic output).
 */
const stringOrder = Order.string;

/**
 * Performs topological sort using Kahn's algorithm.
 *
 * The adjacencyList maps each package to the set of packages it depends on.
 * Outputs packages such that dependencies come before their dependents.
 *
 * @param adjacencyList - HashMap where keys are package names and values are
 *                        HashSets of packages they depend on
 * @returns Array of package names in topological order (dependencies first)
 *
 * @example
 * ```typescript
 * import { topologicalSort } from "@beep/tooling-utils/repo/Graph"
 * import * as HashMap from "effect/HashMap"
 * import * as HashSet from "effect/HashSet"
 * import * as Effect from "effect/Effect"
 *
 * const graph = HashMap.make(
 *   ["@beep/schema", HashSet.empty()],
 *   ["@beep/utils", HashSet.make("@beep/schema")]
 * )
 *
 * const sorted = Effect.runSync(topologicalSort(graph))
 * // => ["@beep/schema", "@beep/utils"]
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const topologicalSort = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<Array<string>, CyclicDependencyError> =>
  Effect.gen(function* () {
    const allNodes = F.pipe(adjacencyList, HashMap.keys, A.fromIterable);

    // in-degree[pkg] = number of internal packages that pkg depends on
    // A package with 0 dependencies has in-degree 0 and can be processed first
    const initialInDegrees = F.pipe(
      HashMap.entries(adjacencyList),
      A.fromIterable,
      A.reduce(HashMap.empty<string, number>(), (acc, [pkg, deps]) => {
        // Only count dependencies that are also in our package set
        const internalDepsCount = F.pipe(
          HashSet.toValues(deps),
          A.filter((dep) => HashMap.has(adjacencyList, dep)),
          A.length
        );
        return HashMap.set(acc, pkg, internalDepsCount);
      })
    );

    // Build reverse adjacency list: for each package D, which packages depend on D?
    // When D is processed, we need to decrement in-degrees for these dependents.
    const reverseDeps = F.pipe(
      HashMap.entries(adjacencyList),
      A.fromIterable,
      A.reduce(HashMap.empty<string, HashSet.HashSet<string>>(), (acc, [pkg, deps]) =>
        F.pipe(
          HashSet.toValues(deps),
          A.filter((dep) => HashMap.has(adjacencyList, dep)),
          A.reduce(acc, (innerAcc, dep) => {
            const existing = F.pipe(HashMap.get(innerAcc, dep), O.getOrElse(HashSet.empty<string>));
            return HashMap.set(innerAcc, dep, HashSet.add(existing, pkg));
          })
        )
      )
    );

    // Initialize refs for mutable state
    const inDegreeRef = yield* Ref.make(initialInDegrees);
    const resultRef = yield* Ref.make<Array<string>>([]);

    // Enqueue nodes with in-degree 0 (packages that have no internal dependencies)
    const initialQueue = F.pipe(
      HashMap.entries(initialInDegrees),
      A.fromIterable,
      A.filter(([_node, degree]) => degree === 0),
      A.map(([node, _degree]) => node),
      A.sort(stringOrder)
    );
    const queueRef = yield* Ref.make<Array<string>>(initialQueue);

    // Process queue using recursive Effect (Kahn's algorithm)
    const processQueue: Effect.Effect<void> = Effect.gen(function* () {
      const q = yield* Ref.get(queueRef);

      if (!A.isNonEmptyArray(q)) {
        return;
      }

      // Get the first element from queue
      const headOption = A.head(q);
      if (O.isNone(headOption)) {
        return;
      }
      const node = headOption.value;

      // Remove first element and add to result
      yield* Ref.set(queueRef, A.drop(q, 1));
      yield* Ref.update(resultRef, A.append(node));

      // Get packages that depend on this node (their dependency on `node` is now satisfied)
      const dependents = F.pipe(HashMap.get(reverseDeps, node), O.getOrElse(HashSet.empty<string>));

      // Decrement in-degrees of dependents and collect newly zero-degree nodes
      const newZeroDegree: Array<string> = [];
      yield* Effect.forEach(
        HashSet.toValues(dependents),
        (dependent) =>
          Effect.gen(function* () {
            yield* Ref.update(inDegreeRef, (map) =>
              F.pipe(
                HashMap.get(map, dependent),
                O.match({
                  onNone: () => map,
                  onSome: (n) => HashMap.set(map, dependent, n - 1),
                })
              )
            );
            const currentDegrees = yield* Ref.get(inDegreeRef);
            const newDegree = F.pipe(
              HashMap.get(currentDegrees, dependent),
              O.getOrElse(() => 0)
            );
            if (newDegree === 0) {
              newZeroDegree.push(dependent);
            }
          }),
        { discard: true }
      );

      // Add newly zero-degree nodes to queue (sorted for deterministic output)
      if (A.isNonEmptyArray(newZeroDegree)) {
        const sorted = A.sort(newZeroDegree, stringOrder);
        yield* Ref.update(queueRef, (current) => A.appendAll(current, sorted));
      }

      // Continue processing
      yield* processQueue;
    });

    yield* processQueue;

    const sorted = yield* Ref.get(resultRef);

    // Check for cycles: if we couldn't process all nodes, there's a cycle
    if (A.length(sorted) !== A.length(allNodes)) {
      const processedSet = HashSet.fromIterable(sorted);
      const cycleParticipants = F.pipe(
        allNodes,
        A.filter((n) => !HashSet.has(processedSet, n)),
        A.sort(stringOrder)
      );
      const cycles = yield* detectCycles(adjacencyList);
      return yield* new CyclicDependencyError({ packages: cycleParticipants, cycles });
    }

    return sorted;
  });

/**
 * Detect cycles in dependency graph using DFS.
 *
 * Returns an array of cycle paths. Each cycle path is an array of package
 * names representing a cycle (the first and last element are the same).
 *
 * @param adjacencyList - HashMap where keys are package names and values are
 *                        HashSets of packages they depend on
 * @returns Array of cycle paths (empty if acyclic)
 *
 * @example
 * ```typescript
 * import { detectCycles } from "@beep/tooling-utils/repo/Graph"
 * import * as HashMap from "effect/HashMap"
 * import * as HashSet from "effect/HashSet"
 * import * as Effect from "effect/Effect"
 *
 * const cyclicGraph = HashMap.make(
 *   ["@beep/a", HashSet.make("@beep/b")],
 *   ["@beep/b", HashSet.make("@beep/a")]
 * )
 *
 * const cycles = Effect.runSync(detectCycles(cyclicGraph))
 * // => [["@beep/a", "@beep/b", "@beep/a"]]
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const detectCycles = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
): Effect.Effect<Array<Array<string>>> =>
  Effect.gen(function* () {
    const cycles: Array<Array<string>> = [];
    const visitedRef = yield* Ref.make(HashSet.empty<string>());
    const pathRef = yield* Ref.make<Array<string>>([]);
    const pathSetRef = yield* Ref.make(HashSet.empty<string>());

    const allNodes = F.pipe(adjacencyList, HashMap.keys, A.fromIterable);

    const dfs = (node: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const pathSet = yield* Ref.get(pathSetRef);
        const visited = yield* Ref.get(visitedRef);

        // If already in current path, we found a cycle
        if (HashSet.has(pathSet, node)) {
          const path = yield* Ref.get(pathRef);
          const cycleStart = A.findFirstIndex(path, (n) => n === node);
          if (O.isSome(cycleStart)) {
            const cyclePath = F.pipe(path, A.drop(cycleStart.value), A.append(node));
            cycles.push(cyclePath);
          }
          return;
        }

        // Skip if already fully visited
        if (HashSet.has(visited, node)) {
          return;
        }

        // Mark as in current path
        yield* Ref.update(pathRef, A.append(node));
        yield* Ref.update(pathSetRef, HashSet.add(node));

        // Visit dependencies
        const deps = F.pipe(HashMap.get(adjacencyList, node), O.getOrElse(HashSet.empty<string>));

        yield* Effect.forEach(
          F.pipe(
            HashSet.toValues(deps),
            A.filter((d) => HashMap.has(adjacencyList, d))
          ),
          dfs,
          { discard: true }
        );

        // Remove from current path, mark as fully visited
        yield* Ref.update(pathRef, (p) => A.dropRight(p, 1));
        yield* Ref.update(pathSetRef, HashSet.remove(node));
        yield* Ref.update(visitedRef, HashSet.add(node));
      });

    yield* Effect.forEach(allNodes, dfs, { discard: true });

    return cycles;
  });

/**
 * Compute transitive closure of dependencies for a package.
 *
 * Returns all direct and indirect dependencies of the given package,
 * split into workspace and external (npm) dependencies.
 *
 * @param adjacencyList - HashMap where keys are package names and values are
 *                        HashSets of packages they depend on
 * @param packageName - The package to compute transitive closure for
 * @returns HashSet of all transitive dependencies
 *
 * @example
 * ```typescript
 * import { computeTransitiveClosure } from "@beep/tooling-utils/repo/Graph"
 * import * as HashMap from "effect/HashMap"
 * import * as HashSet from "effect/HashSet"
 * import * as Effect from "effect/Effect"
 *
 * const graph = HashMap.make(
 *   ["@beep/c", HashSet.make("@beep/b")],
 *   ["@beep/b", HashSet.make("@beep/a")],
 *   ["@beep/a", HashSet.empty()]
 * )
 *
 * const deps = Effect.runSync(computeTransitiveClosure(graph, "@beep/c"))
 * // => HashSet containing "@beep/a", "@beep/b"
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const computeTransitiveClosure = (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>,
  packageName: string
): Effect.Effect<HashSet.HashSet<string>, CyclicDependencyError> =>
  Effect.gen(function* () {
    const resultRef = yield* Ref.make(HashSet.empty<string>());
    const visitedRef = yield* Ref.make(HashSet.empty<string>());

    const collect = (pkg: string): Effect.Effect<void> =>
      Effect.gen(function* () {
        const visited = yield* Ref.get(visitedRef);

        // Skip if already visited
        if (HashSet.has(visited, pkg)) {
          return;
        }

        yield* Ref.update(visitedRef, HashSet.add(pkg));

        const deps = F.pipe(HashMap.get(adjacencyList, pkg), O.getOrElse(HashSet.empty<string>));

        // Add all direct deps to result and recurse
        yield* Effect.forEach(
          HashSet.toValues(deps),
          (dep) =>
            Effect.gen(function* () {
              yield* Ref.update(resultRef, HashSet.add(dep));
              // Only recurse for packages in our graph
              if (HashMap.has(adjacencyList, dep)) {
                yield* collect(dep);
              }
            }),
          { discard: true }
        );
      });

    // Check for cycles first
    const cycles = yield* detectCycles(adjacencyList);
    if (A.isNonEmptyArray(cycles)) {
      // Find packages involved in cycles
      const cycleParticipants = F.pipe(cycles, A.flatMap(F.identity), A.dedupe, A.sort(stringOrder));
      return yield* new CyclicDependencyError({ packages: cycleParticipants, cycles });
    }

    yield* collect(packageName);

    return yield* Ref.get(resultRef);
  });
