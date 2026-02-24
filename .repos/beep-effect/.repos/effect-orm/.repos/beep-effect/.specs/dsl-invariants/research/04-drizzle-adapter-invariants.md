# Drizzle Adapter Invariants Report

## Summary

This report catalogs invariants specific to the conversion of DSL Models to Drizzle ORM table definitions via `toDrizzle()`. The adapter in `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` transforms Effect Schema-based field definitions into PostgreSQL column builders with proper type assertions, constraint ordering, and nullability derivation.

The codebase uses Effect patterns exclusively: `F.pipe()`, `Match.discriminatorsExhaustive()`, `A.map()`, `A.reduce()`, and `Struct.entries()`. All invariants must be validated using these patterns.

---

## Builder Invariants

### INV-DRZ-BUILD-001: Column Type to Builder Mapping

**Description**: Each `ColumnType.Type` must map to exactly one Drizzle builder function. The mapping must be exhaustive with no fallthrough cases.

**Rationale**: `Match.discriminatorsExhaustive("type")` in `columnBuilder` ensures compile-time exhaustiveness. Any new column type without a corresponding builder will cause a TypeScript error. This prevents silent failures where columns are not created.

**Mapping (from `drizzle.ts` lines 220-230)**:
| ColumnType | Drizzle Builder | Notes |
|------------|-----------------|-------|
| `"string"` | `pg.text(name)` | Unlimited length |
| `"number"` | `pg.integer(name)` | 32-bit signed |
| `"integer"` | `pg.serial(name)` or `pg.integer(name)` | Serial if `autoIncrement: true` |
| `"boolean"` | `pg.boolean(name)` | PostgreSQL `bool` |
| `"datetime"` | `pg.timestamp(name)` | Without timezone by default |
| `"uuid"` | `pg.uuid(name)` | PostgreSQL `uuid` type |
| `"json"` | `pg.jsonb(name)` | Binary JSON storage |
| `"bigint"` | `pg.bigint(name, { mode: "bigint" })` | 64-bit signed |

**Validation**:
- Compile-time: `Match.discriminatorsExhaustive("type")` ensures all cases handled
- Runtime: Match throws if unknown type encountered

**Error**:
```
[INV-DRZ-BUILD-001] Column '{name}' has unknown type '{type}'. Expected: one of ["string", "number", "integer", "boolean", "datetime", "uuid", "json", "bigint"]. Received: '{type}'. Fix: Use a valid ColumnType.Type value.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-DRZ-BUILD-002: Serial/AutoIncrement Requires Integer Type

**Description**: When `autoIncrement: true` is set, the column type MUST be `"integer"`. The `pg.serial()` builder is only valid for integer columns.

**Rationale**: PostgreSQL `SERIAL` is a pseudo-type that creates an integer column with an auto-incrementing sequence. Attempting to create a serial column with any other type (e.g., `"uuid"`, `"string"`) will produce invalid SQL or runtime errors.

**Current Implementation** (line 224):
```typescript
integer: thunk(def.autoIncrement ? pg.serial(name) : pg.integer(name)),
```

**Validation**:
- Compile-time: Type `DrizzleBaseBuilderFor<Name, "integer", true>` returns `PgSerialBuilderInitial`
- Runtime: Check `def.autoIncrement && def.type !== "integer"` before building

**Error**:
```
[INV-DRZ-BUILD-002] Column '{name}' has autoIncrement: true but type is '{type}'. Expected: type must be "integer" for autoIncrement columns. Received: '{type}'. Fix: Change column type to "integer" or remove autoIncrement.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-DRZ-BUILD-003: BigInt Mode Must Be Explicit

**Description**: The `pg.bigint()` builder requires an explicit `mode` option. The DSL adapter uses `{ mode: "bigint" }` to return JavaScript `bigint` values.

**Rationale**: Drizzle supports two modes: `"number"` (loses precision for values > 2^53) and `"bigint"` (returns JavaScript BigInt). The adapter must consistently use `"bigint"` mode to match Effect Schema's `S.BigInt` type expectations.

**Current Implementation** (line 229):
```typescript
bigint: thunk(pg.bigint(name, { mode: "bigint" })),
```

**Validation**:
- Compile-time: `PgBigInt53BuilderInitial` type includes mode parameter
- Runtime: Implicitly enforced by hardcoded `{ mode: "bigint" }`

**Error**:
```
[INV-DRZ-BUILD-003] Column '{name}' bigint mode is misconfigured. Expected: { mode: "bigint" }. Fix: Ensure bigint columns use bigint mode for Effect Schema compatibility.
```

**Complexity**: Low
**Severity**: Warning

---

## Constraint Invariants

### INV-DRZ-CONST-001: Constraint Application Order

**Description**: Column constraints MUST be applied in a specific order to ensure correct Drizzle builder chain. The order is: `primaryKey()` -> `unique()` -> `notNull()` -> `$type<T>()`.

**Rationale**: Drizzle's builder pattern returns new typed builders after each method call. While the runtime behavior may be order-independent, the type-level composition (`ApplyNotNull`, `ApplyPrimaryKey`, etc.) depends on a consistent ordering to produce correct TypeScript types.

**Current Implementation** (lines 232-241):
```typescript
(column) => {
  if (def.primaryKey) column = column.primaryKey();
  if (def.unique) column = column.unique();
  const fieldIsNullable = isFieldNullable(field);
  if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();
  return column.$type<EncodedType>();
}
```

**Type Composition Order** (lines 116-132):
```typescript
type DrizzleTypedBuilderFor = Apply$Type<
  ApplyAutoincrement<
    ApplyHasDefault<
      ApplyPrimaryKey<
        ApplyNotNull<
          DrizzleBaseBuilderFor<...>,
          ...
        >,
        ...
      >,
      ...
    >,
    ...
  >,
  EncodedType
>;
```

**Validation**:
- Compile-time: Type composition order is fixed in `DrizzleTypedBuilderFor`
- Runtime: Constraint application order in `columnBuilder` must match

**Error**:
```
[INV-DRZ-CONST-001] Column '{name}' constraints applied in wrong order. Expected: primaryKey -> unique -> notNull -> $type. Fix: Ensure runtime constraint application matches type-level composition.
```

**Complexity**: Low
**Severity**: Warning

---

### INV-DRZ-CONST-002: Primary Key Implies NotNull

**Description**: A column with `primaryKey: true` MUST always have `NOT NULL` constraint. PostgreSQL requires primary key columns to be non-nullable.

**Rationale**: Primary keys cannot contain NULL values as they uniquely identify rows. The adapter applies `notNull()` based on schema nullability analysis, but primary key columns must always be NOT NULL regardless of schema.

**Type-Level Implementation** (lines 75-81):
```typescript
type ApplyNotNull<T, Col, EncodedType> = Col extends { primaryKey: true }
  ? NotNull<T>
  : Col extends { autoIncrement: true }
    ? T // Serial columns handle their own nullability
    : IsEncodedNullable<EncodedType> extends true
      ? T
      : NotNull<T>;
```

**Validation**:
- Compile-time: `ApplyNotNull` always applies `NotNull` when `primaryKey: true`
- Runtime: Check that primary key fields don't have nullable schema

**Error**:
```
[INV-DRZ-CONST-002] Primary key column '{name}' cannot be nullable. Expected: primary key columns must be NOT NULL. Received: schema allows null. Fix: Remove NullOr/OptionFromNullOr wrapper from primary key schema.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-DRZ-CONST-003: Serial Columns Self-Manage Nullability

**Description**: Columns with `autoIncrement: true` (SERIAL) have implicit NOT NULL constraint and should NOT have explicit `.notNull()` applied.

**Rationale**: PostgreSQL SERIAL type is defined as `NOT NULL` by default. Applying `.notNull()` is redundant and may cause issues with some Drizzle operations.

**Current Implementation** (line 238):
```typescript
if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();
```

**Validation**:
- Compile-time: `ApplyNotNull` skips when `autoIncrement: true`
- Runtime: `!def.autoIncrement` condition prevents double NOT NULL

**Error**:
```
[INV-DRZ-CONST-003] Serial column '{name}' should not have explicit notNull. Expected: autoIncrement columns are implicitly NOT NULL. Fix: Remove explicit notNull from serial column configuration.
```

**Complexity**: Low
**Severity**: Info

---

### INV-DRZ-CONST-004: HasDefault Modifier for AutoIncrement

**Description**: AutoIncrement columns MUST have `HasDefault` modifier applied because their values are generated by the database sequence.

**Rationale**: Drizzle's `InferInsertModel` type uses `HasDefault` to make columns optional during INSERT. Without this, autoIncrement columns would be required in insert objects even though the database provides the value.

**Type-Level Implementation** (lines 93-97):
```typescript
type ApplyHasDefault<T, Col> = Col extends { autoIncrement: true }
  ? HasDefault<T>
  : Col extends { defaultValue: string | (() => string) }
    ? HasDefault<T>
    : T;
```

**Validation**:
- Compile-time: `ApplyHasDefault` checks `autoIncrement: true`
- Runtime: N/A (type-level only)

**Error**:
```
[INV-DRZ-CONST-004] AutoIncrement column '{name}' missing HasDefault modifier. Expected: autoIncrement columns must be optional on insert. Fix: Ensure ApplyHasDefault is applied in type composition.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-DRZ-CONST-005: Unique Constraint Application

**Description**: When `unique: true` is set, the `.unique()` modifier MUST be applied to create a PostgreSQL UNIQUE constraint.

**Rationale**: Unique constraints ensure data integrity at the database level. The adapter applies this after `primaryKey()` but before `notNull()`.

**Current Implementation** (line 235):
```typescript
if (def.unique) column = column.unique();
```

**Validation**:
- Compile-time: N/A (unique is not type-level in Drizzle)
- Runtime: Check `def.unique` and apply `.unique()`

**Error**:
```
[INV-DRZ-CONST-005] Column '{name}' has unique: true but .unique() not applied. Expected: unique constraint in generated SQL. Fix: Ensure unique modifier is applied in columnBuilder.
```

**Complexity**: Low
**Severity**: Warning

---

## Type Mapping Invariants

### INV-DRZ-TYPE-001: $type<T>() Must Be Applied Last

**Description**: The `.$type<T>()` modifier MUST be the final call in the builder chain. This sets the TypeScript type for the column.

**Rationale**: `.$type<T>()` is a purely type-level operation at runtime (returns `this`), but at the type level it sets the column's TypeScript type to `T`. Applying it before other modifiers could cause type inference issues.

**Current Implementation** (lines 239-241):
```typescript
// Apply .$type<T>() LAST - this is purely type-level at runtime
return column.$type<EncodedType>();
```

**Type Composition** (lines 108-109):
```typescript
type Apply$Type<T extends ColumnBuilderBase, EncodedType> = $Type<T, EncodedType>;
```

**Validation**:
- Compile-time: `Apply$Type` is outermost wrapper in `DrizzleTypedBuilderFor`
- Runtime: `.$type<EncodedType>()` is last call in builder chain

**Error**:
```
[INV-DRZ-TYPE-001] Column '{name}' has $type<T>() applied before constraints. Expected: $type must be last modifier. Fix: Move .$type<T>() to end of builder chain.
```

**Complexity**: Low
**Severity**: Warning

---

### INV-DRZ-TYPE-002: EncodedType Must Match Column Type

**Description**: The `EncodedType` passed to `.$type<T>()` MUST be compatible with the base column type. For example, a `string` encoded type is invalid for an `integer` column.

**Rationale**: Drizzle uses `.$type<T>()` to override the inferred TypeScript type. If the encoded type doesn't match what PostgreSQL will actually store/return, runtime errors occur.

**Type-Level Validation** (from `types.ts` lines 78-100):
```typescript
type IsSchemaColumnCompatible<SchemaEncoded, ColType> =
  ColType extends "string" | "uuid"
    ? [StripNullable<SchemaEncoded>] extends [string] ? true : false
  : ColType extends "number" | "integer"
    ? [StripNullable<SchemaEncoded>] extends [number] ? true : false
  : ...
```

**Validation**:
- Compile-time: `ValidateSchemaColumn` returns `SchemaColumnError` for mismatches
- Runtime: Not validated (relies on compile-time)

**Error**:
```
[INV-DRZ-TYPE-002] Column '{name}' has incompatible EncodedType. Schema encoded type '{encodedType}' is incompatible with column type '{columnType}'. Expected: {allowedColumnTypes}. Fix: Change column type or schema to match.
```

**Complexity**: Medium
**Severity**: Critical

---

### INV-DRZ-TYPE-003: Variant Field Encoded Type Extraction

**Description**: For `DSLVariantField` (e.g., `M.Generated`, `M.Sensitive`), the encoded type MUST be extracted from the "select" variant's schema, not the raw field.

**Rationale**: Variant fields have multiple schemas for different operations. The "select" variant represents what the database returns, making it the correct source for column typing.

**Current Implementation** (lines 168-196):
```typescript
const getFieldAST = (field: DSL.Fields[string]): AST.AST | null => {
  // ...
  if (isDSLVariantField(field)) {
    const selectSchema = field.schemas.select;
    // ...
  }
  // ...
};
```

**Type-Level Implementation** (from `types.ts` lines 692-724):
```typescript
type ExtractEncodedType<F> =
  [F] extends [DSLVariantField<infer Config, ColumnDef>]
    ? Config extends { select: infer SelectSchema }
      ? /* extract from SelectSchema */
    : /* fallback */
```

**Validation**:
- Compile-time: `ExtractEncodedType` navigates variant schemas
- Runtime: `getFieldAST` extracts from `field.schemas.select`

**Error**:
```
[INV-DRZ-TYPE-003] Variant field '{name}' encoded type not extracted from select schema. Expected: use "select" variant for database column type. Received: wrong variant or missing schema. Fix: Ensure variant field has valid select schema.
```

**Complexity**: Medium
**Severity**: Critical

---

### INV-DRZ-TYPE-004: Nullability Derived from Schema AST

**Description**: Column nullability MUST be derived from the Effect Schema's AST using `isNullable()`, NOT from a `nullable` property on ColumnDef.

**Rationale**: The DSL design explicitly removed `nullable` from ColumnDef in favor of deriving it from the schema. This ensures consistency between Effect Schema validation and SQL column constraints.

**Current Implementation** (lines 202-206):
```typescript
const isFieldNullable = (field: DSL.Fields[string]): boolean => {
  const ast = getFieldAST(field);
  if (ast == null) return false;
  return isNullable(ast, "from");
};
```

**Validation**:
- Compile-time: `IsEncodedNullable<T>` type checks for `null | undefined`
- Runtime: `isNullable(ast, "from")` traverses AST for nullable patterns

**Error**:
```
[INV-DRZ-TYPE-004] Column '{name}' nullability not derived from schema. Expected: nullability from isNullable(ast, "from"). Fix: Remove any nullable property from ColumnDef; use S.NullOr or M.FieldOption in schema.
```

**Complexity**: Medium
**Severity**: Critical

---

## Table Generation Invariants

### INV-DRZ-TABLE-001: Table Name From Model

**Description**: The Drizzle table name MUST be taken from `model.tableName`, which is the snake_case version of the model identifier.

**Rationale**: Ensures consistent naming convention between DSL Models and generated Drizzle tables. The `Model` factory converts `UserProfile` to `user_profile`.

**Current Implementation** (lines 287-288):
```typescript
pg.pgTable(
  model.tableName,
```

**Validation**:
- Compile-time: `M["tableName"]` type is string literal
- Runtime: Direct use of `model.tableName`

**Error**:
```
[INV-DRZ-TABLE-001] Table name mismatch. Expected: '{expectedTableName}' (snake_case of '{identifier}'). Received: '{actualTableName}'. Fix: Use model.tableName for Drizzle table creation.
```

**Complexity**: Low
**Severity**: Warning

---

### INV-DRZ-TABLE-002: All Columns From Model.columns

**Description**: The Drizzle table MUST include ALL columns from `model.columns`, including those excluded from certain variants (e.g., Generated fields excluded from insert).

**Rationale**: The database table needs all columns regardless of variant filtering. Variant filtering affects Effect Schema validation, not physical column existence.

**Current Implementation** (lines 289-308):
```typescript
F.pipe(
  model.columns,
  Struct.entries,
  A.map(([key, def]) => {
    const field = model._fields[key];
    return [key, columnBuilder(key, def, field)] as const;
  }),
  A.reduce({...}, (acc, [k, v]) => ({ ...acc, [k]: v }))
)
```

**Validation**:
- Compile-time: Type `DrizzleTypedBuildersFor<M["columns"], M["_fields"]>`
- Runtime: Iterates all entries in `model.columns`

**Error**:
```
[INV-DRZ-TABLE-002] Missing columns in Drizzle table. Expected: all columns from model.columns. Missing: {missingColumns}. Fix: Ensure all model columns are converted to Drizzle columns.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-DRZ-TABLE-003: Field and ColumnDef Must Have Matching Keys

**Description**: For each key in `model.columns`, there MUST be a corresponding entry in `model._fields` with the same key.

**Rationale**: The `columnBuilder` requires both the ColumnDef (from columns) and the DSL field (from _fields) to derive nullability and encoded types. Mismatched keys would cause runtime errors.

**Current Implementation** (lines 294-295):
```typescript
const field = model._fields[key];
return [key, columnBuilder(key, def, field)] as const;
```

**Validation**:
- Compile-time: Type parameters ensure `Columns` and `Fields` are related
- Runtime: Check `model._fields[key]` is defined before building

**Error**:
```
[INV-DRZ-TABLE-003] Column '{key}' exists in model.columns but not in model._fields. Expected: matching keys in columns and _fields. Fix: Ensure Field() is used for all columns or _fields is populated correctly.
```

**Complexity**: Low
**Severity**: Critical

---

## Default Value Invariants

### INV-DRZ-DEFAULT-001: Default Values Not Yet Implemented

**Description**: The current adapter does NOT apply `defaultValue` from ColumnDef to Drizzle columns. This is a known limitation.

**Rationale**: While ColumnDef supports `defaultValue?: string | (() => string)`, the `columnBuilder` function does not call `.default()` on the Drizzle builder. Default values must be handled at the Effect Schema level or added to the adapter.

**Current State**: `defaultValue` is captured in ColumnDef but not applied:
```typescript
interface ColumnDef {
  readonly defaultValue?: undefined | string | (() => string);
}
// In columnBuilder, no `.default()` call exists
```

**Validation**:
- Compile-time: `ApplyHasDefault` type is defined but runtime doesn't apply
- Runtime: Default values are NOT applied to Drizzle columns

**Error**:
```
[INV-DRZ-DEFAULT-001] Column '{name}' has defaultValue but it is not applied. Expected: .default() call on Drizzle builder. Received: defaultValue ignored. Fix: Add default value handling to columnBuilder or use database-level defaults.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-DRZ-DEFAULT-002: AutoIncrement Implies Database Default

**Description**: Columns with `autoIncrement: true` have an implicit database-level default (the next sequence value). No explicit `.default()` should be applied.

**Rationale**: PostgreSQL SERIAL automatically provides the next sequence value. Applying an explicit default would conflict with this behavior.

**Type-Level** (lines 93-97):
```typescript
type ApplyHasDefault<T, Col> = Col extends { autoIncrement: true }
  ? HasDefault<T>  // Type-level mark, not runtime default
  : ...
```

**Validation**:
- Compile-time: `HasDefault` is applied for type inference
- Runtime: No explicit `.default()` for serial columns

**Error**:
```
[INV-DRZ-DEFAULT-002] Serial column '{name}' should not have explicit defaultValue. Expected: sequence-generated default. Received: defaultValue set. Fix: Remove defaultValue from autoIncrement column.
```

**Complexity**: Low
**Severity**: Warning

---

## Foreign Key/Relation Invariants (Future)

### INV-DRZ-REL-001: Relations Not Yet Implemented

**Description**: The current adapter does NOT support foreign key or relation definitions. This is documented in `todos.md`.

**Rationale**: The `relations.ts` file is nearly empty (only a commented import). Relation support requires:
1. Field-level relation configuration
2. Model-level relation aggregation
3. Drizzle `relations()` function integration

**Current State** (from `todos.md`):
```
- [] figure out support for defining relations on either the Field or the Model level
```

**Future Requirements**:
- Foreign key columns must reference existing tables
- Referenced columns must be primary keys or have unique constraints
- Cascade behaviors (ON DELETE, ON UPDATE) must be explicitly configured
- Self-referential relations must be handled

**Validation**: N/A (not implemented)

**Error**:
```
[INV-DRZ-REL-001] Relations are not yet supported. Expected: relation configuration to be ignored. Fix: Define relations at the Drizzle level separately from DSL Model.
```

**Complexity**: High
**Severity**: Info

---

## Index Invariants (Future)

### INV-DRZ-IDX-001: Index Definitions Not Yet Supported

**Description**: The adapter does not currently support index creation beyond primary key and unique constraints.

**Rationale**: Indexes require additional configuration (columns, expression, partial conditions, type). This is out of scope for the current DSL focus on column definitions.

**Future Requirements**:
- Support for composite indexes (multiple columns)
- Support for expression indexes
- Support for partial indexes (WHERE clause)
- Support for index types (btree, hash, gin, gist)

**Validation**: N/A (not implemented)

**Error**:
```
[INV-DRZ-IDX-001] Index definitions are not supported in DSL Model. Fix: Define indexes using Drizzle's index() function directly on the table.
```

**Complexity**: High
**Severity**: Info

---

## Edge Cases

### EDGE-001: Empty Columns Record

**Description**: A Model with no columns would produce an empty Drizzle table, which is invalid.

**Validation**: Model factory should require at least one field. Current implementation doesn't explicitly prevent this.

### EDGE-002: Duplicate Column Names

**Description**: TypeScript prevents duplicate keys at compile time, but runtime object creation could theoretically allow duplicates.

**Validation**: `Struct.entries` on a properly typed object prevents duplicates.

### EDGE-003: Reserved SQL Identifiers

**Description**: Column names like `user`, `order`, `group` are reserved SQL keywords and may cause issues.

**Validation**: Drizzle handles quoting, but validation could warn about reserved words.

### EDGE-004: Very Long Column Names

**Description**: PostgreSQL has a 63-character limit for identifiers.

**Validation**: Not currently validated; could add length check.

### EDGE-005: Non-ASCII Column Names

**Description**: Column names should typically be ASCII-only for portability.

**Validation**: Not currently validated; could add character check.

### EDGE-006: Null Field in _fields

**Description**: If `model._fields[key]` is `undefined`, nullability derivation fails.

**Current Handling** (line 237):
```typescript
const fieldIsNullable = isFieldNullable(field); // field could be undefined
```

**Validation**: `getFieldAST` returns `null` for undefined fields, causing `isNullable` to return `false`.

### EDGE-007: Circular Schema References

**Description**: Schemas with circular references (via `S.suspend`) could cause infinite loops.

**Validation**: `isNullable` uses `WeakSet` for visited tracking to prevent infinite recursion.

---

## Implementation Recommendations

### Priority 1 (Critical)
1. Add runtime validation for `autoIncrement` only with `integer` type (INV-DRZ-BUILD-002)
2. Validate field/column key alignment (INV-DRZ-TABLE-003)
3. Add Model-level validation for at least one field (EDGE-001)

### Priority 2 (Warning)
1. Implement default value application (INV-DRZ-DEFAULT-001)
2. Add reserved SQL keyword warnings (EDGE-003)
3. Add column name length validation (EDGE-004)

### Priority 3 (Info/Future)
1. Design relation support architecture (INV-DRZ-REL-001)
2. Design index support architecture (INV-DRZ-IDX-001)
3. Add comprehensive AST validation for edge cases

---

## Type-Level vs Runtime Validation Matrix

| Invariant | Compile-Time | Runtime | Notes |
|-----------|--------------|---------|-------|
| INV-DRZ-BUILD-001 | Match.exhaustive | Match throws | Exhaustive by design |
| INV-DRZ-BUILD-002 | Type mapping | Not validated | Should add |
| INV-DRZ-BUILD-003 | Hardcoded | N/A | Always correct |
| INV-DRZ-CONST-001 | Type composition | Code order | Must match |
| INV-DRZ-CONST-002 | ApplyNotNull | Schema analysis | Type+Runtime |
| INV-DRZ-CONST-003 | ApplyNotNull | Condition check | Covered |
| INV-DRZ-CONST-004 | ApplyHasDefault | N/A | Type-only |
| INV-DRZ-CONST-005 | N/A | Condition check | Runtime only |
| INV-DRZ-TYPE-001 | Apply$Type order | Code order | Must match |
| INV-DRZ-TYPE-002 | ValidateSchemaColumn | Not validated | Type-only |
| INV-DRZ-TYPE-003 | ExtractEncodedType | getFieldAST | Type+Runtime |
| INV-DRZ-TYPE-004 | IsEncodedNullable | isNullable | Type+Runtime |
| INV-DRZ-TABLE-001 | Type literal | Direct use | Covered |
| INV-DRZ-TABLE-002 | Type mapping | Iteration | Covered |
| INV-DRZ-TABLE-003 | Type params | Access | Should validate |
| INV-DRZ-DEFAULT-001 | HasDefault | Not applied | Gap |
| INV-DRZ-DEFAULT-002 | Type logic | Condition | Covered |
