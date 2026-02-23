# Type Compatibility Invariants Research

## Executive Summary

This document catalogs all invariants governing the compatibility between Effect Schema encoded types and SQL column types in the DSL. The type system employs a two-layer validation strategy: compile-time type-level checks via `IsSchemaColumnCompatible<SchemaEncoded, ColType>` and runtime validation via `deriveColumnType(ast)`.

---

## ColumnType Taxonomy

The DSL defines exactly eight SQL column types in `literals.ts`:

| ColumnType  | TypeScript Encoded | Use Cases |
|-------------|-------------------|-----------|
| `"string"`  | `string`          | Text, VARCHAR, TEXT |
| `"uuid"`    | `string`          | UUID columns (refined string) |
| `"datetime"`| `string \| Date`  | TIMESTAMP, DATE, DATETIME |
| `"number"`  | `number`          | REAL, DOUBLE, NUMERIC |
| `"integer"` | `number`          | INT, SMALLINT, SERIAL |
| `"boolean"` | `boolean`         | BOOLEAN |
| `"bigint"`  | `bigint`          | BIGINT, BIGSERIAL |
| `"json"`    | `object \| unknown[]` | JSON, JSONB |

---

## Schema to Column Type Mappings

### Primitive Mappings

```
S.String      -> "string"
S.Number      -> "number"
S.Boolean     -> "boolean"
S.BigIntFromSelf -> "bigint"
```

### Refined Type Mappings (via SchemaId)

```
S.Int         -> "integer" (detected via IntSchemaId symbol)
S.UUID        -> "uuid" (detected via UUIDSchemaId symbol)
S.ULID        -> "uuid" (mapped to uuid column type)
S.Positive    -> "number"
S.Negative    -> "number"
S.NonPositive -> "number"
S.NonNegative -> "number"
```

### Transformation Mappings (via Identifier annotation)

```
S.Date            -> "datetime"
S.DateFromString  -> "datetime"
S.DateTimeUtc     -> "datetime"
S.DateTimeUtcFromSelf -> "datetime"
S.BigInt          -> "bigint"
S.BigIntFromNumber -> "number" (encodes to number!)
S.NumberFromString -> "string" (encodes to string!)
S.split(...)      -> "string" (encodes to string)
```

### Structural Type Mappings

```
S.Struct({...})   -> "json"
S.Array(...)      -> "json"
S.Tuple(...)      -> "json"
S.Record({...})   -> "json"
S.Unknown         -> "json"
S.Any             -> "json"
S.Object          -> "json"
```

### Union Handling

```
S.NullOr(T)       -> derives from T (null stripped)
S.Literal("a","b") -> "string" (homogeneous string literals)
S.Literal(1, 2)   -> "integer" (homogeneous number literals)
S.Union(S.String, S.Number) -> "json" (heterogeneous)
```

---

## Invariants

### INV-TYPE-COMPAT-001: Schema Encoded Type Must Match Column Type

**Description**: The schema's encoded type (I) must be assignment-compatible with the column type's TypeScript representation. This is enforced via `IsSchemaColumnCompatible<SchemaEncoded, ColType>`.

**Rationale**: SQL columns have fixed storage types. A mismatch causes runtime serialization failures or data corruption.

**Validation**:
- Compile-time: `IsSchemaColumnCompatible<I, C>` returns `true` or `false`
- Runtime: `deriveColumnType(ast)` derives the correct type; explicit overrides bypass derivation

**Error**:
```
[INV-TYPE-COMPAT-001] Field 'email' encoded type 'number' is incompatible with column type 'string'. Expected: string. Received: number. Fix: Change column type to 'number' or 'integer', or change schema to S.String.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-002: String Schema with Non-String Column

**Description**: A schema encoding to `string` cannot use column types `integer`, `number`, `boolean`, or `bigint`.

**Rationale**: String values cannot be stored in numeric or boolean columns without explicit transformation.

**Validation**:
- Compile-time: `[StripNullable<string>] extends [number]` evaluates to `false`
- Runtime: Type mismatch at insert time

**Error**:
```
[INV-TYPE-COMPAT-002] Field 'name' schema encodes to 'string' but column type is 'integer'. Allowed column types: 'string' | 'uuid' | 'datetime'. Fix: Use column type 'string' or 'uuid'.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-003: Number Schema with Incompatible Column

**Description**: A schema encoding to `number` is only compatible with `number` or `integer` column types.

**Rationale**: Numeric precision requirements must match. `number` accommodates both float and integer SQL types.

**Validation**:
- Compile-time: `[StripNullable<number>] extends [number]` for `number`/`integer`
- Runtime: `deriveColumnType` returns `"number"` for `NumberKeyword`, `"integer"` for `Int`

**Error**:
```
[INV-TYPE-COMPAT-003] Field 'count' schema encodes to 'number' but column type is 'string'. Allowed column types: 'number' | 'integer'. Fix: Use column type 'number' or 'integer'.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-004: Boolean Schema with Non-Boolean Column

**Description**: A schema encoding to `boolean` must use the `boolean` column type.

**Rationale**: Boolean values have no implicit conversion to other SQL types in this DSL.

**Validation**:
- Compile-time: `[StripNullable<boolean>] extends [boolean]` for `boolean` only
- Runtime: `deriveColumnType` returns `"boolean"` for `BooleanKeyword`

**Error**:
```
[INV-TYPE-COMPAT-004] Field 'active' schema encodes to 'boolean' but column type is 'integer'. Allowed column types: 'boolean'. Fix: Use column type 'boolean'.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-005: BigInt Schema with Non-BigInt Column

**Description**: A schema encoding to `bigint` must use the `bigint` column type.

**Rationale**: JavaScript BigInt values exceed the precision of `number` and require special column handling.

**Validation**:
- Compile-time: `[StripNullable<bigint>] extends [bigint]`
- Runtime: `deriveColumnType` checks for `BigIntKeyword` or `BigInt`/`BigIntFromSelf` identifier

**Error**:
```
[INV-TYPE-COMPAT-005] Field 'balance' schema encodes to 'bigint' but column type is 'number'. Allowed column types: 'bigint'. Fix: Use column type 'bigint'.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-006: Object/Array Schema Must Use JSON Column

**Description**: Schemas encoding to `object` or `unknown[]` must use the `json` column type.

**Rationale**: Structural types require JSON serialization for SQL storage.

**Validation**:
- Compile-time: `[StripNullable<object>] extends [object]` or `[readonly unknown[]]`
- Runtime: `deriveColumnType` returns `"json"` for `TupleType`, `TypeLiteral`, `ObjectKeyword`, etc.

**Error**:
```
[INV-TYPE-COMPAT-006] Field 'metadata' schema encodes to 'object' but column type is 'string'. Allowed column types: 'json'. Fix: Use column type 'json'.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-007: Date Schema with DateTime Column

**Description**: Schemas encoding to `Date` are compatible with `datetime` column type. String-encoded dates (like `DateFromString`) also work.

**Rationale**: SQL TIMESTAMP columns can store Date objects serialized appropriately.

**Validation**:
- Compile-time: `[StripNullable<string | Date>] extends [string | Date]`
- Runtime: Identifier annotation checks for `Date`, `DateFromString`, `DateTimeUtc`, etc.

**Error**:
```
[INV-TYPE-COMPAT-007] Field 'createdAt' schema encodes to 'Date' but column type is 'string'. Allowed column types: 'datetime'. Fix: Use column type 'datetime'.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-008: S.Int Must Derive Integer Column Type

**Description**: The `S.Int` refined schema must derive to `"integer"` column type, not `"number"`.

**Rationale**: SQL INTEGER columns provide constraints and optimizations distinct from floating-point columns.

**Validation**:
- Compile-time: `DeriveColumnTypeFromSchema<typeof S.Int>` evaluates to `"integer"`
- Runtime: SchemaId annotation `Symbol.for("effect/SchemaId/Int")` detection

**Error**:
```
[INV-TYPE-COMPAT-008] Field 'rowId' uses S.Int but derived column type is 'number'. Expected: 'integer'. Fix: Verify S.Int schema or use explicit { type: "integer" }.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-009: S.UUID Must Derive UUID Column Type

**Description**: The `S.UUID` refined schema must derive to `"uuid"` column type, not `"string"`.

**Rationale**: SQL UUID columns provide validation and storage optimization over plain text.

**Validation**:
- Compile-time: `DeriveColumnTypeFromSchema<typeof S.UUID>` evaluates to `"uuid"`
- Runtime: SchemaId annotation `Symbol.for("effect/SchemaId/UUID")` detection

**Error**:
```
[INV-TYPE-COMPAT-009] Field 'id' uses S.UUID but derived column type is 'string'. Expected: 'uuid'. Fix: Verify S.UUID schema or use explicit { type: "uuid" }.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-010: Number vs Integer Precision Boundary

**Description**: When using `number` column type, precision loss may occur for values outside JavaScript's safe integer range. For large integers, use `S.Int` with `integer` column or `S.BigInt` with `bigint` column.

**Rationale**: JavaScript `number` safely represents integers only within `[-2^53+1, 2^53-1]`. Beyond this, use BigInt.

**Validation**:
- Compile-time: N/A (semantic constraint)
- Runtime: Runtime range validation via S.Int or S.between refinements

**Error**:
```
[INV-TYPE-COMPAT-010] Field 'largeId' uses S.Number with column type 'number' but may exceed safe integer range. Expected: Use S.BigInt with 'bigint' column for values > 2^53. Received: number. Fix: Change to S.BigInt and column type 'bigint'.
```

**Complexity**: High
**Severity**: Warning

---

### INV-TYPE-COMPAT-011: Integer with Auto-Increment Must Be Integer Column

**Description**: Fields with `autoIncrement: true` must use `integer` or `bigint` column type.

**Rationale**: SQL auto-increment/serial sequences only work with integral types.

**Validation**:
- Compile-time: `ColumnDef<"number", _, _, true>` should be flagged
- Runtime: Drizzle adapter validation

**Error**:
```
[INV-TYPE-COMPAT-011] Field 'id' has autoIncrement=true but column type is 'number'. Expected: 'integer' or 'bigint'. Received: 'number'. Fix: Use S.Int with column type 'integer'.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-012: Nullable Schemas Preserve Base Type

**Description**: `S.NullOr(T)` strips null and derives column type from `T`. The `null` component does not change the column type.

**Rationale**: SQL nullable columns have a base type; null is a value, not a type.

**Validation**:
- Compile-time: `StripNullable<string | null>` yields `string`
- Runtime: `deriveUnionColumnType` filters out null literals

**Error**:
```
[INV-TYPE-COMPAT-012] Field 'bio' uses S.NullOr but column type derivation failed. Expected: Base type derivation from non-null member. Received: 'json'. Fix: Check that the base schema is a supported primitive type.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-013: Undefined Cannot Be Column Type

**Description**: `S.Undefined`, `S.UndefinedOr(T)`, and `S.NullishOr(T)` are invalid as column schemas because `undefined` cannot be stored in SQL.

**Rationale**: SQL has NULL but no concept of undefined. Use `S.NullOr` instead.

**Validation**:
- Compile-time: Type-level restriction on DSLField construction
- Runtime: `deriveColumnType` throws for `UndefinedKeyword`

**Error**:
```
[INV-TYPE-COMPAT-013] Field 'value' uses S.UndefinedOr which cannot be stored in SQL. Expected: Use S.NullOr for nullable columns. Received: S.UndefinedOr(S.String). Fix: Replace with S.NullOr(S.String).
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-014: Never Type Cannot Be Column

**Description**: `S.Never` cannot be used as a column schema.

**Rationale**: Never represents an impossible value; no SQL type can store it.

**Validation**:
- Compile-time: Never extends no column-compatible type
- Runtime: `deriveColumnType` throws for `NeverKeyword`

**Error**:
```
[INV-TYPE-COMPAT-014] Field 'impossible' uses S.Never which cannot be a column type. Expected: A constructible schema type. Received: S.Never. Fix: Remove field or use a valid schema.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-015: Void Type Cannot Be Column

**Description**: `S.Void` cannot be used as a column schema.

**Rationale**: Void represents absence of a value; SQL columns must have a type.

**Validation**:
- Compile-time: Void extends no column-compatible type
- Runtime: `deriveColumnType` throws for `VoidKeyword`

**Error**:
```
[INV-TYPE-COMPAT-015] Field 'result' uses S.Void which cannot be a column type. Expected: A value-producing schema. Received: S.Void. Fix: Remove field or use a valid schema.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-016: Symbol Cannot Be Stored in SQL

**Description**: `S.SymbolFromSelf` and `S.UniqueSymbol` cannot be column schemas.

**Rationale**: JavaScript symbols are runtime-only identities with no serialization.

**Validation**:
- Compile-time: Symbol extends no column-compatible type
- Runtime: `deriveColumnType` throws for `SymbolKeyword` and `UniqueSymbol`

**Error**:
```
[INV-TYPE-COMPAT-016] Field 'symbolKey' uses S.SymbolFromSelf which cannot be stored in SQL. Expected: A serializable type. Received: S.SymbolFromSelf. Fix: Use S.String with a string identifier instead.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-017: Null-Only Union Is Invalid

**Description**: A union containing only `null` (e.g., `S.Null`) cannot be a column schema.

**Rationale**: A column must have a non-null base type; null-only is meaningless.

**Validation**:
- Compile-time: Empty after StripNullable
- Runtime: `deriveUnionColumnType` throws when non-null members array is empty

**Error**:
```
[INV-TYPE-COMPAT-017] Field 'alwaysNull' uses S.Null which cannot be a column type alone. Expected: A non-null base type. Received: S.Null. Fix: Use S.NullOr(T) with a base type T.
```

**Complexity**: Low
**Severity**: Critical

---

### INV-TYPE-COMPAT-018: Heterogeneous Union Falls Back to JSON

**Description**: Unions with multiple incompatible base types derive to `"json"` column type.

**Rationale**: When a union like `S.Union(S.String, S.Number)` has no common column type, JSON serialization is required.

**Validation**:
- Compile-time: `DeriveColumnTypeFromEncoded<string | number>` may return union of column types
- Runtime: `deriveUnionColumnType` returns `"json"` when unique types > 1

**Error**:
```
[INV-TYPE-COMPAT-018] Field 'mixed' union derives to 'json' due to heterogeneous types. Expected: Homogeneous union or explicit type override. Received: S.Union(S.String, S.Number). Fix: Use explicit { type: "json" } or restructure schema.
```

**Complexity**: Medium
**Severity**: Info

---

### INV-TYPE-COMPAT-019: String Literal Union Maps to String

**Description**: A union of string literals like `S.Literal("a", "b", "c")` derives to `"string"` column type.

**Rationale**: Homogeneous string literal unions represent enum-like string values.

**Validation**:
- Compile-time: String literal union encodes to string
- Runtime: All members are string literals -> `"string"`

**Error**:
```
[INV-TYPE-COMPAT-019] Field 'status' with string literal union expected 'string' column type. Received: '{derivedType}'. Fix: Verify all union members are string literals.
```

**Complexity**: Low
**Severity**: Info

---

### INV-TYPE-COMPAT-020: Number Literal Union Maps to Integer

**Description**: A union of number literals like `S.Literal(1, 2, 3)` derives to `"integer"` column type.

**Rationale**: Discrete numeric values are stored as integers for efficiency.

**Validation**:
- Compile-time: Number literal encodes to number, type-level may say "number"
- Runtime: All members are number literals -> `"integer"`

**Error**:
```
[INV-TYPE-COMPAT-020] Field 'priority' with number literal union expected 'integer' column type. Type-level shows 'number' but runtime derives 'integer'. Fix: Acceptable discrepancy; use explicit { type: "integer" } if needed.
```

**Complexity**: Low
**Severity**: Info

---

### INV-TYPE-COMPAT-021: Branded Types Preserve Underlying Type

**Description**: Branded schemas like `S.String.pipe(S.fromBrand(UserId))` derive column type from the underlying schema, not the brand.

**Rationale**: Brands are type-level markers; the encoded type is the underlying type.

**Validation**:
- Compile-time: Brand<"X"> & string is still string for column derivation
- Runtime: Refinement chain leads back to base type

**Error**:
```
[INV-TYPE-COMPAT-021] Field 'userId' branded type derived unexpected column type. Expected: Base type derivation (e.g., 'string' for branded string). Received: '{type}'. Fix: Check underlying schema type.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-022: Chained Refinements Preserve Base Type

**Description**: Multiple chained refinements like `S.Int.pipe(S.positive(), S.between(0, 100))` derive from the innermost base type.

**Rationale**: Refinements add constraints but don't change the encoded type.

**Validation**:
- Compile-time: Filter/refine chains unwind to base schema
- Runtime: `deriveRefinementColumnType` recursively checks `from`

**Error**:
```
[INV-TYPE-COMPAT-022] Field 'score' chained refinement derived unexpected type. Expected: Base type from innermost schema. Received: '{type}'. Fix: Verify refinement chain starts from correct base.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-023: Template Literals Map to String

**Description**: `S.TemplateLiteral(...)` schemas always derive to `"string"` column type.

**Rationale**: Template literals produce string values regardless of interpolation.

**Validation**:
- Compile-time: TemplateLiteral encodes to string
- Runtime: `TemplateLiteral` AST tag -> `"string"`

**Error**:
```
[INV-TYPE-COMPAT-023] Field 'pattern' template literal expected 'string' column type. Received: '{type}'. Fix: Template literals always map to string.
```

**Complexity**: Low
**Severity**: Info

---

### INV-TYPE-COMPAT-024: Enum Schemas Derive Based on Values

**Description**: `S.Enums(E)` derives to `"string"` if all values are strings, `"integer"` if all are numbers.

**Rationale**: TypeScript enums can be string or numeric; SQL column matches.

**Validation**:
- Compile-time: Enum type determines column type
- Runtime: `deriveEnumsColumnType` checks all enum values

**Error**:
```
[INV-TYPE-COMPAT-024] Field 'status' enum derived unexpected type. Expected: 'string' for string enum, 'integer' for numeric enum. Received: '{type}'. Fix: Verify enum value types are homogeneous.
```

**Complexity**: Low
**Severity**: Info

---

### INV-TYPE-COMPAT-025: Transformation Encodes From-Side Type

**Description**: Transformation schemas like `S.NumberFromString` derive column type from the **encoded** (from) side, not the decoded (to) side.

**Rationale**: The database stores the encoded representation.

**Validation**:
- Compile-time: Transformation encodes to I (from side)
- Runtime: `deriveTransformationColumnType` uses `transformAst.from`

**Error**:
```
[INV-TYPE-COMPAT-025] Field 'price' transformation expected column type from encoded side. Decoded type is 'number' but encoded is 'string'. Expected: 'string'. Received: '{type}'. Fix: Understand transformation direction.
```

**Complexity**: Medium
**Severity**: Warning

---

### INV-TYPE-COMPAT-026: VariantSchema Uses Select Variant

**Description**: For `M.Generated(T)`, `M.Sensitive(T)`, etc., column type is derived from the "select" variant's schema.

**Rationale**: The "select" variant represents the database row type.

**Validation**:
- Compile-time: `ExtractVariantSelectSchema<VC>` gets select variant
- Runtime: `extractASTFromInput` prioritizes "select" variant

**Error**:
```
[INV-TYPE-COMPAT-026] Field 'id' variant schema missing 'select' variant for column derivation. Expected: VariantSchema with 'select' property. Received: {variants}. Fix: Use standard M.Generated/M.Sensitive constructors.
```

**Complexity**: Medium
**Severity**: Critical

---

### INV-TYPE-COMPAT-027: Type-Level vs Runtime Derivation Discrepancy

**Description**: Type-level derivation may differ from runtime for wrapped types. For example, `S.NullOr(S.Int)` shows type-level `"number"` but runtime `"integer"`.

**Rationale**: Type-level `DeriveColumnTypeFromSchema` uses class identity but struggles with wrapped unions. Runtime AST inspection is more precise.

**Validation**:
- Compile-time: Type may show broader type
- Runtime: AST-based derivation is authoritative

**Error**:
```
[INV-TYPE-COMPAT-027] Field 'count' type-level column type differs from runtime. Type-level: 'number'. Runtime: 'integer'. This is expected for S.NullOr(S.Int). Fix: Acceptable; runtime is correct.
```

**Complexity**: High
**Severity**: Info

---

### INV-TYPE-COMPAT-028: Explicit Type Override Bypasses Derivation

**Description**: When `{ column: { type: "X" } }` is provided, derivation is bypassed and `"X"` is used directly.

**Rationale**: Allows overriding derived type when needed (e.g., custom UUID format as `"string"`).

**Validation**:
- Compile-time: `ValidateSchemaColumn` still checks compatibility
- Runtime: Explicit type used directly

**Error**:
```
[INV-TYPE-COMPAT-028] Field 'specialId' explicit type override '{explicit}' is incompatible with schema encoded type '{encoded}'. Fix: Ensure explicit type is compatible or change schema.
```

**Complexity**: Low
**Severity**: Warning

---

### INV-TYPE-COMPAT-029: Circular Reference Fallback to JSON

**Description**: Recursive/circular schema references that trigger the visited WeakSet fallback derive to `"json"`.

**Rationale**: Circular structures require JSON serialization.

**Validation**:
- Compile-time: N/A (detected at runtime)
- Runtime: `visited.has(ast)` returns true -> `"json"`

**Error**:
```
[INV-TYPE-COMPAT-029] Field 'tree' schema has circular reference, deriving to 'json'. Expected: JSON column for recursive structures. Fix: Acceptable; use json column type.
```

**Complexity**: High
**Severity**: Info

---

### INV-TYPE-COMPAT-030: Declaration AST Fallback

**Description**: `Declaration` AST nodes (custom types) without known identifiers fall back to `"json"`.

**Rationale**: Custom declarations without specific handlers are serialized as JSON.

**Validation**:
- Compile-time: Unknown declaration -> ColumnType.Type union
- Runtime: `deriveDeclarationColumnType` returns `"json"` for unknown identifiers

**Error**:
```
[INV-TYPE-COMPAT-030] Field 'custom' uses custom declaration without known column type. Derived: 'json'. Fix: Use explicit { type: "..." } if different type needed.
```

**Complexity**: Medium
**Severity**: Info

---

## Type-Level Derivation Reference

### `DeriveColumnTypeFromSchema<Schema>`

Uses schema class identity for precise derivation:

```typescript
// Direct class matches
Schema extends typeof S.Int       -> "integer"
Schema extends typeof S.UUID      -> "uuid"
Schema extends typeof S.ULID      -> "uuid"
Schema extends typeof S.Date      -> "datetime"
Schema extends typeof S.DateFromString -> "datetime"
Schema extends typeof S.DateTimeUtc    -> "datetime"
Schema extends typeof S.BigInt    -> "bigint"
Schema extends typeof S.BigIntFromSelf -> "bigint"
Schema extends typeof S.Any       -> "json"
Schema extends typeof S.Unknown   -> "json"
Schema extends typeof S.Object    -> "json"

// Number refinements (remain number)
Schema extends typeof S.Positive  -> "number"
Schema extends typeof S.Negative  -> "number"
Schema extends typeof S.NonPositive -> "number"
Schema extends typeof S.NonNegative -> "number"

// Recursive unwrapping
Schema extends S.filter<Inner>    -> DeriveColumnTypeFromSchemaInner<Inner>
Schema extends S.refine<_, From>  -> DeriveColumnTypeFromSchemaInner<From>
Schema extends S.transform<From, _> -> DeriveColumnTypeFromSchemaInner<From>

// Fallback to encoded type
Schema extends S.Schema<_, I, _>  -> DeriveColumnTypeFromEncoded<I>
```

### `DeriveColumnTypeFromEncoded<I>`

Uses encoded TypeScript type for fallback derivation:

```typescript
IsAny<I>           -> "json"
IsUnknown<I>       -> "json"
StripNullable<I> is never -> ColumnType.Type (full union)
StripNullable<I> extends Date     -> "datetime"
StripNullable<I> extends readonly unknown[] -> "json"
StripNullable<I> extends object   -> "json"
StripNullable<I> extends string   -> "string"
StripNullable<I> extends number   -> "number"
StripNullable<I> extends boolean  -> "boolean"
StripNullable<I> extends bigint   -> "bigint"
else -> ColumnType.Type (full union fallback)
```

---

## Runtime Derivation Reference

### `deriveColumnType(ast: AST.AST)`

Pattern matches on `ast._tag`:

| AST Tag | Column Type | Notes |
|---------|------------|-------|
| `StringKeyword` | `"string"` | |
| `NumberKeyword` | `"number"` | |
| `BooleanKeyword` | `"boolean"` | |
| `BigIntKeyword` | `"bigint"` | |
| `TupleType` | `"json"` | |
| `TypeLiteral` | `"json"` | |
| `ObjectKeyword` | `"json"` | |
| `UnknownKeyword` | `"json"` | |
| `AnyKeyword` | `"json"` | |
| `TemplateLiteral` | `"string"` | |
| `Literal` | derived | string->"string", number->"integer", boolean->"boolean" |
| `Enums` | derived | all strings->"string", else->"integer" |
| `Union` | derived | see union rules |
| `Refinement` | derived | checks SchemaId for UUID/Int |
| `Transformation` | derived | checks Identifier for Date/BigInt |
| `Suspend` | derived | resolves lazy reference |
| `Declaration` | derived | checks Identifier for known types |
| `NeverKeyword` | THROWS | |
| `VoidKeyword` | THROWS | |
| `UndefinedKeyword` | THROWS | |
| `SymbolKeyword` | THROWS | |
| `UniqueSymbol` | THROWS | |

---

## Compatibility Matrix

| Schema Type | string | uuid | datetime | number | integer | boolean | bigint | json |
|-------------|--------|------|----------|--------|---------|---------|--------|------|
| S.String | YES | YES | YES | - | - | - | - | - |
| S.UUID | YES | YES | - | - | - | - | - | - |
| S.Number | - | - | - | YES | YES | - | - | - |
| S.Int | - | - | - | YES | YES | - | - | - |
| S.Boolean | - | - | - | - | - | YES | - | - |
| S.BigIntFromSelf | - | - | - | - | - | - | YES | - |
| S.Date | - | - | YES | - | - | - | - | - |
| S.Struct | - | - | - | - | - | - | - | YES |
| S.Array | - | - | - | - | - | - | - | YES |
| S.Unknown | - | - | - | - | - | - | - | YES |

---

## Test Coverage Verification

From `field-model-comprehensive.test.ts`:

- Primitive keywords (S.String, S.Number, S.Boolean, S.BigIntFromSelf)
- Refinements (S.Int, S.UUID, chained refinements)
- Transformations (S.Date, S.DateFromString, S.BigInt, S.NumberFromString)
- Structural types (S.Struct, S.Array, S.Tuple, S.Record)
- Union patterns (S.NullOr, S.UndefinedOr throws, S.NullishOr throws)
- Literal unions (string literals, number literals)
- Heterogeneous unions
- VariantSchema fields (M.Generated, M.Sensitive, M.GeneratedByApp, M.FieldOption)
- Branded types
- Template literals
- Fallback types (S.Unknown, S.Any, S.Object)
- Explicit type override
- Error cases (S.Never, S.Void, S.Undefined, S.Null throws)
- Complete model integration
- Enum types

---

## Implementation Notes

1. **Type-level derivation** uses `DeriveColumnTypeFromSchema` for precision but falls back to `DeriveColumnTypeFromEncoded` for unknown schemas.

2. **Runtime derivation** via `deriveColumnType(ast)` is authoritative and uses AST inspection with SchemaId/Identifier annotations.

3. **Explicit type override** bypasses derivation but still validates compatibility via `ValidateSchemaColumn`.

4. **Nullable handling** strips null/undefined before type checking to get the base type.

5. **VariantSchema fields** use the "select" variant for derivation as it represents the database storage type.
