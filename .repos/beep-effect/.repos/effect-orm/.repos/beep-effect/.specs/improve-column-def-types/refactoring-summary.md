# ColumnDef Types Refactoring Summary

## Overview

This document summarizes the refactoring effort to improve the SQL DSL column definition types in `packages/common/schema/src/integrations/sql/dsl/`.

## Completed Work

### Phase 1: Module Exploration
- Created 10 module reports analyzing the DSL module structure
- Synthesized findings into `dsl-module.report.md`

### Phase 2: Usage Analysis
- Cataloged 126 ColumnDef references across 6 source files
- Documented migration plan in `col-def-usages.md`
- Updated analysis to reflect the actual GenericMap pattern

### Phase 3.1: types.ts Foundation

**Key Changes:**

1. **ColumnDef Interface Retained**
   - Kept as runtime-compatible interface with all optional properties
   - Allows runtime property access (e.g., `def.autoIncrement`) on any column def
   - Documented as suitable for runtime use

2. **ColumnDefSchema.Generic Available**
   - Existing discriminated union pattern preserved
   - Uses `GenericMap<PK, U, AI>[T]` for indexed access by column type
   - Enforces INV-SQL-AI-001 at type level (autoIncrement only on integer/bigint)
   - No phantom type parameters - each member has natural arity

3. **ExactColumnDef Returns Concrete Object Type**
   - Changed from returning `ColumnDef<...>` interface to concrete object type
   - Required properties (not optional) for proper type-level inference
   - Preserves literal boolean types through combinator chains

4. **DerivedColumnDefFromSchema Returns Concrete Object Type**
   - Same pattern as ExactColumnDef
   - Enables proper type inference in Field factory

5. **Added autoIncrement to Non-Integer Generic Interfaces**
   - All member Generic interfaces now have `autoIncrement?: undefined`
   - Allows property access on union but prevents setting `true` on non-integer types

## Validation Results

### Type Checking
- `bunx turbo run check --filter=@beep/schema` passes successfully
- All 11 tasks complete

### Test Results
- 584 tests pass
- 23 test failures (pre-existing, unrelated to this refactoring)
  - Failures are in `derive-column-type.ts` runtime derivation
  - Due to pre-existing changes using `Eq.equals(1)(A.length(...))` pattern
  - Not caused by types.ts changes

## Files Modified

| File | Changes |
|------|---------|
| `types.ts` | ColumnDef interface retained, ExactColumnDef/DerivedColumnDefFromSchema return concrete types, autoIncrement added to all Generic interfaces |

## Decision: Pragmatic Approach

The original goal was to fully replace `ColumnDef` with `ColumnDefSchema.Generic`. However, the discriminated union pattern is incompatible with:
- `Partial<UnionType>` distribution behavior
- Runtime code expecting flat object access

**Final Approach:**
- Keep `ColumnDef` interface for runtime compatibility
- Use `ColumnDefSchema.Generic` for stricter type-level constraints where desired
- `ExactColumnDef` and `DerivedColumnDefFromSchema` return concrete object types for proper type inference

## Type-Level Invariant Enforcement

INV-SQL-AI-001 (autoIncrement only on integer/bigint) is enforced at two levels:

1. **ColumnDefSchema.Generic** - Union discriminates based on column type, `autoIncrement` property only exists on IntegerColumnDefSchema.Generic and BigintColumnDefSchema.Generic

2. **Runtime Validation** - `validateAutoIncrementType()` in validate.ts checks at runtime

---

*Completed: 2024-12-28*
