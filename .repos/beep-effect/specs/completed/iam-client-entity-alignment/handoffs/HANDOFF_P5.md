# Phase 5 Handoff: Domain Model Alignment & Transformation Schema Completion

---

## Mission

Complete the alignment between `@beep/iam-client` schemas and domain models. Address gaps in transformation schema coverage, branded type usage for semantic string fields, and test coverage for EntityId validation.

---

## Previous Phase Summary

**P4 Completed** (2026-01-22):
- Verified all ID fields in contract payloads and success schemas use branded EntityIds
- Fixed 64+ occurrences of plain string IDs in contracts
- Documented 10 intentional S.String exceptions (external provider IDs, W3C WebAuthn, RFC 7517)
- Added inline comments explaining exceptions
- Type check and lint pass

**See**: `REFLECTION_LOG.md` Phase 4 section for complete learnings.

---

## Gap Analysis

### Category 1: Missing Transformation Schemas

Transformation schemas (`Domain*FromBetterAuth*`) exist for:
- User (DomainUserFromBetterAuthUser)
- Session (DomainSessionFromBetterAuthSession)
- Member (DomainMemberFromBetterAuthMember)
- Organization (DomainOrganizationFromBetterAuthOrganization)
- Invitation (DomainInvitationFromBetterAuthInvitation)

**MISSING transformation schemas:**

| Entity | _internal Schema | Domain Model Exists? | Action Required |
|--------|------------------|---------------------|-----------------|
| Team | `_internal/team.schemas.ts` Team | Check `@beep/shared-domain/entities` | Create transformation if domain model exists |
| TeamMember | `_internal/team.schemas.ts` TeamMember | Check `@beep/iam-domain/entities` | Create transformation if domain model exists |
| ApiKey | `_internal/api-key.schemas.ts` ApiKey | Check `@beep/iam-domain/entities` | Create transformation if domain model exists |
| OrganizationRole | `_internal/role.schemas.ts` OrganizationRole | Check `@beep/iam-domain/entities` | Create transformation if domain model exists |

### Category 2: Semantic String Fields (role, status, etc.)

Several schemas use `S.String` for semantic fields that have branded domain types:

| Field | Current | Domain Type | Affected Files |
|-------|---------|-------------|----------------|
| `role` (member role) | `S.String` | `Member.MemberRole` | organization/_common/member.schema.ts, _internal/role.schemas.ts |
| `role` (invitation role) | `S.String` | Should use literal union or branded type | organization/_common/invitation.schema.ts |
| `role` (org role name) | `S.String` | Consider `OrganizationRoleName` branded type | organization/create-role, update-role |

**Note**: The transformation schemas already validate these via `S.decodeUnknownEither(Member.MemberRole)`, but the client-facing schemas don't enforce the constraint at schema level.

### Category 3: Contract-to-Domain Alignment

Many contracts use `_internal` schemas directly in Success responses instead of domain-aligned types:

| Contract | Success Schema | Should Use |
|----------|----------------|------------|
| `api-key/create/contract.ts` | `Common.ApiKeyWithKey` | Domain transformation if model exists |
| `api-key/get/contract.ts` | `Common.ApiKey` | Domain transformation if model exists |
| `organization/create-team/contract.ts` | `Common.Team` | Domain transformation if model exists |
| `organization/list-teams/contract.ts` | `S.Array(Common.Team)` | Domain transformation if model exists |
| `organization/update-role/contract.ts` | `Common.OrganizationRole` | Domain transformation if model exists |

### Category 4: Test Coverage Gap

Per REFLECTION_LOG.md P4 recommendations:
- No automated tests verifying EntityId transformation schemas
- No runtime validation tests for branded EntityIds
- CI verification would catch future regressions

---

## Working Memory (Current Tasks)

### Task 5.1: Audit Domain Models

Determine which domain models exist:

```bash
# Check for Team domain model
ls packages/shared/domain/src/entities/Team/ 2>/dev/null || echo "Not found in shared-domain"
ls packages/iam/domain/src/entities/Team/ 2>/dev/null || echo "Not found in iam-domain"

# Check for ApiKey domain model
ls packages/iam/domain/src/entities/ApiKey/ 2>/dev/null || echo "ApiKey not found"

# Check for OrganizationRole domain model
ls packages/iam/domain/src/entities/OrganizationRole/ 2>/dev/null || echo "OrganizationRole not found"
```

### Task 5.2: Create Missing Transformation Schemas

For each entity with a domain model, create transformation schema in `_internal/`:

**Pattern** (from existing `user.schemas.ts`):

```typescript
export const DomainTeamFromBetterAuthTeam = S.transformOrFail(
  BetterAuthTeamSchema,
  Team.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthTeam, _options, ast) {
      // Validate branded ID format
      const isValidTeamId = SharedEntityIds.TeamId.is(betterAuthTeam.id);
      if (!isValidTeamId) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, betterAuthTeam, `Invalid team ID format`)
        );
      }
      // ... map fields to encoded form
    }),
    encode: Effect.fn(function* (team, _options, _ast) {
      // ... reverse mapping
    }),
  }
);
```

### Task 5.3: Add MemberRole to Client Schemas (Optional)

Consider updating `organization/_common/member.schema.ts` to use domain branded types:

```typescript
// Current
role: S.String,

// Option A: Import domain type
import * as Member from "@beep/iam-domain/entities/member";
role: Member.MemberRole,

// Option B: Define literal union locally
role: S.Literal("admin", "member", "owner"),
```

**Trade-off**: Option A couples client to domain; Option B duplicates literals. Recommendation: Keep S.String in client schemas since transformation schemas already validate.

### Task 5.4: Create Transformation Schema Tests

Create test file: `packages/iam/client/test/_internal/transformation.test.ts`

Test requirements:
1. Valid Better Auth response decodes to domain model
2. Invalid ID format fails with ParseResult.Type error
3. Missing required fields fail with descriptive errors
4. Round-trip encode/decode preserves data

**Example test structure:**

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { DomainUserFromBetterAuthUser, BetterAuthUserSchema } from "@beep/iam-client/_internal";

effect("DomainUserFromBetterAuthUser - valid response decodes", () =>
  Effect.gen(function* () {
    const validResponse = {
      id: "shared_user__12345678-1234-1234-1234-123456789012",
      // ... all required fields
    };
    const result = yield* S.decode(DomainUserFromBetterAuthUser)(validResponse);
    strictEqual(result.id, validResponse.id);
  })
);

effect("DomainUserFromBetterAuthUser - invalid ID fails", () =>
  Effect.gen(function* () {
    const invalidResponse = {
      id: "invalid-id-format", // Missing prefix
      // ... other fields
    };
    const result = yield* Effect.either(S.decode(DomainUserFromBetterAuthUser)(invalidResponse));
    strictEqual(result._tag, "Left");
  })
);
```

### Task 5.5: Update AGENTS.md with Transformation Patterns

Add section to `packages/iam/client/AGENTS.md`:

```markdown
## Transformation Schema Coverage

| Entity | Better Auth Schema | Transformation | Domain Model |
|--------|-------------------|----------------|--------------|
| User | BetterAuthUserSchema | DomainUserFromBetterAuthUser | User.Model |
| Session | BetterAuthSessionSchema | DomainSessionFromBetterAuthSession | Session.Model |
| Member | BetterAuthMemberSchema | DomainMemberFromBetterAuthMember | Member.Model |
| Organization | BetterAuthOrganizationSchema | DomainOrganizationFromBetterAuthOrganization | Organization.Model |
| Invitation | BetterAuthInvitationSchema | DomainInvitationFromBetterAuthInvitation | Invitation.Model |
| Team | Team (direct) | *None* | *None* |
| ApiKey | ApiKey (direct) | *None* | *None* |

**Note**: Team and ApiKey use direct schemas with branded EntityIds but no transformation to domain models because domain models don't exist for these entities.
```

---

## Episodic Memory (Previous Phases)

| Phase | Summary |
|-------|---------|
| P0 | Created inventory: 64+ files with plain string IDs |
| P1 | Updated `_common/` schemas with EntityIds |
| P2 | Updated all `Payload` classes with EntityIds and type casts |
| P3 | Verified/updated `Success` classes |
| P4 | Full verification, documented exceptions, updated REFLECTION_LOG |

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `packages/iam/client/src/_internal/user.schemas.ts` | Canonical transformation pattern |
| `packages/iam/domain/src/entities/member/member.model.ts` | Domain model with branded types |
| `.claude/rules/effect-patterns.md` | EntityId and Schema requirements |
| `REFLECTION_LOG.md` | Previous phase learnings |

---

## Success Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| Domain models audited | All 4 entities checked | Manual check in domain packages |
| Transformation schemas | Created where domain models exist | File exists |
| Tests | Transformation schema tests pass | `bun run test --filter @beep/iam-client` |
| Documentation | AGENTS.md updated | Manual review |
| Type check | 0 errors | `bun run check --filter @beep/iam-client` |

---

## Decision Points

### Decision 5.1: Create Domain Models or Accept Direct Schemas?

**Context**: Team, ApiKey, OrganizationRole may not have domain models in `@beep/iam-domain`.

**Options**:
1. **Create domain models** in `@beep/iam-domain` for full alignment
2. **Accept direct schemas** with branded EntityIds as sufficient
3. **Defer** to future spec focusing on domain model creation

**Recommendation**: Option 2 for now. The client schemas already use branded EntityIds. Creating domain models is a larger scope change that should be a separate spec.

### Decision 5.2: Add MemberRole to Client Schema Fields?

**Context**: `role: S.String` vs `role: Member.MemberRole`

**Options**:
1. **Keep S.String** in client schemas, rely on transformation validation
2. **Use domain branded type** directly in client schemas

**Recommendation**: Option 1. Client schemas should be more permissive; transformation schemas validate. Avoids coupling client package to domain package internals.

---

## Estimated Effort

| Task | Complexity | Est. Tool Calls |
|------|------------|-----------------|
| 5.1 Audit domain models | Low | 5-10 |
| 5.2 Create transformations (if needed) | Medium-High | 20-40 per entity |
| 5.3 MemberRole decision | Decision only | 0 |
| 5.4 Create tests | Medium | 30-50 |
| 5.5 Update documentation | Low | 5-10 |

**Total**: 1-2 sessions depending on how many domain models exist.

---

## Known Gotchas

1. **Better Auth returns JS Date objects**: Use `S.DateFromSelf` in BetterAuth schemas, NOT `S.DateFromString`
2. **Transformation returns encoded form**: The decode function returns `ModelEncoded`, not `Model.Type`
3. **Effect.fn for spans**: Use `Effect.fn(function* (...) {})` pattern for proper span generation
4. **requireField helpers**: Use existing helpers from `transformation-helpers.ts` for required field extraction
