import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { parseBun } from "../../../effected/lockfiles/internal/bun.ts";

it.effect("skips empty identities and malformed metadata while retaining workspace defaults", () => Effect.gen(function* () {
  const text = yield* S.encodeEffect(S.fromJsonString(S.Unknown))({
    lockfileVersion: 1,
    workspaces: { lib: { name: "", dependencies: { "": "*" } } },
    packages: { "": ["empty@1"], lib: ["lib@1"], a: ["a@1", "", 42], b: ["b@1", "", {}, 42], c: ["c@1"] },
  });
  const fields = yield* parseBun(text);
  assert.deepStrictEqual(fields.packages.map((pkg) => [pkg.name, pkg.version, pkg.resolved]), [["lib", "0.0.0", {}], ["a", "1", {}], ["b", "1", {}], ["c", "1", {}]]);
  assert.deepStrictEqual(fields.importers.map((entry) => entry.dependencies), [[]]);
}));
