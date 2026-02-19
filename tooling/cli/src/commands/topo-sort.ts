/**
 * Topological sort command - outputs workspace packages in dependency order.
 *
 * @since 0.0.0
 * @category commands
 */

import { buildRepoDependencyIndex, findRepoRoot, topologicalSort } from "@beep/repo-utils";
import { HashMap, HashSet, Struct } from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { Command } from "effect/unstable/cli";

/**
 * @since 0.0.0
 * @category commands
 */
export const topoSortCommand = Command.make("topo-sort", {},
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

    const sorted = yield* Effect.catchTag(topologicalSort(adjacencyList), "CyclicDependencyError",
      Effect.fn(function* (err) {
        yield* Console.error(`Error: Cyclic dependencies detected`);
        for (const cycle of err.cycles) {
          yield* Console.error(`  ${cycle.join(" -> ")}`);
        }
        return yield* Effect.fail(err);
      })
    );

    yield* Effect.forEach(sorted, (pkg) => Console.log(pkg), {
      discard: true,
    });
  })
).pipe(Command.withDescription("Output workspace packages in topological dependency order"));
