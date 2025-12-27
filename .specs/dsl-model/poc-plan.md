# DSL.Model POC Implementation Plan

## Overview

This plan outlines the minimum viable implementation to prove the DSL.Model design pattern works.

## Simplified Type Definitions

### Core Types (Minimum Viable)

```typescript
// ColumnType - subset for POC
type ColumnType = "string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json";

// ColumnDef - simplified for POC (no references, maxLength, index)
interface ColumnDef<
  T extends ColumnType = ColumnType,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  N extends boolean = boolean,
  AI extends boolean = boolean
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly nullable?: N;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AI;
}

// FieldConfig - column only for POC (no variants)
interface FieldConfig<C extends Partial<ColumnDef>> {
  readonly column?: C;
}
```

### Type-Level Helpers

```typescript
// Preserves literal types from partial config
type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { type: infer T extends ColumnType } ? T : "string";
  readonly primaryKey: C extends { primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { unique: infer U extends boolean } ? U : false;
  readonly nullable: C extends { nullable: infer N extends boolean } ? N : false;
  readonly autoIncrement: C extends { autoIncrement: infer AI extends boolean } ? AI : false;
  readonly defaultValue: C extends { defaultValue: infer DV } ? DV : undefined;
};
```

## Implementation Order

| Order | File | Dependencies | Description |
|-------|------|--------------|-------------|
| 1 | `types.ts` | None | ColumnType, ColumnDef, FieldConfig, ColumnMetaSymbol |
| 2 | `Field.ts` | types.ts | DSLField interface, Field combinator |
| 3 | `Model.ts` | types.ts, Field.ts | ModelStatics, Model factory |
| 4 | `adapters/drizzle.ts` | types.ts, Model.ts | toDrizzle function |
| 5 | `index.ts` | All above | Re-exports |
| 6 | `__tests__/poc.test.ts` | index.ts | Validation tests |

## Test Case Specifications

### Field Tests

1. **Field returns valid Effect Schema**
   - Input: `Field(S.String, { column: { type: "string" } })`
   - Assert: `S.isSchema(field) === true`

2. **Field attaches column metadata**
   - Input: `Field(S.String, { column: { type: "string", unique: true } })`
   - Assert: Annotation extractable via `AST.getAnnotation(ColumnMetaSymbol)`

3. **Field supports autoIncrement for serial columns**
   - Input: `Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } })`
   - Assert: `meta.autoIncrement === true`

### Model Tests

1. **Model is valid Effect Schema**
   - Assert: `S.isSchema(TestModel) === true`

2. **Model exposes tableName as snake_case**
   - Input: Identifier "UserProfile"
   - Assert: `Model.tableName === "user_profile"`

3. **Model exposes identifier unchanged**
   - Input: Identifier "Test"
   - Assert: `Model.identifier === "Test"`

4. **Model derives primaryKey from fields**
   - Input: Fields with `_rowId: { primaryKey: true }`
   - Assert: `Model.primaryKey === ["_rowId"]`

5. **Model exposes columns record**
   - Assert: `Model.columns._rowId.type === "integer"`
   - Assert: `Model.columns._rowId.primaryKey === true`

6. **S.decodeSync works with Model**
   - Assert: Decode succeeds with valid input
   - Assert: Decode throws with invalid input

### toDrizzle Tests

1. **toDrizzle produces Drizzle table**
   - Assert: Table defined with correct name
   - Assert: Columns mapped correctly

## Known Simplifications

| Simplification | Full Design | POC Implementation | Post-POC Action |
|----------------|-------------|-------------------|-----------------|
| No AST inference | Section 5, Q3 | Hardcode column type from config | Implement `inferColumnType(schema)` |
| No variants | 6-variant system | Single S.Class | Migrate to VariantSchema.Class |
| No indexes | IndexDef support | Only primaryKey | Add IndexDef support |
| No references | Foreign key config | Not implemented | Add references support |
| No toBetterAuth | Full adapter | Not implemented | Implement post-POC |
| Simple snake_case | Robust conversion | Native regex | Use Effect String utilities |

## File Structure

```
packages/common/schema/src/integrations/sql/dsl/
├── index.ts              # Public exports
├── types.ts              # ColumnType, ColumnDef, FieldConfig, symbols
├── Field.ts              # DSL.Field implementation
├── Model.ts              # DSL.Model factory
├── adapters/
│   └── drizzle.ts        # toDrizzle implementation
└── __tests__/
    └── poc.test.ts       # Validation tests
```

## Critical Patterns to Follow

### 1. Annotation Pattern
```typescript
const ColumnMetaSymbol: unique symbol = Symbol.for("@beep/dsl-model/column-meta");

// Apply
schema.annotations({ [ColumnMetaSymbol]: columnDef })

// Retrieve
F.pipe(
  schema.ast,
  AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
  O.getOrElse(() => defaultColumnDef)
)
```

### 2. Static Property Pattern
```typescript
class ModelClass extends S.Class<Self>(identifier)(fields) {
  static readonly tableName = tableName;
  static readonly columns = columns;
  static readonly primaryKey = primaryKey;
  static readonly identifier = identifier;
}
```

### 3. Type Preservation Pattern
```typescript
// Use `const` generic to preserve literal types
const Field = <
  A, I, R,
  const C extends Partial<ColumnDef> = {}
>(schema, config): DSLField<A, I, R, ExactColumnDef<C>>
```

## Validation Checkpoints

### After types.ts
- [ ] TypeScript compiles without errors

### After Field.ts
- [ ] Field tests pass (annotation attachment)

### After Model.ts
- [ ] Model tests pass (static properties, decode)

### After drizzle.ts
- [ ] toDrizzle test passes

### Final Validation
- [ ] `bun run check --filter=@beep/schema` passes
- [ ] `bun test packages/common/schema/src/integrations/sql/dsl` passes
- [ ] `bun run lint --filter=@beep/schema` passes
