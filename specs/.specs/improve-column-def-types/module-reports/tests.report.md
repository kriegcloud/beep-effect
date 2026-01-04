# Test Files Analysis Report

## Overview

8 test files with 209 total ColumnDef/ColumnMetaSymbol references.

**Location**: `packages/common/schema/test/integrations/sql/dsl/`

## Test Files Summary

| File | References | Purpose | Impact |
|------|------------|---------|--------|
| poc.test.ts | 6 | Proof-of-concept for Model/Field | HIGH |
| combinators.test.ts | 36 | Pipe-friendly combinator API | CRITICAL |
| derive-column-type.test.ts | 35 | Column type derivation | HIGH |
| drizzle-typed-columns.test.ts | 11 | Drizzle typed columns | MODERATE |
| field-model-comprehensive.test.ts | 106 | Comprehensive Field/Model coverage | CRITICAL |
| variant-integration.test.ts | 6 | VariantSchema integration | MODERATE |
| invariants/sql-standard.test.ts | 9 | SQL standard invariants | LOW |
| invariants/model-composition.test.ts | 11 | Model composition invariants | LOW |

## Critical Files

### field-model-comprehensive.test.ts (106 references)

Tests ALL AST member types:
- Primitive keywords (S.String, S.Number, S.Boolean, S.BigIntFromSelf)
- Refinements (S.Int, S.UUID, chained)
- Transformations (Date, DateFromString, BigInt)
- Structural types (S.Struct, S.Array, S.Record, S.Tuple)
- Union patterns (S.NullOr, S.UndefinedOr, literal unions)
- VariantSchema fields (M.Generated, M.Sensitive, etc.)
- Branded types, template literals, fallback types

**Pattern**: Extensive ColumnMetaSymbol property assertions

### combinators.test.ts (36 references)

Tests all combinators:
- Type setters (uuid, string, integer, etc.)
- Constraint setters (primaryKey, unique, autoIncrement)
- Default value setter
- Combinator composition and chaining

**Pattern**: Property assertions on ColumnMetaSymbol

## Migration Strategy

### Priority Order

1. **LOW RISK** — invariants tests (use ColumnDef as test data, easily replaced)
2. **MODERATE** — variant-integration, drizzle-typed-columns
3. **HIGH** — poc.test.ts, derive-column-type.test.ts
4. **CRITICAL** — combinators.test.ts, field-model-comprehensive.test.ts

### Considerations

- All tests currently pass
- Maintain test coverage for column type derivation
- Type-level assertions (expectTypeOf) should continue working
- Field/Model DSL should expose column metadata through alternative mechanism
- Drizzle table generation must remain unaffected
