import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import { createRepoDepMap } from "./RepoDependencyMap";
export const getUniqueDeps = Effect.gen(function* () {
  const repoDepMap = yield* createRepoDepMap;
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
  };
});
