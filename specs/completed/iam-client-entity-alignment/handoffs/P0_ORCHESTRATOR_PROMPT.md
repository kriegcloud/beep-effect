# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 (Inventory & Analysis) of the `iam-client-entity-alignment` spec.

### Context

The `@beep/iam-client` package has schemas with ID fields using plain `S.String` instead of branded EntityId types. We need to create an exhaustive inventory before making changes.

### Your Mission

1. **Enumerate all schema files** in `packages/iam/client/src/`:
   - `_common/*.schema.ts`
   - `_internal/*.schemas.ts`
   - `*/contract.ts`

2. **Document each file** with:
   - File path
   - Schema class names
   - Fields using `S.String` that should be EntityIds
   - The correct EntityId type to use

3. **Create inventory output** at `specs/iam-client-entity-alignment/outputs/P0-inventory.md`

### EntityId Reference

**SharedEntityIds**: `UserId`, `OrganizationId`, `TeamId`, `SessionId`, `FileId`

**IamEntityIds**: `MemberId`, `InvitationId`, `TeamMemberId`, `ApiKeyId`, `AccountId`, `PasskeyId`, `TwoFactorId`, `VerificationId`, `OAuthClientId`, `OAuthConsentId`, `DeviceCodeId`

### ID Field Mapping Rules

| Field Pattern | EntityId |
|---------------|----------|
| `id` (member context) | `IamEntityIds.MemberId` |
| `id` (invitation context) | `IamEntityIds.InvitationId` |
| `id` (organization context) | `SharedEntityIds.OrganizationId` |
| `id` (user context) | `SharedEntityIds.UserId` |
| `organizationId` | `SharedEntityIds.OrganizationId` |
| `userId` | `SharedEntityIds.UserId` |
| `teamId` | `SharedEntityIds.TeamId` |
| `memberId` | `IamEntityIds.MemberId` |
| `inviterId` | `SharedEntityIds.UserId` |
| `sessionId` | `SharedEntityIds.SessionId` |

### DO NOT map these to EntityIds
- `role` (string literal, not an ID)
- `email` (email address)
- `name` (display name)
- `slug` (URL slug)
- `token` (auth token)
- `code` (verification code)
- `status` (enum value)

### Success Criteria

- [ ] All `.schema.ts` and `contract.ts` files audited
- [ ] Every ID field documented with correct target type
- [ ] `outputs/P0-inventory.md` created with complete tables

### Handoff Document

Read full context in: `specs/iam-client-entity-alignment/handoffs/HANDOFF_P0.md`
