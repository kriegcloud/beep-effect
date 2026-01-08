import { computeTranspilePackages } from "@beep/build-utils/transpile-packages";
import { describe, expect, layer } from "@beep/testkit";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const TestLayer = Layer.mergeAll(BunContext.layer, FsUtilsLive);

describe("computeTranspilePackages", () => {
  describe("when targeting @beep/web", () => {
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

  describe("when targeting a non-existent package", () => {
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
