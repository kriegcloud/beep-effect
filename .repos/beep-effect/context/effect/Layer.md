# Layer — Agent Context

> Best practices for using `effect/Layer` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Layer.succeed` | Create Layer from value | `Layer.succeed(MyService, implementation)` |
| `Layer.effect` | Create Layer from Effect | `Layer.effect(MyService, Effect.gen(...))` |
| `Layer.mergeAll` | Compose multiple Layers | `Layer.mergeAll(LayerA, LayerB, LayerC)` |
| `Layer.provide` | Provide dependencies to Layer | `Layer.provide(MyLayer, DependencyLayer)` |
| `Layer.provideMerge` | Merge and provide dependencies | `Layer.provideMerge(MyLayer, DependencyLayer)` |
| `Effect.provide` | Provide Layer to Effect | `Effect.provide(myEffect, AppLayer)` |
| `Layer.unwrapEffect` | Create Layer from Effect returning Layer | `Layer.unwrapEffect(Effect.gen(...))` |

## Codebase Patterns

### Layer Composition with Layer.mergeAll

The primary pattern for composing Layers in this codebase:

```typescript
import * as Layer from "effect/Layer";
import { BunContext, BunFileSystem } from "@effect/platform-bun";

// REQUIRED - Compose all required Layers
export const AppLive = Layer.mergeAll(
  BunFileSystem.layer,      // Provides FileSystem.FileSystem
  DatabaseLive,             // Provides Database service
  AuthServiceLive,          // Provides AuthService
  LoggerLive,               // Provides Logger
);

// Usage in Effect
const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const db = yield* Database;
  const auth = yield* AuthService;
  // ... use services
}).pipe(Effect.provide(AppLive));
```

**Key insight**: `Layer.mergeAll` automatically resolves dependencies between Layers.

### Service Layer Pattern

Define service implementation as a Layer:

```typescript
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

// Service interface (see Context.md)
export class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  {
    findById: (id: string) => Effect.Effect<User, NotFoundError>;
    create: (user: User) => Effect.Effect<User>;
  }
>() {}

// REQUIRED - Implementation as Layer
export const UserRepoLive = Layer.succeed(
  UserRepo,
  {
    findById: (id: string) =>
      Effect.gen(function* () {
        const db = yield* Database;
        const user = yield* db.query("SELECT * FROM users WHERE id = ?", [id]);
        if (!user) {
          return yield* Effect.fail(new NotFoundError({ resource: "User", id }));
        }
        return user;
      }),
    create: (user: User) =>
      Effect.gen(function* () {
        const db = yield* Database;
        return yield* db.insert("users", user);
      }),
  }
);
```

**Pattern**: Service Layer provides service implementation to Context.Tag.

### Layer with Dependencies

Create Layer that depends on other services:

```typescript
// Layer that requires Database and Logger
export const UserRepoLive = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const db = yield* Database;       // Dependency
    const logger = yield* Logger;     // Dependency

    return {
      findById: (id: string) =>
        Effect.gen(function* () {
          yield* logger.info({ message: "Finding user", id });
          const user = yield* db.query("SELECT * FROM users WHERE id = ?", [id]);
          return user;
        }),
      create: (user: User) =>
        Effect.gen(function* () {
          yield* logger.info({ message: "Creating user", userId: user.id });
          return yield* db.insert("users", user);
        }),
    };
  })
);

// Compose with dependencies
export const AppLive = Layer.mergeAll(
  DatabaseLive,     // Provides Database (required by UserRepoLive)
  LoggerLive,       // Provides Logger (required by UserRepoLive)
  UserRepoLive,     // Uses Database and Logger
);
```

**Key insight**: `Layer.effect` allows accessing other services during Layer construction.

### Platform Layers (Bun/Node)

ALWAYS include platform Layers for services like FileSystem, HttpClient:

```typescript
import { BunContext, BunFileSystem, BunHttpClient } from "@effect/platform-bun";

// REQUIRED - Platform layers for Bun runtime
export const CommandLive = Layer.mergeAll(
  BunFileSystem.layer,   // Provides FileSystem.FileSystem
  BunHttpClient.layer,   // Provides HttpClient.HttpClient
  BunContext.layer,      // Provides platform context
  // ... application layers
);
```

**Common platform Layers**:
- `BunFileSystem.layer` - File system access
- `BunHttpClient.layer` - HTTP client
- `BunContext.layer` - Platform context (path, env, etc.)
- `BunRuntime.layer` - Bun-specific runtime features

### Test Layers for Integration Tests

Define test-specific Layers with test doubles:

```typescript
import { effect, layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as TestContext from "effect/TestContext";

// Test implementation of Database
const TestDatabaseLive = Layer.succeed(
  Database,
  {
    query: (sql: string) => Effect.succeed([]),  // Test stub
    insert: (table: string, data: unknown) => Effect.succeed(data),
  }
);

// Test Layer composition
const TestAppLive = Layer.mergeAll(
  TestDatabaseLive,
  LoggerLive,
  UserRepoLive,
);

// Test suite using Layer
layer(TestAppLive)("UserRepo tests", (it) => {
  it.effect("finds user by id", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepo;
      const user = yield* repo.findById("user-123");
      strictEqual(user.id, "user-123");
    })
  );
});
```

**Pattern**: Use `layer()` from `@beep/testkit` to share expensive resources across tests.

### Layer.provide vs Effect.provide

Understand when to use each:

```typescript
// Effect.provide - Provide Layer to Effect (most common)
const program = Effect.gen(function* () {
  const repo = yield* UserRepo;
  return yield* repo.findById("user-123");
}).pipe(Effect.provide(AppLive));

// Layer.provide - Provide dependencies to a Layer
const UserRepoLive = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const db = yield* Database;
    return { /* ... */ };
  })
).pipe(Layer.provide(DatabaseLive));  // Satisfy Database dependency

// Common pattern: merge dependencies instead
const AppLive = Layer.mergeAll(
  DatabaseLive,      // UserRepoLive will use this
  UserRepoLive,
);
```

**Guideline**: Prefer `Layer.mergeAll` over explicit `Layer.provide` for better composability.

### Resource Management with Layer.scoped

Use `Layer.scoped` for resources requiring cleanup:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Database connection with cleanup
export const DatabaseLive = Layer.scoped(
  Database,
  Effect.gen(function* () {
    // Acquire resource
    const pool = yield* Effect.acquireRelease(
      Effect.sync(() => createConnectionPool()),
      (pool) => Effect.sync(() => pool.close())
    );

    // Return service implementation
    return {
      query: (sql: string) => Effect.gen(function* () {
        const conn = yield* Effect.sync(() => pool.getConnection());
        return yield* Effect.tryPromise({
          try: () => conn.query(sql),
          catch: error => new QueryError({ sql, cause: String(error) })
        });
      }),
    };
  })
);
```

**Pattern**: `Layer.scoped` ensures cleanup happens when the Layer is released.

## Anti-Patterns

### 1. NEVER create monolithic Layers

```typescript
// FORBIDDEN - Kitchen sink Layer
export const AppLive = Layer.effect(
  App,
  Effect.gen(function* () {
    const db = yield* Database;
    const fs = yield* FileSystem.FileSystem;
    const http = yield* HttpClient.HttpClient;
    // ... 50 more services

    return {
      db,
      fs,
      http,
      userRepo: { /* ... */ },
      authService: { /* ... */ },
      // ... 50 more things
    };
  })
);

// REQUIRED - Granular Layers composed with mergeAll
export const AppLive = Layer.mergeAll(
  DatabaseLive,
  BunFileSystem.layer,
  BunHttpClient.layer,
  UserRepoLive,
  AuthServiceLive,
  // ... compose individual Layers
);
```

**Why**: Granular Layers are easier to test, mock, and reason about.

### 2. NEVER manually pass dependencies

```typescript
// FORBIDDEN - Manual dependency threading
const createUserRepo = (db: Database, logger: Logger) => ({
  findById: (id: string) => {
    logger.info({ message: "Finding user", id });
    return db.query("SELECT * FROM users WHERE id = ?", [id]);
  },
});

const userRepo = createUserRepo(db, logger);  // Manual wiring!

// REQUIRED - Layer-based dependency injection
export const UserRepoLive = Layer.effect(
  UserRepo,
  Effect.gen(function* () {
    const db = yield* Database;       // Automatic injection
    const logger = yield* Logger;     // Automatic injection
    return { /* ... */ };
  })
);
```

**Why**: Layers handle dependency resolution automatically.

### 3. NEVER provide Layer multiple times

```typescript
// FORBIDDEN - Duplicate provides (causes multiple initializations)
const program = Effect.gen(function* () {
  const a = yield* ServiceA;
  return a;
}).pipe(
  Effect.provide(AppLive),
  Effect.provide(AppLive)  // Wrong! AppLive initialized twice
);

// REQUIRED - Provide once at boundary
const program = Effect.gen(function* () {
  const a = yield* ServiceA;
  const b = yield* ServiceB;
  return { a, b };
}).pipe(Effect.provide(AppLive));  // Single provide
```

### 4. NEVER mix Layer.mergeAll with Layer.provide

```typescript
// CONFUSING - Mixing composition strategies
const AppLive = Layer.mergeAll(
  DatabaseLive.pipe(Layer.provide(ConfigLive)),  // Confusing!
  UserRepoLive,
);

// REQUIRED - Flatten all dependencies
const AppLive = Layer.mergeAll(
  ConfigLive,       // Explicit dependency
  DatabaseLive,     // Uses ConfigLive automatically
  UserRepoLive,
);
```

**Why**: `Layer.mergeAll` already handles dependency resolution. Explicit `Layer.provide` obscures the dependency graph.

### 5. NEVER use Effect.runPromise with Layer

```typescript
// FORBIDDEN - runPromise loses Layer context
const AppLive = Layer.effect(
  App,
  Effect.gen(function* () {
    const data = yield* Effect.runPromise(fetchData());  // Wrong!
    return { data };
  })
);

// REQUIRED - Stay in Effect context
const AppLive = Layer.effect(
  App,
  Effect.gen(function* () {
    const data = yield* fetchData();  // Effect stays in context
    return { data };
  })
);
```

## Related Modules

- [Context.md](./Context.md) - Defining service interfaces
- [Effect.md](./Effect.md) - Using services in Effects
- [Schema.md](./Schema.md) - Validating configuration for Layers
- `.claude/rules/effect-patterns.md` - Complete Layer patterns

## Source Reference

[.repos/effect/packages/effect/src/Layer.ts](../../.repos/effect/packages/effect/src/Layer.ts)
