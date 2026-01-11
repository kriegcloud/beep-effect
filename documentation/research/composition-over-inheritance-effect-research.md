# Effect Composition Over Inheritance - Research Report

## Executive Summary

Effect provides powerful patterns for composition over inheritance through three main mechanisms:
1. **`Data` constructors** for immutable value objects with built-in equality
2. **`Pipeable` interface** for method chaining without prototype pollution
3. **`Context.Tag` and `Layer`** for service composition and dependency injection

These patterns eliminate the need for traditional class inheritance by favoring composition, structural typing, and functional abstractions. The result is more modular, testable, and type-safe code.

## Problem Statement

How can we achieve composition over inheritance in the beep-effect codebase using Effect's native patterns? Specifically:
- How to create reusable, composable data types without class hierarchies?
- How to compose behaviors from multiple sources?
- How to create type-safe discriminated unions (ADTs)?
- How to avoid inheritance for service patterns?

## Research Sources

- **Effect Documentation**: Data types, Layer composition, Context management
- **Source Code Analysis**:
  - `effect/src/Data.ts` - Immutable data constructors
  - `effect/src/Pipeable.ts` - Method-free composition
  - `effect/src/Context.ts` - Service patterns
  - `effect/src/Effect.ts` - Effect.Service helper
- **Ecosystem Libraries**: Pattern validation in beep-effect codebase

---

## 1. Immutable Data Structures with `effect/Data`

### Pattern Overview

The `Data` module provides constructors for creating **immutable, structurally-equal** value objects. This replaces class-based modeling with functional composition.

### Key Constructors

#### `Data.struct` - Plain Objects
```typescript
import * as Data from "effect/Data"
import * as Equal from "effect/Equal"

// Create immutable structs
const alice = Data.struct({ name: "Alice", age: 30 })
const bob = Data.struct({ name: "Alice", age: 30 })

// Structural equality (not reference equality)
Equal.equals(alice, bob) // true
```

**Trade-off**: Shallow comparison by default - nested objects need `Data.struct` too:
```typescript
// ❌ Nested plain objects won't be equal
const user1 = Data.struct({
  name: "Alice",
  address: { city: "NYC" }
})
const user2 = Data.struct({
  name: "Alice",
  address: { city: "NYC" }
})
Equal.equals(user1, user2) // false (address compared by reference)

// ✅ Nest Data.struct for deep equality
const user1 = Data.struct({
  name: "Alice",
  address: Data.struct({ city: "NYC" })
})
const user2 = Data.struct({
  name: "Alice",
  address: Data.struct({ city: "NYC" })
})
Equal.equals(user1, user2) // true
```

#### `Data.case` - Constructor Functions
```typescript
import * as Data from "effect/Data"

interface Person {
  readonly name: string
  readonly age: number
}

// Create a constructor
const Person = Data.case<Person>()

const alice = Person({ name: "Alice", age: 30 })
const bob = Person({ name: "Bob", age: 40 })
```

**When to use**: When you need a factory function for creating values.

#### `Data.tagged` - Discriminated Unions
```typescript
interface Person {
  readonly _tag: "Person"
  readonly name: string
}

// Automatically adds _tag field
const Person = Data.tagged<Person>("Person")

const alice = Person({ name: "Alice" })
// Result: { _tag: "Person", name: "Alice" }
```

**When to use**: Building ADTs (algebraic data types) for pattern matching.

#### `Data.Class` - Class-Based (Still Structural)
```typescript
import * as Data from "effect/Data"

class Person extends Data.Class<{ name: string }> {
  get upperName() {
    return this.name.toUpperCase()
  }
}

const alice = new Person({ name: "Alice" })
alice.upperName // "ALICE"
```

**Trade-off**:
- ✅ Allows custom methods and getters
- ❌ Still uses `new` keyword
- ✅ No inheritance - composition via properties

#### `Data.TaggedClass` - Tagged Class
```typescript
class Person extends Data.TaggedClass("Person")<{ name: string }> {
  get upperName() {
    return this.name.toUpperCase()
  }
}

const alice = new Person({ name: "Alice" })
// Result: Person { name: "Alice", _tag: "Person" }
```

**When to use**: ADTs that need custom methods.

### Composing Data Types

**Example**: Building a complex type from simple parts
```typescript
import * as Data from "effect/Data"

// Base types
interface Address {
  readonly street: string
  readonly city: string
}

interface ContactInfo {
  readonly email: string
  readonly phone: string
}

interface Person {
  readonly name: string
  readonly address: Address
  readonly contact: ContactInfo
}

// Constructors
const Address = Data.case<Address>()
const ContactInfo = Data.case<ContactInfo>()
const Person = Data.case<Person>()

// Composition
const alice = Person({
  name: "Alice",
  address: Address({ street: "123 Main", city: "NYC" }),
  contact: ContactInfo({ email: "alice@example.com", phone: "555-1234" })
})
```

**No inheritance needed** - just compose plain values.

---

## 2. Type-Safe Discriminated Unions with `Data.TaggedEnum`

### Pattern Overview

`Data.TaggedEnum` creates **type-safe ADTs** (sum types) without class hierarchies. This is Effect's answer to traditional inheritance-based polymorphism.

### Basic Usage

```typescript
import * as Data from "effect/Data"

type RemoteData = Data.TaggedEnum<{
  Loading: {}
  Success: { readonly data: string }
  Failure: { readonly reason: string }
}>

const { Loading, Success, Failure } = Data.taggedEnum<RemoteData>()

const state1 = Loading()
const state2 = Success({ data: "test" })
const state3 = Failure({ reason: "not found" })
```

**Generated type** (automatically):
```typescript
type RemoteData =
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Success"; readonly data: string }
  | { readonly _tag: "Failure"; readonly reason: string }
```

### Pattern Matching with `$match` and `$is`

```typescript
const { $match, $is, Loading, Success, Failure } = Data.taggedEnum<RemoteData>()

// Type guards
const isLoading = $is("Loading")
isLoading(Loading()) // true
isLoading(Success({ data: "test" })) // false

// Pattern matching
const matcher = $match({
  Loading: () => "Loading...",
  Success: ({ data }) => `Success: ${data}`,
  Failure: ({ reason }) => `Error: ${reason}`
})

matcher(Success({ data: "hello" })) // "Success: hello"
```

**Replaces**: Class hierarchies with abstract methods.

### Generics with `TaggedEnum.WithGenerics`

```typescript
import * as Data from "effect/Data"

type RemoteData<Success, Failure> = Data.TaggedEnum<{
  Loading: {}
  Success: { data: Success }
  Failure: { reason: Failure }
}>

interface RemoteDataDefinition extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: RemoteData<this["A"], this["B"]>
}

const { Loading, Success, Failure } = Data.taggedEnum<RemoteDataDefinition>()

// Type-safe instantiation
const loading = Loading() // RemoteData<never, never>
const success = Success({ data: 42 }) // RemoteData<number, never>
const failure = Failure({ reason: "not found" }) // RemoteData<never, string>
```

**When to use**: Reusable ADTs that work with different types.

---

## 3. Pipeable Interface for Composition

### Pattern Overview

`Pipeable` adds a `.pipe()` method to types **without modifying prototypes**. This enables functional composition in a readable, left-to-right style.

### How It Works

```typescript
// From effect/src/Pipeable.ts
export interface Pipeable {
  pipe<A>(this: A): A
  pipe<A, B>(this: A, ab: (_: A) => B): B
  pipe<A, B, C>(this: A, ab: (_: A) => B, bc: (_: B) => C): C
  // ... up to 20 overloads
}

export const Prototype: Pipeable = {
  pipe() {
    return pipeArguments(this, arguments)
  }
}
```

**Key insight**: The `pipe()` method is **not inherited** - it's added via `Object.setPrototypeOf` to a shared prototype.

### Creating Pipeable Types

```typescript
import * as Pipeable from "effect/Pipeable"

class MyType extends Pipeable.Class() {
  constructor(readonly value: number) {
    super()
  }
}

const instance = new MyType(5)
  .pipe(
    (x) => new MyType(x.value * 2),
    (x) => new MyType(x.value + 10)
  )
// Result: MyType { value: 20 }
```

**Trade-off**:
- ✅ No prototype pollution
- ✅ Tree-shakeable
- ❌ Still uses classes (but only for data, not behavior)

### Effect's Built-In Pipeable Types

All Effect types (Effect, Stream, Layer, etc.) are pipeable:

```typescript
import * as Effect from "effect/Effect"

const program = Effect.succeed(5).pipe(
  Effect.map((x) => x * 2),
  Effect.flatMap((x) => Effect.succeed(x + 10)),
  Effect.tap((x) => Effect.log(`Result: ${x}`))
)
```

**Replaces**: Method chaining (fluent interfaces) with functional composition.

---

## 4. Service Composition with `Context.Tag` and `Layer`

### Pattern Overview

Effect uses **tags** to identify services and **layers** to construct them. This replaces inheritance-based DI with compositional DI.

### Traditional Inheritance Anti-Pattern

```typescript
// ❌ DON'T: Leaking dependencies in service interface
class Database extends Context.Tag("Database")<
  Database,
  {
    // Dependencies leak into the interface
    readonly query: (sql: string) => Effect.Effect<unknown, never, Config | Logger>
  }
>() {}
```

**Problem**: Tests must provide `Config` and `Logger` even when mocking `Database`.

### Effect's Solution: Layers

```typescript
import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"

// 1. Define service tags (NO dependencies in interface)
class Config extends Context.Tag("Config")<
  Config,
  { readonly getConfig: Effect.Effect<{ logLevel: string; connection: string }> }
>() {}

class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (message: string) => Effect.Effect<void> }
>() {}

class Database extends Context.Tag("Database")<
  Database,
  { readonly query: (sql: string) => Effect.Effect<unknown> } // ✅ No Config | Logger
>() {}

// 2. Define layers with dependencies
const ConfigLive = Layer.succeed(Config, {
  getConfig: Effect.succeed({ logLevel: "INFO", connection: "..." })
})

const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const config = yield* Config // Dependency at construction time
    return {
      log: (message) =>
        Effect.gen(function* () {
          const { logLevel } = yield* config.getConfig
          console.log(`[${logLevel}] ${message}`)
        })
    }
  })
)

const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* Config
    const logger = yield* Logger
    return {
      query: (sql) =>
        Effect.gen(function* () {
          yield* logger.log(`Executing: ${sql}`)
          const { connection } = yield* config.getConfig
          return { result: `Results from ${connection}` }
        })
    }
  })
)
```

### Layer Composition

#### Merging Layers (Parallel)
```typescript
// Combine outputs, union inputs
const AppConfigLive = Layer.merge(ConfigLive, LoggerLive)
// Type: Layer<Config | Logger, never, Config>
```

#### Composing Layers (Sequential)
```typescript
// Provide dependencies
const MainLayer = Layer.provide(DatabaseLive, AppConfigLive)
// Type: Layer<Database, never, Config>

// Or chain further
const FinalLayer = Layer.provide(MainLayer, ConfigLive)
// Type: Layer<Database, never, never>
```

### Effect.Service Helper (Simplified Pattern)

```typescript
import * as Effect from "effect/Effect"

// Single-step service definition
class Logger extends Effect.Service<Logger>()("Logger", {
  accessors: true,
  effect: Effect.gen(function* () {
    const config = yield* Config
    return {
      log: (message: string) =>
        Effect.sync(() => console.log(`[${config.prefix}] ${message}`))
    }
  }),
  dependencies: [Config.Default]
}) {}

// Auto-generated:
// - Logger.Default (Layer)
// - Logger.log (accessor function)
```

**When to use**: Simple services with straightforward dependencies.

---

## Recommended Approach for beep-effect

### 1. Value Objects: Use `Data.Class` or `Data.TaggedClass`

```typescript
import * as Data from "effect/Data"
import * as S from "effect/Schema"

// Domain model
class EmailAddress extends Data.TaggedClass("EmailAddress")<{
  readonly value: string
}> {
  static fromString(input: string) {
    return S.decodeUnknown(S.String.pipe(S.pattern(/^[^@]+@[^@]+$/)))(input).pipe(
      Effect.map((value) => new EmailAddress({ value }))
    )
  }
}
```

### 2. ADTs: Use `Data.TaggedEnum`

```typescript
type UserEvent = Data.TaggedEnum<{
  UserRegistered: { readonly email: string; readonly timestamp: number }
  EmailVerified: { readonly userId: string }
  PasswordChanged: { readonly userId: string; readonly timestamp: number }
}>

const { UserRegistered, EmailVerified, PasswordChanged } = Data.taggedEnum<UserEvent>()
```

### 3. Services: Use `Effect.Service` with Layers

```typescript
class UserRepository extends Effect.Service<UserRepository>()("UserRepository", {
  effect: Effect.gen(function* () {
    const db = yield* Database
    return {
      findById: (id: string) => db.query(`SELECT * FROM users WHERE id = ?`, [id]),
      save: (user: User) => db.query(`INSERT INTO users ...`, [user])
    }
  }),
  dependencies: [Database.Default]
}) {}
```

### 4. Behavior Composition: Use Functions + pipe

```typescript
// Instead of inheritance:
// class BaseValidator { validate() {} }
// class EmailValidator extends BaseValidator { ... }

// Use composition:
const validateEmail = (email: string) =>
  Effect.gen(function* () {
    yield* validateFormat(email)
    yield* validateDomain(email)
    yield* validateMxRecord(email)
  })

const validateFormat = (email: string) =>
  S.decodeUnknown(S.String.pipe(S.pattern(/^[^@]+@[^@]+$/)))(email)

// Compose validators
const validateUser = (user: User) =>
  Effect.all([
    validateEmail(user.email),
    validatePassword(user.password),
    validateUsername(user.username)
  ])
```

---

## Alternative Approaches Considered

### Option 1: Traditional Class Inheritance
```typescript
class BaseRepository<T> {
  async find(id: string): Promise<T | null> { ... }
  async save(entity: T): Promise<void> { ... }
}

class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> { ... }
}
```

**Rejected because**:
- Dependencies leak into method signatures
- Hard to mock for testing
- Violates Effect's composition patterns
- Breaks tree-shaking

### Option 2: Mixins
```typescript
function Timestamped<T extends Constructor>(Base: T) {
  return class extends Base {
    createdAt = Date.now()
  }
}
```

**Rejected because**:
- TypeScript mixin types are complex
- Violates Effect's immutability principles
- Not idiomatic in Effect ecosystem

### Option 3: Higher-Order Services
```typescript
const withLogging = <R, E, A>(
  service: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | Logger> =>
  Effect.gen(function* () {
    const logger = yield* Logger
    yield* logger.log("Starting operation")
    const result = yield* service
    yield* logger.log("Operation complete")
    return result
  })
```

**Partially valid**: Good for cross-cutting concerns, but not a replacement for layers.

---

## Integration with beep-effect

### Current State
- `packages/*/domain/`: Mix of classes and interfaces
- `packages/*/server/`: Drizzle repositories with class-based services
- `packages/shared/domain/`: Some use of `Data.TaggedError`

### Migration Path

1. **Phase 1**: Convert errors to `Data.TaggedError`
   ```typescript
   // Before
   export class NotFoundError extends Error {
     constructor(public entityId: string) {
       super(`Entity ${entityId} not found`)
     }
   }

   // After
   export class NotFoundError extends Data.TaggedError("NotFoundError")<{
     readonly entityId: string
   }> {}
   ```

2. **Phase 2**: Convert value objects to `Data.Class`
   ```typescript
   // Before
   export class EmailAddress {
     constructor(readonly value: string) {}
   }

   // After
   export class EmailAddress extends Data.TaggedClass("EmailAddress")<{
     readonly value: string
   }> {}
   ```

3. **Phase 3**: Convert services to `Effect.Service`
   ```typescript
   // Before
   export class UserRepository {
     constructor(private db: Database) {}
     findById(id: string) { ... }
   }

   // After
   export class UserRepository extends Effect.Service<UserRepository>()("UserRepository", {
     effect: Effect.gen(function* () {
       const db = yield* Database
       return {
         findById: (id: string) => db.query(...)
       }
     }),
     dependencies: [Database.Default]
   }) {}
   ```

---

## Critical Rules

1. **Service interfaces MUST NOT require dependencies**
   ```typescript
   // ❌ BAD
   readonly query: (sql: string) => Effect.Effect<Result, Error, Config | Logger>

   // ✅ GOOD
   readonly query: (sql: string) => Effect.Effect<Result, Error>
   ```

2. **Use Layers for dependency construction**
   ```typescript
   // Dependencies declared in Layer, not service interface
   const DatabaseLive = Layer.effect(Database, Effect.gen(function* () {
     const config = yield* Config // Dependency at construction
     const logger = yield* Logger
     // ...
   }))
   ```

3. **Prefer `Data.TaggedEnum` over class hierarchies**
   ```typescript
   // ❌ Avoid
   abstract class Event {}
   class UserRegistered extends Event {}
   class EmailVerified extends Event {}

   // ✅ Prefer
   type Event = Data.TaggedEnum<{
     UserRegistered: { ... }
     EmailVerified: { ... }
   }>
   ```

4. **Use `pipe` for composition, not method chaining**
   ```typescript
   // ❌ Avoid
   repository.findById(id).map(...).flatMap(...)

   // ✅ Prefer
   Effect.pipe(
     repository.findById(id),
     Effect.map(...),
     Effect.flatMap(...)
   )
   ```

---

## References

### Effect Documentation
- [Data types - Data](https://effect.website/docs/data-types/data)
- [Building Pipelines](https://effect.website/docs/getting-started/building-pipelines)
- [Managing Layers](https://effect.website/docs/requirements-management/managing-layers)
- [Yieldable Errors](https://effect.website/docs/error-management/yieldable-errors)

### Source Code
- `effect/src/Data.ts` - Data constructors
- `effect/src/Pipeable.ts` - Pipe implementation
- `effect/src/Context.ts` - Tag and Context
- `effect/src/Layer.ts` - Layer composition
- `effect/src/Effect.ts` - Effect.Service helper

### beep-effect Examples
- `packages/shared/domain/src/errors/db-error/db-error.ts` - TaggedError usage
- `packages/iam/server/src/db/repos/*.repo.ts` - Repository patterns
- `packages/shared/server/src/factories/db-repo.ts` - Factory patterns
