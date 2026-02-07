# Handoff P1a: Domain Package Creation

> **Quick Start:** [QUICK_START.md](../QUICK_START.md)

---

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working Memory | 1,500 tokens | ~1,450 | OK |
| Episodic Memory | 800 tokens | ~750 | OK |
| Semantic Memory | 400 tokens | ~380 | OK |
| Procedural Memory | 300 tokens | ~200 | OK |
| **Total** | **3,000 tokens** | **~2,780** | **OK** |

---

## Working Memory (Current Phase)

### Phase 1a Goal

Create the `@beep/google-workspace-domain` package containing error schemas, scope constants, and token models.

### Deliverables

1. **Package Structure**:
   - `packages/integrations/google-workspace/domain/` directory
   - `package.json` with correct dependencies
   - `tsconfig.json` extending `@beep/tsconfig/base.json`
   - `src/index.ts` barrel export

2. **Error Classes** (`src/errors/`):
   - `GoogleApiError.ts` - Generic Google API errors
   - `RateLimitError.ts` - Rate limit exceeded with retry-after metadata
   - `TokenError.ts` - Expired/invalid OAuth tokens
   - `ScopeExpansionRequired.ts` - Missing OAuth scopes for requested operation

3. **Scope Constants** (`src/scopes.ts`):
   - `GmailScopes` - Gmail API scope URLs
   - `CalendarScopes` - Google Calendar API scope URLs
   - `SCOPE_DESCRIPTIONS` - Human-readable scope descriptions

4. **Token Models** (`src/models/`):
   - `GoogleTokens.ts` - OAuth token schema (access token, refresh token, expiry)
   - `GoogleUserInfo.ts` - User profile from OAuth response

### Success Criteria

- [ ] Package compiles without errors (`bun run check --filter @beep/google-workspace-domain`)
- [ ] Exports are clean: `@beep/google-workspace-domain` imports work
- [ ] All error classes extend `S.TaggedError<T>()("ErrorName", {...})` pattern
- [ ] Scope constants are strongly typed with `as const` assertion
- [ ] Token models use Effect Schema with proper date handling (`S.DateFromString` for wire format)
- [ ] tsconfig path alias added to `tsconfig.base.jsonc`
- [ ] Package appears in `bun.lock` after `bun install`

### Blocking Issues

None identified. Phase 0 architecture decisions are complete.

### Key Constraints

1. **Effect Schema Only**:
   - ALL schemas MUST use `import * as S from "effect/Schema"`
   - NO plain TypeScript interfaces for runtime data
   - Use `S.TaggedError` for all error classes

2. **No Dependencies on Client/Server Packages**:
   - Domain package is the foundation
   - CANNOT import from `@beep/google-workspace-client` or `@beep/google-workspace-server`
   - Only depend on Effect core packages and `@beep/common-schema`

3. **Scope Constants Are Data, Not Logic**:
   - Scopes are simple string constants
   - NO business logic in domain package
   - Scope selection happens in client/server layers

4. **Token Models Use Wire Format**:
   - OAuth responses come as JSON with ISO date strings
   - Use `S.DateFromString` for expiry timestamps
   - Use `S.Redacted(S.String)` for sensitive tokens (access_token, refresh_token)

### Implementation Order

1. Create `packages/integrations/google-workspace/domain/` directory
2. Create `package.json` with Effect dependencies
3. Create `tsconfig.json` extending base config
4. Create error classes in `src/errors/`
5. Create scope constants in `src/scopes.ts`
6. Create token models in `src/models/`
7. Create `src/index.ts` barrel export
8. Add tsconfig path alias to `tsconfig.base.jsonc`
9. Run `bun install` and verify package appears in lockfile
10. Run `bun run check --filter @beep/google-workspace-domain`

---

## Episodic Memory (Previous Context)

### Phase 0 Summary

**Completed:**
- README.md documenting three-tier architecture
- MASTER_ORCHESTRATION.md with execution guide
- AGENT_PROMPTS.md with copy-paste prompts
- QUICK_START.md for fast onboarding

**Architectural Decisions Made:**

1. **Three-Tier Pattern**:
   - Tier 1: Shared infrastructure (`packages/integrations/google-workspace/`)
   - Tier 2: Slice adapters (`packages/{slice}/server/adapters/`)
   - Tier 3: IAM-owned token storage (`IntegrationTokenStore` in `@beep/iam-server`)

2. **Domain Layer Role**:
   - Owns error schemas shared across all tiers
   - Owns scope constants for OAuth flows
   - Owns token models for OAuth responses
   - NO business logic - pure data definitions

3. **Scope Management Strategy**:
   - Base scopes defined in domain layer as constants
   - Incremental authorization via `ScopeExpansionRequired` error
   - Slice adapters declare their required scopes
   - IAM manages consolidated scope list per user

4. **Token Security**:
   - Access tokens and refresh tokens MUST be `S.Redacted(S.String)`
   - Never log token values
   - Expiry timestamps use `S.DateFromString` for JSON compatibility

### Existing Code to Reference

- `packages/iam/domain/src/entities/account/account.model.ts` - OAuth token fields pattern
- `packages/shared/domain/src/errors/` - Tagged error class examples
- `packages/common/schema/src/core/` - Schema composition patterns

### Known Issues

None at this stage. Domain package is pure data definitions with no external API dependencies.

---

## Semantic Memory (Project Constants)

### File Locations

| Item | Path |
|------|------|
| Domain package root | `packages/integrations/google-workspace/domain/` |
| Error classes | `packages/integrations/google-workspace/domain/src/errors/` |
| Scope constants | `packages/integrations/google-workspace/domain/src/scopes.ts` |
| Token models | `packages/integrations/google-workspace/domain/src/models/GoogleTokens.ts` |
| User info model | `packages/integrations/google-workspace/domain/src/models/GoogleUserInfo.ts` |
| Barrel export | `packages/integrations/google-workspace/domain/src/index.ts` |

### Error Class Template

```typescript
// packages/integrations/google-workspace/domain/src/errors/GoogleApiError.ts
import * as S from "effect/Schema";

export class GoogleApiError extends S.TaggedError<GoogleApiError>()(
  "GoogleApiError",
  {
    message: S.String,
    statusCode: S.Number,
    endpoint: S.optional(S.String),
    requestId: S.optional(S.String),
  }
) {}
```

### Scope Constants Template

```typescript
// packages/integrations/google-workspace/domain/src/scopes.ts

export const GmailScopes = {
  READONLY: "https://www.googleapis.com/auth/gmail.readonly",
  SEND: "https://www.googleapis.com/auth/gmail.send",
  MODIFY: "https://www.googleapis.com/auth/gmail.modify",
  COMPOSE: "https://www.googleapis.com/auth/gmail.compose",
  METADATA: "https://www.googleapis.com/auth/gmail.metadata",
} as const;

export const CalendarScopes = {
  READONLY: "https://www.googleapis.com/auth/calendar.readonly",
  EVENTS: "https://www.googleapis.com/auth/calendar.events",
} as const;

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
  [GmailScopes.READONLY]: "Read all Gmail messages",
  [GmailScopes.SEND]: "Send email on your behalf",
  [GmailScopes.MODIFY]: "Modify Gmail messages (labels, archive)",
  [GmailScopes.COMPOSE]: "Create draft messages",
  [GmailScopes.METADATA]: "View email metadata only",
  [CalendarScopes.READONLY]: "View calendar events",
  [CalendarScopes.EVENTS]: "Create and edit calendar events",
};
```

### Token Model Template

```typescript
// packages/integrations/google-workspace/domain/src/models/GoogleTokens.ts
import * as S from "effect/Schema";

export class GoogleTokens extends S.Class<GoogleTokens>("GoogleTokens")({
  accessToken: S.Redacted(S.String),  // Never logged
  refreshToken: S.Redacted(S.String), // Never logged
  expiresAt: S.DateFromString,        // ISO 8601 from OAuth response
  scopes: S.Array(S.String),          // Granted scopes
}) {}

export const GoogleTokensFromOAuth = S.transform(
  S.Struct({
    access_token: S.String,
    refresh_token: S.String,
    expires_in: S.Number,  // Seconds from now
    scope: S.String,       // Space-separated scope list
  }),
  GoogleTokens,
  {
    strict: true,
    decode: (oauth) => ({
      accessToken: oauth.access_token,
      refreshToken: oauth.refresh_token,
      expiresAt: new Date(Date.now() + oauth.expires_in * 1000).toISOString(),
      scopes: oauth.scope.split(" "),
    }),
    encode: (tokens) => {
      throw new Error("Encoding not supported for OAuth response");
    },
  }
);
```

---

## Procedural Memory (Reference Links)

### Effect Patterns (MANDATORY)

- `.claude/rules/effect-patterns.md` - Effect patterns, import conventions, NEVER patterns
- `documentation/patterns/effect-collections.md` - Effect collections migration guide

### Existing Code References

- `packages/iam/domain/src/entities/account/account.model.ts` - OAuth token field patterns
- `packages/shared/domain/src/errors/` - Tagged error class examples
- `packages/common/schema/src/core/` - Schema composition patterns

### Package Structure References

- `documentation/PACKAGE_STRUCTURE.md` - Package layout conventions
- `tsconfig.base.jsonc` - Path alias registration

---

## Verification Tables

### Code Quality Checks

| Check | Command | Expected |
|-------|---------|----------|
| Type check domain | `bun run check --filter @beep/google-workspace-domain` | No errors |
| Lint | `bun run lint --filter @beep/google-workspace-domain` | No errors |
| Lockfile updated | `grep "google-workspace-domain" bun.lock` | Package present |
| Imports work | Try importing from `@beep/google-workspace-domain` in another package | Resolves correctly |

### Output Verification

| Criterion | How to Verify |
|-----------|---------------|
| Package compiles | No TypeScript errors in verification commands |
| Exports work | Can import error classes, scope constants, token models |
| Tagged errors | All errors extend `S.TaggedError` and compile |
| Scope constants | Constants have `as const` assertion for type safety |
| Token models | `GoogleTokens` uses `S.Redacted` for sensitive fields |
| Path aliases | tsconfig.base.jsonc includes `@beep/google-workspace-domain` path |

### Package Structure Validation

The domain package MUST have:
- [ ] `package.json` with correct name (`@beep/google-workspace-domain`), version, dependencies
- [ ] `tsconfig.json` extending `@beep/tsconfig/base.json`
- [ ] `src/index.ts` exporting all public API (errors, scopes, models)
- [ ] Clean imports (ONLY from `effect/*`, `@beep/common-schema`)
- [ ] NO imports from client or server packages (domain is foundation)

---

## Handoff to Phase 1b

After completing Phase 1a:

1. **Update REFLECTION_LOG.md**:
   - Document any issues encountered during domain package creation
   - Note patterns that worked well (TaggedError, scope constants)
   - Capture learnings about token model schema design

2. **Create outputs/phase1a-structure.md**:
   - Document final domain package structure
   - List all exported error types, scope constants, token models
   - Include import examples for downstream consumers

3. **Proceed to Phase 1b: Client/Server Packages**:
   - Create `@beep/google-workspace-client` package (Context.Tag interfaces)
   - Create `@beep/google-workspace-server` package (Layer implementations)
   - Both packages will depend on the domain package created in Phase 1a

4. **Blocking Check**:
   - Phase 1b requires Phase 1a domain package to compile successfully
   - All verification commands MUST pass before proceeding
   - Ensure `@beep/google-workspace-domain` is importable from other packages
