# DSL Metadata Invariant Validation System - Implementation Prompt

## Context

You are implementing a comprehensive validation system for the `beep-effect` SQL DSL that compiles Effect Schema definitions into PostgreSQL-compatible metadata via Drizzle ORM.

### Codebase Location

- **Source**: `packages/common/schema/src/integrations/sql/dsl/`
- **Tests**: `packages/common/schema/test/integrations/sql/dsl/`
- **Research**: `.specs/dsl-invariants/research/` (5 detailed reports)
- **Synthesis**: `.specs/dsl-invariants/research-results.md`

### Current Architecture

The DSL consists of:

1. **Field Factory** (`Field.ts`) - Creates schema fields with column metadata via `[ColumnMetaSymbol]`
2. **Model Factory** (`Model.ts`) - Compiles fields into Model classes with variant schemas
3. **ColumnDef** (`types.ts`) - Runtime column metadata (type, primaryKey, unique, autoIncrement, defaultValue)
4. **Drizzle Adapter** (`adapters/drizzle.ts`) - Converts Models to Drizzle `pgTable()` definitions
5. **Type Derivation** (`derive-column-type.ts`) - Infers SQL column type from Effect Schema AST
6. **Nullability Analysis** (`nullability.ts`) - Derives nullable status from AST

---

## Objective

Build a validation layer that enforces 96 documented invariants across four categories:

1. **SQL Standard Invariants** (19) - PostgreSQL constraints and semantics
2. **Type Compatibility Invariants** (30) - Effect Schema to SQL type mappings
3. **Model Composition Invariants** (30) - Field interactions and naming
4. **Drizzle Adapter Invariants** (17) - Conversion constraints

### Success Criteria

- [ ] All critical invariants validated at compile-time or runtime
- [ ] Warning-level invariants emit diagnostics without blocking
- [ ] Errors accumulate (all issues shown, not just first)
- [ ] Beautiful, actionable error messages with fix suggestions
- [ ] Zero regression in existing tests
- [ ] Test coverage for each implemented invariant

---

## Mandatory Conventions

All implementation code MUST follow these patterns from `AGENTS.md`:

### Effect-First Requirements

```typescript
// REQUIRED imports
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";
```

### Forbidden Patterns

```typescript
// FORBIDDEN → REQUIRED
items.map(fn)           → F.pipe(items, A.map(fn))
items.filter(pred)      → F.pipe(items, A.filter(pred))
str.split(",")          → F.pipe(str, Str.split(","))
Object.keys(obj)        → F.pipe(obj, Struct.keys)
switch (x._tag) { }     → Match.value(x).pipe(Match.tag(...), Match.exhaustive)
typeof x === "string"   → P.isString(x)
new Date()              → DateTime.unsafeNow()
items.forEach(fn)       → F.pipe(items, A.forEach(fn))
```

### Error Handling

- Use `S.TaggedError` for all validation errors
- No `throw` statements in validation logic
- Errors must be JSON-serializable and PII-free

---

## Implementation Plan

### Phase 1: Error Infrastructure

Create the error hierarchy in `packages/common/schema/src/integrations/sql/dsl/errors.ts`:

```typescript
import * as S from "effect/Schema";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";

/**
 * Base error for all DSL validation failures.
 */
export class DSLValidationError extends S.TaggedError<DSLValidationError>()(
  "DSLValidationError",
  {
    message: S.String,
    code: S.String,
    severity: S.Literal("error", "warning"),
    path: S.Array(S.String),
    expected: S.optional(S.String),
    received: S.optional(S.String),
    suggestion: S.optional(S.String),
    file: S.optional(S.String),
    line: S.optional(S.Number),
  },
  HttpApiSchema.annotations({ status: 400 })
) {}

// Field-level errors
export class InvalidColumnTypeError extends S.TaggedError<InvalidColumnTypeError>()(
  "InvalidColumnTypeError",
  {
    ...DSLValidationError.fields,
    modelName: S.String,
    fieldName: S.String,
    columnType: S.String,
    schemaType: S.String,
  }
) {}

export class AutoIncrementTypeError extends S.TaggedError<AutoIncrementTypeError>()(
  "AutoIncrementTypeError",
  {
    ...DSLValidationError.fields,
    fieldName: S.String,
    actualType: S.String,
  }
) {}

export class IdentifierTooLongError extends S.TaggedError<IdentifierTooLongError>()(
  "IdentifierTooLongError",
  {
    ...DSLValidationError.fields,
    identifierType: S.Literal("model", "field", "table"),
    identifier: S.String,
    length: S.Number,
    maxLength: S.Number,
  }
) {}

export class InvalidIdentifierError extends S.TaggedError<InvalidIdentifierError>()(
  "InvalidIdentifierError",
  {
    ...DSLValidationError.fields,
    identifierType: S.Literal("model", "field", "table"),
    identifier: S.String,
    reason: S.String,
  }
) {}

// Model-level errors
export class MultipleAutoIncrementError extends S.TaggedError<MultipleAutoIncrementError>()(
  "MultipleAutoIncrementError",
  {
    ...DSLValidationError.fields,
    modelName: S.String,
    autoIncrementFields: S.Array(S.String),
  }
) {}

export class EmptyModelIdentifierError extends S.TaggedError<EmptyModelIdentifierError>()(
  "EmptyModelIdentifierError",
  {
    ...DSLValidationError.fields,
  }
) {}

export class NullablePrimaryKeyError extends S.TaggedError<NullablePrimaryKeyError>()(
  "NullablePrimaryKeyError",
  {
    ...DSLValidationError.fields,
    modelName: S.String,
    fieldName: S.String,
    schemaType: S.String,
  }
) {}
```

### Phase 2: Validation Functions

Create validation utilities in `packages/common/schema/src/integrations/sql/dsl/validate.ts`:

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as Match from "effect/Match";
import * as Struct from "effect/Struct";
import * as Str from "effect/String";
import type { ColumnDef } from "./types.js";
import type { DSL } from "./types.js";
import {
  AutoIncrementTypeError,
  IdentifierTooLongError,
  InvalidIdentifierError,
  MultipleAutoIncrementError,
  EmptyModelIdentifierError,
  NullablePrimaryKeyError,
} from "./errors.js";
import { isNullable } from "./nullability.js";

const MAX_IDENTIFIER_LENGTH = 63;
const VALID_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;

// =============================================================================
// Field-Level Validators
// =============================================================================

/**
 * INV-SQL-AI-001: AutoIncrement requires integer or bigint type
 */
export const validateAutoIncrementType = (
  fieldName: string,
  def: ColumnDef
): Effect.Effect<void, AutoIncrementTypeError> =>
  F.pipe(
    Match.value({ autoIncrement: def.autoIncrement, type: def.type }),
    Match.when(
      ({ autoIncrement, type }) =>
        autoIncrement === true && type !== "integer" && type !== "bigint",
      ({ type }) =>
        Effect.fail(
          new AutoIncrementTypeError({
            message: `AutoIncrement requires integer or bigint type`,
            code: "INV-SQL-AI-001",
            severity: "error",
            path: [fieldName, "autoIncrement"],
            expected: "'integer' or 'bigint'",
            received: `'${type}'`,
            suggestion: "Change column type to 'integer' or 'bigint', or remove autoIncrement",
            fieldName,
            actualType: type,
          })
        )
    ),
    Match.orElse(() => Effect.void)
  );

/**
 * INV-SQL-ID-001: Identifier length <= 63 characters
 */
export const validateIdentifierLength = (
  identifierType: "model" | "field" | "table",
  identifier: string
): Effect.Effect<void, IdentifierTooLongError> =>
  F.pipe(
    identifier.length > MAX_IDENTIFIER_LENGTH,
    Match.value,
    Match.when(true, () =>
      Effect.fail(
        new IdentifierTooLongError({
          message: `Identifier exceeds PostgreSQL limit of ${MAX_IDENTIFIER_LENGTH} characters`,
          code: "INV-SQL-ID-001",
          severity: "error",
          path: [identifier],
          expected: `<= ${MAX_IDENTIFIER_LENGTH} characters`,
          received: `${identifier.length} characters`,
          suggestion: "Shorten the identifier name",
          identifierType,
          identifier,
          length: identifier.length,
          maxLength: MAX_IDENTIFIER_LENGTH,
        })
      )
    ),
    Match.when(false, () => Effect.void),
    Match.exhaustive
  );

/**
 * INV-SQL-ID-002: Valid identifier characters
 */
export const validateIdentifierChars = (
  identifierType: "model" | "field" | "table",
  identifier: string
): Effect.Effect<void, InvalidIdentifierError> =>
  F.pipe(
    VALID_IDENTIFIER_REGEX.test(identifier),
    Match.value,
    Match.when(false, () =>
      Effect.fail(
        new InvalidIdentifierError({
          message: `Identifier contains invalid characters`,
          code: "INV-SQL-ID-002",
          severity: "error",
          path: [identifier],
          expected: "Start with letter or underscore, contain only [a-zA-Z0-9_$]",
          received: `'${identifier}'`,
          suggestion: "Rename to use valid SQL identifier characters",
          identifierType,
          identifier,
          reason: "Invalid characters or starts with digit",
        })
      )
    ),
    Match.when(true, () => Effect.void),
    Match.exhaustive
  );

/**
 * Validates a single field's column definition
 */
export const validateField = (
  fieldName: string,
  def: ColumnDef
): Effect.Effect<void, AutoIncrementTypeError | IdentifierTooLongError | InvalidIdentifierError> =>
  Effect.all([
    validateAutoIncrementType(fieldName, def),
    validateIdentifierLength("field", fieldName),
    validateIdentifierChars("field", fieldName),
  ], { concurrency: "unbounded" }).pipe(Effect.asVoid);

// =============================================================================
// Model-Level Validators
// =============================================================================

/**
 * INV-MODEL-ID-001: Non-empty model identifier
 */
export const validateModelIdentifier = (
  identifier: string
): Effect.Effect<void, EmptyModelIdentifierError> =>
  F.pipe(
    Str.isEmpty(identifier),
    Match.value,
    Match.when(true, () =>
      Effect.fail(
        new EmptyModelIdentifierError({
          message: "Model identifier cannot be empty",
          code: "INV-MODEL-ID-001",
          severity: "error",
          path: ["identifier"],
          expected: "Non-empty string",
          received: "Empty string",
          suggestion: "Provide a meaningful identifier like 'User' or 'OrderItem'",
        })
      )
    ),
    Match.when(false, () => Effect.void),
    Match.exhaustive
  );

/**
 * INV-MODEL-AI-001: Single autoIncrement field per model
 */
export const validateSingleAutoIncrement = (
  modelName: string,
  columns: Record<string, ColumnDef>
): Effect.Effect<void, MultipleAutoIncrementError> => {
  const autoIncrementFields = F.pipe(
    columns,
    Struct.entries,
    A.filter(([_, def]) => def.autoIncrement === true),
    A.map(([key]) => key)
  );

  return F.pipe(
    autoIncrementFields.length > 1,
    Match.value,
    Match.when(true, () =>
      Effect.fail(
        new MultipleAutoIncrementError({
          message: `Model has ${autoIncrementFields.length} auto-increment fields`,
          code: "INV-MODEL-AI-001",
          severity: "error",
          path: [modelName, "autoIncrement"],
          expected: "At most one auto-increment field per model",
          received: `Fields: ${autoIncrementFields.join(", ")}`,
          suggestion: "Remove autoIncrement from all but one field",
          modelName,
          autoIncrementFields,
        })
      )
    ),
    Match.when(false, () => Effect.void),
    Match.exhaustive
  );
};

/**
 * INV-SQL-PK-001 / INV-MODEL-PK-003: Primary key non-nullability
 */
export const validatePrimaryKeyNonNullable = (
  modelName: string,
  fieldName: string,
  def: ColumnDef,
  fieldAst: import("effect/SchemaAST").AST
): Effect.Effect<void, NullablePrimaryKeyError> =>
  F.pipe(
    def.primaryKey === true && isNullable(fieldAst, "from"),
    Match.value,
    Match.when(true, () =>
      Effect.fail(
        new NullablePrimaryKeyError({
          message: "Primary key cannot be nullable",
          code: "INV-SQL-PK-001",
          severity: "error",
          path: [modelName, fieldName, "primaryKey"],
          expected: "Non-nullable schema (S.String, S.Int, etc.)",
          received: "Nullable schema (S.NullOr, S.OptionFromNullOr, etc.)",
          suggestion: "Remove nullable wrapper or remove primaryKey constraint",
          modelName,
          fieldName,
          schemaType: "nullable",
        })
      )
    ),
    Match.when(false, () => Effect.void),
    Match.exhaustive
  );

// =============================================================================
// Composite Validators
// =============================================================================

/**
 * Validates all fields in a Model, accumulating errors
 */
export const validateAllFields = <Columns extends Record<string, ColumnDef>>(
  modelName: string,
  columns: Columns
): Effect.Effect<void, ReadonlyArray<DSLValidationError>> =>
  Effect.gen(function* () {
    const fieldValidations = F.pipe(
      columns,
      Struct.entries,
      A.map(([fieldName, def]) => validateField(fieldName, def))
    );

    const results = yield* Effect.allSuccesses(fieldValidations);
    const failures = yield* Effect.all(
      F.pipe(
        fieldValidations,
        A.map((eff) =>
          Effect.matchCause(eff, {
            onFailure: (cause) => F.pipe(Cause.failures(cause), A.fromIterable),
            onSuccess: () => [] as const,
          })
        )
      )
    );

    const allErrors = F.pipe(failures, A.flatten);

    if (allErrors.length > 0) {
      return yield* Effect.fail(allErrors);
    }
  });

/**
 * Full model validation
 */
export const validateModel = <
  Identifier extends string,
  Columns extends Record<string, ColumnDef>,
  Fields extends DSL.Fields,
>(
  identifier: Identifier,
  columns: Columns,
  _fields: Fields
): Effect.Effect<void, ReadonlyArray<DSLValidationError>> =>
  Effect.gen(function* () {
    // Model-level checks
    yield* validateModelIdentifier(identifier).pipe(
      Effect.mapError((e) => [e])
    );

    yield* validateIdentifierLength("model", identifier).pipe(
      Effect.mapError((e) => [e])
    );

    yield* validateSingleAutoIncrement(identifier, columns).pipe(
      Effect.mapError((e) => [e])
    );

    // Field-level checks (accumulated)
    yield* validateAllFields(identifier, columns);
  });
```

### Phase 3: Pretty Printer

Create error formatting in `packages/common/schema/src/integrations/sql/dsl/format-error.ts`:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type { DSLValidationError } from "./errors.js";

// ANSI color codes
const colors = {
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[39m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
};

export interface FormatConfig {
  readonly useColors: boolean;
  readonly showSuggestions: boolean;
  readonly maxErrors: number;
}

export const defaultConfig: FormatConfig = {
  useColors: true,
  showSuggestions: true,
  maxErrors: 10,
};

/**
 * Formats a single validation error
 */
export const formatError = (
  error: DSLValidationError,
  config: FormatConfig = defaultConfig
): string => {
  const { useColors } = config;
  const c = useColors ? colors : {
    red: F.identity<string>,
    yellow: F.identity<string>,
    green: F.identity<string>,
    cyan: F.identity<string>,
    dim: F.identity<string>,
    bold: F.identity<string>,
  };

  const lines: string[] = [];

  // Header
  const severityBadge = error.severity === "error"
    ? c.red("ERROR")
    : c.yellow("WARN");
  const codeBadge = c.dim(`[${error.code}]`);
  const pathStr = error.path.join(".");

  lines.push(`${severityBadge} ${codeBadge} ${c.bold(pathStr)}`);

  // Message
  lines.push(`${c.dim("│")} ${error.message}`);

  // Expected/Received
  if (O.isSome(O.fromNullable(error.expected))) {
    lines.push(`${c.dim("│")}`);
    lines.push(`${c.dim("│")} Expected: ${c.green(error.expected!)}`);
    lines.push(`${c.dim("│")} Received: ${c.red(error.received!)}`);
  }

  // Suggestion
  if (config.showSuggestions && O.isSome(O.fromNullable(error.suggestion))) {
    lines.push(`${c.dim("│")}`);
    lines.push(`${c.dim("│")} ${c.cyan("💡 Fix:")} ${error.suggestion}`);
  }

  return lines.join("\n");
};

/**
 * Formats multiple validation errors with grouping
 */
export const formatErrors = (
  errors: ReadonlyArray<DSLValidationError>,
  config: FormatConfig = defaultConfig
): string => {
  const { useColors, maxErrors } = config;
  const c = useColors ? colors : {
    red: F.identity<string>,
    yellow: F.identity<string>,
    green: F.identity<string>,
    cyan: F.identity<string>,
    dim: F.identity<string>,
    bold: F.identity<string>,
  };

  if (errors.length === 0) {
    return c.green("✓ No validation errors");
  }

  const lines: string[] = [];
  const displayCount = Math.min(errors.length, maxErrors);

  // Header
  lines.push(c.red(`╭─ ${errors.length} validation error${errors.length > 1 ? "s" : ""}`));
  lines.push("");

  // Errors
  F.pipe(
    errors,
    A.take(displayCount),
    A.forEach((error, idx) => {
      if (idx > 0) lines.push("");
      lines.push(formatError(error, config));
    })
  );

  // Truncation notice
  if (errors.length > maxErrors) {
    lines.push("");
    lines.push(c.dim(`... and ${errors.length - maxErrors} more`));
  }

  // Footer
  lines.push("");
  lines.push(c.red("╰─"));

  return lines.join("\n");
};
```

### Phase 4: Integration

Modify `Field.ts` to add validation:

```typescript
// In Field.ts, add validation call
import { validateField } from "./validate.js";

// Inside Field factory, after extracting columnDef:
// Note: This is a runtime check that should be integrated carefully
// to not break existing code that doesn't expect Effect returns
```

Modify `Model.ts` to add validation:

```typescript
// In Model.ts, add model-level validation
import { validateModel } from "./validate.js";

// Inside Model factory, after extracting columns:
// Run validation and collect errors
```

### Phase 5: Testing

Create test file `packages/common/schema/test/integrations/sql/dsl/invariants/sql-standard.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import {
  validateAutoIncrementType,
  validateIdentifierLength,
  validateIdentifierChars,
  validateSingleAutoIncrement,
  validateModelIdentifier,
} from "../../../src/integrations/sql/dsl/validate.js";
import type { ColumnDef } from "../../../src/integrations/sql/dsl/types.js";

describe("INV-SQL-AI-001: AutoIncrement Type Restriction", () => {
  it("should fail for autoIncrement with string type", () => {
    const def: ColumnDef = { type: "string", autoIncrement: true };
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", def)
    ));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left.code).toBe("INV-SQL-AI-001");
      expect(result.left._tag).toBe("AutoIncrementTypeError");
    }
  });

  it("should pass for autoIncrement with integer type", () => {
    const def: ColumnDef = { type: "integer", autoIncrement: true };
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", def)
    ));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for autoIncrement with bigint type", () => {
    const def: ColumnDef = { type: "bigint", autoIncrement: true };
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", def)
    ));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass when autoIncrement is false", () => {
    const def: ColumnDef = { type: "string", autoIncrement: false };
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("name", def)
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("INV-SQL-ID-001: Identifier Length", () => {
  it("should fail for identifier > 63 characters", () => {
    const longName = "a".repeat(64);
    const result = Effect.runSync(Effect.either(
      validateIdentifierLength("field", longName)
    ));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left.code).toBe("INV-SQL-ID-001");
    }
  });

  it("should pass for identifier = 63 characters", () => {
    const maxName = "a".repeat(63);
    const result = Effect.runSync(Effect.either(
      validateIdentifierLength("field", maxName)
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("INV-SQL-ID-002: Identifier Characters", () => {
  it("should fail for identifier starting with digit", () => {
    const result = Effect.runSync(Effect.either(
      validateIdentifierChars("field", "123abc")
    ));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left.code).toBe("INV-SQL-ID-002");
    }
  });

  it("should pass for valid identifier", () => {
    const result = Effect.runSync(Effect.either(
      validateIdentifierChars("field", "user_name_123")
    ));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for identifier starting with underscore", () => {
    const result = Effect.runSync(Effect.either(
      validateIdentifierChars("field", "_private")
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("INV-MODEL-ID-001: Non-Empty Identifier", () => {
  it("should fail for empty identifier", () => {
    const result = Effect.runSync(Effect.either(
      validateModelIdentifier("")
    ));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left.code).toBe("INV-MODEL-ID-001");
    }
  });

  it("should pass for non-empty identifier", () => {
    const result = Effect.runSync(Effect.either(
      validateModelIdentifier("User")
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});

describe("INV-MODEL-AI-001: Single AutoIncrement", () => {
  it("should fail for multiple autoIncrement fields", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true },
      seq: { type: "integer", autoIncrement: true },
    };
    const result = Effect.runSync(Effect.either(
      validateSingleAutoIncrement("User", columns)
    ));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left.code).toBe("INV-MODEL-AI-001");
      expect(result.left.autoIncrementFields).toEqual(["id", "seq"]);
    }
  });

  it("should pass for single autoIncrement field", () => {
    const columns: Record<string, ColumnDef> = {
      id: { type: "integer", autoIncrement: true },
      name: { type: "string" },
    };
    const result = Effect.runSync(Effect.either(
      validateSingleAutoIncrement("User", columns)
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/errors.ts` | TaggedError hierarchy |
| `packages/common/schema/src/integrations/sql/dsl/validate.ts` | Validation functions |
| `packages/common/schema/src/integrations/sql/dsl/format-error.ts` | Pretty printer |
| `packages/common/schema/test/integrations/sql/dsl/invariants/sql-standard.test.ts` | SQL invariant tests |
| `packages/common/schema/test/integrations/sql/dsl/invariants/type-compatibility.test.ts` | Type tests |
| `packages/common/schema/test/integrations/sql/dsl/invariants/model-composition.test.ts` | Model tests |
| `packages/common/schema/test/integrations/sql/dsl/invariants/drizzle-adapter.test.ts` | Drizzle tests |

### Modified Files

| File | Changes |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/Field.ts` | Add field validation hook |
| `packages/common/schema/src/integrations/sql/dsl/Model.ts` | Add model validation |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` | Add pre-conversion validation |
| `packages/common/schema/src/integrations/sql/dsl/index.ts` | Export validation utilities |

---

## Implementation Checklist

### Phase 1: Error Infrastructure
- [ ] Create `errors.ts` with TaggedError hierarchy
- [ ] Export from `index.ts`
- [ ] Verify types compile correctly

### Phase 2: Core Validators
- [ ] Implement `validateAutoIncrementType` (INV-SQL-AI-001)
- [ ] Implement `validateIdentifierLength` (INV-SQL-ID-001)
- [ ] Implement `validateIdentifierChars` (INV-SQL-ID-002)
- [ ] Implement `validateModelIdentifier` (INV-MODEL-ID-001)
- [ ] Implement `validateSingleAutoIncrement` (INV-MODEL-AI-001)
- [ ] Implement `validatePrimaryKeyNonNullable` (INV-SQL-PK-001)

### Phase 3: Pretty Printer
- [ ] Implement `formatError` with ANSI colors
- [ ] Implement `formatErrors` with grouping
- [ ] Test output in terminal

### Phase 4: Integration
- [ ] Hook validation into Field factory
- [ ] Hook validation into Model factory
- [ ] Ensure backward compatibility (existing code doesn't break)

### Phase 5: Testing
- [ ] Write tests for each implemented invariant
- [ ] Verify error messages match expected format
- [ ] Run full test suite, ensure no regressions

### Phase 6: Documentation
- [ ] Add JSDoc to all public functions
- [ ] Update `index.ts` exports
- [ ] Document error codes in comments

---

## Validation Timing

| Invariant | When Validated |
|-----------|----------------|
| INV-SQL-AI-001 | Field creation |
| INV-SQL-ID-001 | Field/Model creation |
| INV-SQL-ID-002 | Field/Model creation |
| INV-MODEL-ID-001 | Model creation |
| INV-MODEL-AI-001 | Model creation (after columns extracted) |
| INV-SQL-PK-001 | Model creation (requires AST) |
| INV-DRZ-BUILD-002 | Drizzle conversion (toDrizzle call) |

---

## Error Code Reference

| Code | Invariant | Severity |
|------|-----------|----------|
| INV-SQL-AI-001 | AutoIncrement type restriction | Error |
| INV-SQL-ID-001 | Identifier length limit | Error |
| INV-SQL-ID-002 | Identifier character validation | Error |
| INV-SQL-ID-003 | Reserved word avoidance | Warning |
| INV-SQL-PK-001 | Primary key non-nullability | Error |
| INV-SQL-PK-002 | Primary key cardinality | Warning |
| INV-MODEL-ID-001 | Non-empty model identifier | Error |
| INV-MODEL-AI-001 | Single autoIncrement per model | Error |
| INV-DRZ-BUILD-002 | Serial requires integer | Error |

---

## Metadata

- **Research Reports**: 5 files in `.specs/dsl-invariants/research/`
- **Synthesis**: `.specs/dsl-invariants/research-results.md`
- **Total Invariants**: 96 (36 critical, 25 warning, 31 info)
- **Priority Implementation**: 6 critical invariants
