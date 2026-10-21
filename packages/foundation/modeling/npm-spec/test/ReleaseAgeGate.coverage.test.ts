import { ReleaseAgeGate } from "@beep/npm-spec/ReleaseAgeGate";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("trailing stars match an empty suffix and an empty package name", () =>
  Effect.sync(() => {
    assert.strictEqual(ReleaseAgeGate.matchesExclude("pkg", ["pkg***"]), true);
    assert.strictEqual(ReleaseAgeGate.matchesExclude("", ["***"]), true);
    assert.strictEqual(ReleaseAgeGate.matchesExclude("pkg", ["pkg***x"]), false);
    const gate = ReleaseAgeGate.combine({ ageMinutes: 60, exclude: ["pkg***"] });
    assert.deepStrictEqual(gate.filterVersions(["1.0.0"], {}, "pkg", 0), ["1.0.0"]);
  })
);
