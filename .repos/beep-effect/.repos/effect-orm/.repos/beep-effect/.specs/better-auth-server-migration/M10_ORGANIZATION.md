# Milestone 10: Organization

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/ORGANIZATION.md](../better-auth-specs/ORGANIZATION.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**If domain contracts exist**: Skip to Implementation Checklist → Infra Handlers
**If domain contracts don't exist**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (35 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

Multi-tenant organization and team management endpoints providing organization lifecycle management, member/invitation management, team operations, role-based access control (RBAC), and organizational hierarchy. These endpoints are critical for B2B SaaS multi-tenancy and support complex organizational structures.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /organization/accept-invitation | `v1/organization/accept-invitation.ts` | `v1/organization/accept-invitation.ts` | `organization.acceptInvitation` |
| POST | /organization/add-team-member | `v1/organization/add-team-member.ts` | `v1/organization/add-team-member.ts` | `organization.addTeamMember` |
| POST | /organization/cancel-invitation | `v1/organization/cancel-invitation.ts` | `v1/organization/cancel-invitation.ts` | `organization.cancelInvitation` |
| POST | /organization/check-slug | `v1/organization/check-slug.ts` | `v1/organization/check-slug.ts` | `organization.checkSlug` |
| POST | /organization/create | `v1/organization/create.ts` | `v1/organization/create.ts` | `organization.create` |
| POST | /organization/create-role | `v1/organization/create-role.ts` | `v1/organization/create-role.ts` | `dynamicAccessControl.createOrgRole` (uses BetterAuthBridge) |
| POST | /organization/create-team | `v1/organization/create-team.ts` | `v1/organization/create-team.ts` | `organization.createTeam` |
| POST | /organization/delete | `v1/organization/delete.ts` | `v1/organization/delete.ts` | `organization.delete` |
| POST | /organization/delete-role | `v1/organization/delete-role.ts` | `v1/organization/delete-role.ts` | `dynamicAccessControl.deleteOrgRole` (uses BetterAuthBridge) |
| GET | /organization/get-active-member | `v1/organization/get-active-member.ts` | `v1/organization/get-active-member.ts` | `organization.getActiveMember` |
| GET | /organization/get-active-member-role | `v1/organization/get-active-member-role.ts` | `v1/organization/get-active-member-role.ts` | `organization.getActiveMemberRole` |
| GET | /organization/get-full-organization | `v1/organization/get-full-organization.ts` | `v1/organization/get-full-organization.ts` | `organization.getFullOrganization` |
| GET | /organization/get-invitation | `v1/organization/get-invitation.ts` | `v1/organization/get-invitation.ts` | `organization.getInvitation` |
| GET | /organization/get-role | `v1/organization/get-role.ts` | `v1/organization/get-role.ts` | `dynamicAccessControl.getOrgRole` (uses BetterAuthBridge) |
| POST | /organization/has-permission | `v1/organization/has-permission.ts` | `v1/organization/has-permission.ts` | `organization.hasPermission` |
| POST | /organization/invite-member | `v1/organization/invite-member.ts` | `v1/organization/invite-member.ts` | `organization.inviteMember` |
| POST | /organization/leave | `v1/organization/leave.ts` | `v1/organization/leave.ts` | `organization.leave` |
| GET | /organization/list | `v1/organization/list.ts` | `v1/organization/list.ts` | `organization.list` |
| GET | /organization/list-invitations | `v1/organization/list-invitations.ts` | `v1/organization/list-invitations.ts` | `organization.listInvitations` |
| GET | /organization/list-members | `v1/organization/list-members.ts` | `v1/organization/list-members.ts` | `organization.listMembers` |
| GET | /organization/list-roles | `v1/organization/list-roles.ts` | `v1/organization/list-roles.ts` | `dynamicAccessControl.listOrgRoles` (uses BetterAuthBridge) |
| GET | /organization/list-team-members | `v1/organization/list-team-members.ts` | `v1/organization/list-team-members.ts` | `organization.listTeamMembers` |
| GET | /organization/list-teams | `v1/organization/list-teams.ts` | `v1/organization/list-teams.ts` | `organization.listTeams` |
| GET | /organization/list-user-invitations | `v1/organization/list-user-invitations.ts` | `v1/organization/list-user-invitations.ts` | `organization.listUserInvitations` |
| GET | /organization/list-user-teams | `v1/organization/list-user-teams.ts` | `v1/organization/list-user-teams.ts` | `organization.listUserTeams` |
| POST | /organization/reject-invitation | `v1/organization/reject-invitation.ts` | `v1/organization/reject-invitation.ts` | `organization.rejectInvitation` |
| POST | /organization/remove-member | `v1/organization/remove-member.ts` | `v1/organization/remove-member.ts` | `organization.removeMember` |
| POST | /organization/remove-team | `v1/organization/remove-team.ts` | `v1/organization/remove-team.ts` | `organization.removeTeam` |
| POST | /organization/remove-team-member | `v1/organization/remove-team-member.ts` | `v1/organization/remove-team-member.ts` | `organization.removeTeamMember` |
| POST | /organization/set-active | `v1/organization/set-active.ts` | `v1/organization/set-active.ts` | `organization.setActive` |
| POST | /organization/set-active-team | `v1/organization/set-active-team.ts` | `v1/organization/set-active-team.ts` | `organization.setActiveTeam` |
| POST | /organization/update | `v1/organization/update.ts` | `v1/organization/update.ts` | `organization.update` |
| POST | /organization/update-member-role | `v1/organization/update-member-role.ts` | `v1/organization/update-member-role.ts` | `organization.updateMemberRole` |
| POST | /organization/update-role | `v1/organization/update-role.ts` | `v1/organization/update-role.ts` | `dynamicAccessControl.updateOrgRole` (uses BetterAuthBridge) |
| POST | /organization/update-team | `v1/organization/update-team.ts` | `v1/organization/update-team.ts` | `organization.updateTeam` |

### Dynamic Access Control Endpoints

⚠️ **IMPORTANT**: The following role management endpoints use Better Auth's Dynamic Access Control feature, which adds methods at runtime that are NOT in TypeScript types:

- `list-roles.ts` → `listOrgRoles`
- `get-role.ts` → `getOrgRole`
- `create-role.ts` → `createOrgRole`
- `update-role.ts` → `updateOrgRole`
- `delete-role.ts` → `deleteOrgRole`

**Do NOT use type assertions** to access these methods. Instead, use the `BetterAuthBridge` wrappers:

```typescript
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";

// For list-roles.ts
const response = yield* BetterAuthBridge.listOrgRoles(auth.api as Record<string, unknown>, {
  headers: request.headers,
});

// For update-role.ts
const response = yield* BetterAuthBridge.updateOrgRole(auth.api as Record<string, unknown>, {
  body,
  headers: request.headers,
});
```

See `packages/iam/server/src/adapters/better-auth/BetterAuthBridge.ts` for all available wrappers.

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### Organization Lifecycle Endpoints

##### `create.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/create.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /organization/create)
  - Spec reference anchor (.specs/better-auth-specs/ORGANIZATION.md#post-organizationcreate)
  - Better Auth method name (`organization.create`)
  - Implementation requirements from spec
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing extensive fields from spec (name, slug, userId (use SharedEntityIds.UserId), logo, metadata, keepCurrentActiveOrganization, type, ownerUserId (use SharedEntityIds.UserId), isPersonal, maxMembers, features, settings, subscriptionTier, subscriptionStatus, audit fields)
  - Use `Organization.Model.jsonCreate` for type reference
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment referencing Organization.Model.json schema
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `update.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/update.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (data object using Organization.Model.jsonUpdate, organizationId (use SharedEntityIds.OrganizationId))
- [ ] Add `Success` class stub (Organization.Model.json schema reference)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `delete.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/delete.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (organizationId (use SharedEntityIds.OrganizationId))
- [ ] Add `Success` class stub (simple success response)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `list.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (list of organizations)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint, no params)
- [ ] Update `index.ts` barrel export

##### `get-full-organization.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/get-full-organization.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (Organization.Model.json schema reference)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `set-active.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/set-active.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), organizationSlug (use S.optionalWith(S.String, { nullable: true })))
- [ ] Add `Success` class stub (Organization.Model.json schema reference)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `check-slug.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/check-slug.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (slug string)
- [ ] Add `Success` class stub (check spec for response)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Invitation Management Endpoints

##### `invite-member.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/invite-member.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (email, role, organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), resend (use S.optionalWith(S.Boolean, { nullable: true })), teamId (use S.optionalWith(SharedEntityIds.TeamId, { nullable: true })), audit fields)
- [ ] Use `Invitation.Model.jsonCreate` for type reference
- [ ] Add `Success` class stub (invitation object with id (use IamEntityIds.InvitationId), email, role, organizationId (use SharedEntityIds.OrganizationId), inviterId (use SharedEntityIds.UserId), status, expiresAt (use BS.EpochMillisFromAllAcceptable - Better Auth uses epoch millis), createdAt (use BS.DateTimeUtcFromAllAcceptable))
- [ ] Use `Invitation.Model.json` for response schema
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `accept-invitation.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/accept-invitation.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (invitationId (use IamEntityIds.InvitationId))
- [ ] Add `Success` class stub (invitation using Invitation.Model.json and member using Member.Model.json objects)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `reject-invitation.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/reject-invitation.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (invitationId (use IamEntityIds.InvitationId))
- [ ] Add `Success` class stub (invitation using Invitation.Model.json and member using Member.Model.json objects)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `cancel-invitation.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/cancel-invitation.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (invitationId (use IamEntityIds.InvitationId))
- [ ] Add `Success` class stub
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `get-invitation.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/get-invitation.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `UrlParams` class stub (id query param using IamEntityIds.InvitationId)
- [ ] Add `Success` class stub (invitation details with org name, slug, inviter email, expiresAt using BS.EpochMillisFromAllAcceptable (Better Auth uses epoch millis), createdAt using BS.DateTimeUtcFromAllAcceptable)
- [ ] Use Invitation.Model.json for response base
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `list-invitations.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-invitations.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of Invitation.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `list-user-invitations.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-user-invitations.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of Invitation.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

#### Member Management Endpoints

##### `get-active-member.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/get-active-member.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (id (use IamEntityIds.MemberId), userId (use SharedEntityIds.UserId), organizationId (use SharedEntityIds.OrganizationId), role, createdAt using BS.DateTimeUtcFromAllAcceptable)
- [ ] Use Member.Model.json for response schema
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `get-active-member-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/get-active-member-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (OrganizationRole.Model.json)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `list-members.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-members.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of Member.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `remove-member.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/remove-member.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (memberIdOrEmail (use S.Union(IamEntityIds.MemberId, S.String) for email or ID), organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })))
- [ ] Add `Success` class stub (member object using Member.Model.json)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `update-member-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/update-member-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (role (string or array), memberId (use IamEntityIds.MemberId), organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })))
- [ ] Add `Success` class stub (member object using Member.Model.json)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `leave.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/leave.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (organizationId (use SharedEntityIds.OrganizationId))
- [ ] Add `Success` class stub
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Team Management Endpoints

##### `create-team.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/create-team.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (name, organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), description (use S.optionalWith(S.String, { nullable: true })), metadata (use S.optionalWith(S.Unknown, { nullable: true })), logo (use S.optionalWith(S.String, { nullable: true })), audit fields)
- [ ] Use `Team.Model.jsonCreate` for type reference
- [ ] Add `Success` class stub (id (use SharedEntityIds.TeamId), name, organizationId (use SharedEntityIds.OrganizationId), createdAt using BS.DateTimeUtcFromAllAcceptable, updatedAt using BS.DateTimeUtcFromAllAcceptable)
- [ ] Use `Team.Model.json` for response schema
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `update-team.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/update-team.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (teamId (use SharedEntityIds.TeamId), data object using Team.Model.jsonUpdate)
- [ ] Add `Success` class stub (id (use SharedEntityIds.TeamId), name, organizationId (use SharedEntityIds.OrganizationId), createdAt using BS.DateTimeUtcFromAllAcceptable, updatedAt using BS.DateTimeUtcFromAllAcceptable)
- [ ] Use `Team.Model.json` for response schema
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `remove-team.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/remove-team.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (teamId (use SharedEntityIds.TeamId), organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })))
- [ ] Add `Success` class stub (message: S.String)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `list-teams.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-teams.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of Team.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `list-user-teams.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-user-teams.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of Team.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `set-active-team.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/set-active-team.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (teamId (use S.optionalWith(SharedEntityIds.TeamId, { nullable: true })))
- [ ] Add `Success` class stub (Team.Model.json schema reference)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `add-team-member.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/add-team-member.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (teamId (use SharedEntityIds.TeamId), userId (use SharedEntityIds.UserId))
- [ ] Add `Success` class stub (id (use IamEntityIds.TeamMemberId), userId (use SharedEntityIds.UserId), teamId (use SharedEntityIds.TeamId), createdAt using BS.DateTimeUtcFromAllAcceptable)
- [ ] Use TeamMember.Model.json for response schema
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `remove-team-member.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/remove-team-member.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (teamId (use SharedEntityIds.TeamId), userId (use SharedEntityIds.UserId))
- [ ] Add `Success` class stub (message: S.String)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `list-team-members.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-team-members.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of TeamMember.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

#### Role Management Endpoints

##### `create-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/create-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), role, permission, additionalFields)
- [ ] Use `OrganizationRole.Model.jsonCreate` for type reference
- [ ] Add `Success` class stub (OrganizationRole.Model.json)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `update-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/update-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (check spec for fields)
- [ ] Use `OrganizationRole.Model.jsonUpdate` for type reference
- [ ] Add `Success` class stub (OrganizationRole.Model.json)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `delete-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/delete-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (check spec for fields)
- [ ] Add `Success` class stub (success message or OrganizationRole.Model.json)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

##### `list-roles.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/list-roles.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Success` class stub (array of OrganizationRole.Model.json)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `get-role.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/get-role.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `UrlParams` class stub (check spec for query params)
- [ ] Add `Success` class stub (OrganizationRole.Model.json)
- [ ] Add `Contract` export with complete JSDoc (GET endpoint)
- [ ] Update `index.ts` barrel export

##### `has-permission.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/has-permission.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `Payload` class stub (permission, permissions objects - check spec for structure)
- [ ] Add `Success` class stub (error (use S.optionalWith(S.String, { nullable: true })), success boolean)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Create Group File `_group.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/organization/_group.ts`
- [ ] Import all 35 organization endpoint contracts
- [ ] Create Group class extending `HttpApiGroup.make("iam.organization")`
- [ ] Add all contracts to group using `.add()` chain
- [ ] Add `.prefix("/organization")` to group
- [ ] Export all endpoints as namespaces

#### Update Parent Index

- [ ] Update `packages/iam/domain/src/api/v1/index.ts` to export Organization group

### Boilerplate Infra Handlers

For each of the 35 endpoints, follow this pattern:

#### Organization Lifecycle Handlers (7 endpoints)

- [ ] `create.ts` - Handler stub
- [ ] `update.ts` - Handler stub
- [ ] `delete.ts` - Handler stub
- [ ] `list.ts` - Handler stub (GET, no params)
- [ ] `get-full-organization.ts` - Handler stub (GET)
- [ ] `set-active.ts` - Handler stub
- [ ] `check-slug.ts` - Handler stub

#### Invitation Management Handlers (7 endpoints)

- [ ] `invite-member.ts` - Handler stub
- [ ] `accept-invitation.ts` - Handler stub
- [ ] `reject-invitation.ts` - Handler stub
- [ ] `cancel-invitation.ts` - Handler stub
- [ ] `get-invitation.ts` - Handler stub (GET)
- [ ] `list-invitations.ts` - Handler stub (GET)
- [ ] `list-user-invitations.ts` - Handler stub (GET)

#### Member Management Handlers (6 endpoints)

- [ ] `get-active-member.ts` - Handler stub (GET)
- [ ] `get-active-member-role.ts` - Handler stub (GET)
- [ ] `list-members.ts` - Handler stub (GET)
- [ ] `remove-member.ts` - Handler stub
- [ ] `update-member-role.ts` - Handler stub
- [ ] `leave.ts` - Handler stub

#### Team Management Handlers (9 endpoints)

- [ ] `create-team.ts` - Handler stub
- [ ] `update-team.ts` - Handler stub
- [ ] `remove-team.ts` - Handler stub
- [ ] `list-teams.ts` - Handler stub (GET)
- [ ] `list-user-teams.ts` - Handler stub (GET)
- [ ] `set-active-team.ts` - Handler stub
- [ ] `add-team-member.ts` - Handler stub
- [ ] `remove-team-member.ts` - Handler stub
- [ ] `list-team-members.ts` - Handler stub (GET)

#### Role Management Handlers (6 endpoints)

- [ ] `create-role.ts` - Handler stub
- [ ] `update-role.ts` - Handler stub
- [ ] `delete-role.ts` - Handler stub
- [ ] `list-roles.ts` - Handler stub (GET)
- [ ] `get-role.ts` - Handler stub (GET)
- [ ] `has-permission.ts` - Handler stub

#### Create Group File `_group.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/organization/_group.ts`
- [ ] Import all 35 organization endpoint handlers
- [ ] Create Service, ServiceError, ServiceDependencies types
- [ ] Create Routes layer with `HttpApiBuilder.group(IamApi, "iam.organization", ...)`
- [ ] Chain all 35 handlers using `.handle()` method

#### Update Parent Index

- [ ] Update `packages/iam/server/src/api/v1/index.ts` to export Organization routes

### Boilerplate Verification

- [ ] All 35 stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

Implement schema fields for all 35 endpoints based on spec. Key considerations:

**Organization Lifecycle (7)**:
- [ ] `create.ts` - Extensive fields including type, isPersonal, maxMembers, features, settings, subscription fields. Use SharedEntityIds.UserId for userId/ownerUserId. Payload: Organization.Model.jsonCreate, Response: Organization.Model.json. All timestamps use BS.DateTimeUtcFromAllAcceptable. All optional fields use S.optionalWith(X, { nullable: true })
- [ ] `update.ts` - data object field using Organization.Model.jsonUpdate, organizationId (use SharedEntityIds.OrganizationId). Response: Organization.Model.json
- [ ] `delete.ts` - organizationId (use SharedEntityIds.OrganizationId)
- [ ] `list.ts` - Response array of Organization.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable
- [ ] `get-full-organization.ts` - Full Organization.Model.json schema
- [ ] `set-active.ts` - organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), organizationSlug (use S.optionalWith(S.String, { nullable: true })). Response: Organization.Model.json
- [ ] `check-slug.ts` - slug field validation

**Invitation Management (7)**:
- [ ] `invite-member.ts` - email, role, organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), resend (use S.optionalWith(S.Boolean, { nullable: true })), teamId (use S.optionalWith(SharedEntityIds.TeamId, { nullable: true })), extensive audit fields. Payload: Invitation.Model.jsonCreate, Response: Invitation.Model.json with expiresAt using BS.EpochMillisFromAllAcceptable (epoch millis), createdAt using BS.DateTimeUtcFromAllAcceptable
- [ ] `accept-invitation.ts` - invitationId (use IamEntityIds.InvitationId). Response: invitation using Invitation.Model.json and member using Member.Model.json
- [ ] `reject-invitation.ts` - invitationId (use IamEntityIds.InvitationId). Response: invitation using Invitation.Model.json and member using Member.Model.json
- [ ] `cancel-invitation.ts` - invitationId (use IamEntityIds.InvitationId)
- [ ] `get-invitation.ts` - id query param (use IamEntityIds.InvitationId), rich response with org/inviter details. Response base: Invitation.Model.json with expiresAt using BS.EpochMillisFromAllAcceptable, createdAt using BS.DateTimeUtcFromAllAcceptable
- [ ] `list-invitations.ts` - Array response of Invitation.Model.json with expiresAt using BS.EpochMillisFromAllAcceptable, createdAt using BS.DateTimeUtcFromAllAcceptable
- [ ] `list-user-invitations.ts` - Array response of Invitation.Model.json with expiresAt using BS.EpochMillisFromAllAcceptable, createdAt using BS.DateTimeUtcFromAllAcceptable

**Member Management (6)**:
- [ ] `get-active-member.ts` - Response: Member.Model.json with id (use IamEntityIds.MemberId), userId (use SharedEntityIds.UserId), organizationId (use SharedEntityIds.OrganizationId), role, createdAt using BS.DateTimeUtcFromAllAcceptable
- [ ] `get-active-member-role.ts` - Role response using OrganizationRole.Model.json
- [ ] `list-members.ts` - Array response of Member.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable
- [ ] `remove-member.ts` - memberIdOrEmail (use S.Union(IamEntityIds.MemberId, S.String)), organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })). Response: Member.Model.json
- [ ] `update-member-role.ts` - role (string or array), memberId (use IamEntityIds.MemberId), organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })). Response: Member.Model.json
- [ ] `leave.ts` - organizationId (use SharedEntityIds.OrganizationId)

**Team Management (9)**:
- [ ] `create-team.ts` - name, organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), description (use S.optionalWith(S.String, { nullable: true })), metadata (use S.optionalWith(S.Unknown, { nullable: true })), logo (use S.optionalWith(S.String, { nullable: true })), audit fields. Payload: Team.Model.jsonCreate, Response: Team.Model.json with id (use SharedEntityIds.TeamId), timestamps using BS.DateTimeUtcFromAllAcceptable
- [ ] `update-team.ts` - teamId (use SharedEntityIds.TeamId), data object using Team.Model.jsonUpdate. Response: Team.Model.json with id (use SharedEntityIds.TeamId), timestamps using BS.DateTimeUtcFromAllAcceptable
- [ ] `remove-team.ts` - teamId (use SharedEntityIds.TeamId), organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true }))
- [ ] `list-teams.ts` - Array response of Team.Model.json with teamId (use SharedEntityIds.TeamId), timestamps using BS.DateTimeUtcFromAllAcceptable
- [ ] `list-user-teams.ts` - Array response of Team.Model.json with teamId (use SharedEntityIds.TeamId), timestamps using BS.DateTimeUtcFromAllAcceptable
- [ ] `set-active-team.ts` - teamId (use S.optionalWith(SharedEntityIds.TeamId, { nullable: true })). Response: Team.Model.json
- [ ] `add-team-member.ts` - teamId (use SharedEntityIds.TeamId), userId (use SharedEntityIds.UserId). Response: TeamMember.Model.json with id (use IamEntityIds.TeamMemberId), createdAt using BS.DateTimeUtcFromAllAcceptable
- [ ] `remove-team-member.ts` - teamId (use SharedEntityIds.TeamId), userId (use SharedEntityIds.UserId)
- [ ] `list-team-members.ts` - Array response of TeamMember.Model.json with timestamps using BS.DateTimeUtcFromAllAcceptable

**Role Management (6)**:
- [ ] `create-role.ts` - organizationId (use S.optionalWith(SharedEntityIds.OrganizationId, { nullable: true })), role, permission, additionalFields. Payload: OrganizationRole.Model.jsonCreate, Response: OrganizationRole.Model.json
- [ ] `update-role.ts` - Check spec for fields. Payload: OrganizationRole.Model.jsonUpdate, Response: OrganizationRole.Model.json
- [ ] `delete-role.ts` - Check spec for fields. Response: success message or OrganizationRole.Model.json
- [ ] `list-roles.ts` - Array response of OrganizationRole.Model.json
- [ ] `get-role.ts` - Query param, Response: OrganizationRole.Model.json
- [ ] `has-permission.ts` - permission/permissions objects. Response: error (use S.optionalWith(S.String, { nullable: true })), success boolean

### 2. Infra Handlers

**Helper Selection**: See `packages/iam/server/src/api/common/schema-helpers.ts` for available helpers. Import:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

Implement handler logic for all 35 endpoints. Each handler should:

1. Get Auth service and HttpServerRequest
2. Call appropriate `auth.api.organization.*` method using the correct helper
3. Map payload/urlParams to Better Auth API format
4. Decode response using domain Success schema
5. Forward set-cookie header if present

**Organization Lifecycle (7)**:
- [ ] `create.ts` - `organization.create()` → **Helper**: `runAuthEndpoint`
- [ ] `update.ts` - `organization.update()` → **Helper**: `runAuthEndpoint`
- [ ] `delete.ts` - `organization.delete()` → **Helper**: `runAuthCommand`
- [ ] `list.ts` - `organization.list()` → **Helper**: `runAuthQuery`
- [ ] `get-full-organization.ts` - `organization.getFullOrganization()` → **Helper**: `runAuthQuery`
- [ ] `set-active.ts` - `organization.setActive()` → **Helper**: `runAuthEndpoint`
- [ ] `check-slug.ts` - `organization.checkSlug()` → **Helper**: `runAuthEndpoint`

**Invitation Management (7)**:
- [ ] `invite-member.ts` - `organization.inviteMember()` → **Helper**: `runAuthEndpoint`
- [ ] `accept-invitation.ts` - `organization.acceptInvitation()` → **Helper**: `runAuthEndpoint`
- [ ] `reject-invitation.ts` - `organization.rejectInvitation()` → **Helper**: `runAuthEndpoint`
- [ ] `cancel-invitation.ts` - `organization.cancelInvitation()` → **Helper**: `runAuthCommand`
- [ ] `get-invitation.ts` - `organization.getInvitation()` → **Helper**: `runAuthQuery`
- [ ] `list-invitations.ts` - `organization.listInvitations()` → **Helper**: `runAuthQuery`
- [ ] `list-user-invitations.ts` - `organization.listUserInvitations()` → **Helper**: `runAuthQuery`

**Member Management (6)**:
- [ ] `get-active-member.ts` - `organization.getActiveMember()` → **Helper**: `runAuthQuery`
- [ ] `get-active-member-role.ts` - `organization.getActiveMemberRole()` → **Helper**: `runAuthQuery`
- [ ] `list-members.ts` - `organization.listMembers()` → **Helper**: `runAuthQuery`
- [ ] `remove-member.ts` - `organization.removeMember()` → **Helper**: `runAuthEndpoint`
- [ ] `update-member-role.ts` - `organization.updateMemberRole()` → **Helper**: `runAuthEndpoint`
- [ ] `leave.ts` - `organization.leave()` → **Helper**: `runAuthCommand`

**Team Management (9)**:
- [ ] `create-team.ts` - `organization.createTeam()` → **Helper**: `runAuthEndpoint`
- [ ] `update-team.ts` - `organization.updateTeam()` → **Helper**: `runAuthEndpoint`
- [ ] `remove-team.ts` - `organization.removeTeam()` → **Helper**: `runAuthCommand`
- [ ] `list-teams.ts` - `organization.listTeams()` → **Helper**: `runAuthQuery`
- [ ] `list-user-teams.ts` - `organization.listUserTeams()` → **Helper**: `runAuthQuery`
- [ ] `set-active-team.ts` - `organization.setActiveTeam()` → **Helper**: `runAuthEndpoint`
- [ ] `add-team-member.ts` - `organization.addTeamMember()` → **Helper**: `runAuthEndpoint`
- [ ] `remove-team-member.ts` - `organization.removeTeamMember()` → **Helper**: `runAuthCommand`
- [ ] `list-team-members.ts` - `organization.listTeamMembers()` → **Helper**: `runAuthQuery`

**Role Management (6)**:
- [ ] `create-role.ts` - `BetterAuthBridge.createOrgRole()` (Uses DAC wrapper) → **Helper**: `runAuthEndpoint`
- [ ] `update-role.ts` - `BetterAuthBridge.updateOrgRole()` (Uses DAC wrapper) → **Helper**: `runAuthEndpoint`
- [ ] `delete-role.ts` - `BetterAuthBridge.deleteOrgRole()` (Uses DAC wrapper) → **Helper**: `runAuthCommand`
- [ ] `list-roles.ts` - `BetterAuthBridge.listOrgRoles()` (Uses DAC wrapper) → **Helper**: `runAuthQuery`
- [ ] `get-role.ts` - `BetterAuthBridge.getOrgRole()` (Uses DAC wrapper) → **Helper**: `runAuthQuery`
- [ ] `has-permission.ts` - `organization.hasPermission()` → **Helper**: `runAuthEndpoint`

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] All 35 endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Special Considerations

1. **Schema Pattern Fixes Applied**: This milestone has been updated with three critical schema patterns:
   - **DateTime Schema**: All timestamps use `BS.DateTimeUtcFromAllAcceptable` (from `@beep/schema`) instead of `S.DateTimeUtc`
   - **Model Variants for CRUD**: Create operations use `.jsonCreate`, update operations use `.jsonUpdate`, responses use `.json` variants
   - **Optional Schema Pattern**: All optional fields use `S.optionalWith(X, { nullable: true })` instead of `S.optional(X)`
2. **Complex Payload Structures**: The `create.ts` endpoint has 20+ fields including subscription management, features, and audit fields - ensure all are properly typed and optional/required correctly. Use SharedEntityIds.UserId for userId/ownerUserId fields.
3. **Active Context Management**: Several endpoints (`set-active`, `set-active-team`) manage session state - ensure cookie forwarding
4. **Audit Fields Pattern**: Many endpoints have `_rowId`, `deletedAt`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `deletedBy`, `version`, `source` - use Entity.Model for domain entities which includes these fields automatically
5. **Permission Objects**: `has-permission` and `create-role` use object types for permissions - these may need custom schema definitions or accept `S.Unknown`
6. **String/Array Duality**: `update-member-role.ts` accepts role as string or array of strings - use union type or array with min length 1
7. **Email/ID Flexibility**: `remove-member.ts` accepts memberIdOrEmail - handle both cases
8. **Hierarchical Relationships**: Team operations nest under organizations - ensure organizationId context is properly handled when optional (defaults to active organization)
9. **Invitation Lifecycle**: Accept/reject/cancel flow - ensure proper state transitions
10. **Destructive Operations**: `delete`, `remove-member`, `leave` are irreversible - consider adding confirmation at UI layer
11. **List Endpoints**: Multiple list operations - may need pagination support (check Better Auth API)
12. **Organization/Team Schema**: Reference domain entity schemas if they exist, otherwise define inline
13. **Success Messages**: Some endpoints return success messages - use S.String for message fields, not S.Literal()
14. **Multi-Tenancy Core**: This is the heart of multi-tenancy - thorough testing required
15. **Slug Validation**: `check-slug` endpoint validates uniqueness - handle both available and unavailable cases
16. **Resend Flag**: `invite-member` has resend boolean - affects idempotency behavior
