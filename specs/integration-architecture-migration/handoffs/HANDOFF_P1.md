# Handoff P1: Infrastructure Package Creation

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 2,000 tokens | ~1,800 | OK |
| Episodic Memory | 1,000 tokens | ~850 | OK |
| Semantic Memory | 500 tokens | ~450 | OK |
| Procedural Memory | 500 tokens | ~300 | OK |
| **Total** | **4,000 tokens** | **~3,400** | **OK** |

---

## Working Memory (Current Phase)

### Phase 1 Goal

Create the `packages/integrations/google-workspace/` infrastructure package with three sub-packages: domain, client, and server.

### Deliverables

1. **@beep/google-workspace-domain** package:
   - Tagged error classes (GoogleApiError, RateLimitError, TokenError, ScopeExpansionRequired)
   - Scope constants for Gmail and Calendar APIs
   - EntityId definitions if needed

2. **@beep/google-workspace-client** package:
   - GoogleAuthClient Context.Tag interface (NO implementation)
   - GoogleHttpClient with retry/backoff logic
   - OAuth response schemas (token, user info)

3. **@beep/google-workspace-server** package:
   - GoogleAuthService implementation
   - GoogleAuthClientLive Layer (requires IntegrationTokenStore from IAM)
   - Token refresh logic with Effect error handling

### Success Criteria

- [ ] All three packages created with proper `package.json` and `tsconfig.json`
- [ ] Packages compile without errors (`bun run check --filter @beep/google-workspace-*`)
- [ ] Exports are clean: `@beep/google-workspace-domain`, `@beep/google-workspace-client`, `@beep/google-workspace-server`
- [ ] Tagged errors follow `S.TaggedError<T>()("ErrorName", {...})` pattern
- [ ] Context.Tag follows Effect Service pattern: `Context.Tag<Interface>()`
- [ ] Layer composition uses proper `Layer.effect` and dependency injection
- [ ] tsconfig path aliases added to `tsconfig.base.jsonc`
- [ ] Packages appear in `bun.lock` after `bun install`

### Blocking Issues

None identified. Phase 0 architecture decisions are complete.

### Key Constraints

1. **NO Implementation in Client Package**:
   - GoogleAuthClient MUST be a Context.Tag interface only
   - Implementation belongs in server package's GoogleAuthClientLive Layer

2. **IAM Owns Token Storage**:
   - GoogleAuthClientLive requires IntegrationTokenStore service
   - Token store implementation lives in `@beep/iam-server` (NOT the integration package)

3. **Scope Expansion Pattern**:
   - When API call fails due to missing scope, throw ScopeExpansionRequired error
   - Include required scopes in error payload for UI to present re-auth flow

4. **Effect Error Handling**:
   - ALL errors MUST extend `S.TaggedError`
   - Use Effect.retry with exponential backoff for transient failures
   - Use Effect.catchTag for scope-specific error handling

### Implementation Order

1. Create `packages/integrations/google-workspace/` directory structure
2. Create domain package with error classes and scope constants
3. Create client package with Context.Tag interface and HTTP client
4. Create server package with Layer implementation
5. Add tsconfig path aliases and verify imports
6. Run `bun install` and verify packages appear in lockfile
7. Run verification commands

---

## Episodic Memory (Previous Context)

### Phase 0 Summary

**Completed:**
- README.md documenting three-tier architecture
- MASTER_ORCHESTRATION.md with execution guide
- AGENT_PROMPTS.md with copy-paste prompts
- QUICK_START.md for fast onboarding
- This handoff document (HANDOFF_P1.md)

**Architectural Decisions Made:**

1. **Three-Tier Pattern**:
   - Tier 1: Shared infrastructure (`packages/integrations/google-workspace/`)
   - Tier 2: Slice adapters (`packages/{slice}/server/adapters/`)
   - Tier 3: IAM-owned token storage (`IntegrationTokenStore` in `@beep/iam-server`)

2. **Context.Tag Pattern**:
   - GoogleAuthClient is an interface (Context.Tag)
   - GoogleAuthClientLive is the Layer implementation
   - Implementation requires IAM's IntegrationTokenStore service

3. **Scope Management**:
   - Each slice adapter declares its required scopes
   - Shared infrastructure provides base OAuth flow
   - ACL translation happens in slice adapters, not shared code

4. **Error Handling**:
   - ScopeExpansionRequired error for incremental OAuth
   - RateLimitError with retry-after metadata
   - TokenError for expired/invalid credentials

**Existing Code to Reuse:**

- `packages/shared/integrations/src/google/gmail/common/GmailClient.ts` - Context.Tag pattern reference
- `packages/shared/integrations/src/google/gmail/common/wrap-gmail-call.ts` - Effect wrapper for API calls
- `packages/shared/integrations/src/google/gmail/actions/*.ts` - Action patterns to migrate

**Known Issues:**

None at this stage. Existing Gmail integration code uses deprecated patterns but provides good reference for Context.Tag and Effect.gen structure.

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| Domain package | `packages/integrations/google-workspace/domain/` |
| Client package | `packages/integrations/google-workspace/client/` |
| Server package | `packages/integrations/google-workspace/server/` |
| Error classes | `packages/integrations/google-workspace/domain/src/errors/` |
| Scope constants | `packages/integrations/google-workspace/domain/src/scopes.ts` |
| GoogleAuthClient interface | `packages/integrations/google-workspace/client/src/GoogleAuthClient.ts` |
| GoogleAuthClientLive Layer | `packages/integrations/google-workspace/server/src/GoogleAuthClientLive.ts` |

### Error Class Structure

```typescript
// packages/integrations/google-workspace/domain/src/errors/GoogleApiError.ts
import * as S from "effect/Schema";

export class GoogleApiError extends S.TaggedError<GoogleApiError>()(
  "GoogleApiError",
  {
    message: S.String,
    statusCode: S.Number,
    endpoint: S.optional(S.String),
  }
) {}
```

### Context.Tag Interface Pattern

```typescript
// packages/integrations/google-workspace/client/src/GoogleAuthClient.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

interface GoogleAuthClientService {
  readonly getAccessToken: (userId: string) => Effect.Effect<string, TokenError>;
  readonly refreshToken: (userId: string) => Effect.Effect<void, TokenError>;
}

export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  GoogleAuthClientService
>() {}
```

### Layer Implementation Pattern

```typescript
// packages/integrations/google-workspace/server/src/GoogleAuthClientLive.ts
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { IntegrationTokenStore } from "@beep/iam-server"; // IAM-owned service

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
          return token.accessToken;
        }),
      refreshToken: (userId) =>
        Effect.gen(function* () {
          // Token refresh logic here
        }),
    });
  })
);
```

### Scope Constants

```typescript
// packages/integrations/google-workspace/domain/src/scopes.ts
export const GmailScopes = {
  READONLY: "https://www.googleapis.com/auth/gmail.readonly",
  SEND: "https://www.googleapis.com/auth/gmail.send",
  MODIFY: "https://www.googleapis.com/auth/gmail.modify",
} as const;

export const CalendarScopes = {
  READONLY: "https://www.googleapis.com/auth/calendar.readonly",
  EVENTS: "https://www.googleapis.com/auth/calendar.events",
} as const;
```

---

## Procedural Memory (Reference Links)

### Effect Patterns (MANDATORY)

- `.claude/rules/effect-patterns.md` - Effect patterns, import conventions, NEVER patterns
- `documentation/patterns/effect-collections.md` - Effect collections migration guide

### Existing Code References

- `packages/shared/integrations/src/google/gmail/common/GmailClient.ts` - Context.Tag pattern
- `packages/shared/integrations/src/google/gmail/common/wrap-gmail-call.ts` - Effect wrapper for Google API calls
- `packages/iam/domain/src/entities/account/account.model.ts` - OAuth token fields (accessToken, refreshToken, expiresAt)

### EntityId Patterns

- `packages/shared/domain/src/entity-ids/` - EntityId creation patterns
- `packages/iam/domain/AGENTS.md` - EntityId verification checklist

### Package Structure References

- `documentation/PACKAGE_STRUCTURE.md` - Package layout conventions
- `tsconfig.base.jsonc` - Path alias registration

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check domain | `bun run check --filter @beep/google-workspace-domain` | No errors |
| Type check client | `bun run check --filter @beep/google-workspace-client` | No errors |
| Type check server | `bun run check --filter @beep/google-workspace-server` | No errors |
| Lint | `bun run lint --filter @beep/google-workspace-*` | No errors |
| Lockfile updated | `grep "google-workspace" bun.lock` | Packages present |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Packages compile | No TypeScript errors in verification commands |
| Exports work | Can import `@beep/google-workspace-domain`, `@beep/google-workspace-client`, `@beep/google-workspace-server` |
| Tagged errors | Errors extend `S.TaggedError` and compile |
| Context.Tag interface | GoogleAuthClient is importable from client package |
| Layer implementation | GoogleAuthClientLive exports a valid Layer |
| Path aliases | tsconfig.base.jsonc includes new package paths |

### Package Structure Validation

Each package MUST have:
- [ ] `package.json` with correct name, version, dependencies
- [ ] `tsconfig.json` extending `@beep/tsconfig/base.json`
- [ ] `src/index.ts` exporting public API
- [ ] Clean imports (ONLY from `effect/*`, `@beep/*` packages)

---

## Handoff to Phase 2

After completing Phase 1:

1. **Update REFLECTION_LOG.md**:
   - Document any issues encountered during package creation
   - Note patterns that worked well (Context.Tag, Layer composition)
   - Capture learnings about Effect error handling

2. **Create outputs/phase1-structure.md**:
   - Document final package structure
   - List all exported types and services
   - Include import examples for downstream consumers

3. **Proceed to Phase 2: IAM Token Storage**:
   - Implement IntegrationTokenStore service in `@beep/iam-server`
   - Add integration token fields to Account entity if needed
   - Create token refresh scheduler

4. **Blocking Check**:
   - Phase 2 requires Phase 1 packages to compile successfully
   - All verification commands MUST pass before proceeding
