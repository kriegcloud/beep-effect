---
name: dsl-invariants-implementation
version: 3
created: 2025-12-28T00:00:00Z
iterations: 2
---

# DSL Metadata Invariant Validation System - Refined Implementation Prompt

## Context

You are implementing a validation layer for the `beep-effect` SQL DSL that compiles Effect Schema definitions into PostgreSQL-compatible metadata via Drizzle ORM.

### Codebase Architecture

The DSL is located at `packages/common/schema/src/integrations/sql/dsl/` with the following structure:

| File | Purpose | Key Exports |
|------|---------|-------------|
| `Field.ts` | Field factory with column metadata | `Field()`, `[ColumnMetaSymbol]` |
| `Model.ts` | Model class factory with 6 variant schemas | `Model()`, `extractColumns()`, `derivePrimaryKey()` |
| `types.ts` | Core types and type-level validation | `ColumnDef`, `DSLField`, `DSLVariantField`, `ValidateSchemaColumn` |
| `derive-column-type.ts` | AST-to-SQL type inference | `deriveColumnType()`, `deriveSchemaColumnType()` |
| `nullability.ts` | AST nullability detection | `isNullable()` |
| `adapters/drizzle.ts` | Drizzle table generation | `toDrizzle()` |
| `literals.ts` | Literal type unions | `ColumnType.Type`, `ModelVariant.Type` |

### Current Validation Approach

The DSL uses **dual validation**:

1. **Compile-Time (Type-Level)**: `ValidateSchemaColumn<SchemaEncoded, ColType>` returns `SchemaColumnError` for invalid combinations
2. **Runtime (AST Analysis)**: `deriveColumnType(ast)` throws descriptive errors for unsupported types (Never, Void, Symbol)

**Where New Validators Fit**: The new runtime validators are **additional** to existing type-level validation. They execute at Field/Model creation time and can fail with descriptive errors for semantic constraints that TypeScript cannot express (e.g., "only one autoIncrement per model").

### Research Foundation

This implementation is based on 5 research reports in `.specs/dsl-invariants/research/`:
- `01-sql-standard-invariants.md` - 19 PostgreSQL constraint invariants
- `02-type-compatibility-invariants.md` - 30 schema/column type mappings
- `03-model-composition-invariants.md` - 30 field interaction rules
- `04-drizzle-adapter-invariants.md` - 17 conversion constraints
- `05-error-presentation-strategies.md` - Error formatting patterns

Synthesis: `.specs/dsl-invariants/research-results.md` (96 total invariants)

---

## Objective

Build a validation layer that enforces documented invariants with the following measurable outcomes:

### Must Achieve
1. **6 critical invariants** validated at Field/Model creation time:
   - `INV-SQL-AI-001`: AutoIncrement requires `type: "integer"` or `"bigint"`
   - `INV-SQL-ID-001`: Identifier length <= 63 characters
   - `INV-SQL-ID-002`: Valid SQL identifier characters
   - `INV-MODEL-ID-001`: Non-empty model identifier
   - `INV-MODEL-AI-001`: Single autoIncrement per model
   - `INV-SQL-PK-001`: Primary key non-nullability

   **Selection Rationale**: These 6 invariants were chosen from the 36 critical invariants because:
   - They are **entry-point validations** (checked at Field/Model creation, not Drizzle conversion)
   - They catch **common developer mistakes** early (before database migration fails)
   - They have **no external dependencies** (don't require AST traversal beyond `isNullable()`)
   - Other critical invariants (e.g., `INV-DRZ-BUILD-002`, `INV-SQL-SCHEMA-001`) are already type-level validated or require Drizzle adapter context

2. **Error accumulation**: All validation errors collected (not fail-fast)
3. **Actionable messages**: Each error includes `expected`, `received`, `suggestion`, `code`
4. **Zero test regression**: All existing tests in `test/integrations/sql/dsl/` pass
5. **Test coverage**: Each invariant has at least 2 test cases (pass + fail)

### Should Achieve
- Pretty-printed error output with ANSI colors
- Integration with `@beep/errors` logging patterns
- Warning-level invariants for non-critical issues

---

## Role

You are an **Effect ecosystem expert** implementing pure, type-safe validation using:
- `Schema.TaggedError` for yieldable error classes
- `Effect.partition` for accumulating errors while preserving successes
- `Match.exhaustive` for type-safe error handling
- AST analysis patterns from existing `deriveColumnType()` and `isNullable()`

You understand the DSL's dual validation strategy and will hook new validators into the existing `Field()` and `Model()` factories without breaking backward compatibility.

---

## Constraints

### Absolute Requirements (from AGENTS.md)

#### No Native Methods
```typescript
// FORBIDDEN
items.map(fn)              // Use: F.pipe(items, A.map(fn))
items.filter(pred)         // Use: F.pipe(items, A.filter(pred))
str.split(",")             // Use: F.pipe(str, Str.split(","))
Object.keys(obj)           // Use: F.pipe(obj, Struct.keys)
switch (x._tag) { }        // Use: Match.value(x).pipe(Match.tag(...), Match.exhaustive)
typeof x === "string"      // Use: P.isString(x)
new Date()                 // Use: DateTime.unsafeNow()
```

#### Required Imports
```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";
```

#### Error Handling
- All validation errors MUST extend `S.TaggedError`
- No `throw` statements in validation logic (use `Effect.fail`)
- Errors must be JSON-serializable and PII-free
- Use `invariant()` from `@beep/invariant` only for programmer guards with `BUG:` prefix

#### Validation Must Be Pure
- No I/O, logging, network, filesystem, or platform dependencies
- No side effects in core validation functions
- Logging happens only in orchestration layers

### Type Safety
- No `any`, `@ts-ignore`, or unchecked casts
- Use `Match.exhaustive` to ensure all error cases handled
- Use `P.isString()`, `P.isNumber()` etc. instead of `typeof`

---

## Resources

### Files to Read Before Implementation

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `packages/common/schema/src/integrations/sql/dsl/types.ts` | Understand `ColumnDef`, `DSLField`, type-level validation |
| 2 | `packages/common/schema/src/integrations/sql/dsl/Field.ts` | Entry point for field validation |
| 3 | `packages/common/schema/src/integrations/sql/dsl/Model.ts` | Entry point for model validation |
| 4 | `packages/common/schema/src/integrations/sql/dsl/nullability.ts` | Pattern for AST-based checks |
| 5 | `packages/common/schema/test/integrations/sql/dsl/poc.test.ts` | Existing test patterns |
| 6 | `packages/common/invariant/src/error.ts` | `InvariantViolation` pattern |
| 7 | `.specs/dsl-invariants/research-results.md` | Full invariant catalog |

### Documentation to Consult
- Effect docs: Schema.TaggedError, Effect.partition, Match.exhaustive
- Effect docs: Cause.failures() for error extraction

---

## Output Specification

### File Structure to Create

```
packages/common/schema/src/integrations/sql/dsl/
├── errors.ts                 # TaggedError hierarchy
├── validate.ts               # Validation functions
├── format-error.ts           # Pretty printer (optional Phase 3)
└── index.ts                  # Updated exports

packages/common/schema/test/integrations/sql/dsl/invariants/
├── sql-standard.test.ts      # INV-SQL-* tests
├── type-compatibility.test.ts # INV-TYPE-* tests (if applicable)
├── model-composition.test.ts  # INV-MODEL-* tests
└── drizzle-adapter.test.ts    # INV-DRZ-* tests (if applicable)
```

### Error Class Structure

Each TaggedError MUST include:

```typescript
export class AutoIncrementTypeError extends S.TaggedError<AutoIncrementTypeError>()(
  "AutoIncrementTypeError",
  {
    message: S.String,                              // Human-readable description
    code: S.String,                                 // e.g., "INV-SQL-AI-001"
    severity: S.Literal("error", "warning"),        // Error level
    path: S.Array(S.String),                        // e.g., ["User", "id", "autoIncrement"]
    expected: S.optional(S.String),                 // What was expected
    received: S.optional(S.String),                 // What was received
    suggestion: S.optional(S.String),               // How to fix
    // Domain-specific fields below
    fieldName: S.String,
    actualType: S.String,
  }
) {}
```

### Validator Function Signature

```typescript
export const validateAutoIncrementType = (
  fieldName: string,
  def: ColumnDef
): Effect.Effect<void, AutoIncrementTypeError> =>
  // Implementation using Match.value, not switch
```

### Test Pattern

```typescript
import { describe, it, expect } from "vitest";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";

describe("INV-SQL-AI-001: AutoIncrement Type Restriction", () => {
  it("should fail for autoIncrement with string type", () => {
    const def: ColumnDef = { type: "string", autoIncrement: true };
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", def)
    ));

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left._tag).toBe("AutoIncrementTypeError");
      expect(result.left.code).toBe("INV-SQL-AI-001");
    }
  });

  it("should pass for autoIncrement with integer type", () => {
    const def: ColumnDef = { type: "integer", autoIncrement: true };
    const result = Effect.runSync(Effect.either(
      validateAutoIncrementType("id", def)
    ));

    expect(Either.isRight(result)).toBe(true);
  });
});
```

---

## Examples

### Example 1: Field-Level Validation with Match

```typescript
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
            message: "AutoIncrement requires integer or bigint type",
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
```

### Example 2: Model-Level Validation with Accumulation

```typescript
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

  // Use A.drop(1) + A.isNonEmptyArray to check "more than one" (Effect idiom)
  const hasMultipleAutoIncrement = F.pipe(autoIncrementFields, A.drop(1), A.isNonEmptyArray);

  return F.pipe(
    hasMultipleAutoIncrement,
    Match.value,
    Match.when(true, () =>
      Effect.fail(
        new MultipleAutoIncrementError({
          message: `Model has ${A.length(autoIncrementFields)} auto-increment fields`,
          code: "INV-MODEL-AI-001",
          severity: "error",
          path: [modelName, "autoIncrement"],
          expected: "At most one auto-increment field per model",
          received: `Fields: ${F.pipe(autoIncrementFields, A.join(", "))}`,
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
```

### Validator Ordering

Validators should run in dependency order:
1. **Field-level validators first** (identifier checks, autoIncrement type)
2. **Model-level validators second** (single autoIncrement, primary key nullability)

This ensures that field metadata is validated before model-level checks that depend on it (e.g., `validatePrimaryKeyNonNullable` requires valid field definitions).

### Example 3: Accumulating Multiple Field Errors (Model-Level)

**Error Accumulation Scope**: Individual validators (Phase 2) return single errors. Accumulation happens at the **Model level** when composing field validations. This separation keeps validators simple and composable.

```typescript
export const validateAllFields = (
  modelName: string,
  columns: Record<string, ColumnDef>
): Effect.Effect<void, ReadonlyArray<DSLValidationError>> =>
  Effect.gen(function* () {
    const validations = F.pipe(
      columns,
      Struct.entries,
      A.map(([fieldName, def]) => validateField(fieldName, def))
    );

    // Use partition to collect ALL errors, not fail-fast
    const [failures, _successes] = yield* Effect.partition(
      validations,
      F.identity
    );

    // Use A.isNonEmptyArray instead of .length > 0 (Effect idiom)
    if (A.isNonEmptyArray(failures)) {
      return yield* Effect.fail(failures);
    }
  });
```

---

## Verification Checklist

### Phase 1: Error Infrastructure
- [ ] `errors.ts` created with TaggedError hierarchy
- [ ] All error classes have `message`, `code`, `severity`, `path`, `expected`, `received`, `suggestion`
- [ ] Errors are JSON-serializable (no functions, no circular refs)
- [ ] Exported from `index.ts`

### Phase 2: Core Validators
- [ ] `validateAutoIncrementType` implemented (INV-SQL-AI-001)
- [ ] `validateIdentifierLength` implemented (INV-SQL-ID-001)
- [ ] `validateIdentifierChars` implemented (INV-SQL-ID-002)
- [ ] `validateModelIdentifier` implemented (INV-MODEL-ID-001)
- [ ] `validateSingleAutoIncrement` implemented (INV-MODEL-AI-001)
- [ ] `validatePrimaryKeyNonNullable` implemented (INV-SQL-PK-001)
- [ ] All validators use `Match.value` or `Match.exhaustive`, not switch
- [ ] All validators use Effect Array utilities, not native methods
- [ ] All validators return `Effect.Effect<void, SpecificError>`

### Phase 3: Integration (Optional)
- [ ] Validators hooked into Field factory
- [ ] Validators hooked into Model factory
- [ ] Backward compatibility maintained (existing code works)

### Phase 4: Testing
- [ ] Each invariant has at least 2 tests (pass case + fail case)
- [ ] Tests use `Effect.either` and `Either.isLeft`/`Either.isRight`
- [ ] Tests verify error `_tag`, `code`, and domain-specific fields
- [ ] Tests verify errors are JSON-serializable: `JSON.stringify(error)` succeeds
- [ ] All existing tests still pass

### Phase 5: Quality
- [ ] `bunx turbo run check --filter=@beep/schema` passes
- [ ] `bunx turbo run lint --filter=@beep/schema` passes
- [ ] `bunx turbo run test --filter=@beep/schema` passes
- [ ] No `any`, `@ts-ignore`, or native methods

---

## Metadata

### Research Sources
- **Files Explored**:
  - `packages/common/schema/src/integrations/sql/dsl/*.ts`
  - `packages/common/schema/test/integrations/sql/dsl/*.test.ts`
- **Documentation**:
  - Effect Schema.TaggedError, Effect.partition, Match.exhaustive
  - Cause composition patterns
- **AGENTS.md Consulted**:
  - Root `AGENTS.md` (forbidden patterns, required imports)
  - `packages/common/schema/AGENTS.md` (DSL guidelines)
  - `packages/common/invariant/AGENTS.md` (error patterns)
  - `packages/common/errors/AGENTS.md` (logging patterns)

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial refinement | Applied exploration findings, structured COSTAR+CRISPE format |
| 1 | 2 Medium, 5 Low severity | (1) Clarified error accumulation scope - individual validators return single errors, accumulation at Model level; (2) Added invariant selection rationale explaining why 6 of 36 critical invariants chosen; (3) Fixed Example 3 to use `A.isNonEmptyArray` instead of `.length > 0`; (4) Clarified where new validators fit in dual validation strategy; (5) Added JSON serialization test requirement |
| 2 | 1 High severity | Fixed Example 2 to use `A.drop(1) + A.isNonEmptyArray` instead of `.length > 1` and `A.length()` instead of `.length` property access |
