# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 (Contract Payloads) of the `iam-client-entity-alignment` spec.

### Context

P0 created the inventory. P1 updated foundation schemas in `_common/` and `_internal/`. Now we update all `Payload` classes in contract files.

### Your Mission

1. **Find all contract files** with Payload classes that have ID fields:
   ```bash
   grep -r "class Payload" packages/iam/client/src/ -l
   ```

2. **Update each Payload class** to use branded EntityIds

3. **Update formValuesAnnotation** with type assertions

4. **Verify changes compile**:
   ```bash
   bun run check --filter @beep/iam-client
   ```

### Critical Pattern

```typescript
// Add import at top of file
import { SharedEntityIds } from "@beep/shared-domain";

// Update Payload class
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId,           // was S.String
    userId: SharedEntityIds.UserId,           // was S.String
  },
  formValuesAnnotation({
    teamId: "" as SharedEntityIds.TeamId.Type,   // Add type assertion
    userId: "" as SharedEntityIds.UserId.Type,   // Add type assertion
  })
) {}
```

### Field Mapping

| Field | EntityId |
|-------|----------|
| `organizationId` | `SharedEntityIds.OrganizationId` |
| `userId` | `SharedEntityIds.UserId` |
| `teamId` | `SharedEntityIds.TeamId` |
| `memberId` | `IamEntityIds.MemberId` |
| `invitationId` | `IamEntityIds.InvitationId` |
| `sessionId` | `SharedEntityIds.SessionId` |

### DO NOT change these fields
- `email`, `name`, `role`, `slug` - These are not IDs

### Success Criteria

- [ ] All Payload classes with ID fields updated
- [ ] formValuesAnnotation has type assertions
- [ ] Type check passes
- [ ] No `S.String` for ID fields in Payload classes

### Handoff Document

Read full context in: `specs/iam-client-entity-alignment/handoffs/HANDOFF_P2.md`
