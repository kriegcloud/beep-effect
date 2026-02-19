# @beep/shared-env

Type-safe environment configuration loaders for both client and server contexts.

## Purpose

`@beep/shared-env` provides Effect-based environment variable validation and loading for the beep-effect monorepo. It separates client-side (`NEXT_PUBLIC_*`) and server-side environment concerns with comprehensive schema validation.

- **Client environment**: Browser-safe variables with Next.js public prefix, validated at module initialization
- **Server environment**: Full backend configuration including database, auth, cloud services, payments, and observability
- **Type safety**: All environment variables are validated using Effect Schema with detailed error messages
- **Immutable**: Configurations are loaded once at startup and cannot be mutated

This package sits in the **shared layer** and is consumed by both  and `apps/server`.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-env": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `clientEnv` | Synchronously loaded client environment (browser-safe) |
| `serverEnv` | Synchronously loaded server environment (full config) |
| `ServerConfig` | Effect Config schema for server environment |
| `ConfigArrayURL` | Helper for parsing comma-separated URL arrays |
| `isPlaceholder` | Predicate to check if a config value is a placeholder |

## Usage

### Client Environment

```typescript
import { clientEnv } from "@beep/shared-env"
import * as Effect from "effect/Effect"

// Access validated client config
const program = Effect.gen(function* () {
  yield* Effect.log({ appName: clientEnv.appName })
  yield* Effect.log({ appUrl: clientEnv.appUrl })
  yield* Effect.log({ authProviders: clientEnv.authProviderNames })
  yield* Effect.log({ logLevel: clientEnv.logLevel })
})
```

**Client environment variables**:
- `NEXT_PUBLIC_ENV`: Environment name (dev/staging/prod)
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_DOMAIN`: Application domain
- `NEXT_PUBLIC_AUTH_PROVIDER_NAMES`: Comma-separated auth providers
- `NEXT_PUBLIC_APP_URL`: Frontend URL
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_OTLP_*_EXPORTER_URL`: Observability endpoints
- `NEXT_PUBLIC_LOG_LEVEL`: Logging level
- `NEXT_PUBLIC_LOG_FORMAT`: Log format (pretty/json)
- `NEXT_PUBLIC_CAPTCHA_SITE_KEY`: reCAPTCHA site key
- `NEXT_PUBLIC_AUTH_URL`: Auth service URL
- `NEXT_PUBLIC_AUTH_PATH`: Auth endpoint path
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `NEXT_PUBLIC_ENABLE_GEO_TRACKING`: Geo-tracking feature flag

### Server Environment

```typescript
import { serverEnv } from "@beep/shared-env"
import * as Effect from "effect/Effect"
import * as Redacted from "effect/Redacted"

// Access validated server config
const program = Effect.gen(function* () {
  yield* Effect.log({ appName: serverEnv.app.name })
  yield* Effect.log({ env: serverEnv.app.env })
  yield* Effect.log({ dbHost: serverEnv.db.pg.host })
  yield* Effect.log({ dbPort: serverEnv.db.pg.port })

  // Redacted values require explicit unwrapping
  const dbPassword = Redacted.value(serverEnv.db.pg.password)
  const awsKey = Redacted.value(serverEnv.cloud.aws.accessKeyId)
})
```

### Effect Config (Advanced)

For dynamic config loading or custom providers:

```typescript
import { ServerConfig } from "@beep/shared-env"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  const config = yield* ServerConfig

  yield* Effect.log({ appName: config.app.name })
  yield* Effect.log({ logLevel: config.app.logLevel })

  return config
})
```

### Checking for Placeholders

Some optional config values use placeholders when not configured:

```typescript
import { serverEnv, isPlaceholder } from "@beep/shared-env"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  if (isPlaceholder(serverEnv.cloud.aws.accessKeyId)) {
    yield* Effect.log("AWS credentials not configured - using local storage")
  }

  if (isPlaceholder(serverEnv.email.resend.apiKey)) {
    yield* Effect.log("Email service not configured - emails will be logged")
  }
})
```

### Parsing URL Arrays

```typescript
import { ConfigArrayURL } from "@beep/shared-env"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"

const trustedOrigins = ConfigArrayURL("SECURITY_TRUSTED_ORIGINS")

const program = Effect.gen(function* () {
  const origins = yield* trustedOrigins
  // origins is string[] parsed from comma-separated URLs
  return origins
})
```

## Configuration Structure

### Server Config Hierarchy

```typescript
serverEnv: {
  baseUrl: string                    // Computed from Vercel env or fallback
  productionUrl: Option<DomainName>  // Vercel production URL
  app: {
    protocol: "http" | "https"       // Based on environment
    name: string
    env: "dev" | "staging" | "prod"
    rootDomain: string
    domain: string
    adminUserIds: UserId[]
    logFormat: "pretty" | "json"
    logLevel: LogLevel
    mcpUrl: URL
    authUrl: URL
    apiUrl: URL
    apiHost: string
    apiPort: number
    clientUrl: URL
    api: { url: URL, port: number, host: string }
    baseUrl: URL                     // Computed base URL
    projectProductionUrl: URL
    vercelEnv: "production" | "preview" | "development" | "staging"
  }
  auth: {
    secret: Redacted<string>
  }
  cloud: {
    aws: {
      region: string
      accessKeyId: Redacted<string>
      secretAccessKey: Redacted<string>
      s3: { bucketName: string }
    }
    google: {
      captcha: {
        siteKey: Redacted<string>
        secretKey: Redacted<string>
      }
    }
  }
  db: {
    pg: {
      url: Redacted<string>
      ssl: boolean
      port: number
      user: string
      password: Redacted<string>
      host: string
      database: string
    }
  }
  payment: {
    stripe: {
      key: Redacted<string>
      webhookSecret: Redacted<string>
    }
  }
  email: {
    from: Email
    test: Email
    resend: { apiKey: Redacted<string> }
  }
  kv: {
    redis: {
      url: string
      port: number
      password: Redacted<string>
    }
  }
  alchemy: {
    password: Redacted<string>
  }
  marketing: {
    dub: { token: Redacted<string> }
  }
  upload: {
    secret: Redacted<string>
  }
  oauth: {
    authProviderNames: AuthProviderName[]
    provider: {
      microsoft: { clientId: Option<Redacted<string>>, clientSecret: Option<Redacted<string>>, tenantId: Option<Redacted<string>> }
      google: { clientId: Option<Redacted<string>>, clientSecret: Option<Redacted<string>> }
      discord: { clientId: Option<Redacted<string>>, clientSecret: Option<Redacted<string>> }
      github: { clientId: Option<Redacted<string>>, clientSecret: Option<Redacted<string>> }
      linkedin: { clientId: Option<Redacted<string>>, clientSecret: Option<Redacted<string>> }
      twitter: { clientId: Option<Redacted<string>>, clientSecret: Option<Redacted<string>> }
    }
  }
  otlp: {
    traceExporterUrl: URL
    logExporterUrl: URL
    metricExporterUrl: URL
  }
  security: {
    trustedOrigins: string[]
  }
  isVite: boolean
  ai: {
    openai: { apiKey: Redacted<string> }
    anthropic: { apiKey: Redacted<string> }
  }
}
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/constants` | Environment enums (EnvValue), log levels (LogLevel, LogFormat), auth provider names (AuthProviderNameValue) |
| `@beep/schema` | Schema utilities (Url, Email, DomainName primitives via BS namespace) |
| `@beep/shared-domain` | Entity IDs (UserId for admin user configuration) |
| `effect/Config` | Effect Config API for declarative server environment loading |
| `effect/Schema` | Schema validation and decoding for client environment |
| `effect/Redacted` | Redacted wrapper for sensitive configuration values |

## Integration

### Client-Side (Next.js)

```typescript
// app/layout.tsx or app/providers.tsx
import { clientEnv } from "@beep/shared-env"

export function Providers({ children }: { children: React.ReactNode }) {
  // clientEnv is already validated and available synchronously
  const logLevel = clientEnv.logLevel

  return (
    <LoggerProvider level={logLevel}>
      {children}
    </LoggerProvider>
  )
}
```

### Server-Side (Effect Platform)

```typescript
// apps/server/src/main.ts
import { serverEnv } from "@beep/shared-env"
import * as Effect from "effect/Effect"

const main = Effect.gen(function* () {
  // serverEnv is already validated and available synchronously
  const port = serverEnv.app.api.port
  const logLevel = serverEnv.app.logLevel

  yield* Effect.log({ message: "Starting server", port })
  yield* Effect.log({ message: "Log level", logLevel })
})
```

### Conditional Features

```typescript
import { serverEnv, isPlaceholder } from "@beep/shared-env"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

const StorageLayer = isPlaceholder(serverEnv.cloud.aws.accessKeyId)
  ? LocalStorageService.Live  // Use local filesystem
  : S3StorageService.Live    // Use AWS S3

const EmailLayer = isPlaceholder(serverEnv.email.resend.apiKey)
  ? ConsoleEmailService.Live  // Log emails to console
  : ResendEmailService.Live  // Send via Resend
```

## Development

```bash
# Type check
bun run --filter @beep/shared-env check

# Lint
bun run --filter @beep/shared-env lint

# Build
bun run --filter @beep/shared-env build

# Test
bun run --filter @beep/shared-env test
```

## Notes

### Validation Failures

Both `clientEnv` and `serverEnv` throw synchronously at module initialization if validation fails. This is intentional - the application should not start with invalid configuration.

```typescript
// If NEXT_PUBLIC_APP_URL is malformed, this throws:
Error: Invalid environment variables:
  └─ ["appUrl"]
     └─ Expected a valid URL, got "not-a-url"
```

### Redacted Values

Sensitive configuration values are wrapped in `Redacted<string>` to prevent accidental logging:

```typescript
import * as Redacted from "effect/Redacted"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  // This will NOT log the actual password
  yield* Effect.log({ dbPassword: serverEnv.db.pg.password })
  // Output: { dbPassword: <redacted> }

  // Explicit unwrapping required
  const password = Redacted.value(serverEnv.db.pg.password)
})
```

### Placeholder Pattern

Optional services use `PLACE_HOLDER` as a default value. Use `isPlaceholder` to check:

```typescript
import { serverEnv, isPlaceholder } from "@beep/shared-env"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  if (isPlaceholder(serverEnv.cloud.aws.accessKeyId)) {
    // AWS not configured - use alternative storage
    yield* Effect.log("Using local storage fallback")
  }
})
```

### Environment Variable Naming

- **Client**: `NEXT_PUBLIC_*` prefix required (Next.js convention)
- **Server**: `SCREAMING_SNAKE_CASE` converted to nested config (e.g., `DB_PG_HOST` becomes `db.pg.host`)

### Config Provider

The server environment uses `ConfigProvider.constantCase` to automatically map environment variables like `DB_PG_HOST` to nested config paths `db.pg.host`.

### Import Patterns

The package supports both index imports and direct module imports:

```typescript
// Import from index (recommended)
import { clientEnv, serverEnv, isPlaceholder } from "@beep/shared-env"

// Direct module imports (when tree-shaking is critical)
import { clientEnv } from "@beep/shared-env/ClientEnv"
import { serverEnv, ServerConfig } from "@beep/shared-env/ServerEnv"
```
