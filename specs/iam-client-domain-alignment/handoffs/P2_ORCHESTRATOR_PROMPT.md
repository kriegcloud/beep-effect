# Phase 1B Orchestrator Prompt

Copy-paste this prompt to start Phase 1B implementation.

---

## Prompt

You are implementing Phase 1B of the IAM Client Domain Schema Alignment spec.

### Context

Phase 1A (Create Transformation Schemas) is **COMPLETE**. The following transformation schemas are now available in `_internal/`:

| File | Exports |
|------|---------|
| `member.schemas.ts` | `BetterAuthMemberSchema`, `BetterAuthEmbeddedUserSchema`, `BetterAuthFullMemberSchema`, `DomainMemberFromBetterAuthMember`, `FullMemberSuccess` |
| `invitation.schemas.ts` | `BetterAuthInvitationSchema`, `DomainInvitationFromBetterAuthInvitation` |
| `organization.schemas.ts` | `BetterAuthOrganizationSchema`, `DomainOrganizationFromBetterAuthOrganization` |

All schemas are exported from `_internal/index.ts` and available via:
```typescript
import * as Common from "@beep/iam-client/_internal";
```

### Your Mission

Implement Phase 1B: Update contracts to use transformation schemas instead of inline `_common/` schemas.

### Work Items

| Contract | Current Import | New Schema |
|----------|---------------|------------|
| `multi-session/list-sessions/contract.ts` | Inline `Session` class | `S.Array(Common.DomainSessionFromBetterAuthSession)` |
| `organization/members/list/contract.ts` | `FullMember` from `_common/` | `S.Array(Common.FullMemberSuccess)` |
| `organization/invitations/list/contract.ts` | `Invitation` from `_common/` | `S.Array(Common.DomainInvitationFromBetterAuthInvitation)` |
| `organization/crud/list/contract.ts` | `Organization` from `_common/` | `S.Array(Common.DomainOrganizationFromBetterAuthOrganization)` |
| `organization/crud/create/contract.ts` | `Organization` from `_common/` | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/update/contract.ts` | `Organization` from `_common/` | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/get-full/contract.ts` | `FullOrganization` from `_common/` | `Common.DomainOrganizationFromBetterAuthOrganization` |
| `organization/crud/set-active/contract.ts` | `Organization` from `_common/` | `Common.DomainOrganizationFromBetterAuthOrganization` |

### Implementation Pattern

**Before (inline schema):**
```typescript
import { Organization } from "../../_common/index.ts";

export const Success = S.Array(Organization).annotations(...);
```

**After (transformation schema):**
```typescript
import * as Common from "@beep/iam-client/_internal";

export const Success = S.Array(Common.DomainOrganizationFromBetterAuthOrganization).annotations(...);
```

### Critical Notes

1. **Remove `_common/` imports**: All inline schemas from `organization/_common/` will be deprecated
2. **Keep `RoleType` and utilities**: The `_common/index.ts` file has `RoleType`, `RoleArray`, `RoleOrRoles` utilities - these should remain for payload schemas that need role types
3. **Session uses existing schema**: The session transformation schema `DomainSessionFromBetterAuthSession` already exists in `_internal/session.schemas.ts`
4. **FullMemberSuccess is composite**: It returns `{ member: Member.Model, user: BetterAuthEmbeddedUser }` - not just the member

### Verification After Each File

```bash
bun run check --filter @beep/iam-client
bun run test --filter @beep/iam-client
```

### Success Criteria

- [ ] All listed contracts updated to use `Common.*` transformation schemas
- [ ] No remaining imports from `_common/member.schema.ts`
- [ ] No remaining imports from `_common/invitation.schema.ts`
- [ ] No remaining imports from `_common/organization.schema.ts`
- [ ] No remaining imports from `_common/full-organization.schema.ts`
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Tests pass: `bun run test --filter @beep/iam-client`

### Files to Verify No Deprecated Imports

After completing updates, run:
```bash
grep -r "from.*_common/member.schema" packages/iam/client/src/
grep -r "from.*_common/invitation.schema" packages/iam/client/src/
grep -r "from.*_common/organization.schema" packages/iam/client/src/
grep -r "from.*_common/full-organization.schema" packages/iam/client/src/
```

All should return empty (no matches).

### Handoff Document

Read full context in: `specs/iam-client-domain-alignment/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1B:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `P3_ORCHESTRATOR_PROMPT.md` for Phase 1C (Cleanup - delete deprecated inline schema files)
