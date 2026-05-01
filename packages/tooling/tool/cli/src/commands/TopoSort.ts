/**
 * Topological sort command - outputs workspace packages in dependency order.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { buildRepoDependencyIndex, findRepoRoot, topologicalSort, type WorkspaceDeps } from "@beep/repo-utils";
import { Console, Effect, HashMap, HashSet } from "effect";
import * as A from "effect/Array";
import * as R from "effect/Record";
import { Command } from "effect/unstable/cli";

const dependencyNames = (workspaceDeps: WorkspaceDeps): ReadonlyArray<string> => [
  ...R.keys(workspaceDeps.workspace.dependencies),
  ...R.keys(workspaceDeps.workspace.devDependencies),
  ...R.keys(workspaceDeps.workspace.peerDependencies),
  ...R.keys(workspaceDeps.workspace.optionalDependencies),
];

/**
 * CLI command that builds the workspace dependency graph and prints package names
 * in topological order (leaf dependencies first, dependents last).
 *
 * @example
 * ```ts
 * console.log("topoSortCommand")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const topoSortCommand = Command.make(
  "topo-sort",
  {},
  Effect.fn(function* () {
    const rootDir = yield* findRepoRoot();
    const depIndex = yield* buildRepoDependencyIndex(rootDir);

    // Build adjacency list: each package maps to its workspace dependencies
    let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();

    for (const [name, workspaceDeps] of depIndex) {
      let depSet = HashSet.empty<string>();
      for (const depName of dependencyNames(workspaceDeps)) {
        depSet = HashSet.add(depSet, depName);
      }

      adjacencyList = HashMap.set(adjacencyList, name, depSet);
    }

    const sorted = yield* Effect.catchTag(
      topologicalSort(adjacencyList),
      "CyclicDependencyError",
      Effect.fn(function* (err) {
        yield* Console.error(`Error: Cyclic dependencies detected`);
        for (const cycle of err.cycles) {
          yield* Console.error(`  ${A.join(cycle, " -> ")}`);
        }
        return yield* err;
      })
    );

    yield* Effect.forEach(sorted, (packageName) => Console.log(packageName), {
      discard: true,
    });
  })
).pipe(Command.withDescription("Output workspace packages in topological dependency order"));
