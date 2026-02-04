# Phase 1 Orchestrator: Infrastructure Package Creation

> **Copy-paste this into a fresh Claude session to execute Phase 1**

---

## Context

You are working in the `beep-effect` monorepo, migrating third-party integrations from a single `@beep/shared-integrations` package to a three-tier architecture:

1. **Shared Infrastructure** (`packages/integrations/google-workspace/`) - Core API clients, scopes, errors
2. **IAM Token Storage** (`packages/iam/`) - OAuth token persistence and refresh logic
3. **Slice-Specific Adapters** (per-slice packages) - Feature-specific integration logic

**Current State**: All Google integration code lives in `packages/shared/integrations/src/google/`, mixing concerns (API clients, token management, business logic).

**Phase 1 Goal**: Create the shared infrastructure package with proper three-tier separation.

---

## Objective

Create `packages/integrations/google-workspace/` with three sub-packages following Effect patterns:

### Package Structure

```
packages/integrations/google-workspace/
├── domain/                    # @beep/google-workspace-domain
│   ├── src/
│   │   ├── errors/
│   │   │   ├── auth.errors.ts
│   │   │   ├── api.errors.ts
│   │   │   └── index.ts
│   │   ├── scopes/
│   │   │   ├── gmail.scopes.ts
│   │   │   ├── calendar.scopes.ts
│   │   │   ├── drive.scopes.ts
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   ├── token.model.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   ├── README.md
│   └── AGENTS.md
├── client/                    # @beep/google-workspace-client
│   ├── src/
│   │   ├── services/
│   │   │   ├── GoogleAuthClient.ts
│   │   │   ├── GmailClient.ts
│   │   │   ├── GoogleCalendarClient.ts
│   │   │   ├── GoogleDriveClient.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   ├── README.md
│   └── AGENTS.md
└── server/                    # @beep/google-workspace-server
    ├── src/
    │   ├── layers/
    │   │   ├── GoogleAuthClientLive.ts
    │   │   ├── GmailClientLive.ts
    │   │   ├── GoogleCalendarClientLive.ts
    │   │   ├── GoogleDriveClientLive.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.src.json
    ├── tsconfig.build.json
    ├── README.md
    └── AGENTS.md
```

---

## Key Code Patterns

### 1. Tagged Errors (domain package)

```typescript
// packages/integrations/google-workspace/domain/src/errors/auth.errors.ts
import { $GoogleWorkspaceDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceDomainId.create("errors/auth");

export class GoogleAuthenticationError extends S.TaggedError<GoogleAuthenticationError>()(
  "GoogleAuthenticationError",
  {
    message: S.String,
    suggestion: S.optional(S.String),
  }
) {}

export class GoogleTokenExpiredError extends S.TaggedError<GoogleTokenExpiredError>()(
  "GoogleTokenExpiredError",
  {
    message: S.String,
    expiryDate: S.DateTimeUtc,
  }
) {}

export class GoogleTokenRefreshError extends S.TaggedError<GoogleTokenRefreshError>()(
  "GoogleTokenRefreshError",
  {
    message: S.String,
    originalError: S.optional(S.String),
  }
) {}
```

```typescript
// packages/integrations/google-workspace/domain/src/errors/api.errors.ts
import { $GoogleWorkspaceDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceDomainId.create("errors/api");

export class GoogleApiError extends S.TaggedError<GoogleApiError>()(
  "GoogleApiError",
  {
    message: S.String,
    statusCode: S.Number,
    endpoint: S.String,
  }
) {}

export class GoogleRateLimitError extends S.TaggedError<GoogleRateLimitError>()(
  "GoogleRateLimitError",
  {
    message: S.String,
    retryAfter: S.optional(S.Number),
    endpoint: S.String,
  }
) {}
```

### 2. Scope Constants (domain package)

```typescript
// packages/integrations/google-workspace/domain/src/scopes/gmail.scopes.ts
export const GmailScopes = {
  send: "https://www.googleapis.com/auth/gmail.send",
  read: "https://www.googleapis.com/auth/gmail.readonly",
  modify: "https://www.googleapis.com/auth/gmail.modify",
  labels: "https://www.googleapis.com/auth/gmail.labels",
  compose: "https://www.googleapis.com/auth/gmail.compose",
} as const;

export const GMAIL_REQUIRED_SCOPES = [
  GmailScopes.read,
  GmailScopes.send,
  GmailScopes.modify,
] as const;
```

```typescript
// packages/integrations/google-workspace/domain/src/scopes/calendar.scopes.ts
export const CalendarScopes = {
  calendar: "https://www.googleapis.com/auth/calendar",
  events: "https://www.googleapis.com/auth/calendar.events",
  readonly: "https://www.googleapis.com/auth/calendar.readonly",
} as const;

export const CALENDAR_REQUIRED_SCOPES = [
  CalendarScopes.calendar,
  CalendarScopes.events,
] as const;
```

```typescript
// packages/integrations/google-workspace/domain/src/scopes/drive.scopes.ts
export const DriveScopes = {
  file: "https://www.googleapis.com/auth/drive.file",
  readonly: "https://www.googleapis.com/auth/drive.readonly",
  full: "https://www.googleapis.com/auth/drive",
} as const;

export const DRIVE_REQUIRED_SCOPES = [
  DriveScopes.file,
] as const;
```

### 3. Token Model (domain package)

```typescript
// packages/integrations/google-workspace/domain/src/models/token.model.ts
import { $GoogleWorkspaceDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $GoogleWorkspaceDomainId.create("models/token");

export class GoogleOAuthToken extends S.Class<GoogleOAuthToken>($I`GoogleOAuthToken`)(
  {
    accessToken: S.optionalWith(S.String, {
      as: "Option",
    }).pipe(S.fromKey("access_token")),
    refreshToken: S.optionalWith(S.Redacted(S.String), {
      as: "Option",
    }).pipe(S.fromKey("refresh_token")),
    scope: S.optionalWith(S.String, {
      as: "Option",
    }),
    tokenType: S.optionalWith(S.String, {
      as: "Option",
    }).pipe(S.fromKey("token_type")),
    expiryDate: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, {
      as: "Option",
    }).pipe(S.fromKey("expiry_date")),
  },
  $I.annotations("GoogleOAuthToken", {
    description: "Google OAuth token structure",
  })
) {}
```

### 4. Context.Tag Service Interface (client package)

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

```typescript
// packages/integrations/google-workspace/client/src/services/GmailClient.ts
import type { GoogleApiError, GoogleRateLimitError } from "@beep/google-workspace-domain";
import type { gmail_v1 } from "@googleapis/gmail";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

export class GmailClient extends Context.Tag("GmailClient")<
  GmailClient,
  {
    readonly client: gmail_v1.Gmail;
    readonly sendEmail: (
      payload: { to: string; subject: string; body: string }
    ) => Effect.Effect<void, GoogleApiError | GoogleRateLimitError>;
  }
>() {}
```

### 5. Layer Implementation (server package)

```typescript
// packages/integrations/google-workspace/server/src/layers/GoogleAuthClientLive.ts
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { GoogleAuthenticationError, GoogleTokenRefreshError } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const GoogleAuthClientLive = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (scopes) =>
      Effect.gen(function* () {
        // Implementation will come in later phases
        // For now, return a placeholder
        return yield* Effect.fail(
          new GoogleAuthenticationError({
            message: "Not implemented",
            suggestion: "This will be implemented in Phase 2",
          })
        );
      }),
    refreshToken: (refreshToken) =>
      Effect.gen(function* () {
        return yield* Effect.fail(
          new GoogleTokenRefreshError({
            message: "Not implemented",
          })
        );
      }),
  })
);
```

```typescript
// packages/integrations/google-workspace/server/src/layers/GmailClientLive.ts
import { GmailClient } from "@beep/google-workspace-client";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import { GoogleApiError } from "@beep/google-workspace-domain";
import { google } from "@googleapis/gmail";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const GmailClientLive = Layer.effect(
  GmailClient,
  Effect.gen(function* () {
    const authClient = yield* GoogleAuthClient;

    return GmailClient.of({
      client: google.gmail({ version: "v1", auth: undefined as any }),
      sendEmail: (payload) =>
        Effect.gen(function* () {
          return yield* Effect.fail(
            new GoogleApiError({
              message: "Not implemented",
              statusCode: 501,
              endpoint: "/gmail/v1/users/me/messages/send",
            })
          );
        }),
    });
  })
);
```

---

## Required Package Configurations

### package.json Template

```json
{
  "name": "@beep/google-workspace-domain",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "Google Workspace domain models, errors, and scopes",
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
    "effect": "catalog:"
  },
  "devDependencies": {
    "@beep/identity": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:"
  }
}
```

**Important**: Adjust dependencies per package:
- **domain**: Only needs `@beep/identity`, `@beep/schema`, `effect`
- **client**: Add `@beep/google-workspace-domain`, `@googleapis/gmail` (peerDependencies)
- **server**: Add `@beep/google-workspace-client`, `@beep/google-workspace-domain`, `@googleapis/gmail`

### tsconfig.json Template

```jsonc
{
  "extends": "../../../../tsconfig.base.jsonc",
  "references": [
    { "path": "./tsconfig.src.json" }
  ]
}
```

### tsconfig.src.json Template

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

### tsconfig.build.json Template

```jsonc
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build/esm",
    "declarationDir": "build/dts"
  }
}
```

---

## Identity Package Setup

Before creating the packages, you MUST add package identifiers to `@beep/identity`:

```typescript
// packages/common/identity/src/packages.ts
// Add these entries:

export const $GoogleWorkspaceDomainId = $packageId.refine(
  "integrations/google-workspace/domain"
);

export const $GoogleWorkspaceClientId = $packageId.refine(
  "integrations/google-workspace/client"
);

export const $GoogleWorkspaceServerId = $packageId.refine(
  "integrations/google-workspace/server"
);
```

---

## Step-by-Step Execution Plan

### Step 1: Update Identity Package
1. Read `packages/common/identity/src/packages.ts`
2. Add `$GoogleWorkspaceDomainId`, `$GoogleWorkspaceClientId`, `$GoogleWorkspaceServerId`
3. Verify: `bun run check --filter @beep/identity`

### Step 2: Create Domain Package
1. Create directory structure: `packages/integrations/google-workspace/domain/`
2. Write `package.json`, `tsconfig.json`, `tsconfig.src.json`, `tsconfig.build.json`
3. Create `src/errors/auth.errors.ts` with tagged errors
4. Create `src/errors/api.errors.ts` with API-specific errors
5. Create `src/errors/index.ts` barrel export
6. Create `src/scopes/gmail.scopes.ts`, `calendar.scopes.ts`, `drive.scopes.ts`
7. Create `src/scopes/index.ts` barrel export
8. Create `src/models/token.model.ts`
9. Create `src/models/index.ts` barrel export
10. Create `src/index.ts` main barrel export
11. Verify: `bun run check --filter @beep/google-workspace-domain`

### Step 3: Create Client Package
1. Create directory structure: `packages/integrations/google-workspace/client/`
2. Write `package.json` (add `@beep/google-workspace-domain` dependency)
3. Write tsconfig files with reference to domain package
4. Create `src/services/GoogleAuthClient.ts` Context.Tag
5. Create `src/services/GmailClient.ts` Context.Tag
6. Create `src/services/GoogleCalendarClient.ts` Context.Tag (placeholder)
7. Create `src/services/GoogleDriveClient.ts` Context.Tag (placeholder)
8. Create `src/services/index.ts` barrel export
9. Create `src/index.ts` main barrel export
10. Verify: `bun run check --filter @beep/google-workspace-client`

### Step 4: Create Server Package
1. Create directory structure: `packages/integrations/google-workspace/server/`
2. Write `package.json` (add client + domain dependencies)
3. Write tsconfig files with references to client and domain packages
4. Create `src/layers/GoogleAuthClientLive.ts` placeholder implementation
5. Create `src/layers/GmailClientLive.ts` placeholder implementation
6. Create `src/layers/GoogleCalendarClientLive.ts` placeholder (optional)
7. Create `src/layers/GoogleDriveClientLive.ts` placeholder (optional)
8. Create `src/layers/index.ts` barrel export
9. Create `src/index.ts` main barrel export
10. Verify: `bun run check --filter @beep/google-workspace-server`

### Step 5: Update Root Workspace
1. Read `package.json` at project root
2. Add new packages to workspace if not already auto-detected
3. Run `bun install` to link workspace dependencies

### Step 6: Create Documentation
1. Create `README.md` for each package (domain, client, server)
2. Create `AGENTS.md` for each package
3. Use the documentation writer skill patterns from `.claude/skills/documentation-writer/`

### Step 7: Final Verification
```bash
bun run check --filter @beep/google-workspace-domain
bun run check --filter @beep/google-workspace-client
bun run check --filter @beep/google-workspace-server
bun run lint --filter @beep/google-workspace-*
```

---

## Success Criteria

- [ ] All three packages compile without errors
- [ ] TypeScript references correctly linked (domain → client → server)
- [ ] All barrel exports (`index.ts`) re-export all public APIs
- [ ] Package identifiers registered in `@beep/identity`
- [ ] All errors extend `S.TaggedError`
- [ ] All services use `Context.Tag`
- [ ] All imports use namespace style (`import * as Effect from "effect/Effect"`)
- [ ] Documentation (README.md, AGENTS.md) exists for each package
- [ ] Verification commands pass

---

## Quality Gates

Before marking Phase 1 complete:

1. **Type Safety**: All packages must pass `bun run check`
2. **Lint**: All packages must pass `bun run lint`
3. **Dependencies**: No circular dependencies between packages
4. **Exports**: All intended APIs are re-exported through barrel files
5. **Documentation**: README.md and AGENTS.md exist for each package

---

## Reference Files (Existing Patterns)

If you need to reference existing implementations for patterns:

- **Tagged Errors**: `packages/shared/integrations/src/google/gmail/errors.ts`
- **Scope Constants**: `packages/shared/integrations/src/google/scopes.ts`
- **Context.Tag Services**: `packages/shared/integrations/src/google/gmail/common/GmailClient.ts`
- **Token Models**: `packages/shared/integrations/src/google/scopes.ts` (GoogleOAuthToken)

---

## Next Phase Preview

**Phase 2** will:
- Migrate token storage to IAM layer (`packages/iam/server/src/services/GoogleTokenStore.ts`)
- Implement real `GoogleAuthClientLive` using IAM token store
- Add token refresh logic
- Wire up authentication flow

**Phase 3** will:
- Migrate Gmail-specific actions to slice-specific adapters
- Update imports across codebase
- Remove old `@beep/shared-integrations/google` code

---

## Critical Rules (from CLAUDE.md)

### Effect Patterns (MANDATORY)
- ALWAYS use namespace imports: `import * as Effect from "effect/Effect"`
- NEVER use named imports: `import { Effect } from "effect"` ❌
- ALWAYS use PascalCase Schema constructors: `S.String`, `S.Struct`, `S.Array`
- NEVER use lowercase: `S.string`, `S.struct`, `S.array` ❌
- ALWAYS use Effect utilities instead of native methods:
  - `A.map(array, fn)` NOT `array.map(fn)` ❌
  - `Str.split(string, ",")` NOT `string.split(",")` ❌

### Error Handling
- ALWAYS use `S.TaggedError` for domain errors
- NEVER use `new Error()` or `throw` statements ❌

### File Organization
- ALWAYS use barrel exports (`index.ts`) to re-export public APIs
- ALWAYS use `@beep/*` path aliases, NEVER relative `../../../` paths ❌

---

## Execution

You are now ready to execute Phase 1. Follow the step-by-step plan above, verifying each package as you create it.

When complete:
1. Update `specs/integration-architecture-migration/REFLECTION_LOG.md` with learnings
2. Create `specs/integration-architecture-migration/handoffs/HANDOFF_P2.md` for the next phase
3. Update `specs/integration-architecture-migration/MASTER_ORCHESTRATION.md` to mark Phase 1 complete

**Good luck!** 🚀
