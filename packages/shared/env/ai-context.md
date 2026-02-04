---
path: packages/shared/env
summary: Type-safe environment config using Effect Config - client and server loaders, validation
tags: [env, config, effect, shared, environment, validation]
---

# @beep/shared-env

Type-safe environment configuration loaders for client and server contexts. Uses Effect Schema for validation and Effect Config for composable configuration with proper error messages. Centralizes all environment variable parsing ensuring consistent configuration across the application.

## Architecture

```
|------------------|     |------------------|
|   ClientEnv.ts   |     |   ServerEnv.ts   |
| NEXT_PUBLIC_* -> |     |  All env vars -> |
| Schema decode    |     |  Effect Config   |
|------------------|     |------------------|
        |                        |
        v                        v
|------------------|     |------------------|
|   clientEnv      |     |   serverEnv      |
| (sync export)    |     | (sync export)    |
|------------------|     |------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `ClientEnv` | Browser-safe config from `NEXT_PUBLIC_*` vars via Schema decode |
| `ServerEnv` | Server config via Effect Config - db, auth, oauth, cloud, ai |

## Usage Patterns

### Access Client Config
```typescript
import { clientEnv } from "@beep/shared-env";

const apiUrl = clientEnv.apiUrl;
const authProviders = clientEnv.authProviderNames;
```

### Access Server Config
```typescript
import { serverEnv } from "@beep/shared-env";

const dbUrl = serverEnv.db.pg.url;
const isDevMode = serverEnv.app.env === "dev";
```

### Check Placeholder Values
```typescript
import { isPlaceholder, serverEnv } from "@beep/shared-env";

if (isPlaceholder(serverEnv.cloud.aws.accessKeyId)) {
  // Use local storage fallback
}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Sync loading via `Effect.runSync` | Env must be available at module init |
| `Config.redacted` for secrets | Prevents accidental exposure in logs |
| Separate client/server exports | Browser security - client only sees `NEXT_PUBLIC_*` |
| Schema validation on decode | Fail fast with clear error messages |

## Dependencies

**Internal**: `@beep/constants`, `@beep/schema`, `@beep/shared-domain`
**External**: `effect` (Config, Schema, Redacted)

## Related

- **AGENTS.md** - Detailed contributor guidance with recipes
