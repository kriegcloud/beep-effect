# DSL Invariant Research Results

## Executive Summary

This document synthesizes research from 5 specialized agents investigating invariants for the beep-effect SQL DSL metadata validation system. The research identified **96 total invariants** across four categories, plus comprehensive error presentation strategies.

### Key Findings

| Category           | Invariants | Critical | Warning | Info   | Implemented |
|--------------------|------------|----------|---------|--------|-------------|
| SQL Standard       | 19         | 7        | 6       | 2      | 4 partial   |
| Type Compatibility | 30         | 10       | 8       | 12     | 15+ partial |
| Model Composition  | 30         | 12       | 6       | 12     | 18 full     |
| Drizzle Adapter    | 17         | 7        | 5       | 5      | 10 partial  |
| **Total**          | **96**     | **36**   | **25**  | **31** | **~47**     |

### Critical Gaps Identified

1. **INV-SQL-AI-001**: No validation that `autoIncrement: true` requires `type: "integer"` or `"bigint"`
2. **INV-SQL-ID-001/002**: No identifier length or character validation (PostgreSQL 63-byte limit)
3. **INV-MODEL-ID-001**: No validation for non-empty model identifier
4. **INV-MODEL-AI-001**: No validation for single autoIncrement per model
5. **INV-DRZ-DEFAULT-001**: Default values not applied to Drizzle columns

---

## Master Invariant Catalog

### Compile-Time Invariants (Type-Level)

| ID                  | Description                                    | Severity | Complexity | Status               |
|---------------------|------------------------------------------------|----------|------------|----------------------|
| INV-TYPE-COMPAT-001 | Schema encoded type must match column type     | Critical | Low        | Implemented          |
| INV-TYPE-COMPAT-002 | String schema with non-string column forbidden | Critical | Low        | Implemented          |
| INV-TYPE-COMPAT-003 | Number schema only with number/integer column  | Critical | Low        | Implemented          |
| INV-TYPE-COMPAT-004 | Boolean schema only with boolean column        | Critical | Low        | Implemented          |
| INV-TYPE-COMPAT-005 | BigInt schema only with bigint column          | Critical | Low        | Implemented          |
| INV-TYPE-COMPAT-006 | Object/Array schema requires json column       | Critical | Low        | Implemented          |
| INV-TYPE-COMPAT-013 | S.Undefined cannot be column type              | Critical | Low        | Implemented (throws) |
| INV-TYPE-COMPAT-014 | S.Never cannot be column type                  | Critical | Low        | Implemented (throws) |
| INV-TYPE-COMPAT-015 | S.Void cannot be column type                   | Critical | Low        | Implemented (throws) |
| INV-TYPE-COMPAT-016 | S.Symbol cannot be stored in SQL               | Critical | Low        | Implemented (throws) |
| INV-TYPE-COMPAT-026 | VariantSchema uses select variant              | Critical | Medium     | Implemented          |
| INV-MODEL-TYPE-001  | Column type compatible with schema             | Critical | Low        | Implemented          |
| INV-DRZ-TYPE-002    | EncodedType matches column type                | Critical | Medium     | Implemented          |
| INV-DRZ-CONST-004   | AutoIncrement has HasDefault modifier          | Critical | Low        | Implemented          |

### Runtime Invariants (Effect Validation)

| ID                  | Description                            | Severity | Complexity | Status                    |
|---------------------|----------------------------------------|----------|------------|---------------------------|
| INV-SQL-PK-001      | Primary key non-nullability            | Critical | Low        | Partial (type-level only) |
| INV-SQL-AI-001      | AutoIncrement requires integer/bigint  | Critical | Low        | **Not Implemented**       |
| INV-SQL-ID-001      | Identifier <= 63 characters            | Critical | Low        | **Not Implemented**       |
| INV-SQL-ID-002      | Valid identifier characters            | Critical | Low        | **Not Implemented**       |
| INV-SQL-SCHEMA-001  | Schema/column type compatibility       | Critical | Medium     | Partial                   |
| INV-MODEL-ID-001    | Non-empty model identifier             | Critical | Low        | **Not Implemented**       |
| INV-MODEL-ID-003    | Valid SQL table name                   | Critical | Medium     | **Not Implemented**       |
| INV-MODEL-AI-001    | Single autoIncrement per model         | Critical | Medium     | **Not Implemented**       |
| INV-DRZ-BUILD-002   | Serial requires integer type           | Critical | Low        | **Not Implemented**       |
| INV-DRZ-TABLE-003   | Field/ColumnDef key alignment          | Critical | Low        | **Not Implemented**       |
| INV-SQL-PK-002      | Primary key cardinality                | Warning  | Medium     | Not implemented           |
| INV-SQL-PK-003      | Primary key type recommendations       | Warning  | Low        | Not implemented           |
| INV-SQL-AI-002      | AutoIncrement implies non-nullable     | Warning  | Low        | Partial                   |
| INV-SQL-ID-003      | Reserved word avoidance                | Warning  | Medium     | Not implemented           |
| INV-SQL-DEFAULT-001 | Default value type compatibility       | Warning  | Medium     | Not implemented           |
| INV-SQL-UNIQUE-001  | Nullable unique columns info           | Info     | Low        | Not implemented           |
| INV-MODEL-NAME-003  | Field names shadow reserved properties | Warning  | Medium     | Not implemented           |
| INV-MODEL-FIELD-002 | At least one non-Generated field       | Warning  | Medium     | Not implemented           |
| INV-MODEL-PK-003    | Nullable primary key warning           | Warning  | Medium     | Partial                   |

### Adapter-Specific Invariants

| ID                  | Description                      | Severity | Complexity | Status                   |
|---------------------|----------------------------------|----------|------------|--------------------------|
| INV-DRZ-BUILD-001   | Column type to builder mapping   | Critical | Low        | Implemented (exhaustive) |
| INV-DRZ-BUILD-003   | BigInt mode explicit             | Warning  | Low        | Implemented              |
| INV-DRZ-CONST-001   | Constraint application order     | Warning  | Low        | Implemented              |
| INV-DRZ-CONST-002   | Primary key implies NotNull      | Critical | Low        | Implemented              |
| INV-DRZ-CONST-003   | Serial self-manages nullability  | Info     | Low        | Implemented              |
| INV-DRZ-CONST-005   | Unique constraint application    | Warning  | Low        | Implemented              |
| INV-DRZ-TYPE-001    | $type<T>() applied last          | Warning  | Low        | Implemented              |
| INV-DRZ-TYPE-003    | Variant field encoded type       | Critical | Medium     | Implemented              |
| INV-DRZ-TYPE-004    | Nullability from schema AST      | Critical | Medium     | Implemented              |
| INV-DRZ-TABLE-001   | Table name from model            | Warning  | Low        | Implemented              |
| INV-DRZ-TABLE-002   | All columns from model.columns   | Critical | Low        | Implemented              |
| INV-DRZ-DEFAULT-001 | Default values not applied       | Warning  | Medium     | **Gap**                  |
| INV-DRZ-DEFAULT-002 | AutoIncrement implies DB default | Warning  | Low        | Implemented              |
| INV-DRZ-REL-001     | Relations not implemented        | Info     | High       | Future                   |
| INV-DRZ-IDX-001     | Indexes not supported            | Info     | High       | Future                   |

---

## Invariant Dependencies

Document which invariants must be checked before others:

```
INV-SQL-PK-001 (PK non-nullable) depends on:
└── INV-TYPE-NULL-* (nullability derivation from AST)

INV-DRZ-BUILD-002 (serial integer only) depends on:
├── INV-TYPE-COMPAT-011 (integer type detection)
└── INV-SQL-AI-001 (autoIncrement general rules)

INV-MODEL-AI-001 (single autoIncrement) depends on:
└── Column extraction from model._fields

INV-SQL-ID-001 (identifier length) depends on:
├── Model identifier extraction
└── Field name extraction

INV-DRZ-TYPE-003 (variant encoded type) depends on:
├── INV-MODEL-VAR-* (variant schema filtering)
└── INV-TYPE-COMPAT-026 (select variant usage)

INV-SQL-SCHEMA-001 (schema/column compat) depends on:
├── INV-TYPE-COMPAT-001 (base type matching)
└── INV-TYPE-COMPAT-012 (nullable preservation)
```

---

## Proposed Validation Architecture

### Two-Phase Approach

**Phase 1: Field Validation** (at `Field()` creation)
- Schema/column type compatibility via type-level `ValidateSchemaColumn`
- Runtime `deriveColumnType(ast)` for type inference
- Nullability derivation via `isNullable(ast, "from")`
- AutoIncrement type restriction check
- Identifier character/length validation

**Phase 2: Model Validation** (at `Model()` creation)
- Primary key cardinality check
- Single autoIncrement constraint
- Field name uniqueness
- Model identifier validity
- Cross-field constraint interactions

### Error Accumulation Strategy

```typescript
// Use Effect.validateAll for parallel field validation
const validateModelFields = (fields: Fields): Effect.Effect<
  ReadonlyArray<ValidatedField>,
  ReadonlyArray<FieldValidationError>,
  never
> =>
  Effect.validateAll(
    F.pipe(fields, Struct.entries, A.map(validateField))
  );

// Use Effect.partition for preserving successes
const [failures, successes] = yield* Effect.partition(
  validations,
  (eff) => Effect.sandbox(eff)
);
```

---

## Error Presentation Architecture

### TaggedError Hierarchy

```
DSLValidationError (base)
├── FieldValidationError
│   ├── InvalidColumnTypeError
│   ├── NullabilityConflictError
│   ├── InvalidDefaultValueError
│   └── AutoIncrementTypeError
├── ModelValidationError
│   ├── MultiplePrimaryKeysError
│   ├── MultipleAutoIncrementError
│   ├── InvalidModelNameError
│   ├── InvalidTableNameError
│   └── DuplicateFieldNameError
├── IdentifierValidationError
│   ├── IdentifierTooLongError
│   ├── InvalidIdentifierCharsError
│   └── ReservedWordError
└── TypeCompatibilityError
    ├── SchemaColumnMismatchError
    └── PrecisionLossWarning
```

### Pretty Printing Strategy

```typescript
// ANSI color-coded output with box-drawing
const formatError = (error: DSLValidationError): string => {
  const heading = `${severityBadge(error.severity)} [${error.code}] ${error.pathString}`;
  const message = `│ ${error.message}`;
  const details = formatExpectedReceived(error);
  const suggestion = `│ 💡 Suggestion: ${error.suggestion}`;
  return [heading, message, details, suggestion].join("\n");
};
```

### Example Error Output

```
╭─ DSL Validation Error ─────────────────────────────────────────╮
│                                                                 │
│  Model: UserAccount                                             │
│  Field: userId                                                  │
│                                                                 │
│  [INV-SQL-PK-001] Primary key cannot be nullable                │
│                                                                 │
│    Expected: non-nullable schema (S.String, S.Int, etc.)        │
│    Received: S.NullOr(S.String)                                 │
│                                                                 │
│  ┌─ Your code ──────────────────────────────────────────────┐   │
│  │ const User = Model("User")({                             │   │
│  │   userId: Field(S.NullOr(S.String))({ primaryKey: true })│   │
│  │          ^^^^^^^^^^^^^^^^                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Fix: Remove S.NullOr wrapper or remove primaryKey constraint   │
│                                                                 │
│  See: https://beep.dev/errors/INV-SQL-PK-001                    │
│                                                                 │
╰─────────────────────────────────────────────────────────────────╯
```

### Logger Integration

```typescript
import { withLogContext, withRootSpan } from "@beep/errors/shared";

// Structured logging for validation errors
yield* Effect.logError(formatted).pipe(
  withLogContext({
    modelName: result.modelName,
    errorCount: result.errors.length,
    severity: "validation_error",
    errorCodes: F.pipe(result.errors, A.map((e) => e.code)),
  })
);
```

---

## Implementation Priority

### Phase 1: Critical Invariants (Must Block)

1. **INV-SQL-AI-001** - AutoIncrement type restriction
   - Location: `Field.ts` or `columnBuilder()`
   - Validation: `def.autoIncrement && def.type !== "integer" && def.type !== "bigint"`

2. **INV-SQL-ID-001** - Identifier length
   - Location: `Model()` factory and `Field()` factory
   - Validation: `name.length > 63`

3. **INV-SQL-ID-002** - Identifier characters
   - Location: Same as ID-001
   - Validation: `/^[a-zA-Z_][a-zA-Z0-9_$]*$/`

4. **INV-MODEL-ID-001** - Non-empty model identifier
   - Location: `Model()` factory
   - Validation: `identifier.length === 0`

5. **INV-MODEL-AI-001** - Single autoIncrement per model
   - Location: `Model()` factory after column extraction
   - Validation: Count fields with `autoIncrement: true`

6. **INV-DRZ-BUILD-002** - Serial requires integer
   - Location: `columnBuilder()` in `drizzle.ts`
   - Validation: Same as AI-001, different error context

### Phase 2: Warning Invariants (Emit Warning)

7. **INV-SQL-PK-002** - Composite primary key disambiguation
8. **INV-SQL-PK-003** - Primary key type recommendations
9. **INV-SQL-AI-002** - Nullable schema with autoIncrement
10. **INV-SQL-ID-003** - Reserved word detection
11. **INV-SQL-DEFAULT-001** - Default value type patterns
12. **INV-MODEL-NAME-003** - Reserved property shadows
13. **INV-MODEL-FIELD-002** - All-Generated model warning
14. **INV-MODEL-PK-003** - Nullable primary key schema

### Phase 3: Informational (Developer Hints)

15. **INV-SQL-UNIQUE-001** - Nullable unique columns
16. **INV-TYPE-COMPAT-018** - Heterogeneous union fallback
17. **INV-TYPE-COMPAT-027** - Type-level vs runtime discrepancy
18. **INV-DRZ-DEFAULT-001** - Default value not applied warning

---

## Testing Requirements

### Test Structure

One test file per invariant category:
- `invariants/sql-standard.test.ts`
- `invariants/type-compatibility.test.ts`
- `invariants/model-composition.test.ts`
- `invariants/drizzle-adapter.test.ts`

### Test Pattern

```typescript
describe("INV-SQL-AI-001: AutoIncrement Type Restriction", () => {
  it("should fail for autoIncrement with non-integer type", () => {
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", { autoIncrement: true, type: "string" })
    ));

    expect(Either.isLeft(result)).toBe(true);
    expect(result.left).toBeInstanceOf(AutoIncrementTypeError);
    expect(result.left.code).toBe("INV-SQL-AI-001");
  });

  it("should pass for autoIncrement with integer type", () => {
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", { autoIncrement: true, type: "integer" })
    ));

    expect(Either.isRight(result)).toBe(true);
  });

  it("should pass for autoIncrement with bigint type", () => {
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", { autoIncrement: true, type: "bigint" })
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});
```

---

## Files to Modify

### New Files

| File                                                                    | Purpose               |
|-------------------------------------------------------------------------|-----------------------|
| `packages/common/schema/src/integrations/sql/dsl/errors.ts`             | TaggedError hierarchy |
| `packages/common/schema/src/integrations/sql/dsl/validate.ts`           | Validation functions  |
| `packages/common/schema/src/integrations/sql/dsl/format-error.ts`       | Pretty printer        |
| `packages/common/schema/test/integrations/sql/dsl/invariants/*.test.ts` | Test suites           |

### Modified Files

| File                                                                  | Changes                       |
|-----------------------------------------------------------------------|-------------------------------|
| `packages/common/schema/src/integrations/sql/dsl/Field.ts`            | Add field-level validation    |
| `packages/common/schema/src/integrations/sql/dsl/Model.ts`            | Add model-level validation    |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` | Add pre-conversion validation |
| `packages/common/schema/src/integrations/sql/dsl/index.ts`            | Export validation utilities   |

---

## Effect Patterns Summary

| Pattern                    | Use Case                                            |
|----------------------------|-----------------------------------------------------|
| `S.TaggedError`            | Validation error classes with `_tag` discrimination |
| `Effect.validateAll`       | Collect all field errors (loses successes)          |
| `Effect.partition`         | Preserve successes alongside failures               |
| `Cause.parallel`           | Compose independent errors                          |
| `Cause.sequential`         | Compose dependent errors                            |
| `Cause.failures`           | Extract typed errors from Cause                     |
| `Match.exhaustive`         | Handle all error types                              |
| `Effect.log*` with context | Structured validation logging                       |

---

## Metadata

### Research Sources
- **DSL Source Files**: 9 files in `packages/common/schema/src/integrations/sql/dsl/`
- **Test Files**: 6 files in `packages/common/schema/test/integrations/sql/dsl/`
- **Package Guidelines**: `@beep/schema`, `@beep/invariant`, `@beep/errors` AGENTS.md
- **Effect Documentation**: TaggedError, Cause, Error Accumulation, Pretty Printer

### Report Generation
- **Date**: 2025-12-28
- **Agents**: 5 parallel research agents
- **Total Invariants**: 96
- **Implementation Gaps**: 10 critical, 8 warning
