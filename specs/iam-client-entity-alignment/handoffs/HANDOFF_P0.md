# Phase 0 Handoff: Inventory & Analysis

---

## Mission
Create an exhaustive inventory of ALL files and fields in `packages/iam/client/src/` that need EntityId alignment.

---

## Working Memory (Current Tasks)

### Task 0.1: Enumerate Schema Files
Scan all directories in `packages/iam/client/src/` for:
- `_common/*.schema.ts` files
- `_internal/*.schemas.ts` files
- `*/contract.ts` files

### Task 0.2: Document Each File
For each file found, record:
1. Exact file path
2. Schema class names (e.g., `Member`, `Payload`, `Success`)
3. Each field currently using `S.String` that represents an ID
4. The correct EntityId type to use
5. Whether a transformation schema is needed

### Task 0.3: Categorize Files
Group files by type:
- **Common schemas**: Shared entity schemas used across contracts
- **Internal schemas**: Utility schemas in `_internal/`
- **Contract payloads**: `Payload` classes that accept ID inputs
- **Contract success**: `Success` classes that return entities

---

## Episodic Memory (Previous Context)

### Problem Discovery
Analysis of `specs/better-auth-client-wrappers` revealed:
- All ID fields use plain `S.String`
- No transformation from Better Auth response types
- Violates repository standards for branded EntityIds

### Reference Pattern Found
`packages/iam/client/src/_internal/user.schemas.ts` contains:
- `BetterAuthUserSchema` - captures raw Better Auth response
- `DomainUserFromBetterAuthUser` - transformation to domain entity
- Uses `SharedEntityIds.UserId.is()` for validation

---

## Semantic Memory (Project Constants)

### EntityId Import
```typescript
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
```

### Available SharedEntityIds
- `UserId`, `OrganizationId`, `TeamId`, `SessionId`, `FileId`

### Available IamEntityIds
- `MemberId`, `InvitationId`, `TeamMemberId`, `ApiKeyId`, `AccountId`
- `PasskeyId`, `TwoFactorId`, `VerificationId`, `OAuthClientId`, `OAuthConsentId`
- `DeviceCodeId`, `JwksId`, `OrganizationRoleId`

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `QUICK_START.md` | Before/after examples |
| `packages/iam/client/src/_internal/user.schemas.ts` | Transformation pattern |
| `packages/shared/domain/src/entity-ids/shared/ids.ts` | SharedEntityIds |
| `packages/shared/domain/src/entity-ids/iam/ids.ts` | IamEntityIds |

---

## Output Format

Create `outputs/P0-inventory.md` with this structure:

```markdown
# P0 Inventory: IAM Client EntityId Alignment

## Summary
- Total files to modify: X
- Total fields to update: Y
- Transformation schemas needed: Z

## _common/ Directory

### organization/_common/member.schema.ts
| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| Member | id | S.String | IamEntityIds.MemberId | |
| Member | organizationId | S.String | SharedEntityIds.OrganizationId | |
| Member | userId | S.String | SharedEntityIds.UserId | |
| FullMember | id | S.String | IamEntityIds.MemberId | |
| FullMember | organizationId | S.String | SharedEntityIds.OrganizationId | |
| FullMember | userId | S.String | SharedEntityIds.UserId | |

### organization/_common/organization.schema.ts
...

## _internal/ Directory
...

## Contract Files

### organization/add-team-member/contract.ts
| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| Payload | teamId | S.String | SharedEntityIds.TeamId | formValuesAnnotation needs type cast |
| Payload | userId | S.String | SharedEntityIds.UserId | formValuesAnnotation needs type cast |

...

## Transformation Schemas Needed
| Entity | Source Schema | Target Schema | Location |
|--------|---------------|---------------|----------|
| Member | BetterAuthMember | DomainMember | organization/_common/member.schema.ts |
...
```

---

## Success Criteria

- [ ] All `.schema.ts` files in `packages/iam/client/src/` audited
- [ ] All `contract.ts` files audited
- [ ] Every ID field documented with correct target type
- [ ] `outputs/P0-inventory.md` created
- [ ] Inventory reviewed for completeness

---

## Verification

```bash
# Verify inventory captured all files
find packages/iam/client/src -name "*.ts" | grep -E "(schema|contract)" | wc -l
# Compare with count in inventory
```

---

## Next Phase
After P0 completion, proceed to P1 (Foundation Schemas) using:
`specs/iam-client-entity-alignment/handoffs/P1_ORCHESTRATOR_PROMPT.md`
