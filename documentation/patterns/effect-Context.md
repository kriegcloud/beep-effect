# Context: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Context Solves

Modern applications face significant challenges with dependency management, service configuration, and maintaining type safety across complex service architectures. Traditional approaches lead to brittle, hard-to-test code:

```typescript
// Traditional approach - prop drilling nightmare
interface UserService {
  getUser(id: string): Promise<User>
}

interface EmailService {
  sendEmail(to: string, subject: string): Promise<void>
}

// Every function needs to pass dependencies down
async function processUser(
  userId: string,
  userService: UserService,
  emailService: EmailService,
  config: AppConfig,
  logger: Logger
) {
  const user = await userService.getUser(userId)
  await sendWelcomeEmail(user, emailService, config, logger)
}

async function sendWelcomeEmail(
  user: User,
  emailService: EmailService,
  config: AppConfig,
  logger: Logger
) {
  // Deep parameter passing continues...
  await logger.info(`Sending welcome email to ${user.email}`)
  await emailService.sendEmail(user.email, config.welcomeSubject)
}
```

This approach leads to:
- **Prop Drilling** - Dependencies passed through layers unnecessarily
- **Type Unsafety** - No compile-time guarantee services are available
- **Testing Complexity** - Mocking requires manual dependency injection
- **Configuration Chaos** - Global variables or complex dependency containers

### The Context Solution

Effect's Context system provides type-safe dependency injection that eliminates prop drilling while maintaining full type safety:

```typescript
import { Context, Effect } from "effect"

// Define service interfaces with Context.Tag
class UserService extends Context.Tag("UserService")<
  UserService,
  {
    readonly getUser: (id: string) => Effect.Effect<User, UserNotFound>
  }
>() {}

class EmailService extends Context.Tag("EmailService")<
  EmailService,
  {
    readonly sendEmail: (to: string, subject: string) => Effect.Effect<void, EmailError>
  }
>() {}

// Clean, focused functions that declare their dependencies
const processUser = (userId: string) =>
  Effect.gen(function* () {
    const userService = yield* UserService
    const user = yield* userService.getUser(userId)
    yield* sendWelcomeEmail(user)
  })

const sendWelcomeEmail = (user: User) =>
  Effect.gen(function* () {
    const emailService = yield* EmailService
    const config = yield* AppConfig
    yield* emailService.sendEmail(user.email, config.welcomeSubject)
  })
```

### Key Concepts

**Context**: A type-safe collection of services, functioning like a map with tags as keys and service instances as values.

**Tag**: A unique identifier for a service that enables Effect to locate and inject the correct service instance.

**Service**: A reusable component providing specific functionality, accessed through its tag within the context.

## Basic Usage Patterns

### Pattern 1: Creating Service Tags

```typescript
import { Context, Effect } from "effect"

// Define a service interface with its tag
class DatabaseService extends Context.Tag("DatabaseService")<
  DatabaseService,
  {
    readonly query: <T>(sql: string) => Effect.Effect<T[], DatabaseError>
    readonly transaction: <T>(
      work: Effect.Effect<T, DatabaseError>
    ) => Effect.Effect<T, DatabaseError>
  }
>() {}

// Service with configuration
class AppConfig extends Context.Tag("AppConfig")<
  AppConfig,
  {
    readonly database: {
      readonly host: string
      readonly port: number
      readonly name: string
    }
    readonly email: {
      readonly apiKey: string
      readonly from: string
    }
  }
>() {}
```

### Pattern 2: Using Services in Effects

```typescript
// Access services using yield* with the service tag
const getUserById = (id: string) =>
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const users = yield* db.query<User>("SELECT * FROM users WHERE id = ?", [id])
    
    if (users.length === 0) {
      return yield* Effect.fail(new UserNotFoundError(id))
    }
    
    return users[0]
  })

// Compose services naturally
const createUserWithWelcomeEmail = (userData: CreateUserData) =>
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const email = yield* EmailService
    const config = yield* AppConfig
    
    // Create user in database
    const [newUser] = yield* db.query<User>(
      "INSERT INTO users (...) VALUES (...) RETURNING *",
      [userData.name, userData.email]
    )
    
    // Send welcome email
    yield* email.sendEmail(
      newUser.email,
      config.email.welcomeSubject,
      generateWelcomeTemplate(newUser)
    )
    
    return newUser
  })
```

### Pattern 3: Providing Service Implementations

```typescript
import { Layer } from "effect"

// Create service implementations using layers
const DatabaseServiceLive = Layer.effect(
  DatabaseService,
  Effect.gen(function* () {
    const config = yield* AppConfig
    
    // Initialize database connection
    const connection = yield* Effect.promise(() =>
      createConnection({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
      })
    )
    
    return {
      query: <T>(sql: string, params?: unknown[]) =>
        Effect.promise(() => connection.query<T>(sql, params)),
      
      transaction: <T>(work: Effect.Effect<T, DatabaseError>) =>
        Effect.gen(function* () {
          yield* Effect.promise(() => connection.beginTransaction())
          
          const result = yield* work.pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* Effect.promise(() => connection.rollback())
                return yield* Effect.fail(error)
              })
            )
          )
          
          yield* Effect.promise(() => connection.commit())
          return result
        })
    }
  })
)
```

## Real-World Examples

### Example 1: Multi-Tenant Application Architecture

Building a SaaS application that serves multiple tenants with isolated data and configuration:

```typescript
import { Context, Effect, Layer } from "effect"

// Core tenant context
interface TenantContext {
  readonly tenantId: string
  readonly domain: string
  readonly features: readonly string[]
  readonly limits: {
    readonly maxUsers: number
    readonly maxProjects: number
  }
}

class TenantService extends Context.Tag("TenantService")<
  TenantService,
  {
    readonly getCurrentTenant: () => Effect.Effect<TenantContext, TenantNotFoundError>
    readonly validateFeature: (feature: string) => Effect.Effect<void, FeatureNotEnabledError>
    readonly checkLimit: (resource: string, current: number) => Effect.Effect<void, LimitExceededError>
  }
>() {}

// Tenant-aware database service
class TenantDatabaseService extends Context.Tag("TenantDatabaseService")<
  TenantDatabaseService,
  {
    readonly query: <T>(sql: string, params?: unknown[]) => Effect.Effect<T[], DatabaseError>
    readonly withTenantScope: <T>(
      operation: Effect.Effect<T, DatabaseError>
    ) => Effect.Effect<T, DatabaseError>
  }
>() {}

// Multi-tenant user management
const createTenantUser = (userData: CreateUserData) =>
  Effect.gen(function* () {
    const tenant = yield* TenantService
    const db = yield* TenantDatabaseService
    
    // Validate tenant features
    yield* tenant.validateFeature("user_management")
    
    // Check user limits
    const currentUserCount = yield* db.query<{ count: number }>(
      "SELECT COUNT(*) as count FROM users WHERE tenant_id = ?",
      [(yield* tenant.getCurrentTenant()).tenantId]
    )
    
    yield* tenant.checkLimit("users", currentUserCount[0].count)
    
    // Create user with tenant isolation
    return yield* db.withTenantScope(
      db.query<User>(
        "INSERT INTO users (tenant_id, name, email) VALUES (?, ?, ?) RETURNING *",
        [(yield* tenant.getCurrentTenant()).tenantId, userData.name, userData.email]
      )
    )
  })

// Tenant-specific service implementations
const TenantServiceLive = Layer.effect(
  TenantService,
  Effect.gen(function* () {
    // In real app, this might come from request headers or JWT token
    const tenantId = yield* Effect.service(RequestContext).pipe(
      Effect.map(ctx => ctx.headers["x-tenant-id"])
    )
    
    const db = yield* DatabaseService
    
    return {
      getCurrentTenant: () =>
        Effect.gen(function* () {
          const [tenant] = yield* db.query<TenantContext>(
            "SELECT * FROM tenants WHERE id = ?",
            [tenantId]
          )
          
          if (!tenant) {
            return yield* Effect.fail(new TenantNotFoundError(tenantId))
          }
          
          return tenant
        }),
      
      validateFeature: (feature: string) =>
        Effect.gen(function* () {
          const tenant = yield* TenantService.getCurrentTenant()
          
          if (!tenant.features.includes(feature)) {
            return yield* Effect.fail(new FeatureNotEnabledError(feature, tenant.tenantId))
          }
        }),
      
      checkLimit: (resource: string, current: number) =>
        Effect.gen(function* () {
          const tenant = yield* TenantService.getCurrentTenant()
          const limit = tenant.limits[resource as keyof typeof tenant.limits]
          
          if (current >= limit) {
            return yield* Effect.fail(new LimitExceededError(resource, current, limit))
          }
        })
    }
  })
)
```

### Example 2: Feature Flag Management System

A comprehensive feature flag system with user targeting, environment awareness, and A/B testing:

```typescript
import { Context, Effect, Layer } from "effect"

interface FeatureFlag {
  readonly key: string
  readonly enabled: boolean
  readonly rolloutPercentage: number
  readonly targeting: {
    readonly userIds?: readonly string[]
    readonly userGroups?: readonly string[]
    readonly environments?: readonly string[]
  }
  readonly variants?: Record<string, unknown>
}

interface UserContext {
  readonly userId: string
  readonly groups: readonly string[]
  readonly environment: string
  readonly attributes: Record<string, unknown>
}

class FeatureFlagService extends Context.Tag("FeatureFlagService")<
  FeatureFlagService,
  {
    readonly isEnabled: (flagKey: string) => Effect.Effect<boolean, FeatureFlagError>
    readonly getVariant: <T>(flagKey: string, defaultValue: T) => Effect.Effect<T, FeatureFlagError>
    readonly trackEvent: (flagKey: string, event: string) => Effect.Effect<void>
  }
>() {}

class UserContextService extends Context.Tag("UserContextService")<
  UserContextService,
  {
    readonly getCurrentUser: () => Effect.Effect<UserContext, UserContextError>
    readonly evaluateForUser: (
      flag: FeatureFlag,
      user: UserContext
    ) => Effect.Effect<boolean>
  }
>() {}

// Feature flag evaluation with sophisticated targeting
const evaluateFeatureFlag = (flagKey: string) =>
  Effect.gen(function* () {
    const flagService = yield* FeatureFlagService
    const userService = yield* UserContextService
    
    const flag = yield* flagService.getFlag(flagKey)
    const user = yield* userService.getCurrentUser()
    
    // Global flag check
    if (!flag.enabled) {
      yield* flagService.trackEvent(flagKey, "flag_disabled")
      return false
    }
    
    // User targeting evaluation
    const isTargeted = yield* userService.evaluateForUser(flag, user)
    
    if (!isTargeted) {
      yield* flagService.trackEvent(flagKey, "user_not_targeted")
      return false
    }
    
    // Rollout percentage check
    const hash = hashUser(user.userId, flagKey)
    const inRollout = hash % 100 < flag.rolloutPercentage
    
    yield* flagService.trackEvent(
      flagKey,
      inRollout ? "flag_enabled" : "rollout_excluded"
    )
    
    return inRollout
  })

// A/B test variant selection
const getABTestVariant = <T>(flagKey: string, variants: Record<string, T>) =>
  Effect.gen(function* () {
    const flagService = yield* FeatureFlagService
    const userService = yield* UserContextService
    
    const isEnabled = yield* flagService.isEnabled(flagKey)
    
    if (!isEnabled) {
      return "control" as keyof typeof variants
    }
    
    const user = yield* userService.getCurrentUser()
    const hash = hashUser(user.userId, flagKey)
    const variantKeys = Object.keys(variants)
    const selectedVariant = variantKeys[hash % variantKeys.length]
    
    yield* flagService.trackEvent(flagKey, `variant_${selectedVariant}`)
    
    return selectedVariant
  })

// Feature flag service implementation with caching
const FeatureFlagServiceLive = Layer.effect(
  FeatureFlagService,
  Effect.gen(function* () {
    const cache = yield* CacheService
    const db = yield* DatabaseService
    const analytics = yield* AnalyticsService
    
    return {
      isEnabled: (flagKey: string) =>
        Effect.gen(function* () {
          // Try cache first
          const cached = yield* cache.get(`flag:${flagKey}`).pipe(
            Effect.catchTag("CacheMiss", () => Effect.succeed(null))
          )
          
          if (cached !== null) {
            return cached.enabled
          }
          
          // Fetch from database
          const [flag] = yield* db.query<FeatureFlag>(
            "SELECT * FROM feature_flags WHERE key = ?",
            [flagKey]
          )
          
          if (!flag) {
            return yield* Effect.fail(new FeatureFlagNotFoundError(flagKey))
          }
          
          // Cache for 5 minutes
          yield* cache.set(`flag:${flagKey}`, flag, { ttl: 300 })
          
          return yield* evaluateFeatureFlag(flagKey)
        }),
      
      getVariant: <T>(flagKey: string, defaultValue: T) =>
        Effect.gen(function* () {
          const flag = yield* FeatureFlagService.getFlag(flagKey)
          const isEnabled = yield* FeatureFlagService.isEnabled(flagKey)
          
          if (!isEnabled || !flag.variants) {
            return defaultValue
          }
          
          const user = yield* UserContextService.getCurrentUser()
          const hash = hashUser(user.userId, flagKey)
          const variants = Object.entries(flag.variants)
          const [, selectedValue] = variants[hash % variants.length]
          
          return selectedValue as T
        }),
      
      trackEvent: (flagKey: string, event: string) =>
        analytics.track({
          event: `feature_flag_${event}`,
          properties: {
            flagKey,
            timestamp: new Date().toISOString()
          }
        })
    }
  })
)
```

### Example 3: Microservice Authentication Context

Enterprise-grade authentication system with JWT validation, role-based access control, and service-to-service authentication:

```typescript
import { Context, Effect, Layer } from "effect"

interface AuthUser {
  readonly userId: string
  readonly email: string
  readonly roles: readonly string[]
  readonly permissions: readonly string[]
  readonly tenantId?: string
  readonly sessionId: string
}

interface ServiceIdentity {
  readonly serviceId: string
  readonly serviceName: string
  readonly permissions: readonly string[]
  readonly issuer: string
}

type AuthContext = AuthUser | ServiceIdentity

class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    readonly getCurrentAuth: () => Effect.Effect<AuthContext, AuthenticationError>
    readonly hasPermission: (permission: string) => Effect.Effect<boolean>
    readonly requireRole: (role: string) => Effect.Effect<void, AuthorizationError>
    readonly requirePermission: (permission: string) => Effect.Effect<void, AuthorizationError>
  }
>() {}

class JWTService extends Context.Tag("JWTService")<
  JWTService,
  {
    readonly validateToken: (token: string) => Effect.Effect<AuthContext, JWTError>
    readonly refreshToken: (refreshToken: string) => Effect.Effect<string, JWTError>
  }
>() {}

// Secure endpoint protection
const requireAuthentication = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E | AuthenticationError, R | AuthService> =>
  Effect.gen(function* () {
    const auth = yield* AuthService
    yield* auth.getCurrentAuth() // Validates authentication
    return yield* effect
  })

// Role-based access control
const requireRole = (role: string) =>
  Effect.gen(function* () {
    const auth = yield* AuthService
    yield* auth.requireRole(role)
  })

// Permission-based access control
const requirePermissions = (...permissions: string[]) =>
  Effect.gen(function* () {
    const auth = yield* AuthService
    
    yield* Effect.forEach(permissions, (permission) =>
      auth.requirePermission(permission)
    )
  })

// Protected business operation
const deleteUser = (userId: string) =>
  Effect.gen(function* () {
    const db = yield* DatabaseService
    const audit = yield* AuditService
    const auth = yield* AuthService
    
    // Get current authenticated context
    const currentAuth = yield* auth.getCurrentAuth()
    
    // Log the operation for audit trail
    yield* audit.logOperation({
      operation: "delete_user",
      targetUserId: userId,
      performedBy: currentAuth,
      timestamp: new Date()
    })
    
    // Perform the deletion
    yield* db.query("DELETE FROM users WHERE id = ?", [userId])
  }).pipe(
    requirePermissions("users:delete"),
    requireRole("admin")
  )

// JWT-based authentication service
const AuthServiceLive = Layer.effect(
  AuthService,
  Effect.gen(function* () {
    const jwt = yield* JWTService
    const request = yield* RequestContext
    
    return {
      getCurrentAuth: () =>
        Effect.gen(function* () {
          const authHeader = request.headers.authorization
          
          if (!authHeader?.startsWith("Bearer ")) {
            return yield* Effect.fail(
              new AuthenticationError("Missing or invalid authorization header")
            )
          }
          
          const token = authHeader.slice(7)
          return yield* jwt.validateToken(token)
        }),
      
      hasPermission: (permission: string) =>
        Effect.gen(function* () {
          const auth = yield* AuthService.getCurrentAuth()
          return auth.permissions.includes(permission)
        }),
      
      requireRole: (role: string) =>
        Effect.gen(function* () {
          const auth = yield* AuthService.getCurrentAuth()
          
          if ("roles" in auth && !auth.roles.includes(role)) {
            return yield* Effect.fail(
              new AuthorizationError(`Role '${role}' required`)
            )
          }
          
          if ("serviceId" in auth) {
            // Service-to-service calls bypass role checks
            return
          }
        }),
      
      requirePermission: (permission: string) =>
        Effect.gen(function* () {
          const hasPermission = yield* AuthService.hasPermission(permission)
          
          if (!hasPermission) {
            return yield* Effect.fail(
              new AuthorizationError(`Permission '${permission}' required`)
            )
          }
        })
    }
  })
)

// JWT service implementation with token validation
const JWTServiceLive = Layer.effect(
  JWTService,
  Effect.gen(function* () {
    const config = yield* AppConfig
    const cache = yield* CacheService
    
    return {
      validateToken: (token: string) =>
        Effect.gen(function* () {
          // Check token blacklist cache
          const isBlacklisted = yield* cache.has(`blacklist:${token}`).pipe(
            Effect.catchAll(() => Effect.succeed(false))
          )
          
          if (isBlacklisted) {
            return yield* Effect.fail(new JWTError("Token is blacklisted"))
          }
          
          // Validate JWT signature and claims
          const payload = yield* Effect.promise(() =>
            jwt.verify(token, config.auth.jwtSecret)
          ).pipe(
            Effect.catchAll((error) =>
              Effect.fail(new JWTError(`Invalid token: ${error.message}`))
            )
          )
          
          // Check expiration
          if (payload.exp && payload.exp < Date.now() / 1000) {
            return yield* Effect.fail(new JWTError("Token expired"))
          }
          
          // Return appropriate auth context based on token type
          if (payload.sub.startsWith("service:")) {
            return {
              serviceId: payload.sub,
              serviceName: payload.service_name,
              permissions: payload.permissions || [],
              issuer: payload.iss
            } as ServiceIdentity
          } else {
            return {
              userId: payload.sub,
              email: payload.email,
              roles: payload.roles || [],
              permissions: payload.permissions || [],
              tenantId: payload.tenant_id,
              sessionId: payload.session_id
            } as AuthUser
          }
        }),
      
      refreshToken: (refreshToken: string) =>
        Effect.gen(function* () {
          const payload = yield* Effect.promise(() =>
            jwt.verify(refreshToken, config.auth.refreshSecret)
          )
          
          // Generate new access token
          return yield* Effect.promise(() =>
            jwt.sign(
              {
                sub: payload.sub,
                email: payload.email,
                roles: payload.roles,
                permissions: payload.permissions
              },
              config.auth.jwtSecret,
              { expiresIn: "15m" }
            )
          )
        })
    }
  })
)
```

## Advanced Features Deep Dive

### Context Composition and Merging

Context provides powerful composition patterns for managing complex service dependencies:

```typescript
import { Context, Effect, Layer } from "effect"

// Create contexts that can be composed
const createServiceContext = <Services>() => ({
  add: <Tag extends Context.Tag<any, any>>(
    tag: Tag,
    service: Context.Tag.Service<Tag>
  ): Context.Context<Services | Context.Tag.Identifier<Tag>> =>
    Context.add(Context.empty(), tag, service),
  
  merge: <Other>(
    other: Context.Context<Other>
  ): Context.Context<Services | Other> =>
    Context.merge(Context.empty<Services>(), other)
})

// Advanced context manipulation
const contextOperations = {
  // Pick specific services from a context
  pickServices: <Services, Keys extends keyof Services>(
    context: Context.Context<Services>,
    ...keys: Keys[]
  ): Context.Context<Pick<Services, Keys>> =>
    Context.pick(context, ...keys),
  
  // Omit services from a context
  omitServices: <Services, Keys extends keyof Services>(
    context: Context.Context<Services>,
    ...keys: Keys[]
  ): Context.Context<Omit<Services, Keys>> =>
    Context.omit(context, ...keys),
  
  // Transform a context
  mapContext: <Services, NewServices>(
    context: Context.Context<Services>,
    mapper: (ctx: Services) => NewServices
  ): Context.Context<NewServices> =>
    // Implementation would use Effect.mapContext or similar
    context as any // Simplified for example
}

// Environment-specific context building
const createEnvironmentContext = (env: "development" | "staging" | "production") =>
  Effect.gen(function* () {
    const baseContext = Context.empty()
    
    // Add common services
    const withCommon = Context.add(
      baseContext,
      LoggerService,
      createLogger({ level: env === "production" ? "warn" : "debug" })
    )
    
    // Add environment-specific services
    switch (env) {
      case "development":
        return Context.add(
          withCommon,
          DatabaseService,
          createMockDatabase()
        )
      case "staging":
        return Context.add(
          withCommon,
          DatabaseService,
          createStagingDatabase()
        )
      case "production":
        return Context.add(
          withCommon,
          DatabaseService,
          createProductionDatabase()
        )
    }
  })
```

### Dynamic Service Resolution

Context supports runtime service resolution and lazy initialization:

```typescript
import { Context, Effect, Layer, Ref } from "effect"

// Lazy service initialization
class LazyInitService extends Context.Tag("LazyInitService")<
  LazyInitService,
  {
    readonly getValue: () => Effect.Effect<string>
    readonly initialize: (value: string) => Effect.Effect<void>
  }
>() {}

const LazyInitServiceLive = Layer.effect(
  LazyInitService,
  Effect.gen(function* () {
    const valueRef = yield* Ref.make<string | null>(null)
    
    return {
      getValue: () =>
        Effect.gen(function* () {
          const current = yield* Ref.get(valueRef)
          
          if (current === null) {
            return yield* Effect.fail(new Error("Service not initialized"))
          }
          
          return current
        }),
      
      initialize: (value: string) =>
        Ref.set(valueRef, value)
    }
  })
)

// Conditional service provision
const conditionalServiceProvider = <T, E, R>(
  condition: boolean,
  trueService: Layer.Layer<T, E, R>,
  falseService: Layer.Layer<T, E, R>
): Layer.Layer<T, E, R> =>
  condition ? trueService : falseService

// Service factory pattern
interface ServiceFactory<T> {
  create(config: unknown): T
}

class DatabaseServiceFactory extends Context.Tag("DatabaseServiceFactory")<
  DatabaseServiceFactory,
  ServiceFactory<DatabaseConnection>
>() {}

const createDatabaseService = (config: DatabaseConfig) =>
  Effect.gen(function* () {
    const factory = yield* DatabaseServiceFactory
    const connection = factory.create(config)
    
    return {
      query: <T>(sql: string) =>
        Effect.promise(() => connection.query<T>(sql)),
      close: () =>
        Effect.promise(() => connection.close())
    }
  })
```

### Context Scoping and Isolation

Advanced scoping patterns for isolating contexts in different execution scopes:

```typescript
import { Context, Effect, Layer, FiberRef } from "effect"

// Request-scoped context
class RequestContext extends Context.Tag("RequestContext")<
  RequestContext,
  {
    readonly requestId: string
    readonly startTime: Date
    readonly metadata: Record<string, unknown>
  }
>() {}

// Create request-scoped execution
const withRequestScope = <A, E, R>(
  requestId: string,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | RequestContext> =>
  Effect.gen(function* () {
    const requestContext = {
      requestId,
      startTime: new Date(),
      metadata: {}
    }
    
    return yield* effect.pipe(
      Effect.provideService(RequestContext, requestContext)
    )
  })

// Thread-local context using FiberRef
const createThreadLocalContext = <T>(defaultValue: T) =>
  Effect.gen(function* () {
    const fiberRef = yield* FiberRef.make(defaultValue)
    
    return {
      get: FiberRef.get(fiberRef),
      set: (value: T) => FiberRef.set(fiberRef, value),
      locally: <A, E, R>(value: T, effect: Effect.Effect<A, E, R>) =>
        FiberRef.locally(fiberRef, value)(effect)
    }
  })

// Scoped service cleanup
const withResourceScope = <A, E, R>(
  acquire: Effect.Effect<A, E, R>,
  release: (resource: A) => Effect.Effect<void, never>,
  use: (resource: A) => Effect.Effect<void, E, R>
): Effect.Effect<void, E, R> =>
  Effect.acquireUseRelease(acquire, use, release)

// Example: Database transaction scope
const withTransactionScope = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E | DatabaseError, R | DatabaseService> =>
  Effect.gen(function* () {
    const db = yield* DatabaseService
    
    return yield* withResourceScope(
      // Acquire: Start transaction
      Effect.promise(() => db.beginTransaction()),
      // Release: Rollback if needed
      (tx) => Effect.promise(() => tx.rollback()).pipe(Effect.ignore),
      // Use: Execute in transaction context
      (tx) =>
        effect.pipe(
          Effect.provideService(TransactionContext, tx),
          Effect.tap(() => Effect.promise(() => tx.commit()))
        )
    )
  })
```

## Practical Patterns & Best Practices

### Pattern 1: Service Configuration Management

```typescript
import { Context, Effect, Layer, Config } from "effect"

// Hierarchical configuration pattern
interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly pool: {
    readonly min: number
    readonly max: number
    readonly idle: number
  }
}

interface RedisConfig {
  readonly host: string
  readonly port: number
  readonly keyPrefix: string
}

interface AppConfig {
  readonly database: DatabaseConfig
  readonly redis: RedisConfig
  readonly server: {
    readonly port: number
    readonly host: string
  }
}

// Configuration service with environment variable support
class ConfigService extends Context.Tag("ConfigService")<
  ConfigService,
  AppConfig
>() {}

const ConfigServiceLive = Layer.effect(
  ConfigService,
  Effect.gen(function* () {
    // Load configuration from environment variables with defaults
    const databaseConfig = yield* Effect.all({
      host: Config.withDefault(Config.string("DB_HOST"), "localhost"),
      port: Config.withDefault(Config.integer("DB_PORT"), 5432),
      database: Config.withDefault(Config.string("DB_NAME"), "app"),
      pool: Effect.succeed({
        min: 2,
        max: 10,
        idle: 30000
      })
    })
    
    const redisConfig = yield* Effect.all({
      host: Config.withDefault(Config.string("REDIS_HOST"), "localhost"),
      port: Config.withDefault(Config.integer("REDIS_PORT"), 6379),
      keyPrefix: Config.withDefault(Config.string("REDIS_PREFIX"), "app:")
    })
    
    const serverConfig = yield* Effect.all({
      port: Config.withDefault(Config.integer("PORT"), 3000),
      host: Config.withDefault(Config.string("HOST"), "0.0.0.0")
    })
    
    return {
      database: databaseConfig,
      redis: redisConfig,
      server: serverConfig
    }
  })
)

// Configuration validation pattern
const validateConfig = (config: AppConfig) =>
  Effect.gen(function* () {
    // Validate database configuration
    if (config.database.pool.min > config.database.pool.max) {
      return yield* Effect.fail(
        new ConfigurationError("Database pool min cannot be greater than max")
      )
    }
    
    // Validate server configuration
    if (config.server.port < 1 || config.server.port > 65535) {
      return yield* Effect.fail(
        new ConfigurationError("Server port must be between 1 and 65535")
      )
    }
    
    return config
  })
```

### Pattern 2: Plugin Architecture with Context

```typescript
import { Context, Effect, Layer } from "effect"

// Plugin interface
interface Plugin {
  readonly name: string
  readonly version: string
  readonly initialize: () => Effect.Effect<void, PluginError>
  readonly cleanup: () => Effect.Effect<void, never>
}

// Plugin registry service
class PluginRegistry extends Context.Tag("PluginRegistry")<
  PluginRegistry,
  {
    readonly register: (plugin: Plugin) => Effect.Effect<void, PluginError>
    readonly unregister: (name: string) => Effect.Effect<void, PluginError>
    readonly getPlugin: <T extends Plugin>(name: string) => Effect.Effect<T, PluginError>
    readonly listPlugins: () => Effect.Effect<readonly Plugin[]>
    readonly initializeAll: () => Effect.Effect<void, PluginError>
  }
>() {}

// Example plugin implementations
const authPlugin: Plugin = {
  name: "auth",
  version: "1.0.0",
  initialize: () =>
    Effect.gen(function* () {
      const config = yield* ConfigService
      yield* Effect.log(`Initializing auth plugin with config: ${config.auth}`)
      
      // Initialize authentication middleware
      yield* setupAuthMiddleware(config.auth)
    }),
  cleanup: () =>
    Effect.gen(function* () {
      yield* Effect.log("Cleaning up auth plugin")
      yield* cleanupAuthResources()
    })
}

const loggingPlugin: Plugin = {
  name: "logging",
  version: "2.1.0", 
  initialize: () =>
    Effect.gen(function* () {
      const config = yield* ConfigService
      yield* Effect.log(`Initializing logging plugin`)
      
      // Setup structured logging
      yield* configureLogger({
        level: config.logging.level,
        format: config.logging.format
      })
    }),
  cleanup: () =>
    Effect.gen(function* () {
      yield* Effect.log("Flushing logs and cleaning up")
      yield* flushLogs()
    })
}

// Plugin registry implementation
const PluginRegistryLive = Layer.effect(
  PluginRegistry,
  Effect.gen(function* () {
    const plugins = yield* Ref.make<Map<string, Plugin>>(new Map())
    
    return {
      register: (plugin: Plugin) =>
        Effect.gen(function* () {
          const currentPlugins = yield* Ref.get(plugins)
          
          if (currentPlugins.has(plugin.name)) {
            return yield* Effect.fail(
              new PluginError(`Plugin ${plugin.name} already registered`)
            )
          }
          
          yield* Ref.update(plugins, (map) => 
            new Map(map).set(plugin.name, plugin)
          )
          
          yield* Effect.log(`Registered plugin: ${plugin.name} v${plugin.version}`)
        }),
      
      unregister: (name: string) =>
        Effect.gen(function* () {
          const currentPlugins = yield* Ref.get(plugins)
          const plugin = currentPlugins.get(name)
          
          if (!plugin) {
            return yield* Effect.fail(
              new PluginError(`Plugin ${name} not found`)
            )
          }
          
          yield* plugin.cleanup()
          
          yield* Ref.update(plugins, (map) => {
            const newMap = new Map(map)
            newMap.delete(name)
            return newMap
          })
          
          yield* Effect.log(`Unregistered plugin: ${name}`)
        }),
      
      getPlugin: <T extends Plugin>(name: string) =>
        Effect.gen(function* () {
          const currentPlugins = yield* Ref.get(plugins)
          const plugin = currentPlugins.get(name)
          
          if (!plugin) {
            return yield* Effect.fail(
              new PluginError(`Plugin ${name} not found`)
            )
          }
          
          return plugin as T
        }),
      
      listPlugins: () =>
        Effect.gen(function* () {
          const currentPlugins = yield* Ref.get(plugins)
          return Array.from(currentPlugins.values())
        }),
      
      initializeAll: () =>
        Effect.gen(function* () {
          const allPlugins = yield* PluginRegistry.listPlugins()
          
          yield* Effect.forEach(allPlugins, (plugin) =>
            plugin.initialize().pipe(
              Effect.tap(() => Effect.log(`Initialized plugin: ${plugin.name}`)),
              Effect.catchAll((error) =>
                Effect.gen(function* () {
                  yield* Effect.logError(`Failed to initialize plugin ${plugin.name}: ${error}`)
                  return yield* Effect.fail(error)
                })
              )
            )
          )
        })
    }
  })
)

// Application initialization with plugins
const initializeApplication = () =>
  Effect.gen(function* () {
    const registry = yield* PluginRegistry
    
    // Register all plugins
    yield* registry.register(authPlugin)
    yield* registry.register(loggingPlugin)
    
    // Initialize all plugins
    yield* registry.initializeAll()
    
    yield* Effect.log("Application initialized successfully")
  })
```

### Pattern 3: Context-Aware Error Handling

```typescript
import { Context, Effect, Layer } from "effect"

// Error context service
class ErrorContext extends Context.Tag("ErrorContext")<
  ErrorContext,
  {
    readonly correlationId: string
    readonly userId?: string
    readonly operation: string
    readonly metadata: Record<string, unknown>
  }
>() {}

// Enhanced error reporting with context
class ErrorReportingService extends Context.Tag("ErrorReportingService")<
  ErrorReportingService,
  {
    readonly reportError: (error: Error, severity: "low" | "medium" | "high") => Effect.Effect<void>
    readonly trackMetric: (name: string, value: number, tags?: Record<string, string>) => Effect.Effect<void>
  }
>() {}

// Context-aware error handling
const withErrorContext = <A, E, R>(
  operation: string,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R | ErrorContext | ErrorReportingService> =>
  Effect.gen(function* () {
    const errorReporting = yield* ErrorReportingService
    const errorContext = yield* ErrorContext
    
    return yield* effect.pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          // Enrich error with context
          const enrichedError = new ContextualError(error, {
            correlationId: errorContext.correlationId,
            userId: errorContext.userId,
            operation: errorContext.operation,
            metadata: errorContext.metadata
          })
          
          // Report the error
          yield* errorReporting.reportError(
            enrichedError,
            classifyErrorSeverity(error)
          )
          
          // Track error metric
          yield* errorReporting.trackMetric("errors.count", 1, {
            operation: errorContext.operation,
            errorType: error.constructor.name
          })
          
          return yield* Effect.fail(error)
        })
      )
    )
  })

// Circuit breaker pattern with context
class CircuitBreakerService extends Context.Tag("CircuitBreakerService")<
  CircuitBreakerService,
  {
    readonly execute: <A, E, R>(
      name: string,
      effect: Effect.Effect<A, E, R>,
      options?: CircuitBreakerOptions
    ) => Effect.Effect<A, E | CircuitBreakerError, R>
  }
>() {}

const withCircuitBreaker = <A, E, R>(
  name: string,
  effect: Effect.Effect<A, E, R>,
  options?: CircuitBreakerOptions
): Effect.Effect<A, E | CircuitBreakerError, R | CircuitBreakerService> =>
  Effect.gen(function* () {
    const circuitBreaker = yield* CircuitBreakerService
    return yield* circuitBreaker.execute(name, effect, options)
  })

// Retry with exponential backoff and context
const withRetry = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  policy: RetryPolicy = { maxAttempts: 3, baseDelay: 1000 }
): Effect.Effect<A, E, R | ErrorReportingService> =>
  Effect.gen(function* () {
    const errorReporting = yield* ErrorReportingService
    
    return yield* effect.pipe(
      Effect.retry(
        Schedule.exponential("1 second").pipe(
          Schedule.compose(Schedule.recurs(policy.maxAttempts - 1))
        )
      ),
      Effect.catchAll((finalError) =>
        Effect.gen(function* () {
          yield* errorReporting.trackMetric("retries.exhausted", 1, {
            maxAttempts: policy.maxAttempts.toString()
          })
          
          return yield* Effect.fail(finalError)
        })
      )
    )
  })
```

## Integration Examples

### Integration with Express.js

```typescript
import { Context, Effect, Layer } from "effect"
import express from "express"

// Express integration layer
class ExpressContext extends Context.Tag("ExpressContext")<
  ExpressContext,
  {
    readonly req: express.Request
    readonly res: express.Response
    readonly next: express.NextFunction
  }
>() {}

// Convert Express middleware to Effect
const effectMiddleware = <R>(
  effectHandler: Effect.Effect<void, HttpError, R>
) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const context = { req, res, next }
  
  Effect.provide(
    effectHandler,
    Layer.succeed(ExpressContext, context)
  ).pipe(
    Effect.runPromise
  ).catch(next)
}

// Express route handler with Effect context
const createUserHandler = effectMiddleware(
  Effect.gen(function* () {
    const { req, res } = yield* ExpressContext
    const userService = yield* UserService
    const validator = yield* ValidationService
    
    // Validate request body
    const userData = yield* validator.validate(CreateUserSchema, req.body)
    
    // Create user
    const newUser = yield* userService.createUser(userData)
    
    // Send response
    res.status(201).json(newUser)
  })
)

// Setup Express app with Effect services
const setupExpressApp = () =>
  Effect.gen(function* () {
    const app = express()
    const config = yield* ConfigService
    
    app.use(express.json())
    
    // Register Effect-based routes
    app.post("/users", createUserHandler)
    app.get("/users/:id", getUserHandler)
    app.put("/users/:id", updateUserHandler)
    app.delete("/users/:id", deleteUserHandler)
    
    // Start server
    yield* Effect.promise(() =>
      new Promise<void>((resolve) => {
        app.listen(config.server.port, () => {
          console.log(`Server running on port ${config.server.port}`)
          resolve()
        })
      })
    )
    
    return app
  })
```

### Testing Strategies

```typescript
import { Context, Effect, Layer } from "effect"
import { describe, it, expect } from "vitest"

// Test utilities for context manipulation
const TestUtils = {
  // Create mock implementations
  createMockDatabase: (responses: Record<string, unknown[]>) =>
    DatabaseService.of({
      query: <T>(sql: string) => {
        const key = sql.split(" ")[0].toLowerCase()
        const mockData = responses[key] || []
        return Effect.succeed(mockData as T[])
      },
      transaction: <T>(work: Effect.Effect<T>) => work
    }),
  
  // Create test context with mocks
  createTestContext: (overrides: Partial<TestServices> = {}) => {
    const mockDb = TestUtils.createMockDatabase({
      select: [{ id: "1", name: "Test User", email: "test@example.com" }],
      insert: [{ id: "2", name: "New User", email: "new@example.com" }]
    })
    
    const mockEmail = EmailService.of({
      sendEmail: () => Effect.succeed(void 0)
    })
    
    const mockConfig = ConfigService.of({
      database: { host: "localhost", port: 5432, name: "test" },
      email: { apiKey: "test-key", from: "test@app.com" },
      server: { port: 3000, host: "localhost" }
    })
    
    return Layer.mergeAll(
      Layer.succeed(DatabaseService, overrides.database || mockDb),
      Layer.succeed(EmailService, overrides.email || mockEmail),
      Layer.succeed(ConfigService, overrides.config || mockConfig)
    )
  },
  
  // Run effect with test context
  runTest: <A, E>(
    effect: Effect.Effect<A, E, DatabaseService | EmailService | ConfigService>,
    overrides?: Partial<TestServices>
  ) =>
    Effect.provide(effect, TestUtils.createTestContext(overrides)).pipe(
      Effect.runPromise
    )
}

// Test suites with context
describe("User Service", () => {
  it("should create a user and send welcome email", async () => {
    const sentEmails: Array<{ to: string; subject: string }> = []
    
    const mockEmailService = EmailService.of({
      sendEmail: (to: string, subject: string) =>
        Effect.sync(() => {
          sentEmails.push({ to, subject })
        })
    })
    
    const result = await TestUtils.runTest(
      createUserWithWelcomeEmail({
        name: "Test User",
        email: "test@example.com"
      }),
      { email: mockEmailService }
    )
    
    expect(result).toEqual({
      id: "2",
      name: "New User", 
      email: "new@example.com"
    })
    
    expect(sentEmails).toHaveLength(1)
    expect(sentEmails[0].to).toBe("new@example.com")
  })
  
  it("should handle database errors gracefully", async () => {
    const mockDbWithError = DatabaseService.of({
      query: () => Effect.fail(new DatabaseError("Connection failed")),
      transaction: <T>(work: Effect.Effect<T>) => work
    })
    
    await expect(
      TestUtils.runTest(
        getUserById("1"),
        { database: mockDbWithError }
      )
    ).rejects.toThrow("Connection failed")
  })
})

// Property-based testing with context
describe("Feature Flag Service", () => {
  it("should maintain consistency across evaluations", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.integer({ min: 0, max: 100 }),
        fc.array(fc.string()),
        async (flagKey, percentage, userIds) => {
          const mockFlagService = FeatureFlagService.of({
            getFlag: () => Effect.succeed({
              key: flagKey,
              enabled: true,
              rolloutPercentage: percentage,
              targeting: { userIds },
              variants: {}
            }),
            trackEvent: () => Effect.succeed(void 0)
          })
          
          // Test that same user gets consistent results
          const userId = userIds[0] || "test-user"
          
          const result1 = await TestUtils.runTest(
            evaluateFeatureFlag(flagKey),
            { featureFlag: mockFlagService }
          )
          
          const result2 = await TestUtils.runTest(
            evaluateFeatureFlag(flagKey),
            { featureFlag: mockFlagService }
          )
          
          expect(result1).toBe(result2)
        }
      )
    )
  })
})
```

## Conclusion

Effect's Context system provides a robust, type-safe foundation for dependency management that eliminates common issues with traditional approaches. By leveraging Context tags, service composition, and layer-based dependency injection, developers can build maintainable, testable applications with clear separation of concerns.

Key benefits:
- **Type Safety**: Compile-time guarantees that all required services are available
- **Composability**: Services can be easily combined and composed without tight coupling  
- **Testability**: Mock implementations can be injected seamlessly for testing
- **Scalability**: Complex service architectures remain manageable as applications grow

Context shines in scenarios requiring sophisticated service management: multi-tenant applications, microservice architectures, feature flag systems, and any application where clean dependency management is crucial for maintainability and testing.