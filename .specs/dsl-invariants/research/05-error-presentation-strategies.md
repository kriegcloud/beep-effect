# DSL Validation Error Presentation - Effect Research Report

## Executive Summary

This research identifies optimal patterns for presenting beautiful, meaningful, and developer-friendly error messages when DSL invariants are violated in the beep-effect SQL DSL. By leveraging Effect's error handling ecosystem—including `Schema.TaggedError`, `Cause` composition, error accumulation, and structured logging—we can create validation errors that provide:

1. **Actionable guidance** with specific fix suggestions
2. **Visual hierarchy** using ANSI colors and box-drawing characters
3. **Progressive disclosure** showing summary first, details on demand
4. **Type-safe error handling** through tagged error hierarchies
5. **Multi-error accumulation** preserving all validation failures

The recommended approach uses a base `DSLValidationError` class with specialized subtypes for each invariant category, integrated with the existing `@beep/errors` and `@beep/invariant` infrastructure.

## Problem Statement

When DSL validation fails (e.g., multiple primary keys, incompatible column types, missing required fields), developers need immediate, clear feedback that:

- Identifies which Model/Field has the issue
- Explains what rule was violated and why
- Suggests concrete fixes
- Shows the problematic code location
- Accumulates multiple errors instead of failing fast
- Integrates with existing logging and telemetry

Current `InvariantViolation` from `@beep/invariant` provides basic error metadata but lacks:

- Tagged error classification for pattern matching
- Built-in pretty printing with ANSI colors
- Error accumulation across multiple validations
- Context-aware suggestions and fix hints

## Research Sources

### Effect Documentation
- **Yieldable Errors** (`Data.TaggedError`) - Schema-backed error constructors with `_tag` discrimination
- **Error Accumulation** (`Effect.validateAll`, `Effect.partition`) - Collecting multiple failures
- **Parallel and Sequential Errors** (`Cause.parallel`, `Cause.sequential`) - Error composition
- **Cause Analysis** (`Cause.pretty`, `Cause.match`) - Extracting and formatting error details
- **Schema Annotations** - Custom error messages, identifiers, and metadata
- **Pretty Printer** - Schema-driven formatting with custom `pretty` annotations

### Codebase Analysis
- **`@beep/errors`** - Existing `BeepError` namespace, `formatCausePretty`, logging integration
- **`@beep/invariant`** - `InvariantViolation` error class with file/line/args metadata
- **Effect source** - `Cause.ts`, `Pretty.ts`, `Logger.ts`, `Schema.ts`

## Recommended Approach

### Pattern Overview

Create a **hierarchical tagged error system** for DSL validation:

```
DSLValidationError (base)
├── FieldValidationError
│   ├── InvalidColumnTypeError
│   ├── NullabilityConflictError
│   ├── InvalidDefaultValueError
│   └── MissingRequiredFieldError
├── ModelValidationError
│   ├── MultiplePrimaryKeysError
│   ├── InvalidModelNameError
│   ├── CircularRelationError
│   └── DuplicateFieldNameError
├── RelationValidationError
│   ├── ForeignKeyMismatchError
│   ├── MissingRelationTargetError
│   └── InvalidCardinalityError
└── TypeCompatibilityError
    ├── DrizzleEffectTypeMismatchError
    ├── UnsupportedTypeConversionError
    └── PrecisionLossWarning
```

Each error includes:
- **Context**: `modelName`, `fieldName`, `path` (e.g., `"User.email.drizzleColumn"`)
- **Diagnostic**: `expected`, `received`, `reason`
- **Suggestion**: `fix` (actionable next step)
- **Metadata**: `code` (error code for documentation), `severity` (`error` | `warning`)

## Implementation

### 1. TaggedError Base Classes

```typescript
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/**
 * Base error for all DSL validation failures.
 *
 * Includes common fields for error presentation and debugging.
 */
export class DSLValidationError extends S.TaggedError<DSLValidationError>()(
  "DSLValidationError",
  {
    message: S.String,
    code: S.String,
    severity: S.Literal("error", "warning"),
    path: S.Array(S.String), // e.g., ["UserModel", "emailField", "drizzleColumn"]
    file: S.optional(S.String),
    line: S.optional(S.Number),
    suggestion: S.optional(S.String),
  },
  HttpApiSchema.annotations({ status: 400 })
) {
  /**
   * Renders a human-friendly path representation.
   *
   * @example "UserModel.emailField.drizzleColumn"
   */
  get pathString(): string {
    return F.pipe(this.path, (parts) => parts.join("."));
  }

  /**
   * Renders a color-coded error heading.
   */
  formatHeading(colors = true): string {
    const severityLabel = this.severity === "error" ? "ERROR" : "WARN";
    const colorFn = this.severity === "error"
      ? (s: string) => colors ? `\x1b[31m${s}\x1b[39m` : s
      : (s: string) => colors ? `\x1b[33m${s}\x1b[39m` : s;

    const codeLabel = colors ? `\x1b[2m[${this.code}]\x1b[22m` : `[${this.code}]`;
    return `${colorFn(severityLabel)} ${codeLabel} ${this.pathString}`;
  }
}

/**
 * Field-level validation errors (column type, nullability, defaults).
 */
export class FieldValidationError extends S.TaggedError<FieldValidationError>()(
  "FieldValidationError",
  {
    ...DSLValidationError.fields,
    modelName: S.String,
    fieldName: S.String,
    expected: S.String,
    received: S.String,
  },
  HttpApiSchema.annotations({ status: 400 })
) {
  override get pathString(): string {
    return `${this.modelName}.${this.fieldName}`;
  }
}

/**
 * Invalid column type assignment.
 *
 * @example
 * Effect.fail(new InvalidColumnTypeError({
 *   message: "Drizzle column type incompatible with Effect Schema",
 *   code: "DSL-FIELD-TYPE-001",
 *   severity: "error",
 *   path: ["UserModel", "ageField", "drizzleColumn"],
 *   modelName: "UserModel",
 *   fieldName: "ageField",
 *   expected: "PgInteger",
 *   received: "PgText",
 *   suggestion: "Change drizzleColumn to pgInteger() or update Effect Schema to String"
 * }))
 */
export class InvalidColumnTypeError extends S.TaggedError<InvalidColumnTypeError>()(
  "InvalidColumnTypeError",
  FieldValidationError.fields,
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Nullability mismatch between Drizzle and Effect Schema.
 */
export class NullabilityConflictError extends S.TaggedError<NullabilityConflictError>()(
  "NullabilityConflictError",
  FieldValidationError.fields,
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Model-level validation errors (primary keys, naming, structure).
 */
export class ModelValidationError extends S.TaggedError<ModelValidationError>()(
  "ModelValidationError",
  {
    ...DSLValidationError.fields,
    modelName: S.String,
  },
  HttpApiSchema.annotations({ status: 400 })
) {
  override get pathString(): string {
    return this.modelName;
  }
}

/**
 * Multiple primary keys defined in a single Model.
 */
export class MultiplePrimaryKeysError extends S.TaggedError<MultiplePrimaryKeysError>()(
  "MultiplePrimaryKeysError",
  {
    ...ModelValidationError.fields,
    primaryKeyFields: S.Array(S.String),
  },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Duplicate field names within a Model.
 */
export class DuplicateFieldNameError extends S.TaggedError<DuplicateFieldNameError>()(
  "DuplicateFieldNameError",
  {
    ...ModelValidationError.fields,
    duplicateFieldName: S.String,
    occurrences: S.Number,
  },
  HttpApiSchema.annotations({ status: 400 })
) {}

/**
 * Type compatibility warning (precision loss, implicit conversions).
 */
export class TypeCompatibilityWarning extends S.TaggedError<TypeCompatibilityWarning>()(
  "TypeCompatibilityWarning",
  {
    ...FieldValidationError.fields,
    severity: S.Literal("warning"),
    reason: S.String,
  },
  HttpApiSchema.annotations({ status: 200 })
) {}
```

### 2. Error Accumulation Strategy

Use `Effect.validateAll` for parallel field validation with error collection:

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Cause from "effect/Cause";

/**
 * Validates all fields in a Model, accumulating errors.
 *
 * Returns all validation errors instead of failing fast.
 */
export const validateModelFields = (
  modelName: string,
  fields: ReadonlyArray<FieldDefinition>
): Effect.Effect<ReadonlyArray<ValidatedField>, ReadonlyArray<FieldValidationError>, never> =>
  Effect.gen(function* () {
    const validations = F.pipe(
      fields,
      A.map((field) =>
        validateField(modelName, field).pipe(
          Effect.mapError((err) => [err])
        )
      )
    );

    return yield* Effect.validateAll(validations);
  });

/**
 * Validates an entire Model, collecting all errors (field + model level).
 *
 * Uses Effect.partition to preserve successes alongside failures.
 */
export const validateModel = (
  model: ModelDefinition
): Effect.Effect<ValidationResult, never, never> =>
  Effect.gen(function* () {
    // Run all validations in parallel
    const fieldValidations = F.pipe(
      model.fields,
      A.map((field) => validateField(model.name, field))
    );

    const modelValidations = [
      validateNoPrimaryKeyDuplicates(model),
      validateNoFieldNameDuplicates(model),
      validateModelName(model),
    ];

    // Partition successes and failures
    const [fieldErrors, validFields] = yield* Effect.partition(
      fieldValidations,
      (eff) => Effect.sandbox(eff)
    );

    const [modelErrors, _] = yield* Effect.partition(
      modelValidations,
      (eff) => Effect.sandbox(eff)
    );

    const allErrors = [
      ...F.pipe(fieldErrors, A.flatMap(extractErrors)),
      ...F.pipe(modelErrors, A.flatMap(extractErrors)),
    ];

    return {
      modelName: model.name,
      validFields,
      errors: allErrors,
      hasErrors: allErrors.length > 0,
    };
  });

/**
 * Extracts all DSLValidationError instances from a Cause.
 */
const extractErrors = (cause: Cause.Cause<unknown>): ReadonlyArray<DSLValidationError> => {
  const failures = Cause.failures(cause);
  return F.pipe(
    failures,
    A.fromIterable,
    A.filter((err): err is DSLValidationError => err instanceof DSLValidationError)
  );
};
```

### 3. Pretty Printer Implementation

Build terminal-friendly output with ANSI colors and box-drawing:

```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Match from "effect/Match";
import color from "picocolors";

/**
 * Configuration for error formatting.
 */
export interface ErrorFormatterConfig {
  readonly colors: boolean;
  readonly showCodeFrame: boolean;
  readonly maxErrorsPerModel: number;
  readonly indent: string;
}

export const defaultFormatterConfig: ErrorFormatterConfig = {
  colors: true,
  showCodeFrame: false,
  maxErrorsPerModel: 10,
  indent: "  ",
};

/**
 * Formats a single DSLValidationError with visual hierarchy.
 */
export const formatError = (
  error: DSLValidationError,
  config: ErrorFormatterConfig = defaultFormatterConfig
): string => {
  const lines: string[] = [];
  const { colors, indent } = config;

  // Header with severity and code
  const heading = error.formatHeading(colors);
  lines.push(heading);

  // Message
  const messageIndent = colors ? color.dim("│ ") : "| ";
  lines.push(`${messageIndent}${error.message}`);

  // Details (field-specific context)
  if ("expected" in error && "received" in error) {
    const fieldError = error as FieldValidationError;
    lines.push(`${messageIndent}`);
    lines.push(`${messageIndent}Expected: ${colors ? color.green(fieldError.expected) : fieldError.expected}`);
    lines.push(`${messageIndent}Received: ${colors ? color.red(fieldError.received) : fieldError.received}`);
  }

  // Suggestion
  if (O.isSome(O.fromNullable(error.suggestion))) {
    lines.push(`${messageIndent}`);
    const suggestionLabel = colors ? color.cyan("💡 Suggestion:") : "Suggestion:";
    lines.push(`${messageIndent}${suggestionLabel} ${error.suggestion}`);
  }

  // File location (if available)
  if (O.isSome(O.fromNullable(error.file))) {
    const location = error.line
      ? `${error.file}:${error.line}`
      : error.file;
    const locationLabel = colors ? color.dim(`  at ${location}`) : `  at ${location}`;
    lines.push(locationLabel);
  }

  return lines.join("\n");
};

/**
 * Formats multiple errors with visual grouping by model.
 */
export const formatValidationResult = (
  result: ValidationResult,
  config: ErrorFormatterConfig = defaultFormatterConfig
): string => {
  const { colors, maxErrorsPerModel } = config;

  if (!result.hasErrors) {
    const successLabel = colors ? color.green("✓") : "[OK]";
    return `${successLabel} ${result.modelName} validated successfully`;
  }

  const lines: string[] = [];
  const errorCount = result.errors.length;
  const displayedCount = Math.min(errorCount, maxErrorsPerModel);

  // Header box
  const headerLine = colors
    ? color.red(`╭─ ${errorCount} validation ${errorCount === 1 ? "error" : "errors"} in ${result.modelName}`)
    : `+- ${errorCount} validation ${errorCount === 1 ? "error" : "errors"} in ${result.modelName}`;

  lines.push(headerLine);
  lines.push("");

  // Group errors by severity
  const errors = F.pipe(
    result.errors,
    A.take(displayedCount),
    A.groupBy((err) => err.severity)
  );

  // Show errors first, then warnings
  const errorList = errors.get("error") ?? [];
  const warningList = errors.get("warning") ?? [];

  F.pipe(
    errorList,
    A.forEach((err, idx) => {
      if (idx > 0) lines.push("");
      lines.push(formatError(err, config));
    })
  );

  if (warningList.length > 0 && errorList.length > 0) {
    lines.push("");
    const divider = colors ? color.dim("───") : "---";
    lines.push(divider);
  }

  F.pipe(
    warningList,
    A.forEach((err, idx) => {
      if (idx > 0) lines.push("");
      lines.push(formatError(err, config));
    })
  );

  // Truncation notice
  if (errorCount > maxErrorsPerModel) {
    lines.push("");
    const remaining = errorCount - displayedCount;
    const truncateMsg = colors
      ? color.dim(`... and ${remaining} more`)
      : `... and ${remaining} more`;
    lines.push(truncateMsg);
  }

  // Footer box
  const footerLine = colors ? color.red("╰─") : "+-";
  lines.push("");
  lines.push(footerLine);

  return lines.join("\n");
};

/**
 * Formats errors from a Cause tree (for Effect.partition results).
 */
export const formatCauseErrors = (
  cause: Cause.Cause<DSLValidationError>,
  config: ErrorFormatterConfig = defaultFormatterConfig
): string => {
  const errors = extractErrors(cause);

  if (errors.length === 0) {
    return config.colors ? color.green("No validation errors") : "No validation errors";
  }

  return F.pipe(
    errors,
    A.map((err) => formatError(err, config)),
    (formatted) => formatted.join("\n\n")
  );
};
```

### 4. Logger Integration

Integrate with `@beep/errors` logging infrastructure:

```typescript
import * as Effect from "effect/Effect";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as Cause from "effect/Cause";
import { withLogContext, formatCausePretty } from "@beep/errors/shared";

/**
 * Logs DSL validation errors with structured context.
 */
export const logValidationErrors = (
  result: ValidationResult,
  options: {
    readonly colors?: boolean;
    readonly annotations?: Record<string, unknown>;
  } = {}
): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    const formatted = formatValidationResult(result, {
      ...defaultFormatterConfig,
      colors: options.colors ?? true,
    });

    if (result.hasErrors) {
      yield* Effect.logError(formatted).pipe(
        withLogContext({
          modelName: result.modelName,
          errorCount: result.errors.length,
          severity: "validation_error",
          ...options.annotations,
        })
      );
    } else {
      yield* Effect.logDebug(`${result.modelName} validated successfully`).pipe(
        withLogContext({
          modelName: result.modelName,
          ...options.annotations,
        })
      );
    }
  });

/**
 * Logs accumulated errors from validateAll/partition operations.
 */
export const reportAccumulatedErrors = <E extends DSLValidationError>(
  errors: ReadonlyArray<Cause.Cause<E>>,
  context: {
    readonly operation: string;
    readonly modelName?: string;
  }
): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    const allErrors = F.pipe(errors, A.flatMap(extractErrors));

    if (allErrors.length === 0) {
      return yield* Effect.logDebug(`${context.operation} completed with no errors`).pipe(
        withLogContext(context)
      );
    }

    const formatted = F.pipe(
      allErrors,
      A.map((err) => formatError(err, defaultFormatterConfig)),
      (lines) => lines.join("\n\n")
    );

    yield* Effect.logError(
      `${context.operation} failed with ${allErrors.length} validation error(s):\n\n${formatted}`
    ).pipe(
      withLogContext({
        ...context,
        errorCount: allErrors.length,
        errorCodes: F.pipe(allErrors, A.map((e) => e.code)),
      })
    );
  });
```

### 5. Error Message Templates

Reusable template functions for consistent messaging:

```typescript
import * as F from "effect/Function";
import * as Str from "effect/String";

/**
 * Template generators for common error patterns.
 */
export const ErrorTemplates = {
  /**
   * Invalid column type between Drizzle and Effect Schema.
   */
  columnTypeMismatch: (params: {
    modelName: string;
    fieldName: string;
    drizzleType: string;
    effectType: string;
    file?: string;
    line?: number;
  }): InvalidColumnTypeError =>
    new InvalidColumnTypeError({
      message: `Column type mismatch: Drizzle type does not match Effect Schema type`,
      code: "DSL-FIELD-TYPE-001",
      severity: "error",
      path: [params.modelName, params.fieldName, "drizzleColumn"],
      modelName: params.modelName,
      fieldName: params.fieldName,
      expected: `Column type compatible with Effect Schema ${params.effectType}`,
      received: `Drizzle ${params.drizzleType}`,
      suggestion: `Change drizzleColumn to match ${params.effectType}, or update Effect Schema to match ${params.drizzleType}`,
      file: params.file,
      line: params.line,
    }),

  /**
   * Multiple primary keys in a single Model.
   */
  multiplePrimaryKeys: (params: {
    modelName: string;
    primaryKeyFields: ReadonlyArray<string>;
    file?: string;
    line?: number;
  }): MultiplePrimaryKeysError =>
    new MultiplePrimaryKeysError({
      message: `Model has ${params.primaryKeyFields.length} primary keys, but only 1 is allowed`,
      code: "DSL-MODEL-PK-001",
      severity: "error",
      path: [params.modelName, "primaryKeys"],
      modelName: params.modelName,
      primaryKeyFields: [...params.primaryKeyFields],
      suggestion: F.pipe(
        params.primaryKeyFields,
        A.map((name) => `"${name}"`),
        (names) => names.join(", "),
        (list) => `Remove isPrimaryKey from all but one field. Current primary keys: ${list}`
      ),
      file: params.file,
      line: params.line,
    }),

  /**
   * Nullability conflict between Drizzle and Effect Schema.
   */
  nullabilityMismatch: (params: {
    modelName: string;
    fieldName: string;
    drizzleNullable: boolean;
    effectNullable: boolean;
    file?: string;
    line?: number;
  }): NullabilityConflictError =>
    new NullabilityConflictError({
      message: `Nullability mismatch between Drizzle column and Effect Schema`,
      code: "DSL-FIELD-NULL-001",
      severity: "error",
      path: [params.modelName, params.fieldName, "nullability"],
      modelName: params.modelName,
      fieldName: params.fieldName,
      expected: params.effectNullable ? "Nullable Effect Schema" : "Non-nullable Effect Schema",
      received: params.drizzleNullable ? "Drizzle .notNull() missing" : "Drizzle .notNull() present",
      suggestion: params.effectNullable
        ? `Remove .notNull() from Drizzle column or wrap Effect Schema with S.NullOr`
        : `Add .notNull() to Drizzle column or use S.NullOr in Effect Schema`,
      file: params.file,
      line: params.line,
    }),

  /**
   * Duplicate field names in Model.
   */
  duplicateFieldName: (params: {
    modelName: string;
    fieldName: string;
    occurrences: number;
    file?: string;
    line?: number;
  }): DuplicateFieldNameError =>
    new DuplicateFieldNameError({
      message: `Field name "${params.fieldName}" appears ${params.occurrences} times in ${params.modelName}`,
      code: "DSL-MODEL-DUP-001",
      severity: "error",
      path: [params.modelName, "fields", params.fieldName],
      modelName: params.modelName,
      duplicateFieldName: params.fieldName,
      occurrences: params.occurrences,
      suggestion: `Rename duplicate fields or remove redundant definitions`,
      file: params.file,
      line: params.line,
    }),

  /**
   * Type compatibility warning (precision loss acceptable but noted).
   */
  precisionLossWarning: (params: {
    modelName: string;
    fieldName: string;
    fromType: string;
    toType: string;
    reason: string;
    file?: string;
    line?: number;
  }): TypeCompatibilityWarning =>
    new TypeCompatibilityWarning({
      message: `Potential precision loss in type conversion`,
      code: "DSL-FIELD-COMPAT-W001",
      severity: "warning",
      path: [params.modelName, params.fieldName, "typeConversion"],
      modelName: params.modelName,
      fieldName: params.fieldName,
      expected: params.toType,
      received: params.fromType,
      reason: params.reason,
      suggestion: `Consider using a more precise type or accept the conversion`,
      file: params.file,
      line: params.line,
    }),
};
```

## Example Error Outputs

### Example 1: Single Field Validation Failure

```typescript
const error = ErrorTemplates.columnTypeMismatch({
  modelName: "UserModel",
  fieldName: "age",
  drizzleType: "PgText",
  effectType: "Number",
  file: "packages/common/schema/src/models/User.ts",
  line: 42,
});

console.log(formatError(error));
```

**Output:**
```
ERROR [DSL-FIELD-TYPE-001] UserModel.age
│ Column type mismatch: Drizzle type does not match Effect Schema type
│
│ Expected: Column type compatible with Effect Schema Number
│ Received: Drizzle PgText
│
│ 💡 Suggestion: Change drizzleColumn to match Number, or update Effect Schema to match PgText
  at packages/common/schema/src/models/User.ts:42
```

### Example 2: Multiple Field Failures in One Model

```typescript
const result: ValidationResult = {
  modelName: "UserModel",
  validFields: [],
  errors: [
    ErrorTemplates.columnTypeMismatch({
      modelName: "UserModel",
      fieldName: "age",
      drizzleType: "PgText",
      effectType: "Number",
    }),
    ErrorTemplates.nullabilityMismatch({
      modelName: "UserModel",
      fieldName: "email",
      drizzleNullable: true,
      effectNullable: false,
    }),
    ErrorTemplates.duplicateFieldName({
      modelName: "UserModel",
      fieldName: "createdAt",
      occurrences: 2,
    }),
  ],
  hasErrors: true,
};

console.log(formatValidationResult(result));
```

**Output:**
```
╭─ 3 validation errors in UserModel

ERROR [DSL-FIELD-TYPE-001] UserModel.age
│ Column type mismatch: Drizzle type does not match Effect Schema type
│
│ Expected: Column type compatible with Effect Schema Number
│ Received: Drizzle PgText
│
│ 💡 Suggestion: Change drizzleColumn to match Number, or update Effect Schema to match PgText

ERROR [DSL-FIELD-NULL-001] UserModel.email
│ Nullability mismatch between Drizzle column and Effect Schema
│
│ Expected: Non-nullable Effect Schema
│ Received: Drizzle .notNull() missing
│
│ 💡 Suggestion: Add .notNull() to Drizzle column or use S.NullOr in Effect Schema

ERROR [DSL-MODEL-DUP-001] UserModel.fields.createdAt
│ Field name "createdAt" appears 2 times in UserModel
│
│ 💡 Suggestion: Rename duplicate fields or remove redundant definitions

╰─
```

### Example 3: Type Compatibility Errors with Diffs

```typescript
const error = ErrorTemplates.precisionLossWarning({
  modelName: "ProductModel",
  fieldName: "price",
  fromType: "PgDoublePrecision",
  toType: "Number (JavaScript)",
  reason: "JavaScript Number has 53-bit precision, PostgreSQL double has 64-bit precision",
  file: "packages/common/schema/src/models/Product.ts",
  line: 18,
});

console.log(formatError(error));
```

**Output:**
```
WARN [DSL-FIELD-COMPAT-W001] ProductModel.price
│ Potential precision loss in type conversion
│
│ Expected: Number (JavaScript)
│ Received: PgDoublePrecision
│
│ 💡 Suggestion: Consider using a more precise type or accept the conversion
  at packages/common/schema/src/models/Product.ts:18
```

### Example 4: Cross-Model Validation Issues

```typescript
const errors = [
  new MultiplePrimaryKeysError({
    message: "Model has 2 primary keys, but only 1 is allowed",
    code: "DSL-MODEL-PK-001",
    severity: "error",
    path: ["UserModel", "primaryKeys"],
    modelName: "UserModel",
    primaryKeyFields: ["id", "email"],
    suggestion: 'Remove isPrimaryKey from all but one field. Current primary keys: "id", "email"',
  }),
  ErrorTemplates.columnTypeMismatch({
    modelName: "PostModel",
    fieldName: "authorId",
    drizzleType: "PgText",
    effectType: "Number",
  }),
];

const formatted = F.pipe(
  errors,
  A.map((err) => formatError(err)),
  (lines) => lines.join("\n\n")
);

console.log(formatted);
```

**Output:**
```
ERROR [DSL-MODEL-PK-001] UserModel
│ Model has 2 primary keys, but only 1 is allowed
│
│ 💡 Suggestion: Remove isPrimaryKey from all but one field. Current primary keys: "id", "email"

ERROR [DSL-FIELD-TYPE-001] PostModel.authorId
│ Column type mismatch: Drizzle type does not match Effect Schema type
│
│ Expected: Column type compatible with Effect Schema Number
│ Received: Drizzle PgText
│
│ 💡 Suggestion: Change drizzleColumn to match Number, or update Effect Schema to match PgText
```

### Example 5: Warning-Level Issues with Suggestions

```typescript
const warnings = [
  ErrorTemplates.precisionLossWarning({
    modelName: "MetricsModel",
    fieldName: "responseTime",
    fromType: "PgBigInt",
    toType: "Number",
    reason: "BigInt values > 2^53 will lose precision when converted to Number",
  }),
  ErrorTemplates.precisionLossWarning({
    modelName: "MetricsModel",
    fieldName: "timestamp",
    fromType: "PgTimestampTz",
    toType: "Date",
    reason: "PostgreSQL timestamp has microsecond precision, JavaScript Date has millisecond precision",
  }),
];

const result: ValidationResult = {
  modelName: "MetricsModel",
  validFields: [],
  errors: warnings,
  hasErrors: true,
};

console.log(formatValidationResult(result));
```

**Output:**
```
╭─ 2 validation errors in MetricsModel

WARN [DSL-FIELD-COMPAT-W001] MetricsModel.responseTime
│ Potential precision loss in type conversion
│
│ Expected: Number
│ Received: PgBigInt
│
│ 💡 Suggestion: Consider using a more precise type or accept the conversion

WARN [DSL-FIELD-COMPAT-W001] MetricsModel.timestamp
│ Potential precision loss in type conversion
│
│ Expected: Date
│ Received: PgTimestampTz
│
│ 💡 Suggestion: Consider using a more precise type or accept the conversion

╰─
```

## Integration with beep-effect

### With @beep/errors

```typescript
import { withLogContext, withRootSpan, accumulateEffectsAndReport } from "@beep/errors/client";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";

/**
 * Validates all models in a schema definition with logging.
 */
export const validateSchema = (
  models: ReadonlyArray<ModelDefinition>
): Effect.Effect<ReadonlyArray<ValidationResult>, never, never> =>
  Effect.gen(function* () {
    const validations = F.pipe(
      models,
      A.map((model) =>
        validateModel(model).pipe(
          Effect.tap((result) => logValidationErrors(result, { colors: true })),
          withLogContext({ modelName: model.name }),
          withRootSpan(`validateModel.${model.name}`)
        )
      )
    );

    return yield* accumulateEffectsAndReport(validations, {
      concurrency: "unbounded",
      annotations: { phase: "dsl_validation" },
    });
  });
```

### With @beep/invariant

```typescript
import { invariant, InvariantViolation } from "@beep/invariant";
import * as Effect from "effect/Effect";

/**
 * Converts InvariantViolation to DSLValidationError for unified handling.
 */
export const convertInvariantToValidationError = (
  violation: InvariantViolation,
  context: {
    modelName: string;
    fieldName?: string;
  }
): DSLValidationError =>
  new DSLValidationError({
    message: violation.message,
    code: "DSL-INVARIANT-001",
    severity: "error",
    path: [
      context.modelName,
      ...(context.fieldName ? [context.fieldName] : []),
      "invariant",
    ],
    file: violation.file,
    line: violation.line,
    suggestion: "Review the DSL definition and ensure all constraints are met",
  });

/**
 * Validates a field with invariant checks, converting to tagged errors.
 */
export const validateFieldWithInvariants = (
  modelName: string,
  field: FieldDefinition
): Effect.Effect<ValidatedField, DSLValidationError, never> =>
  Effect.try({
    try: () => {
      // Runtime invariant checks
      invariant(
        field.name.length > 0,
        "Field name must not be empty",
        {
          file: "DSL.ts",
          line: 0,
          args: [field],
        }
      );

      invariant.nonNull(
        field.drizzleColumn,
        "drizzleColumn is required",
        {
          file: "DSL.ts",
          line: 0,
          args: [field],
        }
      );

      return { field, valid: true };
    },
    catch: (error) =>
      error instanceof InvariantViolation
        ? convertInvariantToValidationError(error, { modelName, fieldName: field.name })
        : new DSLValidationError({
            message: `Unexpected error: ${String(error)}`,
            code: "DSL-UNKNOWN-001",
            severity: "error",
            path: [modelName, field.name],
          }),
  });
```

## Trade-offs

### Advantages
1. **Type-safe error handling** - Pattern matching with `Effect.catchTag` and `Match.tag`
2. **Rich error context** - Structured metadata for debugging and telemetry
3. **Progressive disclosure** - Summary messages with opt-in details
4. **Multi-error accumulation** - Developers see all issues at once
5. **Integration-ready** - Works with existing `@beep/errors` and `@beep/invariant`
6. **Terminal-friendly** - ANSI colors and box-drawing for readability

### Disadvantages
1. **Boilerplate** - Each error type requires a tagged error class
2. **Message consistency** - Template functions need maintenance
3. **Color detection** - Requires runtime color support detection
4. **Internationalization** - Messages are English-only (future enhancement needed)

## Alternative Approaches

### Option 1: Plain Error with JSON metadata
**Pros**: Less boilerplate, simpler implementation
**Cons**: No type-safe pattern matching, harder to compose errors

### Option 2: Effect Schema ParseError with custom formatters
**Pros**: Reuses Schema error infrastructure
**Cons**: Tied to Schema validation lifecycle, less control over presentation

### Option 3: Single error class with discriminated union
**Pros**: Single class definition
**Cons**: Loses type safety benefits of tagged errors, harder to extend

## References

### Effect Documentation
- [Yieldable Errors (Data.TaggedError)](https://effect.website/docs/error-management/yieldable-errors)
- [Error Accumulation (validateAll, partition)](https://effect.website/docs/error-management/error-accumulation)
- [Parallel and Sequential Errors (Cause)](https://effect.website/docs/error-management/parallel-and-sequential-errors)
- [Cause Analysis (pretty, match)](https://effect.website/docs/data-types/cause)
- [Schema Error Messages](https://effect.website/docs/schema/error-messages)
- [Schema Annotations](https://effect.website/docs/schema/annotations)
- [Pretty Printer](https://effect.website/docs/schema/pretty-printer)

### Codebase Files
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/errors/src/errors.ts` - BeepError taxonomy
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/errors/src/shared.ts` - Logging helpers
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/invariant/src/error.ts` - InvariantViolation
- `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/src/Cause.ts` - Cause implementation
- `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/effect/src/Pretty.ts` - Pretty printer
- `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/@effect/printer-ansi/src/Ansi.ts` - ANSI formatting

### Error Code Namespace

Recommended error code structure for documentation:

```
DSL-{CATEGORY}-{TYPE}-{NUMBER}

Categories:
  FIELD   - Field-level validation (types, nullability, defaults)
  MODEL   - Model-level validation (primary keys, naming, structure)
  REL     - Relation validation (foreign keys, cardinality)
  COMPAT  - Type compatibility (precision, conversions)

Types:
  (none)  - Error severity
  W       - Warning severity

Examples:
  DSL-FIELD-TYPE-001   - Column type mismatch
  DSL-MODEL-PK-001     - Multiple primary keys
  DSL-COMPAT-W001      - Precision loss warning
```

Documentation links can be generated as:
```
https://beep-effect.dev/errors/${code}
```

## Next Steps

1. **Implement base error classes** in `packages/common/schema/src/integrations/sql/dsl/errors.ts`
2. **Create error templates** for each invariant category
3. **Build pretty printer** with ANSI formatting
4. **Integrate with validators** in DSL pipeline
5. **Add tests** for error formatting and accumulation
6. **Generate error documentation** with examples for each code
7. **Configure logger** to use structured error context

---

**Report Generated**: 2025-12-28
**Research Scope**: Effect error handling ecosystem for DSL validation
**Target Package**: `@beep/schema` (SQL DSL)
