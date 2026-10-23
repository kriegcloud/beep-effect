import { DevEngine, DevEnginesSchema } from "@beep/package-json/DevEngines";
import { assert, describe, it } from "@effect/vitest";
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
