/**
 * @fileoverview Topological sort command for workspace packages
 *
 * Outputs all internal `@beep/*` packages in topological order, with packages
 * that have fewer dependencies listed first. This ordering ensures that when
 * processing packages sequentially, all dependencies are processed before
 * their dependents.
 *
 * Uses Kahn's algorithm to detect cycles and produce a valid topological ordering.
 *
 * @module @beep/tooling-cli/commands/topo-sort
 * @since 1.0.0
 * @category Commands
 *
 * @example
 * ```bash
 * bun run beep topo-sort
 * # Output:
 * # @beep/types
 * # @beep/invariant
 * # @beep/identity
 * # @beep/utils
 * # @beep/schema
 * # ...
 * ```
 */

import { buildRepoDependencyIndex, type RepoDepMapValue, type WorkspacePkgKey } from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import color from "picocolors";

/**
 * Error thrown when a circular dependency is detected in the workspace graph.
 *
 * @since 0.1.0
 * @category Errors
 */
export class CyclicDependencyError extends S.TaggedError<CyclicDependencyError>()("CyclicDependencyError", {
  /**
   * List of package names that are part of the cycle.
   */
  packages: S.Array(S.String),
}) {}

/**
 * Alphabetical ordering for strings (for deterministic output).
 */
const stringOrder = Order.string;

/**
 * Performs topological sort using Kahn's algorithm.
 *
 * The adjacencyList maps each package to the set of packages it depends on.
 * We output packages such that dependencies come before their dependents.
 *
 * Algorithm:
 * - in-degree[pkg] = number of unprocessed dependencies of pkg
 * - Start with packages that have no dependencies (in-degree = 0)
 * - When a package P is processed, decrement in-degree for all packages that depend on P
 *
 * @param adjacencyList - HashMap where keys are package names and values are
 *                        HashSets of packages they depend on
 * @returns Array of package names in topological order (dependencies first)
 *
 * @since 0.1.0
 * @category Utils
 */
const topologicalSort = (
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
            const existing = F.pipe(
              HashMap.get(innerAcc, dep),
              O.getOrElse(() => HashSet.empty<string>())
            );
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
      const dependents = F.pipe(
        HashMap.get(reverseDeps, node),
        O.getOrElse(() => HashSet.empty<string>())
      );

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
      return yield* new CyclicDependencyError({ packages: cycleParticipants });
    }

    return sorted;
  });

/**
 * Builds an adjacency list from the dependency index.
 *
 * Creates a mapping from each package to the set of internal packages it depends on.
 * Excludes the synthetic `@beep/root` package.
 *
 * @since 0.1.0
 * @category Utils
 */
const buildAdjacencyList = Effect.gen(function* () {
  const depIndex = yield* buildRepoDependencyIndex;

  type WorkspacePkgKeyT = S.Schema.Type<typeof WorkspacePkgKey>;
  type RepoDepMapValueT = S.Schema.Type<typeof RepoDepMapValue>;

  let adjacency = HashMap.empty<string, HashSet.HashSet<string>>();

  yield* Effect.forEach(
    F.pipe(HashMap.entries(depIndex) as Iterable<readonly [WorkspacePkgKeyT, RepoDepMapValueT]>, A.fromIterable),
    ([pkg, deps]) =>
      Effect.sync(() => {
        // Skip synthetic root package
        if (pkg === "@beep/root") {
          return;
        }

        // Combine workspace dependencies from prod, dev, and peer
        const workspaceDeps = F.pipe(
          deps.dependencies.workspace,
          HashSet.union(deps.devDependencies.workspace),
          HashSet.union(deps.peerDependencies.workspace)
        );

        adjacency = HashMap.set(adjacency, pkg, workspaceDeps as HashSet.HashSet<string>);
      }),
    { discard: true }
  );

  return adjacency;
});

/**
 * Handler for the topo-sort command.
 *
 * @since 0.1.0
 * @category Handlers
 */
const handleTopoSortCommand = Effect.gen(function* () {
  yield* Console.log(color.cyan("Analyzing workspace dependencies..."));

  const adjacencyList = yield* buildAdjacencyList;

  const sorted = yield* F.pipe(
    topologicalSort(adjacencyList),
    Effect.catchTag("CyclicDependencyError", (err) =>
      Effect.gen(function* () {
        yield* Console.log(color.red("\nError: Circular dependency detected\n"));
        yield* Console.log(color.yellow("The following packages form a dependency cycle:"));
        yield* Effect.forEach(err.packages, (pkg) => Console.log(color.yellow(`  - ${pkg}`)), {
          discard: true,
        });
        yield* Console.log(
          color.yellow("\nUnable to determine topological order. Please resolve the circular dependency.")
        );
        return yield* Effect.fail(new Error("Circular dependency detected"));
      })
    )
  );

  yield* Console.log(color.green(`\nFound ${A.length(sorted)} packages in topological order:\n`));

  yield* Effect.forEach(sorted, (pkg) => Console.log(pkg), { discard: true });
});

/**
 * CLI command that outputs workspace packages in topological order.
 *
 * Packages with fewer dependencies appear first, ensuring that when processing
 * packages sequentially, all dependencies are handled before their dependents.
 *
 * @example
 * ```bash
 * bun run beep topo-sort
 * ```
 *
 * @since 0.1.0
 * @category Commands
 */
export const topoSortCommand = CliCommand.make("topo-sort", {}, () => handleTopoSortCommand).pipe(
  CliCommand.withDescription("Output packages in topological order (least dependencies first).")
);
