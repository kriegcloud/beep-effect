---
path: packages/common/constants
summary: Effect-first constants, literal schemas, and path tooling for env, auth, logging, and assets
tags: [constants, schema, literals, environment, auth-providers, logging, paths]
---

# @beep/constants

Centralized Effect-first constants providing validated literal schemas for environment configuration, authentication providers, logging levels, HTTP headers/methods, and type-safe asset path utilities. Serves as the canonical source for values consumed by `@beep/shared-server` env loaders, IAM surfaces, and UI asset references.

## Architecture

```
|-------------------------|     |----------------------|
|   BS.StringLiteralKit   | --> |  EnvValue, LogLevel  |
|   (@beep/schema)        |     |  AuthProviders, etc  |
|-------------------------|     |----------------------|
                                          |
                                          v
|-------------------------|     |----------------------|
|   _generated/           | --> |   paths/asset-paths  |
|   (repo scripts)        |     |   (type-safe URLs)   |
|-------------------------|     |----------------------|
                                          |
                                          v
                               |----------------------|
                               |   @beep/shared-*    |
                               |   apps/* (Next.js)  |
                               |----------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `EnvValue.ts` | Deployment tier literals: "dev", "staging", "prod" |
| `NodeEnvValue.ts` | Node runtime literals for environment detection |
| `AuthProviders.ts` | OAuth provider enum with configMap and filter helper |
| `LogLevel.ts` | Logging level literals: All, Debug, Info, Warning, Error, Fatal, Trace, None |
| `LogFormat.ts` | Logging format configuration for output pipelines |
| `Pagination.ts` | Default pagination limit (100) as literal schema |
| `SubscriptionPlanValue.ts` | Subscription plan literals: "basic", "pro", "enterprise" |
| `AllowedHeaders.ts` | API header whitelist: Content-Type, Authorization, B3, traceparent |
| `AllowedHttpMethods.ts` | HTTP method whitelist: GET, POST, PUT, DELETE, PATCH |
| `Csp.ts` | Content Security Policy directives and header builder |
| `paths/asset-paths.ts` | Type-safe accessor object for generated public paths |
| `paths/utils/` | Path array to typed object conversion utilities |
| `_generated/` | Machine-generated asset paths (read-only) |

## Usage Patterns

### Decode Environment Value with Fallback
```typescript
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { EnvValue } from "@beep/constants";

const env = F.pipe(
  process.env.ENV,
  S.decodeUnknownEither(EnvValue),
  Either.getOrElse(() => EnvValue.Enum.dev)
);
```

### Filter Auth Providers
```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import { AuthProviderNameValue } from "@beep/constants";

const trusted = HashSet.fromIterable(["google", "github"] as const);

const enabled = F.pipe(
  AuthProviderNameValue.Options,
  A.filter((provider) => HashSet.has(trusted, provider))
);
```

### Access Generated Asset Paths
```typescript
import { assetPaths } from "@beep/constants/paths/asset-paths";

const logo = assetPaths.logo;
const bgBlur = assetPaths.assets.background.background3Blur;
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| BS.StringLiteralKit for all enums | Provides `.Enum`, `.Options`, and schema metadata in one definition |
| Generated paths as read-only | Ensures asset URLs stay synchronized with actual files via repo scripts |
| AuthProviderNameValue.filter with invariant | Guards against empty provider lists at runtime |
| CSP as static constant | Avoids dynamic loading overhead while maintaining type-safe directive management |

## Dependencies

**Internal**: `@beep/schema`, `@beep/invariant`, `@beep/identity`

**External**: `effect`

## Related

- **AGENTS.md** - Detailed contributor guidance and authoring guardrails
