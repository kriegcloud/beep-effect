# SQL Standard Invariants Research Report

## Overview

This document catalogs SQL standard invariants relevant to the beep-effect DSL that generates PostgreSQL schemas. Each invariant is categorized by subcategory, includes rationale from PostgreSQL documentation or SQL standards, and provides both compile-time and runtime validation strategies using Effect patterns.

---

## INV-SQL-PK-001: Primary Key Non-Nullability

**Description**: Primary key columns MUST NOT allow NULL values.

**Rationale**: Per SQL-92 standard Section 11.7 and PostgreSQL documentation, primary key constraints implicitly include `NOT NULL`. A primary key must uniquely identify each row, and NULL represents an unknown value that cannot be compared for equality.

**Current DSL Behavior** (from `adapters/drizzle.ts`):
```typescript
type ApplyNotNull<T extends ColumnBuilderBase, Col extends ColumnDef, EncodedType> =
  Col extends { primaryKey: true }
    ? NotNull<T>  // Primary keys always get NotNull
    : ...
```

**Validation**:
- Compile-time: The `ApplyNotNull` type already enforces this. When `primaryKey: true`, the column is wrapped with `NotNull<T>` regardless of the schema's encoded type.
- Runtime: Validation in `columnBuilder` applies `.notNull()` for primary keys:
  ```typescript
  if (def.primaryKey) column = column.primaryKey();
  // Then later: if (!fieldIsNullable && !def.autoIncrement) column = column.notNull();
  ```
  However, the current runtime does NOT explicitly force `.notNull()` for primary keys. This should be added.

**Error**:
```
[INV-SQL-PK-001] Column '{name}' is marked as primaryKey but uses a nullable schema. Expected: non-nullable schema (e.g., S.String, S.Int). Received: nullable schema (e.g., S.NullOr(S.String)). Fix: Remove nullable wrapper or use a different column for the primary key.
```

**Complexity**: Low
**Severity**: Critical

---

## INV-SQL-PK-002: Primary Key Cardinality

**Description**: A table MUST have at most one primary key constraint, though it may be composite (spanning multiple columns).

**Rationale**: PostgreSQL documentation states: "A table can have at most one primary key." The DSL currently allows multiple fields to have `primaryKey: true`, which could represent a composite key but this is not explicit.

**Current DSL Behavior** (from `Model.ts`):
```typescript
const derivePrimaryKey = <Columns extends Record<string, ColumnDef>>(columns: Columns): readonly string[] =>
  F.pipe(
    columns,
    Struct.entries,
    A.filter(([_, def]) => def.primaryKey === true),
    A.map(([key]) => key)
  );
```

**Validation**:
- Compile-time: Type-level check could enforce that if `primaryKey: true` appears on multiple fields, they form a valid composite key.
- Runtime: Validate at model creation that either:
  1. Zero or one field has `primaryKey: true` (single-column PK), or
  2. Multiple fields are explicitly grouped as a composite key

**Error**:
```
[INV-SQL-PK-002] Model '{identifier}' has {count} columns marked as primaryKey: [{columnNames}]. Expected: Either one column with primaryKey: true, or an explicit composite primary key definition. Fix: Use a single primaryKey field or define a composite key via the 'primaryKey' model option.
```

**Complexity**: Medium
**Severity**: Warning (current behavior works but intent is ambiguous)

---

## INV-SQL-PK-003: Primary Key Type Restrictions

**Description**: Primary key columns SHOULD use stable, immutable types suitable for identification.

**Rationale**: While PostgreSQL allows any data type as a primary key, best practices recommend using types that:
- Are immutable (values don't change over time)
- Support efficient equality comparison
- Are not excessively large (affects index performance)

Recommended types: `integer`, `uuid`, `string` (with length limits), `bigint`
Discouraged types: `json`, `datetime` (mutable semantics), `boolean` (low cardinality)

**Validation**:
- Compile-time: Create a type-level constraint:
  ```typescript
  type ValidPrimaryKeyType = "integer" | "uuid" | "string" | "bigint";

  type AssertValidPKType<C extends ColumnDef> = C extends { primaryKey: true }
    ? C["type"] extends ValidPrimaryKeyType
      ? C
      : { _error: `Column type '${C["type"]}' is not recommended for primary keys` }
    : C;
  ```
- Runtime: Emit warning (not error) when unusual types are used as primary keys

**Error**:
```
[INV-SQL-PK-003] Column '{name}' uses type '{type}' as primary key. Expected: one of [integer, uuid, string, bigint]. Received: {type}. Fix: Consider using an integer serial, UUID, or string-based identifier instead.
```

**Complexity**: Low
**Severity**: Warning

---

## INV-SQL-UNIQUE-001: Nullable Unique Columns Allow Multiple NULLs

**Description**: Unique constraints on nullable columns allow multiple NULL values (NULLs are not considered equal).

**Rationale**: Per SQL standard and PostgreSQL implementation, NULL is not equal to NULL. Therefore, a UNIQUE constraint on a nullable column allows multiple rows with NULL in that column. This is intentional but often surprising.

**Current DSL Behavior**: The DSL derives nullability from the Effect Schema AST via `isNullable()`. When a unique column's schema is nullable, multiple NULL values are permitted.

**Validation**:
- Compile-time: No automatic enforcement needed. This is valid behavior.
- Runtime: Consider emitting an informational diagnostic when `unique: true` is combined with a nullable schema to alert developers.

**Error** (informational):
```
[INV-SQL-UNIQUE-001] Column '{name}' is unique but nullable. Info: Multiple NULL values will be allowed. This may not be the intended behavior. Fix: If only one NULL should be allowed, make the column NOT NULL or use a partial unique index.
```

**Complexity**: Low
**Severity**: Info

---

## INV-SQL-UNIQUE-002: Multiple Unique Constraints Per Table

**Description**: A table MAY have multiple unique constraints across different columns or column sets.

**Rationale**: Unlike primary keys (limited to one), PostgreSQL allows any number of unique constraints. Each enforces uniqueness independently.

**Current DSL Behavior**: The `unique: true` flag can be set on any number of fields independently. This is correct behavior.

**Validation**:
- Compile-time: No restriction needed.
- Runtime: No restriction needed.

**Complexity**: Low
**Severity**: N/A (valid behavior, no invariant violation possible)

---

## INV-SQL-AI-001: Auto-Increment Type Restriction

**Description**: Auto-increment/SERIAL columns MUST be of type `integer` or `bigint`.

**Rationale**: PostgreSQL `SERIAL` is a shorthand for creating an integer column with a sequence default. Only `smallserial`, `serial` (integer), and `bigserial` (bigint) are supported. Attempting to auto-increment other types (string, uuid, boolean, etc.) is invalid.

**Current DSL Behavior** (from `adapters/drizzle.ts`):
```typescript
integer: thunk(def.autoIncrement ? pg.serial(name) : pg.integer(name)),
```

The current implementation only creates `pg.serial()` for `type: "integer"`. However, there's no compile-time or runtime check preventing `autoIncrement: true` with incompatible types.

**Validation**:
- Compile-time: Add type constraint:
  ```typescript
  type ValidAutoIncrementType<C extends ColumnDef> = C extends { autoIncrement: true }
    ? C["type"] extends "integer" | "bigint"
      ? C
      : SchemaColumnError<never, C["type"]>
    : C;
  ```
- Runtime: Throw error in `Field()` or `columnBuilder()`:
  ```typescript
  if (def.autoIncrement && def.type !== "integer" && def.type !== "bigint") {
    throw new Error(`[INV-SQL-AI-001] ...`);
  }
  ```

**Error**:
```
[INV-SQL-AI-001] Column '{name}' has autoIncrement: true but type '{type}'. Expected: 'integer' or 'bigint'. Received: '{type}'. Fix: Change column type to 'integer' or 'bigint', or remove autoIncrement.
```

**Complexity**: Low
**Severity**: Critical

---

## INV-SQL-AI-002: Auto-Increment Implies Non-Nullable

**Description**: Auto-increment columns are implicitly NOT NULL.

**Rationale**: PostgreSQL SERIAL columns are defined as `NOT NULL` by default because the sequence always generates a value. An INSERT without specifying the column uses the next sequence value.

**Current DSL Behavior** (from `adapters/drizzle.ts`):
```typescript
type ApplyNotNull<T extends ColumnBuilderBase, Col extends ColumnDef, EncodedType> =
  ...
  : Col extends { autoIncrement: true }
    ? T // Serial columns handle their own nullability
    : ...
```

The runtime behavior passes through to `pg.serial()` which handles nullability internally.

**Validation**:
- Compile-time: No additional check needed; Drizzle handles this.
- Runtime: If using a nullable schema with `autoIncrement: true`, emit a warning.

**Error**:
```
[INV-SQL-AI-002] Column '{name}' has autoIncrement: true with a nullable schema. Info: Auto-increment columns are implicitly NOT NULL. The nullable schema will be ignored for SQL generation. Fix: Use a non-nullable schema (e.g., S.Int instead of S.NullOr(S.Int)).
```

**Complexity**: Low
**Severity**: Warning

---

## INV-SQL-AI-003: Auto-Increment with Primary Key

**Description**: Auto-increment columns are commonly (but not required to be) primary keys.

**Rationale**: The typical pattern is `id SERIAL PRIMARY KEY`. However, PostgreSQL allows SERIAL columns that are not primary keys (e.g., for audit sequences, versioning).

**Current DSL Behavior**: No coupling between `autoIncrement` and `primaryKey`. Both can be set independently.

**Validation**:
- No enforcement needed. Both configurations are valid.

**Complexity**: N/A
**Severity**: N/A

---

## INV-SQL-DEFAULT-001: Default Value Type Compatibility

**Description**: Default values MUST be type-compatible with the column type.

**Rationale**: PostgreSQL validates that the default expression's result type matches (or is coercible to) the column type. Mismatches cause errors like "column X is of type Y but default expression is of type Z".

**Current DSL Behavior** (from `types.ts`):
```typescript
readonly defaultValue?: undefined | string | (() => string);
```

The DSL represents defaults as raw SQL strings. Type validation is deferred to PostgreSQL.

**Validation**:
- Compile-time: Difficult without a full SQL expression parser. Consider known patterns:
  ```typescript
  type ValidDefaultForType<T extends ColumnType.Type, D extends string> =
    T extends "boolean"
      ? D extends "true" | "false" ? D : never
      : T extends "uuid"
        ? D extends "gen_random_uuid()" | `'${string}'` ? D : never
        : D; // Allow any string for other types
  ```
- Runtime: Pattern-match common defaults at model creation:
  - `uuid` type should have defaults like `gen_random_uuid()` or UUID literals
  - `datetime` type should have defaults like `now()` or `CURRENT_TIMESTAMP`
  - `boolean` type should have defaults like `true`, `false`

**Error**:
```
[INV-SQL-DEFAULT-001] Column '{name}' has type '{type}' with default value '{default}'. Expected: SQL expression returning {type}. Received: '{default}'. Fix: Ensure default expression returns a value compatible with column type.
```

**Complexity**: Medium
**Severity**: Warning (PostgreSQL will catch at migration time)

---

## INV-SQL-DEFAULT-002: Default Value SQL Expression Validity

**Description**: Default value expressions MUST be valid SQL syntax.

**Rationale**: Invalid SQL expressions will cause migration failures.

**Current DSL Behavior**: Raw strings are passed through without validation.

**Validation**:
- Compile-time: Not feasible without SQL parser.
- Runtime: Pattern-match known safe patterns:
  - Function calls: `gen_random_uuid()`, `now()`, `current_timestamp`
  - Literals: `'string'`, `123`, `true`, `false`
  - SQL keywords: `NULL`

**Error**:
```
[INV-SQL-DEFAULT-002] Column '{name}' has potentially invalid default SQL expression: '{default}'. Expected: valid SQL expression. Fix: Verify the expression is valid PostgreSQL syntax.
```

**Complexity**: High (requires SQL parsing for complete validation)
**Severity**: Warning

---

## INV-SQL-COLTYPE-001: Column Type Precision and Scale

**Description**: Numeric types with precision/scale (e.g., `DECIMAL(10,2)`) MUST have valid precision and scale values.

**Rationale**: PostgreSQL has limits:
- `NUMERIC(precision, scale)`: precision 1-1000, scale 0 to precision
- Invalid values cause: "NUMERIC precision must be between 1 and 1000"

**Current DSL Behavior**: The DSL uses abstract column types (`"number"`, `"integer"`, `"bigint"`) without precision/scale options. This is a simplification that avoids these edge cases.

**Validation**:
- Not applicable to current DSL design.
- If precision/scale support is added, validate: `0 < scale <= precision <= 1000`

**Complexity**: N/A (not currently supported)
**Severity**: N/A

---

## INV-SQL-COLTYPE-002: String Length Limits

**Description**: Fixed-length strings (`CHAR(n)`) and variable-length strings (`VARCHAR(n)`) MUST have valid length limits.

**Rationale**: PostgreSQL limits:
- `VARCHAR(n)`: n must be positive integer, max 10485760 (10 MB)
- `CHAR(n)`: n must be positive integer

**Current DSL Behavior**: The DSL uses `pg.text(name)` for string columns, which has no length limit. PostgreSQL `TEXT` type has no practical length limit (same as `VARCHAR` without limit).

**Validation**:
- Not applicable to current DSL design (uses unlimited TEXT).
- If length limits are added, validate: `0 < n <= 10485760`

**Complexity**: N/A (not currently supported)
**Severity**: N/A

---

## INV-SQL-ID-001: Identifier Length Limit

**Description**: SQL identifiers (table names, column names) MUST NOT exceed 63 bytes (63 ASCII characters).

**Rationale**: PostgreSQL silently truncates identifiers longer than 63 bytes (NAMEDATALEN-1). This can cause:
- Silent name collisions when truncated names match
- Confusion between intended and actual names

**Current DSL Behavior** (from `Model.ts`):
```typescript
const toSnakeCase = (str: string): string =>
  F.pipe(str, Str.replace(/([A-Z])/g, "_$1"), Str.toLowerCase, Str.replace(/^_/, ""));

const tableName = toSnakeCase(identifier);
```

Table names are derived from model identifiers via snake_case conversion. Field names from DSL keys become column names.

**Validation**:
- Compile-time: Template literal type constraints on identifier parameter:
  ```typescript
  type ValidIdentifier<S extends string> =
    S extends `${infer _}${'_'.repeat(64)}${infer _}`
      ? { _error: "Identifier exceeds 63 character limit" }
      : S;
  ```
  (Approximation - true length validation requires runtime)
- Runtime: Check in `Model()` and `Field()`:
  ```typescript
  if (identifier.length > 63) {
    throw new Error(`[INV-SQL-ID-001] ...`);
  }
  ```

**Error**:
```
[INV-SQL-ID-001] Identifier '{name}' has length {length}. Expected: <= 63 characters. Received: {length} characters. Fix: Shorten the identifier name.
```

**Complexity**: Low
**Severity**: Critical

---

## INV-SQL-ID-002: Identifier Character Restrictions

**Description**: SQL identifiers SHOULD start with a letter or underscore and contain only letters, digits, underscores, and dollar signs.

**Rationale**: PostgreSQL requires quoted identifiers for:
- Starting with a digit
- Containing special characters (except `$`)
- Matching reserved keywords

Unquoted identifiers matching these patterns cause syntax errors.

**Current DSL Behavior**: The `toSnakeCase()` function produces lowercase identifiers with underscores. Field names from JavaScript/TypeScript object keys are typically valid identifiers.

**Validation**:
- Compile-time: Template literal pattern matching:
  ```typescript
  type ValidIdentifierChars<S extends string> =
    S extends `${infer First}${infer Rest}`
      ? First extends 'a'|'b'|...|'z'|'A'|...|'Z'|'_'
        ? Rest extends '' | `${IdentifierTail}` ? S : never
        : never
      : never;
  ```
- Runtime: Regex validation:
  ```typescript
  const VALID_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;
  if (!VALID_IDENTIFIER.test(name)) {
    throw new Error(`[INV-SQL-ID-002] ...`);
  }
  ```

**Error**:
```
[INV-SQL-ID-002] Identifier '{name}' contains invalid characters or starts with a digit. Expected: start with letter or underscore, contain only [a-zA-Z0-9_$]. Received: '{name}'. Fix: Rename to use valid identifier characters.
```

**Complexity**: Low
**Severity**: Critical

---

## INV-SQL-ID-003: Reserved Word Avoidance

**Description**: SQL identifiers SHOULD NOT match PostgreSQL reserved words without quoting.

**Rationale**: Using reserved words as unquoted identifiers causes syntax errors. Examples: `user`, `order`, `group`, `table`, `select`.

**Current DSL Behavior**: No reserved word checking. Drizzle may handle quoting automatically.

**Validation**:
- Compile-time: Difficult (would require embedding full reserved word list in types).
- Runtime: Check against PostgreSQL reserved word list:
  ```typescript
  const RESERVED_WORDS = new Set(['user', 'order', 'group', 'table', 'select', ...]);
  if (RESERVED_WORDS.has(name.toLowerCase())) {
    // Emit warning or auto-quote
  }
  ```

**Error**:
```
[INV-SQL-ID-003] Identifier '{name}' is a PostgreSQL reserved word. Expected: non-reserved identifier or explicit quoting. Received: '{name}'. Fix: Rename the identifier or the DSL will auto-quote it.
```

**Complexity**: Medium (requires maintaining reserved word list)
**Severity**: Warning

---

## INV-SQL-NULL-001: NOT NULL with Default Allows Omission

**Description**: A NOT NULL column with a default value allows INSERT statements to omit the column.

**Rationale**: PostgreSQL uses the default value when a column is not specified in INSERT. This is valid and common (e.g., `created_at TIMESTAMP NOT NULL DEFAULT now()`).

**Current DSL Behavior**: The `HasDefault` type modifier is applied when `defaultValue` or `autoIncrement` is set, making the column optional in Drizzle insert types.

**Validation**:
- No enforcement needed. This is correct behavior.

**Complexity**: N/A
**Severity**: N/A

---

## INV-SQL-NULL-002: NOT NULL without Default Requires Value

**Description**: A NOT NULL column without a default value MUST be provided in INSERT statements.

**Rationale**: PostgreSQL will reject INSERTs that omit NOT NULL columns without defaults: "null value in column X violates not-null constraint".

**Current DSL Behavior**: When a column is NOT NULL (non-nullable schema) and has no default, Drizzle marks it as required in insert types.

**Validation**:
- Compile-time: Drizzle's type system handles this via `HasDefault` modifier.
- Runtime: PostgreSQL enforces at INSERT time.

**Complexity**: N/A (handled by Drizzle and PostgreSQL)
**Severity**: N/A

---

## INV-SQL-NULL-003: Primary Key Implies NOT NULL

**Description**: Primary key columns are implicitly NOT NULL.

**Rationale**: This duplicates INV-SQL-PK-001 but emphasizes the NOT NULL aspect. PostgreSQL's primary key constraint includes NOT NULL.

**Current DSL Behavior**: Type-level `ApplyNotNull` wraps primary key columns with `NotNull<T>`.

**Validation**:
- See INV-SQL-PK-001.

**Complexity**: Low
**Severity**: Critical

---

## INV-SQL-SCHEMA-001: Schema Encoded Type Must Match Column Type

**Description**: The Effect Schema's encoded type MUST be compatible with the declared column type.

**Rationale**: The DSL uses Effect Schemas to define the TypeScript types that map to/from database columns. A mismatch (e.g., schema encoding to `number` but column type `"string"`) would cause runtime errors or data corruption.

**Current DSL Behavior** (from `types.ts`):
```typescript
export type ValidateSchemaColumn<SchemaEncoded, ColType extends ColumnType.Type, ResultType> =
  IsSchemaColumnCompatible<SchemaEncoded, ColType> extends true
    ? ResultType
    : SchemaColumnError<SchemaEncoded, ColType>;
```

The DSL validates at the type level when an explicit column type is provided.

**Validation**:
- Compile-time: `ValidateSchemaColumn` returns an error type if incompatible.
- Runtime: `deriveColumnType()` infers the correct type from schema AST. Explicit type overrides should be validated:
  ```typescript
  if (explicitType && !isCompatible(schemaEncodedType, explicitType)) {
    throw new Error(`[INV-SQL-SCHEMA-001] ...`);
  }
  ```

**Error**:
```
[INV-SQL-SCHEMA-001] Schema encoded type '{schemaType}' is incompatible with column type '{columnType}'. Expected: column type compatible with {schemaType}. Received: '{columnType}'. Fix: Either change column type to {allowedTypes} or use a different schema.
```

**Complexity**: Medium
**Severity**: Critical

---

## Summary Table

| Invariant ID | Category | Severity | Complexity | Status |
|-------------|----------|----------|------------|--------|
| INV-SQL-PK-001 | Primary Key | Critical | Low | Partially implemented |
| INV-SQL-PK-002 | Primary Key | Warning | Medium | Not implemented |
| INV-SQL-PK-003 | Primary Key | Warning | Low | Not implemented |
| INV-SQL-UNIQUE-001 | Unique | Info | Low | Not implemented |
| INV-SQL-UNIQUE-002 | Unique | N/A | Low | N/A (valid) |
| INV-SQL-AI-001 | Auto-Increment | Critical | Low | Not implemented |
| INV-SQL-AI-002 | Auto-Increment | Warning | Low | Partially implemented |
| INV-SQL-AI-003 | Auto-Increment | N/A | N/A | N/A (valid) |
| INV-SQL-DEFAULT-001 | Defaults | Warning | Medium | Not implemented |
| INV-SQL-DEFAULT-002 | Defaults | Warning | High | Not implemented |
| INV-SQL-COLTYPE-001 | Column Types | N/A | N/A | N/A (not supported) |
| INV-SQL-COLTYPE-002 | Column Types | N/A | N/A | N/A (not supported) |
| INV-SQL-ID-001 | Identifiers | Critical | Low | Not implemented |
| INV-SQL-ID-002 | Identifiers | Critical | Low | Not implemented |
| INV-SQL-ID-003 | Identifiers | Warning | Medium | Not implemented |
| INV-SQL-NULL-001 | Nullability | N/A | N/A | Implemented |
| INV-SQL-NULL-002 | Nullability | N/A | N/A | Implemented |
| INV-SQL-NULL-003 | Nullability | Critical | Low | Partially implemented |
| INV-SQL-SCHEMA-001 | Schema/Column | Critical | Medium | Partially implemented |

---

## Priority Implementation Recommendations

### Phase 1: Critical Invariants (Must Have)

1. **INV-SQL-AI-001**: Add compile-time and runtime check for autoIncrement type restriction.
2. **INV-SQL-ID-001**: Add identifier length validation.
3. **INV-SQL-ID-002**: Add identifier character validation.
4. **INV-SQL-PK-001**: Strengthen runtime enforcement of primary key non-nullability.
5. **INV-SQL-SCHEMA-001**: Add runtime validation for explicit type overrides.

### Phase 2: Warning Invariants (Should Have)

6. **INV-SQL-PK-002**: Add composite primary key disambiguation.
7. **INV-SQL-PK-003**: Add primary key type recommendations.
8. **INV-SQL-AI-002**: Add warning for nullable schemas with autoIncrement.
9. **INV-SQL-ID-003**: Add reserved word detection with auto-quoting.
10. **INV-SQL-DEFAULT-001**: Add basic default value type pattern matching.

### Phase 3: Informational (Nice to Have)

11. **INV-SQL-UNIQUE-001**: Add diagnostic for nullable unique columns.
12. **INV-SQL-DEFAULT-002**: Add SQL expression syntax validation (complex).

---

## Effect Pattern Examples for Validation

### Runtime Validation with Tagged Errors

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Tagged error for invariant violations
class DSLInvariantError extends S.TaggedError<DSLInvariantError>()("DSLInvariantError", {
  code: S.String,
  entity: S.String,
  name: S.String,
  expected: S.String,
  received: S.String,
  fix: S.String,
}) {
  get message(): string {
    return `[${this.code}] ${this.entity} '${this.name}' violation. Expected: ${this.expected}. Received: ${this.received}. Fix: ${this.fix}.`;
  }
}

// Validate auto-increment type
const validateAutoIncrementType = (
  columnName: string,
  def: ColumnDef
): Effect.Effect<void, DSLInvariantError> =>
  F.pipe(
    Match.value(def),
    Match.when(
      (d) => d.autoIncrement === true && d.type !== "integer" && d.type !== "bigint",
      (d) =>
        Effect.fail(
          new DSLInvariantError({
            code: "INV-SQL-AI-001",
            entity: "Column",
            name: columnName,
            expected: "'integer' or 'bigint'",
            received: `'${d.type}'`,
            fix: "Change column type to 'integer' or 'bigint', or remove autoIncrement",
          })
        )
    ),
    Match.orElse(() => Effect.void)
  );

// Validate identifier length
const validateIdentifierLength = (
  entityType: string,
  name: string
): Effect.Effect<void, DSLInvariantError> =>
  P.isString(name) && name.length > 63
    ? Effect.fail(
        new DSLInvariantError({
          code: "INV-SQL-ID-001",
          entity: entityType,
          name,
          expected: "<= 63 characters",
          received: `${name.length} characters`,
          fix: "Shorten the identifier name",
        })
      )
    : Effect.void;

// Compose validations for a column
const validateColumn = (
  columnName: string,
  def: ColumnDef
): Effect.Effect<void, DSLInvariantError> =>
  Effect.all([
    validateIdentifierLength("Column", columnName),
    validateAutoIncrementType(columnName, def),
  ], { concurrency: "unbounded" }).pipe(Effect.asVoid);
```

### Type-Level Validation

```typescript
// Compile-time auto-increment type check
type ValidAutoIncrementConfig<C extends Partial<ColumnDef>> = C extends { autoIncrement: true }
  ? C extends { type: "integer" | "bigint" }
    ? C
    : C extends { type: infer T }
      ? {
          readonly _tag: "InvalidAutoIncrementType";
          readonly message: `autoIncrement requires type 'integer' or 'bigint', got '${T & string}'`;
        }
      : C // No explicit type, runtime will derive
  : C;

// Identifier length check (approximate - full validation requires runtime)
type ValidIdentifierLength<S extends string, Counter extends unknown[] = []> =
  S extends `${infer _}${infer Rest}`
    ? Counter["length"] extends 63
      ? { _error: `Identifier exceeds 63 character limit: '${S}'` }
      : ValidIdentifierLength<Rest, [...Counter, unknown]>
    : S;
```

---

## References

1. PostgreSQL Documentation - Data Definition: https://www.postgresql.org/docs/current/ddl.html
2. PostgreSQL Documentation - Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
3. PostgreSQL Documentation - Data Types: https://www.postgresql.org/docs/current/datatype.html
4. PostgreSQL Documentation - Identifiers and Key Words: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
5. SQL-92 Standard (ISO/IEC 9075:1992)
6. Drizzle ORM Documentation: https://orm.drizzle.team/docs/overview
7. Effect Schema Documentation: https://effect.website/docs/schema/introduction
