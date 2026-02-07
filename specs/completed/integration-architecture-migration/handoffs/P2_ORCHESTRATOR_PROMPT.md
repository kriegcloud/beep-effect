# Phase 2 Orchestrator: IAM Token Storage Implementation

> **Copy-paste this into a fresh Claude session to execute Phase 2**

---

## Context

You are implementing Phase 2 of the Google Workspace integration migration spec.

**Previous Phases Completed**:

### Phase 1a (Domain Package)
- Created `@beep/google-workspace-domain` package
- Error types: `GoogleAuthenticationError`, `GoogleTokenExpiredError`, `GoogleTokenRefreshError`, `GoogleScopeExpansionRequiredError`, `GoogleApiError`, `GoogleRateLimitError`
- Scope constants: `GmailScopes`, `CalendarScopes`, `DriveScopes`
- Token model: `GoogleOAuthToken`

### Phase 1b (Client/Server Packages)
- Created `@beep/google-workspace-client` with Context.Tag interfaces:
  - `GoogleAuthClient`, `GmailClient`, `GoogleCalendarClient`, `GoogleDriveClient`
  - OAuth contracts: `OAuthTokenResponse`, `OAuthRefreshResponse`, `OAuthErrorResponse`
- Created `@beep/google-workspace-server` with placeholder Layers
- All packages compile and pass lint

**Key Learnings from P1a/P1b**:
- Layer.succeed for placeholder implementations
- S.optional for OAuth schema fields
- Context.Tag interface in client, Layer in server
- Use $I identity composers from @beep/identity

---

## Your Mission

Implement the IntegrationTokenStore service for secure OAuth token storage:

1. **Token Store Interface** (`@beep/iam-client`):
   - Context.Tag service interface
   - Provider-agnostic design (Google, Microsoft, etc.)

2. **Token Table** (`@beep/iam-tables`):
   - Database table for encrypted token storage
   - Composite unique key on (userId, provider)

3. **Token Store Implementation** (`@beep/iam-server`):
   - Encryption at rest for access/refresh tokens
   - Distributed lock for refresh operations
   - Database operations

4. **Google Workspace Integration**:
   - Update GoogleAuthClientLive to use real IntegrationTokenStore
   - Replace placeholder implementations

---

## Critical Patterns

### IntegrationTokenStore Interface

```typescript
// packages/iam/client/src/services/IntegrationTokenStore.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";

export interface StoredToken {
  readonly accessToken: string;
  readonly refreshToken: O.Option<string>;
  readonly expiresAt: number;
  readonly scopes: ReadonlyArray<string>;
  readonly provider: string;
}

export interface IntegrationTokenStoreService {
  readonly get: (
    userId: string,
    provider: string
  ) => Effect.Effect<O.Option<StoredToken>>;

  readonly store: (
    userId: string,
    provider: string,
    token: StoredToken
  ) => Effect.Effect<void>;

  readonly refresh: (
    userId: string,
    provider: string,
    refreshFn: (refreshToken: string) => Effect.Effect<StoredToken, Error>
  ) => Effect.Effect<StoredToken, TokenRefreshError>;

  readonly revoke: (
    userId: string,
    provider: string
  ) => Effect.Effect<void>;
}

export class IntegrationTokenStore extends Context.Tag("IntegrationTokenStore")<
  IntegrationTokenStore,
  IntegrationTokenStoreService
>() {}
```

### Token Table Schema

```typescript
// packages/iam/tables/src/integration-tokens.table.ts
import { pg, Table } from "@beep/shared-tables";
import { SharedEntityIds } from "@beep/shared-domain";

export const integrationTokensTable = Table.make(SharedEntityIds.TokenId)({
  userId: pg.text("user_id").notNull().$type<SharedEntityIds.UserId.Type>(),
  provider: pg.text("provider").notNull(),
  accessToken: pg.text("access_token").notNull(),
  refreshToken: pg.text("refresh_token"),
  expiresAt: pg.timestamp("expires_at", { withTimezone: true }).notNull(),
  scopes: pg.text("scopes").array().notNull(),
  createdAt: pg.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: pg.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Updated GoogleAuthClientLive

```typescript
// packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { IntegrationTokenStore } from "@beep/iam-client";
import { GoogleAuthenticationError, GoogleTokenRefreshError, GoogleOAuthToken } from "@beep/google-workspace-domain";

export const GoogleAuthClientLive = Layer.effect(
  GoogleAuthClient,
  Effect.gen(function* () {
    const tokenStore = yield* IntegrationTokenStore;

    return GoogleAuthClient.of({
      getValidToken: (scopes) =>
        Effect.gen(function* () {
          // Get stored token
          const storedToken = yield* tokenStore.get("current-user-id", "google");

          if (O.isNone(storedToken)) {
            return yield* Effect.fail(new GoogleAuthenticationError({
              message: "No Google OAuth token found",
              suggestion: "User needs to authorize Google Workspace access",
            }));
          }

          const token = storedToken.value;

          // Check if token is expired
          if (token.expiresAt < Date.now()) {
            // Attempt refresh
            const refreshedToken = yield* tokenStore.refresh(
              "current-user-id",
              "google",
              (refreshToken) => refreshGoogleToken(refreshToken)
            );

            return new GoogleOAuthToken({
              access_token: refreshedToken.accessToken,
              refresh_token: O.getOrNull(refreshedToken.refreshToken),
              expiry_date: new Date(refreshedToken.expiresAt),
              scope: refreshedToken.scopes.join(" "),
              token_type: "Bearer",
            });
          }

          return new GoogleOAuthToken({
            access_token: token.accessToken,
            refresh_token: O.getOrNull(token.refreshToken),
            expiry_date: new Date(token.expiresAt),
            scope: token.scopes.join(" "),
            token_type: "Bearer",
          });
        }),

      refreshToken: (refreshToken) =>
        Effect.gen(function* () {
          const refreshedToken = yield* refreshGoogleToken(refreshToken);
          yield* tokenStore.store("current-user-id", "google", {
            accessToken: refreshedToken.accessToken,
            refreshToken: O.fromNullable(refreshedToken.refreshToken),
            expiresAt: refreshedToken.expiresAt,
            scopes: refreshedToken.scopes,
            provider: "google",
          });

          return new GoogleOAuthToken({
            access_token: refreshedToken.accessToken,
            refresh_token: O.getOrNull(refreshedToken.refreshToken),
            expiry_date: new Date(refreshedToken.expiresAt),
            scope: refreshedToken.scopes.join(" "),
            token_type: "Bearer",
          });
        }),
    });
  })
);
```

---

## Step-by-Step Execution Plan

### Step 1: Explore Existing IAM Patterns

Before implementing, explore existing patterns:
- `packages/iam/client/src/services/` - Existing service interfaces
- `packages/iam/server/src/services/` - Existing service implementations
- `packages/iam/tables/src/` - Table definition patterns
- Check for existing encryption utilities

### Step 2: Create IntegrationTokenStore Interface

Create `packages/iam/client/src/services/IntegrationTokenStore.ts` with:
- StoredToken interface
- IntegrationTokenStoreService interface
- IntegrationTokenStore Context.Tag
- Export from package barrel

### Step 3: Create Token Table

Create `packages/iam/tables/src/integration-tokens.table.ts` with:
- Table definition using Table.make pattern
- Composite unique index on (userId, provider)
- Export from package barrel

### Step 4: Implement IntegrationTokenStoreLive

Create `packages/iam/server/src/services/IntegrationTokenStoreLive.ts` with:
- Layer.effect implementation
- Dependencies: SqlClient, encryption service
- Methods: get, store, refresh (with lock), revoke
- Export from package barrel

### Step 5: Update GoogleAuthClientLive

Update `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`:
- Change from Layer.succeed to Layer.effect
- Add IntegrationTokenStore dependency
- Implement real token retrieval and refresh
- Update Layer exports if needed

### Step 6: Add Google Token Refresh Logic

Create helper function for Google OAuth token refresh:
- Use Effect.tryPromise for HTTP call to Google OAuth endpoint
- Parse response with OAuthRefreshResponse schema
- Handle errors appropriately

### Step 7: Run Migrations

```bash
bun run db:generate
bun run db:migrate
```

### Step 8: Verification

```bash
bun run check --filter @beep/iam-*
bun run check --filter @beep/google-workspace-*
bun run lint --filter @beep/iam-*
bun run lint --filter @beep/google-workspace-*
bun run test --filter @beep/iam-*
```

---

## Reference Files

**IAM Package Patterns**:
- `packages/iam/client/src/services/` - Service interface patterns
- `packages/iam/server/src/layers/` - Layer implementation patterns
- `packages/iam/tables/src/` - Table definition patterns

**Google Workspace Packages**:
- `packages/integrations/google-workspace/domain/src/` - Error types, token model
- `packages/integrations/google-workspace/client/src/` - Service interfaces, contracts
- `packages/integrations/google-workspace/server/src/` - Current placeholder layers

**Effect Patterns**:
- `.claude/rules/effect-patterns.md` - Effect import conventions
- `documentation/patterns/database-patterns.md` - Database patterns

---

## Success Criteria

Phase 2 is complete when:

- [ ] IntegrationTokenStore interface created in `@beep/iam-client`
- [ ] integration_tokens table created in `@beep/iam-tables`
- [ ] IntegrationTokenStoreLive layer created in `@beep/iam-server`
- [ ] Token encryption implemented (access_token, refresh_token)
- [ ] Token refresh with distributed lock implemented
- [ ] GoogleAuthClientLive updated to use real IntegrationTokenStore
- [ ] `bun run check --filter @beep/iam-*` passes
- [ ] `bun run check --filter @beep/google-workspace-*` passes
- [ ] `bun run lint` passes for all affected packages
- [ ] Database migration runs successfully
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P3.md created for Gmail/Calendar adapters

---

## Known Challenges

1. **Encryption Key Management**: Determine where encryption keys are stored (env vars, KMS, etc.)
2. **Distributed Lock**: Choose between Effect Semaphore, Redis lock, or database-level lock
3. **User ID Resolution**: GoogleAuthClientLive needs access to current user ID (may need additional service)
4. **Token Expiry Buffer**: Consider refreshing tokens slightly before expiry to prevent race conditions

---

## Handoff Document

Read full context in: `specs/integration-architecture-migration/handoffs/HANDOFF_P2.md`

---

## Next Phase

After completing Phase 2:

1. Update `specs/integration-architecture-migration/REFLECTION_LOG.md`
2. Create `specs/integration-architecture-migration/handoffs/HANDOFF_P3.md`
3. Create `specs/integration-architecture-migration/handoffs/P3_ORCHESTRATOR_PROMPT.md`
4. Update `specs/integration-architecture-migration/MASTER_ORCHESTRATION.md` to mark Phase 2 complete
