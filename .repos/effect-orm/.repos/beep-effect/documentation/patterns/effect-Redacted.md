# Redacted: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Redacted Solves

Modern applications handle sensitive data like API keys, passwords, database credentials, and user tokens. Traditional approaches to securing this data are error-prone and often lead to accidental exposure in logs, error messages, or serialized data:

```typescript
// Traditional approach - sensitive data exposed everywhere
interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string // Exposed in logs, errors, and serialization
  apiKey: string   // Leaked in debugging output
}

const config: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'super-secret-password',
  apiKey: 'sk-1234567890abcdef'
}

// Accidental exposure in logs
console.log('Database config:', config)
// Output: Database config: { host: 'localhost', port: 5432, username: 'admin', password: 'super-secret-password', apiKey: 'sk-1234567890abcdef' }

// Exposed in error messages
throw new Error(`Failed to connect with config: ${JSON.stringify(config)}`)
// Error: Failed to connect with config: {"host":"localhost","port":5432,"username":"admin","password":"super-secret-password","apiKey":"sk-1234567890abcdef"}

// Exposed in serialization
const serialized = JSON.stringify(config)
// Contains all sensitive data in plain text
```

This approach leads to:
- **Accidental Data Exposure** - Sensitive values leak into logs, error messages, and debug output
- **Security Vulnerabilities** - Credentials exposed in monitoring systems, crash reports, and serialized data
- **Compliance Issues** - Inadvertent logging of sensitive data violates privacy regulations
- **Debugging Hazards** - Developers accidentally expose secrets when debugging or sharing code

### The Redacted Solution

Effect's Redacted module provides a secure wrapper for sensitive data that prevents accidental exposure while maintaining type safety and functional programming benefits:

```typescript
import { Redacted, Effect, Data } from "effect"

// Secure configuration with redacted sensitive data
interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: Redacted.Redacted<string>
  apiKey: Redacted.Redacted<string>
}

const config: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: Redacted.make('super-secret-password'),
  apiKey: Redacted.make('sk-1234567890abcdef')
}

// Safe logging - sensitive data is hidden
console.log('Database config:', config)
// Output: Database config: { host: 'localhost', port: 5432, username: 'admin', password: '<redacted>', apiKey: '<redacted>' }

// Safe error handling
const errorMessage = `Failed to connect with config: ${JSON.stringify(config)}`
console.log(errorMessage)
// Output: Failed to connect with config: {"host":"localhost","port":5432,"username":"admin","password":"<redacted>","apiKey":"<redacted>"}

// Access values only when needed
const program = Effect.gen(function* () {
  const password = Redacted.value(config.password)
  const apiKey = Redacted.value(config.apiKey)
  
  // Use the actual values for connection
  return yield* connectToDatabase(config.host, config.port, config.username, password, apiKey)
})
```

### Key Concepts

**Redacted<A>**: A secure wrapper around sensitive data of type `A` that prevents accidental exposure while preserving type information and functional operations.

**Value Hiding**: Redacted values appear as `<redacted>` in logs, error messages, and serialization, preventing accidental exposure.

**Type Safety**: The type system ensures you explicitly unwrap values using `Redacted.value()`, making access to sensitive data intentional and trackable.

**Memory Safety**: Values can be wiped from memory using `unsafeWipe()` to prevent sensitive data from persisting longer than necessary.

**Equality Support**: Redacted values support structural equality comparison without exposing the underlying data.

## Basic Usage Patterns

### Pattern 1: Creating Redacted Values

```typescript
import { Redacted } from "effect"

// Create redacted values from sensitive data
const apiKey = Redacted.make("sk-1234567890abcdef")
const password = Redacted.make("my-secret-password")
const token = Redacted.make({ access_token: "abc123", refresh_token: "def456" })

// Values are hidden in string representation
console.log(apiKey.toString()) // "<redacted>"
console.log(String(password))  // "<redacted>"
console.log(JSON.stringify(token)) // "\"<redacted>\""
```

### Pattern 2: Accessing Redacted Values Safely

```typescript
import { Redacted, Effect } from "effect"

const databasePassword = Redacted.make("super-secret-db-password")

// Access the actual value only when needed
const connectToDatabase = Effect.gen(function* () {
  // Intentionally unwrap the sensitive value
  const password = Redacted.value(databasePassword)
  
  // Use the password for connection
  return yield* Effect.tryPromise({
    try: () => createConnection({ password }),
    catch: (error) => new DatabaseConnectionError({ cause: error })
  })
})
```

### Pattern 3: Comparing Redacted Values

```typescript
import { Redacted, Equivalence } from "effect"

const password1 = Redacted.make("same-password")
const password2 = Redacted.make("same-password")
const password3 = Redacted.make("different-password")

// Create an equivalence for secure comparison
const passwordEquivalence = Redacted.getEquivalence(Equivalence.string)

console.log(passwordEquivalence(password1, password2)) // true
console.log(passwordEquivalence(password1, password3)) // false

// Direct equality also works
import { Equal } from "effect"
console.log(Equal.equals(password1, password2)) // true
```

## Real-World Examples

### Example 1: Secure API Client Configuration

A common scenario where sensitive data must be handled securely while maintaining functionality:

```typescript
import { Redacted, Effect, Data, ConfigProvider } from "effect"

// Define API client configuration with redacted sensitive values
class ApiClientConfig extends Data.Class<{
  baseUrl: string
  apiKey: Redacted.Redacted<string>
  timeout: number
  retryAttempts: number
}> {}

// Secure configuration loading
const loadApiConfig = Effect.gen(function* () {
  const apiKey = yield* ConfigProvider.string("API_KEY")
  
  return new ApiClientConfig({
    baseUrl: "https://api.example.com",
    apiKey: Redacted.make(apiKey),
    timeout: 30000,
    retryAttempts: 3
  })
})

// API client with secure credential handling
class ApiClient {
  constructor(private config: ApiClientConfig) {}

  makeRequest = <T>(endpoint: string, body?: unknown) => {
    return Effect.gen(function* () {
      // Only unwrap the API key when making the actual request
      const apiKey = Redacted.value(this.config.apiKey)
      
      const response = yield* Effect.tryPromise({
        try: () => fetch(`${this.config.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }),
        catch: (error) => new ApiRequestError({ cause: error, endpoint })
      })
      
      return yield* Effect.promise(() => response.json() as Promise<T>)
    })
  }
  
  // Safe logging that doesn't expose credentials
  logConfig = Effect.gen(function* () {
    yield* Effect.log(`API Client Config: ${JSON.stringify(this.config)}`)
    // Logs: API Client Config: {"baseUrl":"https://api.example.com","apiKey":"<redacted>","timeout":30000,"retryAttempts":3}
  })
}

// Usage
const program = Effect.gen(function* () {
  const config = yield* loadApiConfig
  const client = new ApiClient(config)
  
  yield* client.logConfig // Safe to log - no credential exposure
  
  const result = yield* client.makeRequest<{ success: boolean }>("/users", {
    name: "John Doe"
  })
  
  return result
})

class ApiRequestError extends Data.TaggedError("ApiRequestError")<{
  cause: unknown
  endpoint: string
}> {}
```

### Example 2: Database Connection Management

Managing database credentials securely across connection pools and configurations:

```typescript
import { Redacted, Effect, Data, Layer, Context } from "effect"

// Database credentials with secure password handling
interface DatabaseCredentials {
  host: string
  port: number
  database: string
  username: string
  password: Redacted.Redacted<string>
  ssl: boolean
}

// Database service interface
interface DatabaseService {
  query: <T>(sql: string, params?: unknown[]) => Effect.Effect<T[], DatabaseError>
  transaction: <T>(operations: Effect.Effect<T[], DatabaseError>) => Effect.Effect<T[], DatabaseError>
  close: () => Effect.Effect<void>
}

const DatabaseService = Context.GenericTag<DatabaseService>("DatabaseService")

// Secure database connection layer
const makeDatabaseLayer = (credentials: DatabaseCredentials) => {
  return Layer.effect(
    DatabaseService,
    Effect.gen(function* () {
      // Only unwrap password when establishing connection
      const password = Redacted.value(credentials.password)
      
      const pool = yield* Effect.tryPromise({
        try: () => createDatabasePool({
          host: credentials.host,
          port: credentials.port,
          database: credentials.database,
          user: credentials.username,
          password: password, // Actual password only used here
          ssl: credentials.ssl,
          max: 10,
          idleTimeoutMillis: 30000
        }),
        catch: (error) => new DatabaseConnectionError({ cause: error })
      })

      // Safe logging - password is not exposed
      yield* Effect.log(`Connected to database: ${JSON.stringify(credentials)}`)
      
      return {
        query: <T>(sql: string, params?: unknown[]) => 
          Effect.tryPromise({
            try: () => pool.query(sql, params) as Promise<T[]>,
            catch: (error) => new DatabaseQueryError({ cause: error, sql })
          }),
          
        transaction: <T>(operations: Effect.Effect<T[], DatabaseError>) =>
          Effect.gen(function* () {
            const client = yield* Effect.tryPromise({
              try: () => pool.connect(),
              catch: (error) => new DatabaseConnectionError({ cause: error })
            })
            
            try {
              yield* Effect.promise(() => client.query('BEGIN'))
              const result = yield* operations
              yield* Effect.promise(() => client.query('COMMIT'))
              return result
            } catch (error) {
              yield* Effect.promise(() => client.query('ROLLBACK'))
              throw error
            } finally {
              client.release()
            }
          }),
          
        close: () => Effect.promise(() => pool.end())
      } satisfies DatabaseService
    })
  )
}

// Application configuration with secure credentials
const loadDatabaseConfig = Effect.gen(function* () {
  const host = yield* ConfigProvider.string("DB_HOST")
  const port = yield* ConfigProvider.integer("DB_PORT")
  const database = yield* ConfigProvider.string("DB_NAME")
  const username = yield* ConfigProvider.string("DB_USER")
  const password = yield* ConfigProvider.string("DB_PASSWORD")
  
  return {
    host,
    port,
    database,
    username,
    password: Redacted.make(password), // Secure the password
    ssl: true
  } satisfies DatabaseCredentials
})

// User service using secure database operations
const createUser = (userData: { name: string; email: string }) => {
  return Effect.gen(function* () {
    const db = yield* DatabaseService
    
    const result = yield* db.query<{ id: number; name: string; email: string }>(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [userData.name, userData.email]
    )
    
    return result[0]
  })
}

// Error types
class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown
}> {}

class DatabaseConnectionError extends Data.TaggedError("DatabaseConnectionError")<{
  cause: unknown
}> {}

class DatabaseQueryError extends Data.TaggedError("DatabaseQueryError")<{
  cause: unknown
  sql: string
}> {}

// Application setup
const program = Effect.gen(function* () {
  const config = yield* loadDatabaseConfig
  const user = yield* createUser({ name: "Alice", email: "alice@example.com" })
  
  return user
}).pipe(
  Effect.provide(
    loadDatabaseConfig.pipe(Effect.flatMap(makeDatabaseLayer))
  )
)
```

### Example 3: Secure Configuration Management

Managing application configuration with multiple levels of sensitive data:

```typescript
import { Redacted, Effect, Data, Config, ConfigProvider } from "effect"

// Multi-tier configuration with various sensitive values
class ApplicationConfig extends Data.Class<{
  server: {
    port: number
    host: string
  }
  database: {
    url: Redacted.Redacted<string>
    maxConnections: number
  }
  auth: {
    jwtSecret: Redacted.Redacted<string>
    sessionSecret: Redacted.Redacted<string>
    providers: {
      google: {
        clientId: string
        clientSecret: Redacted.Redacted<string>
      }
      github: {
        clientId: string
        clientSecret: Redacted.Redacted<string>
      }
    }
  }
  external: {
    redis: {
      url: Redacted.Redacted<string>
    }
    smtp: {
      host: string
      port: number
      username: string
      password: Redacted.Redacted<string>
    }
  }
}> {}

// Secure configuration loading with validation
const loadApplicationConfig = Effect.gen(function* () {
  // Load all configuration values
  const serverPort = yield* Config.withDefault(Config.integer("PORT"), 3000)
  const serverHost = yield* Config.withDefault(Config.string("HOST"), "localhost")
  
  const databaseUrl = yield* Config.string("DATABASE_URL")
  const maxConnections = yield* Config.withDefault(Config.integer("DB_MAX_CONNECTIONS"), 10)
  
  const jwtSecret = yield* Config.string("JWT_SECRET")
  const sessionSecret = yield* Config.string("SESSION_SECRET")
  
  const googleClientId = yield* Config.string("GOOGLE_CLIENT_ID")
  const googleClientSecret = yield* Config.string("GOOGLE_CLIENT_SECRET")
  
  const githubClientId = yield* Config.string("GITHUB_CLIENT_ID")
  const githubClientSecret = yield* Config.string("GITHUB_CLIENT_SECRET")
  
  const redisUrl = yield* Config.string("REDIS_URL")
  
  const smtpHost = yield* Config.string("SMTP_HOST")
  const smtpPort = yield* Config.integer("SMTP_PORT")
  const smtpUsername = yield* Config.string("SMTP_USERNAME")
  const smtpPassword = yield* Config.string("SMTP_PASSWORD")
  
  return new ApplicationConfig({
    server: {
      port: serverPort,
      host: serverHost
    },
    database: {
      url: Redacted.make(databaseUrl),
      maxConnections
    },
    auth: {
      jwtSecret: Redacted.make(jwtSecret),
      sessionSecret: Redacted.make(sessionSecret),
      providers: {
        google: {
          clientId: googleClientId,
          clientSecret: Redacted.make(googleClientSecret)
        },
        github: {
          clientId: githubClientId,
          clientSecret: Redacted.make(githubClientSecret)
        }
      }
    },
    external: {
      redis: {
        url: Redacted.make(redisUrl)
      },
      smtp: {
        host: smtpHost,
        port: smtpPort,
        username: smtpUsername,
        password: Redacted.make(smtpPassword)
      }
    }
  })
})

// JWT service using secure configuration
const createJwtService = (config: ApplicationConfig) => {
  const sign = (payload: Record<string, unknown>) => {
    return Effect.gen(function* () {
      const secret = Redacted.value(config.auth.jwtSecret)
      
      return yield* Effect.tryPromise({
        try: () => jwt.sign(payload, secret, { expiresIn: '1h' }),
        catch: (error) => new JwtSignError({ cause: error })
      })
    })
  }
  
  const verify = (token: string) => {
    return Effect.gen(function* () {
      const secret = Redacted.value(config.auth.jwtSecret)
      
      return yield* Effect.tryPromise({
        try: () => jwt.verify(token, secret) as Record<string, unknown>,
        catch: (error) => new JwtVerifyError({ cause: error })
      })
    })
  }
  
  return { sign, verify }
}

// Email service using secure SMTP configuration
const createEmailService = (config: ApplicationConfig) => {
  const transporter = Effect.gen(function* () {
    const password = Redacted.value(config.external.smtp.password)
    
    return yield* Effect.tryPromise({
      try: () => nodemailer.createTransporter({
        host: config.external.smtp.host,
        port: config.external.smtp.port,
        secure: config.external.smtp.port === 465,
        auth: {
          user: config.external.smtp.username,
          pass: password
        }
      }),
      catch: (error) => new EmailTransporterError({ cause: error })
    })
  })
  
  const sendEmail = (to: string, subject: string, html: string) => {
    return Effect.gen(function* () {
      const transport = yield* transporter
      
      return yield* Effect.tryPromise({
        try: () => transport.sendMail({
          from: config.external.smtp.username,
          to,
          subject,
          html
        }),
        catch: (error) => new EmailSendError({ cause: error })
      })
    })
  }
  
  return { sendEmail }
}

// Configuration validation and startup
const validateConfig = (config: ApplicationConfig) => {
  return Effect.gen(function* () {
    // Validate that all required secrets are present
    const jwtSecret = Redacted.value(config.auth.jwtSecret)
    const sessionSecret = Redacted.value(config.auth.sessionSecret)
    
    if (jwtSecret.length < 32) {
      return yield* Effect.fail(new ConfigValidationError({ 
        field: 'JWT_SECRET', 
        message: 'Must be at least 32 characters' 
      }))
    }
    
    if (sessionSecret.length < 32) {
      return yield* Effect.fail(new ConfigValidationError({ 
        field: 'SESSION_SECRET', 
        message: 'Must be at least 32 characters' 
      }))
    }
    
    // Log configuration (safely, without exposing secrets)
    yield* Effect.log(`Application configuration loaded: ${JSON.stringify(config)}`)
    
    return config
  })
}

// Error types
class JwtSignError extends Data.TaggedError("JwtSignError")<{
  cause: unknown
}> {}

class JwtVerifyError extends Data.TaggedError("JwtVerifyError")<{
  cause: unknown
}> {}

class EmailTransporterError extends Data.TaggedError("EmailTransporterError")<{
  cause: unknown
}> {}

class EmailSendError extends Data.TaggedError("EmailSendError")<{
  cause: unknown
}> {}

class ConfigValidationError extends Data.TaggedError("ConfigValidationError")<{
  field: string
  message: string
}> {}

// Application startup
const program = Effect.gen(function* () {
  const config = yield* loadApplicationConfig
  const validatedConfig = yield* validateConfig(config)
  
  const jwtService = createJwtService(validatedConfig)
  const emailService = createEmailService(validatedConfig)
  
  // Services are now ready with secure configuration
  return { jwtService, emailService, config: validatedConfig }
})
```

## Advanced Features Deep Dive

### Feature 1: Memory Management with unsafeWipe

Control the lifecycle of sensitive data in memory to prevent information leakage:

#### Basic Memory Wiping

```typescript
import { Redacted, Effect } from "effect"

// Create a temporary sensitive value
const temporaryToken = Redacted.make("temp-access-token-12345")

const useTokenOnce = Effect.gen(function* () {
  // Use the token
  const token = Redacted.value(temporaryToken)
  const result = yield* makeApiCall(token)
  
  // Immediately wipe the token from memory
  Redacted.unsafeWipe(temporaryToken)
  
  return result
})

// After wiping, the token is no longer accessible
const tryAccessAfterWipe = Effect.gen(function* () {
  try {
    const token = Redacted.value(temporaryToken)
    return token
  } catch (error) {
    // Error: Unable to get redacted value
    return yield* Effect.fail(new TokenWipedError())
  }
})
```

#### Advanced Memory Management Pattern

```typescript
import { Redacted, Effect, Scope } from "effect"

// Scoped credential management
const withTemporaryCredentials = <T>(
  credentials: string,
  operation: (redacted: Redacted.Redacted<string>) => Effect.Effect<T, unknown, Scope.Scope>
) => {
  return Effect.gen(function* () {
    const redactedCredentials = Redacted.make(credentials)
    
    const result = yield* Scope.make.pipe(
      Effect.flatMap(scope => 
        Effect.gen(function* () {
          // Add cleanup to scope
          yield* Scope.addFinalizer(scope, 
            Effect.sync(() => Redacted.unsafeWipe(redactedCredentials))
          )
          
          // Execute operation with scoped credentials
          return yield* operation(redactedCredentials).pipe(
            Effect.provideService(Scope.Scope, scope)
          )
        })
      )
    )
    
    return result
  })
}

// Usage with automatic cleanup
const program = Effect.gen(function* () {
  const result = yield* withTemporaryCredentials(
    "temporary-api-key",
    (redactedKey) => Effect.gen(function* () {
      const key = Redacted.value(redactedKey)
      return yield* makeApiCall(key)
    })
  )
  
  // Credentials are automatically wiped when scope closes
  return result
})
```

### Feature 2: Structural Equality and Comparison

Securely compare redacted values without exposing their contents:

#### Custom Equivalence Relations

```typescript
import { Redacted, Equivalence, Equal } from "effect"

// Custom equivalence for case-insensitive API key comparison
const apiKeyEquivalence = Redacted.getEquivalence(
  Equivalence.make<string>((a, b) => a.toLowerCase() === b.toLowerCase())
)

const key1 = Redacted.make("API-KEY-12345")
const key2 = Redacted.make("api-key-12345")
const key3 = Redacted.make("different-key")

console.log(apiKeyEquivalence(key1, key2)) // true (case-insensitive match)
console.log(apiKeyEquivalence(key1, key3)) // false

// Complex object equivalence
interface Credentials {
  username: string
  password: string
  apiKey: string
}

const credentialsEquivalence = Redacted.getEquivalence(
  Equivalence.struct<Credentials>({
    username: Equivalence.string,
    password: Equivalence.string,
    apiKey: Equivalence.string
  })
)

const creds1 = Redacted.make({ 
  username: "admin", 
  password: "secret", 
  apiKey: "key123" 
})

const creds2 = Redacted.make({ 
  username: "admin", 
  password: "secret", 
  apiKey: "key123" 
})

console.log(credentialsEquivalence(creds1, creds2)) // true
```

#### Redacted Collections

```typescript
import { Redacted, HashSet, HashMap, Equal } from "effect"

// Set of redacted API keys (automatically deduplicated)
const apiKeys = HashSet.fromIterable([
  Redacted.make("key-1"),
  Redacted.make("key-2"),
  Redacted.make("key-1"), // Duplicate, will be removed
  Redacted.make("key-3")
])

console.log(HashSet.size(apiKeys)) // 3 (duplicate removed)

// Map with redacted values
const userTokens = HashMap.fromIterable([
  ["user1", Redacted.make("token-abc123")],
  ["user2", Redacted.make("token-def456")],
  ["user3", Redacted.make("token-ghi789")]
])

// Safe iteration - tokens remain redacted
HashMap.forEach(userTokens, (token, userId) => {
  console.log(`User ${userId} has token: ${token}`) // Tokens appear as <redacted>
})
```

### Feature 3: Schema Integration

Integrate Redacted with Effect Schema for validation and transformation:

```typescript
import { Redacted, Schema, Effect } from "effect"

// Schema for configuration with redacted values
const DatabaseConfigSchema = Schema.Struct({
  host: Schema.String,
  port: Schema.Number,
  database: Schema.String,
  username: Schema.String,
  password: Schema.transform(
    Schema.String,
    Schema.instanceOf(Redacted.Redacted),
    {
      decode: (s) => Redacted.make(s),
      encode: (r) => Redacted.value(r)
    }
  )
})

// API key validation schema
const ApiKeySchema = Schema.transform(
  Schema.String.pipe(
    Schema.minLength(20),
    Schema.maxLength(100),
    Schema.pattern(/^[a-zA-Z0-9_-]+$/)
  ),
  Schema.instanceOf(Redacted.Redacted),
  {
    decode: (s) => Redacted.make(s),
    encode: (r) => Redacted.value(r)
  }
)

// JWT token schema with validation
const JwtTokenSchema = Schema.transform(
  Schema.String.pipe(
    Schema.pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
  ),
  Schema.instanceOf(Redacted.Redacted),
  {
    decode: (s) => Redacted.make(s),
    encode: (r) => Redacted.value(r)
  }
)

// Usage with validation
const parseConfig = (input: unknown) => {
  return Effect.gen(function* () {
    const config = yield* Schema.decodeUnknown(DatabaseConfigSchema)(input)
    
    // Config now has properly typed and redacted password
    console.log(config) // Password appears as <redacted>
    
    return config
  })
}
```

## Practical Patterns & Best Practices

### Pattern 1: Redacted Service Configuration

Create reusable patterns for service configuration with multiple sensitive values:

```typescript
import { Redacted, Effect, Data, Layer, Context } from "effect"

// Helper for creating redacted configuration
const createRedactedConfig = <T extends Record<string, unknown>>(
  config: T,
  sensitiveKeys: Array<keyof T>
): T & Record<string, Redacted.Redacted<unknown>> => {
  const result = { ...config }
  
  for (const key of sensitiveKeys) {
    if (key in result) {
      result[key] = Redacted.make(result[key])
    }
  }
  
  return result as T & Record<string, Redacted.Redacted<unknown>>
}

// Email service configuration
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  from: string
}

const createEmailConfig = (config: EmailConfig) => {
  return createRedactedConfig(config, ['password'])
}

// OAuth provider configuration
interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
}

const createOAuthConfig = (config: OAuthConfig) => {
  return createRedactedConfig(config, ['clientSecret'])
}

// Service factory with redacted config
const createServiceWithConfig = <Config, Service>(
  config: Config,
  factory: (config: Config) => Service
) => {
  return factory(config)
}
```

### Pattern 2: Secure Logging and Monitoring

Implement logging that automatically handles redacted values:

```typescript
import { Redacted, Effect, Logger, LogLevel } from "effect"

// Safe logger that handles redacted values
const createSecureLogger = (serviceName: string) => {
  const logWithContext = (level: LogLevel.LogLevel, message: string, context?: Record<string, unknown>) => {
    return Effect.gen(function* () {
      const safeContext = context ? JSON.stringify(context) : undefined
      const logMessage = safeContext 
        ? `[${serviceName}] ${message} - Context: ${safeContext}`
        : `[${serviceName}] ${message}`
      
      yield* Effect.log(logMessage).pipe(
        Logger.withLogLevel(level)
      )
    })
  }
  
  return {
    info: (message: string, context?: Record<string, unknown>) => 
      logWithContext(LogLevel.Info, message, context),
    
    error: (message: string, context?: Record<string, unknown>) => 
      logWithContext(LogLevel.Error, message, context),
    
    debug: (message: string, context?: Record<string, unknown>) => 
      logWithContext(LogLevel.Debug, message, context),
    
    // Special method for logging operations with redacted values
    secureOperation: (operation: string, redactedValues: Record<string, Redacted.Redacted<unknown>>) =>
      Effect.gen(function* () {
        const context = Object.fromEntries(
          Object.entries(redactedValues).map(([key, value]) => [key, value.toString()])
        )
        
        yield* logWithContext(LogLevel.Info, `Performing ${operation}`, context)
      })
  }
}

// Usage example
const authService = Effect.gen(function* () {
  const logger = createSecureLogger("AuthService")
  const apiKey = Redacted.make("secret-api-key")
  
  yield* logger.secureOperation("API authentication", { apiKey })
  // Logs: [AuthService] Performing API authentication - Context: {"apiKey":"<redacted>"}
  
  return "authenticated"
})
```

### Pattern 3: Configuration Validation Pipeline

Build a comprehensive validation pipeline for configurations with sensitive data:

```typescript
import { Redacted, Effect, Config, Data, Schema } from "effect"

// Configuration validation errors
class ConfigurationError extends Data.TaggedError("ConfigurationError")<{
  field: string
  message: string
  cause?: unknown
}> {}

// Validation pipeline for sensitive configuration
const validateSensitiveConfig = <T>(
  configSchema: Schema.Schema<T>,
  sensitiveFields: Array<keyof T>,
  validators: Partial<Record<keyof T, (value: unknown) => Effect.Effect<boolean, ConfigurationError>>>
) => {
  return (input: unknown) => Effect.gen(function* () {
    // First, validate the basic schema
    const config = yield* Schema.decodeUnknown(configSchema)(input).pipe(
      Effect.mapError(error => new ConfigurationError({
        field: "schema",
        message: "Invalid configuration structure",
        cause: error
      }))
    )
    
    // Then validate sensitive fields
    for (const field of sensitiveFields) {
      const value = config[field]
      const validator = validators[field]
      
      if (validator && value !== undefined) {
        const isValid = yield* validator(value)
        if (!isValid) {
          return yield* Effect.fail(new ConfigurationError({
            field: String(field),
            message: `Invalid ${String(field)} format or value`
          }))
        }
      }
    }
    
    return config
  })
}

// Example usage with database configuration
const DatabaseConfigSchema = Schema.Struct({
  host: Schema.String,
  port: Schema.Number,
  database: Schema.String,
  username: Schema.String,
  password: Schema.String,
  ssl: Schema.Boolean
})

const validateDatabaseConfig = validateSensitiveConfig(
  DatabaseConfigSchema,
  ['password'],
  {
    password: (value) => Effect.gen(function* () {
      const password = value as string
      
      // Validate password strength
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      const isLongEnough = password.length >= 12
      
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough
    }),
    
    host: (value) => Effect.gen(function* () {
      const host = value as string
      // Validate host format (simplified)
      return host.length > 0 && !host.includes(' ')
    })
  }
)

// Secure configuration loader
const loadSecureConfig = Effect.gen(function* () {
  const rawConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'myapp',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true'
  }
  
  const validatedConfig = yield* validateDatabaseConfig(rawConfig)
  
  // Redact sensitive fields after validation
  return {
    ...validatedConfig,
    password: Redacted.make(validatedConfig.password)
  }
})
```

## Integration Examples

### Integration with Express.js and HTTP Middleware

Secure handling of authentication tokens and session data in web applications:

```typescript
import { Redacted, Effect, Data } from "effect"
import express from "express"

// Session data with redacted sensitive values
interface SessionData {
  userId: string
  email: string
  accessToken: Redacted.Redacted<string>
  refreshToken: Redacted.Redacted<string>
  expiresAt: Date
}

// Authentication middleware with secure token handling
const createAuthMiddleware = (jwtSecret: Redacted.Redacted<string>) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }
    
    const token = authHeader.substring(7)
    const redactedToken = Redacted.make(token)
    
    // Verify token using redacted JWT secret
    const verificationProgram = Effect.gen(function* () {
      const secret = Redacted.value(jwtSecret)
      const payload = yield* Effect.tryPromise({
        try: () => jwt.verify(token, secret) as { userId: string; email: string },
        catch: (error) => new InvalidTokenError({ cause: error })
      })
      
      return payload
    })
    
    Effect.runPromise(verificationProgram)
      .then(payload => {
        // Store redacted token in request for later use
        req.user = {
          ...payload,
          token: redactedToken
        }
        next()
      })
      .catch(error => {
        res.status(401).json({ error: 'Invalid token' })
      })
  }
}

// OAuth integration with secure credential handling
const createOAuthIntegration = (config: {
  clientId: string
  clientSecret: Redacted.Redacted<string>
  redirectUri: string
}) => {
  const exchangeCodeForToken = (code: string) => {
    return Effect.gen(function* () {
      const clientSecret = Redacted.value(config.clientSecret)
      
      const response = yield* Effect.tryPromise({
        try: () => fetch('https://oauth.provider.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: config.clientId,
            client_secret: clientSecret,
            code: code,
            redirect_uri: config.redirectUri
          })
        }),
        catch: (error) => new OAuthError({ cause: error })
      })
      
      const data = yield* Effect.tryPromise({
        try: () => response.json() as Promise<{
          access_token: string
          refresh_token: string
          expires_in: number
        }>,
        catch: (error) => new OAuthError({ cause: error })
      })
      
      return {
        accessToken: Redacted.make(data.access_token),
        refreshToken: Redacted.make(data.refresh_token),
        expiresIn: data.expires_in
      }
    })
  }
  
  return { exchangeCodeForToken }
}

// Error types
class InvalidTokenError extends Data.TaggedError("InvalidTokenError")<{
  cause: unknown
}> {}

class OAuthError extends Data.TaggedError("OAuthError")<{
  cause: unknown
}> {}

// Express application setup
const app = express()
const jwtSecret = Redacted.make(process.env.JWT_SECRET || 'fallback-secret')

app.use(createAuthMiddleware(jwtSecret))

app.get('/profile', (req, res) => {
  // User token is available as redacted value
  const user = req.user as { userId: string; email: string; token: Redacted.Redacted<string> }
  
  // Safe logging - token is not exposed
  console.log('Profile accessed by user:', { userId: user.userId, email: user.email, token: user.token })
  
  res.json({ userId: user.userId, email: user.email })
})
```

### Integration with Node.js CLI Applications

Secure credential management for command-line tools and scripts:

```typescript
import { Redacted, Effect, Config, Data } from "effect"
import { Command, Options, Args } from "@effect/cli"

// CLI configuration with secure credential handling
interface CliConfig {
  apiKey: Redacted.Redacted<string>
  endpoint: string
  outputFormat: 'json' | 'table' | 'csv'
  verbose: boolean
}

// Secure credential loading from multiple sources
const loadCredentials = Effect.gen(function* () {
  // Try environment variable first
  const envApiKey = process.env.API_KEY
  if (envApiKey) {
    return Redacted.make(envApiKey)
  }
  
  // Try reading from secure credential file
  const credFile = process.env.HOME + '/.myapp/credentials'
  const fileContent = yield* Effect.tryPromise({
    try: () => import('fs').then(fs => fs.promises.readFile(credFile, 'utf8')),
    catch: () => new CredentialNotFoundError({ source: 'file', path: credFile })
  })
  
  const credentials = JSON.parse(fileContent)
  if (!credentials.apiKey) {
    return yield* Effect.fail(new CredentialNotFoundError({ 
      source: 'file', 
      path: credFile 
    }))
  }
  
  return Redacted.make(credentials.apiKey)
})

// CLI command with secure API integration
const listCommand = Command.make("list", {
  options: Options.all({
    endpoint: Options.withDefault(Options.text("endpoint"), "https://api.example.com"),
    format: Options.withDefault(Options.choice("format", ["json", "table", "csv"]), "table"),
    verbose: Options.withDefault(Options.boolean("verbose"), false)
  })
}, (options) => {
  return Effect.gen(function* () {
    const apiKey = yield* loadCredentials
    
    if (options.verbose) {
      console.log(`Connecting to ${options.endpoint}...`)
      // API key is safely hidden in any logging
      console.log(`Using API key: ${apiKey}`)
    }
    
    const data = yield* makeApiRequest(options.endpoint, apiKey)
    
    switch (options.format) {
      case 'json':
        console.log(JSON.stringify(data, null, 2))
        break
      case 'table':
        console.table(data)
        break
      case 'csv':
        console.log(convertToCsv(data))
        break
    }
  })
})

// Secure API request function
const makeApiRequest = (endpoint: string, apiKey: Redacted.Redacted<string>) => {
  return Effect.gen(function* () {
    const key = Redacted.value(apiKey)
    
    const response = yield* Effect.tryPromise({
      try: () => fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }),
      catch: (error) => new ApiRequestError({ cause: error, endpoint })
    })
    
    return yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => new ApiResponseError({ cause: error })
    })
  })
}

// Error types
class CredentialNotFoundError extends Data.TaggedError("CredentialNotFoundError")<{
  source: string
  path?: string
}> {}

class ApiRequestError extends Data.TaggedError("ApiRequestError")<{
  cause: unknown
  endpoint: string
}> {}

class ApiResponseError extends Data.TaggedError("ApiResponseError")<{
  cause: unknown
}> {}

// Helper functions
const convertToCsv = (data: unknown[]): string => {
  // CSV conversion implementation
  return data.map(row => Object.values(row as Record<string, unknown>).join(',')).join('\n')
}

// CLI application setup
const program = Command.run(listCommand, {
  name: "MyApp CLI",
  version: "1.0.0"
})

// Run the CLI
Effect.runPromise(program)
```

### Testing Strategies

Comprehensive testing approaches for applications using Redacted values:

```typescript
import { Redacted, Effect, Equal } from "effect"
import { describe, it, expect } from "bun:test"

// Test utilities for redacted values
const createTestRedacted = <T>(value: T): Redacted.Redacted<T> => {
  return Redacted.make(value)
}

const expectRedactedEqual = <T>(
  actual: Redacted.Redacted<T>,
  expected: Redacted.Redacted<T>
): void => {
  expect(Equal.equals(actual, expected)).toBe(true)
}

const expectRedactedValue = <T>(
  redacted: Redacted.Redacted<T>,
  expected: T
): void => {
  expect(Redacted.value(redacted)).toEqual(expected)
}

// Test configuration service
describe("ConfigurationService", () => {
  it("should load configuration with redacted values", async () => {
    const config = await Effect.runPromise(
      loadApplicationConfig.pipe(
        Effect.provideService(ConfigProvider.ConfigProvider, 
          ConfigProvider.fromMap(new Map([
            ["DATABASE_URL", "postgresql://user:password@localhost:5432/test"],
            ["JWT_SECRET", "test-jwt-secret-key"],
            ["API_KEY", "test-api-key-12345"]
          ]))
        )
      )
    )
    
    // Verify that sensitive values are redacted
    expect(config.database.url.toString()).toBe("<redacted>")
    expect(config.auth.jwtSecret.toString()).toBe("<redacted>")
    
    // Verify actual values when needed for testing
    expectRedactedValue(config.database.url, "postgresql://user:password@localhost:5432/test")
    expectRedactedValue(config.auth.jwtSecret, "test-jwt-secret-key")
  })
  
  it("should validate redacted values", async () => {
    const validConfig = createTestRedacted("valid-jwt-secret-that-is-long-enough")
    const invalidConfig = createTestRedacted("short")
    
    const validationResult = await Effect.runPromise(
      validateJwtSecret(validConfig)
    )
    
    expect(validationResult).toBe(true)
    
    await expect(
      Effect.runPromise(validateJwtSecret(invalidConfig))
    ).rejects.toThrow("JWT secret must be at least 32 characters")
  })
  
  it("should compare redacted values securely", () => {
    const password1 = createTestRedacted("same-password")
    const password2 = createTestRedacted("same-password")
    const password3 = createTestRedacted("different-password")
    
    expectRedactedEqual(password1, password2)
    expect(Equal.equals(password1, password3)).toBe(false)
  })
  
  it("should handle memory wiping", () => {
    const temporarySecret = createTestRedacted("temporary-secret")
    
    // Verify value is accessible
    expect(Redacted.value(temporarySecret)).toBe("temporary-secret")
    
    // Wipe the value
    Redacted.unsafeWipe(temporarySecret)
    
    // Verify value is no longer accessible
    expect(() => Redacted.value(temporarySecret)).toThrow("Unable to get redacted value")
  })
})

// Test service with redacted configuration
describe("DatabaseService", () => {
  const createTestConfig = (overrides: Partial<DatabaseCredentials> = {}) => ({
    host: "localhost",
    port: 5432,
    database: "test",
    username: "testuser",
    password: createTestRedacted("testpassword"),
    ssl: false,
    ...overrides
  })
  
  it("should connect using redacted credentials", async () => {
    const config = createTestConfig()
    const mockConnection = vi.fn().mockResolvedValue({ query: vi.fn() })
    
    const service = await Effect.runPromise(
      createDatabaseService(config, mockConnection)
    )
    
    expect(mockConnection).toHaveBeenCalledWith({
      host: "localhost",
      port: 5432,
      database: "test",
      user: "testuser",
      password: "testpassword", // Actual password passed to connection
      ssl: false
    })
    
    expect(service).toBeDefined()
  })
  
  it("should log safely without exposing credentials", async () => {
    const config = createTestConfig()
    const logSpy = vi.spyOn(console, 'log')
    
    await Effect.runPromise(
      Effect.log(`Database config: ${JSON.stringify(config)}`)
    )
    
    const logOutput = logSpy.mock.calls[0][0]
    expect(logOutput).toContain("<redacted>")
    expect(logOutput).not.toContain("testpassword")
    
    logSpy.mockRestore()
  })
})

// Property-based testing with redacted values
describe("Redacted Property Tests", () => {
  it("should maintain equality after redaction", () => {
    const testValues = [
      "simple-string",
      { key: "value", nested: { prop: "data" } },
      [1, 2, 3, 4, 5],
      42,
      true,
      null
    ]
    
    testValues.forEach(value => {
      const redacted1 = createTestRedacted(value)
      const redacted2 = createTestRedacted(value)
      
      expectRedactedEqual(redacted1, redacted2)
      expectRedactedValue(redacted1, value)
    })
  })
  
  it("should handle serialization safely", () => {
    const sensitiveData = {
      username: "admin",
      password: "super-secret-password",
      apiKey: "sk-1234567890abcdef"
    }
    
    const redactedData = {
      username: sensitiveData.username,
      password: createTestRedacted(sensitiveData.password),
      apiKey: createTestRedacted(sensitiveData.apiKey)
    }
    
    const serialized = JSON.stringify(redactedData)
    
    expect(serialized).toContain("admin")
    expect(serialized).toContain("<redacted>")
    expect(serialized).not.toContain("super-secret-password")
    expect(serialized).not.toContain("sk-1234567890abcdef")
  })
})
```

## Conclusion

Redacted provides a robust, type-safe solution for handling sensitive data in Effect applications, ensuring that credentials, API keys, and other sensitive information are protected from accidental exposure while maintaining the functional programming benefits of the Effect ecosystem.

Key benefits:
- **Security by Design**: Prevents accidental exposure of sensitive data in logs, errors, and serialization
- **Type Safety**: Compile-time guarantees that sensitive data access is intentional and tracked
- **Memory Management**: Control over sensitive data lifecycle with secure wiping capabilities
- **Composability**: Seamless integration with Effect's ecosystem including Config, Schema, and Layer
- **Testing Support**: Comprehensive testing strategies that maintain security while enabling thorough validation

Use Redacted whenever your application handles sensitive data like passwords, API keys, database connection strings, authentication tokens, or any other confidential information that should never appear in logs or be accidentally exposed.