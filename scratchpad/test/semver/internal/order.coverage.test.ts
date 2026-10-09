import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { compareBuild, compareParts, comparePrereleaseIdentifier, type VersionParts } from "../../../effected/semver/internal/order.ts";

const version = (major = 1, minor = 2, patch = 3, prerelease: ReadonlyArray<string | number> = [], build: ReadonlyArray<string> = []): VersionParts =>
  ({ major, minor, patch, prerelease, build });

describe("internal order branch coverage", () => {
  it.effect("identifier ordering is numeric, lexical, and numeric-before-text in both call forms", () => Effect.sync(() => {
    const cases: ReadonlyArray<readonly [string | number, string | number, number]> = [
      [2, 10, -8], [10, 2, 8], [2, 2, 0], ["alpha", "beta", -1], ["beta", "alpha", 1],
      ["alpha", "alpha", 0], [1, "alpha", -1], ["alpha", 1, 1],
    ];
    for (const [a, b, expected] of cases) {
      assert.strictEqual(comparePrereleaseIdentifier(a, b), expected);
      assert.strictEqual(comparePrereleaseIdentifier(b)(a), expected);
    }
  }));

  it.effect("core components, release status, identifier precedence and prefix length determine version order", () => Effect.sync(() => {
    const cases: ReadonlyArray<readonly [VersionParts, VersionParts, -1 | 0 | 1]> = [
      [version(0), version(), -1], [version(2), version(), 1],
      [version(1, 1), version(), -1], [version(1, 3), version(), 1],
      [version(1, 2, 2), version(), -1], [version(1, 2, 4), version(), 1],
      [version(), version(1, 2, 3, [], ["ignored"]), 0],
      [version(), version(1, 2, 3, ["alpha"]), 1], [version(1, 2, 3, ["alpha"]), version(), -1],
      [version(1, 2, 3, ["alpha", 1]), version(1, 2, 3, ["alpha", 2]), -1],
      [version(1, 2, 3, ["beta"]), version(1, 2, 3, ["alpha"]), 1],
      [version(1, 2, 3, ["alpha"]), version(1, 2, 3, ["alpha", 1]), -1],
      [version(1, 2, 3, ["alpha", 1]), version(1, 2, 3, ["alpha"]), 1],
      [version(1, 2, 3, ["alpha", 1], ["first"]), version(1, 2, 3, ["alpha", 1], ["second"]), 0],
    ];
    for (const [a, b, expected] of cases) {
      assert.strictEqual(compareParts(a, b), expected);
      assert.strictEqual(compareParts(b)(a), expected);
    }
  }));

  it.effect("build ordering handles absent metadata, lexical differences and equal prefixes", () => Effect.sync(() => {
    const cases: ReadonlyArray<readonly [ReadonlyArray<string>, ReadonlyArray<string>, -1 | 0 | 1]> = [
      [[], [], 0], [[], ["a"], -1], [["a"], [], 1],
      [["10"], ["2"], -1], [["b"], ["a"], 1], [["a"], ["a"], 0],
      [["a"], ["a", "1"], -1], [["a", "1"], ["a"], 1],
      [["a", "1"], ["a", "2"], -1],
    ];
    for (const [a, b, expected] of cases) {
      assert.strictEqual(compareBuild(a, b), expected);
      assert.strictEqual(compareBuild(b)(a), expected);
    }
  }));
});
