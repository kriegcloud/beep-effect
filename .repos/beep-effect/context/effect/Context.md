# Context — Agent Context

> Best practices for using `effect/Context` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Context.Tag` | Define service interface | `class MyService extends Context.Tag("MyService")<MyService, Interface>() {}` |
| `Context.GenericTag` | Define generic service | `const Cache = Context.GenericTag<Cache<any>>("Cache")` |
| `yield* Service` | Access service in Effect.gen | `const svc = yield* MyService` |
| `Effect.provideService` | Provide single service | `Effect.provideService(effect, MyService, impl)` |
| `Effect.provide` | Provide Layer (multiple services) | `Effect.provide(effect, AppLive)` |

## Codebase Patterns

### Service Definition with Context.Tag

The standard pattern for defining services in this codebase:

```typescript
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Define error types
class NotFoundError extends S.TaggedError<NotFoundError>()("NotFoundError", {
  resource: S.String,
  id: S.String,
}) {}

// REQUIRED - Service interface using Context.Tag
export class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  {
    findById: (id: string) => Effect.Effect<User, NotFoundError>;
    findAll: () => Effect.Effect<readonly User[]>;
    create: (user: User) => Effect.Effect<User>;
    update: (id: string, user: Partial<User>) => Effect.Effect<User, NotFoundError>;
    delete: (id: string) => Effect.Effect<void, NotFoundError>;
  }
>() {}
```

**Pattern breakdown**:
- Service class extends `Context.Tag`
- First type parameter is the service class itself (for nominal typing)
- Second type parameter is the service interface
- Service methods return `Effect.Effect<Success, Error>`

### Service Interface Design

Design service interfaces with Effect return types:

```typescript
// REQUIRED - All methods return Effects
export class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    signIn: (credentials: Credentials) => Effect.Effect<Session, AuthError>;
    signOut: (sessionId: string) => Effect.Effect<void>;
    refreshSession: (token: string) => Effect.Effect<Session, TokenExpiredError>;
    verifyToken: (token: string) => Effect.Effect<User, InvalidTokenError>;
  }
>() {}

// FORBIDDEN - Mixing Effect and Promise
export class BadAuthService extends Context.Tag("BadAuthService")<
  BadAuthService,
  {
    signIn: (credentials: Credentials) => Promise<Session>;  // Wrong!
    signOut: (sessionId: string) => void;                     // Wrong!
  }
>() {}
```

**Why**: Effect types enable composition, error handling, and dependency injection.

### Accessing Services in Effect.gen

Use `yield*` to access services within `Effect.gen`:

```typescript
const program = Effect.gen(function* () {
  // Access services
  const userRepo = yield* UserRepo;
  const authService = yield* AuthService;
  const logger = yield* Logger;

  // Use services
  yield* logger.info({ message: "Starting authentication" });
  const user = yield* userRepo.findById(userId);
  const session = yield* authService.signIn({ email: user.email });

  return session;
});
```

**Key insight**: `yield* Service` retrieves the service from the Effect context.

### Service Implementation (see Layer.md)

Service implementations are defined as Layers:

```typescript
import * as Layer from "effect/Layer";

// Implementation
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
    findAll: () =>
      Effect.gen(function* () {
        const db = yield* Database;
        return yield* db.query("SELECT * FROM users");
      }),
    create: (user: User) =>
      Effect.gen(function* () {
        const db = yield* Database;
        return yield* db.insert("users", user);
      }),
    update: (id: string, user: Partial<User>) =>
      Effect.gen(function* () {
        const db = yield* Database;
        const existing = yield* db.query("SELECT * FROM users WHERE id = ?", [id]);
        if (!existing) {
          return yield* Effect.fail(new NotFoundError({ resource: "User", id }));
        }
        return yield* db.update("users", id, user);
      }),
    delete: (id: string) =>
      Effect.gen(function* () {
        const db = yield* Database;
        const existing = yield* db.query("SELECT * FROM users WHERE id = ?", [id]);
        if (!existing) {
          return yield* Effect.fail(new NotFoundError({ resource: "User", id }));
        }
        yield* db.delete("users", id);
      }),
  }
);
```

See [Layer.md](./Layer.md) for complete Layer patterns.

### Service Dependencies

Services can depend on other services:

```typescript
// Service A depends on Service B
export const ServiceALive = Layer.effect(
  ServiceA,
  Effect.gen(function* () {
    const serviceB = yield* ServiceB;  // Dependency
    const logger = yield* Logger;      // Dependency

    return {
      doSomething: () =>
        Effect.gen(function* () {
          yield* logger.info({ message: "ServiceA.doSomething called" });
          return yield* serviceB.doOtherThing();
        }),
    };
  })
);

// Compose Layers to provide dependencies
const AppLive = Layer.mergeAll(
  LoggerLive,    // Provides Logger (required by ServiceALive)
  ServiceBLive,  // Provides ServiceB (required by ServiceALive)
  ServiceALive,  // Uses Logger and ServiceB
);
```

**Key insight**: Layer composition automatically resolves service dependencies.

### Platform Services (FileSystem, HttpClient)

Access platform services from `@effect/platform`:

```typescript
import { FileSystem, HttpClient } from "@effect/platform";
import { BunFileSystem, BunHttpClient } from "@effect/platform-bun";

const program = Effect.gen(function* () {
  // Platform services
  const fs = yield* FileSystem.FileSystem;
  const http = yield* HttpClient.HttpClient;

  // Use services
  const exists = yield* fs.exists("/path/to/file");
  const response = yield* http.get("https://api.example.com/data");

  return { exists, response };
}).pipe(
  Effect.provide(
    Layer.mergeAll(
      BunFileSystem.layer,   // Provides FileSystem.FileSystem
      BunHttpClient.layer,   // Provides HttpClient.HttpClient
    )
  )
);
```

**Common platform services**:
- `FileSystem.FileSystem` - File system operations
- `HttpClient.HttpClient` - HTTP requests
- `Path.Path` - Path manipulation
- `Terminal.Terminal` - Terminal I/O

### Test Services with Test Doubles

Replace service implementations with test doubles:

```typescript
import { effect, layer } from "@beep/testkit";
import * as Layer from "effect/Layer";

// Test implementation of UserRepo
const TestUserRepoLive = Layer.succeed(
  UserRepo,
  {
    findById: (id: string) => Effect.succeed({ id, name: "Test User" }),
    findAll: () => Effect.succeed([]),
    create: (user: User) => Effect.succeed(user),
    update: (id: string, user: Partial<User>) => Effect.succeed({ id, ...user } as User),
    delete: (id: string) => Effect.void,
  }
);

// Test Layer
const TestAppLive = Layer.mergeAll(
  TestUserRepoLive,
  // ... other test services
);

// Test suite
layer(TestAppLive)("UserService tests", (it) => {
  it.effect("processes user", () =>
    Effect.gen(function* () {
      const userRepo = yield* UserRepo;  // Gets test implementation
      const user = yield* userRepo.findById("user-123");
      strictEqual(user.name, "Test User");
    })
  );
});
```

**Pattern**: Test Layers provide test doubles instead of real implementations.

### Service with Configuration

Services often need configuration:

```typescript
import * as S from "effect/Schema";

// Configuration schema
class DatabaseConfig extends S.Class<DatabaseConfig>("DatabaseConfig")({
  host: S.String,
  port: S.Number,
  database: S.String,
  username: S.String,
  password: S.Redacted(S.String),
}) {}

// Service depending on configuration
export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* DatabaseConfig;  // Configuration service

    // Create connection pool with config
    const pool = yield* Effect.acquireRelease(
      Effect.sync(() => createConnectionPool(config)),
      (pool) => Effect.sync(() => pool.close())
    );

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

// Provide configuration
const ConfigLive = Layer.succeed(
  DatabaseConfig,
  new DatabaseConfig({
    host: "localhost",
    port: 5432,
    database: "myapp",
    username: "user",
    password: Redacted.make("password"),
  })
);

const AppLive = Layer.mergeAll(
  ConfigLive,       // Provides DatabaseConfig
  DatabaseLive,     // Uses DatabaseConfig
);
```

**Pattern**: Configuration is itself a service provided via Layer.

## Anti-Patterns

### 1. NEVER use global singletons

```typescript
// FORBIDDEN - Global singleton
let globalUserRepo: UserRepo | null = null;

export function getUserRepo(): UserRepo {
  if (!globalUserRepo) {
    globalUserRepo = createUserRepo();
  }
  return globalUserRepo;
}

// REQUIRED - Context-based service
export class UserRepo extends Context.Tag("UserRepo")<
  UserRepo,
  { /* interface */ }
>() {}

export const UserRepoLive = Layer.succeed(UserRepo, implementation);
```

**Why**: Global singletons prevent testing, make dependencies implicit, and break composition.

### 2. NEVER instantiate services directly

```typescript
// FORBIDDEN - Direct instantiation
const userRepo = new UserRepoImpl(db, logger);  // Manual wiring

const program = Effect.gen(function* () {
  const user = yield* userRepo.findById("user-123");
  return user;
});

// REQUIRED - Access via Context
const program = Effect.gen(function* () {
  const userRepo = yield* UserRepo;  // From Context
  const user = yield* userRepo.findById("user-123");
  return user;
}).pipe(Effect.provide(AppLive));
```

**Why**: Direct instantiation bypasses dependency injection and makes testing difficult.

### 3. NEVER mix Promise and Effect in service interfaces

```typescript
// FORBIDDEN - Mixing Promise and Effect
export class BadService extends Context.Tag("BadService")<
  BadService,
  {
    asyncMethod: () => Promise<string>;           // Wrong!
    syncMethod: () => string;                     // Wrong!
    effectMethod: () => Effect.Effect<string>;    // Correct
  }
>() {}

// REQUIRED - All methods return Effects
export class GoodService extends Context.Tag("GoodService")<
  GoodService,
  {
    asyncMethod: () => Effect.Effect<string>;
    syncMethod: () => Effect.Effect<string>;      // Wrap with Effect.sync
    effectMethod: () => Effect.Effect<string>;
  }
>() {}
```

**Why**: Mixing return types breaks Effect composition and error handling.

### 4. NEVER use optional services

```typescript
// FORBIDDEN - Optional service (use Option instead)
export class MaybeService extends Context.Tag("MaybeService")<
  MaybeService,
  {
    doSomething: () => Effect.Effect<string | null>;  // Wrong!
  }
>() {}

// REQUIRED - Use Option for optional values
import * as O from "effect/Option";

export class GoodService extends Context.Tag("GoodService")<
  GoodService,
  {
    doSomething: () => Effect.Effect<O.Option<string>>;  // Correct
  }
>() {}
```

**Why**: `Option` provides type-safe handling of optional values.

### 5. NEVER access services outside Effect.gen

```typescript
// FORBIDDEN - Accessing service outside Effect context
const userRepo = yield* UserRepo;  // Only works inside Effect.gen!

function processUser(id: string) {
  const user = userRepo.findById(id);  // Wrong! userRepo not in scope
  return user;
}

// REQUIRED - Access services inside Effect.gen
function processUser(id: string) {
  return Effect.gen(function* () {
    const userRepo = yield* UserRepo;  // Access inside Effect.gen
    const user = yield* userRepo.findById(id);
    return user;
  });
}
```

**Why**: Services only exist within Effect context. Accessing them outside Effect.gen causes runtime errors.

## Related Modules

- [Layer.md](./Layer.md) - Service implementations and composition
- [Effect.md](./Effect.md) - Using services in Effects
- [Schema.md](./Schema.md) - Service configuration schemas
- `.claude/rules/effect-patterns.md` - Complete service patterns

## Source Reference

[.repos/effect/packages/effect/src/Context.ts](../../.repos/effect/packages/effect/src/Context.ts)
