---
name: dsl-column-type-derivation-implementation
version: 1
created: 2025-12-28
research-phase: complete
---

# Implementation Orchestration Prompt: SQL Column Type Derivation

## Context

This prompt coordinates the implementation and verification of SQL column type derivation for the `beep-effect` monorepo DSL. The research phase is complete—findings are documented in:

**Research Report**: `.specs/dsl-derived-column-types/default-column-derivation-research.md`

## Objective

Implement the complete column type derivation system:
1. Verify and fix the type-level implementation (`DeriveColumnTypeFromSchema`)
2. Verify and fix the runtime implementation (`deriveColumnType`)
3. Ensure both implementations match for all 11 target schema types
4. Add comprehensive test coverage
5. Document the `S.Any` ordering requirement

**Success Criteria**:
- All type-level derivations match expected column types (verified via `expectTypeOf`)
- All runtime derivations match expected column types (verified via assertions)
- Type-level and runtime derivations agree for all schemas
- Tests pass for all 11 target schemas plus edge cases
- No type errors in `bun run check`
- All tests pass in `bun run test`

## Target Schema Mapping

| Schema           | Expected Column | Category       | Detection Method                     |
|------------------|-----------------|----------------|--------------------------------------|
| `S.Int`          | `"integer"`     | Refined        | SchemaId: `IntSchemaId`              |
| `S.UUID`         | `"uuid"`        | Refined        | SchemaId: `UUIDSchemaId`             |
| `S.ULID`         | `"uuid"`        | Refined        | SchemaId: `ULIDSchemaId`             |
| `S.Date`         | `"datetime"`    | Transformation | Identifier: `"Date"`                 |
| `S.DateFromString`| `"datetime"`   | Transformation | Identifier: `"DateFromString"`       |
| `S.DateTimeUtc`  | `"datetime"`    | Transformation | Identifier: `"DateTimeUtc"`          |
| `S.BigInt`       | `"datetime"`    | Transformation | Identifier: `"BigInt"`               |
| `S.Any`          | `"json"`        | Special        | AST: `AnyKeyword` / typeof check     |
| `S.Unknown`      | `"json"`        | Special        | AST: `UnknownKeyword` / typeof check |
| `S.String`       | `"string"`      | Primitive      | AST: `StringKeyword` / encoded type  |
| `S.Number`       | `"number"`      | Primitive      | AST: `NumberKeyword` / encoded type  |

## File Locations

| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Type-level derivation |
| `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` | Runtime derivation |
| `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts` | Test suite |

## Implementation Tasks

### Task 1: Audit Type-Level Implementation

**File**: `packages/common/schema/src/integrations/sql/dsl/types.ts`

**Verify the following in `DeriveColumnTypeFromSchemaInner`**:

1. **`S.Any` is checked FIRST** - Critical for preventing false matches due to `any` variance
2. **`S.Unknown` is checked early** - After `S.Any`, before refinements
3. **`S.Int`** → `"integer"` via `Schema extends typeof S.Int`
4. **`S.UUID`** → `"uuid"` via `Schema extends typeof S.UUID`
5. **`S.ULID`** → `"uuid"` via `Schema extends typeof S.ULID`
6. **`S.Date`** → `"datetime"` via `Schema extends typeof S.Date`
7. **`S.DateFromString`** → `"datetime"` via `Schema extends typeof S.DateFromString`
8. **`S.DateTimeUtc`** → `"datetime"` via `Schema extends typeof S.DateTimeUtc`
9. **`S.BigInt`** → `"bigint"` via `Schema extends typeof S.BigInt`

**Expected Current State**: The existing implementation in `types.ts` appears complete. Verify no regressions.

**Fix if needed**: Ensure ordering matches research recommendations.

### Task 2: Audit Runtime Implementation

**File**: `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts`

**Verify/Fix the following**:

1. **Add `ULIDSchemaId`** - Currently missing from the runtime implementation:
   ```typescript
   const ULIDSchemaId = Symbol.for("effect/SchemaId/ULID");
   ```

2. **Update `deriveRefinementColumnType`** to handle ULID:
   ```typescript
   if (id === UUIDSchemaId) return "uuid" as const;
   if (id === ULIDSchemaId) return "uuid" as const;  // ADD THIS
   if (id === IntSchemaId) return "integer" as const;
   ```

3. **Verify transformation identifiers** in `deriveTransformationColumnType`:
   - `"Date"` → `"datetime"` ✓
   - `"DateFromString"` → `"datetime"` ✓
   - `"DateTimeUtc"` → `"datetime"` ✓
   - `"DateTimeUtcFromSelf"` → `"datetime"` ✓
   - `"BigInt"` → `"bigint"` ✓
   - `"BigIntFromString"` → `"bigint"` ✓

4. **Verify special types** handled correctly:
   - `AnyKeyword` → `"json"` ✓
   - `UnknownKeyword` → `"json"` ✓

### Task 3: Expand Test Coverage

**File**: `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts`

**Add missing tests**:

```typescript
describe("refinements with SchemaId", () => {
  // ADD: ULID test (currently missing)
  it("derives 'uuid' for S.ULID", () => {
    expect(deriveSchemaColumnType(S.ULID)).toBe("uuid");
  });
});

describe("transformations", () => {
  // ADD: DateTimeUtc test (currently missing)
  it("derives 'datetime' for S.DateTimeUtc", () => {
    expect(deriveSchemaColumnType(S.DateTimeUtc)).toBe("datetime");
  });
});
```

**Add type-level tests for ULID and DateTimeUtc**:

```typescript
describe("Refined Types - Precise type derivation via schema identity", () => {
  it("S.ULID narrows to 'uuid' (not 'string')", () => {
    const field = Field(S.ULID)({});
    expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
  });

  it("S.DateTimeUtc narrows to 'datetime'", () => {
    const field = Field(S.DateTimeUtc)({});
    expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
  });
});
```

### Task 4: Add Parity Test Suite

**Purpose**: Ensure type-level and runtime derivations always match.

**Add to test file**:

```typescript
describe("Type-Runtime Parity", () => {
  // This test suite verifies that type-level and runtime derivations match
  // for all target schemas. Type assertions verify compile-time behavior,
  // runtime assertions verify runtime behavior, and the tests ensure they agree.

  const schemas = [
    { schema: S.Int, expected: "integer" as const },
    { schema: S.UUID, expected: "uuid" as const },
    { schema: S.ULID, expected: "uuid" as const },
    { schema: S.Date, expected: "datetime" as const },
    { schema: S.DateFromString, expected: "datetime" as const },
    { schema: S.DateTimeUtc, expected: "datetime" as const },
    { schema: S.BigInt, expected: "bigint" as const },
    { schema: S.Any, expected: "json" as const },
    { schema: S.Unknown, expected: "json" as const },
    { schema: S.String, expected: "string" as const },
    { schema: S.Number, expected: "number" as const },
    { schema: S.Boolean, expected: "boolean" as const },
  ] as const;

  for (const { schema, expected } of schemas) {
    it(`runtime derives '${expected}' for ${schema.ast._tag}`, () => {
      expect(deriveSchemaColumnType(schema)).toBe(expected);
    });
  }
});
```

### Task 5: Add Documentation Comment

**File**: `packages/common/schema/src/integrations/sql/dsl/types.ts`

**Add prominent comment at `DeriveColumnTypeFromSchemaInner`**:

```typescript
/**
 * Inner derivation logic after unwrapping nullable wrappers.
 *
 * ## CRITICAL ORDERING REQUIREMENT
 *
 * `S.Any` MUST be checked FIRST in this conditional chain.
 *
 * Due to TypeScript's variance behavior with `any`, the type
 * `Schema<any, any, never>` will match bidirectionally with any other
 * schema type. By checking `typeof S.Any` first, we prevent false matches.
 *
 * The ordering of checks follows this priority:
 * 1. Special types (Any, Unknown, Object) - prevents false matches
 * 2. Refined types (Int, UUID, ULID) - before their base types
 * 3. Transformation types (Date, DateFromString, DateTimeUtc, BigInt)
 * 4. Number refinements (Positive, Negative, etc.)
 * 5. Fallback to encoded type derivation
 *
 * @internal
 */
```

## Verification Steps

After implementing all tasks, run:

```bash
# Type check
bun run check --filter @beep/schema

# Run tests
bun run test --filter @beep/schema

# Or run specific test file
bun test packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts
```

**Expected Results**:
- Zero type errors
- All tests pass
- Coverage for all 11 target schemas

## Execution Plan

1. **Read current implementations** (types.ts, derive-column-type.ts)
2. **Identify gaps** by comparing to research findings
3. **Fix runtime implementation** (add ULIDSchemaId)
4. **Verify type-level implementation** ordering
5. **Expand tests** with missing schemas
6. **Add parity tests**
7. **Run verification commands**
8. **Report results**

## Constraints

### Required Import Conventions

```typescript
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as A from "effect/Array";
```

### Forbidden Patterns

- No native Array methods (`.map()`, `.filter()`)
- No switch statements (use `Match`)
- No `any` type annotations
- No `@ts-ignore` or `@ts-expect-error`

## Success Checklist

Before completing, verify ALL items:

- [ ] `ULIDSchemaId` added to runtime implementation
- [ ] ULID handling added to `deriveRefinementColumnType`
- [ ] `S.Any` check is first in type-level conditional
- [ ] All 11 schemas have runtime tests
- [ ] All 11 schemas have type-level tests
- [ ] Parity test suite added
- [ ] Documentation comment added for ordering requirement
- [ ] `bun run check --filter @beep/schema` passes
- [ ] `bun test packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts` passes

---

## Appendix: Research Findings Summary

### Class Identity Checks (`typeof S.X`)

**Verdict**: WORKS (with critical ordering requirement)

Class identity checks using `Schema extends typeof S.Int` work reliably for distinguishing Effect Schema types at the type level. The key insight is that `typeof S.X` captures the constructor type, not the instance type, which provides sufficient discrimination.

**Critical Requirement**: `S.Any` MUST be checked FIRST in all conditional type chains.

### SchemaId Annotation Checks (Runtime)

**Verdict**: WORKS (for refined schemas)

| Schema | Has SchemaId | Symbol                               |
|--------|--------------|--------------------------------------|
| Int    | YES          | `Symbol.for("effect/SchemaId/Int")`  |
| UUID   | YES          | `Symbol.for("effect/SchemaId/UUID")` |
| ULID   | YES          | `Symbol.for("effect/SchemaId/ULID")` |

### Identifier Annotation Checks (Runtime)

**Verdict**: WORKS (for transformation schemas)

| Schema         | Identifier         |
|----------------|--------------------|
| Date           | `"Date"`           |
| DateFromString | `"DateFromString"` |
| DateTimeUtc    | `"DateTimeUtc"`    |
| BigInt         | `"BigInt"`         |

### Encoded Type Fallback

**Verdict**: PARTIAL (last resort only)

Works for primitives but cannot distinguish refined schemas from their base types.
