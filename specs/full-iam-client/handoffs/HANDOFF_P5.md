# HANDOFF_P5.md - Organization Management Implementation

> **SUPERSEDED**: This phase has been broken into 4 smaller sub-phases for easier execution.
> Please use the sub-phase handoffs instead:
>
> | Sub-Phase | Focus | Handler Count |
> |-----------|-------|---------------|
> | [HANDOFF_P5A.md](./HANDOFF_P5A.md) | Shared Organization Schemas | 0 (schemas only) |
> | [HANDOFF_P5B.md](./HANDOFF_P5B.md) | Organization CRUD | 6 handlers |
> | [HANDOFF_P5C.md](./HANDOFF_P5C.md) | Member Management | 4 handlers |
> | [HANDOFF_P5D.md](./HANDOFF_P5D.md) | Invitations | 5 handlers |
>
> **Execution Order**: P5A → P5B → P5C → P5D
>
> The content below is preserved for reference but should not be used directly.

---

## Phase Overview

**Phase**: 5 of 6
**Focus**: Organization Management handlers
**Package**: `@beep/iam-client`
**Estimated Handlers**: 15+ handlers across 3 domains (org, members, invitations)

## Prerequisites Checklist

- [x] Phase 4 (Two-Factor Authentication) completed
- [x] `organizationClient()` plugin already configured in Better Auth client
- [x] Response schemas verified from Better Auth source code
- [ ] All type checks passing (`bun run check --filter @beep/iam-client`)

## Directory Structure

```
packages/iam/client/src/organization/
├── _common/
│   ├── index.ts
│   ├── organization.schema.ts    # Shared Organization schema
│   ├── member.schema.ts          # Shared Member schema
│   └── invitation.schema.ts      # Shared Invitation schema
├── crud/
│   ├── create/
│   │   ├── create.contract.ts
│   │   ├── create.handler.ts
│   │   └── index.ts
│   ├── get-full/
│   │   ├── get-full.contract.ts
│   │   ├── get-full.handler.ts
│   │   └── index.ts
│   ├── list/
│   │   ├── list.contract.ts
│   │   ├── list.handler.ts
│   │   └── index.ts
│   ├── update/
│   │   ├── update.contract.ts
│   │   ├── update.handler.ts
│   │   └── index.ts
│   ├── delete/
│   │   ├── delete.contract.ts
│   │   ├── delete.handler.ts
│   │   └── index.ts
│   ├── set-active/
│   │   ├── set-active.contract.ts
│   │   ├── set-active.handler.ts
│   │   └── index.ts
│   └── index.ts
├── members/
│   ├── add/
│   │   ├── add.contract.ts
│   │   ├── add.handler.ts
│   │   └── index.ts
│   ├── remove/
│   │   ├── remove.contract.ts
│   │   ├── remove.handler.ts
│   │   └── index.ts
│   ├── update-role/
│   │   ├── update-role.contract.ts
│   │   ├── update-role.handler.ts
│   │   └── index.ts
│   ├── list/
│   │   ├── list.contract.ts
│   │   ├── list.handler.ts
│   │   └── index.ts
│   └── index.ts
├── invitations/
│   ├── create/
│   │   ├── create.contract.ts
│   │   ├── create.handler.ts
│   │   └── index.ts
│   ├── accept/
│   │   ├── accept.contract.ts
│   │   ├── accept.handler.ts
│   │   └── index.ts
│   ├── reject/
│   │   ├── reject.contract.ts
│   │   ├── reject.handler.ts
│   │   └── index.ts
│   ├── cancel/
│   │   ├── cancel.contract.ts
│   │   ├── cancel.handler.ts
│   │   └── index.ts
│   ├── list/
│   │   ├── list.contract.ts
│   │   ├── list.handler.ts
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

## Verified Response Schemas

### Source Files Reviewed
- `tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-org.ts`
- `tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-members.ts`
- `tmp/better-auth/packages/better-auth/src/plugins/organization/routes/crud-invites.ts`
- `tmp/better-auth/packages/better-auth/src/plugins/organization/schema.ts`

### Shared Schemas

#### Organization Schema
```typescript
// From crud-org.ts - used in create, update, getFullOrganization responses
export class Organization extends S.Class<Organization>($I`Organization`)({
  id: S.String,
  name: S.String,
  slug: S.String,
  logo: S.NullOr(S.String),
  metadata: S.optional(S.Unknown),
  createdAt: S.DateFromString,
}, $I.annotations("Organization", {
  description: "Organization entity from Better Auth organization plugin.",
})) {}
```

#### Member Schema
```typescript
// From crud-members.ts - used in member list, add member responses
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
}, $I.annotations("Member", {
  description: "Organization member entity.",
})) {}
```

#### FullMember Schema (with user data)
```typescript
// From crud-members.ts listMembers response - includes user object
export class FullMember extends S.Class<FullMember>($I`FullMember`)({
  id: S.String,
  organizationId: S.String,
  userId: S.String,
  role: S.String,
  createdAt: S.DateFromString,
  user: S.Struct({
    id: S.String,
    name: S.String,
    email: S.String,
    image: S.NullOr(S.String),
  }),
}, $I.annotations("FullMember", {
  description: "Organization member with embedded user details.",
})) {}
```

#### Invitation Schema
```typescript
// From crud-invites.ts - used in invitation responses
export class Invitation extends S.Class<Invitation>($I`Invitation`)({
  id: S.String,
  organizationId: S.String,
  email: S.String,
  role: S.String,
  status: S.Literal("pending", "accepted", "rejected", "canceled"),
  expiresAt: S.DateFromString,
  inviterId: S.String,
}, $I.annotations("Invitation", {
  description: "Organization invitation entity.",
})) {}
```

#### FullOrganization Schema
```typescript
// From crud-org.ts getFullOrganization response
export class FullOrganization extends S.Class<FullOrganization>($I`FullOrganization`)({
  id: S.String,
  name: S.String,
  slug: S.String,
  logo: S.NullOr(S.String),
  metadata: S.optional(S.Unknown),
  createdAt: S.DateFromString,
  members: S.Array(FullMember),
  invitations: S.Array(Invitation),
}, $I.annotations("FullOrganization", {
  description: "Full organization with members and invitations.",
})) {}
```

## Handler Specifications

### Organization CRUD Handlers

| Handler | Client Method | Payload | Success Schema | mutatesSession |
|---------|---------------|---------|----------------|----------------|
| Create | `client.organization.create()` | `{ name, slug?, logo?, metadata? }` | `Organization` | `false` |
| GetFull | `client.organization.getFullOrganization()` | `{ query: { organizationId? } }` | `FullOrganization` | `false` |
| List | `client.organization.list()` | `{}` | `S.Array(Organization)` | `false` |
| Update | `client.organization.update()` | `{ organizationId?, data: { name?, slug?, logo?, metadata? } }` | `Organization` | `false` |
| Delete | `client.organization.delete()` | `{ organizationId }` | `S.Struct({ success: S.Boolean })` | `false` |
| SetActive | `client.organization.setActive()` | `{ organizationId }` | `S.NullOr(Organization)` | `true` |

### Member Management Handlers

| Handler | Client Method | Payload | Success Schema | mutatesSession |
|---------|---------------|---------|----------------|----------------|
| Add | `client.organization.addMember()` | `{ organizationId?, userId, role }` | `Member` | `false` |
| Remove | `client.organization.removeMember()` | `{ organizationId?, memberIdOrUserId }` | `Member` | `false` |
| UpdateRole | `client.organization.updateMemberRole()` | `{ organizationId?, memberId, role }` | `Member` | `false` |
| List | `client.organization.listMembers()` | `{ organizationId? }` | `S.Array(FullMember)` | `false` |

### Invitation Handlers

| Handler | Client Method | Payload | Success Schema | mutatesSession |
|---------|---------------|---------|----------------|----------------|
| Create | `client.organization.inviteMember()` | `{ organizationId?, email, role }` | `Invitation` | `false` |
| Accept | `client.organization.acceptInvitation()` | `{ invitationId }` | `Invitation` | `true` |
| Reject | `client.organization.rejectInvitation()` | `{ invitationId }` | `Invitation` | `false` |
| Cancel | `client.organization.cancelInvitation()` | `{ invitationId }` | `Invitation` | `false` |
| List | `client.organization.listInvitations()` | `{ organizationId? }` | `S.Array(Invitation)` | `false` |

## Client Method Mapping

Better Auth organization plugin uses these endpoint-to-method mappings:

| Endpoint Path | Client Method |
|---------------|---------------|
| `/organization/create` | `client.organization.create()` |
| `/organization/get-full-organization` | `client.organization.getFullOrganization()` |
| `/organization/list` | `client.organization.list()` |
| `/organization/update` | `client.organization.update()` |
| `/organization/delete` | `client.organization.delete()` |
| `/organization/set-active` | `client.organization.setActive()` |
| `/organization/add-member` | `client.organization.addMember()` |
| `/organization/remove-member` | `client.organization.removeMember()` |
| `/organization/update-member-role` | `client.organization.updateMemberRole()` |
| `/organization/list-members` | `client.organization.listMembers()` |
| `/organization/invite-member` | `client.organization.inviteMember()` |
| `/organization/accept-invitation` | `client.organization.acceptInvitation()` |
| `/organization/reject-invitation` | `client.organization.rejectInvitation()` |
| `/organization/cancel-invitation` | `client.organization.cancelInvitation()` |
| `/organization/list-invitations` | `client.organization.listInvitations()` |

## Implementation Order

### Step 1: Create Shared Schemas
1. `_common/organization.schema.ts` - Organization, FullOrganization
2. `_common/member.schema.ts` - Member, FullMember
3. `_common/invitation.schema.ts` - Invitation
4. `_common/index.ts` - Barrel export

### Step 2: Organization CRUD (6 handlers)
1. `crud/create/` - Create organization
2. `crud/get-full/` - Get full organization with members & invitations
3. `crud/list/` - List user's organizations
4. `crud/update/` - Update organization details
5. `crud/delete/` - Delete organization
6. `crud/set-active/` - Set active organization (mutatesSession: true)
7. `crud/index.ts` - Barrel export

### Step 3: Member Management (4 handlers)
1. `members/add/` - Add member to organization
2. `members/remove/` - Remove member from organization
3. `members/update-role/` - Update member's role
4. `members/list/` - List organization members
5. `members/index.ts` - Barrel export

### Step 4: Invitations (5 handlers)
1. `invitations/create/` - Create invitation (inviteMember)
2. `invitations/accept/` - Accept invitation (mutatesSession: true)
3. `invitations/reject/` - Reject invitation
4. `invitations/cancel/` - Cancel invitation
5. `invitations/list/` - List invitations
6. `invitations/index.ts` - Barrel export

### Step 5: Final Integration
1. Create `organization/index.ts` barrel file
2. Update `packages/iam/client/src/index.ts` to export Organization module
3. Run type check: `bun run check --filter @beep/iam-client`
4. Run lint: `bun run lint:fix`

## Handler Implementation Template

```typescript
// example: organization/crud/create/create.contract.ts
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/organization.schema.ts";

const $I = $IamClientId.create("organization/crud/create");

export class Payload extends S.Class<Payload>($I`Payload`)({
  name: S.String,
  slug: S.optional(S.String),
  logo: S.optional(S.String),
  metadata: S.optional(S.Unknown),
}) {}

export const Success = Organization;
```

```typescript
// example: organization/crud/create/create.handler.ts
import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./create.contract.ts";

export const Handler = createHandler({
  domain: "organization",
  feature: "create",
  execute: (encoded) => client.organization.create(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

## Session Mutation Notes

Only 2 handlers require `mutatesSession: true`:
1. **SetActive** - Changes the user's active organization in session
2. **AcceptInvitation** - User joins an organization, affecting session state

All other handlers don't affect session state.

## Optional Fields Pattern

Many organization endpoints use optional `organizationId`:
- If omitted, Better Auth uses the user's active organization from session
- Schema pattern: `organizationId: S.optional(S.String)`

Example:
```typescript
export class Payload extends S.Class<Payload>($I`Payload`)({
  organizationId: S.optional(S.String),  // Uses active org if omitted
  // ... other fields
}) {}
```

## Success Criteria

- [ ] All 15 handlers implemented following factory pattern
- [ ] Shared schemas created and properly exported
- [ ] All barrel files created (6 total)
- [ ] Package index.ts updated with Organization export
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Lint passes: `bun run lint:fix`
- [ ] Created HANDOFF_P6.md for Multi-Session Management phase

## Phase 6 Preview: Multi-Session Management

The final phase covers multi-session management:
- `listSessions` - List user's active sessions
- `revokeSession` - Revoke a specific session
- `revokeOtherSessions` - Revoke all sessions except current
- `revokeSessions` - Revoke all sessions

**IMPORTANT**: Verify response shapes from Better Auth client plugins BEFORE creating HANDOFF_P6.md.

---

## MANDATORY: Create HANDOFF_P6.md

After completing Phase 5, you MUST create `HANDOFF_P6.md` with verified schemas for Multi-Session Management. This is an explicit requirement - do not skip this step.

Check Better Auth source at:
- `tmp/better-auth/packages/better-auth/src/client/plugins/multi-session.ts`
- Or use the multiSessionClient plugin to verify method signatures
