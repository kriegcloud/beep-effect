import { ConfigDependencySpec } from "@beep/repo-workspaces/ConfigDependencySpec";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("version failures explain the exact-version requirement", () =>
  Effect.gen(function* () {
    const failure = yield* Effect.flip(ConfigDependencySpec.parse("latest"));
    assert.strictEqual(failure.input, "latest");
    assert.strictEqual(failure.reason, "version");
    assert.include(failure.message, "version must be an exact SemVer version");
  })
);
