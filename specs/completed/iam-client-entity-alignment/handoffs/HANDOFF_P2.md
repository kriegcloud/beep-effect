# Phase 2 Handoff: Contract Payloads

---

## Mission
Update all `Payload` classes in `*/contract.ts` files to use branded EntityIds for input fields.

---

## Working Memory (Current Tasks)

### Task 2.1: Organization Contracts
Update Payload classes in:
- `organization/add-team-member/contract.ts`
- `organization/remove-team-member/contract.ts`
- `organization/create/contract.ts`
- `organization/update/contract.ts`
- `organization/delete/contract.ts`
- `organization/set-active/contract.ts`
- `organization/members/*/contract.ts`
- `organization/invitations/*/contract.ts`

### Task 2.2: Multi-Session Contracts
Update Payload classes in:
- `multi-session/revoke/contract.ts`
- `multi-session/set-active/contract.ts`

### Task 2.3: Admin Contracts (if present)
Update Payload classes in:
- `admin/*/contract.ts`

### Task 2.4: API Key Contracts (if present)
Update Payload classes in:
- `api-key/*/contract.ts`

### Task 2.5: OAuth2 Contracts (if present)
Update Payload classes in:
- `oauth2/*/contract.ts`

---

## Episodic Memory (Previous Phases)

**P0**: Created inventory at `outputs/P0-inventory.md`
**P1**: Updated `_common/` and `_internal/` schemas with EntityIds

Foundation schemas now use branded types. Contract payloads must align.

---

## Semantic Memory (Project Constants)

### Standard Import Addition
```typescript
import { SharedEntityIds } from "@beep/shared-domain";
// or
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
```

---

## Critical Patterns

### Payload with formValuesAnnotation
```typescript
// Before
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: S.String,
    userId: S.String,
  },
  formValuesAnnotation({
    teamId: "",
    userId: "",
  })
) {}

// After
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    teamId: SharedEntityIds.TeamId,
    userId: SharedEntityIds.UserId,
  },
  formValuesAnnotation({
    teamId: "" as SharedEntityIds.TeamId.Type,
    userId: "" as SharedEntityIds.UserId.Type,
  })
) {}
```

### Why Type Assertions in formValuesAnnotation
The `formValuesAnnotation` provides default values for forms. Empty strings are valid defaults that will be replaced by user input. The type assertion ensures TypeScript accepts the empty string as a branded type.

### Payload WITHOUT formValuesAnnotation
Some payloads don't have form defaults. Simply replace the type:
```typescript
export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```

---

## Field Mapping Reference

| Payload Field | EntityId Type |
|---------------|---------------|
| `organizationId` | `SharedEntityIds.OrganizationId` |
| `userId` | `SharedEntityIds.UserId` |
| `teamId` | `SharedEntityIds.TeamId` |
| `memberId` | `IamEntityIds.MemberId` |
| `invitationId` | `IamEntityIds.InvitationId` |
| `sessionId` | `SharedEntityIds.SessionId` |

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `outputs/P0-inventory.md` | Complete contract file list |
| `QUICK_START.md` | Payload pattern example |

---

## Success Criteria

- [ ] All `*/contract.ts` Payload classes updated
- [ ] formValuesAnnotation updated with type assertions
- [ ] Type check passes: `bun run check --filter @beep/iam-client`

---

## Verification

```bash
# Type check
bun run check --filter @beep/iam-client

# Find remaining plain string IDs in Payloads
grep -r "class Payload" packages/iam/client/src/ -A 10 | grep ": S.String" | grep -iE "(id|Id)"
# Should return empty
```

---

## Next Phase
After P2 completion, proceed to P3 (Contract Success Schemas) using:
`specs/iam-client-entity-alignment/handoffs/P3_ORCHESTRATOR_PROMPT.md`
