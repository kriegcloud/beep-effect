/**
 * @file Unit tests for docgen error classes.
 * @module docgen/errors.test
 */

import {
  AggregationError,
  DocgenConfigError,
  type DocgenError,
  DocgenProcessError,
  InvalidPackagePathError,
  PackageNotFoundError,
  TsConfigNotFoundError,
  TsMorphError,
} from "@beep/repo-cli/commands/docgen/errors";
import { describe, effect, expect, it } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

describe("errors", () => {
  describe("PackageNotFoundError", () => {
    it("creates with path only", () => {
      const error = new PackageNotFoundError({
        path: "/path/to/missing",
      });

      expect(error._tag).toBe("PackageNotFoundError");
      expect(error.path).toBe("/path/to/missing");
      // message is optional, when not provided it may be undefined or empty
      expect(error.message === undefined || error.message === "").toBe(true);
    });

    it("creates with path and message", () => {
      const error = new PackageNotFoundError({
        path: "/path/to/missing",
        message: "No package.json found",
      });

      expect(error._tag).toBe("PackageNotFoundError");
      expect(error.path).toBe("/path/to/missing");
      expect(error.message).toBe("No package.json found");
    });

    effect("can be caught by tag in Effect", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new PackageNotFoundError({
            path: "/test",
            message: "Test failure",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("PackageNotFoundError", (e) => Effect.succeed(`Caught: ${e.path}`))
        );

        expect(result).toBe("Caught: /test");
      })
    );
  });

  describe("DocgenConfigError", () => {
    it("creates with path and reason", () => {
      const error = new DocgenConfigError({
        path: "/path/to/docgen.json",
        reason: "Invalid JSON",
      });

      expect(error._tag).toBe("DocgenConfigError");
      expect(error.path).toBe("/path/to/docgen.json");
      expect(error.reason).toBe("Invalid JSON");
    });

    effect("can be caught by tag", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(new DocgenConfigError({ path: "/test", reason: "Test reason" }));

        const result = yield* failing.pipe(
          Effect.catchTag("DocgenConfigError", (e) => Effect.succeed(`Caught: ${e.reason}`))
        );

        expect(result).toBe("Caught: Test reason");
      })
    );
  });

  describe("TsMorphError", () => {
    it("creates with filePath and cause", () => {
      const cause = new Error("Syntax error in file");
      const error = new TsMorphError({
        filePath: "/path/to/file.ts",
        cause,
      });

      expect(error._tag).toBe("TsMorphError");
      expect(error.filePath).toBe("/path/to/file.ts");
      expect(error.cause).toBe(cause);
    });

    it("accepts string cause", () => {
      const error = new TsMorphError({
        filePath: "/path/to/file.ts",
        cause: "Parse error",
      });

      expect(error._tag).toBe("TsMorphError");
      expect(error.cause).toBe("Parse error");
    });

    effect("can be caught by tag", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new TsMorphError({
            filePath: "/test.ts",
            cause: new Error("Parse failed"),
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("TsMorphError", (e) => Effect.succeed(`Caught: ${e.filePath}`))
        );

        expect(result).toBe("Caught: /test.ts");
      })
    );
  });

  describe("DocgenProcessError", () => {
    it("creates with packageName, stderr, and exitCode", () => {
      const error = new DocgenProcessError({
        packageName: "@beep/utils",
        stderr: "Error: Example failed to compile",
        exitCode: 1,
      });

      expect(error._tag).toBe("DocgenProcessError");
      expect(error.packageName).toBe("@beep/utils");
      expect(error.stderr).toBe("Error: Example failed to compile");
      expect(error.exitCode).toBe(1);
    });

    it("works without optional exitCode", () => {
      const error = new DocgenProcessError({
        packageName: "@beep/types",
        stderr: "Unknown error",
      });

      expect(error._tag).toBe("DocgenProcessError");
      expect(error.exitCode).toBeUndefined();
    });

    effect("can be caught by tag", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new DocgenProcessError({
            packageName: "@beep/test",
            stderr: "Failed",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("DocgenProcessError", (e) => Effect.succeed(`Caught: ${e.packageName}`))
        );

        expect(result).toBe("Caught: @beep/test");
      })
    );
  });

  describe("TsConfigNotFoundError", () => {
    it("creates with packagePath and searchedFiles", () => {
      const error = new TsConfigNotFoundError({
        packagePath: "/path/to/package",
        searchedFiles: ["tsconfig.src.json", "tsconfig.build.json", "tsconfig.json"],
      });

      expect(error._tag).toBe("TsConfigNotFoundError");
      expect(error.packagePath).toBe("/path/to/package");
      expect(A.length(error.searchedFiles)).toBe(3);
    });

    it("can have empty searchedFiles", () => {
      const error = new TsConfigNotFoundError({
        packagePath: "/path/to/package",
        searchedFiles: [],
      });

      expect(A.length(error.searchedFiles)).toBe(0);
    });

    effect("can be caught by tag", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new TsConfigNotFoundError({
            packagePath: "/test",
            searchedFiles: ["tsconfig.json"],
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("TsConfigNotFoundError", (e) => Effect.succeed(`Caught: ${e.packagePath}`))
        );

        expect(result).toBe("Caught: /test");
      })
    );
  });

  describe("InvalidPackagePathError", () => {
    it("creates with path and reason", () => {
      const error = new InvalidPackagePathError({
        path: "/invalid/path",
        reason: "Not a directory",
      });

      expect(error._tag).toBe("InvalidPackagePathError");
      expect(error.path).toBe("/invalid/path");
      expect(error.reason).toBe("Not a directory");
    });

    effect("can be caught by tag", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new InvalidPackagePathError({
            path: "/test",
            reason: "Does not exist",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("InvalidPackagePathError", (e) => Effect.succeed(`Caught: ${e.reason}`))
        );

        expect(result).toBe("Caught: Does not exist");
      })
    );
  });

  describe("AggregationError", () => {
    it("creates with packageName and reason", () => {
      const error = new AggregationError({
        packageName: "@beep/schema",
        reason: "Failed to aggregate docs",
      });

      expect(error._tag).toBe("AggregationError");
      expect(error.packageName).toBe("@beep/schema");
      expect(error.reason).toBe("Failed to aggregate docs");
    });

    effect("can be caught by tag", () =>
      Effect.gen(function* () {
        const failing = Effect.fail(
          new AggregationError({
            packageName: "@beep/test",
            reason: "Aggregation failed",
          })
        );

        const result = yield* failing.pipe(
          Effect.catchTag("AggregationError", (e) => Effect.succeed(`Caught: ${e.packageName}`))
        );

        expect(result).toBe("Caught: @beep/test");
      })
    );
  });

  describe("DocgenError union type", () => {
    it("can match all error types with Match", () => {
      const errors: ReadonlyArray<DocgenError> = [
        new PackageNotFoundError({ path: "/test" }),
        new DocgenConfigError({ path: "/config", reason: "invalid" }),
        new TsMorphError({ filePath: "/file.ts", cause: "error" }),
        new DocgenProcessError({ packageName: "@beep/pkg", stderr: "error" }),
        new TsConfigNotFoundError({ packagePath: "/pkg", searchedFiles: [] }),
        new InvalidPackagePathError({ path: "/invalid", reason: "not found" }),
        new AggregationError({ packageName: "@beep/agg", reason: "failed" }),
      ];

      const matched = A.map(errors, (error) =>
        Match.value(error).pipe(
          Match.tag("PackageNotFoundError", () => "package-not-found"),
          Match.tag("DocgenConfigError", () => "docgen-config"),
          Match.tag("TsMorphError", () => "ts-morph"),
          Match.tag("DocgenProcessError", () => "docgen-process"),
          Match.tag("TsConfigNotFoundError", () => "tsconfig-not-found"),
          Match.tag("InvalidPackagePathError", () => "invalid-path"),
          Match.tag("AggregationError", () => "aggregation"),
          Match.exhaustive
        )
      );

      expect(A.length(matched)).toBe(7);
      expect(matched[0]).toBe("package-not-found");
      expect(matched[1]).toBe("docgen-config");
      expect(matched[2]).toBe("ts-morph");
      expect(matched[3]).toBe("docgen-process");
      expect(matched[4]).toBe("tsconfig-not-found");
      expect(matched[5]).toBe("invalid-path");
      expect(matched[6]).toBe("aggregation");
    });
  });
});
