# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 (Foundation Schemas) of the `iam-client-entity-alignment` spec.

### Context

Phase 0 created an inventory at `specs/iam-client-entity-alignment/outputs/P0-inventory.md`. Now we update the foundation schemas in `_common/` and `_internal/` directories.

### Your Mission

1. **Update organization/_common/ schemas**:
   - `member.schema.ts` - Member, FullMember classes
   - `organization.schema.ts` - Organization, EmbeddedUser classes
   - `invitation.schema.ts` - Invitation class

2. **Update two-factor/_common/ schemas** (if present)

3. **Update _internal/ schemas**:
   - `common.schemas.ts` - TeamMember and other internal schemas

4. **Verify changes compile**:
   ```bash
   bun run check --filter @beep/iam-client
   ```

### Critical Pattern

```typescript
// Add import
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

// Replace ID fields
export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,              // was S.String
  organizationId: SharedEntityIds.OrganizationId, // was S.String
  userId: SharedEntityIds.UserId,         // was S.String
  role: S.String,                         // KEEP - not an ID
  createdAt: S.DateFromString,
}) {}
```

### ID Mapping Reference

| Field | EntityId |
|-------|----------|
| `id` (member) | `IamEntityIds.MemberId` |
| `id` (invitation) | `IamEntityIds.InvitationId` |
| `id` (organization) | `SharedEntityIds.OrganizationId` |
| `id` (user/EmbeddedUser) | `SharedEntityIds.UserId` |
| `organizationId` | `SharedEntityIds.OrganizationId` |
| `userId` | `SharedEntityIds.UserId` |
| `inviterId` | `SharedEntityIds.UserId` |

### Success Criteria

- [ ] All `_common/*.schema.ts` files updated
- [ ] All `_internal/*.schemas.ts` files audited
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] No `S.String` for ID fields in updated files

### Handoff Document

Read full context in: `specs/iam-client-entity-alignment/handoffs/HANDOFF_P1.md`
