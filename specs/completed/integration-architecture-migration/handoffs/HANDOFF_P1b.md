# Handoff P1b: Client/Server Package Implementation

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,500 | OK |
| Episodic Memory | 1,000 tokens | ~800 | OK |
| Semantic Memory | 500 tokens | ~400 | OK |
| Procedural Memory | 500 tokens | Links only | OK |
| **Total** | **4,000 tokens** | **~2,700** | **OK** |

---

## Working Memory (Current Phase)

### Phase 1b Goal

Create `@beep/google-workspace-client` and `@beep/google-workspace-server` packages with Context.Tag interfaces, HTTP client logic, OAuth schemas, and Layer implementations.

### Deliverables

1. **@beep/google-workspace-client** package:
   - GoogleAuthClient Context.Tag interface (NO implementation)
   - GoogleApiClient Context.Tag interface for API calls
   - OAuth response schemas (token exchange, user info)
   - HTTP client configuration schemas
   - Clean barrel exports

2. **@beep/google-workspace-server** package:
   - GoogleAuthService implementation (requires IntegrationTokenStore)
   - GoogleAuthClientLive Layer
   - GoogleApiClientLive Layer with retry/backoff logic
   - Token refresh logic with Effect error handling
   - Layer composition exports

3. **Configuration**:
   - Add tsconfig path aliases to `tsconfig.base.jsonc`
   - Add package references to workspace
   - Run `bun install` to update lockfile

### Success Criteria

- [ ] Both packages created with proper `package.json` and `tsconfig.json`
- [ ] Client package compiles without errors (`bun run check --filter @beep/google-workspace-client`)
- [ ] Server package compiles without errors (`bun run check --filter @beep/google-workspace-server`)
- [ ] Exports are clean: `@beep/google-workspace-client`, `@beep/google-workspace-server`
- [ ] Context.Tag interfaces follow Effect Service pattern: `Context.Tag<Interface>()`
- [ ] Layer composition uses proper `Layer.effect` and dependency injection
- [ ] Server package correctly declares dependency on IAM's IntegrationTokenStore (stub interface for now)
- [ ] tsconfig path aliases added to `tsconfig.base.jsonc`
- [ ] Packages appear in `bun.lock` after `bun install`

### Blocking Issues

None. Phase 1a completion provides the domain package with error types and scope constants.

### Key Constraints

1. **NO Implementation in Client Package**:
   - GoogleAuthClient MUST be a Context.Tag interface only
   - GoogleApiClient MUST be a Context.Tag interface only
   - Implementation belongs in server package's Live Layers

2. **IAM Dependency (Stubbed)**:
   - GoogleAuthService requires IntegrationTokenStore service
   - For Phase 1b, create a STUB interface for IntegrationTokenStore in server package
   - Real implementation will come in Phase 2

3. **HTTP Client Pattern**:
   - GoogleApiClient wraps HTTP operations with retry/backoff
   - Use Effect.retry with exponential backoff for transient failures
   - Throw appropriate tagged errors from domain package

4. **Effect Error Handling**:
   - ALL errors MUST extend `S.TaggedError` from domain package
   - Use Effect.retry with exponential backoff for RateLimitError
   - Use Effect.catchTag for scope-specific error handling

### Implementation Order

1. Create `packages/integrations/google-workspace/client/` structure
2. Implement GoogleAuthClient Context.Tag interface
3. Implement GoogleApiClient Context.Tag interface
4. Create OAuth response schemas
5. Create `packages/integrations/google-workspace/server/` structure
6. Create IntegrationTokenStore stub interface
7. Implement GoogleAuthService
8. Implement GoogleAuthClientLive Layer
9. Implement GoogleApiClientLive Layer
10. Add tsconfig path aliases
11. Run `bun install` and verify packages appear in lockfile
12. Run verification commands

---

## Episodic Memory (Previous Context)

### Phase 1a Summary

**Completed:**
- Created `packages/integrations/google-workspace/domain/` package
- Implemented tagged error classes:
  - GoogleApiError - API call failures with status code and endpoint
  - RateLimitError - Rate limiting with retry-after metadata
  - TokenError - Expired/invalid tokens
  - ScopeExpansionRequired - Incremental OAuth flow trigger
- Implemented scope constants:
  - GmailScopes (READONLY, SEND, MODIFY)
  - CalendarScopes (READONLY, EVENTS)
- Added EntityId definitions if needed
- Package compiles successfully

**Key Learnings Applied:**
- Tagged errors follow `S.TaggedError<T>()("ErrorName", {...})` pattern
- Scope constants use `as const` for type safety
- Domain package has zero external dependencies beyond Effect

**Architectural Decisions Made:**
- All errors extend S.TaggedError for Effect error handling
- Scope constants are read-only to prevent runtime mutation
- ScopeExpansionRequired error includes required scopes array for UI to present re-auth flow

### Existing Code to Reuse

- `packages/shared/integrations/src/google/gmail/common/GmailClient.ts` - Context.Tag pattern reference
- `packages/shared/integrations/src/google/gmail/common/wrap-gmail-call.ts` - Effect wrapper for API calls
- `packages/shared/integrations/src/google/gmail/actions/*.ts` - Action patterns to migrate

### Known Issues

None at this stage. Phase 1a completed successfully with all verification checks passing.

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| Client package root | `packages/integrations/google-workspace/client/` |
| Server package root | `packages/integrations/google-workspace/server/` |
| GoogleAuthClient interface | `packages/integrations/google-workspace/client/src/GoogleAuthClient.ts` |
| GoogleApiClient interface | `packages/integrations/google-workspace/client/src/GoogleApiClient.ts` |
| OAuth schemas | `packages/integrations/google-workspace/client/src/schemas/` |
| GoogleAuthService | `packages/integrations/google-workspace/server/src/services/GoogleAuthService.ts` |
| GoogleAuthClientLive Layer | `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts` |
| GoogleApiClientLive Layer | `packages/integrations/google-workspace/server/src/layers/GoogleApiClientLive.ts` |
| IntegrationTokenStore stub | `packages/integrations/google-workspace/server/src/services/IntegrationTokenStore.stub.ts` |

### Context.Tag Interface Pattern

```typescript
// packages/integrations/google-workspace/client/src/GoogleAuthClient.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { TokenError } from "@beep/google-workspace-domain";

interface GoogleAuthClientService {
  readonly getAccessToken: (userId: string) => Effect.Effect<string, TokenError>;
  readonly refreshToken: (userId: string) => Effect.Effect<void, TokenError>;
  readonly revokeToken: (userId: string) => Effect.Effect<void, TokenError>;
}

export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  GoogleAuthClientService
>() {}
```

### Layer Implementation Pattern

```typescript
// packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { IntegrationTokenStore } from "../services/IntegrationTokenStore.stub";
import { TokenError } from "@beep/google-workspace-domain";

export const GoogleAuthClientLive = Layer.effect(
  GoogleAuthClient,
  Effect.gen(function* () {
    const tokenStore = yield* IntegrationTokenStore;

    return GoogleAuthClient.of({
      getAccessToken: (userId) =>
        Effect.gen(function* () {
          const token = yield* tokenStore.get(userId, "google");
          if (!token) {
            return yield* Effect.fail(new TokenError({ message: "No token found" }));
          }
          // Check if token is expired
          if (token.expiresAt < Date.now()) {
            // Refresh token
            yield* tokenStore.refresh(userId, "google");
            const refreshedToken = yield* tokenStore.get(userId, "google");
            if (!refreshedToken) {
              return yield* Effect.fail(new TokenError({ message: "Token refresh failed" }));
            }
            return refreshedToken.accessToken;
          }
          return token.accessToken;
        }),

      refreshToken: (userId) =>
        Effect.gen(function* () {
          yield* tokenStore.refresh(userId, "google");
        }),

      revokeToken: (userId) =>
        Effect.gen(function* () {
          yield* tokenStore.revoke(userId, "google");
        }),
    });
  })
);
```

### OAuth Response Schemas

```typescript
// packages/integrations/google-workspace/client/src/schemas/oauth.schemas.ts
import * as S from "effect/Schema";

export class TokenExchangeResponse extends S.Class<TokenExchangeResponse>(
  "TokenExchangeResponse"
)({
  access_token: S.String,
  refresh_token: S.optional(S.String),
  expires_in: S.Number,
  scope: S.String,
  token_type: S.Literal("Bearer"),
}) {}

export class UserInfoResponse extends S.Class<UserInfoResponse>(
  "UserInfoResponse"
)({
  id: S.String,
  email: S.String,
  verified_email: S.Boolean,
  name: S.optional(S.String),
  picture: S.optional(S.String),
}) {}
```

### IntegrationTokenStore Stub Interface

```typescript
// packages/integrations/google-workspace/server/src/services/IntegrationTokenStore.stub.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export interface IntegrationToken {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresAt: number;
  readonly scopes: ReadonlyArray<string>;
}

interface IntegrationTokenStoreService {
  readonly get: (
    userId: string,
    provider: string
  ) => Effect.Effect<IntegrationToken | null, never>;

  readonly store: (
    userId: string,
    provider: string,
    token: IntegrationToken
  ) => Effect.Effect<void, never>;

  readonly refresh: (
    userId: string,
    provider: string
  ) => Effect.Effect<void, never>;

  readonly revoke: (
    userId: string,
    provider: string
  ) => Effect.Effect<void, never>;
}

export class IntegrationTokenStore extends Context.Tag("IntegrationTokenStore")<
  IntegrationTokenStore,
  IntegrationTokenStoreService
>() {}

// NOTE: This is a STUB interface. Real implementation will be created in Phase 2
// in packages/iam/server/src/services/IntegrationTokenStore.ts
```

### GoogleApiClient Interface

```typescript
// packages/integrations/google-workspace/client/src/GoogleApiClient.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { GoogleApiError, RateLimitError } from "@beep/google-workspace-domain";

export interface GoogleApiRequest {
  readonly method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  readonly path: string;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
}

export interface GoogleApiResponse<T> {
  readonly data: T;
  readonly status: number;
  readonly headers: Record<string, string>;
}

interface GoogleApiClientService {
  readonly request: <T>(
    req: GoogleApiRequest
  ) => Effect.Effect<GoogleApiResponse<T>, GoogleApiError | RateLimitError>;
}

export class GoogleApiClient extends Context.Tag("GoogleApiClient")<
  GoogleApiClient,
  GoogleApiClientService
>() {}
```

---

## Procedural Memory (Reference Links)

### Effect Patterns (MANDATORY)

- `.claude/rules/effect-patterns.md` - Effect patterns, import conventions, NEVER patterns
- `documentation/patterns/effect-collections.md` - Effect collections migration guide

### Existing Code References

- `packages/shared/integrations/src/google/gmail/common/GmailClient.ts` - Context.Tag pattern
- `packages/shared/integrations/src/google/gmail/common/wrap-gmail-call.ts` - Effect wrapper for Google API calls
- `packages/iam/domain/src/entities/account/account.model.ts` - OAuth token fields reference

### Package Structure References

- `documentation/PACKAGE_STRUCTURE.md` - Package layout conventions
- `tsconfig.base.jsonc` - Path alias registration

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check client | `bun run check --filter @beep/google-workspace-client` | No errors |
| Type check server | `bun run check --filter @beep/google-workspace-server` | No errors |
| Lint client | `bun run lint --filter @beep/google-workspace-client` | No errors |
| Lint server | `bun run lint --filter @beep/google-workspace-server` | No errors |
| Lockfile updated | `grep "google-workspace-client\|google-workspace-server" bun.lock` | Both packages present |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Packages compile | No TypeScript errors in verification commands |
| Client exports work | Can import GoogleAuthClient, GoogleApiClient from `@beep/google-workspace-client` |
| Server exports work | Can import GoogleAuthClientLive, GoogleApiClientLive from `@beep/google-workspace-server` |
| Context.Tag interfaces | GoogleAuthClient and GoogleApiClient are importable from client package |
| Layer implementations | GoogleAuthClientLive and GoogleApiClientLive export valid Layers |
| Path aliases | tsconfig.base.jsonc includes new package paths |

### Package Structure Validation

Each package MUST have:
- [ ] `package.json` with correct name, version, dependencies
- [ ] `tsconfig.json` extending `@beep/tsconfig/base.json`
- [ ] `src/index.ts` exporting public API
- [ ] Clean imports (ONLY from `effect/*`, `@beep/*` packages)
- [ ] NO implementation in client package (Context.Tag interfaces only)
- [ ] ALL implementation in server package (Live Layers)

### Package.json Template (Client)

```json
{
  "name": "@beep/google-workspace-client",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@beep/google-workspace-domain": "workspace:*",
    "effect": "^3.0.0"
  },
  "devDependencies": {
    "@beep/tsconfig": "workspace:*"
  }
}
```

### Package.json Template (Server)

```json
{
  "name": "@beep/google-workspace-server",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@beep/google-workspace-domain": "workspace:*",
    "@beep/google-workspace-client": "workspace:*",
    "effect": "^3.0.0",
    "@effect/platform": "^0.69.0"
  },
  "devDependencies": {
    "@beep/tsconfig": "workspace:*"
  }
}
```

### tsconfig.json Template

```json
{
  "extends": "@beep/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Handoff to Phase 2

After completing Phase 1b:

1. **Update REFLECTION_LOG.md**:
   - Document any issues encountered during package creation
   - Note patterns that worked well (Context.Tag, Layer composition)
   - Capture learnings about Effect error handling
   - Note any deviations from planned structure

2. **Create outputs/phase1b-structure.md**:
   - Document final package structure
   - List all exported types and services
   - Include import examples for downstream consumers
   - Document IntegrationTokenStore stub interface for Phase 2

3. **Proceed to Phase 2: IAM Token Storage**:
   - Implement IntegrationTokenStore service in `@beep/iam-server`
   - Replace stub interface with real implementation
   - Add integration token fields to Account entity if needed
   - Create token refresh scheduler
   - Create encrypted token storage logic

4. **Blocking Check**:
   - Phase 2 requires Phase 1b packages to compile successfully
   - All verification commands MUST pass before proceeding
   - IntegrationTokenStore stub interface must be documented for Phase 2 reference

---

## Tasks Breakdown

### Task 1: Create Client Package Structure

```bash
mkdir -p packages/integrations/google-workspace/client/src/schemas
```

**Files to create:**
- `packages/integrations/google-workspace/client/package.json`
- `packages/integrations/google-workspace/client/tsconfig.json`
- `packages/integrations/google-workspace/client/src/index.ts`

### Task 2: Implement GoogleAuthClient Context.Tag

**File**: `packages/integrations/google-workspace/client/src/GoogleAuthClient.ts`

**Exports**:
- `GoogleAuthClient` - Context.Tag interface
- Interface defines: `getAccessToken`, `refreshToken`, `revokeToken`

### Task 3: Implement GoogleApiClient Context.Tag

**File**: `packages/integrations/google-workspace/client/src/GoogleApiClient.ts`

**Exports**:
- `GoogleApiClient` - Context.Tag interface
- `GoogleApiRequest` - Request shape interface
- `GoogleApiResponse<T>` - Response shape interface
- Interface defines: `request<T>(req: GoogleApiRequest)`

### Task 4: Create OAuth Response Schemas

**File**: `packages/integrations/google-workspace/client/src/schemas/oauth.schemas.ts`

**Exports**:
- `TokenExchangeResponse` - OAuth token exchange response
- `UserInfoResponse` - Google user info response

### Task 5: Client Package Barrel Exports

**File**: `packages/integrations/google-workspace/client/src/index.ts`

```typescript
export * from "./GoogleAuthClient";
export * from "./GoogleApiClient";
export * from "./schemas/oauth.schemas";
```

### Task 6: Create Server Package Structure

```bash
mkdir -p packages/integrations/google-workspace/server/src/{services,layers}
```

**Files to create:**
- `packages/integrations/google-workspace/server/package.json`
- `packages/integrations/google-workspace/server/tsconfig.json`
- `packages/integrations/google-workspace/server/src/index.ts`

### Task 7: Create IntegrationTokenStore Stub

**File**: `packages/integrations/google-workspace/server/src/services/IntegrationTokenStore.stub.ts`

**Exports**:
- `IntegrationTokenStore` - Context.Tag interface
- `IntegrationToken` - Token shape interface

**Note**: Add prominent comment that this is a stub for Phase 1b, real implementation in Phase 2.

### Task 8: Implement GoogleAuthClientLive Layer

**File**: `packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts`

**Exports**:
- `GoogleAuthClientLive` - Layer providing GoogleAuthClient implementation
- Depends on: IntegrationTokenStore stub

### Task 9: Implement GoogleApiClientLive Layer

**File**: `packages/integrations/google-workspace/server/src/layers/GoogleApiClientLive.ts`

**Exports**:
- `GoogleApiClientLive` - Layer providing GoogleApiClient implementation
- Implements: HTTP retry logic with exponential backoff
- Throws: GoogleApiError, RateLimitError from domain package

### Task 10: Server Package Barrel Exports

**File**: `packages/integrations/google-workspace/server/src/index.ts`

```typescript
export * from "./layers/GoogleAuthClientLive";
export * from "./layers/GoogleApiClientLive";
export * from "./services/IntegrationTokenStore.stub";
```

### Task 11: Update tsconfig.base.jsonc

Add path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@beep/google-workspace-domain": ["./packages/integrations/google-workspace/domain/src"],
      "@beep/google-workspace-client": ["./packages/integrations/google-workspace/client/src"],
      "@beep/google-workspace-server": ["./packages/integrations/google-workspace/server/src"]
    }
  }
}
```

### Task 12: Run bun install and Verify

```bash
bun install
bun run check --filter @beep/google-workspace-client
bun run check --filter @beep/google-workspace-server
bun run lint --filter @beep/google-workspace-client
bun run lint --filter @beep/google-workspace-server
```

---

## Critical Patterns

### Context.Tag Pattern (Client)

```typescript
// CORRECT - Context.Tag interface only
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

interface ServiceInterface {
  readonly method: (arg: string) => Effect.Effect<ReturnType, ErrorType>;
}

export class ServiceTag extends Context.Tag("ServiceTag")<
  ServiceTag,
  ServiceInterface
>() {}
```

### Layer Implementation Pattern (Server)

```typescript
// CORRECT - Layer.effect with dependency injection
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { ServiceTag } from "@beep/package-client";
import { Dependency } from "./Dependency";

export const ServiceTagLive = Layer.effect(
  ServiceTag,
  Effect.gen(function* () {
    const dep = yield* Dependency;

    return ServiceTag.of({
      method: (arg) =>
        Effect.gen(function* () {
          // Implementation using dep
        }),
    });
  })
);
```

### Retry Pattern with Exponential Backoff

```typescript
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { RateLimitError } from "@beep/google-workspace-domain";

const retrySchedule = Schedule.exponential("100 millis").pipe(
  Schedule.compose(Schedule.recurs(3))
);

const apiCall = Effect.gen(function* () {
  // API call logic
}).pipe(
  Effect.retry(retrySchedule),
  Effect.catchTag("RateLimitError", (error) =>
    Effect.fail(error) // Re-throw rate limit errors
  )
);
```
