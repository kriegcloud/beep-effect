/**
 * Tests for path utilities.
 *
 * @module @beep/tooling-utils/test/repo/Paths
 */
import { buildRootRelativePath, calculateDepth, getDirectory, normalizePath } from "@beep/tooling-utils";
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { describe } from "bun:test";

describe("Paths", () => {
  describe("calculateDepth", () => {
    effect("returns 0 for root-level files", () =>
      Effect.gen(function* () {
        const depth = calculateDepth("tsconfig.json");
        strictEqual(depth, 0);
      })
    );

    effect("returns correct depth for nested paths", () =>
      Effect.gen(function* () {
        const depth = calculateDepth("packages/common/schema/tsconfig.build.json");
        strictEqual(depth, 3);
      })
    );

    effect("returns correct depth for deeply nested paths", () =>
      Effect.gen(function* () {
        const depth = calculateDepth("packages/calendar/server/src/handlers/index.ts");
        strictEqual(depth, 5);
      })
    );

    effect("handles single directory", () =>
      Effect.gen(function* () {
        const depth = calculateDepth("packages/file.ts");
        strictEqual(depth, 1);
      })
    );

    effect("handles empty path", () =>
      Effect.gen(function* () {
        const depth = calculateDepth("");
        strictEqual(depth, 0);
      })
    );
  });

  describe("buildRootRelativePath", () => {
    effect("builds correct relative path for sibling packages", () =>
      Effect.gen(function* () {
        const result = buildRootRelativePath(
          "packages/calendar/server/tsconfig.build.json",
          "packages/calendar/domain/tsconfig.build.json"
        );
        strictEqual(result, "../../../packages/calendar/domain/tsconfig.build.json");
      })
    );

    effect("builds correct relative path across different slices", () =>
      Effect.gen(function* () {
        const result = buildRootRelativePath(
          "packages/common/schema/tsconfig.build.json",
          "packages/iam/domain/tsconfig.build.json"
        );
        strictEqual(result, "../../../packages/iam/domain/tsconfig.build.json");
      })
    );

    effect("handles root-level source file", () =>
      Effect.gen(function* () {
        const result = buildRootRelativePath(
          "tsconfig.json",
          "packages/common/schema/tsconfig.build.json"
        );
        strictEqual(result, "packages/common/schema/tsconfig.build.json");
      })
    );

    effect("handles same directory source and target", () =>
      Effect.gen(function* () {
        const result = buildRootRelativePath(
          "packages/iam/domain/tsconfig.json",
          "packages/iam/domain/tsconfig.build.json"
        );
        strictEqual(result, "../../../packages/iam/domain/tsconfig.build.json");
      })
    );
  });

  describe("normalizePath", () => {
    effect("removes leading ./", () =>
      Effect.gen(function* () {
        const result = normalizePath("./packages/common/schema");
        strictEqual(result, "packages/common/schema");
      })
    );

    effect("removes trailing /", () =>
      Effect.gen(function* () {
        const result = normalizePath("packages/common/schema/");
        strictEqual(result, "packages/common/schema");
      })
    );

    effect("removes both leading ./ and trailing /", () =>
      Effect.gen(function* () {
        const result = normalizePath("./packages/common/schema/");
        strictEqual(result, "packages/common/schema");
      })
    );

    effect("leaves clean path unchanged", () =>
      Effect.gen(function* () {
        const result = normalizePath("packages/common/schema");
        strictEqual(result, "packages/common/schema");
      })
    );

    effect("handles single dot", () =>
      Effect.gen(function* () {
        const result = normalizePath(".");
        strictEqual(result, ".");
      })
    );

    effect("handles empty string", () =>
      Effect.gen(function* () {
        const result = normalizePath("");
        strictEqual(result, "");
      })
    );
  });

  describe("getDirectory", () => {
    effect("returns directory for nested file", () =>
      Effect.gen(function* () {
        const result = getDirectory("packages/common/schema/tsconfig.build.json");
        strictEqual(result, "packages/common/schema");
      })
    );

    effect("returns empty string for root-level file", () =>
      Effect.gen(function* () {
        const result = getDirectory("tsconfig.json");
        strictEqual(result, "");
      })
    );

    effect("returns directory for deeply nested file", () =>
      Effect.gen(function* () {
        const result = getDirectory("packages/iam/server/src/handlers/auth.ts");
        strictEqual(result, "packages/iam/server/src/handlers");
      })
    );

    effect("handles single directory", () =>
      Effect.gen(function* () {
        const result = getDirectory("src/index.ts");
        strictEqual(result, "src");
      })
    );
  });
});
