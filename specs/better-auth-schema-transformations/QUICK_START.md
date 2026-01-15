# Better Auth Schema Transformations — Quick Start

> 5-minute guide to start implementing Better Auth to domain model transformations.

---

## Prerequisites

1. Better Auth dev server running at `http://localhost:8080`
2. Understanding of Effect Schema basics
3. Access to reference implementation in `common.schemas.ts`
4. Knowledge of `effect-schema-expert` agent for schema code

---

## TL;DR

For each Better Auth entity (one phase per entity):

1. **Research** — Playwright to `http://localhost:8080/api/v1/auth/reference#model/<name>`
2. **Delegate** — Use `effect-schema-expert` agent to write schema code
3. **Verify** — `bun run check && bun run build && bun run lint:fix`
4. **Reflect** — Use `reflector` agent to capture learnings
5. **Handoff** — Create handoff documents for next phase

---

## Agent Delegation (CRITICAL)

**NEVER write schema code directly.** ALWAYS delegate to specialized agents:

| Task | Agent | How |
|------|-------|-----|
| Schema code | `effect-schema-expert` | `Task(subagent_type="effect-schema-expert", prompt="...")` |
| Reflection | `reflector` | `Task(subagent_type="reflector", prompt="...")` |
| Code search | `Explore` | `Task(subagent_type="Explore", prompt="...")` |

---

## Reference Implementation

The User entity transformation is complete at:
```
packages/iam/client/src/v1/_common/user.schemas.ts
```

Key patterns to follow:
- `BetterAuthUserSchema` — Schema class with Better Auth fields
- `DomainUserFromBetterAuthUser` — Transformation schema

---

## Critical Patterns

### 1. Required Fields MUST Use require* Helpers

All required fields (`_rowId`, `version`, `source`, audit fields, domain fields) MUST use `require*` helpers that FAIL if missing:

```typescript
decode: (ba, _options, ast) =>
  Effect.gen(function* () {
    // REQUIRED FIELDS - FAIL if missing from Better Auth response
    const _rowId = yield* requireNumber(ba, "_rowId", ast);
    const version = yield* requireNumber(ba, "version", ast);
    const source = yield* requireString(ba, "source", ast);
    const deletedAt = yield* requireDate(ba, "deletedAt", ast);
    const createdBy = yield* requireString(ba, "createdBy", ast);
    const updatedBy = yield* requireString(ba, "updatedBy", ast);
    const deletedBy = yield* requireString(ba, "deletedBy", ast);

    // Return encoded representation with validated fields
    const encoded: TargetModelEncoded = {
      id: ba.id,
      _rowId,
      version,
      source,
      deletedAt,
      createdBy,
      updatedBy,
      deletedBy,
      // ... other fields
    };
    return encoded;
  }),
```

**NEVER** use placeholders like `_rowId: -1` or default values for required fields. If Better Auth doesn't return them, the transformation should FAIL.

### 2. Validate ID Format

```typescript
const isValidId = SharedEntityIds.<EntityId>.is(ba.id);
if (!isValidId) {
  return yield* ParseResult.fail(
    new ParseResult.Type(ast, ba.id, `Invalid ID format`)
  );
}
```

### 3. Handle Nullable Fields

```typescript
// Decode: Better Auth → Domain (use null)
field: ba.field ?? null,

// Encode: Domain → Better Auth (use undefined)
field: domainField ?? undefined,
```

### 4. Extract Helpers When Duplication Detected

If same code appears in 2+ schemas, extract to:
```
packages/iam/client/src/v1/_common/transformation-helpers.ts
```

---

## Entity List (20 Remaining)

| Phase | Entity | Docs URL |
|-------|--------|----------|
| 1 | Session | [session](http://localhost:8080/api/v1/auth/reference#model/session) |
| 2 | Account | [account](http://localhost:8080/api/v1/auth/reference#model/account) |
| 3 | Verification | [verification](http://localhost:8080/api/v1/auth/reference#model/verification) |
| 4 | RateLimit | *(source only)* |
| 5 | TwoFactor | [twofactor](http://localhost:8080/api/v1/auth/reference#model/twofactor) |
| 6 | WalletAddress | [walletaddress](http://localhost:8080/api/v1/auth/reference#model/walletaddress) |
| 7 | SsoProvider | [ssoprovider](http://localhost:8080/api/v1/auth/reference#model/ssoprovider) |
| 8 | Passkey | [passkey](http://localhost:8080/api/v1/auth/reference#model/passkey) |
| 9 | Organization | [organization](http://localhost:8080/api/v1/auth/reference#model/organization) |
| 10 | OrganizationRole | [organizationrole](http://localhost:8080/api/v1/auth/reference#model/organizationrole) |
| 11 | Team | [team](http://localhost:8080/api/v1/auth/reference#model/team) |
| 12 | TeamMember | [teammember](http://localhost:8080/api/v1/auth/reference#model/teammember) |
| 13 | Member | [member](http://localhost:8080/api/v1/auth/reference#model/member) |
| 14 | Invitation | [invitation](http://localhost:8080/api/v1/auth/reference#model/invitation) |
| 15 | OauthApplication | [oauthapplication](http://localhost:8080/api/v1/auth/reference#model/oauthapplication) |
| 16 | OauthAccessToken | [oauthaccesstoken](http://localhost:8080/api/v1/auth/reference#model/oauthaccesstoken) |
| 17 | OauthConsent | [oauthconsent](http://localhost:8080/api/v1/auth/reference#model/oauthconsent) |
| 18 | Jwks | [jwks](http://localhost:8080/api/v1/auth/reference#model/jwks) |
| 19 | DeviceCode | [devicecode](http://localhost:8080/api/v1/auth/reference#model/devicecode) |
| 20 | Apikey | [apikey](http://localhost:8080/api/v1/auth/reference#model/apikey) |

---

## Start Here

Begin with Phase 1 (Session):

```bash
# Read P1 orchestrator prompt
cat specs/better-auth-schema-transformations/handoffs/P1_ORCHESTRATOR_PROMPT.md

# Follow steps 1.1-1.8 sequentially
# Each phase ends with reflection + handoff
```

---

## Per-Phase Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Research entity via Playwright                       │
│    → http://localhost:8080/api/v1/auth/reference#model/ │
├─────────────────────────────────────────────────────────┤
│ 2. Check existing helpers                               │
│    → transformation-helpers.ts                          │
├─────────────────────────────────────────────────────────┤
│ 3. Delegate to effect-schema-expert                     │
│    → Task(subagent_type="effect-schema-expert", ...)    │
├─────────────────────────────────────────────────────────┤
│ 4. Verify                                               │
│    → bun run check/build/lint:fix                       │
├─────────────────────────────────────────────────────────┤
│ 5. Reflect (MANDATORY)                                  │
│    → Task(subagent_type="reflector", ...)               │
├─────────────────────────────────────────────────────────┤
│ 6. Extract helpers if duplication detected              │
│    → Update transformation-helpers.ts                   │
├─────────────────────────────────────────────────────────┤
│ 7. Create handoff for next phase                        │
│    → HANDOFF_P<N+1>.md + P<N+1>_ORCHESTRATOR_PROMPT.md  │
└─────────────────────────────────────────────────────────┘
```

---

## Verification

After each entity:

```bash
bun run check --filter=@beep/iam-client
bun run build --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client
```

---

## Files to Create Per Phase

Each entity needs:
- `packages/iam/client/src/v1/_common/<entity>.schemas.ts` — Schema file
- Export in `packages/iam/client/src/v1/_common/index.ts`
- Entry in `REFLECTION_LOG.md` with learnings
- `handoffs/HANDOFF_P<N+1>.md` — Handoff to next phase
- `handoffs/P<N+1>_ORCHESTRATOR_PROMPT.md` — Next phase instructions
