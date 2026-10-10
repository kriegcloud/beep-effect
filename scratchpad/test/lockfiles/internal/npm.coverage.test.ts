import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { parseNpm } from "../../../effected/lockfiles/internal/npm.ts";

it.effect("link stubs preserve fallbacks, omit missing manifests and skip nameless or versionless rows", () => Effect.gen(function* () {
  const text = yield* S.encodeEffect(S.fromJsonString(S.Unknown))({ lockfileVersion: 3, packages: {
    "node_modules/": { link: true, name: "" },
    "node_modules/fallback": { link: true },
    "node_modules/named": { link: true, name: "explicit", resolved: "absent" },
    "node_modules/empty": { link: true, resolved: "" },
    "node_modules/versionless": {},
    "node_modules/normal": { version: "1", dependencies: { "": "*" } },
  } });
  const fields = yield* parseNpm(text);
  assert.deepStrictEqual(fields.packages.map((pkg) => [pkg.name, pkg.version, pkg.resolved]), [["fallback", "0.0.0", {}], ["explicit", "0.0.0", {}], ["empty", "0.0.0", {}], ["normal", "1", {}]]);
  assert.deepStrictEqual(fields.importers.map((entry) => [entry.path, entry.dependencies]), [["absent", []]]);
}));
