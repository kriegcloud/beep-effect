# validate.ts Analysis Report

## Overview

`validate.ts` (~486 lines) is the runtime validation layer implementing compile-time invariants through Effect-based validators with error accumulation.

**Location**: `packages/common/schema/src/integrations/sql/dsl/validate.ts`

## Validators

### Field-Level (4)

| Function | Invariant | Constraint |
|----------|-----------|------------|
| `validateAutoIncrementType` | INV-SQL-AI-001 | autoIncrement requires integer/bigint |
| `validateIdentifierLength` | INV-SQL-ID-001 | PostgreSQL 63 char limit |
| `validateIdentifierChars` | INV-SQL-ID-002 | Valid SQL identifier chars |
| `validatePrimaryKeyNonNullable` | INV-SQL-PK-001 | PKs must be non-nullable |

### Model-Level (2)

| Function | Invariant | Constraint |
|----------|-----------|------------|
| `validateModelIdentifier` | INV-MODEL-ID-001 | Identifier cannot be empty |
| `validateSingleAutoIncrement` | INV-MODEL-AI-001 | Max one autoIncrement per model |

### Composed Validators

- `validateField` — Runs all 4 field validators, accumulates errors
- `validateModel` — Runs model + field validators for all columns
- `validateFieldSync` / `validateModelSync` — Synchronous wrappers

## INV-SQL-AI-001 Implementation (Lines 79-114)

```typescript
Match.value({ autoIncrement: def.autoIncrement, type: def.type })
  Match.when(
    ({ autoIncrement, type }) =>
      autoIncrement === true && type !== "integer" && type !== "bigint",
    ({ type }) => Effect.fail(new AutoIncrementTypeError({...}))
  )
  Match.orElse(thunkEffectVoid)
```

**Dual-Layer Enforcement**:
1. **Type Level** (types.ts) — autoIncrement property absent from non-numeric schemas
2. **Runtime Level** (validate.ts) — validateAutoIncrementType catches violations

## ColumnDef Usages

| Location | Usage Pattern | Complexity |
|----------|---------------|------------|
| Line 92 | Parameter in validateAutoIncrementType | Simple |
| Line 351 | Parameter in validateField | Simple |
| Line 389 | Record parameter in validateModel | High |
| Lines 299-304 | Filter for autoIncrement === true | Moderate |
| Line 360 | Extract def.primaryKey | Simple |

## Challenges

1. **Nullable Field Detection** — Line 413 defaults to `false` (hardcoded)
   - validateModel passes hardcoded `false` for isNullableField
   - Cannot detect nullable primary keys without external AST context

2. **ColumnDef Property Optionality** — Inconsistent handling:
   - `def.autoIncrement === true` (explicit check)
   - `def.primaryKey ?? false` (nullish coalescing)

3. **Identifier Pattern** — Allows `$` which isn't standard SQL

4. **No AST-Based Nullability Derivation** — Module doesn't import AST inspection helpers

## Recommendations

1. **Align Nullability Detection** — Pass proper nullability from Field.ts AST analysis
2. **Consistent Optionality Handling** — Standardize to explicit checks
3. **Clarify Identifier Pattern** — Document why `$` is allowed
4. **Document Limitations** — Add JSDoc noting validateModel needs external AST context
