# Better Auth Schema Transformations — Phase 1 Orchestrator Prompt

> Execute Phase 1: Session Entity

---

## Critical Rules

1. **NEVER write schema code directly** — ALWAYS delegate to `effect-schema-expert` agent
2. **NEVER guess entity field definitions** — ALWAYS fetch from Better Auth reference docs via Playwright
3. **FOLLOW the reference implementation** — `DomainUserFromBetterAuthUser` in `common.schemas.ts`
4. **RUN VERIFICATION after implementation** — All checks must pass before reflection
5. **RUN REFLECTION after completion** — Use `reflector` agent to capture learnings
6. **EXTRACT HELPERS if duplication detected** — Do NOT copy-paste similar code

---

## Context from Phase 0

The User entity transformation has been completed as a reference implementation:
- File: `packages/iam/client/src/v1/_common/common.schemas.ts`
- Contains: `BetterAuthUser` and `DomainUserFromBetterAuthUser`

Key learnings applied:
- `transformOrFail.decode` returns encoded form (`S.Schema.Encoded<typeof Model>`)
- ID validation uses `SharedEntityIds.<EntityId>.is()`
- Placeholder `-1` for `_rowId` field
- `?? null` for nullable fields going into domain model

---

## Agent Delegation Protocol

### For Schema Code → `effect-schema-expert`
```
Task(subagent_type="effect-schema-expert", prompt="...")
```

### For Research → Playwright or `Explore`
```
mcp__playwright__browser_navigate({ url: "http://localhost:8080/api/v1/auth/reference#model/session" })
mcp__playwright__browser_snapshot()
```

### For Reflection → `reflector`
```
Task(subagent_type="reflector", prompt="...")
```

---

## Phase 1 Task: Session Entity

### Step 1.1: Research Session Schema

Use Playwright browser automation:

1. Navigate to `http://localhost:8080/api/v1/auth/reference#model/session`
2. Take snapshot to extract field definitions
3. Also read source at `tmp/better-auth/packages/core/src/db/schema/session.ts`

**Expected fields:**
- id, userId, expiresAt, token, ipAddress, userAgent, createdAt, updatedAt
- Plus organization plugin fields: activeOrganizationId, activeTeamId (if enabled)

### Step 1.2: Locate Domain Model

Read `packages/shared/domain/src/entities/Session/Session.model.ts` to understand:
- All required fields
- Default values from `makeFields`
- Any custom transformations (DateTime.Utc, Redacted, etc.)

### Step 1.3: Check for Existing Helpers

Read reference implementation for patterns to reuse:
```
packages/iam/client/src/v1/_common/common.schemas.ts
```

Note any helper patterns from User that apply to Session.

### Step 1.4: Create Schema File (Delegate to effect-schema-expert)

Invoke the `effect-schema-expert` agent with:
```
Create BetterAuthSession schema and DomainSessionFromBetterAuthSession transformation.

Target file: packages/iam/client/src/v1/_common/session.schemas.ts

Session fields from research:
<paste field definitions here>

Domain model location:
@beep/shared-domain/entities/Session

## CRITICAL PATTERNS

### 1. Use Struct+Record (NOT S.Class) for Better Auth Schemas

Better Auth returns additional fields beyond TypeScript types. Use Struct with index signature:

```typescript
import * as F from "effect/Function";

export const BetterAuthSessionSchema = F.pipe(
  S.Struct({
    id: S.String,
    createdAt: S.Date,
    updatedAt: S.Date,
    userId: S.String,
    expiresAt: S.Date,
    token: S.String,
    ipAddress: S.optionalWith(S.String, { nullable: true }),
    userAgent: S.optionalWith(S.String, { nullable: true }),
    activeOrganizationId: S.optionalWith(S.String, { nullable: true }),
    activeTeamId: S.optionalWith(S.String, { nullable: true }),
    impersonatedBy: S.optionalWith(S.String, { nullable: true }),
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown }))
);

export type BetterAuthSession = S.Schema.Type<typeof BetterAuthSessionSchema>;
```

### 2. Required Fields MUST Fail if Missing

Use `require*` helpers that FAIL with `ParseResult.Type` if fields are missing:

```typescript
// REQUIRED FIELDS - Must be present, FAIL if missing
const _rowId = yield* requireNumber(betterAuthSession, "_rowId", ast);
const version = yield* requireNumber(betterAuthSession, "version", ast);
const source = yield* requireString(betterAuthSession, "source", ast);
const deletedAt = yield* requireDate(betterAuthSession, "deletedAt", ast);
const createdBy = yield* requireString(betterAuthSession, "createdBy", ast);
const updatedBy = yield* requireString(betterAuthSession, "updatedBy", ast);
const deletedBy = yield* requireString(betterAuthSession, "deletedBy", ast);

const encodedSession: SessionModelEncoded = {
  id: betterAuthSession.id,
  _rowId,
  version,
  // ... other fields
};
return encodedSession;  // Just return the object
```

### 3. Use Shared Helpers

Import from transformation-helpers.ts:
- `requireNumber()`, `requireString()`, `requireDate()`, `requireBoolean()` for required field validation
- `toDate()` for Date conversion in encode direction

### 4. Validate IDs

Use SharedEntityIds.<EntityId>.is() for validation.
```

### Step 1.5: Export and Verify

1. Add export to `packages/iam/client/src/v1/_common/index.ts`
2. Run verification:
   ```bash
   bun run check --filter=@beep/iam-client
   bun run build --filter=@beep/iam-client
   bun run lint:fix --filter=@beep/iam-client
   ```

### Step 1.6: Run Reflection (MANDATORY)

Invoke the `reflector` agent:
```
Reflect on Phase 1 (Session) of the Better Auth Schema Transformations spec.

Review:
1. What worked well during Session implementation?
2. What didn't work or required iteration?
3. Any surprising findings about the Session entity or transformation pattern?
4. Are there any code patterns that should be extracted as shared helpers?
5. Any prompt refinements needed for Phase 2 (Account)?

Update REFLECTION_LOG.md with structured reflection following the Phase N template.
```

### Step 1.7: Check for Helper Extraction

If ANY of these are true, extract a helper:
- Same code block appeared in User AND Session schemas
- Same validation logic duplicated
- Same field coercion pattern duplicated

If helpers extracted:
1. Create `packages/iam/client/src/v1/_common/transformation-helpers.ts`
2. Update MASTER_ORCHESTRATION.md "Shared Helpers" section

### Step 1.8: Create Handoff for Phase 2

Create `handoffs/HANDOFF_P2.md` with:
- Summary of Session completion
- Issues encountered
- Helpers available (from User + Session)
- Prompt refinements for Account entity

Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` with ready-to-execute instructions for Account entity.

---

## Success Criteria for Phase 1

- [ ] `BetterAuthSession` schema class created
- [ ] `DomainSessionFromBetterAuthSession` transformation working
- [ ] Exported from `packages/iam/client/src/v1/_common/index.ts`
- [ ] All `bun run check/build/lint:fix` pass
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] Helpers extracted if duplication detected
- [ ] HANDOFF_P2.md created
- [ ] P2_ORCHESTRATOR_PROMPT.md created

---

## Verification Commands

```bash
# After implementation
bun run check --filter=@beep/iam-client
bun run build --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client

# Final comprehensive check
bun run check && bun run build && bun run lint:fix
```

---

## Notes for Executing Agent

1. **Playwright URL**: Better Auth docs at `http://localhost:8080` — verify server is running
2. **Organization plugin**: Session may have extra fields — check domain model includes them
3. **Delegate schema code**: Use `effect-schema-expert` agent, do NOT write schema code directly
4. **Reflection is mandatory**: Do NOT skip Step 1.6
5. **Helper extraction**: If you copy-paste code from User, STOP and extract a helper instead
