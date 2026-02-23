# Phase 1a Orchestrator: Domain Package Creation

> Copy-paste this into a fresh Claude session to execute Phase 1a

---

## Context

You are working in the `beep-effect` monorepo, migrating Google Workspace integrations from a monolithic `packages/shared/integrations` package to a three-tier architecture. Phase 1a focuses on creating the foundational domain package with error types, scope constants, and token models.

**Project Root**: `/home/elpresidank/YeeBois/projects/beep-effect2`

**Current State**: No integration architecture exists. All Google integration code lives in `packages/shared/integrations/src/google/`, mixing concerns.

**Phase 1a Goal**: Create `packages/integrations/google-workspace/domain/` with clean domain models, ready for Phase 1b (client/server layers).

---

## Objective

Create `@beep/google-workspace-domain` package with:
1. Tagged error types for Google API failures
2. OAuth scope constants for Gmail, Calendar, Drive
3. Token model schemas
4. Package configuration (package.json, tsconfig files)

**Scope Boundary**: ONLY domain layer. NO client or server code. Phase 1b will add those layers.

---

## Package Structure

Create this directory structure:

```
packages/integrations/google-workspace/domain/
├── src/
│   ├── errors/
│   │   ├── auth.errors.ts      # GoogleAuthenticationError, GoogleTokenExpiredError, etc.
│   │   ├── api.errors.ts       # GoogleApiError, GoogleRateLimitError
│   │   └── index.ts            # Barrel export
│   ├── scopes/
│   │   ├── gmail.scopes.ts     # GmailScopes constants
│   │   ├── calendar.scopes.ts  # CalendarScopes constants
│   │   ├── drive.scopes.ts     # DriveScopes constants
│   │   └── index.ts            # Barrel export
│   ├── models/
│   │   ├── token.model.ts      # GoogleOAuthToken schema
│   │   └── index.ts            # Barrel export
│   └── index.ts                # Main barrel export
├── test/                       # Empty for now (P1b will add tests)
├── package.json
├── tsconfig.json
├── tsconfig.src.json
├── tsconfig.build.json
├── README.md                   # Generated via doc-writer skill
└── AGENTS.md                   # Generated via doc-writer skill
```

---

## Implementation Plan

### Step 1: Update Identity Package (REQUIRED FIRST)

Before creating any packages, add package identifiers to `@beep/identity`.

**File**: `packages/common/identity/src/packages.ts`

**Add these exports**:

```typescript
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

**Verify**:
```bash
bun run check --filter @beep/identity
```

---

### Step 2: Create Package Configuration

#### package.json

**File**: `packages/integrations/google-workspace/domain/package.json`

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

#### tsconfig.json

**File**: `packages/integrations/google-workspace/domain/tsconfig.json`

```jsonc
{
  "extends": "../../../../tsconfig.base.jsonc",
  "references": [
    { "path": "./tsconfig.src.json" }
  ]
}
```

#### tsconfig.src.json

**File**: `packages/integrations/google-workspace/domain/tsconfig.src.json`

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

#### tsconfig.build.json

**File**: `packages/integrations/google-workspace/domain/tsconfig.build.json`

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

### Step 3: Implement Tagged Errors

#### Authentication Errors

**File**: `packages/integrations/google-workspace/domain/src/errors/auth.errors.ts`

```typescript
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

export class GoogleScopeExpansionRequiredError extends S.TaggedError<GoogleScopeExpansionRequiredError>()(
  "GoogleScopeExpansionRequiredError",
  {
    message: S.String,
    currentScopes: S.Array(S.String),
    requiredScopes: S.Array(S.String),
    missingScopes: S.Array(S.String),
  }
) {}
```

#### API Errors

**File**: `packages/integrations/google-workspace/domain/src/errors/api.errors.ts`

```typescript
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

#### Errors Barrel Export

**File**: `packages/integrations/google-workspace/domain/src/errors/index.ts`

```typescript
export * from "./auth.errors.js";
export * from "./api.errors.js";
```

---

### Step 4: Implement Scope Constants

#### Gmail Scopes

**File**: `packages/integrations/google-workspace/domain/src/scopes/gmail.scopes.ts`

```typescript
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

#### Calendar Scopes

**File**: `packages/integrations/google-workspace/domain/src/scopes/calendar.scopes.ts`

```typescript
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

#### Drive Scopes

**File**: `packages/integrations/google-workspace/domain/src/scopes/drive.scopes.ts`

```typescript
export const DriveScopes = {
  file: "https://www.googleapis.com/auth/drive.file",
  readonly: "https://www.googleapis.com/auth/drive.readonly",
  full: "https://www.googleapis.com/auth/drive",
} as const;

export const DRIVE_REQUIRED_SCOPES = [
  DriveScopes.file,
] as const;
```

#### Scopes Barrel Export

**File**: `packages/integrations/google-workspace/domain/src/scopes/index.ts`

```typescript
export * from "./gmail.scopes.js";
export * from "./calendar.scopes.js";
export * from "./drive.scopes.js";
```

---

### Step 5: Implement Token Model

**File**: `packages/integrations/google-workspace/domain/src/models/token.model.ts`

```typescript
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

#### Models Barrel Export

**File**: `packages/integrations/google-workspace/domain/src/models/index.ts`

```typescript
export * from "./token.model.js";
```

---

### Step 6: Main Barrel Export

**File**: `packages/integrations/google-workspace/domain/src/index.ts`

```typescript
export * from "./errors/index.js";
export * from "./scopes/index.js";
export * from "./models/index.js";
```

---

### Step 7: Verification

Run verification commands to ensure package compiles:

```bash
# Type check domain package
bun run check --filter @beep/google-workspace-domain

# Lint domain package
bun run lint --filter @beep/google-workspace-domain

# Install dependencies
bun install
```

**Expected Output**: All commands pass with zero errors.

---

### Step 8: Documentation (Optional - Defer to doc-writer)

If time permits, create basic README.md and AGENTS.md following doc-writer patterns from `.claude/skills/documentation-writer/`.

**Minimal README.md**:

```markdown
# @beep/google-workspace-domain

Domain models, error types, and scope constants for Google Workspace integrations.

## Purpose

Provides foundational domain concepts for Google Workspace API integration:
- Tagged error types for type-safe error handling
- OAuth scope constants for Gmail, Calendar, Drive
- Token model schemas

## Key Exports

| Export | Description |
|--------|-------------|
| `GoogleApiError` | Generic Google API failure error |
| `GoogleRateLimitError` | Rate limit exceeded error |
| `GoogleAuthenticationError` | Authentication failure error |
| `GmailScopes` | Gmail OAuth scope constants |
| `CalendarScopes` | Calendar OAuth scope constants |
| `DriveScopes` | Drive OAuth scope constants |
| `GoogleOAuthToken` | Token model schema |

## Usage

```typescript
import * as Effect from "effect/Effect";
import { GoogleApiError, GmailScopes } from "@beep/google-workspace-domain";

const scopes = [GmailScopes.read, GmailScopes.send];

const program = Effect.gen(function* () {
  return yield* Effect.fail(
    new GoogleApiError({
      message: "API request failed",
      statusCode: 500,
      endpoint: "/gmail/v1/users/me/messages",
    })
  );
});
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/identity` | Package identifier system |
| `@beep/schema` | Schema utilities |
| `effect` | Effect runtime |

## Development

```bash
bun run check --filter @beep/google-workspace-domain
bun run lint --filter @beep/google-workspace-domain
```
```

**Minimal AGENTS.md**:

```markdown
# @beep/google-workspace-domain

Domain layer for Google Workspace integration infrastructure.

## Surface Map

| Path | Purpose |
|------|---------|
| `src/errors/` | Tagged error types |
| `src/scopes/` | OAuth scope constants |
| `src/models/` | Token model schemas |
| `src/index.ts` | Public API barrel |

## Key Patterns

```typescript
import { GoogleApiError, GmailScopes } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  return yield* Effect.fail(
    new GoogleApiError({
      message: "Request failed",
      statusCode: 500,
      endpoint: "/api/endpoint",
    })
  );
});
```

## Verification

```bash
bun run check --filter @beep/google-workspace-domain
bun run lint --filter @beep/google-workspace-domain
```

## Guardrails

- All errors extend `S.TaggedError`
- All scope constants use `as const`
- Token model uses `S.Redacted` for sensitive fields
- NO client or server logic (domain layer only)
```

---

## Success Criteria

Phase 1a is complete when:

- [ ] Package structure created (`domain/src/{errors,scopes,models}`)
- [ ] Identity package updated with `$GoogleWorkspaceDomainId`
- [ ] All tagged errors implemented
- [ ] All scope constants implemented
- [ ] Token model implemented
- [ ] All barrel exports created
- [ ] package.json and tsconfig files created
- [ ] `bun run check --filter @beep/google-workspace-domain` passes
- [ ] `bun run lint --filter @beep/google-workspace-domain` passes
- [ ] README.md created (basic or via doc-writer)
- [ ] AGENTS.md created (basic or via doc-writer)

---

## Quality Gates

Before marking Phase 1a complete:

1. **Type Safety**: Domain package must compile with zero errors
2. **Lint**: No biome violations
3. **Exports**: All public APIs re-exported through `src/index.ts`
4. **Documentation**: README.md and AGENTS.md exist (basic versions acceptable)

---

## Critical Rules (from CLAUDE.md)

### Effect Patterns (MANDATORY)

- ALWAYS use namespace imports: `import * as S from "effect/Schema"`
- NEVER use named imports: `import { Schema } from "effect"` (FORBIDDEN)
- ALWAYS use PascalCase Schema constructors: `S.String`, `S.Array`, `S.Class`
- NEVER use lowercase: `S.string`, `S.array`, `S.class` (FORBIDDEN)
- ALWAYS use `S.TaggedError` for domain errors
- NEVER use `new Error()` (FORBIDDEN)

### Schema Patterns

- Use `S.Redacted` for sensitive fields (passwords, tokens)
- Use `S.optional` for optional fields
- Use `S.fromKey` for field name transformations (snake_case ↔ camelCase)
- Use `BS.DateTimeUtcFromAllAcceptable` for flexible DateTime parsing

### File Organization

- ALWAYS use barrel exports (`index.ts`) to re-export public APIs
- ALWAYS use `.js` extensions in imports (TypeScript resolution requirement)
- NEVER use relative `../../../` paths (use `@beep/*` aliases)

---

## Next Phase Preview

**Phase 1b** will:
- Create `client/` package with Context.Tag service interfaces
- Create `server/` package with Layer implementations
- Wire up package references
- Add GoogleAuthClient and GoogleApiClient

See `handoffs/P1b_ORCHESTRATOR_PROMPT.md` (to be created after P1a).

---

## Handoff Checklist

After completing Phase 1a:

1. Update `specs/integration-architecture-migration/REFLECTION_LOG.md` with:
   - What worked well
   - What was challenging
   - Patterns discovered
   - Improvements for Phase 1b

2. Create `specs/integration-architecture-migration/handoffs/HANDOFF_P1b.md` with:
   - Domain layer design decisions
   - Error type patterns used
   - Scope constant structure
   - Token model design
   - Phase 1b requirements

3. Create `specs/integration-architecture-migration/handoffs/P1b_ORCHESTRATOR_PROMPT.md`:
   - Copy-paste prompt for Phase 1b
   - Include client/server layer patterns
   - Reference domain layer exports

4. Update `specs/integration-architecture-migration/MASTER_ORCHESTRATION.md`:
   - Mark Phase 1a as complete
   - Update status for Phase 1b

---

## Execution

You are now ready to execute Phase 1a. Follow the implementation plan step-by-step, verifying each step as you complete it.

When complete, create the handoff documents listed above.

**Good luck!**
