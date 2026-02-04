# Config — Agent Context

> Quick reference for AI agents working with `effect/Config`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `Config.string` | Load string from env var | `Config.string("API_URL")` |
| `Config.number` | Load numeric value | `Config.number("PORT")` |
| `Config.boolean` | Load boolean value | `Config.boolean("ENABLE_FEATURE")` |
| `Config.url` | Load URL value | `Config.url("BASE_URL")` |
| `Config.redacted` | Load secret (suppresses logs) | `Config.redacted("API_KEY")` |
| `Config.withDefault` | Provide fallback value | `Config.string("ENV").pipe(Config.withDefault("dev"))` |
| `Config.nested` | Namespace config keys | `Config.nested("DB")(Config.string("HOST"))` |
| `Config.all` | Combine multiple configs | `Config.all({ host: Config.string("HOST") })` |
| `Config.array` | Load array from env | `Config.array(Config.string(), "TAGS")` |
| `Config.hashSet` | Load set from env | `Config.hashSet(Config.url(), "ORIGINS")` |
| `Config.map` | Transform config value | `config.pipe(Config.map(x => x.toUpperCase()))` |

## Import Convention

```typescript
import * as Config from "effect/Config";
```

## Codebase Patterns

### Pattern: Server Environment Configuration Structure

Define typed configuration sections for each service area:

```typescript
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

// From packages/shared/env/src/ServerEnv.ts
export const ServerConfig = Config.all({
  app: Config.nested("APP")(
    Config.all({
      name: Config.string("NAME"),
      env: Config.string("ENV"),
      domain: Config.string("DOMAIN"),
      url: Config.url("URL"),
      logLevel: Config.string("LOG_LEVEL").pipe(Config.withDefault("info")),
    })
  ),
  db: Config.nested("DB")(
    Config.nested("PG")(
      Config.all({
        url: Config.redacted("URL"),  // Sensitive connection string
        host: Config.string("HOST").pipe(Config.withDefault("localhost")),
        port: Config.number("PORT").pipe(Config.withDefault(5432)),
        user: Config.string("USER"),
        password: Config.redacted("PASSWORD"),  // Never logged
        database: Config.string("DATABASE"),
        ssl: Config.boolean("SSL").pipe(Config.withDefault(false)),
      })
    )
  ),
  oauth: Config.nested("OAUTH")(
    Config.all({
      google: Config.nested("GOOGLE")(
        Config.all({
          clientId: Config.string("CLIENT_ID"),
          clientSecret: Config.redacted("CLIENT_SECRET"),
        })
      ),
    })
  ),
});

// Load synchronously at app startup
export const serverEnv = Effect.runSync(ServerConfig);
```

### Pattern: Redacted Secrets with Placeholder Detection

Use `Config.redacted` for all secrets and provide placeholder defaults:

```typescript
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";

// From packages/shared/env/src/ServerEnv.ts
const PLACEHOLDER_VALUE = "PLACE_HOLDER";

const withPlaceholderRedacted = <A>(config: Config.Config<A>) =>
  config.pipe(Config.withDefault(Redacted.make(PLACEHOLDER_VALUE)));

export const isPlaceholder = <A>(value: Redacted.Redacted<A>): boolean =>
  Redacted.value(value) === PLACEHOLDER_VALUE;

// Usage in config definition
export const ServerConfig = Config.all({
  cloud: Config.nested("CLOUD")(
    Config.all({
      aws: Config.nested("AWS")(
        Config.all({
          accessKeyId: Config.redacted("ACCESS_KEY_ID").pipe(
            withPlaceholderRedacted  // Defaults to placeholder if unset
          ),
          secretAccessKey: Config.redacted("SECRET_ACCESS_KEY").pipe(
            withPlaceholderRedacted
          ),
        })
      ),
    })
  ),
});

// Check if credentials are configured before using
if (isPlaceholder(serverEnv.cloud.aws.accessKeyId)) {
  console.log("AWS not configured, using local storage");
}
```

### Pattern: URL Array Parsing from Comma-Separated String

Parse comma-separated URLs into typed arrays:

```typescript
import * as Config from "effect/Config";
import * as A from "effect/Array";
import * as F from "effect/Function";

// From packages/shared/env/src/ServerEnv.ts
export const ConfigArrayURL = <TName extends string>(name: TName) =>
  Config.hashSet(Config.url(), name).pipe(
    Config.map(
      F.flow(
        A.fromIterable,
        A.map((url) => url.origin)  // Extract origin (no trailing slash)
      )
    )
  );

// Usage
export const ServerConfig = Config.all({
  security: Config.nested("SECURITY")(
    Config.all({
      trustedOrigins: ConfigArrayURL("TRUSTED_ORIGINS"),
      // Env: SECURITY_TRUSTED_ORIGINS="https://app.com,https://api.com"
      // Result: ["https://app.com", "https://api.com"]
    })
  ),
});
```

### Pattern: Nested Configuration Prefixes

Use `Config.nested` to organize related settings with common prefixes:

```typescript
import * as Config from "effect/Config";

// From .repos/effect/packages/ai/openai/src/OpenAiClient.ts
const openAiConfig = Config.nested("OPENAI")(
  Config.all({
    apiKey: Config.redacted("API_KEY"),
    model: Config.string("MODEL").pipe(Config.withDefault("gpt-4-turbo")),
    baseUrl: Config.url("BASE_URL").pipe(
      Config.withDefault(new URL("https://api.openai.com/v1"))
    ),
    organization: Config.string("ORGANIZATION").pipe(Config.withDefault("")),
  })
);

// Environment variables:
// OPENAI_API_KEY="sk-..."
// OPENAI_MODEL="gpt-4"
// OPENAI_BASE_URL="https://custom.openai.com"
// OPENAI_ORGANIZATION="org-123"
```

### Pattern: Config with Default Values for Optional Settings

Provide sensible defaults for non-critical configuration:

```typescript
import * as Config from "effect/Config";
import * as Duration from "effect/Duration";

// From packages/shared/domain/src/Retry.ts
const retryConfig = Config.all({
  maxRetries: Config.number("MAX_RETRIES").pipe(Config.withDefault(3)),
  initialDelay: Config.number("INITIAL_DELAY_MS").pipe(Config.withDefault(100)),
  growthFactor: Config.number("GROWTH_FACTOR").pipe(Config.withDefault(2.0)),
  jitter: Config.boolean("JITTER").pipe(Config.withDefault(true)),
});

// Allows flexible overrides via env:
// MAX_RETRIES=5
// INITIAL_DELAY_MS=500
```

### Pattern: Port Number Validation

Use `Config.port` for validated network port numbers (1-65535):

```typescript
import * as Config from "effect/Config";

// From .repos/effect/packages/effect/src/Config.ts
const serverConfig = Config.all({
  host: Config.string("HOST").pipe(Config.withDefault("0.0.0.0")),
  port: Config.port("PORT").pipe(Config.withDefault(8080)),
  // Config.port validates range [1, 65535]
});
```

### Pattern: ConfigProvider for Test Fixtures

Override configuration in tests using `ConfigProvider`:

```typescript
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// From .repos/effect/packages/platform/test/ConfigProvider.test.ts
const testConfig = Layer.setConfigProvider(
  ConfigProvider.fromMap(
    new Map([
      ["API_URL", "https://test.example.com"],
      ["DB_HOST", "localhost"],
      ["DB_PORT", "5433"],
    ])
  )
);

const program = Effect.gen(function* () {
  const apiUrl = yield* Config.string("API_URL");
  const dbPort = yield* Config.number("DB_PORT");
  return { apiUrl, dbPort };
}).pipe(Effect.provide(testConfig));

// Result: { apiUrl: "https://test.example.com", dbPort: 5433 }
```

## Anti-Patterns

### NEVER: Direct process.env Access in Application Code

Always route environment access through Effect Config for type safety and validation:

```typescript
// FORBIDDEN - Bypasses validation, no type safety
const apiUrl = process.env.API_URL!;
const port = Number.parseInt(process.env.PORT || "3000");

// CORRECT - Typed, validated, with defaults
const apiUrl = yield* Config.url("API_URL");
const port = yield* Config.port("PORT").pipe(Config.withDefault(3000));
```

### NEVER: Expose Secrets Without Config.redacted

All passwords, API keys, and tokens MUST use `Config.redacted`:

```typescript
// FORBIDDEN - Secret appears in logs/error messages
const password = yield* Config.string("DB_PASSWORD");
console.log("Connecting with:", password);  // SECURITY LEAK!

// CORRECT - Secret is wrapped in Redacted
const password = yield* Config.redacted("DB_PASSWORD");
console.log("Connecting with:", password);  // Logs: "<redacted>"
```

### NEVER: Forget to Provide Defaults for Optional Config

Missing config without defaults causes app startup failures:

```typescript
// FORBIDDEN - Crashes if OPTIONAL_FEATURE_FLAG unset
const featureEnabled = yield* Config.boolean("OPTIONAL_FEATURE_FLAG");

// CORRECT - Graceful fallback
const featureEnabled = yield* Config.boolean("OPTIONAL_FEATURE_FLAG").pipe(
  Config.withDefault(false)
);
```

### NEVER: Use Config.string for Structured Types

Use specific Config constructors for URLs, ports, and enums:

```typescript
// FORBIDDEN - No validation, string type
const baseUrl = yield* Config.string("BASE_URL");
const port = yield* Config.string("PORT");

// CORRECT - Type-safe with validation
const baseUrl = yield* Config.url("BASE_URL");
const port = yield* Config.port("PORT");
```

### NEVER: Hardcode Sensitive Defaults

If a secret is required, let Config fail loudly instead of providing insecure defaults:

```typescript
// FORBIDDEN - Insecure fallback
const apiKey = yield* Config.redacted("API_KEY").pipe(
  Config.withDefault(Redacted.make("default-key-12345"))  // SECURITY RISK!
);

// CORRECT - Fail fast if unset
const apiKey = yield* Config.redacted("API_KEY");
// Or use placeholder pattern with runtime checks:
const apiKey = yield* Config.redacted("API_KEY").pipe(withPlaceholderRedacted);
if (isPlaceholder(apiKey)) {
  return yield* new ConfigError({ message: "API_KEY required" });
}
```

### NEVER: Mutate Config After Loading

Config values are immutable—reloading requires restarting the app:

```typescript
// FORBIDDEN - No-op or runtime error
serverEnv.app.env = "production";  // Readonly!

// CORRECT - Restart app with updated env vars
// No in-process config mutation
```

## Related Modules

- [Redacted](../effect/Redacted.md) — Wrap secrets to prevent logging
- [Either](../effect/Either.md) — Config validation returns `Either<A, ConfigError>`
- [Schema](../effect/Schema.md) — Use `S.Config` for schema-validated config

## Source Reference

[.repos/effect/packages/effect/src/Config.ts](../../.repos/effect/packages/effect/src/Config.ts)
