# Effect: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Effect Solves

Modern JavaScript applications need to handle asynchronous operations, manage errors, track dependencies, and compose operations reliably. The traditional Promise/async-await approach quickly becomes unwieldy:

```typescript
// Traditional approach - API call with retry, timeout, and error handling
async function fetchUserWithRetry(userId: string): Promise<User | null> {
  let attempts = 0;
  const maxAttempts = 3;
  const timeout = 5000;
  
  while (attempts < maxAttempts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate the response
      if (!data.id || !data.name || !data.email) {
        throw new Error('Invalid user data');
      }
      
      return data;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Max retries reached:', error);
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
  
  return null;
}

// Using multiple async operations with different error handling
async function createOrder(userId: string, items: Item[]): Promise<Order> {
  try {
    // Need to handle each error differently
    const user = await fetchUserWithRetry(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check inventory for all items
    const availability = await Promise.all(
      items.map(async item => {
        try {
          const stock = await checkInventory(item.id);
          return { item, available: stock >= item.quantity };
        } catch (error) {
          // How do we handle partial failures?
          console.error(`Failed to check inventory for ${item.id}:`, error);
          return { item, available: false };
        }
      })
    );
    
    const unavailable = availability.filter(a => !a.available);
    if (unavailable.length > 0) {
      throw new Error(`Items unavailable: ${unavailable.map(a => a.item.id).join(', ')}`);
    }
    
    // Process payment
    const payment = await processPayment(user.paymentMethod, calculateTotal(items));
    
    // Create order - but what if this fails after payment?
    const order = await createOrderRecord(user.id, items, payment.id);
    
    // Send confirmation email - should this block the order?
    sendConfirmationEmail(user.email, order).catch(error => {
      console.error('Failed to send email:', error);
      // Silent failure - is this what we want?
    });
    
    return order;
  } catch (error) {
    // Generic error handling - loses context
    console.error('Order creation failed:', error);
    throw error;
  }
}
```

This approach leads to:
- **Error Context Loss** - Errors lose their origin and type information
- **Inconsistent Retry Logic** - Each operation needs custom retry implementation
- **No Dependency Injection** - Hard-coded dependencies make testing difficult
- **Resource Management** - Manual cleanup of timeouts, connections, etc.
- **Composition Difficulties** - Hard to combine operations with different error types
- **Silent Failures** - Easy to accidentally ignore errors

### The Effect Solution

Effect provides a powerful computation type that handles async operations, errors, and dependencies in a composable way:

```typescript
import { Effect, Duration, Schedule, Config, Data } from "effect"

// Define errors as distinct types
class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  userId: string
}> {}

class InvalidUserDataError extends Data.TaggedError("InvalidUserDataError")<{
  data: unknown
}> {}

// Define service dependencies
class ApiClient extends Context.Tag("ApiClient")<
  ApiClient,
  {
    readonly baseUrl: string
    readonly fetch: (path: string, options?: RequestInit) => Effect.Effect<Response>
  }
>() {}

// API call with automatic retry, timeout, and typed errors
const fetchUser = (userId: string) =>
  Effect.gen(function* () {
    const api = yield* ApiClient
    
    const response = yield* api
      .fetch(`/users/${userId}`)
      .pipe(
        Effect.timeout(Duration.seconds(5)),
        Effect.retry(
          Schedule.compose(Schedule.exponential(Duration.seconds(1)), Schedule.recurs(3))
        )
      )
    
    if (!response.ok) {
      if (response.status === 404) {
        return yield* Effect.fail(new UserNotFoundError({ userId }))
      }
      return yield* Effect.fail(new HttpError({ status: response.status }))
    }
    
    const data = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new ParseError()
    })
    
    // Validate with Schema
    return yield* Effect.mapError(Schema.decode(UserSchema)(data), () => new InvalidUserDataError({ data }))
  })

// Composable operations with proper error handling
const createOrder = (userId: string, items: Item[]) =>
  Effect.gen(function* () {
    // Fetch user
    const user = yield* fetchUser(userId)
    
    // Check inventory in parallel with proper error handling
    const availability = yield* Effect.forEach(
      items,
      (item) =>
        checkInventory(item.id).pipe(
          Effect.map((stock) => ({ item, available: stock >= item.quantity })),
          Effect.catchTag("InventoryError", () => 
            Effect.succeed({ item, available: false })
          )
        ),
      { concurrency: "unbounded" }
    )
    
    const unavailable = availability.filter(a => !a.available)
    if (unavailable.length > 0) {
      return yield* Effect.fail(
        new ItemsUnavailableError({ items: unavailable.map(a => a.item) })
      )
    }
    
    // Process payment with automatic rollback on failure
    const payment = yield* processPayment(user.paymentMethod, calculateTotal(items))
    
    // Create order with compensation
    const order = yield* createOrderRecord(user.id, items, payment.id).pipe(
      Effect.catchAll(() =>
        // Automatic rollback
        refundPayment(payment.id).pipe(
          Effect.andThen(Effect.fail(new OrderCreationError()))
        )
      )
    )
    
    // Send email without blocking
    yield* sendConfirmationEmail(user.email, order).pipe(
      Effect.catchAll((error) =>
        Effect.logError("Failed to send confirmation email", error)
      ),
      Effect.fork // Run in background
    )
    
    return order
  })
```

### Key Concepts

**Effect<A, E, R>**: The core type representing a computation that can succeed with `A`, fail with `E`, or requires context `R`

**Generator Syntax**: Use `Effect.gen` and `yield*` for readable, sequential code that looks like async/await but with full type safety

**Services & Layers**: Dependency injection system for managing application dependencies and testing

**Error Types**: Model errors as distinct types that can be handled precisely with `catchTag` and `catchTags`

**Scheduling**: Built-in retry policies, delays, and scheduling primitives

**Concurrency**: Safe, composable concurrent operations with automatic resource management

## Basic Usage Patterns

### Creating Effects

```typescript
import { Effect } from "effect"

// From a value
const success = Effect.succeed(42)

// From an error  
const failure = Effect.fail(new Error("Something went wrong"))

// From a synchronous function
const random = Effect.sync(() => Math.random())

// From an asynchronous operation
const delay = Effect.promise(() => 
  new Promise(resolve => setTimeout(() => resolve("done"), 1000))
)

// From a callback-based API
const readFile = (path: string) =>
  Effect.async<string, Error>((resume) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) resume(Effect.fail(err))
      else resume(Effect.succeed(data))
    })
  })
```

### Transforming Effects

```typescript
// Simple transformations - use .pipe
const doubled = Effect.map(success, (n) => n * 2)

// Error transformations - use .pipe
const recovered = failure.pipe(
  Effect.mapError((error) => new CustomError(error.message))
)

// Complex business logic - use Effect.gen + yield*
const program = Effect.gen(function* () {
  const a = yield* Effect.succeed(10)
  const b = yield* Effect.succeed(20)
  const c = yield* Effect.succeed(30)
  return a + b + c
})

// Conditional business logic - use Effect.gen + yield*
const conditionalProgram = Effect.gen(function* () {
  const value = yield* random
  if (value > 0.5) {
    return yield* Effect.succeed("high")
  } else {
    return yield* Effect.fail(new Error("too low"))
  }
})

// Hybrid pattern - business logic with post-processing
const businessWithPostProcessing = Effect.gen(function* () {
  // Core business logic
  const result = yield* computeComplexResult()
  const validated = yield* validateResult(result)
  return validated
}).pipe(
  // Post-processing: error handling and tracing
  Effect.catchTag("ValidationError", (error) => 
    Effect.succeed({ fallback: true, error: error.message })
  ),
  Effect.withSpan("business-operation")
)
```

### Running Effects

```typescript
import { Effect, Runtime } from "effect"

// Simple run that throws on error
const simpleRun = () => {
  const result = Effect.runSync(Effect.succeed(42))
  console.log(result) // 42
}

// Run with error handling
const runWithErrorHandling = async () => {
  const program = Effect.fail(new Error("Oops"))
  
  const result = await Effect.runPromiseExit(program)
  
  if (result._tag === "Success") {
    console.log("Success:", result.value)
  } else {
    console.log("Failure:", result.cause)
  }
}

// Run with custom runtime
const runWithServices = async () => {
  const program = Effect.gen(function* () {
    const api = yield* ApiClient
    return yield* api.fetch("/data")
  })
  
  const runtime = Runtime.defaultRuntime.pipe(
    Runtime.provideService(
      ApiClient,
      { 
        baseUrl: "https://api.example.com",
        fetch: (path) => Effect.tryPromise(() => fetch(path))
      }
    )
  )
  
  const result = await Runtime.runPromise(runtime)(program)
}
```

## Real-World Examples

### Example 1: REST API Client with Authentication

Building a type-safe API client with automatic token refresh and retry logic:

```typescript
import { Effect, Context, Layer, Duration, Schedule, Ref, Data } from "effect"
import { Schema } from "@effect/schema"

// Define API models
const TokenSchema = Schema.Struct({
  access_token: Schema.String,
  refresh_token: Schema.String,
  expires_in: Schema.Number
})
type Token = Schema.Schema.Type<typeof TokenSchema>

const UserSchema = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  role: Schema.Literal("admin", "user")
})
type User = Schema.Schema.Type<typeof UserSchema>

// Define errors
class AuthError extends Data.TaggedError("AuthError")<{
  reason: "invalid_credentials" | "token_expired" | "refresh_failed"
}> {}

class ApiError extends Data.TaggedError("ApiError")<{
  status: number
  message: string
}> {}

// Define service interfaces
class TokenStorage extends Context.Tag("TokenStorage")<
  TokenStorage,
  {
    readonly get: Effect.Effect<Token | null>
    readonly set: (token: Token) => Effect.Effect<void>
    readonly clear: Effect.Effect<void>
  }
>() {}

class HttpClient extends Context.Tag("HttpClient")<
  HttpClient,
  {
    readonly request: <T>(
      url: string,
      options?: RequestInit
    ) => Effect.Effect<T, ApiError>
  }
>() {}

// Authentication service
class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    readonly login: (email: string, password: string) => Effect.Effect<Token, AuthError>
    readonly refresh: (refreshToken: string) => Effect.Effect<Token, AuthError>
    readonly logout: Effect.Effect<void>
  }
>() {}

// Create HTTP client with authentication
const createAuthenticatedClient = Effect.gen(function* () {
  const http = yield* HttpClient
  const auth = yield* AuthService
  const storage = yield* TokenStorage
  
  const makeAuthenticatedRequest = <T>(
    url: string,
    options?: RequestInit
  ): Effect.Effect<T, ApiError | AuthError> =>
    Effect.gen(function* () {
      // Get current token
      const token = yield* storage.get
      
      if (!token) {
        return yield* Effect.fail(new AuthError({ reason: "token_expired" }))
      }
      
      // Make request with token
      const response = yield* http.request<T>(url, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token.access_token}`
        }
      }).pipe(
        Effect.catchTag("ApiError", (error) => {
          if (error.status === 401) {
            // Token expired, try to refresh
            return Effect.gen(function* () {
              const newToken = yield* auth.refresh(token.refresh_token)
              yield* storage.set(newToken)
              
              // Retry with new token
              return yield* http.request<T>(url, {
                ...options,
                headers: {
                  ...options?.headers,
                  Authorization: `Bearer ${newToken.access_token}`
                }
              })
            })
          }
          return Effect.fail(error)
        })
      )
      
      return response
    })
  
  return { request: makeAuthenticatedRequest }
})

// API client layer
const ApiClientLive = Layer.effect(
  AuthService,
  Effect.gen(function* () {
    const http = yield* HttpClient
    const storage = yield* TokenStorage
    
    return AuthService.of({
      login: (email, password) =>
        Effect.gen(function* () {
          const response = yield* http.request<unknown>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" }
          })
          
          const token = yield* Schema.decode(TokenSchema)(response).pipe(
            Effect.mapError(() => new AuthError({ reason: "invalid_credentials" }))
          )
          
          yield* storage.set(token)
          return token
        }),
      
      refresh: (refreshToken) =>
        Effect.gen(function* () {
          const response = yield* http.request<unknown>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refresh_token: refreshToken }),
            headers: { "Content-Type": "application/json" }
          })
          
          return yield* Schema.decode(TokenSchema)(response)
        }).pipe(
          Effect.mapError(() => new AuthError({ reason: "refresh_failed" }))
        ),
      
      logout: storage.clear
    })
  })
)

// User API operations
const UserApi = {
  getCurrentUser: Effect.gen(function* () {
    const client = yield* createAuthenticatedClient
    const response = yield* client.request<unknown>("/users/me")
    return yield* Schema.decode(UserSchema)(response)
  }),
  
  updateUser: (userId: string, updates: Partial<User>) =>
    Effect.gen(function* () {
      const client = yield* createAuthenticatedClient
      const response = yield* client.request<unknown>(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" }
      })
      return yield* Schema.decode(UserSchema)(response)
    }),
  
  listUsers: (params?: { page?: number; limit?: number }) =>
    Effect.gen(function* () {
      const client = yield* createAuthenticatedClient
      const query = new URLSearchParams(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      )
      const response = yield* client.request<unknown>(`/users?${query}`)
      return yield* Schema.decode(Schema.Array(UserSchema))(response)
    })
}

// Usage example
const program = Effect.gen(function* () {
  // Login
  yield* Effect.log("Logging in...")
  const token = yield* AuthService.login("user@example.com", "password")
  
  // Get current user
  yield* Effect.log("Fetching user profile...")
  const user = yield* UserApi.getCurrentUser.pipe(
    Effect.retry(Schedule.exponential(Duration.seconds(1), 2).pipe(
      Schedule.intersect(Schedule.recurs(3))
    ))
  )
  
  yield* Effect.log(`Welcome, ${user.name}!`)
  
  // Update user
  const updated = yield* UserApi.updateUser(user.id, { name: "New Name" })
  
  return updated
})
```

### Example 2: Database Operations with Connection Pooling

Managing database connections with proper resource cleanup and transaction support:

```typescript
import { Effect, Resource, Scope, Queue, Ref, Layer, Data } from "effect"
import { Pool } from "pg"

// Database errors
class DatabaseError extends Data.TaggedError("DatabaseError")<{
  operation: string
  cause: unknown
}> {}

class TransactionError extends Data.TaggedError("TransactionError")<{
  reason: string
}> {}

// Database connection type
interface Connection {
  query: <T>(sql: string, params?: any[]) => Effect.Effect<T[], DatabaseError>
  release: () => Effect.Effect<void>
}

// Transaction context
class Transaction extends Context.Tag("Transaction")<
  Transaction,
  Connection
>() {}

// Database service
class Database extends Context.Tag("Database")<
  Database,
  {
    readonly query: <T>(sql: string, params?: any[]) => Effect.Effect<T[], DatabaseError>
    readonly transaction: <A, E>(
      effect: Effect.Effect<A, E, Transaction>
    ) => Effect.Effect<A, E | TransactionError | DatabaseError>
    readonly withConnection: <A, E>(
      f: (conn: Connection) => Effect.Effect<A, E>
    ) => Effect.Effect<A, E | DatabaseError>
  }
>() {}

// Connection pool implementation
const createConnectionPool = (config: {
  host: string
  port: number
  database: string
  user: string
  password: string
  max: number
}) =>
  Resource.make(
    Effect.sync(() => new Pool(config)),
    (pool) => Effect.promise(() => pool.end())
  )

// Database layer implementation
const DatabaseLive = Layer.scoped(
  Database,
  Effect.gen(function* () {
    const pool = yield* createConnectionPool({
      host: "localhost",
      port: 5432,
      database: "myapp",
      user: "postgres",
      password: "password",
      max: 10
    })
    
    // Helper to run queries
    const runQuery = <T>(
      client: any,
      sql: string,
      params?: any[]
    ): Effect.Effect<T[], DatabaseError> =>
      Effect.tryPromise({
        try: async () => {
          const result = await client.query(sql, params)
          return result.rows
        },
        catch: (error) => new DatabaseError({
          operation: "query",
          cause: error
        })
      })
    
    return Database.of({
      query: <T>(sql: string, params?: any[]) =>
        Effect.scoped(
          Effect.gen(function* () {
            const client = yield* Resource.make(
              Effect.tryPromise({
                try: () => pool.connect(),
                catch: (error) => new DatabaseError({
                  operation: "connect",
                  cause: error
                })
              }),
              (client) => Effect.sync(() => client.release())
            )
            
            return yield* runQuery<T>(client, sql, params)
          })
        ),
      
      transaction: <A, E>(effect: Effect.Effect<A, E, Transaction>) =>
        Effect.scoped(
          Effect.gen(function* () {
            const client = yield* Resource.make(
              Effect.tryPromise({
                try: () => pool.connect(),
                catch: (error) => new DatabaseError({
                  operation: "connect",
                  cause: error
                })
              }),
              (client) => Effect.sync(() => client.release())
            )
            
            // Start transaction
            yield* runQuery(client, "BEGIN")
            
            // Create connection interface
            const connection: Connection = {
              query: (sql, params) => runQuery(client, sql, params),
              release: () => Effect.unit
            }
            
            // Run the effect with transaction
            const result = yield* effect.pipe(
              Effect.provideService(Transaction, connection),
              Effect.catchAll((error) =>
                runQuery(client, "ROLLBACK").pipe(
                  Effect.andThen(Effect.fail(error))
                )
              )
            )
            
            // Commit transaction
            yield* runQuery(client, "COMMIT")
            
            return result
          })
        ),
      
      withConnection: <A, E>(f: (conn: Connection) => Effect.Effect<A, E>) =>
        Effect.scoped(
          Effect.gen(function* () {
            const client = yield* Resource.make(
              Effect.tryPromise({
                try: () => pool.connect(),
                catch: (error) => new DatabaseError({
                  operation: "connect",
                  cause: error
                })
              }),
              (client) => Effect.sync(() => client.release())
            )
            
            const connection: Connection = {
              query: (sql, params) => runQuery(client, sql, params),
              release: () => Effect.unit
            }
            
            return yield* f(connection)
          })
        )
    })
  })
)

// Repository pattern with Effect
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: string) => Effect.Effect<User | null, DatabaseError>
    readonly create: (user: Omit<User, "id">) => Effect.Effect<User, DatabaseError | TransactionError>
    readonly update: (id: string, updates: Partial<User>) => Effect.Effect<User, DatabaseError>
    readonly delete: (id: string) => Effect.Effect<boolean, DatabaseError>
    readonly findByEmail: (email: string) => Effect.Effect<User | null, DatabaseError>
  }
>() {}

const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database
    
    return UserRepository.of({
      findById: (id) =>
        db.query<User>("SELECT * FROM users WHERE id = $1", [id]).pipe(
          Effect.map((rows) => rows[0] || null)
        ),
      
      create: (userData) =>
        db.transaction(
          Effect.gen(function* () {
            const tx = yield* Transaction
            
            // Check if email exists
            const existing = yield* tx.query<{ count: number }>(
              "SELECT COUNT(*) as count FROM users WHERE email = $1",
              [userData.email]
            )
            
            if (existing[0].count > 0) {
              return yield* Effect.fail(new TransactionError({
                reason: "Email already exists"
              }))
            }
            
            // Insert user
            const result = yield* tx.query<User>(
              `INSERT INTO users (email, name, role) 
               VALUES ($1, $2, $3) 
               RETURNING *`,
              [userData.email, userData.name, userData.role]
            )
            
            return result[0]
          })
        ),
      
      update: (id, updates) =>
        db.query<User>(
          `UPDATE users 
           SET name = COALESCE($2, name), 
               email = COALESCE($3, email),
               role = COALESCE($4, role)
           WHERE id = $1
           RETURNING *`,
          [id, updates.name, updates.email, updates.role]
        ).pipe(
          Effect.flatMap((rows) =>
            rows.length > 0
              ? Effect.succeed(rows[0])
              : Effect.fail(new DatabaseError({
                  operation: "update",
                  cause: "User not found"
                }))
          )
        ),
      
      delete: (id) =>
        db.query<{ id: string }>(
          "DELETE FROM users WHERE id = $1 RETURNING id",
          [id]
        ).pipe(
          Effect.map((rows) => rows.length > 0)
        ),
      
      findByEmail: (email) =>
        db.query<User>("SELECT * FROM users WHERE email = $1", [email]).pipe(
          Effect.map((rows) => rows[0] || null)
        )
    })
  })
)

// Usage with proper error handling
const createUserWithProfile = (
  email: string,
  name: string,
  profileData: Record<string, any>
) =>
  Effect.gen(function* () {
    const db = yield* Database
    const userRepo = yield* UserRepository
    
    return yield* db.transaction(
      Effect.gen(function* () {
        // Create user
        const user = yield* userRepo.create({ email, name, role: "user" })
        
        // Create profile in same transaction
        const tx = yield* Transaction
        yield* tx.query(
          `INSERT INTO profiles (user_id, data) VALUES ($1, $2)`,
          [user.id, JSON.stringify(profileData)]
        )
        
        return user
      })
    )
  })
```

### Example 3: Concurrent File Processing with Progress Tracking

Processing multiple files concurrently with progress reporting and error recovery:

```typescript
import { Effect, Stream, Chunk, Ref, PubSub, Fiber, Duration, Data } from "effect"
import * as fs from "fs/promises"
import * as path from "path"

// Define errors
class FileError extends Data.TaggedError("FileError")<{
  path: string
  operation: "read" | "write" | "parse"
  cause: unknown
}> {}

// Progress tracking
interface ProcessingProgress {
  total: number
  processed: number
  succeeded: number
  failed: number
  currentFile?: string
}

// File processor service
class FileProcessor extends Context.Tag("FileProcessor")<
  FileProcessor,
  {
    readonly processFile: (filePath: string) => Effect.Effect<ProcessedFile, FileError>
  }
>() {}

// Progress service
class ProgressTracker extends Context.Tag("ProgressTracker")<
  ProgressTracker,
  {
    readonly update: (update: Partial<ProcessingProgress>) => Effect.Effect<void>
    readonly subscribe: Stream.Stream<ProcessingProgress>
  }
>() {}

// Create progress tracker layer
const ProgressTrackerLive = Layer.effect(
  ProgressTracker,
  Effect.gen(function* () {
    const state = yield* Ref.make<ProcessingProgress>({
      total: 0,
      processed: 0,
      succeeded: 0,
      failed: 0
    })
    
    const pubsub = yield* PubSub.unbounded<ProcessingProgress>()
    
    return ProgressTracker.of({
      update: (update) =>
        Effect.gen(function* () {
          const newState = yield* Ref.updateAndGet(state, (current) => ({
            ...current,
            ...update
          }))
          yield* PubSub.publish(pubsub, newState)
        }),
      
      subscribe: Stream.fromPubSub(pubsub)
    })
  })
)

// File processing implementation
interface ProcessedFile {
  path: string
  size: number
  lines: number
  words: number
  processingTime: number
}

const processTextFile = (filePath: string): Effect.Effect<ProcessedFile, FileError> =>
  Effect.gen(function* () {
    const startTime = Date.now()
    
    // Read file
    const content = yield* Effect.tryPromise({
      try: () => fs.readFile(filePath, "utf-8"),
      catch: (error) => new FileError({
        path: filePath,
        operation: "read",
        cause: error
      })
    })
    
    // Process content
    const lines = content.split("\n").length
    const words = content.split(/\s+/).filter(Boolean).length
    const size = Buffer.byteLength(content)
    
    // Simulate some processing work
    yield* Effect.sleep(Duration.millis(100))
    
    return {
      path: filePath,
      size,
      lines,
      words,
      processingTime: Date.now() - startTime
    }
  })

// Batch file processor with concurrency control
const processFiles = (
  files: string[],
  options: {
    concurrency: number
    onError?: (error: FileError) => Effect.Effect<void>
  }
) =>
  Effect.gen(function* () {
    const progress = yield* ProgressTracker
    const processor = yield* FileProcessor
    
    // Initialize progress
    yield* progress.update({ total: files.length })
    
    // Process files with concurrency limit
    const results = yield* Effect.forEach(
      files,
      (file) =>
        Effect.gen(function* () {
          yield* progress.update({ currentFile: file })
          
          const result = yield* processor.processFile(file).pipe(
            Effect.tap(() =>
              progress.update((current) => ({
                processed: current.processed + 1,
                succeeded: current.succeeded + 1
              }))
            ),
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* progress.update((current) => ({
                  processed: current.processed + 1,
                  failed: current.failed + 1
                }))
                
                if (options.onError) {
                  yield* options.onError(error)
                }
                
                return Effect.fail(error)
              })
            )
          )
          
          return result
        }),
      {
        concurrency: options.concurrency,
        mode: "either" // Continue processing even if some fail
      }
    )
    
    // Clear current file
    yield* progress.update({ currentFile: undefined })
    
    return results
  })

// Stream-based file discovery and processing
const processDirectory = (
  dirPath: string,
  pattern: RegExp = /\.txt$/
) =>
  Effect.gen(function* () {
    const progress = yield* ProgressTracker
    
    // Discover files
    const discoverFiles = Stream.gen(function* () {
      const walk = (dir: string): Effect.Effect<Chunk.Chunk<string>, FileError> =>
        Effect.gen(function* () {
          const entries = yield* Effect.tryPromise({
            try: () => fs.readdir(dir, { withFileTypes: true }),
            catch: (error) => new FileError({
              path: dir,
              operation: "read",
              cause: error
            })
          })
          
          const files = yield* Effect.forEach(
            entries,
            (entry) => {
              const fullPath = path.join(dir, entry.name)
              
              if (entry.isDirectory()) {
                return walk(fullPath)
              } else if (pattern.test(entry.name)) {
                return Effect.succeed(Chunk.of(fullPath))
              } else {
                return Effect.succeed(Chunk.empty<string>())
              }
            },
            { concurrency: "unbounded" }
          )
          
          return Chunk.flatten(files)
        })
      
      const files = yield* walk(dirPath)
      
      for (const file of files) {
        yield* Stream.make(file)
      }
    })
    
    // Process files as they're discovered
    const processStream = discoverFiles.pipe(
      Stream.tap((file) => Effect.log(`Discovered: ${file}`)),
      Stream.mapEffect(
        (file) =>
          FileProcessor.processFile(file).pipe(
            Effect.tap(() =>
              progress.update((current) => ({
                total: current.total + 1,
                processed: current.processed + 1,
                succeeded: current.succeeded + 1
              }))
            ),
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* Effect.logError(`Failed to process ${file}`, error)
                yield* progress.update((current) => ({
                  total: current.total + 1,
                  processed: current.processed + 1,
                  failed: current.failed + 1
                }))
                return Effect.fail(error)
              })
            )
          ),
        { concurrency: 5 }
      ),
      Stream.either // Collect both successes and failures
    )
    
    return yield* Stream.runCollect(processStream)
  })

// Progress monitoring
const monitorProgress = Effect.gen(function* () {
  const progress = yield* ProgressTracker
  
  yield* progress.subscribe.pipe(
    Stream.tap((update) =>
      Effect.log(
        `Progress: ${update.processed}/${update.total} ` +
        `(✓ ${update.succeeded}, ✗ ${update.failed})` +
        (update.currentFile ? ` - Processing: ${update.currentFile}` : "")
      )
    ),
    Stream.runDrain,
    Effect.fork // Run in background
  )
})

// Complete example with graceful shutdown
const fileProcessingPipeline = (directory: string) =>
  Effect.gen(function* () {
    // Start progress monitoring
    yield* monitorProgress
    
    // Process directory with timeout
    const results = yield* processDirectory(directory).pipe(
      Effect.timeout(Duration.minutes(5)),
      Effect.catchTag("TimeoutException", () =>
        Effect.gen(function* () {
          yield* Effect.logError("Processing timeout reached")
          return Chunk.empty()
        })
      )
    )
    
    // Generate summary
    const summary = {
      totalFiles: results.length,
      successful: results.filter(Either.isRight).length,
      failed: results.filter(Either.isLeft).length,
      totalSize: results
        .filter(Either.isRight)
        .map(Either.getOrThrow)
        .reduce((sum, file) => sum + file.size, 0),
      totalLines: results
        .filter(Either.isRight)
        .map(Either.getOrThrow)
        .reduce((sum, file) => sum + file.lines, 0)
    }
    
    yield* Effect.log("Processing complete", summary)
    
    return summary
  })
```

## Advanced Features Deep Dive

### Fiber Management: Concurrent Operations

Effect's fiber system provides low-level concurrency control with automatic resource management:

```typescript
import { Effect, Fiber, Deferred, Ref, Duration, Data } from "effect"

// Basic fiber operations
const fiberExample = Effect.gen(function* () {
  // Fork a computation into a new fiber
  const fiber1 = yield* Effect.fork(
    Effect.delay(Effect.succeed("Result 1"), Duration.seconds(2))
  )
  
  const fiber2 = yield* Effect.fork(
    Effect.delay(Effect.succeed("Result 2"), Duration.seconds(1))
  )
  
  // Wait for both fibers
  const [result1, result2] = yield* Fiber.joinAll([fiber1, fiber2])
  
  return [result1, result2]
})

// Fiber interruption
const interruptibleOperation = Effect.gen(function* () {
  const fiber = yield* Effect.fork(
    Effect.gen(function* () {
      yield* Effect.log("Starting long operation...")
      yield* Effect.sleep(Duration.seconds(10))
      yield* Effect.log("Operation completed!")
      return "Done"
    })
  )
  
  // Wait 1 second then interrupt
  yield* Effect.sleep(Duration.seconds(1))
  yield* Fiber.interrupt(fiber)
  
  yield* Effect.log("Operation interrupted")
})

// Race conditions
const raceExample = Effect.gen(function* () {
  const fast = Effect.delay(Effect.succeed("Fast wins!"), Duration.millis(100))
  const slow = Effect.delay(Effect.succeed("Slow wins!"), Duration.seconds(1))
  
  // First to complete wins
  const winner = yield* Effect.race(fast, slow)
  
  // Or race with timeout
  const result = yield* Effect.raceWith(
    someOperation,
    Effect.delay(Effect.fail(new TimeoutError()), Duration.seconds(5)),
    {
      onSelfDone: (exit) => Effect.succeed(exit),
      onOtherDone: () => Effect.fail(new TimeoutError())
    }
  )
  
  return winner
})

// Advanced: Supervised fiber management
class TaskManager extends Context.Tag("TaskManager")<
  TaskManager,
  {
    readonly submit: <A>(task: Effect.Effect<A>) => Effect.Effect<Fiber.RuntimeFiber<A>>
    readonly cancelAll: Effect.Effect<void>
    readonly status: Effect.Effect<{ running: number; completed: number }>
  }
>() {}

const TaskManagerLive = Layer.effect(
  TaskManager,
  Effect.gen(function* () {
    const fibers = yield* Ref.make<Set<Fiber.RuntimeFiber<any>>>(new Set())
    const completed = yield* Ref.make(0)
    
    return TaskManager.of({
      submit: <A>(task: Effect.Effect<A>) =>
        Effect.gen(function* () {
          const fiber = yield* Effect.fork(
            task.pipe(
              Effect.ensuring(
                Effect.all([
                  Ref.update(fibers, (set) => {
                    const newSet = new Set(set)
                    newSet.delete(fiber)
                    return newSet
                  }),
                  Ref.update(completed, (n) => n + 1)
                ])
              )
            )
          )
          
          yield* Ref.update(fibers, (set) => new Set([...set, fiber]))
          
          return fiber
        }),
      
      cancelAll: Effect.gen(function* () {
        const currentFibers = yield* Ref.get(fibers)
        yield* Effect.forEach(
          currentFibers,
          (fiber) => Fiber.interrupt(fiber),
          { discard: true }
        )
        yield* Ref.set(fibers, new Set())
      }),
      
      status: Effect.gen(function* () {
        const running = yield* Ref.get(fibers).pipe(Effect.map((set) => set.size))
        const done = yield* Ref.get(completed)
        return { running, completed: done }
      })
    })
  })
)

// Worker pool pattern
const createWorkerPool = <Req, Res>(
  workerCount: number,
  handler: (req: Req) => Effect.Effect<Res>
) =>
  Effect.gen(function* () {
    const queue = yield* Queue.unbounded<Req>()
    const results = yield* PubSub.unbounded<Either.Either<Res, Error>>()
    
    // Create workers
    const workers = yield* Effect.forEach(
      Array.from({ length: workerCount }, (_, i) => i),
      (id) =>
        Effect.fork(
          Effect.forever(
            Effect.gen(function* () {
              const request = yield* Queue.take(queue)
              const result = yield* handler(request).pipe(Effect.either)
              yield* PubSub.publish(results, result)
            })
          )
        ),
      { discard: true }
    )
    
    return {
      submit: (req: Req) => Queue.offer(queue, req),
      results: Stream.fromPubSub(results),
      shutdown: Effect.forEach(workers, Fiber.interrupt, { discard: true })
    }
  })
```

### Resource Management: Scopes and Finalizers

Effect provides powerful resource management through scopes and finalizers:

```typescript
import { Effect, Resource, Scope, Exit } from "effect"

// Basic resource management
const withFile = <A>(
  path: string,
  f: (handle: FileHandle) => Effect.Effect<A>
) =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* Resource.make(
        Effect.tryPromise(() => fs.open(path, "r")),
        (handle) => Effect.promise(() => handle.close())
      )
      
      return yield* f(handle)
    })
  )

// Complex resource with multiple finalizers
class DatabaseConnection {
  static make = (config: DbConfig) =>
    Resource.make(
      Effect.gen(function* () {
        yield* Effect.log("Connecting to database...")
        const connection = yield* Effect.tryPromise(() => createConnection(config))
        
        yield* Effect.log("Setting up connection...")
        yield* Effect.tryPromise(() => connection.query("SET search_path TO app"))
        
        return connection
      }),
      (connection) =>
        Effect.gen(function* () {
          yield* Effect.log("Closing database connection...")
          yield* Effect.tryPromise(() => connection.end()).pipe(
            Effect.catchAll((error) =>
              Effect.log("Error closing connection", error)
            )
          )
        })
    )
}

// Nested resources with proper cleanup ordering
const complexResourceExample = Effect.scoped(
  Effect.gen(function* () {
    // Resources are released in reverse order
    const db = yield* DatabaseConnection.make(dbConfig)
    const cache = yield* RedisConnection.make(redisConfig)
    const logger = yield* FileLogger.make("app.log")
    
    // Use all resources
    yield* logger.log("Starting operation")
    const data = yield* db.query("SELECT * FROM users")
    yield* cache.set("users", data)
    
    return data
  })
)

// Manual scope management
const manualScopeExample = Effect.gen(function* () {
  const scope = yield* Scope.make()
  
  // Add resources to scope
  const connection = yield* Scope.extend(
    DatabaseConnection.make(config),
    scope
  )
  
  // Use resource
  const result = yield* connection.query("SELECT 1")
  
  // Close scope manually
  yield* Scope.close(scope, Exit.unit)
  
  return result
})

// Scope forking for background operations
const backgroundTaskExample = Effect.gen(function* () {
  const parentScope = yield* Scope.make()
  
  // Fork a child scope for background work
  const childScope = yield* Scope.fork(parentScope, ExecutionStrategy.sequential)
  
  // Start background task with its own scope
  yield* Effect.fork(
    Effect.scoped(
      Effect.gen(function* () {
        const logger = yield* FileLogger.make("background.log")
        
        yield* Effect.repeat(
          logger.log("Background task running..."),
          Schedule.fixed(Duration.seconds(1))
        )
      })
    ).pipe(Effect.provideScope(childScope))
  )
  
  // Parent can close without affecting child
  yield* Effect.sleep(Duration.seconds(5))
  yield* Scope.close(parentScope, Exit.unit)
})
```

### Error Handling: Typed Errors and Recovery

Effect's error handling provides type safety and composability:

```typescript
// Define domain errors
class ValidationError extends Data.TaggedError("ValidationError")<{
  field: string
  message: string
}> {}

class NetworkError extends Data.TaggedError("NetworkError")<{
  status?: number
  retryable: boolean
}> {}

class BusinessError extends Data.TaggedError("BusinessError")<{
  code: string
  details: Record<string, any>
}> {}

// Comprehensive error handling
const errorHandlingExample = Effect.gen(function* () {
  const result = yield* riskyOperation.pipe(
    // Handle specific error types
    Effect.catchTag("ValidationError", (error) =>
      Effect.gen(function* () {
        yield* Effect.log(`Validation failed for ${error.field}: ${error.message}`)
        return { valid: false, field: error.field }
      })
    ),
    
    // Handle multiple error types
    Effect.catchTags({
      NetworkError: (error) =>
        error.retryable
          ? Effect.retry(riskyOperation, Schedule.exponential(Duration.seconds(1)))
          : Effect.fail(error),
      BusinessError: (error) =>
        Effect.fail(new Error(`Business rule violation: ${error.code}`))
    }),
    
    // Catch all remaining errors
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Unexpected error", error)
        return { fallback: true }
      })
    )
  )
  
  return result
})

// Error accumulation
const validateUser = (data: unknown) =>
  Effect.gen(function* () {
    const errors: ValidationError[] = []
    
    // Validate all fields
    const validations = Effect.all([
      validateEmail(data.email).pipe(
        Effect.catchTag("ValidationError", (e) => {
          errors.push(e)
          return Effect.unit
        })
      ),
      validateAge(data.age).pipe(
        Effect.catchTag("ValidationError", (e) => {
          errors.push(e)
          return Effect.unit
        })
      ),
      validatePassword(data.password).pipe(
        Effect.catchTag("ValidationError", (e) => {
          errors.push(e)
          return Effect.unit
        })
      )
    ])
    
    yield* validations
    
    if (errors.length > 0) {
      return yield* Effect.fail(new ValidationErrors({ errors }))
    }
    
    return data as ValidUser
  })

// Cause-based error analysis
const causeAnalysis = Effect.gen(function* () {
  const result = yield* complexOperation.pipe(
    Effect.sandbox, // Expose the full Cause
    Effect.catchAll((cause) =>
      Effect.gen(function* () {
        // Analyze cause
        if (Cause.isInterruptedOnly(cause)) {
          yield* Effect.log("Operation was interrupted")
        } else if (Cause.isDie(cause)) {
          yield* Effect.log("Unexpected error (defect)", Cause.defects(cause))
        } else {
          const failures = Cause.failures(cause)
          yield* Effect.log("Known failures", failures)
        }
        
        return { failed: true }
      })
    )
  )
  
  return result
})
```

## Practical Patterns & Best Practices

### Pattern 1: Service Factory Pattern

Create reusable service factories for different environments:

```typescript
// Generic HTTP service factory
const createHttpService = <Service extends { readonly _tag: string }>(
  tag: Context.Tag<Service, HttpServiceImpl>,
  config: {
    baseUrl: string
    timeout?: Duration.Duration
    retry?: Schedule.Schedule<unknown, unknown, unknown>
  }
) => {
  interface HttpServiceImpl {
    readonly get: <T>(path: string, options?: RequestOptions) => Effect.Effect<T, HttpError>
    readonly post: <T>(path: string, body: unknown, options?: RequestOptions) => Effect.Effect<T, HttpError>
    readonly put: <T>(path: string, body: unknown, options?: RequestOptions) => Effect.Effect<T, HttpError>
    readonly delete: <T>(path: string, options?: RequestOptions) => Effect.Effect<T, HttpError>
  }
  
  return Layer.effect(
    tag,
    Effect.gen(function* () {
      const makeRequest = <T>(
        method: string,
        path: string,
        options?: RequestOptions & { body?: unknown }
      ): Effect.Effect<T, HttpError> =>
        Effect.gen(function* () {
          const url = `${config.baseUrl}${path}`
          
          const response = yield* Effect.tryPromise({
            try: () => fetch(url, {
              method,
              headers: {
                "Content-Type": "application/json",
                ...options?.headers
              },
              body: options?.body ? JSON.stringify(options.body) : undefined
            }),
            catch: (error) => new HttpError({ 
              url, 
              method, 
              cause: error 
            })
          }).pipe(
            Effect.timeout(config.timeout || Duration.seconds(30)),
            Effect.retry(config.retry || Schedule.recurs(3))
          )
          
          if (!response.ok) {
            return yield* Effect.fail(new HttpError({
              url,
              method,
              status: response.status,
              message: await response.text()
            }))
          }
          
          return yield* Effect.tryPromise({
            try: () => response.json() as Promise<T>,
            catch: () => new HttpError({ 
              url, 
              method, 
              cause: "Invalid JSON response" 
            })
          })
        })
      
      return {
        get: (path, options) => makeRequest("GET", path, options),
        post: (path, body, options) => makeRequest("POST", path, { ...options, body }),
        put: (path, body, options) => makeRequest("PUT", path, { ...options, body }),
        delete: (path, options) => makeRequest("DELETE", path, options)
      } as HttpServiceImpl
    })
  )
}

// Use the factory
class UserService extends Context.Tag("UserService")<
  UserService,
  HttpServiceImpl
>() {}

const UserServiceLive = createHttpService(UserService, {
  baseUrl: "https://api.example.com",
  timeout: Duration.seconds(10),
  retry: Schedule.exponential(Duration.seconds(1))
})
```

### Pattern 2: Circuit Breaker Pattern

Implement circuit breaker for fault tolerance:

```typescript
import { Data } from "effect"

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number | null
  state: "closed" | "open" | "half-open"
}

class CircuitBreaker extends Context.Tag("CircuitBreaker")<
  CircuitBreaker,
  {
    readonly protect: <A, E>(
      effect: Effect.Effect<A, E>
    ) => Effect.Effect<A, E | CircuitBreakerError>
  }
>() {}

class CircuitBreakerError extends Data.TaggedError("CircuitBreakerError")<{
  reason: "open" | "half-open-test-failed"
}> {}

const CircuitBreakerLive = (config: {
  maxFailures: number
  resetTimeout: Duration.Duration
  halfOpenMax: number
}) =>
  Layer.effect(
    CircuitBreaker,
    Effect.gen(function* () {
      const state = yield* Ref.make<CircuitBreakerState>({
        failures: 0,
        lastFailureTime: null,
        state: "closed"
      })
      
      const protect = <A, E>(effect: Effect.Effect<A, E>) =>
        Effect.gen(function* () {
          const current = yield* Ref.get(state)
          const now = Date.now()
          
          // Check if circuit should be reset
          if (
            current.state === "open" &&
            current.lastFailureTime &&
            now - current.lastFailureTime > Duration.toMillis(config.resetTimeout)
          ) {
            yield* Ref.update(state, (s) => ({ ...s, state: "half-open" }))
          }
          
          const currentState = yield* Ref.get(state)
          
          // Circuit is open
          if (currentState.state === "open") {
            return yield* Effect.fail(new CircuitBreakerError({ reason: "open" }))
          }
          
          // Try the effect
          const result = yield* effect.pipe(
            Effect.tap(() =>
              // Success - reset failures
              Ref.update(state, (s) => ({
                failures: 0,
                lastFailureTime: null,
                state: "closed"
              }))
            ),
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                const newState = yield* Ref.updateAndGet(state, (s) => ({
                  failures: s.failures + 1,
                  lastFailureTime: now,
                  state: s.failures + 1 >= config.maxFailures ? "open" : s.state
                }))
                
                if (newState.state === "half-open") {
                  yield* Ref.update(state, (s) => ({ ...s, state: "open" }))
                  return yield* Effect.fail(new CircuitBreakerError({ 
                    reason: "half-open-test-failed" 
                  }))
                }
                
                return yield* Effect.fail(error)
              })
            )
          )
          
          return result
        })
      
      return CircuitBreaker.of({ protect })
    })
  )

// Usage with circuit breaker
const protectedApiCall = Effect.gen(function* () {
  const breaker = yield* CircuitBreaker
  const api = yield* ApiClient
  
  return yield* breaker.protect(
    api.get("/unstable-endpoint").pipe(
      Effect.retry(Schedule.recurs(2))
    )
  ).pipe(
    Effect.catchTag("CircuitBreakerError", (error) =>
      Effect.gen(function* () {
        yield* Effect.log("Circuit breaker is open, using fallback")
        return { fallback: true, data: [] }
      })
    )
  )
})
```

### Pattern 3: Saga Pattern for Distributed Transactions

Implement saga pattern for managing distributed transactions:

```typescript
// Saga step definition
interface SagaStep<A, E, R> {
  name: string
  forward: Effect.Effect<A, E, R>
  compensate: (result: A) => Effect.Effect<void, never, R>
}

// Saga executor
const executeSaga = <E, R>(steps: SagaStep<any, E, R>[]) =>
  Effect.gen(function* () {
    const completed: { step: SagaStep<any, E, R>; result: any }[] = []
    
    try {
      // Execute all steps
      for (const step of steps) {
        yield* Effect.log(`Executing saga step: ${step.name}`)
        const result = yield* step.forward
        completed.push({ step, result })
      }
      
      yield* Effect.log("Saga completed successfully")
      return completed.map(c => c.result)
    } catch (error) {
      // Compensate in reverse order
      yield* Effect.log("Saga failed, starting compensation")
      
      for (const { step, result } of completed.reverse()) {
        yield* Effect.log(`Compensating: ${step.name}`)
        yield* step.compensate(result).pipe(
          Effect.catchAll((error) =>
            Effect.logError(`Compensation failed for ${step.name}`, error)
          )
        )
      }
      
      throw error
    }
  })

// Example: Order processing saga
const createOrderSaga = (
  userId: string,
  items: Item[],
  paymentMethod: PaymentMethod
) => {
  const reservationIds: string[] = []
  let paymentId: string | null = null
  let orderId: string | null = null
  
  const steps: SagaStep<any, OrderError, OrderServices>[] = [
    {
      name: "Reserve Inventory",
      forward: Effect.gen(function* () {
        const inventory = yield* InventoryService
        const reservations = yield* inventory.reserveItems(items)
        reservationIds.push(...reservations.map(r => r.id))
        return reservations
      }),
      compensate: () =>
        Effect.gen(function* () {
          const inventory = yield* InventoryService
          yield* Effect.forEach(
            reservationIds,
            (id) => inventory.cancelReservation(id),
            { discard: true }
          )
        })
    },
    {
      name: "Process Payment",
      forward: Effect.gen(function* () {
        const payment = yield* PaymentService
        const result = yield* payment.charge(paymentMethod, calculateTotal(items))
        paymentId = result.transactionId
        return result
      }),
      compensate: () =>
        Effect.gen(function* () {
          if (paymentId) {
            const payment = yield* PaymentService
            yield* payment.refund(paymentId)
          }
        })
    },
    {
      name: "Create Order",
      forward: Effect.gen(function* () {
        const orders = yield* OrderService
        const order = yield* orders.create({
          userId,
          items,
          paymentId: paymentId!,
          reservationIds
        })
        orderId = order.id
        return order
      }),
      compensate: () =>
        Effect.gen(function* () {
          if (orderId) {
            const orders = yield* OrderService
            yield* orders.cancel(orderId)
          }
        })
    },
    {
      name: "Send Confirmation",
      forward: Effect.gen(function* () {
        const notifications = yield* NotificationService
        const user = yield* UserService.getUser(userId)
        yield* notifications.sendOrderConfirmation(user.email, orderId!)
      }),
      compensate: () => Effect.unit // No compensation needed
    }
  ]
  
  return executeSaga(steps)
}
```

## Integration Examples

### Integration with Express.js

```typescript
import express from "express"
import { Effect, Layer, Runtime } from "effect"

// Define middleware service
class RequestContext extends Context.Tag("RequestContext")<
  RequestContext,
  {
    readonly req: express.Request
    readonly res: express.Response
    readonly requestId: string
  }
>() {}

// Effect middleware
const effectMiddleware = <R>(runtime: Runtime.Runtime<R>) =>
  (handler: Effect.Effect<void, HttpError, RequestContext | R>) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = crypto.randomUUID()
    
    const program = handler.pipe(
      Effect.provideService(RequestContext, {
        req,
        res,
        requestId
      }),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          const ctx = yield* RequestContext
          
          if (error._tag === "ValidationError") {
            ctx.res.status(400).json({ error: error.message })
          } else if (error._tag === "NotFoundError") {
            ctx.res.status(404).json({ error: "Not found" })
          } else {
            ctx.res.status(500).json({ error: "Internal server error" })
          }
        })
      )
    )
    
    try {
      await Runtime.runPromise(runtime)(program)
    } catch (error) {
      next(error)
    }
  }

// Create Express app with Effect
const createApp = (runtime: Runtime.Runtime<AppServices>) => {
  const app = express()
  const effect = effectMiddleware(runtime)
  
  app.use(express.json())
  
  // Health check
  app.get("/health", effect(
    Effect.gen(function* () {
      const ctx = yield* RequestContext
      const db = yield* Database
      
      const health = yield* db.query("SELECT 1")
      
      ctx.res.json({ status: "healthy", database: "connected" })
    })
  ))
  
  // User routes
  app.get("/users/:id", effect(
    Effect.gen(function* () {
      const ctx = yield* RequestContext
      const users = yield* UserRepository
      
      const userId = ctx.req.params.id
      const user = yield* users.findById(userId)
      
      if (!user) {
        return yield* Effect.fail(new NotFoundError())
      }
      
      ctx.res.json(user)
    })
  ))
  
  app.post("/users", effect(
    Effect.gen(function* () {
      const ctx = yield* RequestContext
      const users = yield* UserRepository
      
      const data = yield* Schema.decode(CreateUserSchema)(ctx.req.body)
      const user = yield* users.create(data)
      
      ctx.res.status(201).json(user)
    })
  ))
  
  return app
}

// Start server
const startServer = Effect.gen(function* () {
  const runtime = yield* Effect.runtime<AppServices>()
  const config = yield* AppConfig
  
  const app = createApp(runtime)
  
  yield* Effect.async<never, Error>((resume) => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
    })
  })
})

// Run with all dependencies
const program = startServer.pipe(
  Effect.provide(AppServicesLive)
)

Effect.runPromise(program)
```

### Testing Strategies

```typescript
import { Effect, TestClock, TestContext, Layer } from "effect"
import { describe, it, expect } from "@beep/testkit"

// Test utilities
const TestUserRepository = Layer.succeed(
  UserRepository,
  UserRepository.of({
    findById: (id) =>
      id === "123"
        ? Effect.succeed({ id, email: "test@example.com", name: "Test User" })
        : Effect.succeed(null),
    
    create: (data) =>
      Effect.succeed({ ...data, id: "generated-id" }),
    
    update: (id, data) =>
      Effect.succeed({ id, ...data }),
    
    delete: (id) =>
      Effect.succeed(true),
    
    findByEmail: (email) =>
      Effect.succeed(null)
  })
)

// Test with Effect
describe("UserService", () => {
  it("should create user with profile", () =>
    Effect.gen(function* () {
      const service = yield* UserService
      
      const user = yield* service.createUserWithProfile({
        email: "new@example.com",
        name: "New User",
        profile: { bio: "Test bio" }
      })
      
      expect(user).toMatchObject({
        id: expect.any(String),
        email: "new@example.com",
        name: "New User"
      })
    }).pipe(
      Effect.provide(TestUserRepository),
      Effect.runPromise
    )
  )
  
  it("should handle concurrent requests", () =>
    Effect.gen(function* () {
      const service = yield* UserService
      
      // Create multiple users concurrently
      const users = yield* Effect.forEach(
        Array.from({ length: 10 }, (_, i) => ({
          email: `user${i}@example.com`,
          name: `User ${i}`
        })),
        (data) => service.createUser(data),
        { concurrency: "unbounded" }
      )
      
      expect(users).toHaveLength(10)
    }).pipe(
      Effect.provide(TestUserRepository),
      Effect.runPromise
    )
  )
  
  it("should timeout long operations", () =>
    Effect.gen(function* () {
      const service = yield* SlowService
      
      const result = yield* service.slowOperation.pipe(
        Effect.timeout(Duration.millis(100)),
        Effect.either
      )
      
      expect(Either.isLeft(result)).toBe(true)
    }).pipe(
      TestClock.with,
      Effect.runPromise
    )
  )
})

// Property-based testing with Effect
import { fc } from "@fast-check/vitest"

describe("Validation", () => {
  it.prop([fc.string()])(
    "should validate email format",
    (email) =>
      Effect.gen(function* () {
        const result = yield* validateEmail(email).pipe(Effect.either)
        
        if (email.includes("@") && email.includes(".")) {
          expect(Either.isRight(result)).toBe(true)
        } else {
          expect(Either.isLeft(result)).toBe(true)
        }
      }).pipe(Effect.runPromise)
  )
})

// Testing with test containers
const TestDatabaseLive = Layer.scoped(
  Database,
  Effect.gen(function* () {
    const container = yield* Resource.make(
      Effect.promise(async () => {
        const container = await new PostgreSqlContainer()
          .withDatabase("test")
          .withUsername("test")
          .withPassword("test")
          .start()
        
        return container
      }),
      (container) => Effect.promise(() => container.stop())
    )
    
    const pool = yield* createConnectionPool({
      host: container.getHost(),
      port: container.getPort(),
      database: "test",
      user: "test",
      password: "test",
      max: 5
    })
    
    // Run migrations
    yield* runMigrations(pool)
    
    return createDatabaseService(pool)
  })
)
```

## Conclusion

Effect provides a powerful, type-safe foundation for building robust applications with proper error handling, dependency management, and composable asynchronous operations. Its comprehensive approach to handling side effects makes it ideal for complex real-world applications.

Key benefits:
- **Type Safety**: Full type inference for errors and dependencies
- **Composability**: Build complex operations from simple, reusable pieces
- **Resource Safety**: Automatic cleanup and proper resource management
- **Error Handling**: Typed errors with precise handling capabilities
- **Testability**: Built-in dependency injection and test utilities
- **Performance**: Efficient fiber-based concurrency model

Use Effect when you need reliability, type safety, and composability in your TypeScript applications, especially for API integrations, database operations, and complex business logic with multiple failure modes.