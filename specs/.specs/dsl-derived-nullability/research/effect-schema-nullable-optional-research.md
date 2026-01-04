# Effect Schema Nullable/Optional Types - Exhaustive Research

**Research Date:** 2025-12-27
**Source File:** `tmp/effect/packages/effect/src/Schema.ts`
**Effect Version:** 3.10.0+

---

## Executive Summary

This document catalogs **ALL** Effect Schema constructors and combinators whose encoded representation can be `null`, `undefined`, or optional (missing property). This is critical for DSL design, Drizzle integration, and any system that needs to map between Effect's type system and SQL/JSON schemas.

### Key Findings

Effect Schema provides three categories of nullable/optional handling:

1. **Union-based nullable combinators** - Simple union with null/undefined
2. **Option transformations** - Bidirectional mapping between Option and nullable values
3. **PropertySignature utilities** - Optional/nullable property handling in structs

---

## Category 1: Primitive Nullable Types

### 1.1 Base Primitives

#### `Undefined`
```typescript
export class Undefined extends make<undefined>(AST.undefinedKeyword) {}
```
- **Type:** `undefined`
- **Encoded:** `undefined`
- **AST:** `AST.undefinedKeyword`
- **Use case:** Represents missing values in JavaScript

#### `Null`
```typescript
export class Null extends make<null>(AST.null) {}
```
- **Type:** `null`
- **Encoded:** `null`
- **AST:** `AST.null`
- **Use case:** Represents explicit null values

#### `Void`
```typescript
export class Void extends make<void>(AST.voidKeyword) {}
```
- **Type:** `void`
- **Encoded:** `void`
- **AST:** `AST.voidKeyword`
- **Use case:** Function return type, not typically used for data

---

## Category 2: Union-Based Nullable Combinators

These create unions with the base schema and nullable types.

### 2.1 NullOr

```typescript
export interface NullOr<S extends Schema.All> extends Union<[S, typeof Null]> {
  annotations(annotations: Annotations.Schema<Schema.Type<S> | null>): NullOr<S>
}

export const NullOr = <S extends Schema.All>(self: S): NullOr<S> =>
  Union(self, Null)
```

- **Type:** `Schema.Type<S> | null`
- **Encoded:** `Schema.Encoded<S> | null`
- **AST:** `Union` of schema and `Null`
- **Example:** `NullOr(String)` → Type: `string | null`, Encoded: `string | null`

### 2.2 UndefinedOr

```typescript
export interface UndefinedOr<S extends Schema.All> extends Union<[S, typeof Undefined]> {
  annotations(annotations: Annotations.Schema<Schema.Type<S> | undefined>): UndefinedOr<S>
}

export const UndefinedOr = <S extends Schema.All>(self: S): UndefinedOr<S> =>
  Union(self, Undefined)
```

- **Type:** `Schema.Type<S> | undefined`
- **Encoded:** `Schema.Encoded<S> | undefined`
- **AST:** `Union` of schema and `Undefined`
- **Example:** `UndefinedOr(Number)` → Type: `number | undefined`, Encoded: `number | undefined`

### 2.3 NullishOr

```typescript
export interface NullishOr<S extends Schema.All> extends Union<[S, typeof Null, typeof Undefined]> {
  annotations(annotations: Annotations.Schema<Schema.Type<S> | null | undefined>): NullishOr<S>
}

export const NullishOr = <S extends Schema.All>(self: S): NullishOr<S> =>
  Union(self, Null, Undefined)
```

- **Type:** `Schema.Type<S> | null | undefined`
- **Encoded:** `Schema.Encoded<S> | null | undefined`
- **AST:** `Union` of schema, `Null`, and `Undefined`
- **Example:** `NullishOr(Boolean)` → Type: `boolean | null | undefined`, Encoded: `boolean | null | undefined`

---

## Category 3: Option Transformations

These provide bidirectional transformations between `Option<A>` and nullable values.

### 3.1 OptionFromSelf

```typescript
export interface OptionFromSelf<Value extends Schema.Any> extends
  AnnotableDeclare<
    OptionFromSelf<Value>,
    option_.Option<Schema.Type<Value>>,
    option_.Option<Schema.Encoded<Value>>,
    [Value]
  >
{}

export const OptionFromSelf = <Value extends Schema.Any>(value: Value): OptionFromSelf<Value>
```

- **Type:** `Option<Schema.Type<Value>>`
- **Encoded:** `Option<Schema.Encoded<Value>>`
- **AST:** Custom declaration
- **Use case:** When both sides are already Option types
- **Note:** Encoded is still `Option`, not nullable!

### 3.2 Option (from tagged union)

```typescript
export interface Option<Value extends Schema.Any> extends
  transform<
    Union<[
      Struct<{ _tag: Literal<["None"]> }>,
      Struct<{ _tag: Literal<["Some"]>; value: Value }>
    ]>,
    OptionFromSelf<SchemaClass<Schema.Type<Value>>>
  >
{}

export function Option<Value extends Schema.Any>(value: Value): Option<Value>
```

- **Type:** `Option<Schema.Type<Value>>`
- **Encoded:** `{ _tag: "None" } | { _tag: "Some", value: Schema.Encoded<Value> }`
- **AST:** Transform from discriminated union to Option
- **Decode:** Converts tagged union to `Option`
- **Encode:** Converts `Option` to tagged union

### 3.3 OptionFromNullOr

```typescript
export interface OptionFromNullOr<Value extends Schema.Any>
  extends transform<NullOr<Value>, OptionFromSelf<SchemaClass<Schema.Type<Value>>>>
{}

export function OptionFromNullOr<Value extends Schema.Any>(value: Value): OptionFromNullOr<Value> {
  return transform(NullOr(value), OptionFromSelf(typeSchema(asSchema(value))), {
    strict: true,
    decode: (i) => option_.fromNullable(i),
    encode: (a) => option_.getOrNull(a)
  })
}
```

- **Type:** `Option<Schema.Type<Value>>`
- **Encoded:** `Schema.Encoded<Value> | null`
- **Decode:** `null` → `None`, `Value` → `Some(Value)`
- **Encode:** `None` → `null`, `Some(Value)` → `Value`
- **Use case:** JSON APIs that use `null` for absence

### 3.4 OptionFromUndefinedOr

```typescript
export interface OptionFromUndefinedOr<Value extends Schema.Any>
  extends transform<UndefinedOr<Value>, OptionFromSelf<SchemaClass<Schema.Type<Value>>>>
{}

export function OptionFromUndefinedOr<Value extends Schema.Any>(value: Value): OptionFromUndefinedOr<Value> {
  return transform(UndefinedOr(value), OptionFromSelf(typeSchema(asSchema(value))), {
    strict: true,
    decode: (i) => option_.fromNullable(i),
    encode: (a) => option_.getOrUndefined(a)
  })
}
```

- **Type:** `Option<Schema.Type<Value>>`
- **Encoded:** `Schema.Encoded<Value> | undefined`
- **Decode:** `undefined` → `None`, `Value` → `Some(Value)`
- **Encode:** `None` → `undefined`, `Some(Value)` → `Value`
- **Use case:** TypeScript APIs, optional object properties

### 3.5 OptionFromNullishOr

```typescript
export interface OptionFromNullishOr<Value extends Schema.Any>
  extends transform<NullishOr<Value>, OptionFromSelf<SchemaClass<Schema.Type<Value>>>>
{}

export function OptionFromNullishOr<Value extends Schema.Any>(
  value: Value,
  onNoneEncoding: null | undefined
): OptionFromNullishOr<Value> {
  return transform(
    NullishOr(value),
    OptionFromSelf(typeSchema(asSchema(value))),
    {
      strict: true,
      decode: (i) => option_.fromNullable(i),
      encode: onNoneEncoding === null ?
        (a) => option_.getOrNull(a) :
        (a) => option_.getOrUndefined(a)
    }
  )
}
```

- **Type:** `Option<Schema.Type<Value>>`
- **Encoded:** `Schema.Encoded<Value> | null | undefined`
- **Decode:** `null | undefined` → `None`, `Value` → `Some(Value)`
- **Encode:** `None` → `null` or `undefined` (based on `onNoneEncoding`), `Some(Value)` → `Value`
- **Use case:** Lenient parsing where both null and undefined represent absence
- **Note:** Asymmetric - accepts both null/undefined, but encodes to only one

### 3.6 OptionFromNonEmptyTrimmedString

```typescript
export class OptionFromNonEmptyTrimmedString extends transform(
  String$,
  OptionFromSelf(NonEmptyTrimmedString),
  {
    strict: true,
    decode: (i) => option_.filter(option_.some(i.trim()), string_.isNonEmpty),
    encode: (a) => option_.getOrElse(a, () => "")
  }
) {}
```

- **Type:** `Option<NonEmptyTrimmedString>`
- **Encoded:** `string`
- **Decode:** Empty/whitespace strings → `None`, non-empty trimmed → `Some(trimmed)`
- **Encode:** `None` → `""`, `Some(value)` → `value`
- **Use case:** Form inputs where empty strings should be treated as absent

---

## Category 4: PropertySignature Utilities

These create optional or nullable properties in struct schemas.

### 4.1 Element Types

#### `element`
```typescript
export const element = <S extends Schema.Any>(self: S): Element<S, "">
```
- Creates a **required** tuple element
- **Encoded:** Always present

#### `optionalElement`
```typescript
export const optionalElement = <S extends Schema.Any>(self: S): Element<S, "?">
```
- Creates an **optional** tuple element
- **Encoded:** May be missing from array
- **AST:** `new AST.OptionalType(self.ast, true)`

### 4.2 PropertySignature Combinators

#### `propertySignature`
```typescript
export const propertySignature = <S extends Schema.All>(self: S): propertySignature<S>
```
- Creates a **required** property signature
- **Type:** `Schema.Type<S>`
- **Encoded:** `Schema.Encoded<S>` (always present)

#### `optional`
```typescript
export interface optional<S extends Schema.All> extends
  PropertySignature<
    "?:",
    Schema.Type<S> | undefined,
    never,
    "?:",
    Schema.Encoded<S> | undefined,
    false,
    Schema.Context<S>
  >
{}

export const optional = <S extends Schema.All>(self: S): optional<S>
```

- **Type:** `Schema.Type<S> | undefined` (property token: `?:`)
- **Encoded:** `Schema.Encoded<S> | undefined` (property token: `?:`)
- **Decode/Encode:** Missing property → `undefined`, `undefined` → missing property
- **AST:** Uses `UndefinedOr(self).ast` internally
- **Use case:** Standard optional properties in TypeScript

#### `optionalWith`
```typescript
export const optionalWith: {
  <S extends Schema.All, Options extends OptionalOptions<Schema.Type<S>>>(
    options: Options
  ): (self: S) => optionalWith<S, Options>
  <S extends Schema.All, Options extends OptionalOptions<Schema.Type<S>>>(
    self: S,
    options: Options
  ): optionalWith<S, Options>
}
```

**Options Configurations:**

1. **`{ exact: true }`**
   - **Type:** `Schema.Type<S>` (property can be omitted)
   - **Encoded:** `Schema.Encoded<S>` (no undefined union)
   - Missing property remains missing (strict mode)

2. **`{ exact: true, nullable: true }`**
   - **Type:** `Schema.Type<S>` (property can be omitted)
   - **Encoded:** `Schema.Encoded<S> | null`
   - Accepts `null` or missing, filters `null` to missing

3. **`{ nullable: true }`** (no exact)
   - **Type:** `Schema.Type<S> | undefined`
   - **Encoded:** `Schema.Encoded<S> | null | undefined`
   - Lenient: accepts null/undefined/missing, filters null

4. **`{ default: () => A }`**
   - **Type:** `Schema.Type<S>` (required property token `:`)
   - **Encoded:** `Schema.Encoded<S> | undefined` (optional property token `?:`)
   - Missing/undefined → default value during decode
   - Has constructor default

5. **`{ default: () => A, nullable: true }`**
   - **Type:** `Schema.Type<S>` (required property token `:`)
   - **Encoded:** `Schema.Encoded<S> | null | undefined`
   - Missing/null/undefined → default value

6. **`{ as: "Option" }`**
   - **Type:** `Option<Schema.Type<S>>` (required property token `:`)
   - **Encoded:** `Schema.Encoded<S> | undefined` (optional property token `?:`)
   - Missing/undefined → `None`, value → `Some(value)`

7. **`{ as: "Option", nullable: true }`**
   - **Type:** `Option<Schema.Type<S>>` (required property token `:`)
   - **Encoded:** `Schema.Encoded<S> | null | undefined` (optional property token `?:`)
   - Missing/null/undefined → `None`, value → `Some(value)`

8. **`{ as: "Option", exact: true }`**
   - **Type:** `Option<Schema.Type<S>>` (required property token `:`)
   - **Encoded:** `Schema.Encoded<S>` (optional property token `?:`)
   - Missing → `None`, value → `Some(value)`, strict mode

9. **`{ as: "Option", exact: true, nullable: true, onNoneEncoding: () => Option<null> }`**
   - **Type:** `Option<Schema.Type<S>>` (required property token `:`)
   - **Encoded:** `Schema.Encoded<S> | null` (optional property token `?:`)
   - Controls None encoding behavior with `onNoneEncoding`

### 4.3 PropertySignature Transformations

#### `optionalToRequired`
```typescript
export const optionalToRequired = <FA, FI, FR, TA, TI, TR>(
  from: Schema<FA, FI, FR>,
  to: Schema<TA, TI, TR>,
  options: {
    readonly decode: (o: option_.Option<FA>) => TI
    readonly encode: (ti: TI) => option_.Option<FA>
  }
): PropertySignature<":", TA, never, "?:", FI, false, FR | TR>
```

- Transforms **optional** encoded property → **required** decoded property
- `decode`: Receives `None` if missing, `Some(value)` if present
- `encode`: Returns `None` to omit property, `Some(value)` to include

#### `requiredToOptional`
```typescript
export const requiredToOptional = <FA, FI, FR, TA, TI, TR>(
  from: Schema<FA, FI, FR>,
  to: Schema<TA, TI, TR>,
  options: {
    readonly decode: (fa: FA) => option_.Option<TI>
    readonly encode: (o: option_.Option<TI>) => FA
  }
): PropertySignature<"?:", TA, never, ":", FI, false, FR | TR>
```

- Transforms **required** encoded property → **optional** decoded property
- `decode`: Returns `None` to make property optional, `Some(value)` to include
- `encode`: Receives `None` if missing, must always return a value

#### `optionalToOptional`
```typescript
export const optionalToOptional = <FA, FI, FR, TA, TI, TR>(
  from: Schema<FA, FI, FR>,
  to: Schema<TA, TI, TR>,
  options: {
    readonly decode: (o: option_.Option<FA>) => option_.Option<TI>
    readonly encode: (o: option_.Option<TI>) => option_.Option<FA>
  }
): PropertySignature<"?:", TA, never, "?:", FI, false, FR | TR>
```

- Transforms **optional** encoded → **optional** decoded
- Both sides handle `Option` to support omitting properties
- Full control over presence/absence transformations

### 4.4 Default Value Utilities

#### `withConstructorDefault`
```typescript
export const withConstructorDefault: {
  <Type>(defaultValue: () => Types.NoInfer<Type>): <...>(
    self: PropertySignature<TypeToken, Type, Key, EncodedToken, Encoded, boolean, R>
  ) => PropertySignature<TypeToken, Type, Key, EncodedToken, Encoded, true, R>
}
```

- Adds a **constructor-time** default value
- Default is applied when creating instances (e.g., via struct constructors)
- Sets `HasDefault` type parameter to `true`

#### `withDecodingDefault`
```typescript
export const withDecodingDefault: {
  <Type>(defaultValue: () => Types.NoInfer<Exclude<Type, undefined>>): <...>(
    self: PropertySignature<"?:", Type, Key, "?:", Encoded, boolean, R>
  ) => PropertySignature<":", Exclude<Type, undefined>, Key, "?:", Encoded, boolean, R>
}
```

- Adds a **decoding-time** default value
- Missing/undefined values are replaced with default during `decode`
- Converts optional type property (`?:`) to required (`:`)

#### `withDefaults`
```typescript
export const withDefaults: {
  <Type>(defaults: {
    constructor: () => Types.NoInfer<Exclude<Type, undefined>>
    decoding: () => Types.NoInfer<Exclude<Type, undefined>>
  }): <...> => PropertySignature<":", Exclude<Type, undefined>, Key, "?:", Encoded, true, R>
}
```

- Combines both constructor and decoding defaults
- Most comprehensive default handling

---

## Category 5: Struct-Level Transformations

### 5.1 partial

```typescript
export const partial = <A, I, R>(
  self: Schema<A, I, R>
): SchemaClass<
  { [K in keyof A]?: A[K] | undefined },
  { [K in keyof I]?: I[K] | undefined },
  R
>
```

- Makes **all properties** of a struct optional
- **Type:** All properties become `T | undefined` and optional
- **Encoded:** All properties become `I | undefined` and optional
- **AST:** `AST.partial(self.ast)`

### 5.2 partialWith

```typescript
export const partialWith: {
  <const Options extends { readonly exact: true }>(options: Options): <A, I, R>(
    self: Schema<A, I, R>
  ) => SchemaClass<{ [K in keyof A]?: A[K] }, { [K in keyof I]?: I[K] }, R>
}
```

- Makes all properties optional with `exact: true` mode
- **Type:** All properties become `T` (no `undefined` union) and optional
- **Encoded:** All properties become `I` (no `undefined` union) and optional
- **Strict mode:** Missing properties stay missing (no undefined injection)

---

## Category 6: Tuple Elements

Effect schemas for tuples can have optional elements at the end.

### 6.1 Optional Tuple Elements

```typescript
const schema = S.Tuple(
  S.String,           // Required element
  S.optionalElement(S.Number)  // Optional element
)
```

- **Type:** `[string, number?]`
- **Encoded:** `[string, number?]`
- **Decode:** Missing tail elements are valid
- **Encode:** Missing tail elements omitted from array

---

## AST Structures

Understanding the AST is critical for introspection and code generation.

### PropertySignature AST Types

1. **`PropertySignatureDeclaration`**
   - Simple property with no transformation
   - `isOptional: boolean` - whether `?:` token
   - `defaultValue: (() => unknown) | undefined`

2. **`FromPropertySignature`**
   - Represents encoded side of a transformation
   - `fromKey?: PropertyKey` - aliased property name

3. **`ToPropertySignature`**
   - Represents decoded side of a transformation

4. **`PropertySignatureTransformation`**
   - Full bidirectional transformation
   - Contains `from`, `to`, `decode`, `encode`

### OptionalType AST

```typescript
new AST.OptionalType(type: AST.AST, isOptional: boolean)
```

- Used for tuple elements
- `isOptional: true` means element can be absent

---

## Drizzle Integration Patterns

For mapping Effect schemas to Drizzle columns:

### 1. Null vs Undefined Mapping

```typescript
// Effect: UndefinedOr(String)
// Drizzle: text().notNull() -- undefined not representable in SQL
// Solution: Map undefined → null for DB

// Effect: NullOr(String)
// Drizzle: text() -- null is default
// Perfect match

// Effect: NullishOr(String)
// Drizzle: text() -- accepts null, undefined coerced
```

### 2. Option Mapping

```typescript
// Effect: OptionFromNullOr(Number)
// Type: Option<number>
// Encoded: number | null
// Drizzle: integer() -- null for None
// Decode: null → None, number → Some(number)
// Encode: None → null, Some(n) → n

// Effect: OptionFromUndefinedOr(String)
// Type: Option<string>
// Encoded: string | undefined
// Drizzle: text().notNull().default("") -- can't represent undefined
// Solution: Use OptionFromNullOr instead for DB schemas
```

### 3. Optional Properties

```typescript
// Effect: S.Struct({ name: S.optional(S.String) })
// Type: { name?: string | undefined }
// Encoded: { name?: string | undefined }
// Drizzle: name: text()
// Note: Missing properties become null in SQL

// Effect: S.Struct({ name: S.optionalWith(S.String, { exact: true, nullable: true }) })
// Type: { name?: string }
// Encoded: { name?: string | null }
// Drizzle: name: text()
// Better match for SQL semantics
```

### 4. Default Values

```typescript
// Effect: S.Struct({
//   role: S.optionalWith(S.String, { default: () => "user" })
// })
// Type: { role: string } -- required!
// Encoded: { role?: string }
// Drizzle: role: text().notNull().default("user")
// Perfect alignment
```

---

## Complete List of Schemas with Nullable Encoded Types

### Direct Nullable/Undefined Types
1. `Null` - encodes to `null`
2. `Undefined` - encodes to `undefined`
3. `Void` - encodes to `void`

### Union Combinators
4. `NullOr<S>` - encodes to `Encoded<S> | null`
5. `UndefinedOr<S>` - encodes to `Encoded<S> | undefined`
6. `NullishOr<S>` - encodes to `Encoded<S> | null | undefined`

### Option Transformations (null/undefined in encoded)
7. `OptionFromNullOr<S>` - encodes to `Encoded<S> | null`
8. `OptionFromUndefinedOr<S>` - encodes to `Encoded<S> | undefined`
9. `OptionFromNullishOr<S>` - encodes to `Encoded<S> | null | undefined`
10. `OptionFromNonEmptyTrimmedString` - encodes to `string` (but semantically optional via empty string)

### PropertySignature Utilities (optional/nullable properties)
11. `optional<S>` - encodes to `{ prop?: Encoded<S> | undefined }`
12. `optionalWith<S, { exact: true }>` - encodes to `{ prop?: Encoded<S> }`
13. `optionalWith<S, { nullable: true }>` - encodes to `{ prop?: Encoded<S> | null | undefined }`
14. `optionalWith<S, { exact: true, nullable: true }>` - encodes to `{ prop?: Encoded<S> | null }`
15. `optionalWith<S, { default: () => A }>` - encodes to `{ prop?: Encoded<S> | undefined }`
16. `optionalWith<S, { default: () => A, nullable: true }>` - encodes to `{ prop?: Encoded<S> | null | undefined }`
17. `optionalWith<S, { as: "Option" }>` - encodes to `{ prop?: Encoded<S> | undefined }`
18. `optionalWith<S, { as: "Option", nullable: true }>` - encodes to `{ prop?: Encoded<S> | null | undefined }`
19. `optionalWith<S, { as: "Option", exact: true }>` - encodes to `{ prop?: Encoded<S> }`
20. `optionalWith<S, { as: "Option", exact: true, nullable: true }>` - encodes to `{ prop?: Encoded<S> | null }`

### Struct Transformations
21. `partial<Schema>` - encodes to `{ [K]?: Encoded[K] | undefined }`
22. `partialWith<Schema, { exact: true }>` - encodes to `{ [K]?: Encoded[K] }`

### Tuple Elements
23. `optionalElement<S>` - creates optional tuple element (can be missing from array)

### PropertySignature Transformations
24. `optionalToRequired` - **encoded side** is optional (`?:`)
25. `requiredToOptional` - **encoded side** is required (`:`)
26. `optionalToOptional` - **encoded side** is optional (`?:`)

---

## Critical Distinctions

### Missing vs Undefined vs Null

- **Missing** (`?:` property token): Property doesn't exist in object
- **Undefined**: Property exists with `undefined` value
- **Null**: Property exists with `null` value

Effect Schema distinguishes these carefully:

```typescript
// Standard optional (conflates missing and undefined)
S.Struct({ name: S.optional(S.String) })
// { name?: string | undefined } -- missing and undefined are same

// Exact optional (preserves distinction)
S.Struct({ name: S.optionalWith(S.String, { exact: true }) })
// { name?: string } -- missing ≠ undefined

// Nullable (adds null)
S.Struct({ name: S.optionalWith(S.String, { nullable: true }) })
// { name?: string | null | undefined }
```

### Option Encoding Strategies

1. **Tagged union** (`Option<S>`) - always includes structure in encoded
2. **Nullable** (`OptionFromNullOr`, etc.) - uses language-level null/undefined
3. **Exact mode** - strict about missing vs present

### Property Tokens

- `":"` - Required property (must be present)
- `"?:"` - Optional property (may be missing)

These are **encoded tokens**, separate from whether the **type** includes `undefined`.

---

## References

- **Source File:** `/tmp/effect/packages/effect/src/Schema.ts`
- **AST Module:** `effect/SchemaAST`
- **Effect Version:** 3.10.0+
- **Lines of Interest:**
  - 1174-1192: Primitive types (Undefined, Null, Void)
  - 1312-1348: Union combinators (NullOr, UndefinedOr, NullishOr)
  - 7248-7334: Option transformations (OptionFromNullOr, etc.)
  - 2365-2563: PropertySignature utilities (optional, optionalWith)
  - 2249-2320: PropertySignature transformations
  - 3220-3240: Struct transformations (partial, partialWith)
  - 1389-1420: Tuple elements (element, optionalElement)
