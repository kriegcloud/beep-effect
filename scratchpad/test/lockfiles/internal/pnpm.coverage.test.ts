import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { Yaml } from "../../../effected/yaml/Yaml.ts";
import { parsePnpm } from "../../../effected/lockfiles/internal/pnpm.ts";

it.effect("unnameable links and empty dependency names stay omitted and publish paths cannot escape the workspace", () => Effect.gen(function* () {
  const text = yield* Yaml.stringify({ lockfileVersion: 9, importers: {
    ".": { publishDirectory: ".", dependencies: { "": { specifier: "*", version: "1" }, escape: { specifier: "workspace:*", version: "link:../../outside" }, root: { specifier: "*", version: "link:." } } },
    lib: { publishDirectory: "../../outside", dependencies: { "": { specifier: "*", version: "1" }, root: { specifier: "*", version: "link:.." } } },
  }, packages: { "a@1": {} }, snapshots: { "a@1": { dependencies: { "": "1", escape: "link:../../outside", root: "link:." } } } });
  const fields = yield* parsePnpm(text, false);
  assert.deepStrictEqual(fields.packages.map((pkg) => [pkg.instanceId, pkg.resolved, pkg.unresolvedEdges]), [["lib", {}, ["root"]], ["a@1", {}, ["escape", "root"]]]);
  assert.deepStrictEqual(fields.importers[0]?.dependencies.map((dep) => dep.name), ["escape", "root"]);
}));
