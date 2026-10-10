import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import * as S from "effect/Schema";
import { Lockfile } from "../../../effected/lockfiles/Lockfile.ts";
import { ResolvedPackage } from "../../../effected/lockfiles/ResolvedPackage.ts";
import { indexInstances, rootInstances } from "../../../effected/workspaces/internal/roots.ts";

it.effect("indexes workspace rows only when they carry an importer path", () => Effect.sync(() => {
  const absent = ResolvedPackage.make({ name: "absent", version: "1", instanceId: "absent@1", isWorkspace: true });
  const member = ResolvedPackage.make({ name: "member", version: "1", instanceId: "member@1", isWorkspace: true, relativePath: "packages/member" });
  const external = ResolvedPackage.make({ name: "external", version: "1", instanceId: "external@1", isWorkspace: false, relativePath: "external" });
  const index = indexInstances(Lockfile.make({ format: "pnpm", lockfileVersion: "9", packages: [absent, member, external], workspaceDependencies: [] }));
  assert.strictEqual(MutableHashMap.size(index.byId), 3);
  assert.deepStrictEqual(Array.from(index.workspaceByPath), [["packages/member", member]]);
}));

it.effect("an importer with only specifiers and no resolved version is unanswerable", () => Effect.gen(function* () {
  const lockfile = yield* S.decodeEffect(Lockfile)({
    format: "npm", lockfileVersion: "3", packages: [], workspaceDependencies: [],
    importers: [{ path: ".", dependencies: [{ name: "dependency", specifier: "^1", depType: "dependencies" }] }],
  });
  assert.isUndefined(rootInstances(lockfile, ".", indexInstances(lockfile)));
  assert.isUndefined(rootInstances(lockfile, "missing", indexInstances(lockfile)));
}));
