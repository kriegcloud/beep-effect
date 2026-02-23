# Handoff P2: IAM Token Storage Implementation

> ⚠️ **SUPERSEDED**: This handoff document describes the original `IntegrationTokenStore` approach which has been replaced. See the **Phase 2 Revision** section in [REFLECTION_LOG.md](../REFLECTION_LOG.md) for the current implementation using `AuthContext.oauth`.

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Architectural Pivot Summary

The original Phase 2 planned to create `IntegrationTokenStore` in `@beep/iam-server`. This was replaced with extending `AuthContext` with OAuth API methods because:

1. **Better Auth Already Handles Token Storage**: OAuth tokens are stored in the `account` table with built-in encryption and automatic refresh
2. **Avoids Cross-Slice Dependencies**: Integration packages shouldn't import from `@beep/iam-server`
3. **Simpler Architecture**: No need for duplicate storage logic

### Current Implementation

- **OAuth API Types**: `@beep/shared-domain/Policy` exports `OAuthApi`, `OAuthTokenError`, `OAuthAccountsError`
- **OAuth API Implementation**: `packages/runtime/server/src/AuthContext.layer.ts`
- **GoogleAuthClientLive**: Uses `AuthContext.oauth` instead of `IntegrationTokenStore`

---

## Original Document (For Reference)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,800 | OK |
| Episodic Memory | 1,000 tokens | ~900 | OK |
| Semantic Memory | 500 tokens | ~450 | OK |
| Procedural Memory | 500 tokens | Links only | OK |
| **Total** | **4,000 tokens** | **~3,150** | **OK** |

---

## Working Memory (Current Phase)

### Phase 2 Goal

Implement the IntegrationTokenStore service in `@beep/iam-server` for secure storage, refresh, and lifecycle management of OAuth tokens for third-party integrations.

### Deliverables

1. **IntegrationTokenStore Service** (`@beep/iam-server`):
   - Token storage with encryption at rest
   - Token refresh with lock mechanism (prevent concurrent refreshes)
   - Token revocation with cleanup
   - Scope tracking for incremental OAuth

2. **Database Schema** (`@beep/iam-tables`):
   - `integration_tokens` table
   - Fields: userId, provider, accessToken (encrypted), refreshToken (encrypted), expiresAt, scopes, createdAt, updatedAt

3. **Integration with Google Workspace**:
   - Update `@beep/google-workspace-server` layers to use real IntegrationTokenStore
   - Replace placeholder implementations with actual token retrieval

### Success Criteria

- [ ] IntegrationTokenStore service implemented in `@beep/iam-server`
- [ ] Token table created in `@beep/iam-tables`
- [ ] Encryption at rest for tokens (use existing encryption utilities)
- [ ] Token refresh with distributed lock (prevent race conditions)
- [ ] GoogleAuthClientLive uses IntegrationTokenStore
- [ ] All packages compile: `bun run check --filter @beep/iam-*`
- [ ] All packages compile: `bun run check --filter @beep/google-workspace-*`

### Blocking Issues

None. Phase 1b provides the client/server package structure.

### Key Constraints

1. **Token Encryption**: Access tokens and refresh tokens MUST be encrypted at rest using AES-256 or equivalent
2. **Concurrent Refresh**: Use distributed lock when refreshing tokens to prevent race conditions
3. **Scope Tracking**: Store granted scopes to support incremental OAuth flow
4. **Provider Abstraction**: IntegrationTokenStore should be provider-agnostic (support Google, Microsoft, etc.)

---

## Episodic Memory (Previous Context)

### Phase 1a Summary (Domain Package)

**Completed:**
- Created `@beep/google-workspace-domain` package
- Tagged error classes: `GoogleAuthenticationError`, `GoogleTokenExpiredError`, `GoogleTokenRefreshError`, `GoogleScopeExpansionRequiredError`, `GoogleApiError`, `GoogleRateLimitError`
- Scope constants: `GmailScopes`, `CalendarScopes`, `DriveScopes`
- Token model: `GoogleOAuthToken`

### Phase 1b Summary (Client/Server Packages)

**Completed:**
- Created `@beep/google-workspace-client` package with Context.Tag interfaces:
  - `GoogleAuthClient` - OAuth token management interface
  - `GmailClient` - Gmail API placeholder
  - `GoogleCalendarClient` - Calendar API placeholder
  - `GoogleDriveClient` - Drive API placeholder
  - OAuth contracts: `OAuthTokenResponse`, `OAuthRefreshResponse`, `OAuthErrorResponse`

- Created `@beep/google-workspace-server` package with placeholder Layers:
  - `GoogleAuthClientLive` - Fails with descriptive "Not implemented" errors
  - `GmailClientLive`, `GoogleCalendarClientLive`, `GoogleDriveClientLive` - Placeholders

- Updated `tsconfig.base.jsonc` with path aliases for all three packages

**Key Learnings Applied:**
- Layer.succeed for placeholder implementations that fail with Effect.fail
- S.optional for OAuth response schemas (not BS.FieldOptionOmittable)
- Context.Tag interface in client, Layer implementation in server

### Architectural Decisions Made

| Decision | Rationale |
|----------|-----------|
| IAM owns IntegrationTokenStore | Centralized security policy enforcement, token encryption in one place |
| Provider-agnostic interface | Support Google, Microsoft, and future integrations with single store |
| Distributed lock on refresh | Prevent race conditions when multiple requests trigger token refresh |

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| IntegrationTokenStore service | `packages/iam/server/src/services/IntegrationTokenStore.ts` |
| IntegrationTokenStore interface | `packages/iam/client/src/services/IntegrationTokenStore.ts` |
| Token table definition | `packages/iam/tables/src/integration-tokens.table.ts` |
| GoogleAuthClientLive Layer | `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts` |

### IntegrationTokenStore Interface Pattern

```typescript
// packages/iam/client/src/services/IntegrationTokenStore.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";

export interface StoredToken {
  readonly accessToken: string;
  readonly refreshToken: O.Option<string>;
  readonly expiresAt: number; // Unix timestamp
  readonly scopes: ReadonlyArray<string>;
  readonly provider: string;
}

export interface IntegrationTokenStoreService {
  readonly get: (
    userId: string,
    provider: string
  ) => Effect.Effect<O.Option<StoredToken>, never>;

  readonly store: (
    userId: string,
    provider: string,
    token: StoredToken
  ) => Effect.Effect<void, never>;

  readonly refresh: (
    userId: string,
    provider: string,
    refreshFn: (refreshToken: string) => Effect.Effect<StoredToken, Error>
  ) => Effect.Effect<StoredToken, TokenRefreshError>;

  readonly revoke: (
    userId: string,
    provider: string
  ) => Effect.Effect<void, never>;
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
  provider: pg.text("provider").notNull(), // "google", "microsoft", etc.
  accessToken: pg.text("access_token").notNull(), // Encrypted
  refreshToken: pg.text("refresh_token"), // Encrypted, nullable
  expiresAt: pg.timestamp("expires_at", { withTimezone: true }).notNull(),
  scopes: pg.text("scopes").array().notNull(), // Array of granted scopes
  createdAt: pg.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: pg.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

## Procedural Memory (Reference Links)

### Effect Patterns (MANDATORY)

- `.claude/rules/effect-patterns.md` - Effect patterns, import conventions
- `documentation/patterns/database-patterns.md` - Table creation patterns

### Existing Code References

- `packages/iam/server/src/services/` - Existing IAM service patterns
- `packages/shared/server/src/encryption/` - Encryption utilities (if exists)
- `packages/iam/tables/src/` - Existing table definitions

### Security References

- Token encryption should use AES-256-GCM or equivalent
- Refresh token should be encrypted separately from access token
- Consider using HashiCorp Vault or AWS KMS for production key management

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check IAM | `bun run check --filter @beep/iam-*` | No errors |
| Type check GWS | `bun run check --filter @beep/google-workspace-*` | No errors |
| Lint | `bun run lint --filter @beep/iam-*` | No errors |
| DB generate | `bun run db:generate` | Success |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Token storage works | Can store and retrieve token via IntegrationTokenStore |
| Token encrypted | accessToken and refreshToken columns contain encrypted values |
| Refresh with lock | Concurrent refresh calls block, only one executes |
| GoogleAuthClientLive works | `getValidToken` retrieves real tokens from store |

---

## Tasks Breakdown

### Task 1: Create IntegrationTokenStore Interface

**File**: `packages/iam/client/src/services/IntegrationTokenStore.ts`

Create Context.Tag interface with:
- `get(userId, provider)` - Retrieve token
- `store(userId, provider, token)` - Store encrypted token
- `refresh(userId, provider, refreshFn)` - Refresh with lock
- `revoke(userId, provider)` - Delete token

### Task 2: Create Token Table

**File**: `packages/iam/tables/src/integration-tokens.table.ts`

Create table with:
- Composite unique constraint on (userId, provider)
- Encrypted columns for accessToken and refreshToken
- Timestamp columns with timezone

### Task 3: Implement IntegrationTokenStoreLive

**File**: `packages/iam/server/src/services/IntegrationTokenStoreLive.ts`

Implement Layer with:
- Token encryption/decryption using shared encryption utilities
- Distributed lock for refresh operations (consider Effect Semaphore or Redis lock)
- Database operations using @beep/iam-tables

### Task 4: Update GoogleAuthClientLive

**File**: `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`

Replace placeholder with:
- Real token retrieval from IntegrationTokenStore
- Token refresh when expired
- Proper error handling with domain errors

### Task 5: Run Migrations and Verify

```bash
bun run db:generate
bun run db:migrate
bun run check --filter @beep/iam-*
bun run check --filter @beep/google-workspace-*
```

---

## Handoff to Phase 3

After completing Phase 2:

1. **Update REFLECTION_LOG.md** with learnings about:
   - Token encryption patterns
   - Distributed locking approach chosen
   - Any challenges with IAM integration

2. **Create HANDOFF_P3.md** for:
   - Gmail Adapter Implementation
   - Calendar Adapter Implementation

3. **Verify integration test** (optional):
   - End-to-end token flow from Google OAuth callback to Gmail API call
