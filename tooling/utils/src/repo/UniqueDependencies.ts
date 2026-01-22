/**
 * Unique npm dependency collection across the monorepo.
 *
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import { buildRepoDependencyIndex } from "./DependencyIndex.js";

/**
 * Collect unique npm dependencies across the entire repo.
 *
 * Builds the repo dependency index and unions all npm dependency sets from
 * both `dependencies` and `devDependencies` for every workspace.
 *
 * @returns Object with `dependencies` and `devDependencies` arrays of unique npm package names
 *
 * @example
 * ```typescript
 * import { collectUniqueNpmDependencies } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const uniqueDeps = yield* collectUniqueNpmDependencies
 *   console.log(uniqueDeps.dependencies)
 *   // => ["effect", "react", "next", ...]
 *   console.log(uniqueDeps.devDependencies)
 *   // => ["vitest", "typescript", ...]
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const collectUniqueNpmDependencies = Effect.gen(function* () {
  const repoDepMap = yield* buildRepoDependencyIndex;
  const depMapValues = HashMap.values(repoDepMap);
  let devDepsSet = HashSet.empty<string>();
  let depsSet = HashSet.empty<string>();

  for (const depMapValue of A.fromIterable(depMapValues)) {
    const dev = HashSet.values(depMapValue.devDependencies.npm);
    const deps = HashSet.values(depMapValue.dependencies.npm);

    devDepsSet = HashSet.union(devDepsSet, dev);
    depsSet = HashSet.union(depsSet, deps);
  }

  return {
    dependencies: HashSet.toValues(depsSet),
    devDependencies: HashSet.toValues(devDepsSet),
  } as const;
});
