# IAM Client Entity Alignment Spec

> Align `@beep/iam-client` Better Auth client wrappers with repository standards by replacing plain `S.String` ID fields with branded EntityId types and adding transformation schemas.

---

## Problem Statement

The `specs/better-auth-client-wrappers` implementation violates canonical repository standards:

1. **All ID fields use plain `S.String`** instead of branded EntityId types from `@beep/shared-domain/entity-ids`
2. **No transformation from Better Auth response types** to domain entities from `@beep/iam-domain/entities`
3. **Contract Payload schemas also use plain strings** for ID inputs instead of branded types

### Current State (Wrong)

```typescript
// packages/iam/client/src/organization/_common/member.schema.ts
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,           // Should be IamEntityIds.MemberId
  organizationId: S.String, // Should be SharedEntityIds.OrganizationId
  userId: S.String,         // Should be SharedEntityIds.UserId
  role: S.String,
  createdAt: S.DateFromString,
}) {}
```

### Target State (Correct)

See `packages/iam/client/src/_internal/user.schemas.ts` for the canonical `DomainUserFromBetterAuthUser` pattern.

---

## Success Criteria

| Metric | Target | Verification Command |
|--------|--------|----------------------|
| ID fields using EntityIds | 100% | `grep -r ": S.String" packages/iam/client/src/ \| grep -iE "(id\|Id):" \| wc -l` = 0 |
| Type errors | 0 | `bun run check --filter @beep/iam-client` |
| Lint errors | 0 | `bun run lint --filter @beep/iam-client` |
| Transformation schemas | All entity types returned by Better Auth | Manual review |

---

## Phase Overview

| Phase | Scope | Work Items | Quality Gate |
|-------|-------|------------|--------------|
| P0 | Inventory | Exhaustive catalog of all files/fields needing updates | `outputs/P0-inventory.md` complete |
| P1 | Foundation Schemas | Update `_common/*.schema.ts`, create transformation schemas | `bun run check --filter @beep/iam-client` |
| P2 | Contract Payloads | Update all `Payload` classes with branded EntityIds | `bun run check --filter @beep/iam-client` |
| P3 | Contract Success | Update `Success` classes to use transformed domain types | `bun run check --filter @beep/iam-client` |
| P4 | Verification | Full verification, lint, grep validation | All success criteria pass |

---

## Key Files

### Reference Patterns (Study First)
- `packages/iam/client/src/_internal/user.schemas.ts` - `DomainUserFromBetterAuthUser` transformation
- `packages/iam/domain/src/entities/member/member.model.ts` - Domain entity with proper EntityIds

### EntityId Sources
- `packages/shared/domain/src/entity-ids/shared/ids.ts` - `UserId`, `OrganizationId`, `TeamId`, `SessionId`
- `packages/shared/domain/src/entity-ids/iam/ids.ts` - `MemberId`, `InvitationId`, `ApiKeyId`, `TeamMemberId`, etc.

### Target Files (To Be Modified)
- `packages/iam/client/src/_common/*.schema.ts`
- `packages/iam/client/src/_internal/*.schemas.ts`
- `packages/iam/client/src/*/contract.ts`

---

## Quick Start

```bash
# Start with P0 to create inventory
# Copy prompt from: specs/iam-client-entity-alignment/handoffs/P0_ORCHESTRATOR_PROMPT.md

# After each phase, verify with:
bun run check --filter @beep/iam-client
bun run lint --filter @beep/iam-client
```

---

## Related Documentation

- [Spec Guide](../specs/_guide/README.md)
- [Effect Patterns](../../.claude/rules/effect-patterns.md)
- [IAM Client AGENTS.md](../../packages/iam/client/CLAUDE.md)
- [Shared Domain AGENTS.md](../../packages/shared/domain/CLAUDE.md)
