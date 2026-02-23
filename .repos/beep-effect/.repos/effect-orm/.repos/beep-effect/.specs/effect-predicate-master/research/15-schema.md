# Effect Schema Predicate Functions - Research Report

## Executive Summary

The `effect/Schema` module provides comprehensive predicate-related functionality through three main mechanisms:

1. **Type Guards** - Runtime type checking via `is` and `asserts`
2. **Validation Functions** - Schema-based validation returning Effect/Either/Option
3. **Filter Functions** - Refinement predicates for strings, numbers, bigints, and other types

This research documents all predicate-related functions in the Schema module, their signatures, use cases, and integration patterns.

---

## 1. Schema Type Guards

### 1.1 `is` - Type Guard Generation

**Location**: Re-exported from `ParseResult` (line 477 in Schema.ts, line 664 in ParseResult.ts)

**Signature**:
```typescript
export const is: <A, I, R>(
  schema: Schema.Schema<A, I, R>,
  options?: AST.ParseOptions
) => (u: unknown, overrideOptions?: AST.ParseOptions | number) => u is A
```

**Description**: Generates a type guard function from a schema. By default, the `exact` option is set to `true`.

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const UserSchema = S.Struct({
  id: S.Number,
  name: S.String
})

const isUser = S.is(UserSchema)

const value: unknown = { id: 1, name: "Alice" }

if (isUser(value)) {
  // TypeScript knows value is { id: number; name: string }
  console.log(value.id, value.name)
}
```

**Implementation Details**:
- Uses the schema's type AST (`AST.typeAST(schema.ast)`)
- Returns `true` if parsing succeeds (Right), `false` otherwise
- Sets `exact: true` by default (strict validation)

---

### 1.2 `asserts` - Assertion Type Guard

**Location**: Re-exported from `ParseResult` (line 426 in Schema.ts, line 677 in ParseResult.ts)

**Signature**:
```typescript
export const asserts: <A, I, R>(
  schema: Schema.Schema<A, I, R>,
  options?: AST.ParseOptions
) => (u: unknown, overrideOptions?: AST.ParseOptions) => asserts u is A
```

**Description**: Generates an assertion function that throws `ParseError` if validation fails.

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const NumberSchema = S.Number

const assertsNumber = S.asserts(NumberSchema)

function processNumber(value: unknown) {
  assertsNumber(value)
  // TypeScript knows value is number here
  return value * 2
}

processNumber(42)  // Works
processNumber("42")  // Throws ParseError
```

**Throws**: `ParseError` when validation fails

---

### 1.3 `isSchema` - Schema Instance Guard

**Location**: Line 666 in Schema.ts

**Signature**:
```typescript
export const isSchema = (u: unknown): u is Schema.Any =>
  Predicate.hasProperty(u, TypeId) && Predicate.isObject(u[TypeId])
```

**Description**: Tests if a value is a `Schema` instance.

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const schema = S.String

if (S.isSchema(schema)) {
  // schema is confirmed to be a Schema
  console.log("This is a schema!")
}
```

---

### 1.4 `isPropertySignature` - Property Signature Guard

**Location**: Line 1859 in Schema.ts

**Signature**:
```typescript
export const isPropertySignature = (u: unknown): u is PropertySignature.All =>
  Predicate.hasProperty(u, PropertySignatureTypeId)
```

**Description**: Tests if a value is a `PropertySignature`.

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const prop = S.optional(S.String)

if (S.isPropertySignature(prop)) {
  // prop is confirmed to be a PropertySignature
}
```

---

## 2. Validation Functions

### 2.1 `validate` - Effect-based Validation

**Location**: Line 626 in Schema.ts

**Signature**:
```typescript
export const validate: <A, I, R>(
  schema: Schema<A, I, R>,
  options?: ParseOptions
) => (u: unknown, overrideOptions?: ParseOptions) => Effect.Effect<A, ParseResult.ParseError, R>
```

**Description**: Validates unknown input against the schema's type, returning an Effect.

**Example Usage**:
```typescript
import * as S from "effect/Schema"
import * as Effect from "effect/Effect"

const UserSchema = S.Struct({
  id: S.Number,
  name: S.String
})

const validateUser = S.validate(UserSchema)

const program = Effect.gen(function*() {
  const user = yield* validateUser({ id: 1, name: "Alice" })
  console.log(user)
})

Effect.runPromise(program)
```

---

### 2.2 `validateEither` - Either-based Validation

**Location**: Line 639 in Schema.ts

**Signature**:
```typescript
export const validateEither: <A, I, R>(
  schema: Schema<A, I, R>,
  options?: ParseOptions
) => (u: unknown, overrideOptions?: ParseOptions) => Either.Either<A, ParseResult.ParseError>
```

**Description**: Validates unknown input, returning `Either<A, ParseError>`.

**Example Usage**:
```typescript
import * as S from "effect/Schema"
import * as E from "effect/Either"

const validateNumber = S.validateEither(S.Number)

const result = validateNumber("not a number")

if (E.isLeft(result)) {
  console.error("Validation failed:", result.left)
} else {
  console.log("Valid number:", result.right)
}
```

---

### 2.3 `validateSync` - Synchronous Validation

**Location**: Re-exported from `ParseResult` (line 488 in Schema.ts, line 611 in ParseResult.ts)

**Signature**:
```typescript
export const validateSync: <A, I, R>(
  schema: Schema.Schema<A, I, R>,
  options?: AST.ParseOptions
) => (u: unknown, overrideOptions?: AST.ParseOptions) => A
```

**Description**: Synchronously validates unknown input, throwing `ParseError` on failure.

**Throws**: `ParseError` when validation fails

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const validateString = S.validateSync(S.String)

try {
  const result = validateString("hello")  // Works
  console.log(result)

  validateString(123)  // Throws
} catch (error) {
  console.error("Validation error:", error)
}
```

---

### 2.4 `validateOption` - Option-based Validation

**Location**: Re-exported from `ParseResult` (line 482 in Schema.ts, line 620 in ParseResult.ts)

**Signature**:
```typescript
export const validateOption: <A, I, R>(
  schema: Schema.Schema<A, I, R>,
  options?: AST.ParseOptions
) => (u: unknown, overrideOptions?: AST.ParseOptions) => Option.Option<A>
```

**Description**: Validates unknown input, returning `Option<A>`.

**Example Usage**:
```typescript
import * as S from "effect/Schema"
import * as O from "effect/Option"

const validateNumber = S.validateOption(S.Number)

const result = validateNumber(42)

if (O.isSome(result)) {
  console.log("Valid:", result.value)
} else {
  console.log("Invalid")
}
```

---

### 2.5 `validatePromise` - Promise-based Validation

**Location**: Line 652 in Schema.ts

**Signature**:
```typescript
export const validatePromise: <A, I>(
  schema: Schema<A, I, never>,
  options?: ParseOptions
) => (u: unknown, overrideOptions?: ParseOptions) => Promise<A>
```

**Description**: Validates unknown input, returning a Promise.

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const validateUser = S.validatePromise(S.Struct({
  id: S.Number,
  name: S.String
}))

validateUser({ id: 1, name: "Alice" })
  .then(user => console.log("Valid user:", user))
  .catch(error => console.error("Invalid:", error))
```

---

## 3. Filter and Refinement Functions

### 3.1 Core Filter Function

**Location**: Line 3695 in Schema.ts

**Signature**:
```typescript
// Type guard overload
export function filter<C extends A, B extends A, A = C>(
  refinement: (a: A, options: ParseOptions, self: AST.Refinement) => a is B,
  annotations?: Annotations.Filter<C & B, C>
): <I, R>(self: Schema<C, I, R>) => refine<C & B, Schema<A, I, R>>

// Predicate overload
export function filter<S extends Schema.Any>(
  predicate: (
    a: Types.NoInfer<Schema.Type<S>>,
    options: ParseOptions,
    self: AST.Refinement
  ) => FilterReturnType,
  annotations?: Annotations.Filter<Types.NoInfer<Schema.Type<S>>>
): (self: S) => filter<S>
```

**Description**: Creates a refinement on a schema using a predicate function.

**Filter Return Types**:
- `undefined` - Filter passes
- `boolean` - `true` passes, `false` fails
- `string` - Custom error message
- `ParseResult.ParseIssue` - Detailed parse issue
- `FilterIssue` - Issue with path and message
- `ReadonlyArray<FilterOutput>` - Multiple issues

**Example Usage**:
```typescript
import * as S from "effect/Schema"

// Simple boolean predicate
const PositiveNumber = S.Number.pipe(
  S.filter((n) => n > 0)
)

// Custom error message
const EvenNumber = S.Number.pipe(
  S.filter(
    (n) => n % 2 === 0 ? undefined : "Must be even",
    { identifier: "EvenNumber" }
  )
)

// Type guard refinement
const isPositive = (n: number): n is number & { __brand: "Positive" } => n > 0

const BrandedPositive = S.Number.pipe(
  S.filter(isPositive)
)
```

---

### 3.2 `filterEffect` - Effect-based Filter

**Location**: Line 3744 in Schema.ts

**Signature**:
```typescript
export const filterEffect: {
  <S extends Schema.Any, FD>(
    f: (
      a: Types.NoInfer<Schema.Type<S>>,
      options: ParseOptions,
      self: AST.Transformation
    ) => Effect.Effect<FilterReturnType, never, FD>
  ): (self: S) => filterEffect<S, FD>
}
```

**Description**: Creates a refinement using an Effect-based predicate (for async validation).

**Example Usage**:
```typescript
import * as S from "effect/Schema"
import * as Effect from "effect/Effect"

const checkUniqueEmail = (email: string) =>
  Effect.gen(function*() {
    // Simulate async DB check
    const exists = yield* checkEmailInDatabase(email)
    return exists ? "Email already exists" : undefined
  })

const UniqueEmailSchema = S.String.pipe(
  S.filterEffect((email) => checkUniqueEmail(email))
)
```

---

### 3.3 `FilterIssue` Type

**Location**: Line 3678 in Schema.ts

**Interface**:
```typescript
export interface FilterIssue {
  readonly path: ReadonlyArray<PropertyKey>
  readonly message: string
}
```

**Description**: Represents a validation issue with a path to the failing field.

**Example Usage**:
```typescript
import * as S from "effect/Schema"

const ComplexValidator = S.Struct({
  user: S.Struct({
    email: S.String
  })
}).pipe(
  S.filter((data) => {
    if (!data.user.email.includes("@")) {
      return {
        path: ["user", "email"],
        message: "Invalid email format"
      }
    }
    return undefined
  })
)
```

---

## 4. String Filters

### 4.1 Length Filters

#### `minLength`

**Location**: Line 4323

**Signature**:
```typescript
export const minLength: <S extends Schema.Any>(
  minLength: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const MinLengthString = S.String.pipe(S.minLength(5))
```

---

#### `maxLength`

**Location**: Line 4291

**Signature**:
```typescript
export const maxLength: <S extends Schema.Any>(
  maxLength: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const MaxLengthString = S.String.pipe(S.maxLength(100))
```

---

#### `length`

**Location**: Line 4357

**Signature**:
```typescript
export const length: <S extends Schema.Any>(
  length: number | { readonly min: number; readonly max: number },
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
// Exact length
const ExactLength = S.String.pipe(S.length(10))

// Range
const RangeLength = S.String.pipe(S.length({ min: 5, max: 20 }))
```

---

### 4.2 Pattern Filters

#### `pattern`

**Location**: Line 4396

**Signature**:
```typescript
export const pattern: <S extends Schema.Any>(
  regex: RegExp,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const EmailPattern = S.String.pipe(
  S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    identifier: "Email"
  })
)
```

---

#### `startsWith`

**Location**: Line 4431

**Signature**:
```typescript
export const startsWith: <S extends Schema.Any>(
  startsWith: string,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const HttpsUrl = S.String.pipe(S.startsWith("https://"))
```

---

#### `endsWith`

**Location**: Line 4462

**Signature**:
```typescript
export const endsWith: <S extends Schema.Any>(
  endsWith: string,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const PngFile = S.String.pipe(S.endsWith(".png"))
```

---

### 4.3 Case Filters

#### `lowercased`

**Location**: Line 4526

**Signature**:
```typescript
export const lowercased: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const LowercaseString = S.String.pipe(S.lowercased())

// Or use the built-in class
class Lowercased extends S.Lowercased {}
```

---

#### `uppercased`

**Location**: Line 4559

**Signature**:
```typescript
export const uppercased: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const UppercaseString = S.String.pipe(S.uppercased())

// Or use the built-in class
class Uppercased extends S.Uppercased {}
```

---

#### `capitalized`

**Location**: Line 4592

**Signature**:
```typescript
export const capitalized: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends string>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const CapitalizedString = S.String.pipe(S.capitalized())
```

---

## 5. Number Filters

### 5.1 Range Filters

#### `greaterThan`

**Location**: Line 5012

**Signature**:
```typescript
export const greaterThan: <S extends Schema.Any>(
  exclusiveMinimum: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const PositiveNumber = S.Number.pipe(S.greaterThan(0))
```

---

#### `greaterThanOrEqualTo`

**Location**: Line 5045

**Signature**:
```typescript
export const greaterThanOrEqualTo: <S extends Schema.Any>(
  minimum: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const NonNegativeNumber = S.Number.pipe(S.greaterThanOrEqualTo(0))
```

---

#### `lessThan`

**Location**: Line 5136

**Signature**:
```typescript
export const lessThan: <S extends Schema.Any>(
  exclusiveMaximum: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const BelowHundred = S.Number.pipe(S.lessThan(100))
```

---

#### `lessThanOrEqualTo`

**Location**: Line 5167

**Signature**:
```typescript
export const lessThanOrEqualTo: <S extends Schema.Any>(
  maximum: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const MaxHundred = S.Number.pipe(S.lessThanOrEqualTo(100))
```

---

#### `between`

**Location**: Line 5200

**Signature**:
```typescript
export const between: <S extends Schema.Any>(
  minimum: number,
  maximum: number,
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Example**:
```typescript
const Percentage = S.Number.pipe(S.between(0, 100))
```

---

### 5.2 Type Filters

#### `int`

**Location**: Line 5105

**Signature**:
```typescript
export const int: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Description**: Ensures the number is a safe integer (uses `Number.isSafeInteger`).

**Example**:
```typescript
const IntegerNumber = S.Number.pipe(S.int())

// Or use the built-in class
class Int extends S.Int {}
```

---

#### `finite`

**Location**: Line 4981

**Signature**:
```typescript
export const finite: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Description**: Ensures the number is finite (excludes NaN, +Infinity, -Infinity).

**Example**:
```typescript
const FiniteNumber = S.Number.pipe(S.finite())

// Or use the built-in class
class Finite extends S.Finite {}
```

---

#### `nonNaN`

**Location**: Line 5232

**Signature**:
```typescript
export const nonNaN: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Description**: Ensures the number is not NaN.

**Example**:
```typescript
const ValidNumber = S.Number.pipe(S.nonNaN())

// Or use the built-in class
class NonNaN extends S.NonNaN {}
```

---

### 5.3 Sign Filters

#### `positive`

**Location**: Line 5248

**Signature**:
```typescript
export const positive: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Implementation**: Alias for `greaterThan(0)`

**Example**:
```typescript
const PositiveNumber = S.Number.pipe(S.positive())

// Or use the built-in class
class Positive extends S.Positive {}
```

---

#### `negative`

**Location**: Line 5257

**Signature**:
```typescript
export const negative: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Implementation**: Alias for `lessThan(0)`

**Example**:
```typescript
const NegativeNumber = S.Number.pipe(S.negative())

// Or use the built-in class
class Negative extends S.Negative {}
```

---

#### `nonPositive`

**Location**: Line 5266

**Signature**:
```typescript
export const nonPositive: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Implementation**: Alias for `lessThanOrEqualTo(0)`

**Example**:
```typescript
const NonPositiveNumber = S.Number.pipe(S.nonPositive())

// Or use the built-in class
class NonPositive extends S.NonPositive {}
```

---

#### `nonNegative`

**Location**: Line 5275

**Signature**:
```typescript
export const nonNegative: <S extends Schema.Any>(
  annotations?: Annotations.Filter<Schema.Type<S>>
) => <A extends number>(self: S & Schema<A, Schema.Encoded<S>, Schema.Context<S>>) => filter<S>
```

**Implementation**: Alias for `greaterThanOrEqualTo(0)`

**Example**:
```typescript
const NonNegativeNumber = S.Number.pipe(S.nonNegative())

// Or use the built-in class
class NonNegative extends S.NonNegative {}
```

---

## 6. BigInt Filters

Schema provides equivalent filters for `bigint` types:

- `greaterThanBigInt` - Equivalent to `greaterThan` for bigint
- `greaterThanOrEqualToBigInt` - Equivalent to `greaterThanOrEqualTo` for bigint
- `lessThanBigInt` - Equivalent to `lessThan` for bigint
- `lessThanOrEqualToBigInt` - Equivalent to `lessThanOrEqualTo` for bigint
- `betweenBigInt` - Equivalent to `between` for bigint
- `positiveBigInt` - Equivalent to `positive` for bigint
- `negativeBigInt` - Equivalent to `negative` for bigint
- `nonPositiveBigInt` - Equivalent to `nonPositive` for bigint
- `nonNegativeBigInt` - Equivalent to `nonNegative` for bigint (line 5658)

---

## 7. BigDecimal Filters

Schema provides filters for `BigDecimal` types:

- `greaterThanBigDecimal`
- `greaterThanOrEqualToBigDecimal`
- `lessThanBigDecimal`
- `lessThanOrEqualToBigDecimal`
- `betweenBigDecimal`
- `positiveBigDecimal`
- `negativeBigDecimal`
- `nonPositiveBigDecimal`
- `nonNegativeBigDecimal` (line 8108)

---

## 8. Pattern: Generating Predicates from Schemas

### Schema-to-Predicate Conversion

Effect Schema provides a powerful pattern for converting schemas into runtime predicates:

```typescript
import * as S from "effect/Schema"

// Define a schema
const UserSchema = S.Struct({
  id: S.Number,
  name: S.String,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.int(), S.between(0, 150))
})

// Generate type guard
const isUser = S.is(UserSchema)

// Generate assertion
const assertsUser = S.asserts(UserSchema)

// Generate validators
const validateUser = S.validate(UserSchema)
const validateUserEither = S.validateEither(UserSchema)
const validateUserSync = S.validateSync(UserSchema)
```

### Composing Multiple Predicates

```typescript
import * as S from "effect/Schema"
import * as F from "effect/Function"

// Define base schemas with filters
const PositiveInt = S.Number.pipe(
  S.int({ identifier: "Int" }),
  S.positive({ identifier: "Positive" })
)

const EmailString = S.String.pipe(
  S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { identifier: "Email" })
)

// Compose into complex schema
const UserRegistration = S.Struct({
  userId: PositiveInt,
  email: EmailString,
  age: S.Number.pipe(S.int(), S.between(18, 120))
})

// Single type guard validates all predicates
const isValidRegistration = S.is(UserRegistration)
```

---

## 9. Runtime Type Checking Patterns

### Pattern 1: Guard-based Branching

```typescript
import * as S from "effect/Schema"

const NumberSchema = S.Number

function processValue(value: unknown): string {
  const isNumber = S.is(NumberSchema)

  if (isNumber(value)) {
    return `Number: ${value * 2}`
  }
  return "Not a number"
}
```

---

### Pattern 2: Assertion-based Flow

```typescript
import * as S from "effect/Schema"

const UserSchema = S.Struct({
  id: S.Number,
  name: S.String
})

const assertsUser = S.asserts(UserSchema)

function processUser(data: unknown) {
  assertsUser(data)
  // TypeScript knows data is { id: number; name: string }
  console.log(`User ${data.id}: ${data.name}`)
}
```

---

### Pattern 3: Effect-based Validation Pipeline

```typescript
import * as S from "effect/Schema"
import * as Effect from "effect/Effect"

const validateInput = S.validate(S.Struct({
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.int(), S.between(0, 150))
}))

const program = Effect.gen(function*() {
  const input = yield* validateInput({
    email: "user@example.com",
    age: 25
  })

  // input is validated
  yield* processValidatedInput(input)
})
```

---

### Pattern 4: Either-based Error Handling

```typescript
import * as S from "effect/Schema"
import * as E from "effect/Either"
import * as F from "effect/Function"

const validateEmail = S.validateEither(
  S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
)

function handleEmailValidation(input: unknown) {
  return F.pipe(
    validateEmail(input),
    E.match({
      onLeft: (error) => `Invalid email: ${error.message}`,
      onRight: (email) => `Valid email: ${email}`
    })
  )
}
```

---

## 10. Advanced Patterns

### Custom Filter with Path-based Errors

```typescript
import * as S from "effect/Schema"

const UserSchema = S.Struct({
  password: S.String,
  confirmPassword: S.String
}).pipe(
  S.filter((data) => {
    if (data.password !== data.confirmPassword) {
      return {
        path: ["confirmPassword"],
        message: "Passwords do not match"
      }
    }
    return undefined
  })
)
```

---

### Async Validation with filterEffect

```typescript
import * as S from "effect/Schema"
import * as Effect from "effect/Effect"

const checkEmailAvailability = (email: string): Effect.Effect<boolean> =>
  Effect.succeed(email !== "taken@example.com")

const UniqueEmailSchema = S.String.pipe(
  S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  S.filterEffect((email) =>
    Effect.gen(function*() {
      const available = yield* checkEmailAvailability(email)
      return available ? undefined : "Email already in use"
    })
  )
)
```

---

### Branded Types with Filters

```typescript
import * as S from "effect/Schema"
import * as B from "effect/Brand"

type UserId = number & B.Brand<"UserId">
const UserId = B.nominal<UserId>()

const UserIdSchema = S.Number.pipe(
  S.int(),
  S.positive(),
  S.transform(
    S.Number,
    {
      strict: true,
      decode: (n) => S.ParseResult.succeed(UserId(n)),
      encode: (userId) => S.ParseResult.succeed(userId as number)
    }
  )
)
```

---

## 11. Integration with effect/Predicate Module

Schema predicates integrate seamlessly with `effect/Predicate`:

```typescript
import * as S from "effect/Schema"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

// Schema-based predicate
const isPositiveNumber = S.is(S.Number.pipe(S.positive()))

// Compose with Predicate utilities
const isEvenPositiveNumber = P.and(
  isPositiveNumber,
  (n: number) => n % 2 === 0
)

// Use in filter operations
const numbers = [1, 2, 3, 4, 5, 6, -1, -2]
const evenPositiveNumbers = F.pipe(
  numbers,
  A.filter(isEvenPositiveNumber)
)
// Result: [2, 4, 6]
```

---

## 12. Summary Table: All Predicate Functions

| Category | Function | Purpose | Location |
|----------|----------|---------|----------|
| **Type Guards** | `is` | Generate type guard from schema | L477/PR:L664 |
| | `asserts` | Generate assertion from schema | L426/PR:L677 |
| | `isSchema` | Check if value is a Schema | L666 |
| | `isPropertySignature` | Check if value is PropertySignature | L1859 |
| **Validation** | `validate` | Validate to Effect | L626 |
| | `validateEither` | Validate to Either | L639 |
| | `validateSync` | Synchronous validation (throws) | L488/PR:L611 |
| | `validateOption` | Validate to Option | L482/PR:L620 |
| | `validatePromise` | Validate to Promise | L652 |
| **Core Filters** | `filter` | Create custom refinement | L3695 |
| | `filterEffect` | Create async refinement | L3744 |
| **String Filters** | `minLength` | Minimum string length | L4323 |
| | `maxLength` | Maximum string length | L4291 |
| | `length` | Exact or range length | L4357 |
| | `pattern` | Regex pattern match | L4396 |
| | `startsWith` | String prefix check | L4431 |
| | `endsWith` | String suffix check | L4462 |
| | `lowercased` | All lowercase | L4526 |
| | `uppercased` | All uppercase | L4559 |
| | `capitalized` | First char uppercase | L4592 |
| **Number Filters** | `greaterThan` | Exclusive minimum | L5012 |
| | `greaterThanOrEqualTo` | Inclusive minimum | L5045 |
| | `lessThan` | Exclusive maximum | L5136 |
| | `lessThanOrEqualTo` | Inclusive maximum | L5167 |
| | `between` | Range check | L5200 |
| | `int` | Safe integer check | L5105 |
| | `finite` | Finite number check | L4981 |
| | `nonNaN` | Not NaN check | L5232 |
| | `positive` | Greater than 0 | L5248 |
| | `negative` | Less than 0 | L5257 |
| | `nonPositive` | Less than or equal to 0 | L5266 |
| | `nonNegative` | Greater than or equal to 0 | L5275 |
| **BigInt Filters** | `*BigInt` variants | All number filters for bigint | Various |
| **BigDecimal Filters** | `*BigDecimal` variants | All number filters for BigDecimal | Various |

---

## 13. Key Takeaways

1. **Schema-first Validation**: Define schemas once, generate multiple predicate forms (`is`, `asserts`, `validate`)

2. **Type Safety**: All predicates are fully type-safe and integrate with TypeScript's type system

3. **Composability**: Filters compose via `pipe`, allowing complex validation logic from simple predicates

4. **Error Reporting**: Rich error information with paths, messages, and structured parse issues

5. **Async Support**: `filterEffect` enables async validation within the schema definition

6. **Performance**: Type guards (`is`) are optimized for runtime checks with exact mode by default

7. **Integration**: Seamless integration with `effect/Predicate` and other Effect modules

---

## References

- **Source Files**:
  - `/tmp/effect/packages/effect/src/Schema.ts` (10,914 lines)
  - `/tmp/effect/packages/effect/src/ParseResult.ts`
  - `/node_modules/effect/dist/dts/Schema.d.ts`

- **Related Modules**:
  - `effect/Predicate` - Core predicate utilities
  - `effect/SchemaAST` - Abstract syntax tree for schemas
  - `effect/ParseResult` - Parsing and validation results

- **Documentation**:
  - Effect Schema official docs: https://effect.website/docs/schema/introduction
  - Standard Schema spec: https://standardschema.dev/
