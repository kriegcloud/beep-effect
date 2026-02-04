# Phase 1b Orchestrator: Client/Server Package Creation

> **Copy-paste this into a fresh Claude session to execute Phase 1b**

---

## Context

You are implementing Phase 1b of the Google Workspace integration migration spec.

**Previous Phase (P1a) Completed**:
- Created `packages/integrations/google-workspace/domain/` package
- Implemented tagged error types (`GoogleAuthenticationError`, `GoogleApiError`, etc.)
- Implemented scope constants (`GmailScopes`, `CalendarScopes`, `DriveScopes`)
- Implemented token model (`GoogleOAuthToken`)
- Package compiles and passes type checks

**Key Learnings from P1a**:
- Package identifiers must be registered in `@beep/identity` BEFORE creating packages
- Effect Schema requires PascalCase constructors (`S.String`, NOT `s.string`)
- Scope constants use `as const` for compile-time validation
- Token model uses `S.optionalWith` for nullable OAuth fields

---

## Your Mission

Create the client and server packages for Google Workspace integration infrastructure:

1. **Client Package** (`@beep/google-workspace-client`):
   - Context.Tag service interfaces (NO implementations)
   - OAuth contract schemas for Google API responses
   - Exports for dependency injection

2. **Server Package** (`@beep/google-workspace-server`):
   - Layer implementations for services
   - GoogleAuthService (placeholder - full implementation in Phase 2)
   - Layer composition and exports

3. **Configuration**:
   - Update `tsconfig.base.jsonc` path aliases
   - Update package references in tsconfig files

---

## Critical Patterns

### Context.Tag Interface (Client Package)

```typescript
// packages/integrations/google-workspace/client/src/services/GoogleAuthClient.ts
import type { GoogleAuthenticationError, GoogleTokenExpiredError, GoogleTokenRefreshError } from "@beep/google-workspace-domain";
import type { GoogleOAuthToken } from "@beep/google-workspace-domain";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export class GoogleAuthClient extends Context.Tag("GoogleAuthClient")<
  GoogleAuthClient,
  {
    readonly getValidToken: (
      scopes: ReadonlyArray<string>
    ) => Effect.Effect<
      GoogleOAuthToken,
      GoogleAuthenticationError | GoogleTokenExpiredError | GoogleTokenRefreshError
    >;
    readonly refreshToken: (
      refreshToken: string
    ) => Effect.Effect<
      GoogleOAuthToken,
      GoogleTokenRefreshError
    >;
  }
>() {}
```

**Pattern**: Use `Context.Tag` with descriptive string identifier and typed interface. NO implementations in client package.

### OAuth Contract Schema (Client Package)

```typescript
// packages/integrations/google-workspace/client/src/contracts/oauth.contracts.ts
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { $GoogleWorkspaceClientId } from "@beep/identity/packages";

const $I = $GoogleWorkspaceClientId.create("contracts/oauth");

export class OAuthTokenResponse extends S.Class<OAuthTokenResponse>($I`OAuthTokenResponse`)(
  {
    access_token: S.String,
    refresh_token: BS.FieldOptionOmittable(S.String),
    expires_in: S.Number,
    scope: S.String,
    token_type: S.Literal("Bearer"),
  },
  $I.annotations("OAuthTokenResponse", {
    description: "Google OAuth token response from authorization endpoint",
  })
) {}
```

**Pattern**: Use `BS.FieldOptionOmittable` for optional fields from external APIs. Include `$I` identifier for traceability.

### Layer Implementation (Server Package)

```typescript
// packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { GoogleAuthenticationError, GoogleTokenRefreshError } from "@beep/google-workspace-domain";

export const GoogleAuthClientLive = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (scopes) =>
      Effect.gen(function* () {
        // Placeholder implementation - Phase 2 will add full logic
        return yield* Effect.fail(
          new GoogleAuthenticationError({
            message: "Not implemented - Phase 2 will add IntegrationTokenStore integration",
            suggestion: "Complete Phase 2 token storage setup",
          })
        );
      }),
    refreshToken: (refreshToken) =>
      Effect.gen(function* () {
        return yield* Effect.fail(
          new GoogleTokenRefreshError({
            message: "Not implemented - Phase 2 will add OAuth refresh logic",
          })
        );
      }),
  })
);
```

**Pattern**: Use `Layer.succeed` for simple implementations without dependencies. Placeholder implementations use `Effect.fail` with descriptive errors.

### Package Configuration (package.json)

```json
{
  "name": "@beep/google-workspace-client",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "Google Workspace client service interfaces and contracts",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "dev": "tsc -b tsconfig.build.json --watch",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build-annotate": "babel build/esm --plugins annotate-pure-calls --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "lint": "biome check .",
    "lint:fix": "biome check . --write"
  },
  "peerDependencies": {
    "@beep/identity": "workspace:^",
    "@beep/schema": "workspace:^",
    "@beep/google-workspace-domain": "workspace:^",
    "effect": "catalog:"
  },
  "devDependencies": {
    "@beep/identity": "workspace:^",
    "@beep/schema": "workspace:^",
    "@beep/google-workspace-domain": "workspace:^",
    "effect": "catalog:"
  }
}
```

**Pattern**: Client package depends on domain package. Server package depends on both client and domain.

### TypeScript Configuration (tsconfig.json)

```jsonc
{
  "extends": "../../../../tsconfig.base.jsonc",
  "references": [
    { "path": "./tsconfig.src.json" }
  ]
}
```

```jsonc
{
  "extends": "../../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "composite": true,
    "outDir": "build/dts",
    "declarationDir": "build/dts",
    "declaration": true,
    "emitDeclarationOnly": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist"]
}
```

**Pattern**: Three-file tsconfig setup: `tsconfig.json` (base), `tsconfig.src.json` (source), `tsconfig.build.json` (build).

---

## Step-by-Step Execution Plan

### Step 1: Update Identity Package (if not done in P1a)

Verify `packages/common/identity/src/packages.ts` contains:

```typescript
export const $GoogleWorkspaceClientId = $packageId.refine(
  "integrations/google-workspace/client"
);

export const $GoogleWorkspaceServerId = $packageId.refine(
  "integrations/google-workspace/server"
);
```

**Verification**: `bun run check --filter @beep/identity`

---

### Step 2: Create Client Package Structure

```bash
mkdir -p packages/integrations/google-workspace/client/src/{services,contracts}
```

**Files to Create**:
1. `packages/integrations/google-workspace/client/package.json` (see pattern above)
2. `packages/integrations/google-workspace/client/tsconfig.json`
3. `packages/integrations/google-workspace/client/tsconfig.src.json`
4. `packages/integrations/google-workspace/client/tsconfig.build.json`

---

### Step 3: Implement Client Services (Context.Tag Interfaces)

Create these files in `packages/integrations/google-workspace/client/src/services/`:

1. **GoogleAuthClient.ts** - OAuth token management interface
2. **GmailClient.ts** - Gmail API client interface (placeholder)
3. **GoogleCalendarClient.ts** - Calendar API client interface (placeholder)
4. **GoogleDriveClient.ts** - Drive API client interface (placeholder)
5. **index.ts** - Barrel export

**Example** (GoogleAuthClient.ts pattern shown above in Critical Patterns)

**Verification**: `bun run check --filter @beep/google-workspace-client`

---

### Step 4: Implement OAuth Contract Schemas

Create `packages/integrations/google-workspace/client/src/contracts/oauth.contracts.ts`:

```typescript
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { $GoogleWorkspaceClientId } from "@beep/identity/packages";

const $I = $GoogleWorkspaceClientId.create("contracts/oauth");

export class OAuthTokenResponse extends S.Class<OAuthTokenResponse>($I`OAuthTokenResponse`)(
  {
    access_token: S.String,
    refresh_token: BS.FieldOptionOmittable(S.String),
    expires_in: S.Number,
    scope: S.String,
    token_type: S.Literal("Bearer"),
  },
  $I.annotations("OAuthTokenResponse", {
    description: "Google OAuth token response from authorization endpoint",
  })
) {}

export class OAuthRefreshResponse extends S.Class<OAuthRefreshResponse>($I`OAuthRefreshResponse`)(
  {
    access_token: S.String,
    expires_in: S.Number,
    scope: S.String,
    token_type: S.Literal("Bearer"),
  },
  $I.annotations("OAuthRefreshResponse", {
    description: "Google OAuth token refresh response",
  })
) {}

export class OAuthErrorResponse extends S.Class<OAuthErrorResponse>($I`OAuthErrorResponse`)(
  {
    error: S.String,
    error_description: BS.FieldOptionOmittable(S.String),
  },
  $I.annotations("OAuthErrorResponse", {
    description: "Google OAuth error response",
  })
) {}
```

Create barrel export: `packages/integrations/google-workspace/client/src/contracts/index.ts`

---

### Step 5: Create Client Package Index

Create `packages/integrations/google-workspace/client/src/index.ts`:

```typescript
// Service interfaces
export * from "./services/index.js";

// Contract schemas
export * from "./contracts/index.js";
```

**Verification**: `bun run check --filter @beep/google-workspace-client`

---

### Step 6: Create Server Package Structure

```bash
mkdir -p packages/integrations/google-workspace/server/src/layers
```

**Files to Create**:
1. `packages/integrations/google-workspace/server/package.json`
2. `packages/integrations/google-workspace/server/tsconfig.json`
3. `packages/integrations/google-workspace/server/tsconfig.src.json`
4. `packages/integrations/google-workspace/server/tsconfig.build.json`

**Server package.json** must include dependencies:
```json
{
  "peerDependencies": {
    "@beep/google-workspace-domain": "workspace:^",
    "@beep/google-workspace-client": "workspace:^",
    "effect": "catalog:"
  }
}
```

---

### Step 7: Implement Server Layers (Placeholder Implementations)

Create these files in `packages/integrations/google-workspace/server/src/layers/`:

1. **GoogleAuthClientLive.ts** - Placeholder implementation (pattern shown above)
2. **GmailClientLive.ts** - Placeholder (optional for P1b)
3. **GoogleCalendarClientLive.ts** - Placeholder (optional for P1b)
4. **GoogleDriveClientLive.ts** - Placeholder (optional for P1b)
5. **index.ts** - Barrel export

**Verification**: `bun run check --filter @beep/google-workspace-server`

---

### Step 8: Create Server Package Index

Create `packages/integrations/google-workspace/server/src/index.ts`:

```typescript
// Layer exports
export * from "./layers/index.js";

// Re-export client types for convenience
export type { GoogleOAuthToken } from "@beep/google-workspace-domain";
export { GoogleAuthClient } from "@beep/google-workspace-client";
```

**Verification**: `bun run check --filter @beep/google-workspace-server`

---

### Step 9: Update Root TypeScript Configuration

Update `tsconfig.base.jsonc` to add path aliases:

```jsonc
{
  "compilerOptions": {
    "paths": {
      // Add these entries:
      "@beep/google-workspace-domain": ["packages/integrations/google-workspace/domain/src/index.ts"],
      "@beep/google-workspace-domain/*": ["packages/integrations/google-workspace/domain/src/*"],
      "@beep/google-workspace-client": ["packages/integrations/google-workspace/client/src/index.ts"],
      "@beep/google-workspace-client/*": ["packages/integrations/google-workspace/client/src/*"],
      "@beep/google-workspace-server": ["packages/integrations/google-workspace/server/src/index.ts"],
      "@beep/google-workspace-server/*": ["packages/integrations/google-workspace/server/src/*"]
    }
  }
}
```

---

### Step 10: Run Workspace Installation

```bash
bun install
```

This will link the new packages in the workspace.

---

### Step 11: Final Verification

```bash
# Verify each package individually
bun run check --filter @beep/google-workspace-domain
bun run check --filter @beep/google-workspace-client
bun run check --filter @beep/google-workspace-server

# Verify lint
bun run lint --filter @beep/google-workspace-*
```

---

## Reference Files

**Domain Package Patterns** (from P1a):
- `packages/integrations/google-workspace/domain/src/errors/auth.errors.ts` - Tagged error pattern
- `packages/integrations/google-workspace/domain/src/scopes/gmail.scopes.ts` - Scope constants pattern
- `packages/integrations/google-workspace/domain/src/models/token.model.ts` - Schema model pattern

**Effect Patterns Documentation**:
- `.claude/rules/effect-patterns.md` - Namespace imports, Effect utilities
- `documentation/patterns/effect-collections.md` - Collection usage patterns

**Existing Service Interfaces** (for reference):
- `packages/shared/integrations/src/google/gmail/common/GmailClient.ts` - Old pattern to migrate from

---

## Success Criteria

Phase 1b is complete when:

- [ ] `@beep/google-workspace-client` package created with correct structure
- [ ] `@beep/google-workspace-server` package created with correct structure
- [ ] Context.Tag interfaces defined for GoogleAuthClient (minimum)
- [ ] OAuth contract schemas defined (OAuthTokenResponse, OAuthRefreshResponse)
- [ ] Placeholder Layer implementations created (GoogleAuthClientLive minimum)
- [ ] Package barrel exports (`index.ts`) created for both packages
- [ ] `tsconfig.base.jsonc` updated with path aliases
- [ ] `bun run check --filter @beep/google-workspace-client` passes
- [ ] `bun run check --filter @beep/google-workspace-server` passes
- [ ] `bun run lint --filter @beep/google-workspace-*` passes
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] HANDOFF_P2.md created (context document)
- [ ] P2_ORCHESTRATOR_PROMPT.md created (copy-paste prompt)

---

## Known Gotchas

1. **Forward References**: Server layer implementation will reference `IntegrationTokenStore` which doesn't exist yet. Use placeholder implementations that fail with descriptive errors.

2. **TypeScript References**: Client package must reference domain package in `tsconfig.src.json`. Server package must reference both client and domain.

3. **BS.FieldOptionOmittable**: OAuth responses from Google use optional fields (not present vs. present with value). Use `BS.FieldOptionOmittable(S.String)` NOT `S.optional(S.String)`.

4. **Layer.succeed vs Layer.effect**: Use `Layer.succeed` for simple placeholder implementations. Use `Layer.effect` when the Layer needs to acquire dependencies or run effects during construction.

5. **Barrel Exports**: ALWAYS create `index.ts` barrel files LAST after all other files are implemented and verified.

---

## Handoff Document

Read full context in: `specs/integration-architecture-migration/handoffs/HANDOFF_P1b.md`

---

## Next Phase

After completing Phase 1b:

1. Update `specs/integration-architecture-migration/REFLECTION_LOG.md` with:
   - Context.Tag interface design patterns discovered
   - OAuth schema challenges encountered
   - Layer composition approach chosen

2. Create `specs/integration-architecture-migration/handoffs/HANDOFF_P2.md` with:
   - Client layer design decisions
   - Forward reference handling approach
   - Phase 2 requirements (IntegrationTokenStore implementation)

3. Create `specs/integration-architecture-migration/handoffs/P2_ORCHESTRATOR_PROMPT.md` for Phase 2 execution

4. Update `specs/integration-architecture-migration/MASTER_ORCHESTRATION.md` to mark Phase 1b complete
