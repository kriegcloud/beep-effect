import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { compareSemver, parseKonsoleVersion, parseVteVersion } from "../../../../effected/env/internal/osc8/semver.ts";

describe("semver edge behaviour", () => {
  it.effect("compares fixed components, zero defaults and permissive suffixes in both call forms", () =>
    Effect.sync(() => {
      assert.strictEqual(compareSemver("2", "2.0.0"), 0);
      assert.strictEqual(compareSemver("2.3", "2.3.0"), 0);
      assert.strictEqual(compareSemver("2.3.4-beta", "2.3.4+build"), 0);
      assert.strictEqual(compareSemver("2.3.5", "2.3.4"), 1);
      assert.strictEqual(compareSemver("2.3.4")("2.4.0"), 1);
      assert.strictEqual(compareSemver("unknown", "2"), 0);
      assert.strictEqual(compareSemver("2", "unknown"), 0);
    })
  );

  it.effect("rejects missing, negative and nonfinite packed values but accepts numeric prefixes", () =>
    Effect.sync(() => {
      for (const parse of [parseVteVersion, parseKonsoleVersion]) {
        for (const raw of [undefined, "", "unknown", "-1", "9".repeat(400)]) {
          assert.strictEqual(parse(raw), null);
        }
        assert.strictEqual(parse("0005202tail"), "0.52.2");
        assert.strictEqual(parse("  +220401suffix"), "22.4.1");
        assert.strictEqual(parse("0"), "0.0.0");
      }
    })
  );
});
