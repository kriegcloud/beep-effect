/**
 * @file Error Definition Tests
 *
 * Tests for the tagged error classes used in the create-slice command.
 *
 * @module create-slice/test/errors
 * @since 0.1.0
 */

import { describe, expect, it } from "bun:test";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import {
  type CreateSliceError,
  FileWriteError,
  InvalidSliceNameError,
  SliceExistsError,
  TemplateError,
  TsMorphError,
  withCause,
} from "../../../src/commands/create-slice/errors.js";

// -----------------------------------------------------------------------------
// SliceExistsError Tests
// -----------------------------------------------------------------------------

describe("SliceExistsError", () => {
  it("should create error with correct _tag", () => {
    const error = new SliceExistsError({ sliceName: "my-slice" });

    expect(error._tag).toContain("SliceExistsError");
  });

  it("should store sliceName property", () => {
    const error = new SliceExistsError({ sliceName: "notifications" });

    expect(error.sliceName).toBe("notifications");
  });

  it("should generate displayMessage containing slice name", () => {
    const error = new SliceExistsError({ sliceName: "my-slice" });

    expect(error.displayMessage).toContain("my-slice");
    expect(error.displayMessage).toContain("already exists");
  });

  it("should generate displayMessage with path hint", () => {
    const error = new SliceExistsError({ sliceName: "auth" });

    expect(error.displayMessage).toContain("packages/auth/");
  });

  it("should be usable with Effect.fail", async () => {
    const effect = Effect.fail(new SliceExistsError({ sliceName: "test" }));
    const exit = await Effect.runPromiseExit(effect);

    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const errors = F.pipe(Cause.failures(exit.cause), A.fromIterable);
      expect(A.length(errors)).toBe(1);
      const firstError = F.pipe(errors, A.head);
      expect(firstError._tag).toBe("Some");
      if (firstError._tag === "Some") {
        expect(firstError.value._tag).toContain("SliceExistsError");
      }
    }
  });

  it("should work with Effect.catchTag", async () => {
    const error = new SliceExistsError({ sliceName: "test" });
    const effect = F.pipe(
      Effect.fail(error) as Effect.Effect<never, CreateSliceError>,
      Effect.catchTag(error._tag, (e) => Effect.succeed(`Caught: ${(e as SliceExistsError).sliceName}`))
    );

    const result = await Effect.runPromise(effect);
    expect(result).toBe("Caught: test");
  });
});

// -----------------------------------------------------------------------------
// InvalidSliceNameError Tests
// -----------------------------------------------------------------------------

describe("InvalidSliceNameError", () => {
  it("should create error with correct _tag", () => {
    const error = new InvalidSliceNameError({
      sliceName: "bad!name",
      reason: "contains special characters",
    });

    expect(error._tag).toContain("InvalidSliceNameError");
  });

  it("should store sliceName and reason properties", () => {
    const error = new InvalidSliceNameError({
      sliceName: "123invalid",
      reason: "must start with a letter",
    });

    expect(error.sliceName).toBe("123invalid");
    expect(error.reason).toBe("must start with a letter");
  });

  it("should generate displayMessage with name and reason", () => {
    const error = new InvalidSliceNameError({
      sliceName: "UPPERCASE",
      reason: "must be lowercase kebab-case",
    });

    expect(error.displayMessage).toContain("UPPERCASE");
    expect(error.displayMessage).toContain("lowercase kebab-case");
  });

  it("should be catchable by tag", async () => {
    const error = new InvalidSliceNameError({ sliceName: "bad", reason: "test" });
    const effect = F.pipe(
      Effect.fail(error) as Effect.Effect<never, CreateSliceError>,
      Effect.catchTag(error._tag, (e) => Effect.succeed(`Invalid: ${(e as InvalidSliceNameError).reason}`))
    );

    const result = await Effect.runPromise(effect);
    expect(result).toBe("Invalid: test");
  });
});

// -----------------------------------------------------------------------------
// FileWriteError Tests
// -----------------------------------------------------------------------------

describe("FileWriteError", () => {
  it("should create error with correct _tag", () => {
    const error = new FileWriteError({
      filePath: "/path/to/file.ts",
      cause: new Error("permission denied"),
    });

    expect(error._tag).toContain("FileWriteError");
  });

  it("should store filePath and cause properties", () => {
    const originalError = new Error("ENOENT");
    const error = new FileWriteError({
      filePath: "/home/user/file.json",
      cause: originalError,
    });

    expect(error.filePath).toBe("/home/user/file.json");
    expect(error.cause).toBe(originalError);
  });

  it("should generate displayMessage with file path", () => {
    const error = new FileWriteError({
      filePath: "/path/to/package.json",
      cause: new Error("disk full"),
    });

    expect(error.displayMessage).toContain("/path/to/package.json");
    expect(error.displayMessage).toContain("Failed to write");
  });

  it("should work with various cause types", () => {
    const stringCause = new FileWriteError({ filePath: "/test", cause: "string error" });
    const objectCause = new FileWriteError({ filePath: "/test", cause: { code: "EPERM" } });
    const undefinedCause = new FileWriteError({ filePath: "/test", cause: undefined });

    expect(stringCause.cause).toBe("string error");
    expect(objectCause.cause).toEqual({ code: "EPERM" });
    expect(undefinedCause.cause).toBeUndefined();
  });
});

// -----------------------------------------------------------------------------
// TsMorphError Tests
// -----------------------------------------------------------------------------

describe("TsMorphError", () => {
  it("should create error with correct _tag", () => {
    const error = new TsMorphError({
      filePath: "/path/to/source.ts",
      operation: "addImport",
      cause: new Error("node not found"),
    });

    expect(error._tag).toContain("TsMorphError");
  });

  it("should store filePath, operation, and cause properties", () => {
    const error = new TsMorphError({
      filePath: "/packages/identity/packages.ts",
      operation: "addExportDeclaration",
      cause: new Error("syntax error"),
    });

    expect(error.filePath).toBe("/packages/identity/packages.ts");
    expect(error.operation).toBe("addExportDeclaration");
    expect(error.cause).toBeInstanceOf(Error);
  });

  it("should generate displayMessage with file and operation", () => {
    const error = new TsMorphError({
      filePath: "/path/to/source.ts",
      operation: "addImport",
      cause: new Error("test"),
    });

    expect(error.displayMessage).toContain("source.ts");
    expect(error.displayMessage).toContain("addImport");
    expect(error.displayMessage).toContain("ts-morph");
  });

  it("should support optional underlyingCause", () => {
    const rootCause = new Error("root cause");
    const error = new TsMorphError({
      filePath: "/test.ts",
      operation: "save",
      cause: new Error("wrapper"),
      underlyingCause: rootCause,
    });

    expect(error.underlyingCause).toBe(rootCause);
  });

  it("should support optional stack", () => {
    const error = new TsMorphError({
      filePath: "/test.ts",
      operation: "load",
      cause: new Error("test"),
      stack: "Error: test\n    at TestFunction",
    });

    expect(error.stack).toContain("at TestFunction");
  });
});

// -----------------------------------------------------------------------------
// TemplateError Tests
// -----------------------------------------------------------------------------

describe("TemplateError", () => {
  it("should create error with correct _tag", () => {
    const error = new TemplateError({
      templateName: "package.json.hbs",
      cause: new Error("syntax error"),
    });

    expect(error._tag).toContain("TemplateError");
  });

  it("should store templateName and cause properties", () => {
    const error = new TemplateError({
      templateName: "tsconfig.json.hbs",
      cause: new Error("missing helper"),
    });

    expect(error.templateName).toBe("tsconfig.json.hbs");
    expect(error.cause).toBeInstanceOf(Error);
  });

  it("should generate displayMessage with template name", () => {
    const error = new TemplateError({
      templateName: "index.ts.hbs",
      cause: new Error("invalid syntax"),
    });

    expect(error.displayMessage).toContain("index.ts.hbs");
    expect(error.displayMessage).toContain("Failed to compile");
  });
});

// -----------------------------------------------------------------------------
// withCause Helper Tests
// -----------------------------------------------------------------------------

describe("withCause helper", () => {
  it("should add underlyingCause to error", () => {
    const originalError = new Error("original");
    const error = new SliceExistsError({ sliceName: "test" });
    const errorWithCause = withCause(error, originalError);

    expect(errorWithCause.underlyingCause).toBe(originalError);
  });

  it("should add stack trace", () => {
    const error = new SliceExistsError({ sliceName: "test" });
    const errorWithCause = withCause(error, new Error("cause"));

    expect(errorWithCause.stack).toBeDefined();
    expect(typeof errorWithCause.stack).toBe("string");
  });

  it("should preserve original error properties", () => {
    const error = new InvalidSliceNameError({
      sliceName: "bad",
      reason: "invalid chars",
    });
    const errorWithCause = withCause(error, new Error("root"));

    expect(errorWithCause.sliceName).toBe("bad");
    expect(errorWithCause.reason).toBe("invalid chars");
    expect(errorWithCause._tag).toContain("InvalidSliceNameError");
  });

  it("should work with different cause types", () => {
    const error = new FileWriteError({ filePath: "/test", cause: "initial" });

    const withStringCause = withCause(error, "string cause");
    const withObjectCause = withCause(error, { code: "ERR" });
    const withNullCause = withCause(error, null);

    expect(withStringCause.underlyingCause).toBe("string cause");
    expect(withObjectCause.underlyingCause).toEqual({ code: "ERR" });
    expect(withNullCause.underlyingCause).toBeNull();
  });
});

// -----------------------------------------------------------------------------
// CreateSliceError Union Type Tests
// -----------------------------------------------------------------------------

describe("CreateSliceError union type", () => {
  it("should allow all error types in union", async () => {
    const errors: CreateSliceError[] = [
      new SliceExistsError({ sliceName: "test" }),
      new InvalidSliceNameError({ sliceName: "bad", reason: "test" }),
      new FileWriteError({ filePath: "/test", cause: "err" }),
      new TsMorphError({ filePath: "/test", operation: "op", cause: "err" }),
      new TemplateError({ templateName: "test.hbs", cause: "err" }),
    ];

    expect(A.length(errors)).toBe(5);

    // Verify each has the required _tag property
    F.pipe(
      errors,
      A.forEach((error) => {
        expect(error._tag).toBeDefined();
        expect(typeof error._tag).toBe("string");
      })
    );
  });

  it("should allow exhaustive matching via _tag", () => {
    const handleError = (error: CreateSliceError): string => {
      // This simulates exhaustive pattern matching
      if (error._tag.includes("SliceExistsError")) {
        return "exists";
      }
      if (error._tag.includes("InvalidSliceNameError")) {
        return "invalid";
      }
      if (error._tag.includes("FileWriteError")) {
        return "file";
      }
      if (error._tag.includes("TsMorphError")) {
        return "tsmorph";
      }
      if (error._tag.includes("TemplateError")) {
        return "template";
      }
      return "unknown";
    };

    expect(handleError(new SliceExistsError({ sliceName: "t" }))).toBe("exists");
    expect(handleError(new InvalidSliceNameError({ sliceName: "t", reason: "r" }))).toBe("invalid");
    expect(handleError(new FileWriteError({ filePath: "p", cause: "c" }))).toBe("file");
    expect(handleError(new TsMorphError({ filePath: "p", operation: "o", cause: "c" }))).toBe("tsmorph");
    expect(handleError(new TemplateError({ templateName: "n", cause: "c" }))).toBe("template");
  });
});

// -----------------------------------------------------------------------------
// Error Integration with Effect Tests
// -----------------------------------------------------------------------------

describe("Error integration with Effect", () => {
  it("should chain errors using Effect.mapError", async () => {
    const program = F.pipe(
      Effect.fail(new SliceExistsError({ sliceName: "original-slice" })),
      Effect.mapError(
        (cause) =>
          new FileWriteError({
            filePath: "/test/file.ts",
            cause,
          })
      )
    );

    const exit = await Effect.runPromiseExit(program);

    expect(Exit.isFailure(exit)).toBe(true);
    if (Exit.isFailure(exit)) {
      const errors = F.pipe(Cause.failures(exit.cause), A.fromIterable);
      const error = F.pipe(errors, A.head);
      expect(error._tag).toBe("Some");
      if (error._tag === "Some") {
        expect(error.value._tag).toContain("FileWriteError");
      }
    }
  });

  it("should recover from specific errors", async () => {
    const error = new SliceExistsError({ sliceName: "existing-slice" });
    const program = F.pipe(
      Effect.fail(error) as Effect.Effect<string, CreateSliceError>,
      Effect.catchTag(error._tag, (e) => Effect.succeed(`Recovered from: ${(e as SliceExistsError).sliceName}`))
    );

    const result = await Effect.runPromise(program);
    expect(result).toBe("Recovered from: existing-slice");
  });

  it("should not catch unrelated errors", async () => {
    const sliceError = new SliceExistsError({ sliceName: "test" });
    const program = F.pipe(
      Effect.fail(new FileWriteError({ filePath: "/test", cause: "err" })) as Effect.Effect<string, CreateSliceError>,
      Effect.catchTag(sliceError._tag, () => Effect.succeed("Should not reach here"))
    );

    const exit = await Effect.runPromiseExit(program);
    expect(Exit.isFailure(exit)).toBe(true);
  });
});
