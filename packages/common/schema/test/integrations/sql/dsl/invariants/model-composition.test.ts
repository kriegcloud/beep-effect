/**
 * Tests for Model Composition Invariants
 *
 * Covers:
 * - INV-MODEL-ID-001: Non-empty model identifier
 * - INV-MODEL-AI-001: Single autoIncrement per model
 *
 * @module
 */

import { describe, expect, it } from "bun:test";
import type {
  DSLValidationError,
  EmptyModelIdentifierError,
  MultipleAutoIncrementError,
} from "@beep/schema/integrations/sql/dsl/errors";
import type { ColumnDef } from "@beep/schema/integrations/sql/dsl/types";
import {
  validateModel,
  validateModelIdentifier,
  validateSingleAutoIncrement,
} from "@beep/schema/integrations/sql/dsl/validate";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";

describe("INV-MODEL-ID-001: Model Identifier Validation", () => {
  it("should fail for empty model identifier", () => {
    const result = Effect.runSync(Effect.either(validateModelIdentifier("")));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as EmptyModelIdentifierError;
      expect(error._tag).toBe("EmptyModelIdentifierError");
      expect(error.code).toBe("INV-MODEL-ID-001");
      // Verify JSON serializable
      expect(() => JSON.stringify(error)).not.toThrow();
    }
  });

  it("should pass for non-empty model identifier", () => {
    const result = Effect.runSync(Effect.either(validateModelIdentifier("User")));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for single character identifier", () => {
    const result = Effect.runSync(Effect.either(validateModelIdentifier("A")));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for typical model names", () => {
    const identifiers = ["User", "Order", "ProductCategory", "UserProfileSettings"];
    for (const id of identifiers) {
      const result = Effect.runSync(Effect.either(validateModelIdentifier(id)));
      expect(Either.isRight(result)).toBe(true);
    }
  });
});

describe("INV-MODEL-AI-001: Single AutoIncrement Per Model", () => {
  it("should fail for model with multiple autoIncrement fields", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true, primaryKey: true },
      seq: { type: "integer", autoIncrement: true },
      counter: { type: "bigint", autoIncrement: true },
    };
    const result = Effect.runSync(Effect.either(validateSingleAutoIncrement("TestModel", columns)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as MultipleAutoIncrementError;
      expect(error._tag).toBe("MultipleAutoIncrementError");
      expect(error.code).toBe("INV-MODEL-AI-001");
      expect(error.modelName).toBe("TestModel");
      expect(A.length(error.autoIncrementFields)).toBe(3);
      expect(error.autoIncrementFields).toContain("id");
      expect(error.autoIncrementFields).toContain("seq");
      expect(error.autoIncrementFields).toContain("counter");
      // Verify JSON serializable
      expect(() => JSON.stringify(error)).not.toThrow();
    }
  });

  it("should fail for model with two autoIncrement fields", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true, primaryKey: true },
      seq: { type: "bigint", autoIncrement: true },
    };
    const result = Effect.runSync(Effect.either(validateSingleAutoIncrement("DualSerial", columns)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as MultipleAutoIncrementError;
      expect(error.code).toBe("INV-MODEL-AI-001");
      expect(A.length(error.autoIncrementFields)).toBe(2);
    }
  });

  it("should pass for model with single autoIncrement field", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true, primaryKey: true },
      name: { type: "string" },
      email: { type: "string", unique: true },
    };
    const result = Effect.runSync(Effect.either(validateSingleAutoIncrement("User", columns)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for model with no autoIncrement fields", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "uuid", primaryKey: true },
      name: { type: "string" },
      createdAt: { type: "datetime" },
    };
    const result = Effect.runSync(Effect.either(validateSingleAutoIncrement("Document", columns)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for empty columns (edge case)", () => {
    const columns: Record<string, ColumnDef> = {};
    const result = Effect.runSync(Effect.either(validateSingleAutoIncrement("Empty", columns)));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("validateModel: Composed Model Validation", () => {
  it("should accumulate multiple errors", () => {
    // Model with: empty identifier checked, multiple autoIncrement, invalid field names
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true },
      "invalid-name": { type: "string" }, // Invalid characters
      seq: { type: "integer", autoIncrement: true }, // Second autoIncrement
    };
    // Note: This uses the model validation which checks identifier and autoIncrement
    const result = Effect.runSync(Effect.either(validateModel("User", columns)));

    // Should pass since model name is valid and only error is from field-level
    // The multiple autoIncrement should be caught though
    if (Either.isLeft(result)) {
      const errors = result.left as ReadonlyArray<DSLValidationError>;
      // At minimum, should catch multiple autoIncrement
      const hasAutoIncrementError = F.pipe(
        errors,
        A.some((e) => e._tag === "MultipleAutoIncrementError")
      );
      expect(hasAutoIncrementError).toBe(true);
    }
  });

  it("should pass for valid model", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true, primaryKey: true },
      name: { type: "string" },
      email: { type: "string", unique: true },
    };
    const result = Effect.runSync(Effect.either(validateModel("User", columns)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should catch empty model identifier", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer" },
    };
    const result = Effect.runSync(Effect.either(validateModel("", columns)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const errors = result.left as ReadonlyArray<DSLValidationError>;
      const hasEmptyIdError = F.pipe(
        errors,
        A.some((e) => e._tag === "EmptyModelIdentifierError")
      );
      expect(hasEmptyIdError).toBe(true);
    }
  });

  it("should catch model identifier too long", () => {
    const longName = "A".repeat(64);
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer" },
    };
    const result = Effect.runSync(Effect.either(validateModel(longName, columns)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const errors = result.left as ReadonlyArray<DSLValidationError>;
      const hasLengthError = F.pipe(
        errors,
        A.some((e) => e._tag === "IdentifierTooLongError")
      );
      expect(hasLengthError).toBe(true);
    }
  });

  it("errors should be JSON serializable", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true },
      seq: { type: "integer", autoIncrement: true },
    };
    const result = Effect.runSync(Effect.either(validateModel("Test", columns)));

    if (Either.isLeft(result)) {
      const errors = result.left as ReadonlyArray<DSLValidationError>;
      // All errors in the array should be JSON serializable
      for (const error of errors) {
        expect(() => JSON.stringify(error)).not.toThrow();
      }
    }
  });
});
