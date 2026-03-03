# JSDoc Documentation Patterns - Effect Library

## 🎯 OVERVIEW

Comprehensive JSDoc documentation patterns used throughout the beep-effect repository, ensuring consistent, practical,
and
compilable examples for all APIs.

## 🚨 CRITICAL REQUIREMENTS

### Documentation Standards

- **MANDATORY**: All JSDoc examples must compile via `bun run docgen`
- **ZERO TOLERANCE**: Even pre-existing docgen errors must be fixed
- **FORBIDDEN**: Removing examples to fix compilation - always fix type issues properly
- **MANDATORY**: Use proper Effect patterns in all examples
- **FORBIDDEN**: `any` types, type assertions, or unsafe patterns in examples

## 📝 STANDARD JSDOC STRUCTURE

### Complete Function Documentation Template

````typescript
/**
 * Brief description of what the function does in one line.
 *
 * More detailed explanation if needed, including:
 * - Important behavior notes
 * - Performance characteristics
 * - Common use cases
 *
 * @example
 * ```ts-morph
 * import { ModuleName, Effect } from "effect"
 *
 * // Clear description of what this example demonstrates
 * const example = ModuleName.functionName(params)
 *
 * // Usage in Effect context
 * const program = Effect.gen(function* () {
 *   const result = yield* example
 *   console.log(result) // Expected output
 *   return result
 * })
 * ```
 *
 * @example
 * ```ts-morph
 * import { ModuleName } from "effect"
 *
 * // Different use case or advanced usage
 * const advancedExample = ModuleName.functionName(
 *   complexParameters,
 *   withOptions
 * )
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
export const functionName = <A>(param: A): ModuleName<A> => { /* implementation */ }
````

### Module-Level Documentation

````typescript
/**
 * The `Array` module provides utility functions for working with arrays in TypeScript.
 *
 * This module offers a comprehensive set of operations for creating, transforming,
 * and querying arrays while maintaining immutability and type safety.
 *
 * ## Key Features
 *
 * - **Immutable operations**: All functions return new arrays without mutating the original
 * - **Type-safe**: Full TypeScript support with proper generic constraints
 * - **Pipeable**: All functions work seamlessly with Effect's pipe function
 * - **Performance optimized**: Efficient implementations for common operations
 *
 * @example
 * ```ts-morph
 * import { Effect } from "effect";
 * import * as A from "effect/Array";
 *
 * // Creating and transforming arrays
 * const numbers = A.range(1, 5) // [1, 2, 3, 4, 5]
 * const doubled = A.map(numbers, x => x * 2) // [2, 4, 6, 8, 10]
 *
 * // Functional composition with pipe
 * const result = pipe(
 *   [1, 2, 3, 4, 5],
 *   A.filter(x => x % 2 === 0),
 *   A.map(x => x * x),
 *   A.reduce(0, (acc, x) => acc + x)
 * ) // 20
 * ```
 *
 * @since 2.0.0
 **/
````

## 🔧 IMPORT PATTERN STANDARDS

### Core Effect Library Imports

````typescript
/**
 * @example
 * ```ts-morph
 * import { Effect, Console } from "effect"
 * import * as A from "effect/Array"
 *
 * const program = Effect.gen(function* () {
 *   const items = A.make(1, 2, 3)
 *   yield* Console.log(`Items: ${A.join(items, ", ")}`)
 *   return items
 * })
 * ```
 */
````

### Schema Module Imports (CRITICAL)

````typescript
/**
 * @example
 * ```ts-morph
 * // ✅ CORRECT - Import Schema from main "effect" package
 * import { Effect } from "effect"
 * import * as S from "effect/Schema";
 * const Person = S.Struct({
 *   name: S.String,
 *   age: S.Number
 * })
 *
 * const program = Effect.gen(function* () {
 *   const person = yield* S.decodeUnknownEffect(Person)({
 *     name: "Alice",
 *     age: 30
 *   })
 *   return person
 * })
 * ```
 */
````

### Mixed Usage Imports

````typescript
/**
 * @example
 * ```ts-morph
 * import { Effect } from "effect"
 * import { NodeHttpServer } from "@effect/platform-node";
 * import * as S from "effect/Schema";
 *
 *
 * const server = Effect.gen(function* () {
 *   const httpServer = yield* NodeHttpServer.make(app, { port: 3000 })
 *   yield* Effect.log("Server started on port 3000")
 *   return httpServer
 * })
 * ```
 */
````

## 🏗️ EXAMPLE CONTENT PATTERNS

### Utility Examples (Constructor Style)

````typescript
/**
 * Creates a new Array from the provided elements.
 *
 * @example
 * ```ts-morph
 * import * as A from "effect"
 *
 * // Creating arrays with different types
 * const numbers = A.make(1, 2, 3) // Array<number>
 * const strings = A.make("a", "b", "c") // Array<string>
 * const mixed = A.make(1, "hello", true) // Array<string | number | boolean>
 *
 * console.log(numbers) // [1, 2, 3]
 * ```
 *
 * @example
 * ```ts-morph
 * import * as A from "effect/Array";
 * import { HashSet } from "effect";
 *
 * // Empty array creation
 * const empty = A.empty<number>() // Array<number>
 * const fromIterable = A.fromIterable(HashSet.fromIterable([1, 2, 3])) // [1, 2, 3]
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
````

### Utility Examples (Combinator Style)

````typescript
/**
 * Transforms each element of the array using the provided function.
 *
 * @example
 * ```ts-morph
 * import * as A from "effect/Array"
 *
 * // Data-first usage
 * const numbers = [1, 2, 3, 4, 5]
 * const squared = A.map(numbers, x => x * x)
 * console.log(squared) // [1, 4, 9, 16, 25]
 * ```
 *
 * @example
 * ```ts-morph
 * import * as A from "effect/Array"
 * import { pipe } from "effect"
 *
 * // Data-last usage (pipeable)
 * const result = pipe(
 *   [1, 2, 3],
 *   A.map(x => x * 2),
 *   A.filter(x => x > 4),
 *   A.reduce(0, (sum, x) => sum + x)
 * )
 * console.log(result) // 6
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
````

### Effect Pattern Examples

````typescript
/**
 * Performs an effectful operation on each element of the array.
 *
 * @example
 * ```ts-morph
 * import { Effect, Console } from "effect"
 * import * as A from "effect/Array"
 * const logEachItem = (items: ReadonlyArray<string>) =>
 *   A.forEach(items, item =>
 *     Console.log(`Processing: ${item}`)
 *   )
 *
 * const program = Effect.gen(function* () {
 *   const items = ["apple", "banana", "cherry"]
 *   yield* logEachItem(items)
 *   return "Done"
 * })
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
````

### Error Handling Examples

````typescript
/**
 * Validates array elements and fails fast on first error.
 *
 * @example
 * ```ts-morph
 * import { Effect, Data } from "effect";
 * import * as A from "effect/Array";
 * import * as S from "effect/Schema";
 * import { LiteralKit } from "@beep/schema";
 * import { $SomePackageId } from "@beep/identity/packages";
 *
 * const $I = $SomePackageId.create("relative/path/to/file"); // define canonical IdentityComposer helper for annotations & path composition
 *
 * // Basic tagged error - has _tag for catchTag discrimination
 * class ValidationError extends S.TaggedErrorClass<ValidationError>($I`ValidationError`)(
 *   "ValidationError",
 *   {
 *     field: S.String,
 *     message: S.String
 *   },
 *   $I.annote( // Annotate with IdentityComposer to tersly add `identifier` & `title` annotations
 *     "ValidationError",
 *     {
 *       description: "A validation error."
 *     }
 *   )
 * ) {
 * }
 *
 * const validatePositive = (n: number) =>
 *   n > 0
 *     ? Effect.succeed(n)
 *     : Effect.fail(new ValidationError({
 *         value: n,
 *         message: "Must be positive"
 *       }))
 *
 * const program = Effect.gen(function* () {
 *   const numbers = [1, 2, -3, 4]
 *   const validated = yield* A.validate(numbers, validatePositive)
 *   return validated
 * })
 *
 * // This will fail with ValidationError for -3
 * ```
 *
 * @since 2.0.0
 * @category Validation
 */
````

## 🏷️ CATEGORY ANNOTATION PATTERNS

### Category Naming Convention

**IMPORTANT**: Use the exact TS taxonomy value in PascalCase. Do not use lowercase legacy names.

### TS Category Taxonomy (Canonical Values)

```typescript
@category DomainModel
@category DomainLogic
@category PortContract
@category Validation
@category Utility
@category UseCase
@category Presentation
@category DataAccess
@category Integration
@category Configuration
@category CrossCutting
@category Uncategorized
```

### Category Usage Examples

```typescript
/**
 * Generic helper constructor.
 * @category Utility
 */
export const make = ...

/**
 * Generic transformation helper.
 * @category Utility
 */
export const map = ...

/**
 * Boundary parsing and validation.
 * @category Validation
 */
export const parseInput = ...

/**
 * Stable contract or model definition.
 * @category DomainModel
 */
export interface Array<A> ...

/**
 * External SDK / API adapter.
 * @category Integration
 */
export const PaymentGatewayClient = ...
```

## 🧪 ADVANCED EXAMPLE PATTERNS

### Type-Level Function Examples

````typescript
/**
 * Type-level utility for extracting the success type from an Effect.
 *
 * @example
 * ```ts-morph
 * import { Effect } from "effect"
 *
 * // Demonstrate type extraction using conditional types
 * type UserEffect = Effect.Effect<{ name: string; age: number }, Error, never>
 *
 * // Extract the success type
 * type User = Effect.Effect.Success<UserEffect>
 * // Result: { name: string; age: number }
 *
 * // Use in function signatures
 * const processUser = (user: User) => {
 *   console.log(`Processing ${user.name}, age ${user.age}`)
 * }
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
````

### Advanced Usage Examples

````typescript
/**
 * Advanced function for performance-critical scenarios.
 *
 * @example
 * ```ts-morph
 * import * as A from "effect/Array"
 * import {Order} from "effect"
 * // Note: This is an advanced function for specific performance use cases
 * // Most users should use simpler alternatives like:
 * const simpleSort = A.sort(Order.number)
 * const simpleFilter = A.filter(x => x > 0)
 *
 * // Advanced usage (when fine-grained control is needed):
 * const optimizedProcessing = A.unsafePerformanceOperation(
 *   largeDataset,
 *   {
 *     batchSize: 1000,
 *     concurrency: 4
 *   }
 * )
 * ```
 *
 * @since 2.0.0
 * @category Utility
 */
````

### Complex Integration Examples

````typescript
/**
 * Integrates with multiple Effect modules for complex workflows.
 *
 * @example
 * ```ts-morph
 * import { Effect, Schedule, Layer, Console } from "effect"
 * import { HttpClient } from "@effect/platform"
 * import * as S from "effect/Schema";
 *
 * const User = S.Struct({
 *   id: S.Number,
 *   name: S.String,
 *   email: S.String
 * })
 *
 * const fetchUserWithRetry = (id: number) =>
 *   Effect.gen(function* () {
 *     const client = yield* HttpClient.HttpClient
 *
 *     const response = yield* client.get(`/users/${id}`).pipe(
 *       Effect.retry(Schedule.exponential("100 millis", 2.0).pipe(
 *         Schedule.compose(Schedule.recurs(3))
 *       )),
 *       Effect.timeout("5 seconds")
 *     )
 *
 *     const user = yield* S.decodeUnknownEffect(User)(response.json)
 *     yield* Console.log(`Fetched user: ${user.name}`)
 *
 *     return user
 *   })
 *
 * // Usage with proper layer provision
 * const program = fetchUserWithRetry(123).pipe(
 *   Effect.provide(Layer.mergeAll(
 *     HttpClient.layer,
 *     Console.layer
 *   ))
 * )
 * ```
 *
 * @since 2.0.0
 * @category Integration
 */
````

## 🔍 COMMON DOCUMENTATION ISSUES TO AVOID

### ❌ Problematic Patterns

````typescript
// ⚠️ Mixed import examples (wrong + canonical)
/**
 * @example
 * ```ts-morph
 * import { Schema } from "@effect/schema"      // Wrong package (deprecated)
 * import * as S from "effect/Schema"           // Canonical namespace alias
 * import { Schema } from "effect/schema"       // Wrong - use "effect" instead
 * ```
 */

// ❌ WRONG - Using any types
/**
 * @example
 * ```ts-morph
 * const data: any = someValue // Never use any in examples
 * ```
 */

// ❌ WRONG - Type assertions
/**
 * @example
 * ```ts-morph
 * const value = something as unknown as SomeType // Avoid assertions
 * ```
 */

// ❌ WRONG - Declare patterns
/**
 * @example
 * ```ts-morph
 * declare const Service: any // Don't use declare in examples
 * ```
 */
````

### ✅ Correct Patterns

````typescript
// ✅ CORRECT - Proper imports and types
/**
 * @example
 * ```ts-morph
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const User = S.Struct({
 *   name: S.String,
 *   age: S.Number
 * })
 *
 * const program = Effect.gen(function* () {
 *   const user = yield* S.decodeUnknownEffect(User)({
 *     name: "Alice",
 *     age: 30
 *   })
 *   return user
 * })
 * ```
 */

// ✅ CORRECT - Real service usage
/**
 * @example
 * ```ts-morph
 * import { Effect, Layer } from "effect"
 * import { Console } from "effect/logging"
 *
 * const program = Effect.gen(function* () {
 *   yield* Console.log("Hello, World!")
 *   return "Done"
 * }).pipe(
 *   Effect.provide(Console.layer)
 * )
 * ```
 */
````

## 🎯 SUCCESS CRITERIA

### Quality JSDoc Checklist

- [ ] Brief, clear description of functionality
- [ ] At least one practical, working example
- [ ] Proper imports using correct module paths
- [ ] Examples compile with `bun run docgen`
- [ ] No `any` types or type assertions
- [ ] Appropriate @category annotation
- [ ] @since version annotation
- [ ] Multiple examples for complex functions
- [ ] Integration examples for advanced use cases
- [ ] Real-world usage patterns demonstrated

This comprehensive JSDoc approach ensures that Effect library documentation provides practical, reliable examples that help developers understand and correctly use the APIs.
