# @beep/shared-env — Agent Guide

## Purpose & Fit
- Provides type-safe environment configuration loaders for both client and server contexts using Effect Schema and Effect Config.
- Centralizes all environment variable parsing and validation in one package, ensuring consistent configuration across the application.
- Exposes `clientEnv` for browser-safe NEXT_PUBLIC_ variables and `serverEnv` for server-side configuration.
- Uses Effect's Config system for composable, type-safe configuration loading with proper error messages.

## Surface Map
- **clientEnv** — Synchronously loaded client environment configuration from `NEXT_PUBLIC_*` environment variables. Includes:
  - `env` — Environment mode (dev/staging/prod)
  - `appName`, `appDomain`, `appUrl`, `apiUrl`, `authUrl` — Application URLs
  - `authProviderNames` — Comma-separated OAuth provider names
  - `otlpTraceExporterUrl`, `otlpLogExporterUrl`, `otlpMetricExporterUrl` — Observability endpoints
  - `logLevel`, `logFormat` — Logging configuration
  - `captchaSiteKey`, `googleClientId` — Third-party integrations
  - `enableGeoTracking` — Feature flag

- **serverEnv** — Synchronously loaded server environment configuration. Includes:
  - `app.*` — Application settings (name, env, domain, URLs, log settings, admin user IDs)
  - `auth.secret` — Better Auth secret (Redacted)
  - `db.pg.*` — PostgreSQL connection settings (URL, host, port, user, password, database, SSL)
  - `cloud.aws.*` — AWS credentials and S3 bucket configuration (Redacted)
  - `cloud.google.captcha.*` — Google reCAPTCHA keys (Redacted)
  - `payment.stripe.*` — Stripe API keys and webhook secret (Redacted)
  - `email.resend.*` — Resend email API key (Redacted)
  - `kv.redis.*` — Redis connection settings
  - `oauth.provider.*` — OAuth provider credentials (Google, GitHub, Discord, Microsoft, LinkedIn, Twitter)
  - `otlp.*` — OpenTelemetry exporter URLs
  - `security.trustedOrigins` — CORS allowed origins
  - `ai.*` — AI provider API keys (OpenAI, Anthropic)

- **ServerConfig** — Effect Config definition for server environment, composable for custom configurations.
- **ConfigArrayURL** — Helper for parsing comma-separated URL lists from environment variables.
- **isPlaceholder** — Predicate to check if a config value is a placeholder (not yet configured).

## Usage Snapshots
- Next.js app imports `clientEnv` in client components for public configuration.
- Server runtime imports `serverEnv` at startup to configure database, auth, and external services.
- RPC handlers access `serverEnv` for secrets without re-parsing environment.
- Feature flags check `serverEnv.app.env` to enable dev-only functionality.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `Config`, `S`, `F`, `O`, `A`) and rely on Effect utilities instead of native helpers.
- Use `Config.redacted` for sensitive values — NEVER expose secrets in logs or error messages.
- Define new config fields in the appropriate section (app, db, oauth, etc.) for logical grouping.
- Use `Config.withDefault` for optional configuration with sensible defaults.
- Use `S.Config` from Effect Schema for schema-validated configuration values.
- IMPORTANT: Client environment MUST only include `NEXT_PUBLIC_*` variables for browser security.
- Server environment is loaded synchronously via `Effect.runSync` — keep the config pure and side-effect free.

## Quick Recipes
- **Add a new client environment variable**
  ```ts
  // In ClientEnv.ts, add to ClientEnvSchema
  const ClientEnvSchema = S.Struct({
    // ... existing fields
    myNewFeatureFlag: S.BooleanFromString,
  });

  // Update the loading object
  export const clientEnv = F.pipe(
    {
      // ... existing fields
      myNewFeatureFlag: process.env.NEXT_PUBLIC_MY_NEW_FEATURE_FLAG,
    },
    S.decodeUnknownEither(ClientEnvSchema),
    // ...
  );
  ```

- **Add a new server configuration section**
  ```ts
  // In ServerEnv.ts, add to ServerConfig
  export const ServerConfig = Config.all({
    // ... existing sections
    myService: Config.nested("MY_SERVICE")(
      Config.all({
        apiKey: Config.redacted(Config.nonEmptyString("API_KEY")),
        baseUrl: Config.url("BASE_URL"),
        enabled: Config.boolean("ENABLED").pipe(Config.withDefault(false)),
      })
    ),
  });
  ```

- **Check if credentials are configured**
  ```ts
  import { isPlaceholder, serverEnv } from "@beep/shared-env";

  if (isPlaceholder(serverEnv.cloud.aws.accessKeyId)) {
    console.log("AWS credentials not configured, using local storage fallback");
  }
  ```

## Verifications
- `bun run check --filter @beep/shared-env`
- `bun run lint --filter @beep/shared-env`
- `bun run test --filter @beep/shared-env`

## Contributor Checklist
- [ ] Add new environment variables to the appropriate schema (ClientEnvSchema or ServerConfig).
- [ ] Use `Config.redacted` for all secrets and API keys.
- [ ] Provide sensible defaults via `Config.withDefault` for optional configuration.
- [ ] Update `.env.example` files in the repository root with new variables.
- [ ] Document new configuration in the corresponding section of this guide.
- [ ] Ensure client-side variables use `NEXT_PUBLIC_` prefix.
- [ ] Re-run verification commands above before handing work off.
