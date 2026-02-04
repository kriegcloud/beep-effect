# integration-architecture-migration: Agent Prompts

> Copy-paste ready prompts for each phase of the integration architecture migration.

> ⚠️ **Note on Phase 2**: The original Phase 2 prompts for `IntegrationTokenStore` have been superseded. Phase 2 now extends `AuthContext` with OAuth API methods instead. See [REFLECTION_LOG.md](./REFLECTION_LOG.md) for the architectural pivot details.

---

## Overview

This document contains ready-to-use prompts for migrating third-party integrations from `packages/shared/integrations` to a three-tier architecture:

1. **Infrastructure Layer**: Shared Google Workspace packages (`@beep/google-workspace-*`)
2. **Auth Context Layer**: OAuth API via `AuthContext.oauth` leveraging Better Auth's token management
3. **Adapter Layer**: Slice-specific integration adapters (`@beep/*-server`)

---

## Phase 1a: Package Structure + Domain Layer

**Agent**: effect-code-writer
**Objective**: Create foundational package structure and domain layer for `packages/integrations/google-workspace` with error types, scope constants, and token models.

### Context Files to Review

Read these files before starting:
- `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md` - Required Effect patterns
- `/home/elpresidank/YeeBois/projects/beep-effect2/documentation/PACKAGE_STRUCTURE.md` - Package layout
- `/home/elpresidank/YeeBois/projects/beep-effect2/specs/integration-architecture-migration/MASTER_ORCHESTRATION.md` - Full architecture context

### Tasks

#### Task 1a.1: Create Package Structure

Create the package directories:

```bash
mkdir -p packages/integrations/google-workspace/{domain,client,server}/{src,test}
```

**Files to Create**:
- `packages/integrations/google-workspace/package.json`
- `packages/integrations/google-workspace/tsconfig.json`
- `packages/integrations/google-workspace/domain/package.json`

**package.json Template**:
```json
{
  "name": "@beep/integrations-google-workspace",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./domain": "./domain/src/index.ts",
    "./client": "./client/src/index.ts",
    "./server": "./server/src/index.ts"
  },
  "dependencies": {
    "@beep/shared-domain": "workspace:*",
    "@effect/platform": "^0.68.0",
    "effect": "^3.10.0"
  }
}
```

#### Task 1a.2: Domain Layer - Error Types

Create tagged error types following Effect patterns:

**`packages/integrations/google-workspace/domain/src/errors.ts`**
```typescript
import * as S from "effect/Schema";

export class GoogleApiError extends S.TaggedError<GoogleApiError>()(
  "GoogleApiError",
  {
    message: S.String,
    statusCode: S.Number,
    method: S.String,
    endpoint: S.String,
  }
) {}

export class RateLimitError extends S.TaggedError<RateLimitError>()(
  "RateLimitError",
  {
    message: S.String,
    retryAfterMs: S.Number,
    quotaLimit: S.String,
  }
) {}

export class TokenError extends S.TaggedError<TokenError>()(
  "TokenError",
  {
    message: S.String,
    reason: S.Literal("expired", "invalid", "missing", "insufficient_scope"),
  }
) {}

export class ScopeExpansionRequiredError extends S.TaggedError<ScopeExpansionRequiredError>()(
  "ScopeExpansionRequiredError",
  {
    message: S.String,
    currentScopes: S.Array(S.String),
    requiredScopes: S.Array(S.String),
    missingScopes: S.Array(S.String),
  }
) {}
```

**Pattern**: Use `S.TaggedError` for type-safe error handling with Effect's `catchTag`.

#### Task 1a.3: Domain Layer - Scope Constants

**`packages/integrations/google-workspace/domain/src/scopes.ts`**
```typescript
export const GoogleScopes = {
  Gmail: {
    ReadOnly: "https://www.googleapis.com/auth/gmail.readonly" as const,
    Modify: "https://www.googleapis.com/auth/gmail.modify" as const,
    Send: "https://www.googleapis.com/auth/gmail.send" as const,
    Compose: "https://www.googleapis.com/auth/gmail.compose" as const,
  },
  Calendar: {
    ReadOnly: "https://www.googleapis.com/auth/calendar.readonly" as const,
    Events: "https://www.googleapis.com/auth/calendar.events" as const,
    Full: "https://www.googleapis.com/auth/calendar" as const,
  },
  Drive: {
    ReadOnly: "https://www.googleapis.com/auth/drive.readonly" as const,
    File: "https://www.googleapis.com/auth/drive.file" as const,
    Full: "https://www.googleapis.com/auth/drive" as const,
  },
} as const;

export type GoogleScope =
  | typeof GoogleScopes.Gmail[keyof typeof GoogleScopes.Gmail]
  | typeof GoogleScopes.Calendar[keyof typeof GoogleScopes.Calendar]
  | typeof GoogleScopes.Drive[keyof typeof GoogleScopes.Drive];
```

**Pattern**: Use `as const` for compile-time scope validation.

#### Task 1a.4: Domain Layer - Token Models

**`packages/integrations/google-workspace/domain/src/models.ts`**
```typescript
import * as S from "effect/Schema";

export class AccessToken extends S.Class<AccessToken>("AccessToken")({
  token: S.String,
  expiresAt: S.Date,
  scopes: S.Array(S.String),
}) {}
```

**Pattern**: Use `S.Class` for structured domain models.

**`packages/integrations/google-workspace/domain/src/index.ts`**
```typescript
export * from "./errors.js";
export * from "./scopes.js";
export * from "./models.js";
```

### Success Criteria

- [ ] Package structure created (`domain`, `client`, `server` directories)
- [ ] Domain layer exports error types
- [ ] Domain layer exports scope constants
- [ ] Domain layer exports token models
- [ ] `bun run check --filter @beep/integrations-google-workspace` passes
- [ ] REFLECTION_LOG.md updated with Phase 1a learnings
- [ ] HANDOFF_P1b.md created with context for Phase 1b
- [ ] P1b_ORCHESTRATOR_PROMPT.md created

### Checkpoint

Before proceeding to Phase 1b:
- [ ] All error types compile and export correctly
- [ ] Scope constants are well-typed
- [ ] Token models compile
- [ ] No compilation errors in domain package

### Gates

Run from project root:
```bash
bun run check --filter @beep/integrations-google-workspace
```

---

## Phase 1b: Client + Server Layers

**Agent**: effect-code-writer
**Objective**: Complete infrastructure package by implementing client service interfaces (Context.Tags), GoogleApiClient with retry logic, and server service implementations.

### Context Files to Review

Read these files before starting:
- `/home/elpresidank/YeeBois/projects/beep-effect2/specs/integration-architecture-migration/handoffs/HANDOFF_P1b.md` - Context from Phase 1a
- `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md` - Required Effect patterns
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/integrations/src/google/gmail/common/GmailClient.ts` - Context.Tag pattern reference
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/integrations/src/google/gmail/common/wrap-gmail-call.ts` - Effect wrapper pattern reference

### Tasks

#### Task 1b.1: Client Layer - GoogleAuthClient Interface

**Files to Create**:
- `packages/integrations/google-workspace/client/package.json`

**`packages/integrations/google-workspace/client/src/GoogleAuthClient.ts`**
```typescript
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type { TokenError, ScopeExpansionRequiredError, AccessToken } from "@beep/integrations-google-workspace/domain";

export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  {
    readonly getValidToken: (
      scopes: ReadonlyArray<string>
    ) => Effect.Effect<AccessToken, TokenError | ScopeExpansionRequiredError>;

    readonly refreshToken: (
      refreshToken: string
    ) => Effect.Effect<AccessToken, TokenError>;
  }
>() {}
```

**Pattern**: Use `Context.Tag` for dependency injection with Effect Layers.

#### Task 1b.2: Client Layer - GoogleApiClient

**`packages/integrations/google-workspace/client/src/GoogleApiClient.ts`**
```typescript
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";
import { HttpClient } from "@effect/platform";
import { GoogleApiError, RateLimitError } from "@beep/integrations-google-workspace/domain";

export class GoogleApiClient extends Context.Tag("GoogleApiClient")<
  GoogleApiClient,
  HttpClient.HttpClient.Service
>() {}

export const GoogleApiClientLive = Layer.effect(
  GoogleApiClient,
  HttpClient.HttpClient.pipe(
    Effect.map((client) =>
      client.pipe(
        HttpClient.filterStatusOk,
        HttpClient.retry({
          schedule: Schedule.exponential(Duration.seconds(1)).pipe(
            Schedule.compose(Schedule.recurs(3))
          ),
          while: (error) => error.status === 429 || error.status >= 500,
        }),
        HttpClient.mapError((error) => {
          if (error.status === 429) {
            const retryAfter = error.headers["retry-after"];
            const retryAfterMs = retryAfter
              ? Number.parseInt(retryAfter, 10) * 1000
              : 60000;

            return new RateLimitError({
              message: "Google API rate limit exceeded",
              retryAfterMs,
              quotaLimit: error.headers["x-rate-limit-limit"] ?? "unknown",
            });
          }

          return new GoogleApiError({
            message: error.message,
            statusCode: error.status,
            method: error.method,
            endpoint: error.url,
          });
        })
      )
    )
  )
);
```

**Pattern**: Wrap HttpClient in a Context.Tag for retry/backoff behavior.

#### Task 1b.3: Client Layer - OAuth Contract Schemas

**`packages/integrations/google-workspace/client/src/contracts.ts`**
```typescript
import * as S from "effect/Schema";
import { BS } from "@beep/schema";

export class OAuthTokenResponse extends S.Class<OAuthTokenResponse>("OAuthTokenResponse")({
  access_token: S.String,
  refresh_token: BS.FieldOptionOmittable(S.String),
  expires_in: S.Number,
  scope: S.String,
  token_type: S.Literal("Bearer"),
}) {}

export class OAuthRefreshResponse extends S.Class<OAuthRefreshResponse>("OAuthRefreshResponse")({
  access_token: S.String,
  expires_in: S.Number,
  scope: S.String,
  token_type: S.Literal("Bearer"),
}) {}

export class OAuthErrorResponse extends S.Class<OAuthErrorResponse>("OAuthErrorResponse")({
  error: S.String,
  error_description: BS.FieldOptionOmittable(S.String),
}) {}
```

**Pattern**: Use `BS.FieldOptionOmittable` for optional fields that should be omitted when undefined.

**`packages/integrations/google-workspace/client/src/index.ts`**
```typescript
export { GoogleAuthClient } from "./GoogleAuthClient.js";
export { GoogleApiClient, GoogleApiClientLive } from "./GoogleApiClient.js";
export * from "./contracts.js";
```

#### Task 1b.4: Server Layer - GoogleAuthService Implementation

**Files to Create**:
- `packages/integrations/google-workspace/server/package.json`

**`packages/integrations/google-workspace/server/src/GoogleAuthService.ts`**
```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as A from "effect/Array";
import { HttpClient } from "@effect/platform";
import { GoogleAuthClient, OAuthRefreshResponse } from "@beep/integrations-google-workspace/client";
import { TokenError, ScopeExpansionRequiredError } from "@beep/integrations-google-workspace/domain";
// Forward reference - IntegrationTokenStore will be implemented in Phase 2
// import type { IntegrationTokenStore } from "@beep/iam-server";

export const GoogleAuthServiceLive = Layer.effect(
  GoogleAuthClient,
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    // const tokenStore = yield* IntegrationTokenStore; // Phase 2
    const clientId = yield* Effect.config("GOOGLE_CLIENT_ID");
    const clientSecret = yield* Effect.config("GOOGLE_CLIENT_SECRET");

    const refreshAccessToken = (refreshToken: string) =>
      Effect.gen(function* () {
        const response = yield* http.post("https://oauth2.googleapis.com/token", {
          body: {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          },
        }).pipe(
          Effect.flatMap((res) => res.json),
          Effect.flatMap(S.decode(OAuthRefreshResponse))
        );

        const expiresAt = yield* DateTime.now.pipe(
          Effect.map((now) => DateTime.add(now, Duration.seconds(response.expires_in)))
        );

        return {
          token: response.access_token,
          expiresAt: DateTime.toDate(expiresAt),
          scopes: response.scope.split(" "),
        };
      }).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new TokenError({
              message: `Failed to refresh token: ${error.message}`,
              reason: "invalid",
            })
          )
        )
      );

    const getValidToken = (requiredScopes: ReadonlyArray<string>) =>
      Effect.gen(function* () {
        // Placeholder implementation - Phase 2 will integrate with IntegrationTokenStore
        return yield* Effect.fail(
          new TokenError({
            message: "Token storage not yet implemented (Phase 2)",
            reason: "missing",
          })
        );
      });

    return GoogleAuthClient.of({
      getValidToken,
      refreshToken: refreshAccessToken,
    });
  })
);
```

**Pattern**: Use `Effect.config` for environment variables, `DateTime` for time operations. Leave Phase 2 dependencies as placeholders.

#### Task 1b.5: Server Layer - Layer Exports

**`packages/integrations/google-workspace/server/src/index.ts`**
```typescript
export { GoogleAuthServiceLive } from "./GoogleAuthService.js";

// Re-export client types for convenience
export type { AccessToken } from "@beep/integrations-google-workspace/domain";
export { GoogleAuthClient } from "@beep/integrations-google-workspace/client";
```

#### Task 1b.6: Update tsconfig References

Update `tsconfig.base.jsonc` to include path aliases:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@beep/integrations-google-workspace/domain": ["packages/integrations/google-workspace/domain/src/index.ts"],
      "@beep/integrations-google-workspace/client": ["packages/integrations/google-workspace/client/src/index.ts"],
      "@beep/integrations-google-workspace/server": ["packages/integrations/google-workspace/server/src/index.ts"]
    }
  }
}
```

### Success Criteria

- [ ] Client layer package created
- [ ] Server layer package created
- [ ] GoogleAuthClient interface defined
- [ ] GoogleApiClient with retry logic implemented
- [ ] GoogleAuthService implementation complete (with Phase 2 placeholders)
- [ ] OAuth contract schemas defined
- [ ] tsconfig references updated
- [ ] `bun run check --filter @beep/integrations-google-workspace` passes
- [ ] REFLECTION_LOG.md updated with Phase 1b learnings
- [ ] HANDOFF_P2.md created with context for Phase 2
- [ ] P2_ORCHESTRATOR_PROMPT.md created

### Checkpoint

Before proceeding to Phase 2:
- [ ] All error types compile and export correctly
- [ ] GoogleAuthClient interface is well-typed
- [ ] GoogleApiClient exports correctly
- [ ] Layer composition compiles (even with forward IntegrationTokenStore reference)
- [ ] No circular dependencies
- [ ] tsconfig paths resolve correctly

### Gates

Run from project root:
```bash
bun run check --filter @beep/integrations-google-workspace
```

---

## Phase 2: Token Store Implementation

**Agent**: effect-code-writer
**Objective**: Create `IntegrationTokenStore` service in `@beep/iam-server` for managing OAuth tokens with encryption.

### Context Files to Review

- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/iam/server/src/` - Existing IAM services structure
- `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/rules/effect-patterns.md` - Effect patterns
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/domain/src/` - EntityId patterns

### Tasks

#### 2.1 Create Token Table

**`packages/iam/tables/src/tables/integration-token.table.ts`**
```typescript
import { Table } from "@beep/shared-tables"
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain"
import * as pg from "drizzle-orm/pg-core"
import * as S from "effect/Schema"

export const integrationTokenTable = Table.make(
  IamEntityIds.IntegrationTokenId // Add this to IamEntityIds
)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),

  provider: pg.text("provider").notNull(), // "google", "microsoft", etc.

  providerUserId: pg.text("provider_user_id").notNull(),

  accessToken: pg.text("access_token").notNull(), // Encrypted

  refreshToken: pg.text("refresh_token"), // Encrypted, optional

  expiresAt: pg.timestamp("expires_at", { mode: "date" }).notNull(),

  scopes: pg.text("scopes").array().notNull(),

  encryptionKeyId: pg.text("encryption_key_id").notNull(), // For key rotation
})

export const IntegrationTokenTable = {
  table: integrationTokenTable,
  name: integrationTokenTable._.name,
}
```

#### 2.2 Add EntityId to IAM Domain

**`packages/iam/domain/src/entity-ids/index.ts`** (add to existing exports)
```typescript
export const IntegrationTokenId = EntityId.make("iam_integration_token")
export type IntegrationTokenId = EntityId.BrandFrom<typeof IntegrationTokenId>
```

#### 2.3 Create Token Encryption Service

**`packages/iam/server/src/services/TokenEncryption.ts`**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as S from "effect/Schema"

export class EncryptionError extends S.TaggedError<EncryptionError>()("EncryptionError", {
  message: S.String,
  keyId: S.String,
}) {}

export class TokenEncryption extends Context.Tag("TokenEncryption")<
  TokenEncryption,
  {
    readonly encrypt: (
      plaintext: string,
      keyId: string
    ) => Effect.Effect<string, EncryptionError>

    readonly decrypt: (
      ciphertext: string,
      keyId: string
    ) => Effect.Effect<string, EncryptionError>
  }
>() {}

export const TokenEncryptionLive = Layer.effect(
  TokenEncryption,
  Effect.gen(function* () {
    // Placeholder implementation - should use AWS KMS or similar
    return {
      encrypt: (plaintext, keyId) =>
        Effect.succeed(Buffer.from(plaintext).toString("base64")),

      decrypt: (ciphertext, keyId) =>
        Effect.succeed(Buffer.from(ciphertext, "base64").toString()),
    }
  })
)
```

#### 2.4 Create IntegrationTokenStore Service

**`packages/iam/server/src/services/IntegrationTokenStore.ts`**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as O from "effect/Option"
import * as DateTime from "effect/DateTime"
import { SharedEntityIds } from "@beep/shared-domain"
import { AccessToken, RefreshToken, TokenError } from "@beep/google-workspace-domain"
import { TokenEncryption } from "./TokenEncryption.ts"
import { Db } from "@beep/shared-server"
import { integrationTokenTable } from "@beep/iam-tables"

export class IntegrationTokenStore extends Context.Tag("IntegrationTokenStore")<
  IntegrationTokenStore,
  {
    readonly storeTokens: (params: {
      userId: SharedEntityIds.UserId.Type
      provider: string
      providerUserId: string
      accessToken: AccessToken
      refreshToken: O.Option<RefreshToken>
    }) => Effect.Effect<void, TokenError>

    readonly getValidToken: (params: {
      userId: SharedEntityIds.UserId.Type
      provider: string
      scopes: ReadonlyArray<string>
    }) => Effect.Effect<AccessToken, TokenError>

    readonly deleteTokens: (params: {
      userId: SharedEntityIds.UserId.Type
      provider: string
    }) => Effect.Effect<void, never>
  }
>() {}

export const IntegrationTokenStoreLive = Layer.effect(
  IntegrationTokenStore,
  Effect.gen(function* () {
    const db = yield* Db
    const encryption = yield* TokenEncryption

    return {
      storeTokens: (params) =>
        Effect.gen(function* () {
          const encryptedAccess = yield* encryption.encrypt(
            params.accessToken.token,
            "default-key-id"
          )

          const encryptedRefresh = yield* O.match(params.refreshToken, {
            onNone: () => Effect.succeed(O.none()),
            onSome: (rt) =>
              encryption.encrypt(rt.token, "default-key-id").pipe(
                Effect.map(O.some)
              ),
          })

          // Insert or update token in database
          // Implementation depends on Drizzle insert/upsert pattern
        }),

      getValidToken: (params) =>
        Effect.gen(function* () {
          // Query database for token
          // Check expiration
          // Decrypt if valid
          // Return or fail with TokenError
          return yield* Effect.fail(
            new TokenError({ message: "Not implemented", reason: "missing" })
          )
        }),

      deleteTokens: (params) =>
        Effect.gen(function* () {
          // Delete from database
        }),
    }
  })
).pipe(Layer.provide(Layer.mergeAll(Db.Live, TokenEncryptionLive)))
```

#### 2.5 Update GoogleAuthClient to Use Token Store

Modify `packages/google-workspace/server/src/services/GoogleAuthClient.ts` to inject `IntegrationTokenStore` and implement real token management.

### Success Criteria

- [ ] `integration-token` table created in IAM
- [ ] `IntegrationTokenId` added to IAM EntityIds
- [ ] `TokenEncryption` service created (placeholder encryption is acceptable)
- [ ] `IntegrationTokenStore` service created with CRUD operations
- [ ] `GoogleAuthClient` updated to use `IntegrationTokenStore`
- [ ] All sensitive token fields encrypted before storage

### Gates

```bash
bun run check --filter @beep/iam-tables
bun run check --filter @beep/iam-domain
bun run check --filter @beep/iam-server
bun run db:generate  # Generate migration for new table
```

---

## Phase 3: Slice Adapters (Parallel Execution)

**Agents**: 3x effect-code-writer (can run in parallel)
**Objective**: Create slice-specific adapters that wrap Google Workspace services.

### Phase 3A: GoogleCalendarAdapter

**Agent**: effect-code-writer
**Location**: `packages/calendar/server/src/integrations/GoogleCalendarAdapter.ts`

#### Context Files

- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/integrations/src/google/calendar/` - Existing calendar integration
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/calendar/domain/` - Calendar domain models

#### Tasks

Create adapter service that:
1. Injects `GoogleApiClient` from Phase 1
2. Defines calendar-specific scopes
3. Translates calendar domain models to Google Calendar API format
4. Translates Google Calendar API responses to calendar domain models

**File to create:**

**`packages/calendar/server/src/integrations/GoogleCalendarAdapter.ts`**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as A from "effect/Array"
import * as DateTime from "effect/DateTime"
import { GoogleApiClient, GoogleApiError } from "@beep/google-workspace-server"
import type { CalendarEvent } from "@beep/calendar-domain" // Adjust import

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
] as const

export class GoogleCalendarAdapter extends Context.Tag("GoogleCalendarAdapter")<
  GoogleCalendarAdapter,
  {
    readonly createEvent: (
      event: CalendarEvent
    ) => Effect.Effect<CalendarEvent, GoogleApiError>

    readonly getEvent: (
      eventId: string
    ) => Effect.Effect<CalendarEvent, GoogleApiError>

    readonly listEvents: (params: {
      timeMin: DateTime.DateTime
      timeMax: DateTime.DateTime
    }) => Effect.Effect<ReadonlyArray<CalendarEvent>, GoogleApiError>

    readonly updateEvent: (
      event: CalendarEvent
    ) => Effect.Effect<CalendarEvent, GoogleApiError>

    readonly deleteEvent: (
      eventId: string
    ) => Effect.Effect<void, GoogleApiError>
  }
>() {}

export const GoogleCalendarAdapterLive = Layer.effect(
  GoogleCalendarAdapter,
  Effect.gen(function* () {
    const apiClient = yield* GoogleApiClient

    return {
      createEvent: (event) =>
        apiClient.callApi({
          endpoint: "calendar.events.insert",
          scopes: CALENDAR_SCOPES,
          operation: async (token) => {
            // Use googleapis library
            // Translate event to Google format
            // Make API call
            // Translate response back to domain
            return event // Placeholder
          },
        }),

      getEvent: (eventId) =>
        apiClient.callApi({
          endpoint: "calendar.events.get",
          scopes: CALENDAR_SCOPES,
          operation: async (token) => {
            // Implementation
            return {} as CalendarEvent // Placeholder
          },
        }),

      listEvents: (params) =>
        apiClient.callApi({
          endpoint: "calendar.events.list",
          scopes: CALENDAR_SCOPES,
          operation: async (token) => {
            // Implementation
            return [] // Placeholder
          },
        }),

      updateEvent: (event) =>
        apiClient.callApi({
          endpoint: "calendar.events.update",
          scopes: CALENDAR_SCOPES,
          operation: async (token) => {
            // Implementation
            return event // Placeholder
          },
        }),

      deleteEvent: (eventId) =>
        apiClient.callApi({
          endpoint: "calendar.events.delete",
          scopes: CALENDAR_SCOPES,
          operation: async (token) => {
            // Implementation
          },
        }),
    }
  })
).pipe(Layer.provide(GoogleApiClient.Live))
```

**Translation Helpers:**

**`packages/calendar/server/src/integrations/translate-to-google.ts`**
```typescript
import * as A from "effect/Array"
import * as DateTime from "effect/DateTime"
import type { CalendarEvent } from "@beep/calendar-domain"
import type { calendar_v3 } from "@googleapis/calendar"

export const translateToGoogleFormat = (
  event: CalendarEvent
): calendar_v3.Schema$Event => ({
  summary: event.title,
  description: event.description,
  start: {
    dateTime: DateTime.formatIso(event.startTime),
    timeZone: "UTC",
  },
  end: {
    dateTime: DateTime.formatIso(event.endTime),
    timeZone: "UTC",
  },
  attendees: A.map(event.attendees, (attendee) => ({
    email: attendee.email,
    displayName: attendee.name,
  })),
  location: event.location,
})

export const translateFromGoogleFormat = (
  googleEvent: calendar_v3.Schema$Event
): CalendarEvent => {
  // Reverse translation
  // Use Schema.decodeUnknown to validate
  return {} as CalendarEvent // Placeholder
}
```

#### Success Criteria

- [ ] `GoogleCalendarAdapter` service created
- [ ] All CRUD operations defined
- [ ] Translation functions created (domain ↔ Google format)
- [ ] Scopes defined as const array
- [ ] Service provides `GoogleApiClient` layer

#### Gates

```bash
bun run check --filter @beep/calendar-server
```

---

### Phase 3B: GmailAdapter

**Agent**: effect-code-writer
**Location**: `packages/comms/server/src/integrations/GmailAdapter.ts`

#### Context Files

- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/integrations/src/google/gmail/` - Existing Gmail integration
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/comms/domain/` - Comms domain models

#### Tasks

Create adapter service with Gmail operations:

**File to create:**

**`packages/comms/server/src/integrations/GmailAdapter.ts`**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { GoogleApiClient, GoogleApiError } from "@beep/google-workspace-server"

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
] as const

export class GmailAdapter extends Context.Tag("GmailAdapter")<
  GmailAdapter,
  {
    readonly sendEmail: (params: {
      to: string
      subject: string
      body: string
      attachments?: ReadonlyArray<{ filename: string; content: Buffer }>
    }) => Effect.Effect<{ messageId: string }, GoogleApiError>

    readonly listMessages: (params: {
      query?: string
      maxResults?: number
    }) => Effect.Effect<ReadonlyArray<{ id: string; threadId: string }>, GoogleApiError>

    readonly getMessage: (
      messageId: string
    ) => Effect.Effect<unknown, GoogleApiError> // Define proper schema

    readonly deleteMessage: (
      messageId: string
    ) => Effect.Effect<void, GoogleApiError>

    readonly updateLabels: (params: {
      messageId: string
      addLabels?: ReadonlyArray<string>
      removeLabels?: ReadonlyArray<string>
    }) => Effect.Effect<void, GoogleApiError>
  }
>() {}

export const GmailAdapterLive = Layer.effect(
  GmailAdapter,
  Effect.gen(function* () {
    const apiClient = yield* GoogleApiClient

    return {
      sendEmail: (params) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.send",
          scopes: GMAIL_SCOPES,
          operation: async (token) => {
            // Build raw email (multipart/mime)
            // Use gmail.users.messages.send
            return { messageId: "placeholder" }
          },
        }),

      listMessages: (params) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.list",
          scopes: GMAIL_SCOPES,
          operation: async (token) => {
            // Implementation
            return []
          },
        }),

      getMessage: (messageId) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.get",
          scopes: GMAIL_SCOPES,
          operation: async (token) => {
            // Implementation
            return {}
          },
        }),

      deleteMessage: (messageId) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.delete",
          scopes: GMAIL_SCOPES,
          operation: async (token) => {
            // Implementation
          },
        }),

      updateLabels: (params) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.modify",
          scopes: GMAIL_SCOPES,
          operation: async (token) => {
            // Implementation
          },
        }),
    }
  })
).pipe(Layer.provide(GoogleApiClient.Live))
```

**Reuse existing helpers:**

Copy translation logic from `packages/shared/integrations/src/google/gmail/common/build-raw-email.ts` to new location.

#### Success Criteria

- [ ] `GmailAdapter` service created
- [ ] All operations defined with proper scopes
- [ ] Raw email building logic migrated
- [ ] Service provides `GoogleApiClient` layer

#### Gates

```bash
bun run check --filter @beep/comms-server
```

---

### Phase 3C: GmailExtractionAdapter

**Agent**: effect-code-writer
**Location**: `packages/knowledge/server/src/integrations/GmailExtractionAdapter.ts`

#### Context Files

- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/shared/integrations/src/utils/email-processor.ts` - Email parsing logic
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/domain/` - Knowledge domain models

#### Tasks

Create adapter for knowledge extraction from emails:

**File to create:**

**`packages/knowledge/server/src/integrations/GmailExtractionAdapter.ts`**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as A from "effect/Array"
import { GoogleApiClient, GoogleApiError } from "@beep/google-workspace-server"

const GMAIL_READONLY_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
] as const

export class GmailExtractionAdapter extends Context.Tag("GmailExtractionAdapter")<
  GmailExtractionAdapter,
  {
    readonly extractEmails: (params: {
      query: string
      maxResults?: number
    }) => Effect.Effect<ReadonlyArray<ExtractedEmail>, GoogleApiError>

    readonly getEmailContent: (
      messageId: string
    ) => Effect.Effect<ExtractedEmail, GoogleApiError>
  }
>() {}

interface ExtractedEmail {
  id: string
  threadId: string
  subject: string
  from: string
  to: ReadonlyArray<string>
  body: string
  plainText: string
  timestamp: Date
  labels: ReadonlyArray<string>
  attachments: ReadonlyArray<{ filename: string; mimeType: string; size: number }>
}

export const GmailExtractionAdapterLive = Layer.effect(
  GmailExtractionAdapter,
  Effect.gen(function* () {
    const apiClient = yield* GoogleApiClient

    return {
      extractEmails: (params) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.list",
          scopes: GMAIL_READONLY_SCOPES,
          operation: async (token) => {
            // List messages matching query
            // Fetch full message content for each
            // Parse and extract structured data
            return []
          },
        }),

      getEmailContent: (messageId) =>
        apiClient.callApi({
          endpoint: "gmail.users.messages.get",
          scopes: GMAIL_READONLY_SCOPES,
          operation: async (token) => {
            // Get full message with format=full
            // Parse MIME structure
            // Extract plain text, HTML, attachments
            return {} as ExtractedEmail
          },
        }),
    }
  })
).pipe(Layer.provide(GoogleApiClient.Live))
```

**Migrate parsing logic:**

Copy email parsing utilities from `packages/shared/integrations/src/utils/email-processor.ts` to `packages/knowledge/server/src/utils/`.

#### Success Criteria

- [ ] `GmailExtractionAdapter` service created
- [ ] Read-only scopes defined
- [ ] Email parsing logic migrated
- [ ] Structured extraction schema defined
- [ ] Service provides `GoogleApiClient` layer

#### Gates

```bash
bun run check --filter @beep/knowledge-server
```

---

## Phase 4: Code Migration

**Agent**: effect-code-writer
**Objective**: Move existing code from `packages/shared/integrations` to new architecture, updating imports.

### Tasks

#### 4.1 Identify Migration Targets

List all files in `packages/shared/integrations/src/google/` that need migration:

```bash
find packages/shared/integrations/src/google -type f -name "*.ts" > migration-checklist.txt
```

#### 4.2 Update Imports

For each file in the new architecture:

**Old pattern:**
```typescript
import { GmailClient } from "@beep/shared-integrations/google/gmail/GmailClient"
```

**New pattern:**
```typescript
import { GoogleApiClient } from "@beep/google-workspace-server"
import { GmailAdapter } from "@beep/comms-server/integrations/GmailAdapter"
```

#### 4.3 Update Service Composition

**Old pattern (shared layer):**
```typescript
export const GmailServiceLive = Layer.mergeAll(
  GmailClientLive,
  // ...
)
```

**New pattern (slice layer):**
```typescript
export const CommsServiceLive = Layer.mergeAll(
  GmailAdapterLive,
  GoogleApiClientLive,
  IntegrationTokenStoreLive,
  // ...
)
```

#### 4.4 Update RPC Handlers

For each handler in `packages/shared/integrations/src/google/gmail/actions/`:

1. Determine which slice it belongs to (comms, knowledge)
2. Move handler to appropriate slice client package
3. Update service dependencies
4. Update contract imports

**Example:**

**Old location:** `packages/shared/integrations/src/google/gmail/actions/send-email/handler.ts`

**New location:** `packages/comms/client/src/handlers/sendEmail.ts`

**Old code:**
```typescript
import { GmailClient } from "../../common/GmailClient.ts"
```

**New code:**
```typescript
import { GmailAdapter } from "@beep/comms-server/integrations/GmailAdapter"
```

### Success Criteria

- [ ] All Gmail code migrated to `@beep/comms-server`
- [ ] All Gmail extraction code migrated to `@beep/knowledge-server`
- [ ] All Google Calendar code migrated to `@beep/calendar-server`
- [ ] All imports updated to new architecture
- [ ] No references to old `@beep/shared-integrations` remain

### Gates

```bash
bun run check  # Full repo check
bun run test --filter @beep/comms-server
bun run test --filter @beep/knowledge-server
bun run test --filter @beep/calendar-server
```

---

## Phase 5: Cleanup

**Agent**: general-purpose
**Objective**: Delete old code, remove package, update references.

### Tasks

#### 5.1 Delete Old Package

```bash
# Verify no imports reference old package
grep -r "@beep/shared-integrations" packages/ apps/

# If clear, delete
rm -rf packages/shared/integrations
```

#### 5.2 Update Package Dependencies

Remove `@beep/shared-integrations` from all `package.json` files:

```bash
# Find all references
grep -r "\"@beep/shared-integrations\"" packages/ apps/

# Remove from each package.json
```

#### 5.3 Update Documentation

Update these files to reflect new architecture:

- `/home/elpresidank/YeeBois/projects/beep-effect2/documentation/PACKAGE_STRUCTURE.md` - Remove shared/integrations, add google-workspace packages
- `/home/elpresidank/YeeBois/projects/beep-effect2/README.md` - Update architecture overview
- Package AGENTS.md files - Update integration references

### Success Criteria

- [ ] `packages/shared/integrations` deleted
- [ ] No references to old package remain
- [ ] Documentation updated
- [ ] All package.json dependencies cleaned

### Gates

```bash
bun install  # Should succeed without errors
bun run check  # Full repo check
```

---

## Phase 6: Verification

**Agents**: package-error-fixer, test-writer
**Objective**: Ensure migration is complete and system works correctly.

### Tasks

#### 6.1 Type Checking

Run type checks on all affected packages:

```bash
bun run check --filter @beep/google-workspace-domain
bun run check --filter @beep/google-workspace-server
bun run check --filter @beep/google-workspace-client
bun run check --filter @beep/iam-server
bun run check --filter @beep/iam-tables
bun run check --filter @beep/calendar-server
bun run check --filter @beep/comms-server
bun run check --filter @beep/knowledge-server
```

If any errors, use `package-error-fixer` agent to resolve.

#### 6.2 Test Coverage

Create tests for new services using `@beep/testkit`:

**Example test for GoogleAuthClient:**

**`packages/google-workspace/server/test/services/GoogleAuthClient.test.ts`**
```typescript
import { effect, strictEqual, assertTrue } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { GoogleAuthClient, GoogleAuthClientLive } from "@beep/google-workspace-server"
import { TokenError } from "@beep/google-workspace-domain"

effect("fails with TokenError when no token stored", () =>
  Effect.gen(function* () {
    const authClient = yield* GoogleAuthClient

    const result = yield* Effect.either(
      authClient.getValidToken(["https://www.googleapis.com/auth/calendar"])
    )

    strictEqual(result._tag, "Left")
    if (result._tag === "Left") {
      strictEqual(result.left._tag, "TokenError")
      strictEqual(result.left.reason, "missing")
    }
  }).pipe(Effect.provide(GoogleAuthClientLive))
)
```

Create similar tests for:
- `IntegrationTokenStore`
- `GmailAdapter`
- `GoogleCalendarAdapter`
- `GmailExtractionAdapter`

Use `test-writer` agent if needed.

#### 6.3 Integration Test

Create end-to-end test that exercises the full flow:

**`packages/comms/server/test/integration/gmail-flow.test.ts`**
```typescript
import { layer, strictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"
import { GmailAdapter, GmailAdapterLive } from "@beep/comms-server"
import { GoogleApiClientLive } from "@beep/google-workspace-server"
import { IntegrationTokenStoreLive } from "@beep/iam-server"

const TestLayer = Layer.mergeAll(
  GmailAdapterLive,
  GoogleApiClientLive,
  IntegrationTokenStoreLive,
  // Add mock implementations
)

layer(TestLayer, { timeout: Duration.seconds(30) })(
  "Gmail integration flow",
  (it) => {
    it.effect("sends email through adapter", () =>
      Effect.gen(function* () {
        const adapter = yield* GmailAdapter

        // Mock token should be in store
        const result = yield* adapter.sendEmail({
          to: "test@example.com",
          subject: "Test",
          body: "Test body",
        })

        assertTrue(result.messageId.length > 0)
      })
    )
  }
)
```

### Success Criteria

- [ ] All type checks pass
- [ ] Unit tests created for all new services (minimum 1 test per service)
- [ ] Integration test demonstrates full flow
- [ ] Test coverage > 80% for new code

### Gates

```bash
bun run check  # All type checks pass
bun run test   # All tests pass
bun run lint   # No lint errors
```

---

## Quick Reference

### Package Structure After Migration

```
packages/
├── google-workspace/
│   ├── domain/        # Schemas, errors
│   ├── server/        # GoogleAuthClient, GoogleApiClient
│   └── client/        # RPC contracts
├── iam/
│   ├── server/        # IntegrationTokenStore, TokenEncryption
│   └── tables/        # integration-token table
├── calendar/
│   └── server/        # GoogleCalendarAdapter
├── comms/
│   └── server/        # GmailAdapter
└── knowledge/
    └── server/        # GmailExtractionAdapter
```

### Effect Patterns Quick Ref

```typescript
// Context.Tag service
export class MyService extends Context.Tag("MyService")<
  MyService,
  { readonly method: () => Effect.Effect<A, E> }
>() {}

// Layer implementation
export const MyServiceLive = Layer.effect(
  MyService,
  Effect.gen(function* () {
    const dep = yield* Dependency
    return { method: () => Effect.succeed(value) }
  })
)

// Tagged error
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
}) {}

// Sensitive field
BS.FieldSensitiveOptionOmittable(S.String)
```

### Common Commands

```bash
# Type check specific package
bun run check --filter @beep/package-name

# Generate DB migration
bun run db:generate

# Run tests for package
bun run test --filter @beep/package-name

# Full repo verification
bun run check && bun run test && bun run lint
```
