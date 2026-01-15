# Better Auth Schema Transformations — Master Orchestration

> Complete workflow for creating Effect Schema transformations from Better Auth entities to domain models.

---

## Critical Orchestration Rules

1. **NEVER guess entity field definitions** — ALWAYS fetch from Better Auth reference docs via Playwright OR read source files
2. **ALWAYS follow the reference implementation** — `BetterAuthUserSchema` and `DomainUserFromBetterAuthUser` in `packages/iam/client/src/v1/_common/user.schemas.ts`
3. **ALWAYS validate ID formats** — Better Auth IDs should match `${table}__${uuid}` pattern
4. **REQUIRED FIELDS MUST FAIL IF MISSING** — Use `require*` helpers that return `ParseResult.Type` failures. NEVER substitute placeholders or defaults for `_rowId`, `version`, `source`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`, or domain-specific fields
5. **RUN VERIFICATION AFTER EACH ENTITY** — `bun run check`, `bun run build`, `bun run lint:fix`
6. **RUN REFLECTION AFTER EACH PHASE** — Document learnings, extract helpers, create handoff
7. **EXTRACT HELPERS WHEN DUPLICATION DETECTED** — Do NOT copy-paste similar code across schemas

---

## Agent Usage (CRITICAL)

The orchestrator **MUST** delegate to specialized agents for specific tasks:

### For Writing Schema Code → `effect-schema-expert` Agent

**When writing `BetterAuth<EntityName>` and `DomainXxxFromBetterAuthXxx` schemas:**

Use the `effect-schema-expert` agent (`.claude/agents/effect-schema-expert.md`) which has:
- Access to Effect docs MCP (`mcp__effect_docs__effect_docs_search`)
- Knowledge of `S.Class`, `S.transformOrFail`, branded types, annotations
- Access to `@beep/schema` patterns (EntityId, StringLiteralKit, etc.)

**Invoke via Task tool:**
```
Task(subagent_type="effect-schema-expert", prompt="Create BetterAuth<EntityName> schema class and DomainXxxFromBetterAuthXxx transformation for <Entity>. Use the reference implementation in common.schemas.ts and follow these field definitions: <fields from research>")
```

### For Research → `Explore` Agent or Playwright

**When gathering Better Auth field definitions:**
- Use Playwright (`browser_snapshot`) to fetch docs from `http://localhost:8080/api/v1/auth/reference#model/<model>`
- Use `Explore` agent to search `tmp/better-auth/packages/` for source schemas

### For Reflection → `reflector` Agent

**After each phase completes:**
- Use the `reflector` agent to analyze what worked, what didn't, and capture learnings
- Update REFLECTION_LOG.md with structured reflection

---

## Pre-Requisites

Before starting any phase:

```bash
# Ensure Better Auth dev server is running for reference docs
cd tmp/better-auth && pnpm dev
# Server should be accessible at http://localhost:8080

# Verify domain models exist
ls packages/shared/domain/src/entities/
ls packages/iam/domain/src/entities/

# Check for existing shared helpers (grows over time)
cat packages/iam/client/src/v1/_common/transformation-helpers.ts 2>/dev/null || echo "No helpers yet"
```

---

## Shared Helpers (Updated Each Phase)

This section documents reusable helper functions extracted from transformation schemas. **Orchestrators MUST read this section before implementing each entity** and use existing helpers where applicable.

### Helper File Location

`packages/iam/client/src/v1/_common/transformation-helpers.ts`

### Available Helpers

*(This section is updated as helpers are extracted.)*

```typescript
// Convert various date formats to JS Date for encode direction
export const toDate = (value: string | number | Date | DateTime.Utc): Date => {
  if (value instanceof Date) return value;
  if (DateTime.isDateTime(value)) return DateTime.toDateUtc(value);
  return new Date(value);
};

// REQUIRED FIELD EXTRACTORS - These FAIL if the field is missing
// Use these for ALL required fields that must be present in Better Auth response

export const requireField = <T extends object>(
  obj: T, key: string, ast: AST.AST
): Effect.Effect<unknown, ParseResult.Type> => { ... };

export const requireNumber = <T extends object>(
  obj: T, key: string, ast: AST.AST
): Effect.Effect<number, ParseResult.Type> => { ... };

export const requireString = <T extends object>(
  obj: T, key: string, ast: AST.AST
): Effect.Effect<string | null, ParseResult.Type> => { ... };

export const requireDate = <T extends object>(
  obj: T, key: string, ast: AST.AST
): Effect.Effect<Date | null, ParseResult.Type> => { ... };

export const requireBoolean = <T extends object>(
  obj: T, key: string, ast: AST.AST
): Effect.Effect<boolean, ParseResult.Type> => { ... };
```

**CRITICAL**: All required fields (`_rowId`, `version`, `source`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`, and domain-specific fields) MUST use `require*` helpers. If a field is missing from the Better Auth response, the transformation FAILS with `ParseResult.Type` - this surfaces configuration errors immediately rather than masking them with placeholders.

**Note**: As each phase completes, new helpers should be added here and documented in REFLECTION_LOG.md.

---

## Reflection Protocol (MANDATORY After Each Phase)

After completing each entity transformation, the orchestrator **MUST** run reflection before handing off to the next phase:

### Step 1: Document Learnings

Update `REFLECTION_LOG.md` with a new section:

```markdown
### Phase N: <EntityName>

#### What Worked Well
- [List specific techniques that succeeded]

#### What Didn't Work
- [List approaches that failed and why]

#### Surprising Findings
- [Unexpected discoveries about the entity or pattern]

#### New Helpers Extracted
- [List any new helpers added to transformation-helpers.ts]

#### Prompt Refinements
- [Changes to apply to MASTER_ORCHESTRATION for future phases]
```

### Step 2: Extract Helpers

If ANY of these conditions are true, extract a helper:
- Same code block appears in 2+ transformation schemas
- Same validation logic appears in 2+ places
- Same field coercion pattern appears in 2+ places

### Step 3: Update MASTER_ORCHESTRATION

Add new helpers to the "Shared Helpers" section above.

### Step 4: Create Handoff Document

Create `handoffs/HANDOFF_P<N+1>.md` containing:
- Summary of completed entity
- Issues encountered
- New helpers available
- Refined prompt for next entity

---

## Entity Phases (20 Remaining After User)

### Phase 1: Session
**Docs**: http://localhost:8080/api/v1/auth/reference#model/session
**Source**: `tmp/better-auth/packages/core/src/db/schema/session.ts`
**Target**: `packages/iam/client/src/v1/_common/session.schemas.ts`
**Domain**: `@beep/shared-domain/entities/Session`

### Phase 2: Account
**Docs**: http://localhost:8080/api/v1/auth/reference#model/account
**Source**: `tmp/better-auth/packages/core/src/db/schema/account.ts`
**Target**: `packages/iam/client/src/v1/_common/account.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Account`

### Phase 3: Verification
**Docs**: http://localhost:8080/api/v1/auth/reference#model/verification
**Source**: `tmp/better-auth/packages/core/src/db/schema/verification.ts`
**Target**: `packages/iam/client/src/v1/_common/verification.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Verification`

### Phase 4: RateLimit
**Docs**: *(not in reference docs — use source only)*
**Source**: `tmp/better-auth/packages/core/src/db/schema/rate-limit.ts`
**Target**: `packages/iam/client/src/v1/_common/rate-limit.schemas.ts`
**Domain**: `@beep/iam-domain/entities/RateLimit`

### Phase 5: TwoFactor
**Docs**: http://localhost:8080/api/v1/auth/reference#model/twofactor
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts`
**Target**: `packages/iam/client/src/v1/_common/two-factor.schemas.ts`
**Domain**: `@beep/iam-domain/entities/TwoFactor`
**Note**: Has `returned: false` fields — NEVER include those in client schemas

### Phase 6: WalletAddress
**Docs**: http://localhost:8080/api/v1/auth/reference#model/walletaddress
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/_common/wallet-address.schemas.ts`
**Domain**: `@beep/iam-domain/entities/WalletAddress`

### Phase 7: SsoProvider
**Docs**: http://localhost:8080/api/v1/auth/reference#model/ssoprovider
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/_common/sso-provider.schemas.ts`
**Domain**: `@beep/iam-domain/entities/SsoProvider`

### Phase 8: Passkey
**Docs**: http://localhost:8080/api/v1/auth/reference#model/passkey
**Source**: `tmp/better-auth/packages/passkey/src/schema.ts`
**Target**: `packages/iam/client/src/v1/passkey/passkey.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Passkey`

### Phase 9: Organization
**Docs**: http://localhost:8080/api/v1/auth/reference#model/organization
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`
**Target**: `packages/iam/client/src/v1/organization/organization.schemas.ts`
**Domain**: `@beep/shared-domain/entities/Organization`

### Phase 10: OrganizationRole
**Docs**: http://localhost:8080/api/v1/auth/reference#model/organizationrole
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`
**Target**: `packages/iam/client/src/v1/organization/organization-role.schemas.ts`
**Domain**: `@beep/iam-domain/entities/OrganizationRole`

### Phase 11: Team
**Docs**: http://localhost:8080/api/v1/auth/reference#model/team
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`
**Target**: `packages/iam/client/src/v1/organization/team.schemas.ts`
**Domain**: `@beep/shared-domain/entities/Team`

### Phase 12: TeamMember
**Docs**: http://localhost:8080/api/v1/auth/reference#model/teammember
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`
**Target**: `packages/iam/client/src/v1/organization/team-member.schemas.ts`
**Domain**: `@beep/iam-domain/entities/TeamMember`

### Phase 13: Member
**Docs**: http://localhost:8080/api/v1/auth/reference#model/member
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`
**Target**: `packages/iam/client/src/v1/organization/member.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Member`

### Phase 14: Invitation
**Docs**: http://localhost:8080/api/v1/auth/reference#model/invitation
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`
**Target**: `packages/iam/client/src/v1/organization/invitation.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Invitation`

### Phase 15: OauthApplication
**Docs**: http://localhost:8080/api/v1/auth/reference#model/oauthapplication
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/oauth/oauth-application.schemas.ts`
**Domain**: `@beep/iam-domain/entities/OauthApplication`

### Phase 16: OauthAccessToken
**Docs**: http://localhost:8080/api/v1/auth/reference#model/oauthaccesstoken
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/oauth/oauth-access-token.schemas.ts`
**Domain**: `@beep/iam-domain/entities/OauthAccessToken`

### Phase 17: OauthConsent
**Docs**: http://localhost:8080/api/v1/auth/reference#model/oauthconsent
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/oauth/oauth-consent.schemas.ts`
**Domain**: `@beep/iam-domain/entities/OauthConsent`

### Phase 18: Jwks
**Docs**: http://localhost:8080/api/v1/auth/reference#model/jwks
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/_common/jwks.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Jwks`

### Phase 19: DeviceCode
**Docs**: http://localhost:8080/api/v1/auth/reference#model/devicecode
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/_common/device-code.schemas.ts`
**Domain**: `@beep/iam-domain/entities/DeviceCode`

### Phase 20: Apikey
**Docs**: http://localhost:8080/api/v1/auth/reference#model/apikey
**Source**: `tmp/better-auth/packages/better-auth/src/plugins/*/schema.ts`
**Target**: `packages/iam/client/src/v1/_common/apikey.schemas.ts`
**Domain**: `@beep/iam-domain/entities/Apikey`

---

## Verification Protocol

After EACH entity transformation is complete:

```bash
# Type checking
bun run check --filter=@beep/iam-client

# Build
bun run build --filter=@beep/iam-client

# Lint and fix
bun run lint:fix --filter=@beep/iam-client

# If errors occur, iterate until all pass
```

---

## Common Patterns & Gotchas

### ID Format Validation

All Better Auth IDs in this codebase follow the pattern `${table}__${uuid}` because Better Auth is configured with `generateId: false` and our database generates IDs via `EntityId.publicId()`.

```typescript
const isValidId = SharedEntityIds.<EntityId>.is(ba.id);
if (!isValidId) {
  return yield* ParseResult.fail(
    new ParseResult.Type(ast, ba.id, `Invalid ID format`)
  );
}
```

### Required Fields Must Be Present

All required fields (including `_rowId`, `version`, audit fields) MUST be present in the Better Auth response. If missing, the transformation fails:

```typescript
// Use require* helpers - they FAIL if the field is missing
const _rowId = yield* requireNumber(betterAuthEntity, "_rowId", ast);
const version = yield* requireNumber(betterAuthEntity, "version", ast);
const source = yield* requireString(betterAuthEntity, "source", ast);
// ... etc for all required fields
```

**NEVER** substitute placeholder values like `-1` for missing fields. If Better Auth isn't returning required fields, that's a configuration error that must be surfaced.

### Nullable vs Optional

Better Auth uses Zod's `.nullish()` which means `null | undefined`. Effect Schema uses:

```typescript
// For nullable fields
S.optionalWith(S.String, { nullable: true })
```

### Date Handling

Better Auth returns JavaScript `Date` objects. Our domain models use `DateTime.Utc`. The transformation should pass the raw `Date` and let the domain model's schema handle conversion:

```typescript
createdAt: ba.createdAt, // Pass as Date, Model handles conversion
```

### Sensitive Fields

Some fields like `password`, `accessToken`, `refreshToken` map to `Redacted<T>` types. Pass raw strings and let the domain model transform:

```typescript
password: ba.password, // Domain model wraps in Redacted
```

### Reading Better Auth Source Files

When reading schema definitions from `tmp/better-auth/packages/` programmatically:

```typescript
import { FileSystem } from "@effect/platform";
import * as Effect from "effect/Effect";

const readSchemaFile = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(
    "tmp/better-auth/packages/core/src/db/schema/session.ts"
  );
  return content;
});
```

**CRITICAL**: NEVER use Node.js `fs` module. ALWAYS use Effect FileSystem service from `@effect/platform`. See `.claude/rules/effect-patterns.md` for full FileSystem patterns.

---

## Handoff Protocol (After EACH Phase)

After completing each entity phase, the orchestrator **MUST**:

### Step 1: Run Reflection
Use the `reflector` agent to capture learnings and update `REFLECTION_LOG.md`.

### Step 2: Extract Helpers (If Duplication Detected)
If any code patterns were duplicated from previous phases:
1. Create/update `packages/iam/client/src/v1/_common/transformation-helpers.ts`
2. Document new helpers in the "Shared Helpers" section of this file
3. Refactor existing schemas to use the new helper

### Step 3: Create Handoff Document
Create `handoffs/HANDOFF_P<N+1>.md` containing:

```markdown
# Handoff: Phase N → Phase N+1

## Completed Entity
- Entity: <name>
- Files created: <list>
- Helpers used: <list>
- Helpers extracted: <list>

## Issues Encountered
- <issue 1>
- <issue 2>

## New Patterns Discovered
- <pattern>

## Available Shared Helpers
Reference: `packages/iam/client/src/v1/_common/transformation-helpers.ts`
- `toDate()` — Convert DateTime/string/number to Date for encode direction
- `requireField()` — Require any field, FAIL if missing
- `requireNumber()` — Require number field, FAIL if missing
- `requireString()` — Require string field, FAIL if missing (returns string | null)
- `requireDate()` — Require date field, FAIL if missing (returns Date | null)
- `requireBoolean()` — Require boolean field, FAIL if missing
- <new helpers from this phase>

## Prompt Refinements for Next Phase
- <refinement>

## Next Entity
- Entity: <next entity name>
- Docs: <URL>
- Source: <file path>
- Domain: <package>
```

### Step 4: Create Next Orchestrator Prompt
Create `handoffs/P<N+1>_ORCHESTRATOR_PROMPT.md` with ready-to-execute instructions for the next entity, including references to available helpers.

---

## Reference Implementation

The completed `DomainUserFromBetterAuthUser` in `packages/iam/client/src/v1/_common/user.schemas.ts` serves as the reference. Key patterns:

1. Schema uses `F.pipe(S.Struct({fields}), S.extend(S.Record({...})))` to allow unknown properties
2. Transformation uses `S.transformOrFail(Source, Target, { strict: true, decode, encode })`
3. Decode returns Encoded form with explicit type annotation (NO type assertions, NO ParseResult calls)
4. Encode returns plain object matching source's Type form
5. Both use `Effect.gen(function* () { ... })` for effectful validation

**CRITICAL**: The `transformOrFail.decode` callback must return `Effect<Target.Encoded, ParseIssue, R>` when `strict: true`. Just return the raw encoded object - do NOT call `ParseResult.decode()` or `new Model({...})`.

---

## Better Auth Schema Pattern (MANDATORY)

### Why Struct+Record Instead of S.Class

Better Auth client methods return additional fields beyond what's typed (e.g., `activeTeamId`, `impersonatedBy`, `_rowId` from plugins). Using `S.Class` with strict fields would:
1. Reject unknown properties during decoding
2. Not match the actual runtime shape of Better Auth responses

### Correct Pattern: Struct with Index Signature

```typescript
import * as S from "effect/Schema";
import * as F from "effect/Function";

/**
 * Schema for Better Auth entity with index signature for unknown properties.
 * This allows capturing known fields while accepting extra plugin-added fields.
 */
export const BetterAuthEntitySchema = F.pipe(
  S.Struct({
    // Known fields with proper types
    id: S.String,
    createdAt: S.Date,
    updatedAt: S.Date,
    // ... other known fields
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown }))
);

// Type helpers
export type BetterAuthEntity = S.Schema.Type<typeof BetterAuthEntitySchema>;
export type BetterAuthEntityEncoded = S.Schema.Encoded<typeof BetterAuthEntitySchema>;
```

### Creating Instances for Encode Direction

When encoding back to Better Auth format, create a plain object that matches the struct:

```typescript
encode: (domainEncoded, _options, _ast) =>
  Effect.gen(function* () {
    return {
      id: domainEncoded.id ?? SharedEntityIds.EntityId.create(),
      createdAt: toDate(domainEncoded.createdAt),
      updatedAt: toDate(domainEncoded.updatedAt),
      // ... other fields
    };
  }),
```

### Checking for Optional Properties

With the index signature, you can check if plugin-added properties exist:

```typescript
decode: (betterAuthEntity, _options, ast) =>
  Effect.gen(function* () {
    // Check for plugin-added field
    const activeTeamId = "activeTeamId" in betterAuthEntity
      ? betterAuthEntity.activeTeamId
      : null;

    // Or use optional chaining for nested unknown access
    const unknownField = (betterAuthEntity as Record<string, unknown>).someField;

    // ... continue transformation
  }),
```

### Decode Without Type Assertions (CRITICAL)

**IMPORTANT**: With `strict: true`, the `transformOrFail.decode` callback must return `Effect<Target.Encoded, ParseIssue, R>`, NOT `Effect<Target.Type, ParseIssue, R>`. The schema framework internally decodes the Encoded form to Type after your callback returns.

Use explicit type annotations instead of type assertions:

```typescript
// Type alias for proper typing without assertions
type TargetModelEncoded = S.Schema.Encoded<typeof Target.Model>;

decode: (betterAuthEntity, _options, ast) =>
  Effect.gen(function* () {
    // Validate IDs...

    // REQUIRED FIELDS - Must be present, FAIL if missing
    const _rowId = yield* requireNumber(betterAuthEntity, "_rowId", ast);
    const version = yield* requireNumber(betterAuthEntity, "version", ast);
    const source = yield* requireString(betterAuthEntity, "source", ast);
    const deletedAt = yield* requireDate(betterAuthEntity, "deletedAt", ast);
    const createdBy = yield* requireString(betterAuthEntity, "createdBy", ast);
    const updatedBy = yield* requireString(betterAuthEntity, "updatedBy", ast);
    const deletedBy = yield* requireString(betterAuthEntity, "deletedBy", ast);

    // Construct the ENCODED form with EXPLICIT TYPE ANNOTATION
    const encodedData: TargetModelEncoded = {
      id: betterAuthEntity.id,
      _rowId,
      version,
      createdAt: betterAuthEntity.createdAt,  // Pass Date as-is
      updatedAt: betterAuthEntity.updatedAt,
      source,
      deletedAt,
      createdBy,
      updatedBy,
      deletedBy,
      // ... other fields with their Encoded types
    };

    // JUST RETURN the encoded object - do NOT call ParseResult.decode!
    return encodedData;
  }),
```

**DO NOT** call `ParseResult.decode()` or `ParseResult.encode()` at the end of the decode callback.
**DO NOT** use `new Model({...})` in the decode callback.
**DO NOT** use type assertions like `as S.Schema.Encoded<typeof Model>`.

The pattern is:
1. Construct a plain object with the Encoded form values
2. Add explicit type annotation to ensure TypeScript validates it
3. Return the object directly
