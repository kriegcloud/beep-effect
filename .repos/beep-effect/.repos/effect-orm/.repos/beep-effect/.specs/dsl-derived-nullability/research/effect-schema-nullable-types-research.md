# Effect Schema Nullable Types - Complete Research

## Executive Summary

This document catalogs all Effect Schema types whose **encoded** representation can be `null`, `undefined`, or optional. These are the schema types that should map to nullable database columns when using AST-based introspection for schema-to-SQL generation.

## Research Sources

- **Effect Documentation MCP**: Schema optional fields, PropertySignature patterns
- **Source Code Analysis**: `effect/Schema.ts`, `effect/SchemaAST.ts`
- **Ecosystem Libraries**: Core Effect Schema module

---

## Schema Types with Nullish Encoded Representation

### 1. `S.Null` - Literal Null Type

**What it is**: A schema that only accepts `null` values.

**Encoded type**: `null`

**Type signature**:
```typescript
const Null: Schema<null, null, never>
```

**AST node type**: `Literal` with `literal: null`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.Null
// Encoded: null
// Type: null
```

**Database mapping**: Column should be nullable OR have a `null` default value.

---

### 2. `S.Undefined` - Literal Undefined Type

**What it is**: A schema that only accepts `undefined` values.

**Encoded type**: `undefined`

**Type signature**:
```typescript
const Undefined: Schema<undefined, undefined, never>
```

**AST node type**: `UndefinedKeyword`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.Undefined
// Encoded: undefined
// Type: undefined
```

**Database mapping**: This typically appears in unions or optional fields. Alone, it's unusual for DB columns.

---

### 3. `S.Void` - Void Type

**What it is**: A schema that only accepts `undefined` values (TypeScript `void` type).

**Encoded type**: `undefined`

**Type signature**:
```typescript
const Void: Schema<void, undefined, never>
```

**AST node type**: `VoidKeyword`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.Void
// Encoded: undefined
// Type: void
```

**Database mapping**: Similar to `Undefined`, rarely used for DB columns directly.

---

### 4. `S.NullOr<S>` - Union with Null

**What it is**: Creates a union of a schema with `null`.

**Encoded type**: `Schema.Encoded<S> | null`

**Type signature**:
```typescript
const NullOr: <S extends Schema.All>(self: S) => NullOr<S>

// Expands to:
Union<[S, typeof Null]>
```

**AST node type**: `Union` containing the inner schema and a `Literal` with `literal: null`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.NullOr(S.String)
// Encoded: string | null
// Type: string | null
```

**Database mapping**: Column should be nullable.

---

### 5. `S.UndefinedOr<S>` - Union with Undefined

**What it is**: Creates a union of a schema with `undefined`.

**Encoded type**: `Schema.Encoded<S> | undefined`

**Type signature**:
```typescript
const UndefinedOr: <S extends Schema.All>(self: S) => UndefinedOr<S>

// Expands to:
Union<[S, typeof Undefined]>
```

**AST node type**: `Union` containing the inner schema and `UndefinedKeyword`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.UndefinedOr(S.Number)
// Encoded: number | undefined
// Type: number | undefined
```

**Database mapping**: This is less common for direct DB mapping. In Effect schemas, `undefined` typically represents "value not provided" rather than stored nulls.

---

### 6. `S.NullishOr<S>` - Union with Null and Undefined

**What it is**: Creates a union of a schema with both `null` and `undefined`.

**Encoded type**: `Schema.Encoded<S> | null | undefined`

**Type signature**:
```typescript
const NullishOr: <S extends Schema.All>(self: S) => NullishOr<S>

// Expands to:
Union<[S, typeof Null, typeof Undefined]>
```

**AST node type**: `Union` containing the inner schema, `Literal` with `literal: null`, and `UndefinedKeyword`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.NullishOr(S.String)
// Encoded: string | null | undefined
// Type: string | null | undefined
```

**Database mapping**: Column should be nullable. The `undefined` part represents "not provided" in TypeScript.

---

### 7. `S.optional<S>` - Optional Property Signature

**What it is**: Creates an optional property within a struct, allowing the field to be omitted or set to `undefined`.

**Encoded type**: `Schema.Encoded<S> | undefined` (optional)

**Type signature**:
```typescript
const optional: <S extends Schema.All>(self: S) => optional<S>

// Results in PropertySignature<"?:", Type | undefined, never, "?:", Encoded | undefined, false, Context>
```

**AST node type**: `PropertySignature` with `isOptional: true`, and the type is a `Union` of the schema and `UndefinedKeyword`

**Example**:
```typescript
import * as S from "effect/Schema"

const Product = S.Struct({
  quantity: S.optional(S.NumberFromString)
})

// Encoded: { readonly quantity?: string | undefined }
// Type: { readonly quantity?: number | undefined }
```

**Database mapping**: Column should be nullable.

**Decoding behavior**:
- Missing value → remains missing
- `undefined` → remains `undefined`
- `i: I` → transforms to `a: A`

---

### 8. `S.optionalWith<S, Options>` - Optional with Configuration

**What it is**: Creates an optional property with advanced configuration options.

**Encoded type**: Varies based on options:
- Default: `Schema.Encoded<S> | undefined` (optional)
- With `nullable: true`: `Schema.Encoded<S> | null | undefined` (optional)
- With `exact: true`: `Schema.Encoded<S>` (optional, no undefined)
- With `exact: true, nullable: true`: `Schema.Encoded<S> | null` (optional)

**Type signature**:
```typescript
const optionalWith: <S extends Schema.All, Options extends OptionalOptions<Schema.Type<S>>>(
  self: S,
  options: Options
) => optionalWith<S, Options>
```

**AST node type**: `PropertySignature` with `isOptional: true`, inner type depends on options

**Options and their effects**:

#### 8a. Basic `optionalWith` (no options or empty)
```typescript
S.optionalWith(S.NumberFromString, {})
// Same as S.optional
```

#### 8b. `optionalWith` with `nullable: true`
```typescript
S.optionalWith(S.NumberFromString, { nullable: true })
// Encoded: string | null | undefined (optional)
// Type: number | undefined (optional)
// null in encoded is treated as missing value
```

**Database mapping**: Column should be nullable.

**Decoding behavior**:
- Missing value → remains missing
- `undefined` → remains `undefined`
- `null` → transforms to missing value
- `i: I` → transforms to `a: A`

#### 8c. `optionalWith` with `exact: true`
```typescript
S.optionalWith(S.NumberFromString, { exact: true })
// Encoded: string (optional, no undefined accepted)
// Type: number (optional)
```

**Database mapping**: Column can be nullable (field can be omitted), but decoding rejects `undefined`.

**Decoding behavior**:
- Missing value → remains missing
- `undefined` → ParseError
- `i: I` → transforms to `a: A`

#### 8d. `optionalWith` with `exact: true, nullable: true`
```typescript
S.optionalWith(S.NumberFromString, { exact: true, nullable: true })
// Encoded: string | null (optional, no undefined accepted)
// Type: number (optional)
// null in encoded is treated as missing value
```

**Database mapping**: Column should be nullable.

**Decoding behavior**:
- Missing value → remains missing
- `null` → transforms to missing value
- `undefined` → ParseError
- `i: I` → transforms to `a: A`

#### 8e. `optionalWith` with `default`
```typescript
S.optionalWith(S.NumberFromString, { default: () => 1 })
// Encoded: string | undefined (optional)
// Type: number (REQUIRED, not optional!)
```

**Database mapping**: Column should be nullable (accepts missing/undefined in encoded), but has a default value.

**Decoding behavior**:
- Missing value → applies default
- `undefined` → applies default
- `i: I` → transforms to `a: A`

#### 8f. `optionalWith` with `default` and `nullable: true`
```typescript
S.optionalWith(S.NumberFromString, { default: () => 1, nullable: true })
// Encoded: string | null | undefined (optional)
// Type: number (REQUIRED)
```

**Database mapping**: Column should be nullable, with a default value.

#### 8g. `optionalWith` with `default` and `exact: true`
```typescript
S.optionalWith(S.NumberFromString, { default: () => 1, exact: true })
// Encoded: string (optional)
// Type: number (REQUIRED)
```

**Database mapping**: Column nullable (field can be omitted), default value applied.

#### 8h. `optionalWith` with `as: "Option"`
```typescript
S.optionalWith(S.NumberFromString, { as: "Option" })
// Encoded: string | undefined (optional)
// Type: Option<number> (REQUIRED)
```

**Database mapping**: Column should be nullable. The Type side wraps in `Option`.

---

### 9. `S.Literal(null)` - Literal Null Value

**What it is**: Creates a schema that only accepts the literal `null` value.

**Encoded type**: `null`

**Type signature**:
```typescript
const Literal: <Literals extends readonly [LiteralValue, ...LiteralValue[]]>(
  ...literals: Literals
) => Literal<Literals>

// When called with null:
S.Literal(null) // Schema<null, null, never>
```

**AST node type**: `Literal` with `literal: null`

**Example**:
```typescript
import * as S from "effect/Schema"

const schema = S.Literal(null)
// Encoded: null
// Type: null
```

**Database mapping**: Column stores `null` literally.

---

### 10. `S.Union` containing Null/Undefined

**What it is**: Any union that includes `S.Null`, `S.Undefined`, `S.Literal(null)`, or other nullish schemas.

**Encoded type**: Depends on union members, includes `null` and/or `undefined`

**AST node type**: `Union` with multiple members

**Examples**:
```typescript
import * as S from "effect/Schema"

// Union with null
const schema1 = S.Union(S.String, S.Null)
// Encoded: string | null
// Type: string | null

// Union with undefined
const schema2 = S.Union(S.Number, S.Undefined)
// Encoded: number | undefined
// Type: number | undefined

// Union with both
const schema3 = S.Union(S.Boolean, S.Null, S.Undefined)
// Encoded: boolean | null | undefined
// Type: boolean | null | undefined

// Tagged union with null option
const schema4 = S.Union(
  S.Struct({ _tag: S.Literal("some"), value: S.String }),
  S.Struct({ _tag: S.Literal("none") }),
  S.Null
)
// Encoded can be null
```

**Database mapping**: If union contains `null` or `undefined` members, column should be nullable.

---

## AST-Based Detection Strategy

When walking an Effect Schema AST to determine if a database column should be nullable, check for these AST node types:

### At the Top Level (Direct Schema)

1. **`Literal` with `literal: null`**: Column is nullable
2. **`UndefinedKeyword`**: Column is nullable (though rare for DB)
3. **`VoidKeyword`**: Column is nullable (though rare for DB)
4. **`Union`**: Check if any member is nullable (recursively apply these rules)

### Within PropertySignature

1. **Check `PropertySignature.isOptional === true`**: Column is nullable
2. **Check `PropertySignature.type`**: Recursively analyze the inner type using top-level rules

### Union Member Analysis

For `Union` AST nodes, check each member:
- If any member is `Literal` with `literal: null` → nullable
- If any member is `UndefinedKeyword` → nullable
- If any member is `VoidKeyword` → nullable
- Recursively check nested unions

### Example Detection Algorithm

```typescript
import * as AST from "effect/SchemaAST"

function isNullableAST(ast: AST.AST): boolean {
  // Direct null literal
  if (AST.isLiteral(ast) && ast.literal === null) {
    return true
  }

  // Undefined or Void keywords
  if (AST.isUndefinedKeyword(ast)) {
    return true
  }

  if (ast._tag === "VoidKeyword") {
    return true
  }

  // Union: check if any member is nullable
  if (AST.isUnion(ast)) {
    return ast.types.some(isNullableAST)
  }

  // Transformation: check the "to" side
  if (AST.isTransformation(ast)) {
    return isNullableAST(ast.to)
  }

  // Refinement: check the underlying type
  if (AST.isRefinement(ast)) {
    return isNullableAST(ast.from)
  }

  return false
}

function isPropertyNullable(ps: AST.PropertySignature): boolean {
  // Optional properties are nullable
  if (ps.isOptional) {
    return true
  }

  // Check the property's type
  return isNullableAST(ps.type)
}
```

---

## Summary Table

| Schema Constructor | Encoded Type | Nullable? | AST Node Type | Notes |
|-------------------|--------------|-----------|---------------|-------|
| `S.Null` | `null` | Yes | `Literal` (`literal: null`) | Direct null |
| `S.Undefined` | `undefined` | Yes | `UndefinedKeyword` | Undefined value |
| `S.Void` | `undefined` | Yes | `VoidKeyword` | Void type |
| `S.Literal(null)` | `null` | Yes | `Literal` (`literal: null`) | Same as `S.Null` |
| `S.NullOr(S)` | `Encoded \| null` | Yes | `Union` | Contains null literal |
| `S.UndefinedOr(S)` | `Encoded \| undefined` | Yes | `Union` | Contains undefined |
| `S.NullishOr(S)` | `Encoded \| null \| undefined` | Yes | `Union` | Contains both |
| `S.optional(S)` | `Encoded \| undefined` (optional) | Yes | `PropertySignature` (`isOptional: true`) | Optional field |
| `S.optionalWith(S, {})` | `Encoded \| undefined` (optional) | Yes | `PropertySignature` (`isOptional: true`) | Same as optional |
| `S.optionalWith(S, { nullable: true })` | `Encoded \| null \| undefined` (optional) | Yes | `PropertySignature` (`isOptional: true`) | Null treated as missing |
| `S.optionalWith(S, { exact: true })` | `Encoded` (optional) | Yes | `PropertySignature` (`isOptional: true`) | Field can be omitted |
| `S.optionalWith(S, { exact: true, nullable: true })` | `Encoded \| null` (optional) | Yes | `PropertySignature` (`isOptional: true`) | Null treated as missing |
| `S.optionalWith(S, { default: ... })` | `Encoded \| undefined` (optional) | Yes | `PropertySignature` (`isOptional: true`) | Has default value |
| `S.Union(...)` with null/undefined | Varies | If contains null/undefined | `Union` | Check members recursively |

---

## Key Insights for Database Column Mapping

### 1. PropertySignature `isOptional` is the Primary Signal

The `PropertySignature.isOptional` field is the most reliable indicator. If `true`, the column should be nullable.

### 2. Encoded vs Type Distinction

When mapping schemas to database columns, you must analyze the **encoded** side, not the type side. Use `AST.encodedAST()` or walk the encoded structure.

### 3. Union Analysis is Recursive

Unions can contain other unions. A recursive check is necessary to determine if any nested member is nullable.

### 4. Default Values Don't Affect Nullability

A field with a default value can still be nullable in the database. The default is applied during decoding, not at the database level.

### 5. `undefined` vs `null` Semantics

- `undefined` typically means "value not provided" in TypeScript/Effect
- `null` is an explicit value that can be stored in the database
- Both should generally map to nullable columns, but `null` has stronger DB semantics

### 6. Transformation Awareness

When an AST node is a `Transformation`, you need to check the **target** (`to`) side for nullable analysis, since that's what the decoded value will be.

---

## Integration with beep-effect

In the beep-effect codebase, when implementing AST-based nullability detection for Drizzle column generation:

1. **Start at PropertySignature level**: Check `isOptional` first
2. **Recurse into type**: Apply nullability checks to `PropertySignature.type`
3. **Handle Unions**: If the type is a Union, check all members
4. **Check Literals**: Look for `Literal` nodes with `literal === null`
5. **Check Keywords**: Look for `UndefinedKeyword` and `VoidKeyword`

This ensures comprehensive detection of all nullable schemas when generating database column definitions.

---

## References

- Effect Schema Documentation: https://effect.website/docs/schema/
- Effect Schema Source: `node_modules/effect/src/Schema.ts`
- Effect SchemaAST Source: `node_modules/effect/src/SchemaAST.ts`
- Advanced Usage (Optional Fields): Effect Schema Docs "Advanced Usage" section
