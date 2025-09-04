# Config: A Real-World Guide

## Table of Contents
1. [Introduction & Core Concepts](#introduction--core-concepts)
2. [Basic Usage Patterns](#basic-usage-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Advanced Features Deep Dive](#advanced-features-deep-dive)
5. [Practical Patterns & Best Practices](#practical-patterns--best-practices)
6. [Integration Examples](#integration-examples)

## Introduction & Core Concepts

### The Problem Config Solves

Configuration management is one of the most error-prone aspects of application development. Traditional approaches lead to scattered configuration logic, type-unsafe environment variable access, and runtime failures from missing or invalid configuration values.

```typescript
// Traditional approach - problematic and error-prone
const config = {
  port: parseInt(process.env.PORT || "3000"), // What if PORT is not a number?
  dbUrl: process.env.DATABASE_URL, // What if this is missing?
  debug: process.env.DEBUG === "true", // String comparison is fragile
  timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 5000,
  features: process.env.FEATURES?.split(",") || [] // Parsing logic scattered
};

// No validation until runtime
if (!config.dbUrl) {
  throw new Error("DATABASE_URL is required"); // Too late!
}
```

This approach leads to:
- **Runtime Failures** - Missing configuration discovered only when accessed
- **Type Unsafety** - No compile-time guarantees about configuration structure
- **Scattered Logic** - Parsing and validation logic spread throughout codebase
- **Poor Error Messages** - Generic failures without helpful context
- **Testing Difficulties** - Hard to mock and test different configuration scenarios

### The Config Solution

Effect's Config module provides a declarative, type-safe approach to configuration management with built-in validation, composition, and excellent error reporting.

```typescript
import { Config, Effect } from "effect"

// Declarative configuration definition
const appConfig = Config.all({
  port: Config.withDefault(Config.integer("PORT"), 3000),
  dbUrl: Config.string("DATABASE_URL"),
  debug: Config.withDefault(Config.boolean("DEBUG"), false),
  timeout: Config.withDefault(Config.integer("TIMEOUT"), 5000),
  features: Config.withDefault(Config.array(Config.string(), "FEATURES"), [])
})

const program = Effect.gen(function* () {
  const config = yield* appConfig
  // config is fully typed and validated!
  console.log(`Starting server on port ${config.port}`)
})
```

### Key Concepts

**Config<A>**: A description of configuration data of type `A` that can be loaded from environment variables or other sources.

**Type Safety**: Configurations are fully typed, providing compile-time guarantees about structure and preventing runtime type errors.

**Validation**: Built-in validation ensures configuration values meet requirements before your application starts.

**Composition**: Complex configuration objects can be built by composing simpler config elements.

**Error Handling**: Detailed error messages help developers quickly identify and fix configuration issues.

## Basic Usage Patterns

### Pattern 1: Basic Configuration Loading

```typescript
import { Config, Effect } from "effect"

// Define individual config values
const port = Config.integer("PORT")
const host = Config.string("HOST")
const debug = Config.boolean("DEBUG")

// Load configuration in your program
const program = Effect.gen(function* () {
  const portValue = yield* port
  const hostValue = yield* host
  const debugValue = yield* debug
  
  console.log(`Server: ${hostValue}:${portValue}, Debug: ${debugValue}`)
})

// Run with environment variables
// PORT=8080 HOST=localhost DEBUG=true node app.js
Effect.runSync(program)
```

### Pattern 2: Configuration with Defaults

```typescript
import { Config, Effect } from "effect"

// Provide sensible defaults for optional configuration
const serverConfig = Config.all({
  port: Config.withDefault(Config.integer("PORT"), 3000),
  host: Config.withDefault(Config.string("HOST"), "localhost"),
  workers: Config.withDefault(Config.integer("WORKERS"), 1),
  logLevel: Config.withDefault(Config.string("LOG_LEVEL"), "info")
})

const program = Effect.gen(function* () {
  const config = yield* serverConfig
  // All fields have values, even if environment variables aren't set
  console.log(`Starting ${config.workers} workers on ${config.host}:${config.port}`)
})
```

### Pattern 3: Nested Configuration Structure

```typescript
import { Config, Effect } from "effect"

// Build complex nested configuration objects
const databaseConfig = Config.all({
  host: Config.string("DB_HOST"),
  port: Config.withDefault(Config.integer("DB_PORT"), 5432),
  name: Config.string("DB_NAME"),
  ssl: Config.withDefault(Config.boolean("DB_SSL"), false)
})

const redisConfig = Config.all({
  host: Config.string("REDIS_HOST"),
  port: Config.withDefault(Config.integer("REDIS_PORT"), 6379),
  password: Config.option(Config.string("REDIS_PASSWORD"))
})

const appConfig = Config.all({
  database: databaseConfig,
  redis: redisConfig,
  appName: Config.string("APP_NAME")
})

const program = Effect.gen(function* () {
  const config = yield* appConfig
  console.log(`App: ${config.appName}`)
  console.log(`DB: ${config.database.host}:${config.database.port}`)
  console.log(`Redis: ${config.redis.host}:${config.redis.port}`)
})
```

## Real-World Examples

### Example 1: Web Server Configuration

A complete web server configuration with validation and multiple environments.

```typescript
import { Config, Effect, pipe } from "effect"

// Helper for validating port ranges
const validPort = (port: number) => port >= 1 && port <= 65535

// Web server configuration
const serverConfig = Config.all({
  // Basic server settings
  port: Config.integer("PORT").pipe(
    Config.withDefault(3000),
    Config.validate({
      message: "Port must be between 1 and 65535",
      validation: validPort
    })
  ),
  
  host: Config.withDefault(Config.string("HOST"), "0.0.0.0"),
  
  // Environment-specific settings
  environment: Config.literal("NODE_ENV")("development", "staging", "production").pipe(
    Config.withDefault("development" as const)
  ),
  
  // Security settings
  corsOrigins: Config.array(Config.string(), "CORS_ORIGINS").pipe(
    Config.withDefault(["http://localhost:3000"])
  ),
  
  // Performance settings
  requestTimeout: Config.integer("REQUEST_TIMEOUT_MS").pipe(
    Config.withDefault(30000),
    Config.validate({
      message: "Request timeout must be positive",
      validation: (n) => n > 0
    })
  ),
  
  // Feature flags
  rateLimitEnabled: Config.boolean("RATE_LIMIT_ENABLED").pipe(
    Config.withDefault(true)
  ),
  
  rateLimitMax: Config.integer("RATE_LIMIT_MAX").pipe(
    Config.withDefault(100)
  )
})

const startServer = Effect.gen(function* () {
  const config = yield* serverConfig
  
  console.log(`🚀 Starting ${config.environment} server`)
  console.log(`📡 Listening on ${config.host}:${config.port}`)
  console.log(`⏱️  Request timeout: ${config.requestTimeout}ms`)
  console.log(`🛡️  Rate limiting: ${config.rateLimitEnabled ? 'enabled' : 'disabled'}`)
  
  if (config.rateLimitEnabled) {
    console.log(`📊 Rate limit: ${config.rateLimitMax} requests/window`)
  }
  
  return config
})

// Usage examples:
// NODE_ENV=production PORT=8080 HOST=0.0.0.0 node server.js
// RATE_LIMIT_ENABLED=false REQUEST_TIMEOUT_MS=60000 node server.js
```

### Example 2: Database Connection Configuration

Multi-database configuration with connection pooling and retry settings.

```typescript
import { Config, Effect, Duration } from "effect"

// Primary database configuration
const primaryDbConfig = Config.all({
  host: Config.string("PRIMARY_DB_HOST"),
  port: Config.withDefault(Config.integer("PRIMARY_DB_PORT"), 5432),
  database: Config.string("PRIMARY_DB_NAME"),
  username: Config.string("PRIMARY_DB_USER"),
  password: Config.secret("PRIMARY_DB_PASSWORD"),
  
  // Connection pool settings
  poolMin: Config.withDefault(Config.integer("PRIMARY_DB_POOL_MIN"), 2),
  poolMax: Config.withDefault(Config.integer("PRIMARY_DB_POOL_MAX"), 10),
  
  // Timeouts and retries
  connectionTimeoutMs: Config.integer("PRIMARY_DB_TIMEOUT_MS").pipe(
    Config.withDefault(5000)
  ),
  
  maxRetries: Config.integer("PRIMARY_DB_MAX_RETRIES").pipe(
    Config.withDefault(3)
  ),
  
  ssl: Config.withDefault(Config.boolean("PRIMARY_DB_SSL"), false)
})

// Read replica configuration (optional)
const replicaDbConfig = Config.option(
  Config.all({
    host: Config.string("REPLICA_DB_HOST"),
    port: Config.withDefault(Config.integer("REPLICA_DB_PORT"), 5432),
    database: Config.string("REPLICA_DB_NAME"),
    username: Config.string("REPLICA_DB_USER"),
    password: Config.secret("REPLICA_DB_PASSWORD")
  })
)

// Redis cache configuration
const cacheConfig = Config.all({
  host: Config.withDefault(Config.string("REDIS_HOST"), "localhost"),
  port: Config.withDefault(Config.integer("REDIS_PORT"), 6379),
  password: Config.option(Config.secret("REDIS_PASSWORD")),
  keyPrefix: Config.withDefault(Config.string("REDIS_KEY_PREFIX"), "app:"),
  ttlSeconds: Config.withDefault(Config.integer("REDIS_TTL_SECONDS"), 3600)
})

// Complete data layer configuration
const dataConfig = Config.all({
  primary: primaryDbConfig,
  replica: replicaDbConfig,
  cache: cacheConfig,
  
  // Global settings
  queryTimeoutMs: Config.integer("QUERY_TIMEOUT_MS").pipe(
    Config.withDefault(10000)
  ),
  
  enableQueryLogging: Config.boolean("ENABLE_QUERY_LOGGING").pipe(
    Config.withDefault(false)
  )
})

const initializeDataLayer = Effect.gen(function* () {
  const config = yield* dataConfig
  
  console.log(`🗄️  Primary DB: ${config.primary.host}:${config.primary.port}/${config.primary.database}`)
  console.log(`📊 Pool size: ${config.primary.poolMin}-${config.primary.poolMax}`)
  
  if (config.replica._tag === "Some") {
    const replica = config.replica.value
    console.log(`📖 Read replica: ${replica.host}:${replica.port}/${replica.database}`)
  }
  
  console.log(`⚡ Cache: ${config.cache.host}:${config.cache.port}`)
  console.log(`🔍 Query logging: ${config.enableQueryLogging ? 'enabled' : 'disabled'}`)
  
  return config
})
```

### Example 3: Microservice Configuration

Complete microservice configuration with service discovery, monitoring, and feature flags.

```typescript
import { Config, Effect } from "effect"

// Service identity and discovery
const serviceConfig = Config.all({
  name: Config.string("SERVICE_NAME"),
  version: Config.withDefault(Config.string("SERVICE_VERSION"), "1.0.0"),
  instanceId: Config.string("INSTANCE_ID").pipe(
    Config.withDefault(() => Math.random().toString(36).substr(2, 9))
  )
})

// HTTP client configuration for external services
const httpClientConfig = Config.all({
  userServiceUrl: Config.url("USER_SERVICE_URL"),
  paymentServiceUrl: Config.url("PAYMENT_SERVICE_URL"),
  notificationServiceUrl: Config.url("NOTIFICATION_SERVICE_URL"),
  
  defaultTimeoutMs: Config.integer("HTTP_TIMEOUT_MS").pipe(
    Config.withDefault(5000)
  ),
  
  retryAttempts: Config.integer("HTTP_RETRY_ATTEMPTS").pipe(
    Config.withDefault(3)
  ),
  
  retryDelayMs: Config.integer("HTTP_RETRY_DELAY_MS").pipe(
    Config.withDefault(1000)
  )
})

// Monitoring and observability
const observabilityConfig = Config.all({
  metricsEnabled: Config.boolean("METRICS_ENABLED").pipe(
    Config.withDefault(true)
  ),
  
  metricsPort: Config.integer("METRICS_PORT").pipe(
    Config.withDefault(9090)
  ),
  
  tracingEnabled: Config.boolean("TRACING_ENABLED").pipe(
    Config.withDefault(false)
  ),
  
  tracingEndpoint: Config.option(Config.string("TRACING_ENDPOINT")),
  
  logLevel: Config.literal("LOG_LEVEL")("debug", "info", "warn", "error").pipe(
    Config.withDefault("info" as const)
  ),
  
  healthCheckIntervalMs: Config.integer("HEALTH_CHECK_INTERVAL_MS").pipe(
    Config.withDefault(30000)
  )
})

// Feature flags and business logic toggles
const featureFlags = Config.all({
  newPaymentFlow: Config.boolean("FEATURE_NEW_PAYMENT_FLOW").pipe(
    Config.withDefault(false)
  ),
  
  enhancedValidation: Config.boolean("FEATURE_ENHANCED_VALIDATION").pipe(
    Config.withDefault(true)
  ),
  
  betaFeatures: Config.boolean("FEATURE_BETA_ENABLED").pipe(
    Config.withDefault(false)
  ),
  
  allowedBetaUsers: Config.array(Config.string(), "BETA_USER_IDS").pipe(
    Config.withDefault([])
  )
})

// Complete microservice configuration
const microserviceConfig = Config.all({
  service: serviceConfig,
  httpClients: httpClientConfig,
  observability: observabilityConfig,
  features: featureFlags,
  
  // Environment and deployment info
  environment: Config.literal("ENVIRONMENT")("local", "dev", "staging", "prod").pipe(
    Config.withDefault("local" as const)
  ),
  
  deploymentRegion: Config.string("DEPLOYMENT_REGION").pipe(
    Config.withDefault("us-east-1")
  )
})

const startMicroservice = Effect.gen(function* () {
  const config = yield* microserviceConfig
  
  console.log(`🚀 Starting ${config.service.name} v${config.service.version}`)
  console.log(`🆔 Instance: ${config.service.instanceId}`)
  console.log(`🌍 Environment: ${config.environment} (${config.deploymentRegion})`)
  
  console.log("\n📡 External Services:")
  console.log(`   Users: ${config.httpClients.userServiceUrl}`)
  console.log(`   Payments: ${config.httpClients.paymentServiceUrl}`)
  console.log(`   Notifications: ${config.httpClients.notificationServiceUrl}`)
  
  console.log("\n📊 Observability:")
  console.log(`   Metrics: ${config.observability.metricsEnabled ? 'enabled' : 'disabled'}`)
  console.log(`   Tracing: ${config.observability.tracingEnabled ? 'enabled' : 'disabled'}`)
  console.log(`   Log Level: ${config.observability.logLevel}`)
  
  console.log("\n🎛️  Feature Flags:")
  console.log(`   New Payment Flow: ${config.features.newPaymentFlow}`)
  console.log(`   Enhanced Validation: ${config.features.enhancedValidation}`)
  console.log(`   Beta Features: ${config.features.betaFeatures}`)
  
  if (config.features.betaFeatures && config.features.allowedBetaUsers.length > 0) {
    console.log(`   Beta Users: ${config.features.allowedBetaUsers.join(", ")}`)
  }
  
  return config
})
```

## Advanced Features Deep Dive

### Feature 1: Configuration Validation and Refinement

Effect Config provides powerful validation capabilities that go beyond basic type checking, allowing you to enforce business rules and constraints at the configuration level.

#### Basic Validation Usage

```typescript
import { Config, Effect } from "effect"

// Validate port ranges
const portConfig = Config.integer("PORT").pipe(
  Config.validate({
    message: "Port must be between 1024 and 65535",
    validation: (port) => port >= 1024 && port <= 65535
  })
)

// Validate email format
const emailConfig = Config.string("ADMIN_EMAIL").pipe(
  Config.validate({
    message: "Must be a valid email address",
    validation: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  })
)

// Validate URL format
const apiUrlConfig = Config.string("API_URL").pipe(
  Config.validate({
    message: "Must be a valid HTTP/HTTPS URL",
    validation: (url) => {
      try {
        const parsed = new URL(url)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    }
  })
)
```

#### Real-World Validation Example

```typescript
import { Config, Effect } from "effect"

// Complex database configuration with multiple validation rules
const databaseConfig = Config.all({
  host: Config.string("DB_HOST").pipe(
    Config.validate({
      message: "Database host cannot be empty",
      validation: (host) => host.trim().length > 0
    })
  ),
  
  port: Config.integer("DB_PORT").pipe(
    Config.withDefault(5432),
    Config.validate({
      message: "Database port must be between 1 and 65535",
      validation: (port) => port >= 1 && port <= 65535
    })
  ),
  
  maxConnections: Config.integer("DB_MAX_CONNECTIONS").pipe(
    Config.withDefault(10),
    Config.validate({
      message: "Max connections must be between 1 and 100",
      validation: (max) => max >= 1 && max <= 100
    })
  ),
  
  connectionString: Config.string("DATABASE_URL").pipe(
    Config.validate({
      message: "Must be a valid PostgreSQL connection string",
      validation: (url) => url.startsWith("postgresql://") || url.startsWith("postgres://")
    })
  )
})

// Validation for AWS configuration
const awsConfig = Config.all({
  region: Config.string("AWS_REGION").pipe(
    Config.validate({
      message: "Must be a valid AWS region",
      validation: (region) => /^[a-z]{2}-[a-z]+-\d{1}$/.test(region)
    })
  ),
  
  accessKeyId: Config.string("AWS_ACCESS_KEY_ID").pipe(
    Config.validate({
      message: "AWS Access Key ID must be 20 characters",
      validation: (key) => key.length === 20 && /^[A-Z0-9]+$/.test(key)
    })
  ),
  
  bucketName: Config.string("S3_BUCKET_NAME").pipe(
    Config.validate({
      message: "S3 bucket name must follow naming conventions",
      validation: (name) => {
        return name.length >= 3 && 
               name.length <= 63 && 
               /^[a-z0-9.-]+$/.test(name) &&
               !name.startsWith(".") &&
               !name.endsWith(".")
      }
    })
  )
})
```

#### Advanced Validation: Cross-Field Dependencies

```typescript
import { Config, Effect } from "effect"

// Helper function for creating interdependent validation
const createServerConfig = Effect.gen(function* () {
  // Load individual pieces first
  const host = yield* Config.withDefault(Config.string("HOST"), "localhost")
  const port = yield* Config.withDefault(Config.integer("PORT"), 3000)
  const ssl = yield* Config.withDefault(Config.boolean("SSL_ENABLED"), false)
  const certPath = yield* Config.option(Config.string("SSL_CERT_PATH"))
  const keyPath = yield* Config.option(Config.string("SSL_KEY_PATH"))
  
  // Cross-field validation
  if (ssl && (certPath._tag === "None" || keyPath._tag === "None")) {
    return Effect.fail(new Error("SSL certificate and key paths are required when SSL is enabled"))
  }
  
  if (ssl && port === 80) {
    return Effect.fail(new Error("Cannot use port 80 with SSL enabled"))
  }
  
  return Effect.succeed({
    host,
    port,
    ssl,
    certPath: certPath._tag === "Some" ? certPath.value : undefined,
    keyPath: keyPath._tag === "Some" ? keyPath.value : undefined
  })
})
```

### Feature 2: Multi-Source Configuration

Effect Config can pull configuration from multiple sources and combine them intelligently, with proper precedence and fallback handling.

#### Configuration Source Hierarchy

```typescript
import { Config, Effect, ConfigProvider } from "effect"

// Create a configuration that pulls from multiple sources
const createMultiSourceConfig = () => {
  // 1. Environment variables (highest priority)
  const envProvider = ConfigProvider.fromEnv()
  
  // 2. Configuration file (medium priority)
  const fileProvider = ConfigProvider.fromJson({
    database: {
      host: "localhost",
      port: 5432,
      ssl: false
    },
    redis: {
      host: "localhost",
      port: 6379
    },
    features: {
      newUI: true,
      betaFeatures: false
    }
  })
  
  // 3. Default values (lowest priority)
  const defaultProvider = ConfigProvider.fromJson({
    database: {
      maxConnections: 10,
      timeout: 5000
    },
    logging: {
      level: "info",
      format: "json"
    }
  })
  
  // Combine providers with precedence: env > file > defaults
  return ConfigProvider.orElse(
    envProvider,
    ConfigProvider.orElse(fileProvider, defaultProvider)
  )
}

// Configuration schema that works with multiple sources
const appConfig = Config.all({
  database: Config.all({
    host: Config.string("database.host"),
    port: Config.integer("database.port"),
    ssl: Config.boolean("database.ssl"),
    maxConnections: Config.integer("database.maxConnections"),
    timeout: Config.integer("database.timeout")
  }),
  
  redis: Config.all({
    host: Config.string("redis.host"),
    port: Config.integer("redis.port")
  }),
  
  features: Config.all({
    newUI: Config.boolean("features.newUI"),
    betaFeatures: Config.boolean("features.betaFeatures")
  }),
  
  logging: Config.all({
    level: Config.string("logging.level"),
    format: Config.string("logging.format")
  })
})

// Usage with custom provider
const program = Effect.gen(function* () {
  const config = yield* appConfig
  console.log("Loaded configuration:", config)
}).pipe(
  Effect.provide(createMultiSourceConfig())
)
```

#### Environment-Specific Configuration

```typescript
import { Config, Effect } from "effect"

// Environment-aware configuration loading
const createEnvironmentConfig = (env: "development" | "staging" | "production") => {
  const baseConfig = Config.all({
    appName: Config.string("APP_NAME"),
    version: Config.withDefault(Config.string("APP_VERSION"), "1.0.0")
  })
  
  const envSpecificConfig = (() => {
    switch (env) {
      case "development":
        return Config.all({
          database: Config.all({
            host: Config.withDefault(Config.string("DB_HOST"), "localhost"),
            port: Config.withDefault(Config.integer("DB_PORT"), 5432),
            ssl: Config.withDefault(Config.boolean("DB_SSL"), false),
            logQueries: Config.withDefault(Config.boolean("DB_LOG_QUERIES"), true)
          }),
          
          debug: Config.withDefault(Config.boolean("DEBUG"), true),
          hotReload: Config.withDefault(Config.boolean("HOT_RELOAD"), true),
          corsOrigins: Config.array(Config.string(), "CORS_ORIGINS").pipe(
            Config.withDefault(["http://localhost:3000", "http://localhost:3001"])
          )
        })
      
      case "staging":
        return Config.all({
          database: Config.all({
            host: Config.string("DB_HOST"),
            port: Config.withDefault(Config.integer("DB_PORT"), 5432),
            ssl: Config.withDefault(Config.boolean("DB_SSL"), true),
            logQueries: Config.withDefault(Config.boolean("DB_LOG_QUERIES"), false)
          }),
          
          debug: Config.withDefault(Config.boolean("DEBUG"), false),
          hotReload: Config.withDefault(Config.boolean("HOT_RELOAD"), false),
          corsOrigins: Config.array(Config.string(), "CORS_ORIGINS")
        })
      
      case "production":
        return Config.all({
          database: Config.all({
            host: Config.string("DB_HOST"),
            port: Config.withDefault(Config.integer("DB_PORT"), 5432),
            ssl: Config.withDefault(Config.boolean("DB_SSL"), true),
            logQueries: Config.withDefault(Config.boolean("DB_LOG_QUERIES"), false)
          }),
          
          debug: Config.withDefault(Config.boolean("DEBUG"), false),
          hotReload: Config.withDefault(Config.boolean("HOT_RELOAD"), false),
          corsOrigins: Config.array(Config.string(), "CORS_ORIGINS")
        })
    }
  })()
  
  return Config.all({
    base: baseConfig,
    environment: Config.succeed(env),
    config: envSpecificConfig
  })
}

// Usage
const program = Effect.gen(function* () {
  const env = (process.env.NODE_ENV as any) || "development"
  const config = yield* createEnvironmentConfig(env)
  
  console.log(`Running in ${config.environment} mode`)
  console.log(`App: ${config.base.appName} v${config.base.version}`)
  console.log(`Database: ${config.config.database.host}:${config.config.database.port}`)
  console.log(`Debug mode: ${config.config.debug}`)
})
```

### Feature 3: Secret Management and Security

Effect Config provides specialized handling for sensitive configuration data through the `secret` and `redacted` combinators.

#### Basic Secret Handling

```typescript
import { Config, Effect, Secret } from "effect"

// Define configuration with secrets
const secureConfig = Config.all({
  // Regular non-sensitive config
  appName: Config.string("APP_NAME"),
  port: Config.withDefault(Config.integer("PORT"), 3000),
  
  // Sensitive configuration using secrets
  databasePassword: Config.secret("DB_PASSWORD"),
  apiKey: Config.secret("API_KEY"),
  jwtSecret: Config.secret("JWT_SECRET"),
  
  // Optional secrets
  webhookSecret: Config.option(Config.secret("WEBHOOK_SECRET"))
})

const program = Effect.gen(function* () {
  const config = yield* secureConfig
  
  // Secrets are wrapped in Secret type - never accidentally logged
  console.log(`App: ${config.appName}`)
  console.log(`Port: ${config.port}`)
  console.log(`DB Password: ${config.databasePassword}`) // This shows <redacted>
  
  // To access secret values, use Secret.value (be careful!)
  const dbPassword = Secret.value(config.databasePassword)
  
  // Use secrets in your application logic
  const connectionString = `postgresql://user:${dbPassword}@localhost/db`
  
  return config
})
```

#### Advanced Secret Management with External Providers

```typescript
import { Config, Effect, Secret } from "effect"

// Configuration for external secret providers
const secretManagerConfig = Config.all({
  // AWS Secrets Manager
  awsRegion: Config.withDefault(Config.string("AWS_REGION"), "us-east-1"),
  secretsManagerEnabled: Config.withDefault(Config.boolean("USE_SECRETS_MANAGER"), false),
  
  // HashiCorp Vault
  vaultUrl: Config.option(Config.string("VAULT_URL")),
  vaultToken: Config.option(Config.secret("VAULT_TOKEN")),
  
  // Azure Key Vault
  keyVaultUrl: Config.option(Config.string("KEY_VAULT_URL")),
  azureClientId: Config.option(Config.string("AZURE_CLIENT_ID"))
})

// Helper for creating secret configurations with fallbacks
const createSecretConfig = <T>(
  secretPath: string,
  envVarName: string,
  decoder?: (value: string) => T
) => {
  return Effect.gen(function* () {
    const secretManager = yield* secretManagerConfig
    
    if (secretManager.secretsManagerEnabled) {
      // Try to load from AWS Secrets Manager
      const secretValue = yield* Effect.tryPromise(() =>
        // In real implementation, use AWS SDK
        Promise.resolve(`secret-from-manager-${secretPath}`)
      )
      return Secret.fromString(secretValue)
    } else {
      // Fallback to environment variable
      const envSecret = yield* Config.secret(envVarName)
      return envSecret
    }
  })
}

// Production-ready secret configuration
const productionSecrets = Effect.gen(function* () {
  return yield* Config.all({
    database: Config.all({
      password: yield* createSecretConfig("database/password", "DB_PASSWORD"),
      encryptionKey: yield* createSecretConfig("database/encryption", "DB_ENCRYPTION_KEY")
    }),
    
    external: Config.all({
      stripeSecret: yield* createSecretConfig("stripe/secret", "STRIPE_SECRET_KEY"),
      sendgridApi: yield* createSecretConfig("sendgrid/api", "SENDGRID_API_KEY"),
      googleOAuth: yield* createSecretConfig("google/oauth", "GOOGLE_OAUTH_SECRET")
    }),
    
    internal: Config.all({
      jwtSecret: yield* createSecretConfig("jwt/secret", "JWT_SECRET"),
      sessionSecret: yield* createSecretConfig("session/secret", "SESSION_SECRET"),
      encryptionKey: yield* createSecretConfig("encryption/key", "ENCRYPTION_KEY")
    })
  })
})

// Usage with secret rotation support
const secureApplication = Effect.gen(function* () {
  const secrets = yield* productionSecrets
  
  console.log("🔐 Secrets loaded successfully")
  console.log("🔄 Secret rotation will be handled automatically")
  
  // Use secrets safely in your application
  const dbPassword = Secret.value(secrets.database.password)
  const jwtSecret = Secret.value(secrets.internal.jwtSecret)
  
  return { secrets, dbPassword, jwtSecret }
})
```

## Practical Patterns & Best Practices

### Pattern 1: Configuration Factory Pattern

Create reusable configuration factories for common scenarios.

```typescript
import { Config, Effect } from "effect"

// Factory for creating database configurations
const createDatabaseConfig = (prefix: string = "DB") => Config.all({
  host: Config.string(`${prefix}_HOST`),
  port: Config.withDefault(Config.integer(`${prefix}_PORT`), 5432),
  database: Config.string(`${prefix}_NAME`),
  username: Config.string(`${prefix}_USER`),
  password: Config.secret(`${prefix}_PASSWORD`),
  
  // Connection pool settings
  pool: Config.all({
    min: Config.withDefault(Config.integer(`${prefix}_POOL_MIN`), 2),
    max: Config.withDefault(Config.integer(`${prefix}_POOL_MAX`), 10),
    idleTimeoutMs: Config.withDefault(Config.integer(`${prefix}_POOL_IDLE_TIMEOUT`), 30000)
  }),
  
  // Advanced settings
  ssl: Config.withDefault(Config.boolean(`${prefix}_SSL`), false),
  timezone: Config.withDefault(Config.string(`${prefix}_TIMEZONE`), "UTC"),
  queryTimeoutMs: Config.withDefault(Config.integer(`${prefix}_QUERY_TIMEOUT`), 10000)
})

// Factory for creating HTTP service configurations
const createHttpServiceConfig = (serviceName: string) => Config.all({
  baseUrl: Config.url(`${serviceName.toUpperCase()}_SERVICE_URL`),
  timeout: Config.withDefault(Config.integer(`${serviceName.toUpperCase()}_TIMEOUT_MS`), 5000),
  retries: Config.withDefault(Config.integer(`${serviceName.toUpperCase()}_RETRIES`), 3),
  apiKey: Config.option(Config.secret(`${serviceName.toUpperCase()}_API_KEY`))
})

// Usage
const multiTenantConfig = Config.all({
  primary: createDatabaseConfig("PRIMARY_DB"),
  analytics: createDatabaseConfig("ANALYTICS_DB"),
  
  services: Config.all({
    user: createHttpServiceConfig("user"),
    payment: createHttpServiceConfig("payment"),
    notification: createHttpServiceConfig("notification")
  })
})
```

### Pattern 2: Configuration Validation Helpers

Create reusable validation functions for common scenarios.

```typescript
import { Config, Effect } from "effect"

// Common validation helpers
const ConfigValidators = {
  positiveInteger: (name: string) => (value: number) => value > 0,
  
  portRange: (value: number) => value >= 1 && value <= 65535,
  
  url: (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
  
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  
  nonEmptyString: (value: string) => value.trim().length > 0,
  
  alphanumeric: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
  
  semver: (value: string) => /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/.test(value),
  
  awsRegion: (value: string) => /^[a-z]{2}-[a-z]+-\d{1}$/.test(value),
  
  ipAddress: (value: string) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(value) || ipv6Regex.test(value)
  }
}

// Helper functions for creating validated configs
const validatedConfig = {
  port: (name: string, defaultValue?: number) =>
    Config.integer(name).pipe(
      ...(defaultValue ? [Config.withDefault(defaultValue)] : []),
      Config.validate({
        message: `${name} must be a valid port (1-65535)`,
        validation: ConfigValidators.portRange
      })
    ),
  
  url: (name: string, defaultValue?: string) =>
    Config.string(name).pipe(
      ...(defaultValue ? [Config.withDefault(defaultValue)] : []),
      Config.validate({
        message: `${name} must be a valid URL`,
        validation: ConfigValidators.url
      })
    ),
  
  email: (name: string) =>
    Config.string(name).pipe(
      Config.validate({
        message: `${name} must be a valid email address`,
        validation: ConfigValidators.email
      })
    ),
  
  positiveInt: (name: string, defaultValue?: number) =>
    Config.integer(name).pipe(
      ...(defaultValue ? [Config.withDefault(defaultValue)] : []),
      Config.validate({
        message: `${name} must be a positive integer`,
        validation: ConfigValidators.positiveInteger(name)
      })
    )
}

// Usage with validation helpers
const validatedAppConfig = Config.all({
  server: Config.all({
    port: validatedConfig.port("SERVER_PORT", 3000),
    host: Config.withDefault(Config.string("SERVER_HOST"), "localhost")
  }),
  
  database: Config.all({
    port: validatedConfig.port("DB_PORT", 5432),
    maxConnections: validatedConfig.positiveInt("DB_MAX_CONNECTIONS", 10)
  }),
  
  external: Config.all({
    apiUrl: validatedConfig.url("API_URL"),
    webhookUrl: validatedConfig.url("WEBHOOK_URL"),
    adminEmail: validatedConfig.email("ADMIN_EMAIL")
  })
})
```

### Pattern 3: Feature Flag Management

Implement sophisticated feature flag systems with configuration.

```typescript
import { Config, Effect } from "effect"

// Feature flag configuration with metadata
const createFeatureFlag = (
  name: string,
  defaultValue: boolean = false,
  description?: string
) => Config.all({
  enabled: Config.boolean(`FEATURE_${name.toUpperCase()}`).pipe(
    Config.withDefault(defaultValue)
  ),
  rolloutPercentage: Config.integer(`FEATURE_${name.toUpperCase()}_ROLLOUT`).pipe(
    Config.withDefault(defaultValue ? 100 : 0),
    Config.validate({
      message: "Rollout percentage must be between 0 and 100",
      validation: (n) => n >= 0 && n <= 100
    })
  ),
  allowedUsers: Config.array(Config.string(), `FEATURE_${name.toUpperCase()}_USERS`).pipe(
    Config.withDefault([])
  ),
  blockedUsers: Config.array(Config.string(), `FEATURE_${name.toUpperCase()}_BLOCKED`).pipe(
    Config.withDefault([])
  ),
  metadata: Config.succeed({
    name,
    description: description || `Feature flag for ${name}`,
    defaultValue
  })
})

// Application feature flags
const appFeatureFlags = Config.all({
  newDashboard: createFeatureFlag(
    "new_dashboard",
    false,
    "Enables the redesigned dashboard interface"
  ),
  
  enhancedAuth: createFeatureFlag(
    "enhanced_auth",
    true,
    "Enables enhanced authentication with 2FA"
  ),
  
  betaFeatures: createFeatureFlag(
    "beta_features",
    false,
    "Enables access to beta features for testing"
  ),
  
  performanceMode: createFeatureFlag(
    "performance_mode",
    false,
    "Enables performance optimizations that may affect compatibility"
  ),
  
  experimentalApi: createFeatureFlag(
    "experimental_api",
    false,
    "Enables access to experimental API endpoints"
  )
})

// Feature flag evaluation helper
const createFeatureFlagEvaluator = Effect.gen(function* () {
  const flags = yield* appFeatureFlags
  
  return {
    isEnabled: (flagName: keyof typeof flags, userId?: string) => {
      const flag = flags[flagName]
      
      // Check if user is explicitly blocked
      if (userId && flag.blockedUsers.includes(userId)) {
        return false
      }
      
      // Check if user is explicitly allowed
      if (userId && flag.allowedUsers.includes(userId)) {
        return true
      }
      
      // Check if feature is globally enabled
      if (!flag.enabled) {
        return false
      }
      
      // Check rollout percentage
      if (userId) {
        const hash = simpleHash(userId)
        const percentage = hash % 100
        return percentage < flag.rolloutPercentage
      }
      
      return flag.rolloutPercentage === 100
    },
    
    getFlags: () => flags,
    
    getAllEnabledFlags: (userId?: string) => {
      return Object.entries(flags)
        .filter(([name]) => this.isEnabled(name as any, userId))
        .map(([name, flag]) => ({
          name,
          description: flag.metadata.description,
          rolloutPercentage: flag.rolloutPercentage
        }))
    }
  }
})

// Simple hash function for consistent user bucketing
const simpleHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Usage in application
const featureFlagExample = Effect.gen(function* () {
  const evaluator = yield* createFeatureFlagEvaluator
  const userId = "user123"
  
  console.log("🎛️  Feature Flag Status:")
  console.log(`New Dashboard: ${evaluator.isEnabled("newDashboard", userId)}`)
  console.log(`Enhanced Auth: ${evaluator.isEnabled("enhancedAuth", userId)}`)
  console.log(`Beta Features: ${evaluator.isEnabled("betaFeatures", userId)}`)
  
  const enabledFlags = evaluator.getAllEnabledFlags(userId)
  console.log("\n✅ Enabled Features:")
  enabledFlags.forEach(flag => {
    console.log(`   ${flag.name}: ${flag.description} (${flag.rolloutPercentage}%)`)
  })
})
```

## Integration Examples

### Integration with Express.js

Show how to use Effect Config in a traditional Express.js application.

```typescript
import { Config, Effect, Layer } from "effect"
import express from "express"
import { createServer } from "http"

// Application configuration
const serverConfig = Config.all({
  port: Config.withDefault(Config.integer("PORT"), 3000),
  host: Config.withDefault(Config.string("HOST"), "localhost"),
  nodeEnv: Config.withDefault(Config.string("NODE_ENV"), "development"),
  
  cors: Config.all({
    origins: Config.array(Config.string(), "CORS_ORIGINS").pipe(
      Config.withDefault(["http://localhost:3000"])
    ),
    credentials: Config.withDefault(Config.boolean("CORS_CREDENTIALS"), true)
  }),
  
  security: Config.all({
    jwtSecret: Config.secret("JWT_SECRET"),
    rateLimitWindow: Config.withDefault(Config.integer("RATE_LIMIT_WINDOW_MS"), 900000),
    rateLimitMax: Config.withDefault(Config.integer("RATE_LIMIT_MAX"), 100)
  }),
  
  database: Config.all({
    url: Config.string("DATABASE_URL"),
    poolMax: Config.withDefault(Config.integer("DB_POOL_MAX"), 10)
  })
})

// Express app factory using Effect Config
const createExpressApp = Effect.gen(function* () {
  const config = yield* serverConfig
  
  const app = express()
  
  // Configure middleware based on config
  app.use(express.json())
  
  // CORS configuration from Effect Config
  app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && config.cors.origins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin)
    }
    if (config.cors.credentials) {
      res.header("Access-Control-Allow-Credentials", "true")
    }
    next()
  })
  
  // Routes with configuration
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      environment: config.nodeEnv,
      timestamp: new Date().toISOString()
    })
  })
  
  app.get("/config", (req, res) => {
    // Safely expose non-sensitive config
    res.json({
      environment: config.nodeEnv,
      cors: config.cors,
      rateLimits: {
        window: config.security.rateLimitWindow,
        max: config.security.rateLimitMax
      }
    })
  })
  
  return { app, config }
})

// Start server with Effect Config
const startExpressServer = Effect.gen(function* () {
  const { app, config } = yield* createExpressApp
  
  const server = createServer(app)
  
  yield* Effect.async<void>((resume) => {
    server.listen(config.port, config.host, () => {
      console.log(`🚀 Server running on http://${config.host}:${config.port}`)
      console.log(`📊 Environment: ${config.nodeEnv}`)
      console.log(`🔒 CORS origins: ${config.cors.origins.join(", ")}`)
      resume(Effect.void)
    })
    
    server.on("error", (error) => {
      resume(Effect.fail(error))
    })
  })
  
  return server
})

// Run the server
Effect.runPromise(startExpressServer).catch(console.error)
```

### Integration with Testing Frameworks

Demonstrate how to test applications that use Effect Config.

```typescript
import { Config, Effect, ConfigProvider } from "effect"
import { describe, it, expect, beforeEach } from "vitest"

// Application code using Config
const appConfig = Config.all({
  database: Config.all({
    host: Config.string("DB_HOST"),
    port: Config.withDefault(Config.integer("DB_PORT"), 5432),
    ssl: Config.withDefault(Config.boolean("DB_SSL"), false)
  }),
  
  features: Config.all({
    newUI: Config.withDefault(Config.boolean("FEATURE_NEW_UI"), false),
    analytics: Config.withDefault(Config.boolean("FEATURE_ANALYTICS"), true)
  })
})

const createDatabaseConnection = Effect.gen(function* () {
  const config = yield* appConfig
  const connectionString = `postgresql://${config.database.host}:${config.database.port}/test?ssl=${config.database.ssl}`
  return { connectionString, config: config.database }
})

const getEnabledFeatures = Effect.gen(function* () {
  const config = yield* appConfig
  return Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name)
})

// Test utilities for Effect Config
const createTestConfig = (overrides: Record<string, any> = {}) => {
  const defaultConfig = {
    "DB_HOST": "localhost",
    "DB_PORT": "5432",
    "DB_SSL": "false",
    "FEATURE_NEW_UI": "false",
    "FEATURE_ANALYTICS": "true"
  }
  
  const testConfig = { ...defaultConfig, ...overrides }
  return ConfigProvider.fromRecord(testConfig)
}

const runWithConfig = <A>(
  effect: Effect.Effect<A, any, any>,
  configOverrides: Record<string, any> = {}
) => {
  return Effect.provide(effect, createTestConfig(configOverrides))
}

// Test suites
describe("Database Configuration", () => {
  it("should create connection string with default values", () => {
    const program = Effect.gen(function* () {
      const result = yield* createDatabaseConnection
      expect(result.connectionString).toBe("postgresql://localhost:5432/test?ssl=false")
      expect(result.config.host).toBe("localhost")
      expect(result.config.port).toBe(5432)
      expect(result.config.ssl).toBe(false)
    })
    
    return Effect.runPromise(runWithConfig(program))
  })
  
  it("should override configuration with environment variables", () => {
    const overrides = {
      "DB_HOST": "production-db",
      "DB_PORT": "5433",
      "DB_SSL": "true"
    }
    
    const program = Effect.gen(function* () {
      const result = yield* createDatabaseConnection
      expect(result.connectionString).toBe("postgresql://production-db:5433/test?ssl=true")
      expect(result.config.ssl).toBe(true)
    })
    
    return Effect.runPromise(runWithConfig(program, overrides))
  })
  
  it("should handle invalid port configuration", () => {
    const overrides = { "DB_PORT": "invalid" }
    
    const program = createDatabaseConnection
    
    return expect(
      Effect.runPromise(runWithConfig(program, overrides))
    ).rejects.toThrow()
  })
})

describe("Feature Flags", () => {
  it("should return enabled features by default", () => {
    const program = Effect.gen(function* () {
      const features = yield* getEnabledFeatures
      expect(features).toEqual(["analytics"])
    })
    
    return Effect.runPromise(runWithConfig(program))
  })
  
  it("should enable new UI feature when configured", () => {
    const overrides = { "FEATURE_NEW_UI": "true" }
    
    const program = Effect.gen(function* () {
      const features = yield* getEnabledFeatures
      expect(features).toEqual(["newUI", "analytics"])
    })
    
    return Effect.runPromise(runWithConfig(program, overrides))
  })
  
  it("should disable all features when configured", () => {
    const overrides = {
      "FEATURE_NEW_UI": "false",
      "FEATURE_ANALYTICS": "false"
    }
    
    const program = Effect.gen(function* () {
      const features = yield* getEnabledFeatures
      expect(features).toEqual([])
    })
    
    return Effect.runPromise(runWithConfig(program, overrides))
  })
})

// Integration test helper
describe("Configuration Integration", () => {
  it("should load complete application configuration", () => {
    const testEnv = {
      "DB_HOST": "test-db",
      "DB_PORT": "5434",
      "DB_SSL": "true",
      "FEATURE_NEW_UI": "true",
      "FEATURE_ANALYTICS": "false"
    }
    
    const program = Effect.gen(function* () {
      const config = yield* appConfig
      
      // Verify database config
      expect(config.database.host).toBe("test-db")
      expect(config.database.port).toBe(5434)
      expect(config.database.ssl).toBe(true)
      
      // Verify feature flags
      expect(config.features.newUI).toBe(true)
      expect(config.features.analytics).toBe(false)
      
      return config
    })
    
    return Effect.runPromise(runWithConfig(program, testEnv))
  })
})

// Mock configuration for testing external dependencies
const createMockConfigProvider = () => {
  return ConfigProvider.fromJson({
    "external": {
      "apiUrl": "https://mock-api.test",
      "timeout": 1000,
      "retries": 1
    },
    "database": {
      "host": "mock-db",
      "port": 5432,
      "ssl": false
    }
  })
}

describe("External Service Integration", () => {
  it("should use mock configuration for testing", () => {
    const externalConfig = Config.all({
      apiUrl: Config.string("external.apiUrl"),
      timeout: Config.integer("external.timeout"),
      retries: Config.integer("external.retries")
    })
    
    const program = Effect.gen(function* () {
      const config = yield* externalConfig
      expect(config.apiUrl).toBe("https://mock-api.test")
      expect(config.timeout).toBe(1000)
      expect(config.retries).toBe(1)
    })
    
    return Effect.runPromise(
      Effect.provide(program, createMockConfigProvider())
    )
  })
})
```

## Conclusion

Effect Config provides a powerful, type-safe, and declarative approach to configuration management that eliminates common sources of runtime errors and improves developer experience. By leveraging its validation, composition, and error-handling capabilities, you can build robust applications with confidence.

Key benefits:
- **Type Safety**: Compile-time guarantees about configuration structure and types
- **Validation**: Built-in validation prevents invalid configuration from reaching your application
- **Composition**: Complex configurations can be built from smaller, reusable pieces
- **Error Handling**: Detailed error messages help developers quickly identify and fix issues
- **Security**: Built-in support for sensitive data through secrets and redacted values
- **Testing**: Easy to mock and test different configuration scenarios

Use Effect Config when you need reliable, maintainable configuration management that scales with your application's complexity and provides excellent developer experience throughout the development lifecycle.