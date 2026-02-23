# P0 Inventory: IAM Client EntityId Alignment

## Summary

| Category | Count |
|----------|-------|
| Total files to modify | 17 |
| Total ID fields to update | 63 |
| Files already using transformation schemas | 5 |
| Files needing new transformation schemas | 3 |
| Contract payloads needing EntityId updates | 24 |

---

## Analysis Overview

The IAM client package has **two patterns** for handling Better Auth responses:

1. **Transformation Schemas** (`_internal/*.schemas.ts`): Full `transformOrFail` schemas that validate EntityId formats and map to domain models. These are **already properly implemented**.

2. **Simple Schemas** (`_common/*.schema.ts`, some `_internal/*.schemas.ts`): Plain `S.Class` schemas using `S.String` for ID fields without validation. These **need EntityId alignment**.

---

## Files Already Using EntityId Validation (No Changes Needed)

These files in `_internal/` already implement proper EntityId validation via `transformOrFail`:

| File | Transformation Schema | Validated IDs |
|------|----------------------|---------------|
| `user.schemas.ts` | `DomainUserFromBetterAuthUser` | `UserId` |
| `session.schemas.ts` | `DomainSessionFromBetterAuthSession` | `SessionId`, `UserId`, `OrganizationId`, `TeamId` |
| `member.schemas.ts` | `DomainMemberFromBetterAuthMember` | `MemberId`, `OrganizationId`, `UserId` |
| `organization.schemas.ts` | `DomainOrganizationFromBetterAuthOrganization` | `OrganizationId`, `UserId` |
| `invitation.schemas.ts` | `DomainInvitationFromBetterAuthInvitation` | `InvitationId`, `OrganizationId`, `UserId`, `TeamId` |

---

## _common/ Directory - Simple Schemas to Update

These schemas are used directly in contracts without transformation. They need EntityId types added.

### organization/_common/member.schema.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `Member` | `id` | `S.String` | `IamEntityIds.MemberId` | Primary key |
| `Member` | `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | Foreign key |
| `Member` | `userId` | `S.String` | `SharedEntityIds.UserId` | Foreign key |
| `FullMember` | `id` | `S.String` | `IamEntityIds.MemberId` | Primary key |
| `FullMember` | `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | Foreign key |
| `FullMember` | `userId` | `S.String` | `SharedEntityIds.UserId` | Foreign key |

### organization/_common/organization.schema.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `EmbeddedUser` | `id` | `S.String` | `SharedEntityIds.UserId` | Embedded user reference |
| `Organization` | `id` | `S.String` | `SharedEntityIds.OrganizationId` | Primary key |

### organization/_common/invitation.schema.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `Invitation` | `id` | `S.String` | `IamEntityIds.InvitationId` | Primary key |
| `Invitation` | `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | Foreign key |
| `Invitation` | `inviterId` | `S.String` | `SharedEntityIds.UserId` | Foreign key |

### organization/_common/full-organization.schema.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `FullOrganization` | `id` | `S.String` | `SharedEntityIds.OrganizationId` | Primary key |

### two-factor/_common/user.schema.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `TwoFactorUser` | `id` | `S.String` | `SharedEntityIds.UserId` | Primary key |

---

## _internal/ Directory - Simple Schemas to Update

These are simple schemas in `_internal/` that don't use transformation (unlike the ones above that do).

### _internal/team.schemas.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `Team` | `id` | `S.String` | `SharedEntityIds.TeamId` | Primary key |
| `Team` | `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | Foreign key |
| `TeamMember` | `id` | `S.String` | `IamEntityIds.TeamMemberId` | Primary key |
| `TeamMember` | `teamId` | `S.String` | `SharedEntityIds.TeamId` | Foreign key |
| `TeamMember` | `userId` | `S.String` | `SharedEntityIds.UserId` | Foreign key |

### _internal/role.schemas.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `OrganizationRole` | `id` | `S.String` | `IamEntityIds.OrganizationRoleId` | Primary key |
| `OrganizationRole` | `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | Foreign key |

### _internal/api-key.schemas.ts

| Schema Class | Field | Current Type | Target Type | Notes |
|--------------|-------|--------------|-------------|-------|
| `ApiKey` | `id` | `S.String` | `IamEntityIds.ApiKeyId` | Primary key |
| `ApiKey` | `userId` | `S.String` | `SharedEntityIds.UserId` | Foreign key |
| `ApiKeyWithKey` | `id` | `S.String` | `IamEntityIds.ApiKeyId` | Primary key |
| `ApiKeyWithKey` | `userId` | `S.String` | `SharedEntityIds.UserId` | Foreign key |

---

## Contract Payloads with ID Fields

These contracts accept ID inputs in their `Payload` schemas. The `formValuesAnnotation` needs special handling (type cast to `string` for form compatibility).

### Pattern: EntityId in Payload

For payloads, the encoded type must remain `string` for form compatibility while the decoded type uses the branded EntityId. This requires:

```typescript
// Current - plain string
export class Payload extends S.Class<Payload>($I`Payload`)(
  { organizationId: S.String },
  formValuesAnnotation({ organizationId: "" })
) {}

// Target - EntityId with form compatibility
export class Payload extends S.Class<Payload>($I`Payload`)(
  { organizationId: SharedEntityIds.OrganizationId },
  formValuesAnnotation({ organizationId: "" as string as SharedEntityIds.OrganizationId.Type })
) {}
```

### organization/add-team-member/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `teamId` | `S.String` | `SharedEntityIds.TeamId` | `"" as string as TeamId.Type` |
| `userId` | `S.String` | `SharedEntityIds.UserId` | `"" as string as UserId.Type` |

### organization/remove-team-member/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `teamId` | `S.String` | `SharedEntityIds.TeamId` | `"" as string as TeamId.Type` |
| `userId` | `S.String` | `SharedEntityIds.UserId` | `"" as string as UserId.Type` |

### organization/set-active-team/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `teamId` | `S.optionalWith(S.String, { nullable: true })` | `S.optionalWith(SharedEntityIds.TeamId, { nullable: true })` | `null as TeamId.Type \| null` |

### organization/create-team/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `organizationId` | `S.optional(S.String)` | `S.optional(SharedEntityIds.OrganizationId)` | `undefined as OrganizationId.Type \| undefined` |

### organization/crud/set-active/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | `"" as string as OrganizationId.Type` |

### organization/leave/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `organizationId` | `S.String` | `SharedEntityIds.OrganizationId` | `"" as string as OrganizationId.Type` |

### organization/members/update-role/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `organizationId` | `S.optional(S.String)` | `S.optional(SharedEntityIds.OrganizationId)` | `undefined` |
| `memberId` | `S.String` | `IamEntityIds.MemberId` | `"" as string as MemberId.Type` |

### organization/members/remove/contract.ts

| Field | Current | Target | Annotation Cast | Notes |
|-------|---------|--------|-----------------|-------|
| `organizationId` | `S.optional(S.String)` | `S.optional(SharedEntityIds.OrganizationId)` | `undefined` | |
| `memberIdOrEmail` | `S.String` | `S.String` | N/A | Keep as string - accepts email OR memberId |

### organization/invitations/create/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `organizationId` | `S.optional(S.String)` | `S.optional(SharedEntityIds.OrganizationId)` | `undefined` |

### organization/get-invitation/contract.ts

| Field | Current | Target | Annotation Cast |
|-------|---------|--------|-----------------|
| `id` | `S.String` | `IamEntityIds.InvitationId` | `"" as string as InvitationId.Type` |

### Additional Organization Contracts (same pattern)

| Contract | ID Fields | Target Types |
|----------|-----------|--------------|
| `crud/delete/contract.ts` | `organizationId` | `OrganizationId` |
| `crud/get-full/contract.ts` | `organizationId` | `OrganizationId` |
| `crud/update/contract.ts` | `organizationId` | `OrganizationId` |
| `get-active-member/contract.ts` | `organizationId` | `OrganizationId` |
| `get-active-member-role/contract.ts` | `organizationId` | `OrganizationId` |
| `get-role/contract.ts` | `roleId` | `OrganizationRoleId` |
| `create-role/contract.ts` | `organizationId` | `OrganizationId` |
| `update-role/contract.ts` | `roleId` | `OrganizationRoleId` |
| `delete-role/contract.ts` | `roleId` | `OrganizationRoleId` |
| `update-team/contract.ts` | `teamId` | `TeamId` |
| `remove-team/contract.ts` | `teamId` | `TeamId` |
| `list-teams/contract.ts` | `organizationId` | `OrganizationId` |
| `list-user-teams/contract.ts` | `organizationId` | `OrganizationId` |
| `invitations/accept/contract.ts` | `invitationId` | `InvitationId` |
| `invitations/cancel/contract.ts` | `invitationId` | `InvitationId` |
| `invitations/reject/contract.ts` | `invitationId` | `InvitationId` |

---

## Transformation Schemas Needed

These schemas exist as simple classes but should be converted to transformation schemas for consistency with the existing patterns:

| Entity | Source Schema | Target | Location | Priority |
|--------|---------------|--------|----------|----------|
| `Team` | `BetterAuthTeamSchema` → `Team.Model` | New transformation | `_internal/team.schemas.ts` | Medium |
| `TeamMember` | `BetterAuthTeamMemberSchema` → `TeamMember.Model` | New transformation | `_internal/team.schemas.ts` | Medium |
| `OrganizationRole` | `BetterAuthRoleSchema` → `Role.Model` | New transformation | `_internal/role.schemas.ts` | Low |

**Note**: These transformations are lower priority because:
1. The existing simple schemas may be sufficient for client-side usage
2. Domain models for Team/TeamMember/Role may not exist yet
3. Better Auth returns these with minimal fields

---

## Files Summary by Priority

### Priority 1: Foundation Schemas (Simple EntityId replacement)

1. `organization/_common/member.schema.ts` (6 fields)
2. `organization/_common/organization.schema.ts` (2 fields)
3. `organization/_common/invitation.schema.ts` (3 fields)
4. `organization/_common/full-organization.schema.ts` (1 field)
5. `two-factor/_common/user.schema.ts` (1 field)

### Priority 2: Internal Simple Schemas

6. `_internal/team.schemas.ts` (5 fields)
7. `_internal/role.schemas.ts` (2 fields)
8. `_internal/api-key.schemas.ts` (4 fields)

### Priority 3: Contract Payloads

9-32. Various `contract.ts` files (24 contracts with ID payloads)

---

## Verification Commands

```bash
# Count files with S.String ID patterns
grep -r "id: S\.String" packages/iam/client/src --include="*.ts" | wc -l

# Count files with EntityId imports
grep -r "IamEntityIds\|SharedEntityIds" packages/iam/client/src --include="*.ts" | wc -l

# Verify inventory captured all schema files
find packages/iam/client/src -name "*.schema.ts" -o -name "*.schemas.ts" | wc -l

# Verify all contract files
find packages/iam/client/src -name "contract.ts" | wc -l
```

---

## Next Phase

Proceed to **P1 (Foundation Schemas)** using:
`specs/iam-client-entity-alignment/handoffs/P1_ORCHESTRATOR_PROMPT.md`

P1 will update the `_common/*.schema.ts` files first, as these are imported by multiple contracts.
