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
 * bun run repo-cli topo-sort
 * # Output:
 * # @beep/types
 * # @beep/invariant
 * # @beep/identity
 * # @beep/utils
 * # @beep/schema
 * # ...
 * ```
 */

import {
  buildRepoDependencyIndex,
  type CyclicDependencyError,
  type RepoDepMapValue,
  topologicalSort,
  type WorkspacePkgKey,
} from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import type * as S from "effect/Schema";
import color from "picocolors";
import { CircularDependencyError } from "./errors.js";

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
    Effect.catchTag("CyclicDependencyError", (err: CyclicDependencyError) =>
      Effect.gen(function* () {
        yield* Console.log(color.red("\nError: Circular dependency detected\n"));
        yield* Console.log(color.yellow("The following packages form a dependency cycle:"));
        yield* Effect.forEach(err.packages, (pkg) => Console.log(color.yellow(`  - ${pkg}`)), {
          discard: true,
        });
        const cycles = A.fromIterable(err.cycles);
        if (A.isNonEmptyArray(cycles)) {
          yield* Console.log(color.yellow("\nDetected cycles:"));
          yield* Effect.forEach(
            cycles,
            (cycle) => Console.log(color.yellow(`  ${A.join(A.fromIterable(cycle), " → ")}`)),
            { discard: true }
          );
        }
        yield* Console.log(
          color.yellow("\nUnable to determine topological order. Please resolve the circular dependency.")
        );
        return yield* Effect.fail(new CircularDependencyError({}));
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
 * bun run repo-cli topo-sort
 * ```
 *
 * @since 0.1.0
 * @category Commands
 */
export const topoSortCommand = CliCommand.make("topo-sort", {}, () => handleTopoSortCommand).pipe(
  CliCommand.withDescription("Output packages in topological order (least dependencies first).")
);
