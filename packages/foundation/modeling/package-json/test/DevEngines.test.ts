import { DevEngine, DevEnginesSchema } from "@beep/package-json/DevEngines";
import { Package } from "@beep/package-json/Package";
import { assert, describe, it } from "@effect/vitest";
import { assertTrue, deepStrictEqual, strictEqual } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

describe("DevEngine", () => {
  it("constructs with optional version and onFail", () => {
    const engine = DevEngine.make({ name: "node", version: "24.11.0", onFail: "ignore" });
    assert.strictEqual(engine.name, "node");
    assert.strictEqual(engine.version, "24.11.0");
    assert.strictEqual(engine.onFail, "ignore");
  });
});

describe("DevEnginesSchema", () => {
  it.effect("decodes a single packageManager constraint and a runtime array", () =>
    Effect.gen(function* () {
      const decoded = yield* S.decodeEffect(DevEnginesSchema)({
        packageManager: { name: "pnpm", version: "10.33.0", onFail: "ignore" },
        runtime: [{ name: "node", version: "24.11.0", onFail: "ignore" }],
      });
      // W3-h conformance shift: DevEngine is an Opaque record, so a decoded
      // constraint is a plain object recognised structurally, not a class instance.
      assert.isTrue(S.is(DevEngine)(decoded.packageManager));
      assert.strictEqual(Object.getPrototypeOf(decoded.packageManager), Object.prototype);
      assert.isTrue(A.isArray(decoded.runtime));
    })
  );
});

// npm documents `warn`, `error` and `ignore`; `download` is the OpenJS
// devEngines proposal value pnpm implements (3-A2).
describe("DevEngine.onFail", () => {
  it.effect("accepts download, per the OpenJS devEngines proposal pnpm implements", () =>
    Effect.gen(function* () {
      const wire = { runtime: { name: "node", version: "^24.0.0", onFail: "download" as const } };
      const decoded = yield* S.decodeEffect(DevEnginesSchema)(wire);
      assertTrue(S.is(DevEngine)(decoded.runtime));
      deepStrictEqual(yield* S.encodeEffect(DevEnginesSchema)(decoded), wire);
      const devEngines = { packageManager: { name: "pnpm", onFail: "download" as const } };
      const pkg = yield* Package.decode({ name: "pkg", version: "1.0.0", devEngines });
      deepStrictEqual((yield* S.encodeUnknownEffect(Package.schema)(pkg)).devEngines, devEngines);
    })
  );

  it.effect("still rejects a value outside warn, error, ignore and download", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(S.decodeUnknownEffect(DevEngine)({ name: "node", onFail: "retry" }));
      strictEqual(error._tag, "SchemaError");
    })
  );
});
