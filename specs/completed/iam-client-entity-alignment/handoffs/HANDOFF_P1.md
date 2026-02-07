# Phase 1 Handoff: Foundation Schemas

---

## Mission
Update `_common/*.schema.ts` files to use branded EntityIds and create transformation schemas where needed.

---

## Working Memory (Current Tasks)

### Task 1.1: Update organization/_common/member.schema.ts
Replace `S.String` with EntityIds for:
- `id` → `IamEntityIds.MemberId`
- `organizationId` → `SharedEntityIds.OrganizationId`
- `userId` → `SharedEntityIds.UserId`

### Task 1.2: Update organization/_common/organization.schema.ts
Replace `S.String` with EntityIds for:
- `id` → `SharedEntityIds.OrganizationId`

### Task 1.3: Update organization/_common/invitation.schema.ts
Replace `S.String` with EntityIds for:
- `id` → `IamEntityIds.InvitationId`
- `organizationId` → `SharedEntityIds.OrganizationId`
- `inviterId` → `SharedEntityIds.UserId`

### Task 1.4: Update two-factor/_common/user.schema.ts (if exists)
Audit and update any ID fields.

### Task 1.5: Update _internal/common.schemas.ts
Audit TeamMember and other internal schemas for ID fields.

### Task 1.6: Create transformation schemas (if needed)
For entities returned by Better Auth that need domain mapping, create transformation schemas following the `DomainUserFromBetterAuthUser` pattern.

---

## Episodic Memory (P0 Summary)

**Prerequisite**: P0 inventory must be complete at `outputs/P0-inventory.md`.

The inventory identifies all files and fields needing updates. Reference it for the complete list.

---

## Semantic Memory (Project Constants)

### Standard Import Block
```typescript
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
```

### Transformation Import Block (when needed)
```typescript
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
```

---

## Critical Patterns

### Schema Field Replacement
```typescript
// Before
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
}) {}

// After
export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,
  organizationId: SharedEntityIds.OrganizationId,
  userId: SharedEntityIds.UserId,
  role: S.String,  // NOT an ID, keep as string
  createdAt: S.DateFromString,
}) {}
```

### EmbeddedUser Pattern
For `EmbeddedUser` in organization.schema.ts, the `id` field is a user ID:
```typescript
export class EmbeddedUser extends S.Class<EmbeddedUser>($I`EmbeddedUser`)({
  id: SharedEntityIds.UserId,
  name: S.String,
  email: S.String,
  image: S.NullOr(S.String),
}) {}
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `outputs/P0-inventory.md` | Complete file/field list |
| `QUICK_START.md` | Before/after examples |
| `packages/iam/client/src/_internal/user.schemas.ts` | Transformation reference |

---

## Success Criteria

- [ ] All `_common/*.schema.ts` files updated
- [ ] All `_internal/*.schemas.ts` files updated
- [ ] Transformation schemas created where needed
- [ ] Type check passes: `bun run check --filter @beep/iam-client`

---

## Verification

```bash
# Type check
bun run check --filter @beep/iam-client

# Verify _common files updated
grep -r ": S.String" packages/iam/client/src/organization/_common/ | grep -iE "(id|Id):"
# Should return empty for ID fields
```

---

## Next Phase
After P1 completion, proceed to P2 (Contract Payloads) using:
`specs/iam-client-entity-alignment/handoffs/P2_ORCHESTRATOR_PROMPT.md`
