# Pipeable: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Pipeable Solves

JavaScript lacks built-in functional composition patterns, forcing developers to choose between nested function calls (hard to read) or intermediate variables (verbose and imperative):

```typescript
// Traditional approach - nested hell
const result = processOrder(
  applyDiscounts(
    calculateTax(
      validateOrder(rawOrderData)
    )
  )
)

// Alternative - verbose intermediate variables
const validated = validateOrder(rawOrderData)
const withTax = calculateTax(validated)
const withDiscounts = applyDiscounts(withTax)
const result = processOrder(withDiscounts)

// Manual chaining with fluent APIs - requires every API to implement chaining
class OrderBuilder {
  constructor(private order: Order) {}
  
  validate() {
    const validated = validateOrder(this.order)
    return new OrderBuilder(validated)
  }
  
  calculateTax() {
    const withTax = calculateTax(this.order)
    return new OrderBuilder(withTax)
  }
  
  applyDiscounts() {
    const withDiscounts = applyDiscounts(this.order)
    return new OrderBuilder(withDiscounts)
  }
  
  process() {
    return processOrder(this.order)
  }
}

// Usage requires builders for every type
const result = new OrderBuilder(rawOrderData)
  .validate()
  .calculateTax()
  .applyDiscounts()
  .process()
```

This approach leads to:
- **Readability issues** - Nested function calls are hard to follow
- **Verbose code** - Intermediate variables clutter the logic
- **API inconsistency** - Each library implements chaining differently
- **Limited composability** - Functions don't naturally chain together
- **Type inference problems** - Deep nesting breaks TypeScript's inference

### The Pipeable Solution

Pipeable provides a universal interface for function composition using the pipe operator pattern, enabling clean left-to-right data flow:

```typescript
import { pipe } from "effect"
import { Effect, Option, Array as Arr } from "effect"

// Clean, readable composition with the pipe operator
const result = rawOrderData.pipe(
  validateOrder,
  calculateTax,
  applyDiscounts,
  processOrder
)

// Or using standalone pipe for non-Pipeable types
const numbers = pipe(
  [1, 2, 3, 4, 5],
  Arr.map(x => x * 2),
  Arr.filter(x => x > 4),
  Arr.take(3)
)

// Effect compositions are naturally pipeable
const userEffect = Effect.gen(function* () {
  const userId = yield* getUserId()
  const user = yield* fetchUser(userId)
  return user
}).pipe(
  Effect.catchTag('UserNotFound', () => createDefaultUser()),
  Effect.withSpan('user.load'),
  Effect.timeout('5 seconds')
)
```

### Key Concepts

**Pipeable Interface**: A universal interface that enables any type to support the `.pipe()` method for function composition

**Function-First Design**: Pipeable functions take the data as their first parameter, enabling natural composition

**Type Safety**: Full TypeScript support with proper type inference through long composition chains

**Universal Pattern**: Works with any data type - primitives, objects, Effect types, custom types

## Basic Usage Patterns

### Pattern 1: Using Pipeable Interface

```typescript
import { Effect, Option, Array as Arr } from "effect"

// Effect types implement Pipeable
const processUserData = (userId: string) =>
  Effect.succeed(userId).pipe(
    Effect.flatMap(fetchUser),
    Effect.map(enrichUserProfile),
    Effect.catchTag('NotFound', () => Effect.succeed(null))
  )

// Option types implement Pipeable  
const getUsername = (user: User) =>
  Option.fromNullable(user.profile).pipe(
    Option.map(profile => profile.displayName),
    Option.filter(name => name.length > 0),
    Option.getOrElse(() => user.email)
  )

// Array methods work with pipe
const processNumbers = (numbers: number[]) =>
  Arr.fromIterable(numbers).pipe(
    Arr.map(x => x * 2),
    Arr.filter(x => x > 10),
    Arr.take(5)
  )
```

### Pattern 2: Standalone Pipe Function

```typescript
import { pipe } from "effect"
import { Array as Arr, String } from "effect"

// For non-Pipeable types, use standalone pipe
const cleanText = (text: string) => pipe(
  text,
  String.trim,
  String.toLowerCase,
  s => s.replace(/[^a-z0-9]/g, '-'),
  s => s.replace(/-+/g, '-'),
  s => s.replace(/^-|-$/g, '')
)

// Processing plain objects
const normalizeUser = (rawUser: any) => pipe(
  rawUser,
  validateUserData,
  enrichWithDefaults,
  convertToUserEntity
)

// Chaining array operations on plain arrays
const processItems = (items: Item[]) => pipe(
  items,
  items => items.filter(item => item.active),
  items => items.map(transformItem),
  items => items.sort((a, b) => a.priority - b.priority)
)
```

### Pattern 3: Creating Pipeable Types

```typescript
import { Pipeable } from "effect"

// Make your own types pipeable
class ValidationResult<T> implements Pipeable.Pipeable {
  constructor(
    public readonly value: T,
    public readonly errors: string[] = []
  ) {}

  pipe() {
    return Pipeable.pipeArguments(this, arguments)
  }

  isValid(): boolean {
    return this.errors.length === 0
  }
}

// Helper functions for ValidationResult
const validate = <T>(value: T, predicate: (v: T) => boolean, error: string) =>
  (result: ValidationResult<T>) =>
    predicate(result.value)
      ? result
      : new ValidationResult(result.value, [...result.errors, error])

const transform = <T, U>(fn: (value: T) => U) =>
  (result: ValidationResult<T>) =>
    new ValidationResult(fn(result.value), result.errors)

// Usage - now it's pipeable!
const validateUser = (user: User) =>
  new ValidationResult(user).pipe(
    validate(u => u.email.includes('@'), 'Invalid email'),
    validate(u => u.name.length > 0, 'Name required'),
    transform(u => ({ ...u, email: u.email.toLowerCase() }))
  )
```

## Real-World Examples

### Example 1: HTTP Request Pipeline

Building a robust HTTP client with retry logic, caching, and error handling:

```typescript
import { Effect, pipe } from "effect"
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"

// HTTP request processing pipeline
const makeApiRequest = (url: string, options: RequestOptions) =>
  Effect.gen(function* () {
    const request = yield* HttpClientRequest.get(url)
    const client = yield* HttpClient.HttpClient
    return yield* client.execute(request)
  }).pipe(
    Effect.flatMap(HttpClientResponse.json),
    Effect.catchTag('HttpError', retryOnError),
    Effect.timeout('30 seconds'),
    Effect.withSpan('api.request', { attributes: { url } })
  )

// Retry logic for failed requests
const retryOnError = (error: HttpError) =>
  error.status >= 500
    ? Effect.retry(makeApiRequest, Schedule.exponential('1 second'))
    : Effect.fail(error)

// User profile enrichment pipeline
const enrichUserProfile = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    const preferences = yield* fetchUserPreferences(userId)
    const activity = yield* fetchRecentActivity(userId)
    return { user, preferences, activity }
  }).pipe(
    Effect.catchTag('UserNotFound', () => 
      Effect.succeed({ user: null, preferences: null, activity: [] })
    ),
    Effect.map(data => ({
      ...data,
      isComplete: data.user !== null,
      lastSeen: data.activity[0]?.timestamp || null
    })),
    Effect.withSpan('user.enrich')
  )

// API response transformation
const processApiResponse = <T>(response: ApiResponse<T>) =>
  Effect.succeed(response).pipe(
    Effect.filterOrFail(
      resp => resp.success,
      () => new ApiError(response.error)
    ),
    Effect.map(resp => resp.data),
    Effect.flatMap(validateResponse),
    Effect.map(addTimestamp)
  )
```

### Example 2: Data Processing Pipeline

Stream processing with validation, transformation, and aggregation:

```typescript
import { Stream, Effect, Array as Arr } from "effect"

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  service: string
}

// Log processing pipeline
const processLogStream = (logStream: Stream.Stream<string>) =>
  logStream.pipe(
    Stream.map(parseLogEntry),
    Stream.filter(Option.isSome),
    Stream.map(Option.value),
    Stream.groupBy(log => log.service),
    Stream.map(([service, logs]) => 
      logs.pipe(
        Stream.scan(
          { service, count: 0, errors: 0, warnings: 0 },
          (acc, log) => ({
            ...acc,
            count: acc.count + 1,
            errors: acc.errors + (log.level === 'error' ? 1 : 0),
            warnings: acc.warnings + (log.level === 'warn' ? 1 : 0)
          })
        )
      )
    ),
    Stream.merge(10),
    Stream.runCollect
  )

// Data validation and cleaning
const cleanUserData = (rawUsers: unknown[]) => pipe(
  rawUsers,
  Arr.map(parseUser),
  Arr.filter(Option.isSome),
  Arr.map(Option.value),
  Arr.filter(user => user.email && user.name),
  Arr.map(normalizeUser),
  Arr.groupBy(user => user.domain),
  users => Object.entries(users).map(([domain, userList]) => ({
    domain,
    users: userList,
    count: userList.length
  }))
)

// Database operation pipeline
const updateUserProfile = (userId: string, updates: UserUpdate) =>
  Effect.gen(function* () {
    const db = yield* Database
    const user = yield* db.users.findById(userId)
    const validated = yield* validateUpdates(user, updates)
    const updated = yield* db.users.update(userId, validated)
    yield* invalidateUserCache(userId)
    return updated
  }).pipe(
    Effect.catchTag('ValidationError', error => 
      Effect.fail(new UserUpdateError({ cause: error, userId }))
    ),
    Effect.catchTag('DatabaseError', error =>
      Effect.retry(updateUserProfile(userId, updates), Schedule.recurs(3))
    ),
    Effect.withSpan('user.update', { attributes: { userId } })
  )
```

### Example 3: Configuration and Environment Setup

Building application configuration with validation and environment-specific overrides:

```typescript
import { Config, Effect, Layer } from "effect"

interface AppConfig {
  database: DatabaseConfig
  redis: RedisConfig
  auth: AuthConfig
  features: FeatureFlags
}

// Configuration loading pipeline
const loadAppConfig = Effect.gen(function* () {
  const env = yield* Config.string('NODE_ENV').pipe(
    Config.withDefault('development')
  )
  const baseConfig = yield* loadBaseConfig()
  const envOverrides = yield* loadEnvironmentConfig(env)
  return mergeConfigs(baseConfig, envOverrides)
}).pipe(
  Effect.flatMap(validateConfig),
  Effect.catchTag('ConfigError', error => {
    console.error('Configuration error:', error)
    return Effect.fail(new AppStartupError({ cause: error }))
  }),
  Effect.withSpan('config.load')
)

// Service layer construction
const createAppServices = (config: AppConfig) =>
  Layer.empty.pipe(
    Layer.provide(createDatabaseLayer(config.database)),
    Layer.provideMerge(createRedisLayer(config.redis)),
    Layer.provideMerge(createAuthLayer(config.auth)),
    Layer.provideMerge(createFeatureFlagLayer(config.features))
  )

// Application startup
const startApplication = Effect.gen(function* () {
  const config = yield* loadAppConfig
  const services = createAppServices(config)
  yield* Effect.log('Starting application services...')
  yield* startHttpServer(config.server)
  yield* startBackgroundJobs(config.jobs)
  return config
}).pipe(
  Effect.provide(services),
  Effect.catchAll(error => {
    console.error('Application startup failed:', error)
    return Effect.die(error)
  }),
  Effect.withSpan('app.start')
)
```

## Advanced Features Deep Dive

### Feature 1: Custom Pipeable Implementation

Creating types that naturally integrate with Effect's ecosystem:

#### Basic Pipeable Implementation

```typescript
import { Pipeable } from "effect"

class Result<T, E = Error> implements Pipeable.Pipeable {
  constructor(
    private readonly _tag: 'Success' | 'Failure',
    private readonly value: T | E
  ) {}

  pipe() {
    return Pipeable.pipeArguments(this, arguments)
  }

  static success<T>(value: T): Result<T, never> {
    return new Result('Success', value)
  }

  static failure<E>(error: E): Result<never, E> {
    return new Result('Failure', error)
  }

  isSuccess(): this is Result<T, never> {
    return this._tag === 'Success'
  }

  isFailure(): this is Result<never, E> {
    return this._tag === 'Failure'
  }
}
```

#### Real-World Pipeable Example

```typescript
// Advanced Result type with full functional API
class AsyncResult<T, E = Error> implements Pipeable.Pipeable {
  constructor(private readonly effect: Effect.Effect<T, E>) {}

  pipe() {
    return Pipeable.pipeArguments(this, arguments)
  }

  static success<T>(value: T): AsyncResult<T, never> {
    return new AsyncResult(Effect.succeed(value))
  }

  static failure<E>(error: E): AsyncResult<never, E> {
    return new AsyncResult(Effect.fail(error))
  }

  static fromEffect<T, E>(effect: Effect.Effect<T, E>): AsyncResult<T, E> {
    return new AsyncResult(effect)
  }

  unwrap(): Effect.Effect<T, E> {
    return this.effect
  }
}

// Helper functions for AsyncResult
const mapResult = <T, U>(fn: (value: T) => U) =>
  <E>(result: AsyncResult<T, E>): AsyncResult<U, E> =>
    new AsyncResult(result.unwrap().pipe(Effect.map(fn)))

const flatMapResult = <T, U, E1, E2>(fn: (value: T) => AsyncResult<U, E2>) =>
  (result: AsyncResult<T, E1>): AsyncResult<U, E1 | E2> =>
    new AsyncResult(
      result.unwrap().pipe(
        Effect.flatMap(value => fn(value).unwrap())
      )
    )

const catchResult = <T, E1, E2>(fn: (error: E1) => AsyncResult<T, E2>) =>
  (result: AsyncResult<T, E1>): AsyncResult<T, E2> =>
    new AsyncResult(
      result.unwrap().pipe(
        Effect.catchAll(error => fn(error).unwrap())
      )
    )

// Usage - fully pipeable with custom behavior
const processUserRegistration = (userData: UserData) =>
  AsyncResult.success(userData).pipe(
    mapResult(validateUserData),
    flatMapResult(data => AsyncResult.fromEffect(hashPassword(data.password))),
    flatMapResult(hash => AsyncResult.fromEffect(saveUser({ ...userData, passwordHash: hash }))),
    catchResult(error => 
      AsyncResult.fromEffect(
        Effect.logError(`Registration failed: ${error}`).pipe(
          Effect.zipRight(Effect.fail(new RegistrationError({ cause: error })))
        )
      )
    )
  )
```

### Feature 2: Builder Pattern with Pipeable

Creating fluent APIs using the Pipeable interface:

```typescript
class QueryBuilder<T> implements Pipeable.Pipeable {
  constructor(
    private readonly table: string,
    private readonly conditions: string[] = [],
    private readonly orderBy: string[] = [],
    private readonly limitValue?: number
  ) {}

  pipe() {
    return Pipeable.pipeArguments(this, arguments)
  }

  static from<T>(table: string): QueryBuilder<T> {
    return new QueryBuilder(table)
  }

  toSQL(): string {
    let sql = `SELECT * FROM ${this.table}`
    
    if (this.conditions.length > 0) {
      sql += ` WHERE ${this.conditions.join(' AND ')}`
    }
    
    if (this.orderBy.length > 0) {
      sql += ` ORDER BY ${this.orderBy.join(', ')}`
    }
    
    if (this.limitValue) {
      sql += ` LIMIT ${this.limitValue}`
    }
    
    return sql
  }
}

// Builder helper functions
const where = (condition: string) =>
  <T>(builder: QueryBuilder<T>): QueryBuilder<T> =>
    new QueryBuilder(
      builder['table'],
      [...builder['conditions'], condition],
      builder['orderBy'],
      builder['limitValue']
    )

const orderBy = (column: string, direction: 'ASC' | 'DESC' = 'ASC') =>
  <T>(builder: QueryBuilder<T>): QueryBuilder<T> =>
    new QueryBuilder(
      builder['table'],
      builder['conditions'],
      [...builder['orderBy'], `${column} ${direction}`],
      builder['limitValue']
    )

const limit = (count: number) =>
  <T>(builder: QueryBuilder<T>): QueryBuilder<T> =>
    new QueryBuilder(
      builder['table'],
      builder['conditions'],
      builder['orderBy'],
      count
    )

// Usage - natural pipeline building
const userQuery = QueryBuilder.from<User>('users').pipe(
  where('active = true'),
  where('created_at > ?'),
  orderBy('created_at', 'DESC'),
  limit(50)
)

console.log(userQuery.toSQL())
// SELECT * FROM users WHERE active = true AND created_at > ? ORDER BY created_at DESC LIMIT 50
```

### Feature 3: Advanced Composition Patterns

Combining multiple Pipeable types for complex workflows:

```typescript
// Composing different Pipeable types
const complexWorkflow = (inputData: InputData) =>
  Effect.succeed(inputData).pipe(
    Effect.flatMap(data => 
      Option.fromNullable(data.userId).pipe(
        Option.match({
          onNone: () => Effect.fail(new MissingUserError()),
          onSome: userId => Effect.succeed(userId)
        })
      )
    ),
    Effect.flatMap(userId =>
      QueryBuilder.from<User>('users').pipe(
        where(`id = '${userId}'`),
        builder => Effect.fromPromise(() => database.query(builder.toSQL()))
      )
    ),
    Effect.flatMap(users =>
      Arr.fromIterable(users).pipe(
        Arr.head,
        Option.match({
          onNone: () => Effect.fail(new UserNotFoundError()),
          onSome: user => Effect.succeed(user)
        })
      )
    ),
    Effect.map(user =>
      AsyncResult.success(user).pipe(
        mapResult(enrichUserProfile),
        flatMapResult(profile => AsyncResult.fromEffect(cacheProfile(profile)))
      )
    ),
    Effect.flatten
  )

// Combining streaming and pipeable operations
const processDataStream = (dataStream: Stream.Stream<RawData>) =>
  dataStream.pipe(
    Stream.map(data =>
      Option.fromNullable(data).pipe(
        Option.filter(d => d.isValid),
        Option.map(validateData)
      )
    ),
    Stream.filter(Option.isSome),
    Stream.map(Option.value),
    Stream.groupBy(data => data.category),
    Stream.map(([category, stream]) =>
      stream.pipe(
        Stream.scan(
          { category, count: 0, processed: [] as ProcessedData[] },
          (acc, data) => ({
            ...acc,
            count: acc.count + 1,
            processed: [...acc.processed, processData(data)]
          })
        )
      )
    ),
    Stream.merge(5),
    Stream.runCollect
  )
```

## Practical Patterns & Best Practices

### Pattern 1: Error Handling with Pipes

```typescript
// Centralized error handling pattern
const withErrorHandling = <T, E, R>(
  operation: Effect.Effect<T, E, R>,
  context: string
) =>
  operation.pipe(
    Effect.catchAll(error => 
      Effect.gen(function* () {
        yield* Effect.logError(`Operation failed in ${context}:`, error)
        yield* Effect.annotateCurrentSpan('error.context', context)
        return yield* Effect.fail(error)
      })
    ),
    Effect.withSpan(`operation.${context.toLowerCase()}`)
  )

// Retry with backoff pattern
const withRetry = <T, E, R>(
  operation: Effect.Effect<T, E, R>,
  maxRetries: number = 3
) =>
  operation.pipe(
    Effect.retry(
      Schedule.exponential('1 second').pipe(
        Schedule.compose(Schedule.recurs(maxRetries))
      )
    )
  )

// Combined error handling and retry
const robustOperation = <T, E, R>(
  operation: Effect.Effect<T, E, R>,
  context: string
) =>
  operation.pipe(
    withErrorHandling(_, context),
    withRetry(_, 3),
    Effect.timeout('30 seconds')
  )
```

### Pattern 2: Validation Pipelines

```typescript
// Composable validation functions
const validateRequired = (field: string) =>
  <T>(obj: T): Effect.Effect<T, ValidationError> =>
    (obj as any)[field]
      ? Effect.succeed(obj)
      : Effect.fail(new ValidationError(`${field} is required`))

const validateEmail = (field: string) =>
  <T>(obj: T): Effect.Effect<T, ValidationError> => {
    const email = (obj as any)[field]
    return email && email.includes('@')
      ? Effect.succeed(obj)
      : Effect.fail(new ValidationError(`${field} must be a valid email`))
  }

const validateLength = (field: string, min: number, max: number) =>
  <T>(obj: T): Effect.Effect<T, ValidationError> => {
    const value = (obj as any)[field]
    const length = value?.length || 0
    return length >= min && length <= max
      ? Effect.succeed(obj)
      : Effect.fail(new ValidationError(`${field} must be between ${min} and ${max} characters`))
  }

// User validation pipeline
const validateUser = (user: UnvalidatedUser) =>
  Effect.succeed(user).pipe(
    Effect.flatMap(validateRequired('name')),
    Effect.flatMap(validateRequired('email')),
    Effect.flatMap(validateEmail('email')),
    Effect.flatMap(validateLength('name', 2, 50)),
    Effect.map(user => user as ValidatedUser)
  )
```

### Pattern 3: Resource Management

```typescript
// Resource acquisition and cleanup pattern
const withDatabase = <T, E>(
  operation: (db: Database) => Effect.Effect<T, E>
) =>
  Effect.gen(function* () {
    const db = yield* acquireDatabase()
    const result = yield* operation(db).pipe(
      Effect.ensuring(Effect.sync(() => db.close()))
    )
    return result
  })

// Scoped resource management
const withTemporaryFile = <T, E>(
  operation: (filepath: string) => Effect.Effect<T, E>
) =>
  Effect.acquireUseRelease(
    createTemporaryFile(),
    operation,
    (filepath) => deleteFile(filepath)
  )

// Combined resource pattern
const processFileWithDatabase = (inputPath: string) =>
  withDatabase(db =>
    withTemporaryFile(tempPath =>
      Effect.gen(function* () {
        yield* copyFile(inputPath, tempPath)
        const data = yield* parseFile(tempPath)
        const processed = yield* processData(data)
        return yield* db.save(processed)
      })
    )
  )
```

## Integration Examples

### Integration with React and State Management

```typescript
import { Effect, Runtime } from "effect"
import { useState, useEffect } from "react"

// Custom hook for Effect integration
const useEffect = <T, E>(
  effect: Effect.Effect<T, E>,
  deps: React.DependencyList
): { data: T | null; error: E | null; loading: boolean } => {
  const [state, setState] = useState<{
    data: T | null
    error: E | null
    loading: boolean
  }>({ data: null, error: null, loading: true })

  useEffect(() => {
    setState({ data: null, error: null, loading: true })
    
    const runtime = Runtime.defaultRuntime
    const cancel = Runtime.runPromise(runtime)(effect).pipe(
      Effect.match({
        onFailure: error => setState({ data: null, error, loading: false }),
        onSuccess: data => setState({ data, error: null, loading: false })
      })
    )

    return () => cancel()
  }, deps)

  return state
}

// React component using Effect
const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const userEffect = Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    const preferences = yield* fetchUserPreferences(userId)
    return { user, preferences }
  }).pipe(
    Effect.catchTag('UserNotFound', () => 
      Effect.succeed({ user: null, preferences: null })
    )
  )

  const { data, error, loading } = useEffect(userEffect, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data?.user) return <div>User not found</div>

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
    </div>
  )
}
```

### Integration with Express.js

```typescript
import express from "express"
import { Effect, Runtime } from "effect"

// Effect-Express adapter
const effectHandler = <T, E>(
  effectFn: (req: express.Request) => Effect.Effect<T, E>
) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const runtime = Runtime.defaultRuntime
    
    effectFn(req).pipe(
      Effect.match({
        onFailure: error => {
          console.error('Request failed:', error)
          res.status(500).json({ error: 'Internal server error' })
        },
        onSuccess: result => {
          res.json(result)
        }
      }),
      Runtime.runPromise(runtime)
    ).catch(next)
  }

// Express routes using Effect
const app = express()

app.get('/users/:id', effectHandler(req =>
  Effect.gen(function* () {
    const userId = req.params.id
    const user = yield* fetchUser(userId)
    const profile = yield* enrichUserProfile(user)
    return profile
  }).pipe(
    Effect.catchTag('UserNotFound', () =>
      Effect.fail(new NotFoundError('User not found'))
    )
  )
))

app.post('/users', effectHandler(req =>
  Effect.gen(function* () {
    const userData = req.body
    const validated = yield* validateUser(userData)
    const user = yield* createUser(validated)
    yield* sendWelcomeEmail(user.email)
    return user
  }).pipe(
    Effect.catchTag('ValidationError', error =>
      Effect.fail(new BadRequestError(error.message))
    )
  )
))
```

### Testing Strategies

```typescript
import { Effect, Layer, TestContext } from "effect"
import { describe, it, expect } from "bun:test"

// Mock services for testing
const mockUserService = {
  findById: (id: string) =>
    id === '1' 
      ? Effect.succeed({ id: '1', name: 'John', email: 'john@example.com' })
      : Effect.fail(new UserNotFoundError(id))
}

const mockLayer = Layer.succeed(UserService, mockUserService)

// Testing pipeable operations
describe('User Operations', () => {
  it('should process user data correctly', () => {
    const program = Effect.gen(function* () {
      const user = yield* fetchUser('1')
      return user
    }).pipe(
      Effect.map(user => ({ ...user, processed: true })),
      Effect.provide(mockLayer)
    )

    return Effect.runPromise(program).then(result => {
      expect(result.processed).toBe(true)
      expect(result.name).toBe('John')
    })
  })

  it('should handle user not found', () => {
    const program = fetchUser('999').pipe(
      Effect.catchTag('UserNotFound', () => 
        Effect.succeed({ id: '999', name: 'Default', email: 'default@example.com' })
      ),
      Effect.provide(mockLayer)
    )

    return Effect.runPromise(program).then(result => {
      expect(result.name).toBe('Default')
    })
  })
})

// Property-based testing with pipes
const genUser = fc.record({
  id: fc.string(),
  name: fc.string({ minLength: 1 }),
  email: fc.emailAddress()
})

fc.test('user validation preserves valid users', genUser, user => {
  const result = validateUser(user).pipe(
    Effect.provide(mockLayer),
    Effect.runSync
  )
  
  expect(result.id).toBe(user.id)
  expect(result.name).toBe(user.name)
  expect(result.email).toBe(user.email)
})
```

## Conclusion

Pipeable provides the foundation for readable, composable, and type-safe function composition in Effect-TS. It enables elegant data transformation pipelines, robust error handling, and seamless integration with existing JavaScript ecosystems.

Key benefits:
- **Readability**: Left-to-right data flow matches natural reading patterns
- **Composability**: Functions naturally chain together without nesting
- **Type Safety**: Full TypeScript support maintains type inference through long chains
- **Consistency**: Universal interface works across all Effect types and custom implementations
- **Performance**: Efficient implementation with minimal overhead

Use Pipeable when building data processing pipelines, creating fluent APIs, or any scenario requiring clean function composition with maintained type safety.