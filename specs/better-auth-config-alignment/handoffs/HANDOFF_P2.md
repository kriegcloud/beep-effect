# Better Auth Config Alignment — P2 Handoff (Organization Models)

> Phase 2: Align organization plugin model configurations

---

## Phase 1 Summary

Phase 1 is complete. Changes made to `Options.ts`:

### User additionalFields — Added 4 missing fields:
- `banReason` (admin plugin) - nullable string
- `phoneNumber` (phoneNumber plugin) - nullable string
- `username` (username plugin) - nullable string
- `displayUsername` (username plugin) - nullable string

### Session additionalFields — Added 1 missing field:
- `impersonatedBy` (admin plugin) - nullable string

### Account model — Documented limitation:
- Removed invalid `additionalFields: additionalFieldsCommon`
- Added documentation comment explaining Table.make defaults cannot be reflected in Better Auth API schema

### Verification:
- `bun run check --filter @beep/iam-server` ✅ Passed
- `bun run build --filter @beep/iam-server` ✅ Passed

---

## P2 Objective

Verify and align organization plugin `additionalFields` configuration for:
1. **Organization model** — verify against `organization.table.ts`
2. **Member model** — verify against `member.table.ts`
3. **Team model** — verify against `team.table.ts`
4. **Invitation model** — verify against `invitation.table.ts`
5. **TeamMember model** — NOTE: Does NOT support additionalFields (organization plugin limitation)
6. **OrganizationRole model** — verify against `organizationRole.table.ts`
7. **Verification model** — verify against `verification.table.ts`

---

## Files to Know

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Primary edit target (organization plugin section ~lines 509-656) |
| `packages/shared/tables/src/tables/organization.table.ts` | Organization Drizzle schema |
| `packages/iam/tables/src/tables/member.table.ts` | Member Drizzle schema |
| `packages/shared/tables/src/tables/team.table.ts` | Team Drizzle schema |
| `packages/iam/tables/src/tables/invitation.table.ts` | Invitation Drizzle schema |
| `packages/iam/tables/src/tables/teamMember.table.ts` | TeamMember Drizzle schema |
| `packages/iam/tables/src/tables/organizationRole.table.ts` | OrganizationRole Drizzle schema |
| `packages/iam/tables/src/tables/verification.table.ts` | Verification Drizzle schema |
| `specs/better-auth-config-alignment/outputs/core-fields.md` | Better Auth core fields reference |
| `specs/better-auth-config-alignment/outputs/plugin-schema-support.md` | Plugin support levels |

---

## P2 Tasks

### Task 2.1: Read Current Organization Plugin Configuration

Read the `organization({...})` section in `Options.ts` (lines ~509-656) to understand:
1. What models have `additionalFields` configured
2. What fields are currently in each model's `additionalFields`
3. Which models use `additionalFieldsCommon` only

### Task 2.2: Read Drizzle Table Schemas

For each table, identify:
- Columns that are Table.make/OrgTable.make defaults (already in `additionalFieldsCommon`)
- Columns that are Better Auth core fields (should NOT be in additionalFields)
- Custom columns (SHOULD be in additionalFields)

### Task 2.3: Compare and Document Gaps

Create a gap analysis for each model:

| Model | Column | In Drizzle | In additionalFields | Action |
|-------|--------|-----------|---------------------|--------|
| organization | ... | ... | ... | ... |
| member | ... | ... | ... | ... |
| team | ... | ... | ... | ... |
| invitation | ... | ... | ... | ... |
| teamMember | ... | ... | ... | Document limitation |
| organizationRole | ... | ... | ... | ... |
| verification | ... | ... | ... | ... |

### Task 2.4-2.9: Update Each Model's additionalFields

For each model with gaps:
1. Determine correct `type` based on Drizzle column type
2. Determine `required` based on `.notNull()` presence
3. Add missing fields to the model's `additionalFields`

### Task 2.10: Verify Changes

```bash
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
```

---

## Configuration Reference

### Better Auth Organization Plugin Core Fields

From `outputs/core-fields.md`:

**Organization core:**
- `id`, `name`, `slug`, `logo`, `createdAt`, `metadata`

**Member core:**
- `id`, `organizationId`, `userId`, `role`, `createdAt`

**Team core:**
- `id`, `organizationId`, `name`, `createdAt`, `updatedAt`

**TeamMember core:**
- `id`, `teamId`, `userId`, `createdAt`

**Invitation core:**
- `id`, `organizationId`, `email`, `role`, `status`, `expiresAt`, `inviterId`

### Table.make/OrgTable.make Default Fields

These are in `additionalFieldsCommon`:
- `_rowId`, `deletedAt`, `createdAt`, `updatedAt`
- `createdBy`, `updatedBy`, `deletedBy`
- `version`, `source`

### TeamMember Limitation

**CRITICAL**: The organization plugin does NOT support `additionalFields` for the `teamMember` model. From Phase 0 research:

```typescript
// Organization plugin schema type (simplified)
schema: {
  teamMember: {
    modelName?: string,
    fields?: { [fieldName]: string },
    // NO additionalFields!
  }
}
```

Any custom columns in `teamMember.table.ts` beyond the core fields will:
- Work at the database level
- NOT appear in Better Auth's OpenAPI documentation
- NOT be validated/transformed by Better Auth

---

## Current Configuration (from Options.ts)

```typescript
organization({
  schema: {
    verification: {
      modelName: IamEntityIds.VerificationId.tableName,
      additionalFields: additionalFieldsCommon,
    },
    organization: {
      modelName: SharedEntityIds.OrganizationId.tableName,
      additionalFields: {
        type: { type: "string", required: false, defaultValue: "individual" },
        ownerUserId: { type: "string", required: false },
        isPersonal: { type: "boolean", required: true },
        maxMembers: { type: "number", required: false },
        features: { type: "json", required: false },
        settings: { type: "json", required: false },
        subscriptionTier: { type: "string", required: false, defaultValue: "free" },
        subscriptionStatus: { type: "string", required: false, defaultValue: "active" },
        ...additionalFieldsCommon,
      },
    },
    member: {
      modelName: IamEntityIds.MemberId.tableName,
      additionalFields: {
        status: { type: "string", required: true, defaultValue: "active" },
        invitedBy: { type: "string", required: false },
        invitedAt: { type: "date", required: false },
        joinedAt: { type: "date", required: false },
        lastActiveAt: { type: "date", required: false },
        permissions: { type: "string", required: false },
        ...additionalFieldsCommon,
      },
    },
    invitation: {
      modelName: IamEntityIds.InvitationId.tableName,
      additionalFields: additionalFieldsCommon,
    },
    team: {
      modelName: SharedEntityIds.TeamId.tableName,
      additionalFields: {
        description: { type: "string", required: false },
        metadata: { type: "string", required: false },
        logo: { type: "string", required: false },
        ...additionalFieldsCommon,
      },
    },
    organizationRole: {
      modelName: IamEntityIds.OrganizationRoleId.tableName,
      additionalFields: additionalFieldsCommon,
    },
    teamMember: {
      modelName: IamEntityIds.TeamMemberId.tableName,
      additionalFields: additionalFieldsCommon,  // NOTE: May not be supported!
    },
  },
})
```

---

## Common Pitfalls

1. **TeamMember additionalFields** — The organization plugin does NOT support additionalFields for teamMember. Verify and document.

2. **Forgetting `required: false`** — Better Auth defaults to `required: true`, so nullable columns MUST explicitly set `required: false`

3. **Adding core fields** — Do NOT add fields that are part of Better Auth's core schema for each model

4. **OrgTable.make fields** — Tables using `OrgTable.make` automatically have `organizationId` - this is a core field, don't add it

---

## P2 Completion Checklist

- [ ] Organization additionalFields verified/complete
- [ ] Member additionalFields verified/complete
- [ ] Team additionalFields verified/complete
- [ ] Invitation additionalFields verified/complete
- [ ] TeamMember limitation documented
- [ ] OrganizationRole additionalFields verified/complete
- [ ] Verification additionalFields verified/complete
- [ ] No core fields accidentally added
- [ ] `required: false` set for all nullable columns
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] REFLECTION_LOG.md Phase 2 section updated

---

## P2 → P3 Handoff

After completing P2:
1. Update `REFLECTION_LOG.md` Phase 2 section
2. **Create `handoffs/HANDOFF_P3.md`** for authentication plugin models (Phase 3)
3. P3 will focus on: twoFactor, passkey, apiKey models

---

## Orchestrator Prompt for P2

```markdown
# P2 Orchestrator: Organization Models Alignment

## Your Task
Verify and align Better Auth organization plugin additionalFields configuration with Drizzle table schemas.

## Prerequisite Check
Verify Phase 1 is complete:
- User additionalFields updated with banReason, phoneNumber, username, displayUsername
- Session additionalFields updated with impersonatedBy
- Account limitation documented

## Research Phase
1. Read current organization plugin configuration in `Options.ts` (lines ~509-656)
2. Read each Drizzle table schema:
   - organization.table.ts
   - member.table.ts
   - team.table.ts
   - invitation.table.ts
   - teamMember.table.ts
   - organizationRole.table.ts
   - verification.table.ts
3. Compare Drizzle columns to current additionalFields

## Implementation Phase
1. Identify missing columns for each model
2. Add missing columns to each model's additionalFields
3. Ensure `required: false` for nullable columns
4. Document teamMember limitation (no additionalFields support)

## Verification Phase
1. Run `bun run check --filter @beep/iam-server`
2. Run `bun run build --filter @beep/iam-server`
3. Document any errors and fix

## Output Required
- Updated `Options.ts` with complete organization plugin additionalFields
- Gap analysis documented
- TeamMember limitation documented
- `handoffs/HANDOFF_P3.md` created for next phase

## Key Constraints
- DO NOT add core fields (id, name, slug, organizationId, userId, etc.)
- DO NOT add Table.make/OrgTable.make fields individually (use spread)
- MUST set `required: false` for nullable columns
- TeamMember does NOT support additionalFields
```
