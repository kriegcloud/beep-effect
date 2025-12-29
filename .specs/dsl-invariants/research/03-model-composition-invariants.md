# Model Composition Invariants Research Report

This document catalogs invariants governing how `Field`s compose into DSL `Model`s. These invariants ensure type-safe schema generation, correct Drizzle table output, and proper variant schema behavior.

## Source Files Analyzed

- `/packages/common/schema/src/integrations/sql/dsl/Model.ts`
- `/packages/common/schema/src/integrations/sql/dsl/Field.ts`
- `/packages/common/schema/src/integrations/sql/dsl/types.ts`
- `/packages/common/schema/src/integrations/sql/dsl/literals.ts`
- `/packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `/packages/common/schema/src/integrations/sql/dsl/combinators.ts`
- `/packages/common/schema/src/integrations/sql/dsl/nullability.ts`
- `/packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts`
- `/packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts`
- `/packages/common/schema/test/integrations/sql/dsl/poc.test.ts`

---

## 1. Field Name Constraints

### INV-MODEL-NAME-001: Field Names Must Be Valid JavaScript Identifiers

**Description**: All field names within a Model must be valid JavaScript property identifiers.

**Rationale**: The DSL uses object destructuring, property access (`Model.columns.fieldName`), and generates TypeScript interfaces. Invalid identifiers would break compilation and runtime access patterns.

**Validation**:
- Compile-time: TypeScript enforces valid property keys in `Record<string, ...>` types through `DSL.Fields`
- Runtime: JavaScript object literal syntax implicitly validates identifiers

**Error**:
```
[INV-MODEL-NAME-001] Field name '${name}' is not a valid JavaScript identifier. Expected: alphanumeric characters, starting with letter or underscore. Received: '${name}'. Fix: Rename the field to use valid identifier syntax.
```

**Complexity**: Low
**Severity**: Critical

**Current Status**: Implicitly enforced by TypeScript's `Record<string, ...>` constraint in `DSL.Fields`.

---

### INV-MODEL-NAME-002: Field Names Must Be Unique Within Model

**Description**: No two fields within a single Model may share the same name.

**Rationale**: Duplicate field names would cause property shadowing in the generated schema, unpredictable column metadata extraction, and ambiguous Drizzle column definitions.

**Validation**:
- Compile-time: TypeScript object literal syntax prevents duplicate keys with `const` assertion
- Runtime: JavaScript object semantics naturally deduplicate (last wins), but this silent behavior could mask bugs

**Error**:
```
[INV-MODEL-NAME-002] Model '${modelName}' contains duplicate field name '${fieldName}'. Expected: unique field names. Received: '${fieldName}' declared ${count} times. Fix: Rename duplicate fields to have distinct names.
```

**Complexity**: Low
**Severity**: Critical

**Current Status**: Compile-time enforced for literal field definitions. No explicit runtime validation exists for dynamic field composition.

---

### INV-MODEL-NAME-003: Field Names Should Not Shadow Reserved Properties

**Description**: Field names should avoid conflicting with Model static properties (`tableName`, `columns`, `primaryKey`, `identifier`, `_fields`) and variant accessors (`select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`).

**Rationale**: The Model class attaches these properties statically. While JavaScript allows instance and static properties with the same name, this creates confusion and potential bugs when accessing `Model.select` (variant schema) vs a field named `select`.

**Validation**:
- Compile-time: Type intersection between field names and reserved names could produce a warning type
- Runtime: Check field names against reserved list before Model construction

**Error**:
```
[INV-MODEL-NAME-003] Field name '${fieldName}' in Model '${modelName}' shadows reserved property. Expected: field names that don't conflict with Model statics. Received: '${fieldName}'. Fix: Rename the field to avoid conflict with: tableName, columns, primaryKey, identifier, _fields, select, insert, update, json, jsonCreate, jsonUpdate.
```

**Complexity**: Medium
**Severity**: Warning

**Current Status**: Not explicitly enforced. Fields named `select`, `insert`, etc. would create confusing behavior.

---

## 2. Minimum Field Requirements

### INV-MODEL-FIELD-001: Models May Have Zero Fields (Empty Schema)

**Description**: A Model with an empty fields object `{}` is technically valid and produces an empty struct schema.

**Rationale**: While practically useless for database tables, empty models could serve as marker types or be composed with mixins later. The current implementation does not reject empty field objects.

**Validation**:
- Compile-time: No constraint preventing `Model<M>("Name")({})`
- Runtime: Creates valid schema with empty fields

**Error**: N/A (currently allowed)

**Complexity**: Low
**Severity**: Info

**Current Status**: Allowed. Consider whether a warning should be emitted for models without any fields.

---

### INV-MODEL-FIELD-002: At Least One Non-Generated Field Required for Insert Variant

**Description**: If a Model contains only `M.Generated` fields, the `insert` variant would be an empty schema, making inserts impossible.

**Rationale**: A model where all fields are database-generated cannot be inserted without specifying at least one value. This is semantically valid only for views or special cases.

**Validation**:
- Compile-time: The `insert` variant type would be `{}` - could emit a warning type
- Runtime: Attempting `S.decodeSync(Model.insert)({})` succeeds but produces an empty object

**Error**:
```
[INV-MODEL-FIELD-002] Model '${modelName}' has no insertable fields. Expected: at least one field not wrapped in M.Generated. Received: all ${fieldCount} fields are Generated. Fix: Add at least one regular field, or use M.GeneratedByApp for app-provided values.
```

**Complexity**: Medium
**Severity**: Warning

**Current Status**: Not explicitly validated. Insert variant becomes empty struct if all fields are Generated.

---

## 3. Primary Key Requirements

### INV-MODEL-PK-001: Primary Key is Derived at Runtime (Optional)

**Description**: Models do not require a primary key declaration. If no field has `primaryKey: true`, `Model.primaryKey` is an empty array.

**Rationale**: The DSL separates schema definition from database constraints. Some models may represent views or denormalized data without a primary key.

**Validation**:
- Compile-time: None (primaryKey is `readonly string[]`, not enforced non-empty)
- Runtime: `derivePrimaryKey` returns `[]` when no fields have `primaryKey: true`

**Error**: N/A (currently optional)

**Complexity**: Low
**Severity**: Info

**Current Status**: Primary key is optional. Consider adding a warning for models without any primary key.

---

### INV-MODEL-PK-002: Composite Primary Keys Supported

**Description**: Multiple fields may have `primaryKey: true`, creating a composite primary key.

**Rationale**: Relational databases support composite primary keys for junction tables and natural keys.

**Validation**:
- Compile-time: `ExtractPrimaryKeys` type collects all fields with `primaryKey: true`
- Runtime: `derivePrimaryKey` returns all field names where `primaryKey === true`

**Example**:
```typescript
class OrderItem extends Model<OrderItem>("OrderItem")({
  orderId: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  productId: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  quantity: Field(S.Int)({ column: { type: "integer" } }),
}) {}

OrderItem.primaryKey // ["orderId", "productId"]
```

**Complexity**: Low
**Severity**: Info

**Current Status**: Fully supported. `primaryKey` array can contain multiple field names.

---

### INV-MODEL-PK-003: Primary Key Fields Should Not Be Nullable

**Description**: Fields marked as `primaryKey: true` should not allow null values in their schema.

**Rationale**: SQL databases require primary key columns to be NOT NULL. Nullable primary keys violate relational integrity.

**Validation**:
- Compile-time: Could add a conditional type check on primary key fields
- Runtime: `drizzle.ts` applies `notNull()` for primary key columns regardless of schema nullability

**Error**:
```
[INV-MODEL-PK-003] Primary key field '${fieldName}' in Model '${modelName}' has nullable schema. Expected: non-nullable schema type. Received: ${schemaType} which encodes to null. Fix: Remove NullOr/UndefinedOr wrapper from the primary key schema.
```

**Complexity**: Medium
**Severity**: Warning

**Current Status**: Drizzle adapter forces `notNull()` on primary keys, but no compile-time warning exists.

---

## 4. Identifier/TableName Validity

### INV-MODEL-ID-001: Identifier Must Be Non-Empty String

**Description**: The identifier passed to `Model<Self>(identifier)` must be a non-empty string.

**Rationale**: The identifier is used for schema annotations, table name derivation, and variant schema naming. An empty identifier would produce invalid table names and confusing error messages.

**Validation**:
- Compile-time: TypeScript template literal in error type would fail for empty string
- Runtime: No explicit check; empty string would produce table name `_` from snake_case conversion

**Error**:
```
[INV-MODEL-ID-001] Model identifier is empty. Expected: non-empty string identifier. Received: ''. Fix: Provide a meaningful identifier like 'User' or 'OrderItem'.
```

**Complexity**: Low
**Severity**: Critical

**Current Status**: Not explicitly validated. Empty string produces degenerate table names.

---

### INV-MODEL-ID-002: Identifier Should Be PascalCase

**Description**: Model identifiers should follow PascalCase convention for consistency with TypeScript class naming.

**Rationale**: The identifier is used as-is for schema annotations (`User.select`) and converted to snake_case for table names. Inconsistent casing could produce unexpected table names.

**Validation**:
- Compile-time: Template literal types could enforce starting uppercase
- Runtime: Warning log if identifier doesn't start with uppercase letter

**Example**:
```typescript
// Identifier "UserProfile" → tableName "user_profile"
// Identifier "userProfile" → tableName "user_profile" (same result, but inconsistent)
// Identifier "user_profile" → tableName "user_profile" (redundant conversion)
```

**Complexity**: Low
**Severity**: Info

**Current Status**: Not enforced. All casing styles work but produce varying table names.

---

### INV-MODEL-ID-003: TableName Should Be Valid SQL Identifier

**Description**: The derived `tableName` must be a valid SQL identifier (alphanumeric, underscores, starts with letter).

**Rationale**: Invalid table names would cause SQL syntax errors at migration or query time.

**Validation**:
- Compile-time: Difficult to enforce as snake_case transformation is runtime
- Runtime: `toSnakeCase` function could validate output against SQL identifier rules

**Error**:
```
[INV-MODEL-ID-003] Derived tableName '${tableName}' from identifier '${identifier}' is not a valid SQL identifier. Expected: alphanumeric and underscores, starting with letter. Received: '${tableName}'. Fix: Adjust the identifier or implement custom table naming.
```

**Complexity**: Medium
**Severity**: Critical

**Current Status**: `toSnakeCase` produces valid SQL identifiers for typical PascalCase input. Edge cases (numbers, special chars) are not validated.

---

## 5. Cross-Field Constraint Interactions

### INV-MODEL-AI-001: At Most One AutoIncrement Field Per Model

**Description**: Only one field should have `autoIncrement: true` per Model.

**Rationale**: PostgreSQL allows only one SERIAL/IDENTITY column per table. Multiple auto-increment fields would fail at migration.

**Validation**:
- Compile-time: Could use a type accumulator to detect multiple autoIncrement fields
- Runtime: Check `autoIncrement: true` count after field extraction

**Error**:
```
[INV-MODEL-AI-001] Model '${modelName}' has ${count} auto-increment fields: [${fieldNames}]. Expected: at most one auto-increment field per model. Fix: Remove autoIncrement from all but one field.
```

**Complexity**: Medium
**Severity**: Critical

**Current Status**: Not validated. Multiple autoIncrement fields would fail at Drizzle migration.

---

### INV-MODEL-AI-002: AutoIncrement Requires Integer Column Type

**Description**: Fields with `autoIncrement: true` must have `type: "integer"`.

**Rationale**: PostgreSQL SERIAL is an integer sequence. Auto-increment on non-integer types is invalid.

**Validation**:
- Compile-time: Conditional type check on ColumnDef intersection
- Runtime: `drizzle.ts` uses `pg.serial(name)` only when `type: "integer"` and `autoIncrement: true`

**Error**:
```
[INV-MODEL-AI-002] Field '${fieldName}' in Model '${modelName}' has autoIncrement with non-integer type '${type}'. Expected: type "integer" for auto-increment fields. Fix: Set column type to "integer".
```

**Complexity**: Low
**Severity**: Critical

**Current Status**: Type-level checking exists in `DrizzleBaseBuilderFor`. Runtime mismatch would produce incorrect Drizzle column.

---

### INV-MODEL-UNIQUE-001: Unique Constraint Allowed on Multiple Fields

**Description**: Multiple fields may have `unique: true` independently.

**Rationale**: Tables commonly have multiple unique constraints (e.g., id is unique, email is unique).

**Validation**: No restriction needed.

**Complexity**: Low
**Severity**: Info

**Current Status**: Fully supported. Each unique field gets its own UNIQUE constraint.

---

### INV-MODEL-UNIQUE-002: Primary Key Fields Need Not Declare Unique

**Description**: Primary key columns are implicitly unique; explicitly setting `unique: true` on a primary key is redundant but harmless.

**Rationale**: SQL PRIMARY KEY implies UNIQUE. Drizzle may apply both constraints.

**Validation**:
- Compile-time: None needed
- Runtime: Could log info-level message about redundancy

**Complexity**: Low
**Severity**: Info

**Current Status**: Redundant unique on primary key is allowed without warning.

---

## 6. Variant Field Filtering

### INV-MODEL-VAR-001: Generated Fields Excluded from Insert Variant

**Description**: Fields wrapped in `M.Generated` are automatically excluded from the `insert` variant schema.

**Rationale**: Generated fields (like auto-increment IDs or database-computed columns) should not be provided during INSERT.

**Validation**:
- Compile-time: `ExtractVariantFields<"insert", Fields>` type excludes fields where `ShouldIncludeField` returns false
- Runtime: `VS.extract(vsStruct, "insert")` produces schema without Generated fields

**Test Verification** (from `variant-integration.test.ts`):
```typescript
expect(hasField(Post.insert.fields, "id")).toBe(false); // Generated excluded
expect(hasField(Post.insert.fields, "title")).toBe(true);
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented via VariantSchema integration.

---

### INV-MODEL-VAR-002: Generated Fields Excluded from jsonCreate and jsonUpdate Variants

**Description**: `M.Generated` fields are excluded from client-facing create/update schemas.

**Rationale**: Clients should not provide database-generated values in API requests.

**Validation**: Same as VAR-001, verified by variant extraction.

**Test Verification**:
```typescript
expect(hasField(Entity.jsonCreate.fields, "id")).toBe(false);
expect(hasField(Entity.jsonUpdate.fields, "id")).toBe(false);
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented.

---

### INV-MODEL-VAR-003: Sensitive Fields Excluded from All JSON Variants

**Description**: Fields wrapped in `M.Sensitive` are excluded from `json`, `jsonCreate`, and `jsonUpdate` variants.

**Rationale**: Sensitive data (passwords, tokens) should never be exposed in API responses or accepted in API requests.

**Validation**:
- Compile-time: `ShouldIncludeField` returns false for Sensitive fields in json variants
- Runtime: VariantSchema extraction handles exclusion

**Test Verification**:
```typescript
expect(hasField(User.json.fields, "passwordHash")).toBe(false);
expect(hasField(User.jsonCreate.fields, "passwordHash")).toBe(false);
expect(hasField(User.jsonUpdate.fields, "passwordHash")).toBe(false);
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented.

---

### INV-MODEL-VAR-004: Sensitive Fields Included in Database Variants

**Description**: `M.Sensitive` fields are included in `select`, `insert`, and `update` variants.

**Rationale**: Sensitive data must be stored in and retrieved from the database.

**Test Verification**:
```typescript
expect(hasField(User.select.fields, "passwordHash")).toBe(true);
expect(hasField(User.insert.fields, "passwordHash")).toBe(true);
expect(hasField(User.update.fields, "passwordHash")).toBe(true);
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented.

---

### INV-MODEL-VAR-005: GeneratedByApp Fields Required in Insert but Excluded from jsonCreate/jsonUpdate

**Description**: `M.GeneratedByApp` fields (like UUIDs generated by the application) are required during database insert but should not be provided by API clients.

**Rationale**: App-generated IDs must be inserted into the database but are controlled by the application, not the client.

**Test Verification**:
```typescript
expect(hasField(Document.insert.fields, "id")).toBe(true);
expect(hasField(Document.jsonCreate.fields, "id")).toBe(false);
expect(hasField(Document.jsonUpdate.fields, "id")).toBe(false);
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented.

---

### INV-MODEL-VAR-006: FieldOption Creates Optional Nullable Fields

**Description**: `M.FieldOption` wraps a schema to make it optional (accepts null from database, missing key from JSON).

**Rationale**: Nullable columns should map to `Option<T>` in TypeScript with appropriate null/missing handling per variant.

**Test Verification**:
```typescript
const selectWithNull = S.decodeSync(Profile.select)({ id: "...", bio: null });
expect(O.isNone(selectWithNull.bio)).toBe(true);

const jsonWithoutBio = S.decodeSync(Profile.json)({ id: "..." });
expect(O.isNone(jsonWithoutBio.bio)).toBe(true);
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented via VariantSchema.

---

### INV-MODEL-VAR-007: Plain DSL Fields Included in All Six Variants

**Description**: Fields created with `Field(S.Schema)({...})` (not wrapped in M.Generated, M.Sensitive, etc.) are included in all variant schemas.

**Rationale**: Regular fields have no special exclusion rules.

**Test Verification**:
```typescript
// All variants should have both fields
const selectDecoded = S.decodeSync(User.select)(data);
const insertDecoded = S.decodeSync(User.insert)(data);
const updateDecoded = S.decodeSync(User.update)(data);
const jsonDecoded = S.decodeSync(User.json)(data);
const jsonCreateDecoded = S.decodeSync(User.jsonCreate)(data);
const jsonUpdateDecoded = S.decodeSync(User.jsonUpdate)(data);
```

**Complexity**: Already Implemented
**Severity**: Info

**Current Status**: Fully implemented. Plain fields wrapped with `VS.FieldOnly(...ModelVariant.Options)`.

---

## 7. Generated/Sensitive Field Placement Requirements

### INV-MODEL-PLACE-001: No Ordering Requirement for Variant Fields

**Description**: Fields using M.Generated, M.Sensitive, etc. may appear in any order within the Model definition.

**Rationale**: Field ordering in JavaScript objects is preserved (insertion order), but the DSL does not impose semantic ordering requirements.

**Validation**: None needed.

**Complexity**: Low
**Severity**: Info

**Current Status**: No ordering constraints. Fields processed in insertion order.

---

### INV-MODEL-PLACE-002: Column Metadata Preserved Regardless of Variant Type

**Description**: `Model.columns` includes column definitions for ALL fields, including Generated and Sensitive, because Drizzle needs complete table structure.

**Rationale**: The columns record is for database schema generation, not for variant filtering.

**Test Verification**:
```typescript
expect(Entity.columns.id).toEqual(
  expect.objectContaining({ type: "uuid", unique: true, primaryKey: true })
);
// Even though 'id' is Generated, it appears in columns
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented. `extractColumns` processes all fields regardless of variant wrappers.

---

## 8. Circular Reference Handling

### INV-MODEL-CIRC-001: Self-Referential Schemas via S.suspend

**Description**: Models may contain fields that reference themselves through `S.suspend` for tree/recursive structures.

**Rationale**: Recursive data structures (trees, linked lists) require self-referential schemas.

**Validation**:
- Compile-time: TypeScript supports self-referential types with proper declaration
- Runtime: `deriveColumnType` and `isNullable` use `WeakSet` to prevent infinite loops

**Example**:
```typescript
interface TreeNode {
  value: string;
  children: readonly TreeNode[];
}

const TreeNode: S.Schema<TreeNode> = S.Struct({
  value: S.String,
  children: S.Array(S.suspend(() => TreeNode)),
});
```

**Complexity**: Medium
**Severity**: Critical

**Current Status**: Circular reference protection in `deriveColumnType` and `isNullable` via visited WeakSet.

---

### INV-MODEL-CIRC-002: Mutual References Between Models Not Directly Supported

**Description**: Two models cannot directly reference each other at definition time without lazy evaluation.

**Rationale**: JavaScript class declarations are evaluated in order. Model A cannot reference Model B if B is defined later.

**Validation**:
- Compile-time: TypeScript errors on forward references
- Runtime: ReferenceError if accessing undeclared class

**Error**:
```
[INV-MODEL-CIRC-002] Model '${modelA}' references Model '${modelB}' which is not yet defined. Expected: model to be defined before reference. Fix: Use S.suspend(() => ModelB) for lazy reference, or reorder model definitions.
```

**Complexity**: High
**Severity**: Warning

**Current Status**: Not explicitly handled. Users must use `S.suspend` for mutual references.

---

## 9. Field Ordering Significance

### INV-MODEL-ORDER-001: Field Order Preserved in Generated Output

**Description**: The order of fields in the Model definition is preserved in `Model.columns`, `Model.primaryKey`, and Drizzle table columns.

**Rationale**: JavaScript object property order is guaranteed (ES2015+). Consistent ordering improves debugging and migration diffs.

**Validation**:
- Compile-time: None needed
- Runtime: `Struct.entries` preserves insertion order

**Example**:
```typescript
class User extends Model<User>("User")({
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string" } }),
  name: Field(S.String)({ column: { type: "string" } }),
}) {}

// Columns will be in order: id, email, name
```

**Complexity**: Low
**Severity**: Info

**Current Status**: Field order is preserved throughout the pipeline.

---

### INV-MODEL-ORDER-002: Primary Key Order Matches Field Definition Order

**Description**: When multiple fields have `primaryKey: true` (composite key), they appear in `Model.primaryKey` in field definition order.

**Rationale**: Composite key order matters for indexes and query optimization.

**Validation**:
- Compile-time: None (order is runtime concern)
- Runtime: `derivePrimaryKey` filters and maps in field order

**Complexity**: Low
**Severity**: Info

**Current Status**: Primary key order matches field definition order.

---

## 10. Schema/Column Type Compatibility

### INV-MODEL-TYPE-001: Column Type Must Be Compatible with Schema Encoded Type

**Description**: The explicit `column.type` must be compatible with the schema's encoded (I) type.

**Rationale**: Type mismatches cause runtime errors when inserting/querying data. For example, a `S.Int` schema cannot use `column.type: "uuid"`.

**Validation**:
- Compile-time: `ValidateSchemaColumn` returns `SchemaColumnError` for incompatible combinations
- Runtime: Drizzle will fail at query time if types don't match

**Error** (compile-time type):
```
Schema encoded type 'number' is incompatible with column type 'uuid'. Allowed column types for this schema: number | integer
```

**Test Reference** (from Field.ts comments):
```typescript
// Valid combinations
Field(S.String)({ column: { type: "uuid" } })     // string -> uuid OK
Field(S.Int)({ column: { type: "integer" } })     // number -> integer OK

// Invalid combinations (compile error)
Field(S.String)({ column: { type: "integer" } })  // string incompatible with integer
Field(S.Int)({ column: { type: "uuid" } })        // number incompatible with uuid
```

**Complexity**: Already Implemented
**Severity**: Critical

**Current Status**: Fully implemented with type-level validation.

---

### INV-MODEL-TYPE-002: Column Type Derived from Schema When Not Explicit

**Description**: When `column.type` is not specified, it's derived from the schema's class identity or encoded type.

**Rationale**: Reduces boilerplate while maintaining type safety.

**Derivation Rules**:
- `S.Int` -> `"integer"`
- `S.UUID` -> `"uuid"`
- `S.Date` / `S.DateFromString` -> `"datetime"`
- `S.String` -> `"string"`
- `S.Number` -> `"number"`
- `S.Boolean` -> `"boolean"`
- `S.BigInt` -> `"bigint"`
- Structs/Arrays -> `"json"`

**Complexity**: Already Implemented
**Severity**: Info

**Current Status**: Fully implemented in `deriveColumnType` and type-level `DeriveColumnTypeFromSchema`.

---

## Summary

| Invariant ID | Category | Severity | Status |
|--------------|----------|----------|--------|
| INV-MODEL-NAME-001 | Field Names | Critical | Implicit (TypeScript) |
| INV-MODEL-NAME-002 | Field Names | Critical | Implicit (TypeScript) |
| INV-MODEL-NAME-003 | Field Names | Warning | Not Enforced |
| INV-MODEL-FIELD-001 | Minimum Fields | Info | Allowed |
| INV-MODEL-FIELD-002 | Minimum Fields | Warning | Not Validated |
| INV-MODEL-PK-001 | Primary Key | Info | Optional |
| INV-MODEL-PK-002 | Primary Key | Info | Supported |
| INV-MODEL-PK-003 | Primary Key | Warning | Partial (Drizzle enforces) |
| INV-MODEL-ID-001 | Identifier | Critical | Not Validated |
| INV-MODEL-ID-002 | Identifier | Info | Not Enforced |
| INV-MODEL-ID-003 | TableName | Critical | Not Validated |
| INV-MODEL-AI-001 | Constraints | Critical | Not Validated |
| INV-MODEL-AI-002 | Constraints | Critical | Type-level only |
| INV-MODEL-UNIQUE-001 | Constraints | Info | Supported |
| INV-MODEL-UNIQUE-002 | Constraints | Info | Allowed (redundant) |
| INV-MODEL-VAR-001 | Variants | Critical | Implemented |
| INV-MODEL-VAR-002 | Variants | Critical | Implemented |
| INV-MODEL-VAR-003 | Variants | Critical | Implemented |
| INV-MODEL-VAR-004 | Variants | Critical | Implemented |
| INV-MODEL-VAR-005 | Variants | Critical | Implemented |
| INV-MODEL-VAR-006 | Variants | Critical | Implemented |
| INV-MODEL-VAR-007 | Variants | Info | Implemented |
| INV-MODEL-PLACE-001 | Placement | Info | No Constraints |
| INV-MODEL-PLACE-002 | Placement | Critical | Implemented |
| INV-MODEL-CIRC-001 | Circular Refs | Critical | Implemented |
| INV-MODEL-CIRC-002 | Circular Refs | Warning | Manual (S.suspend) |
| INV-MODEL-ORDER-001 | Ordering | Info | Preserved |
| INV-MODEL-ORDER-002 | Ordering | Info | Preserved |
| INV-MODEL-TYPE-001 | Type Compat | Critical | Implemented |
| INV-MODEL-TYPE-002 | Type Compat | Info | Implemented |

---

## Recommendations

### High Priority (Not Currently Enforced)

1. **INV-MODEL-ID-001**: Add runtime validation for non-empty identifier string
2. **INV-MODEL-AI-001**: Add runtime check for single autoIncrement field per model
3. **INV-MODEL-ID-003**: Add runtime validation for valid SQL table names

### Medium Priority (Would Improve DX)

4. **INV-MODEL-NAME-003**: Emit warning for field names that shadow Model static properties
5. **INV-MODEL-PK-003**: Add compile-time warning for nullable primary key schemas
6. **INV-MODEL-FIELD-002**: Emit warning for models where all fields are Generated

### Low Priority (Nice to Have)

7. **INV-MODEL-ID-002**: Add linter rule for PascalCase identifiers
8. **INV-MODEL-UNIQUE-002**: Log info message for redundant unique+primaryKey

---

## Implementation Notes

### Nullability Derivation

Nullability is **derived from schema AST**, not stored in ColumnDef. This is intentional:
- `isNullable(ast, "from")` analyzes the encoded side for SQL storage
- `M.FieldOption` produces nullable encoded types automatically
- The `nullable` combinator is deprecated (no-op)

### Variant Schema Integration

The Model class creates a VariantSchema internally:
1. `createModelVariantSchema()` configures 6 variants
2. `toVariantFields()` wraps DSL fields appropriately
3. Each variant accessor (`Model.select`, etc.) is lazily computed and cached

### Type-Level Derivation

The type system provides:
- `DeriveColumnTypeFromSchema<Schema>` for precise type derivation
- `ValidateSchemaColumn<Encoded, ColType, Result>` for compatibility checks
- `ExtractVariantFields<V, Fields>` for variant field filtering
