# errors.ts + literals.ts Analysis Report

## Overview

These files establish the vocabulary and error contract for the SQL DSL without tight coupling to ColumnDef.

**Locations**:
- `packages/common/schema/src/integrations/sql/dsl/errors.ts` (~200 lines)
- `packages/common/schema/src/integrations/sql/dsl/literals.ts` (~50 lines)

## errors.ts — Error Schemas (8 total)

### Validation Errors

| Error | Code | Constraint |
|-------|------|------------|
| `AutoIncrementTypeError` | INV-SQL-AI-001 | autoIncrement requires integer/bigint |
| `IdentifierTooLongError` | INV-SQL-ID-001 | PostgreSQL 63 byte limit |
| `InvalidIdentifierCharsError` | INV-SQL-ID-002 | Valid SQL identifier chars |
| `NullablePrimaryKeyError` | INV-SQL-PK-001 | PKs must be non-nullable |
| `EmptyModelIdentifierError` | INV-MODEL-ID-001 | Non-empty identifier |
| `MultipleAutoIncrementError` | INV-MODEL-AI-001 | Max one autoIncrement per model |

### Other Errors

| Error | Purpose |
|-------|---------|
| `MissingVariantSchemaError` | VariantSchema.Field has no schema with AST |
| `UnsupportedColumnTypeError` | Schema type cannot map to SQL column type |

### Common Error Fields

All errors share:
- `message: string`
- `code: string`
- `severity: ErrorSeverity.Type`
- `path: ReadonlyArray<string>`
- `expected?: string`
- `received?: string`
- `suggestion?: string`

### Union Type

- `DSLValidationError` — Discriminated union of all 8 error types
- `DSLValidationErrorSchema` — Union schema for serialization

## literals.ts — String Literal Kits

### ModelVariant

Values: `"select"`, `"insert"`, `"update"`, `"json"`, `"jsonCreate"`, `"jsonUpdate"`

### ColumnType

Values: `"string"`, `"number"`, `"integer"`, `"boolean"`, `"datetime"`, `"uuid"`, `"json"`, `"bigint"`

**Static Utilities**:
- `ColumnType.thunks` — Lazy thunks for each type
- `ColumnType.parameterize` — Type-tagged objects `{ type: "string" }`, etc.

## ColumnDef References

**None in either file** — These establish vocabulary consumed BY ColumnDef derivation, not referencing it.

## Recommendations

1. **Error Categorization** — Well-structured, follows PostgreSQL constraint semantics
2. **Naming Consistency** — Follows `INV-{DOMAIN}-{CATEGORY}-{NUMBER}` pattern
3. **Extension Points** — `commonErrorFields` object is well-structured for future additions
4. **Test Coverage** — Verify ColumnType utilities maintain referential equality
