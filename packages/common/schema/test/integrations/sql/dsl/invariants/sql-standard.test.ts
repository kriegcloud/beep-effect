/**
 * Tests for SQL Standard Invariants
 *
 * Covers:
 * - INV-SQL-AI-001: AutoIncrement requires integer/bigint type
 * - INV-SQL-ID-001: Identifier length <= 63 characters
 * - INV-SQL-ID-002: Valid SQL identifier characters
 * - INV-SQL-PK-001: Primary key non-nullability
 *
 * @module
 */

import { describe, expect, it } from "bun:test";
import type {
  AutoIncrementTypeError,
  IdentifierTooLongError,
  InvalidIdentifierCharsError,
  NullablePrimaryKeyError,
} from "@beep/schema/integrations/sql/dsl/errors";
import type { AnyColumnDef } from "@beep/schema/integrations/sql/dsl/types";
import {
  validateAutoIncrementType,
  validateIdentifierChars,
  validateIdentifierLength,
  validatePrimaryKeyNonNullable,
} from "@beep/schema/integrations/sql/dsl/validate";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";

describe("INV-SQL-AI-001: AutoIncrement Type Restriction", () => {
  it("should fail for autoIncrement with string type", () => {
    const def: AnyColumnDef = { type: "string", autoIncrement: true };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("id", def)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as AutoIncrementTypeError;
      expect(error._tag).toBe("AutoIncrementTypeError");
      expect(error.code).toBe("INV-SQL-AI-001");
      expect(error.fieldName).toBe("id");
      expect(error.actualType).toBe("string");
      // Verify JSON serializable
      expect(() => JSON.stringify(error)).not.toThrow();
    }
  });

  it("should fail for autoIncrement with boolean type", () => {
    const def: AnyColumnDef = { type: "boolean", autoIncrement: true };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("flag", def)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as AutoIncrementTypeError;
      expect(error.code).toBe("INV-SQL-AI-001");
      expect(error.actualType).toBe("boolean");
    }
  });

  it("should fail for autoIncrement with uuid type", () => {
    const def: AnyColumnDef = { type: "uuid", autoIncrement: true };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("id", def)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as AutoIncrementTypeError;
      expect(error.code).toBe("INV-SQL-AI-001");
      expect(error.actualType).toBe("uuid");
    }
  });

  it("should fail for autoIncrement with json type", () => {
    const def: AnyColumnDef = { type: "json", autoIncrement: true };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("data", def)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as AutoIncrementTypeError;
      expect(error.code).toBe("INV-SQL-AI-001");
    }
  });

  it("should pass for autoIncrement with integer type", () => {
    const def: AnyColumnDef = { type: "integer", autoIncrement: true };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("id", def)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for autoIncrement with bigint type", () => {
    const def: AnyColumnDef = { type: "bigint", autoIncrement: true };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("id", def)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass when autoIncrement is false regardless of type", () => {
    const def: AnyColumnDef = { type: "string", autoIncrement: false };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("name", def)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass when autoIncrement is undefined", () => {
    const def: AnyColumnDef = { type: "string" };
    const result = Effect.runSync(Effect.either(validateAutoIncrementType("name", def)));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("INV-SQL-ID-001: Identifier Length Validation", () => {
  it("should fail for identifier longer than 63 characters", () => {
    const longIdentifier = "a".repeat(64);
    const result = Effect.runSync(Effect.either(validateIdentifierLength(longIdentifier, ["Model", "field"])));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as IdentifierTooLongError;
      expect(error._tag).toBe("IdentifierTooLongError");
      expect(error.code).toBe("INV-SQL-ID-001");
      expect(error.length).toBe(64);
      expect(error.maxLength).toBe(63);
      // Verify JSON serializable
      expect(() => JSON.stringify(error)).not.toThrow();
    }
  });

  it("should fail for very long identifier (100+ chars)", () => {
    const veryLongIdentifier =
      "this_is_a_very_long_identifier_that_definitely_exceeds_the_postgresql_maximum_allowed_length_of_63";
    const result = Effect.runSync(Effect.either(validateIdentifierLength(veryLongIdentifier, ["Table"])));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as IdentifierTooLongError;
      expect(error.code).toBe("INV-SQL-ID-001");
    }
  });

  it("should pass for identifier exactly 63 characters", () => {
    const exactIdentifier = "a".repeat(63);
    const result = Effect.runSync(Effect.either(validateIdentifierLength(exactIdentifier, ["field"])));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for identifier shorter than 63 characters", () => {
    const shortIdentifier = "user_id";
    const result = Effect.runSync(Effect.either(validateIdentifierLength(shortIdentifier, ["Model", "id"])));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for typical table/column names", () => {
    const identifiers = ["users", "created_at", "user_profile_settings", "_rowId"];
    for (const id of identifiers) {
      const result = Effect.runSync(Effect.either(validateIdentifierLength(id, [id])));
      expect(Either.isRight(result)).toBe(true);
    }
  });
});

describe("INV-SQL-ID-002: Identifier Character Validation", () => {
  it("should fail for identifier starting with number", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("123abc", ["field"])));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as InvalidIdentifierCharsError;
      expect(error._tag).toBe("InvalidIdentifierCharsError");
      expect(error.code).toBe("INV-SQL-ID-002");
      // Verify JSON serializable
      expect(() => JSON.stringify(error)).not.toThrow();
    }
  });

  it("should fail for identifier containing spaces", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("user name", ["field"])));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as InvalidIdentifierCharsError;
      expect(error.code).toBe("INV-SQL-ID-002");
      expect(error.invalidChars).toContain(" ");
    }
  });

  it("should fail for identifier containing hyphens", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("user-name", ["field"])));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as InvalidIdentifierCharsError;
      expect(error.code).toBe("INV-SQL-ID-002");
      expect(error.invalidChars).toContain("-");
    }
  });

  it("should fail for identifier containing special characters", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("user@email", ["field"])));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as InvalidIdentifierCharsError;
      expect(error.code).toBe("INV-SQL-ID-002");
      expect(error.invalidChars).toContain("@");
    }
  });

  it("should pass for valid identifier starting with letter", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("userName", ["field"])));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for valid identifier starting with underscore", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("_rowId", ["field"])));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for identifier with dollar sign", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("user$type", ["field"])));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for identifier with numbers (not at start)", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("user123", ["field"])));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for snake_case identifiers", () => {
    const result = Effect.runSync(Effect.either(validateIdentifierChars("user_profile_settings", ["table"])));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("INV-SQL-PK-001: Primary Key Non-Nullability", () => {
  it("should fail for nullable primary key", () => {
    const result = Effect.runSync(Effect.either(validatePrimaryKeyNonNullable("id", true, true)));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      const error = result.left as NullablePrimaryKeyError;
      expect(error._tag).toBe("NullablePrimaryKeyError");
      expect(error.code).toBe("INV-SQL-PK-001");
      expect(error.fieldName).toBe("id");
      // Verify JSON serializable
      expect(() => JSON.stringify(error)).not.toThrow();
    }
  });

  it("should pass for non-nullable primary key", () => {
    const result = Effect.runSync(Effect.either(validatePrimaryKeyNonNullable("id", true, false)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for nullable non-primary key field", () => {
    const result = Effect.runSync(Effect.either(validatePrimaryKeyNonNullable("description", false, true)));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for non-nullable non-primary key field", () => {
    const result = Effect.runSync(Effect.either(validatePrimaryKeyNonNullable("name", false, false)));

    expect(Either.isRight(result)).toBe(true);
  });
});
