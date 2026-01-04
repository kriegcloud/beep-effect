# Field.ts Analysis Report

## Overview

`Field.ts` (315 lines) is the primary factory for creating `DSLField` and `DSLVariantField` instances. It bridges Effect Schemas (and VariantSchema.Field) with column metadata.

**Location**: `packages/common/schema/src/integrations/sql/dsl/Field.ts`

## Field() Factory — Three Overloads

### Overload 1: Plain Schema
```typescript
function Field<Schema extends S.Schema.All>(schema: Schema): SchemaConfiguratorWithSchema<Schema>;
```
- Returns configurator using `DeriveColumnTypeFromSchema<Schema, C>` for type inference
- Result: `DSLField<Type, Encoded, Context, ColumnDef>`

### Overload 2: Local VariantSchema.Field
```typescript
function Field<VC extends VariantSchema.Field.Config>(variantField: VariantSchema.Field<VC>): LocalVariantConfiguratorWithSchema<VC>;
```
- Uses "select" variant's schema for type derivation
- Result: `DSLVariantField<VC, ColumnDef>`

### Overload 3: Experimental VariantSchema.Field
```typescript
function Field<VC extends VariantSchema.Field.Config>(variantField: VariantSchema.Field<VC>): ExperimentalVariantConfiguratorWithSchema<VC>;
```
- Handles M.Generated, M.Sensitive, M.FieldOption variants
- Result: `DSLVariantField<VC, ColumnDef>`

## Type Derivation

When no explicit column type is provided:
- `Field(S.Int)({})` → type: `"integer"` (not `"number"`)
- `Field(S.UUID)({})` → type: `"uuid"` (not `"string"`)
- `Field(S.Date)({})` → type: `"datetime"`

## ColumnDef Usages

| Location | Usage Pattern | Complexity |
|----------|---------------|------------|
| Line 80 | `ExtractColumnType<C>` helper type | Low |
| Lines 104-117 | `SchemaConfiguratorWithSchema` return type | Very High |
| Lines 127-133 | `LocalVariantConfiguratorWithSchema` return type | Very High |
| Lines 143-149 | `ExperimentalVariantConfiguratorWithSchema` return type | Very High |
| Line 265 | Cast to `ExactColumnDef<C>` | High |
| Line 299 | `DSLVariantField<..., ExactColumnDef<C>>` return | High |
| Line 313 | `DSLField<..., ExactColumnDef<C>>` return | High |

## Key Types from types.ts

| Type | Purpose | Complexity |
|------|---------|------------|
| `ColumnDef<T, PK, U, AI>` | Generic column definition interface | Medium |
| `ExactColumnDef<C>` | Extracts exact type from partial config | High |
| `DerivedColumnDefFromSchema<S, C>` | Derives ColumnDef from schema identity | Very High |
| `ValidateSchemaColumn<SE, CT, RT>` | Validates schema/column compatibility | Very High |

## Challenges

1. **Conditional Type Distribution** — SchemaConfiguratorWithSchema uses conditionals checking `C extends { type: ColumnType.Type }`
2. **VariantField Prototype Preservation** — Manual prototype manipulation (lines 286-293) is fragile
3. **Type vs Runtime Derivation** — Type-level and runtime derivation must stay synchronized
4. **AutoIncrement Validation** — Runtime-only (lines 267-280), not enforced at type level

## Migration Path: ExactColumnDef → ColumnDefSchema.Generic

**Challenges**:
1. Requires explicit type parameters (not implicit extraction)
2. Conditional defaulting behavior differs
3. Type-only vs dual type/runtime semantics

**Recommended Approach (Hybrid)**:
- Use `ColumnDefSchema.Generic` in public-facing return types
- Keep `ExactColumnDef` for internal runtime construction
- Creates mapping layer but maintains stability

## Recommendations

1. Document type vs runtime derivation duality
2. Extract variant field wrapping logic to helper function
3. Add type-level autoIncrement validation using phantom types
4. Document ColumnMetaSymbol and VariantFieldSymbol usage
