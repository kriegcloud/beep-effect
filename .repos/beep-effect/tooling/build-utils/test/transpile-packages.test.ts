import { computeTranspilePackages } from "@beep/build-utils/transpile-packages";
import { describe, expect, layer } from "@beep/testkit";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

// FsUtilsLive provides BunFileSystem.layer which internally delegates to
// @effect/platform-node-shared's NodeFileSystem.layer. There is a known
// AbortSignal incompatibility between Bun and Node's fs module that causes
// these tests to fail. Skip until the upstream @effect/platform-bun package
// provides a native Bun filesystem implementation.
// See: https://github.com/Effect-TS/effect/issues
const TestLayer = FsUtilsLive;

describe("computeTranspilePackages", () => {
  // Skip these tests due to Bun/Node AbortSignal incompatibility in @effect/platform-bun
  // The BunFileSystem.layer delegates to @effect/platform-node-shared which uses Node's fs module
  // Node's fs.readFile expects Node's AbortSignal but receives Bun's AbortSignal
  describe.skip("when targeting @beep/web", () => {
    layer(TestLayer)((it) => {
      it.effect("should return an array of package names", () =>
        Effect.gen(function* () {
          const result = yield* computeTranspilePackages({ target: "@beep/web" });
          expect(Array.isArray(result)).toBe(true);
        })
      );

      it.effect("should only return @beep/* packages", () =>
        Effect.gen(function* () {
          const result = yield* computeTranspilePackages({ target: "@beep/web" });
          const allBeepPackages = A.every(result, (pkg) => pkg.startsWith("@beep/"));
          expect(allBeepPackages).toBe(true);
        })
      );

      it.effect("should return packages that need transpilation", () =>
        Effect.gen(function* () {
          const result = yield* computeTranspilePackages({ target: "@beep/web" });
          expect(result.length).toBeGreaterThan(0);
        })
      );

      it.effect("should not include duplicate packages", () =>
        Effect.gen(function* () {
          const result = yield* computeTranspilePackages({ target: "@beep/web" });
          const uniquePackages = new Set(result);
          expect(uniquePackages.size).toBe(result.length);
        })
      );
    });
  });

  // Skip this test due to same Bun/Node AbortSignal incompatibility
  describe.skip("when targeting a non-existent package", () => {
    layer(TestLayer)((it) => {
      it.effect("should fail with NoSuchElementException", () =>
        Effect.gen(function* () {
          const effect = computeTranspilePackages({
            target: "@beep/non-existent-package",
          });
          const exit = yield* Effect.exit(effect);
          expect(exit._tag).toBe("Failure");
        })
      );
    });
  });
});
