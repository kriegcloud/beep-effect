# Better Auth Method Inventory

> Phase 0 Discovery & Audit Results
> Date: 2026-01-15

---

## Summary

| Category | Count |
|----------|-------|
| **Total methods to implement** | 55+ |
| **Factory pattern candidates** | ~45 |
| **Manual pattern candidates** | ~10 |
| **Already implemented** | 4 |
| **Methods not found** | 0 |

### Already Implemented (from `iam-effect-patterns`)

| Feature | Location | Pattern |
|---------|----------|---------|
| sign-in/email | `sign-in/email/` | Factory |
| sign-up/email | `sign-up/email/` | Manual (computed name) |
| sign-out | `core/sign-out/` | Factory |
| get-session | `core/get-session/` | Manual (different shape) |

---

## Core Auth Methods (VERIFIED)

### Password Management

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| requestPasswordReset | `client.requestPasswordReset()` | `{ email: string, redirectTo?: string }` | `{ data, error }` | No | Factory |
| resetPassword | `client.resetPassword()` | `{ newPassword: string, token: string }` | `{ data, error }` | No | Factory |
| changePassword | `client.changePassword()` | `{ newPassword: string, currentPassword: string, revokeOtherSessions?: boolean }` | `{ data, error }` | Maybe* | Factory |

> *`changePassword` with `revokeOtherSessions: true` affects sessions but not the current session.

### Email Verification

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| sendVerificationEmail | `client.sendVerificationEmail()` | `{ email: string, callbackURL: string }` | `{ data, error }` | No | Factory |
| verifyEmail | Redirect-based | Token in URL | N/A | Maybe | N/A |

> Note: `verifyEmail` is typically handled via redirect flow, not a direct client call. The server verifies the token and redirects with success/error in query params.

### Session Management (Core)

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| listSessions | `client.listSessions()` | none | `{ data: Session[], error }` | No | Factory |
| revokeSession | `client.revokeSession()` | `{ token: string }` | `{ data, error }` | Yes | Factory |
| revokeOtherSessions | `client.revokeOtherSessions()` | none | `{ data, error }` | Yes | Factory |

---

## Plugin Methods

### Multi-Session Plugin (`client.multiSession.*`)

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| listDeviceSessions | `client.multiSession.listDeviceSessions()` | `{}` | `{ data: Session[], error }` | No | Factory |
| setActive | `client.multiSession.setActive()` | `{ sessionToken: string }` | `{ data, error }` | Yes | Factory |
| revoke | `client.multiSession.revoke()` | `{ sessionToken: string }` | `{ data, error }` | Yes | Factory |

> Note: Method names differ from handoff expectations. `setActiveSession` is actually `setActive`, `revokeDeviceSession` is actually `revoke`.

---

### Two-Factor Plugin (`client.twoFactor.*`)

#### TOTP Methods

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| getTotpUri | `client.twoFactor.getTotpUri()` | `{ password: string }` | `{ data: { uri: string }, error }` | No | Factory |
| enable | `client.twoFactor.enable()` | `{ password: string, issuer?: string }` | `{ data, error }` | Yes | Factory |
| disable | `client.twoFactor.disable()` | `{ password: string }` | `{ data, error }` | Yes | Factory |
| verifyTotp | `client.twoFactor.verifyTotp()` | `{ code: string, trustDevice?: boolean }` | `{ data, error }` | Yes | Factory |

#### Backup Codes

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| generateBackupCodes | `client.twoFactor.generateBackupCodes()` | `{ password: string }` | `{ data: { codes: string[] }, error }` | No | Factory |
| verifyBackupCode | `client.twoFactor.verifyBackupCode()` | `{ code: string, disableSession?: boolean, trustDevice?: boolean }` | `{ data, error }` | Yes | Factory |
| viewBackupCodes | `client.twoFactor.viewBackupCodes()` | `{ userId?: string }` | `{ data: { codes: string[] }, error }` | No | Factory |

#### OTP Methods

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| sendOtp | `client.twoFactor.sendOtp()` | `{ trustDevice?: boolean }` | `{ data, error }` | No | Factory |
| verifyOtp | `client.twoFactor.verifyOtp()` | `{ code: string, trustDevice?: boolean }` | `{ data, error }` | Yes | Factory |

---

### Organization Plugin (`client.organization.*`)

#### CRUD Operations

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| create | `client.organization.create()` | `{ name, slug, logo?, metadata?, userId?, keepCurrentActiveOrganization? }` | `{ data: Organization, error }` | No | Factory |
| update | `client.organization.update()` | `{ data, name?, slug?, logo?, metadata? }` | `{ data: Organization, error }` | No | Factory |
| delete | `client.organization.delete()` | `{ organizationId }` | `{ data, error }` | No | Factory |
| list | `client.organization.list()` | `{}` | `{ data: Organization[], error }` | No | Factory |
| getFullOrganization | `client.organization.getFullOrganization()` | `{ organizationId?, organizationSlug?, membersLimit? }` | `{ data: FullOrg, error }` | No | Factory |
| setActive | `client.organization.setActive()` | `{ organizationId?, organizationSlug? }` | `{ data, error }` | Maybe* | Factory |
| checkSlug | `client.organization.checkSlug()` | `{ slug }` | `{ data: { available: boolean }, error }` | No | Factory |

> *`setActive` may affect session's active organization context.

#### Invitation Management

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| inviteMember | `client.organization.inviteMember()` | `{ email, role, organizationId?, resend?, teamId? }` | `{ data: Invitation, error }` | No | Factory |
| acceptInvitation | `client.organization.acceptInvitation()` | `{ invitationId }` | `{ data, error }` | Yes | Factory |
| rejectInvitation | `client.organization.rejectInvitation()` | `{ invitationId }` | `{ data, error }` | No | Factory |
| cancelInvitation | `client.organization.cancelInvitation()` | `{ invitationId }` | `{ data, error }` | No | Factory |
| getInvitation | `client.organization.getInvitation()` | `{ id }` | `{ data: Invitation, error }` | No | Factory |
| listInvitations | `client.organization.listInvitations()` | `{ organizationId? }` | `{ data: Invitation[], error }` | No | Factory |
| listUserInvitations | `client.organization.listUserInvitations()` | none | `{ data: Invitation[], error }` | No | Factory |

#### Member Management

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| listMembers | `client.organization.listMembers()` | `{ organizationId?, limit?, offset?, sortBy?, sortDirection?, filterField?, filterOperator?, filterValue? }` | `{ data: Member[], error }` | No | **Manual*** |
| removeMember | `client.organization.removeMember()` | `{ memberIdOrEmail, organizationId? }` | `{ data, error }` | No | Factory |
| updateMemberRole | `client.organization.updateMemberRole()` | `{ role, memberId, organizationId? }` | `{ data, error }` | No | Factory |
| getActiveMember | `client.organization.getActiveMember()` | `{}` | `{ data: Member, error }` | No | Factory |
| getActiveMemberRole | `client.organization.getActiveMemberRole()` | `{}` | `{ data: { role }, error }` | No | Factory |
| addMember | `client.organization.addMember()` | `{ userId?, role, organizationId?, teamId? }` | `{ data: Member, error }` | No | Factory |
| leave | `client.organization.leave()` | `{ organizationId }` | `{ data, error }` | Yes | Factory |

> *`listMembers` has complex pagination parameters that may need manual handling.

#### Access Control

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| hasPermission | `client.organization.hasPermission()` | `{ permissions }` | `{ data: boolean, error }` | No | Factory |
| checkRolePermission | `client.organization.checkRolePermission()` | `{ permissions, role }` | `{ data: boolean, error }` | No | Factory |

#### Dynamic Roles

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| createRole | `client.organization.createRole()` | `{ role, permission?, organizationId? }` | `{ data: Role, error }` | No | Factory |
| deleteRole | `client.organization.deleteRole()` | `{ roleName?, roleId?, organizationId? }` | `{ data, error }` | No | Factory |
| listRoles | `client.organization.listRoles()` | `{ organizationId? }` | `{ data: Role[], error }` | No | Factory |
| getRole | `client.organization.getRole()` | `{ roleName?, roleId?, organizationId? }` | `{ data: Role, error }` | No | Factory |
| updateRole | `client.organization.updateRole()` | `{ roleName?, roleId?, organizationId?, data, permission? }` | `{ data: Role, error }` | No | Factory |

#### Team Management

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| createTeam | `client.organization.createTeam()` | `{ name, organizationId? }` | `{ data: Team, error }` | No | Factory |
| listTeams | `client.organization.listTeams()` | `{ organizationId? }` | `{ data: Team[], error }` | No | Factory |
| updateTeam | `client.organization.updateTeam()` | `{ teamId, data, name?, organizationId?, createdAt?, updatedAt? }` | `{ data: Team, error }` | No | Factory |
| removeTeam | `client.organization.removeTeam()` | `{ teamId, organizationId? }` | `{ data, error }` | No | Factory |
| setActiveTeam | `client.organization.setActiveTeam()` | `{ teamId? }` | `{ data, error }` | Maybe | Factory |
| listUserTeams | `client.organization.listUserTeams()` | `{}` | `{ data: Team[], error }` | No | Factory |
| listTeamMembers | `client.organization.listTeamMembers()` | `{ teamId? }` | `{ data: Member[], error }` | No | Factory |
| addTeamMember | `client.organization.addTeamMember()` | `{ teamId, userId }` | `{ data, error }` | No | Factory |
| removeTeamMember | `client.organization.removeTeamMember()` | `{ teamId, userId }` | `{ data, error }` | No | Factory |

---

## Pattern Classification Summary

### Factory Pattern Candidates (~45)

Standard request/response with `{ data, error }` shape:
- All password management methods
- All multi-session methods
- All two-factor methods
- Most organization CRUD methods
- All invitation methods
- Most member methods
- All access control methods
- All role management methods
- All team management methods

### Manual Pattern Candidates (~10)

| Method | Reason |
|--------|--------|
| `sendVerificationEmail` | May need callback URL sanitization |
| `organization.listMembers` | Complex pagination parameters |
| `organization.updateTeam` | Complex `data` parameter structure |
| Any method with computed fields | Similar to `sign-up/email` |
| Any method with different response shape | Similar to `get-session` |

### Not Applicable

| Method | Reason |
|--------|--------|
| `verifyEmail` | Redirect-based, no direct client call |

---

## Handoff Corrections

The original handoff document had some method name discrepancies. Here are the corrections:

| Handoff Listed | Actual Method Name | Notes |
|----------------|-------------------|-------|
| `client.forgetPassword` | `client.requestPasswordReset` | Different name |
| `client.multiSession.setActiveSession` | `client.multiSession.setActive` | Shorter name |
| `client.multiSession.revokeDeviceSession` | `client.multiSession.revoke` | Shorter name |
| `client.multiSession.revokeSessions` | Via `client.signOut()` or core session methods | Plugin doesn't have bulk revoke |
| `client.twoFactor.getTOTPURI` | `client.twoFactor.getTotpUri` | camelCase |

---

## Implementation Priority

### Phase 1: Multi-Session (4 methods)
1. `listDeviceSessions` - Factory
2. `setActive` - Factory, mutates session
3. `revoke` - Factory, mutates session

### Phase 2: Password Recovery (3 methods)
1. `requestPasswordReset` - Factory
2. `resetPassword` - Factory
3. `changePassword` - Factory

### Phase 3: Email Verification (1-2 methods)
1. `sendVerificationEmail` - Factory or Manual

### Phase 4: Two-Factor (10 methods)
1. TOTP: `getTotpUri`, `enable`, `disable`, `verifyTotp`
2. Backup: `generateBackupCodes`, `verifyBackupCode`, `viewBackupCodes`
3. OTP: `sendOtp`, `verifyOtp`

### Phase 5: Organization (24 methods)
1. CRUD: `create`, `update`, `delete`, `list`, `getFullOrganization`, `setActive`, `checkSlug`
2. Invitations: 7 methods
3. Members: 7 methods
4. Access: 2 methods

### Phase 6: Organization Extended (14 methods)
1. Roles: 5 methods
2. Teams: 9 methods

### Phase 7: Integration & Documentation
- E2E testing
- AGENTS.md updates
- Usage examples

---

## Sources

- [Better Auth Documentation - Email & Password](https://www.better-auth.com/docs/authentication/email-password)
- [Better Auth Documentation - Multi-Session Plugin](https://www.better-auth.com/docs/plugins/multi-session)
- [Better Auth Documentation - 2FA Plugin](https://www.better-auth.com/docs/plugins/2fa)
- [Better Auth Documentation - Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- Codebase analysis of `packages/iam/client/src/adapters/better-auth/client.ts`
