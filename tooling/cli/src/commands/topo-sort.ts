/**
 * Topological sort command - outputs workspace packages in dependency order.
 *
 * @since 0.0.0
 * @module @beep/repo-cli/topo-sort
 */

import { buildRepoDependencyIndex, findRepoRoot, topologicalSort } from "@beep/repo-utils";
import { Console, Effect, HashMap, HashSet, Struct } from "effect";
import { Command } from "effect/unstable/cli";

/**
 * CLI command that builds the workspace dependency graph and prints package names
 * in topological order (leaf dependencies first, dependents last).
 *
 * @since 0.0.0
 * @category UseCase
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
      const deps = workspaceDeps.workspace.dependencies;
      const devDeps = workspaceDeps.workspace.devDependencies;

      let depSet = HashSet.empty<string>();
      for (const depName of Struct.keys(deps)) {
        depSet = HashSet.add(depSet, depName);
      }
      for (const depName of Struct.keys(devDeps)) {
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
          yield* Console.error(`  ${cycle.join(" -> ")}`);
        }
        return yield* err;
      })
    );

    yield* Effect.forEach(sorted, (packageName) => Console.log(packageName), {
      discard: true,
    });
  })
).pipe(Command.withDescription("Output workspace packages in topological dependency order"));
