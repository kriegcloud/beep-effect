# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tooling

- When tools are not directly available in `$PATH`, prefix commands with `direnv exec .` (e.g. `direnv exec . pnpm check`, `direnv exec . pnpm lint`)

- For dependency management see @contributor-docs/dependency-management.md

##  CLI Commands
- `direnv exec . pnpm lint` / `direnv exec .pnpm lint:fix` to run the linting checks
- `direnv exec . pnpm test` to run the tests
  - Some tests can take a while to run.
- `direnv exec . pnpm build` to build the TypeScript code
- `direnv exec . pnpm check` to run the type checks
- ... and more

## Project Structure & Architecture

This monorepo follows a Vertical Slice Architecture with a hexagonal/clean flavor. Each slice owns its domain and exposes use cases via application ports. Infrastructure adapters implement those ports. Cross-slice sharing occurs only via shared/common modules.

### Technology Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Effect Platform HTTP API
- **Database**: Postgres with `drizzle-orm`, `@effect/sql-postgres`, `@effect/sql` & `@effect/sql-drizzle`
- **Authentication**: `better-auth`

### Code Style
- Uses Biome for linting and formatting (monorepo configuration)
- Line width: 120 characters, 2-space indentation
- Single quotes for JavaScript/TypeScript

### TypeScript Configuration
- Strict mode enabled
- Effect patterns preferred (Effect.fn over Effect.gen)

### Monorepo layout (top-level)
- `apps/` — application surfaces (e.g., `web`, `server`, `mcp`)
- `packages/` — vertical slices and shared libs
  - Slices: `iam/*`, `wms/*` (layers: `domain`, `application`, `api`, `db`, `ui`, `tables`)
  - Cross-cutting: `shared/*`, `common/*`, `adapters/*`, `persistence/*`, `ai/*`, `email/*`, `env/*`, `ui/*`
- `tooling/*` — repo scripts, config, testkit

See [tsconfig.base.json](tsconfig.base.json) path aliases (e.g., `@beep/iam-domain`, `@beep/wms-application`, `@beep/shared-*`, `@beep/*`, `@/*`) for authoritative module boundaries.

### Layering & allowed imports (per slice S)
- `S/domain` — Entities, Value Objects, Domain Events, domain services.
  - May import: `@beep/shared-domain`, `@beep/common/*` (pure utilities/types)
  - Must NOT import: `S/application`, `S/api`, `S/db`, `S/ui`, other slices' code
- `S/application` — Use cases, orchestrations, and ports (interfaces).
  - May import: `S/domain`, `@beep/shared-*`, `@beep/common/*`
  - Must NOT import: `S/api`, `S/db`, `S/ui`, other slices directly
- `S/api` — HTTP/RPC handlers/controllers; wiring to app use cases.
  - May import: `S/application`, `S/domain`, `@beep/shared-*`
  - Should NOT import: `S/db` directly (go through application ports)
- `S/db` — Repository/DAO implementations; persistence adapters.
  - May import: `S/domain` (types), `S/application` ports (to implement), `@beep/persistence/*`
  - Must NOT invoke `S/application` use cases (no upward dependency)
- `S/ui` — UI components/state for the slice (if applicable).
  - For app-specific UI (e.g., Next.js), prefer `apps/web` with `@/*` alias; import slice via `@beep/S-application` facades, not domain internals
- `S/tables` — DB schema/table definitions for the slice.
  - May be referenced by `S/db`; keep models/types separated from domain Entities when necessary

### Cross-slice rules
- No direct imports between slices (e.g., `iam-*` -> `wms-*`). Use `@beep/shared-*` or `@beep/common/*` for shared types/utilities.
- If a genuine cross-slice use case emerges, elevate shared abstractions to `packages/shared/*` or compose at the app layer.

### Ports & adapters
- Define application ports (interfaces) in `S/application`.
- Implement them in infrastructure packages (`S/db`, `packages/adapters/*`, app layers).
- Handlers/controllers (`S/api` or `apps/*`) depend on application use cases, not on `db` directly.

### When adding a feature
1. Start in `S/domain` (entities/VOs/events).
2. Define use cases and ports in `S/application`.
3. Implement adapters in `S/db`, `packages/adapters/*`, or app-layer code.
4. Expose API in `S/api` and UI in `apps/web` (via `@/*`) or `S/ui` if library UI.
5. Update path aliases if a new package is added ([tsconfig.base.json](tsconfig.base.json)), and wire tasks in [turbo.json](turbo.json) if needed.

### Testing strategy
- Unit tests colocated within each package ([vitest.workspace.ts](vitest.workspace.ts) includes `packages/**`).
- Integration/e2e at the app layer (`apps/*`).
- Prefer testing use cases through application facades; mock adapters via ports.

### Conventions & guardrails
- Effect-first FP is encouraged; preserve pure domain logic and deterministic use cases.
- Keep domain free of IO concerns; isolate IO in adapters.
- Maintain strict TypeScript types; follow Biome lint rules.
- Use `direnv exec . pnpm <task>` for commands; e.g., `build`, `check`, `lint:fix`, `test`.
- Do not add cross-slice imports or leak infrastructure into domain/application.
- Prefer new shared abstractions in `packages/shared/*` over ad-hoc cross-slice imports.

### Enforcement cues for AI assistants
- Respect path aliases and layering; never import `db` from `api` or `ui` from `domain`.
- For infrastructure needs, define/extend a port in `S/application` and implement it in an adapter.
- For shared code, place in `@beep/shared-*` or `@beep/common/*`, not another slice.
- Keep new packages wired in [pnpm-workspace.yaml](pnpm-workspace.yaml) and [turbo.json](turbo.json) as needed.

### Effect-Specific Patterns
# always use the `effect-mcp` tool when dealing with effect code
#### effect module imports
single character import modules
```typescript
// for `effect/Schema`
import * as S from "effect/Schema";
// for `effect/Array`
import * as A from "effect/Array";
// for `effect/Option`
import * as O from "effect/Option";
// for `effect/Function`
import * as F from "effect/Function";
// for `@effect/sql/Model`
import * as M from "@effect/sql/Model";
```
All other modules always import from the module directly as a namespace
```typescript
import * as Effect from "effect/Effect";
import * as Path from "@effect/platform/Path";
import * as Data from "effect/Data";
```

#### Sequential Operations (Effect.fn preferred)
```typescript
// Use Effect.fn for sequential operations
const program = Effect.fn(function* () {
  const user = yield* getUser(id)
  const profile = yield* getProfile(user.profileId)
  return { user, profile }
})
```

#### Error Handling
```typescript
// Use Data.TaggedError for custom errors
class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly id: string
}> {}

// Use Effect.tryPromise for Promise integration
const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: () => prisma.user.findUniqueOrThrow({ where: { id } }),
    catch: () => new UserNotFound({ id })
  })
```

#### Testing with @effect/vitest

**Use @effect/vitest for Effect code:**
- Import pattern: `import { assert, describe, it } from "@effect/vitest"`
- Test pattern: `it.effect("description", () => Effect.fn(function*() { ... }))`
- **FORBIDDEN**: Never use `expect` from vitest in Effect tests - use `assert` methods

#### Correct it.effect Pattern

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("UserService", () => {
  it.effect("should fetch user successfully", () =>
    Effect.fn(function* () {
      const user = yield* fetchUser("123")

      // Use assert methods, NOT expect
      assert.strictEqual(user.id, "123")
      assert.deepStrictEqual(user.profile, expectedProfile)
      assert.isTrue(user.active)
    }))
})
```


## Implementation Patterns

The project includes comprehensive pattern documentation for future reference and consistency:

### Pattern Directory
- **Location**: `contributor-docs/patterns/`
- **Purpose**: Detailed documentation of all implementation patterns used in the project
- **Usage**: Reference material for maintaining consistency and best practices

### Available Patterns
- [layer-composition](contributor-docs/patterns/layer-composition.md): Layer-based dependency injection patterns 
- [@effect/platform/HttpApi](contributor-docs/patterns/@effect-platform-HttpApi.md): HTTP API definition and implementation patterns
- [generic-testing](contributor-docs/patterns/generic-testing.md): General testing patterns with @effect/vitest
- [effect/Utils](contributor-docs/patterns/effect-Utils.md): Utils is particularly valuable for testing infrastructure, game development, simulation applications, and any scenario requiring deterministic behavior or sophisticated development tooling.
- [effect/Types](contributor-docs/patterns/effect-Types.md): The Types module is particularly valuable when building type-safe APIs, configuration systems, plugin architectures, and any application requiring advanced type manipulations. It bridges the gap between TypeScript's type system and practical application development, providing battle-tested utilities for common type-level programming tasks.
- [effect/Tuple](contributor-docs/patterns/effect-Tuple.md): Effect's Tuple module provides type-safe, functional operations for fixed-length heterogeneous data structures, enabling elegant solutions for coordinate systems, configuration management, and result pairing patterns.
- [effect/Trie](contributor-docs/patterns/effect-Trie.md): Trie excels when you need fast prefix matching, autocomplete functionality, or efficient storage of hierarchical string data like file paths, URLs, or multi-level configuration keys.
- [effect/Symbol](contributor-docs/patterns/effect-Symbol.md): Use Symbol when you need unique identifiers for services, events, feature flags, or any scenario where collision-free identification is critical to application correctness and maintainability.
- [effect/Struct](contributor-docs/patterns/effect-Struct.md): Use the Struct module when you need clean, maintainable object manipulation in functional pipelines, especially for data transformation layers, API response formatting, and configuration processing workflows.
- [effect/String](contributor-docs/patterns/effect-String.md): Effect's String module is ideal for applications requiring robust text processing, from simple form validation to complex content management systems and internationalized applications.
- [effect/Scope](contributor-docs/patterns/effect-Scope.md): Scope is essential for any Effect application that manages external resources like database connections, file handles, network sockets, or any other system resources that require explicit cleanup. It transforms error-prone manual resource management into automatic, reliable, and composable patterns.
- [effect/Schema](contributor-docs/patterns/effect-Schema.md): Schema excels in scenarios requiring data validation at runtime boundaries - API endpoints, form submissions, database operations, and configuration parsing. Its declarative API and powerful features make it an essential tool for any Effect-based application.
- [effect/SchemaAST](contributor-docs/patterns/effect-SchemaAST.md): SchemaAST is essential when you need to build tools that work with schemas dynamically, analyze schema structure at runtime, or create metadata-driven applications that adapt based on schema definitions.
- [effect/Schedule](contributor-docs/patterns/effect-Schedule.md): Use Schedule when you need sophisticated retry logic, periodic task execution, rate limiting, or any time-based operation that goes beyond simple timeouts.
- [effect/Runtime](contributor-docs/patterns/effect-Runtime.md): Runtime provides the execution environment and dependency injection system for building modular, testable, and maintainable Effect applications.
- [effect/RegExp](contributor-docs/patterns/effect-RegExp.md): The RegExp module excels when building secure text processing systems, user input validation, content analysis tools, and any application requiring safe, composable regex operations with robust error handling.
- [effect/Ref](contributor-docs/patterns/effect-Ref.md): Ref is essential when you need mutable state that must remain consistent across concurrent operations, making it perfect for counters, caches, connection pools, metrics collection, and any scenario where shared mutable state is required in a concurrent environment.
- [effect/RedBlackTree](contributor-docs/patterns/effect-RedBlackTree.md): RedBlackTree is ideal when you need predictable performance for sorted data operations, frequent range queries, or maintaining ordered collections with high update rates.
- [effect/Redacted](contributor-docs/patterns/effect-Redacted.md): Use Redacted whenever your application handles sensitive data like passwords, API keys, database connection strings, authentication tokens, or any other confidential information that should never appear in logs or be accidentally exposed.
- [effect/Record](contributor-docs/patterns/effect-Record.md): Use Record when you need to transform, filter, aggregate, or manipulate object data in a type-safe, functional manner. It's particularly valuable for configuration management, data processing pipelines, state management, and any scenario where you're working with key-value structured data.
- [effect/Random](contributor-docs/patterns/effect-Random.md): Random provides deterministic, composable random generation for building reproducible, testable applications with controlled randomness.
- [effect/Pretty](contributor-docs/patterns/effect-Pretty.md): Pretty provides a powerful foundation for readable, consistent data formatting across Effect applications. By integrating deeply with Schema definitions, it eliminates the need for manual formatting logic while providing extensive customization capabilities.
- [effect/Predicate](contributor-docs/patterns/effect-Predicate.md): Use Effect Predicate when you need robust, type-safe boolean logic that can be composed, tested, and reused across your application. It's particularly valuable for validation, filtering, access control, and any scenario where you need to make boolean decisions about your data.
- [effect/Pipeable](contributor-docs/patterns/effect-Pipeable.md): Use Pipeable when building data processing pipelines, creating fluent APIs, or any scenario requiring clean function composition with maintained type safety.
- [effect/ParseResult](contributor-docs/patterns/effect-ParseResult.md): ParseResult provides type-safe, composable, and effect-aware parsing for TypeScript applications with deep integration into the Effect ecosystem.
- [effect/Order](contributor-docs/patterns/effect-Order.md): Order provides composable, type-safe comparison operations for Effect applications. It enables complex sorting logic through simple, reusable building blocks that can be combined and transformed as needed.
- [effect/Ordering](contributor-docs/patterns/effect-Ordering.md): Ordering provides functional, composable tools for working with comparison results and building complex decision logic. It transforms scattered conditional logic into clear, type-safe, and reusable comparison operations.
- [effect/Option](contributor-docs/patterns/effect-Option.md): Use Option when you need to handle missing data, optional configurations, partial results from searches, or any scenario where values might legitimately be absent. It transforms defensive programming into declarative, type-safe code that's both more reliable and easier to read.
- [effect/Number](contributor-docs/patterns/effect-Number.md): Use Number when you need reliable numeric operations, financial calculations, statistical analysis, or any application where numeric precision and safety are critical requirements.
- [effect/Match](contributor-docs/patterns/effect-Match.md): Match provides **type-safe pattern matching**, **exhaustive case analysis**, and **composable conditional logic** for TypeScript applications using Effect.
- [effect/ManagedRuntime](contributor-docs/patterns/effect-ManagedRuntime.md): ManagedRuntime provides controlled execution environments with automatic resource management, making it the ideal solution for managing application lifecycle in Effect-based applications.
- [effect/LogSpan](contributor-docs/patterns/effect-LogSpan.md): LogSpan provides **structured timing context**, **hierarchical operation tracking**, and **zero-overhead performance monitoring** for Effect applications.
- [effect/LogLevel](contributor-docs/patterns/effect-LogLevel.md): LogLevel provides structured, performant, and flexible logging control for Effect applications. It enables environment-specific logging configuration, performance-sensitive logging operations, and sophisticated filtering capabilities.
- [effect/Logger](contributor-docs/patterns/effect-Logger.md): Effect's Logger module provides **comprehensive structured logging**, **dynamic performance optimization**, and **flexible integration capabilities** for building observable, maintainable applications.
- [effect/Layer](contributor-docs/patterns/effect-Layer.md): Layer provides a powerful, type-safe approach to dependency injection that solves real-world problems in building modular applications. By using Layer, you gain:
- [effect/JSONSchema](contributor-docs/patterns/effect-JSONSchema.md): JSONSchema provides automatic JSON Schema generation from Effect schemas, eliminating schema drift, reducing maintenance burden, and ensuring type safety across your entire application stack.
- [effect/Iterable](contributor-docs/patterns/effect-Iterable.md): Effect's Iterable module provides **lazy evaluation**, **memory efficiency**, and **composable operations** for processing data sequences of any size.
- [effect/HashSet](contributor-docs/patterns/effect-HashSet.md): Hash provides efficient hashing capabilities that enable high-performance data structures and algorithms in Effect programs. It solves critical problems around object equality, deduplication, and collection performance.
- [effect/Hash](contributor-docs/patterns/effect-Hash.md): Hash is essential when building scalable applications that need efficient data lookup, deduplication, caching, or any scenario where fast equality checking is critical for performance.
- [effect/HashMap](contributor-docs/patterns/effect-HashMap.md): HashMap provides persistent, immutable hash maps with structural sharing and high performance for Effect applications.
- [effect/Function](contributor-docs/patterns/effect-Function.md): Function provides essential utilities for functional programming patterns, enabling clean composition, type-safe currying, and powerful function manipulation in TypeScript.
- [effect/FastCheck](contributor-docs/patterns/effect-FastCheck.md): FastCheck provides comprehensive property-based testing capabilities for Effect applications, enabling automatic generation of test cases that would be impossible to write manually.
- [effect/Exit](contributor-docs/patterns/effect-Exit.md): Exit provides comprehensive Effect completion handling and result analysis for TypeScript applications. It transforms traditional binary success/failure patterns into rich, composable completion states that capture the full context of Effect execution.
- [effect/Equivalence](contributor-docs/patterns/effect-Equivalence.md): Use Equivalence when you need flexible, composable equality comparison that goes beyond JavaScript's native `===` operator, especially for complex data structures, domain-specific business logic, or performance-critical applications requiring custom equality semantics.
- [effect/Equal](contributor-docs/patterns/effect-Equal.md): Use Equal when you need to compare complex data structures, deduplicate data in collections, implement caching systems, or build applications where data identity is determined by content rather than object references. It transforms potentially error-prone equality comparisons into reliable, performant operations that scale with your application's complexity.
- [effect/Either](contributor-docs/patterns/effect-Either.md): Either is ideal for validation logic, parsing operations, business rule enforcement, configuration loading, and any scenario where explicit error handling is preferred over exceptions. It encourages defensive programming while maintaining clean, readable code that's easy to test and reason about.
- [effect/Effect](contributor-docs/patterns/effect-Effect.md): Use Effect when you need reliability, type safety, and composability in your TypeScript applications, especially for API integrations, database operations, and complex business logic with multiple failure modes.
- [effect/Duration](contributor-docs/patterns/effect-Duration.md): Duration excels in scenarios requiring precise time measurements, deadline management, and complex scheduling patterns, making it essential for building reliable distributed systems and time-sensitive applications.
- [effect/Differ](contributor-docs/patterns/effect-Differ.md): Use Differ when you need reliable change tracking, state synchronization, or when building collaborative systems that require conflict resolution and operational transforms.
- [DefaultServices](contributor-docs/patterns/DefaultServices.md): DefaultServices provides seamless access to fundamental runtime services, eliminating boilerplate while maintaining full composability and testability for Effect applications.
- [effect/DateTime](contributor-docs/patterns/effect-DateTime.md): DateTime provides comprehensive date and time handling with timezone awareness, immutable operations, and seamless integration with Effect's ecosystem for building reliable time-based applications.
- [effect/Data](contributor-docs/patterns/effect-Data.md): Data is essential for applications requiring reliable state management, complex domain modeling, or integration with Effect's ecosystem of functional programming tools.
- [effect/Context](contributor-docs/patterns/effect-Context.md): Context shines in scenarios requiring sophisticated service management: multi-tenant applications, microservice architectures, feature flag systems, and any application where clean dependency management is crucial for maintainability and testing.
- [effect/Console](contributor-docs/patterns/effect-Console.md): Use Console when you need controlled, testable console output in Effect applications, particularly for CLI tools, development servers, data processing pipelines, and any application where console output needs to be verified, formatted, or redirected.
- [effect/Config](contributor-docs/patterns/effect-Config.md): Use Effect Config when you need reliable, maintainable configuration management that scales with your application's complexity and provides excellent developer experience throughout the development lifecycle.
- [effect/Clock](contributor-docs/patterns/effect-Clock.md): Clock is essential for building reliable systems with time-based business logic, performance monitoring, and complex scheduling requirements while maintaining comprehensive test coverage.
- [effect/Chunk](contributor-docs/patterns/effect-Chunk.md): Chunk is ideal for applications that process large datasets, require high-performance data transformations, or need memory-efficient collection operations while maintaining functional programming principles.
- [effect/Cause](contributor-docs/patterns/effect-Cause.md): Use Cause when you need to understand not just what went wrong, but exactly how and why your Effect programs fail, enabling you to build more resilient and debuggable applications.
- [effect/Brand](contributor-docs/patterns/effect-Brand.md): Use Brand when you need to distinguish between values of the same type that have different meanings (nominal typing), validate data according to business rules (refined typing), or create robust APIs that prevent common mistakes through type safety.
- [effect/Boolean](contributor-docs/patterns/effect-Boolean.md): The Boolean module excels in scenarios requiring complex conditional logic, such as authorization systems, feature flags, business rule engines, and validation frameworks. By leveraging functional composition and boolean algebra, you can build robust, maintainable logic that scales with your application's complexity.
- [effect/Array](contributor-docs/patterns/effect-Array.md): Whether you're processing e-commerce data, building analytics pipelines, or managing complex application state, Effect's Array module provides the tools to write robust, maintainable code that handles edge cases gracefully and scales with your application's needs.
- [effect/Arbitrary](contributor-docs/patterns/effect-Arbitrary.md): Use Arbitrary when you need thorough testing coverage, want to discover edge cases automatically, or need to generate realistic test data that stays in sync with your evolving schemas.