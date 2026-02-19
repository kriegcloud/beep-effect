# better-auth-client-wrappers: Agent Prompts

> Pre-configured prompts for each phase of the specification workflow.

---

## Complete Method Reference with Documentation Links

### Admin Methods (14)

| Method | Documentation |
|--------|---------------|
| client.admin.setRole | [Set User Role](https://www.better-auth.com/docs/plugins/admin#set-user-role) |
| client.admin.createUser | [Create User](https://www.better-auth.com/docs/plugins/admin#create-user) |
| client.admin.updateUser | [Update User](https://www.better-auth.com/docs/plugins/admin#update-user) |
| client.admin.listUsers | [List Users](https://www.better-auth.com/docs/plugins/admin#list-users) |
| client.admin.listUserSessions | [List User Sessions](https://www.better-auth.com/docs/plugins/admin#list-user-sessions) |
| client.admin.unbanUser | [Unban User](https://www.better-auth.com/docs/plugins/admin#unban-user) |
| client.admin.banUser | [Ban User](https://www.better-auth.com/docs/plugins/admin#ban-user) |
| client.admin.impersonateUser | [Impersonate User](https://www.better-auth.com/docs/plugins/admin#impersonate-user) |
| client.admin.stopImpersonating | [Stop Impersonating](https://www.better-auth.com/docs/plugins/admin#stop-impersonating-user) |
| client.admin.revokeUserSession | [Revoke User Session](https://www.better-auth.com/docs/plugins/admin#revoke-user-session) |
| client.admin.revokeUserSessions | [Revoke All User Sessions](https://www.better-auth.com/docs/plugins/admin#revoke-all-sessions-for-a-user) |
| client.admin.removeUser | [Remove User](https://www.better-auth.com/docs/plugins/admin#remove-user) |
| client.admin.setUserPassword | [Set User Password](https://www.better-auth.com/docs/plugins/admin#set-user-password) |
| client.admin.hasPermission | [Has Permission](https://www.better-auth.com/docs/plugins/admin#access-control-usage) |

### Core Methods (8)

| Method | Documentation |
|--------|---------------|
| client.updateUser | [Update User](https://www.better-auth.com/docs/concepts/users-accounts#update-user) |
| client.deleteUser | [Delete User](https://www.better-auth.com/docs/concepts/users-accounts#delete-user) |
| client.revokeSession | [Revoke Session](https://www.better-auth.com/docs/concepts/session-management#revoke-session) |
| client.revokeOtherSessions | [Revoke Other Sessions](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions) |
| client.revokeSessions | [Revoke All Sessions](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions) |
| client.linkSocial | [Link Social](https://www.better-auth.com/docs/concepts/users-accounts#account-linking) |
| client.listAccounts | [List Accounts](https://www.better-auth.com/docs/concepts/users-accounts#list-user-accounts) |
| client.unlinkAccount | [Unlink Account](https://www.better-auth.com/docs/concepts/users-accounts#account-unlinking) |

### SSO Methods (3)

| Method | Documentation |
|--------|---------------|
| client.sso.register | [Register OIDC Provider](https://www.better-auth.com/docs/plugins/sso#register-an-oidc-provider) |
| client.sso.verifyDomain | [Verify Domain](https://www.better-auth.com/docs/plugins/sso#domain-validation-request) |
| client.sso.requestDomainVerification | [Request Domain Verification](https://www.better-auth.com/docs/plugins/sso#creating-a-new-verification-token) |

### Username Methods (1)

| Method | Documentation |
|--------|---------------|
| client.isUsernameAvailable | [Check Username Available](https://www.better-auth.com/docs/plugins/username#check-if-username-is-available) |

### Sign-in Methods (6)

| Method | Documentation |
|--------|---------------|
| client.signIn.sso | [Sign In SSO](https://www.better-auth.com/docs/plugins/sso#sign-in-with-sso) |
| client.signIn.passkey | [Sign In Passkey](https://www.better-auth.com/docs/plugins/passkey#sign-in-with-a-passkey) |
| client.signIn.phoneNumber | [Sign In Phone](https://www.better-auth.com/docs/plugins/phone-number#sign-in-with-phone-number) |
| client.signIn.social | [Sign In Social](https://www.better-auth.com/docs/concepts/oauth#sign-in) |
| client.signIn.oauth2 | [Sign In OAuth2](https://www.better-auth.com/docs/plugins/generic-oauth#initiate-oauth-sign-in) |
| client.signIn.anonymous | [Sign In Anonymous](https://www.better-auth.com/docs/plugins/anonymous#sign-in) |

### Passkey Methods (4)

| Method | Documentation |
|--------|---------------|
| client.passkey.addPasskey | [Add Passkey](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-add-passkey) |
| client.passkey.listUserPasskeys | [List User Passkeys](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-list-user-passkeys) |
| client.passkey.deletePasskey | [Delete Passkey](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-delete-passkey) |
| client.passkey.updatePasskey | [Update Passkey](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-update-passkey) |

### OAuth Provider Methods (14)

| Method | Documentation |
|--------|---------------|
| client.oauth2.getClient | [Get Client](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-get-client) |
| client.oauth2.publicClient | [Get Public Client](https://www.better-auth.com/docs/plugins/oauth-provider#get-public-client) |
| client.oauth2.getClients | [Get Clients](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-get-clients) |
| client.oauth2.updateClient | [Update Client](https://www.better-auth.com/docs/plugins/oauth-provider#update-client) |
| client.oauth2.client.rotateSecret | [Rotate Secret](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-client-rotate-secret) |
| client.oauth2.deleteClient | [Delete Client](https://www.better-auth.com/docs/plugins/oauth-provider#delete-client) |
| client.oauth2.getConsent | [Get Consent](https://www.better-auth.com/docs/plugins/oauth-provider#get-consent) |
| client.oauth2.getConsents | [Get Consents](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-get-consents) |
| client.oauth2.updateConsent | [Update Consent](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-update-consent) |
| client.oauth2.deleteConsent | [Delete Consent](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-delete-consent) |
| client.oauth2.register | [Register](https://www.better-auth.com/docs/plugins/oauth-provider#basic-example) |
| client.oauth2.consent | [Consent](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-consent) |
| client.oauth2.continue | [Continue](https://www.better-auth.com/docs/plugins/oauth-provider#api-method-oauth2-continue) |

### Phone Number Methods (4)

| Method | Documentation |
|--------|---------------|
| client.phoneNumber.sendOtp | [Send OTP](https://www.better-auth.com/docs/plugins/phone-number#send-otp-for-verification) |
| client.phoneNumber.verify | [Verify Phone](https://www.better-auth.com/docs/plugins/phone-number#verify-phone-number) |
| client.phoneNumber.requestPasswordReset | [Request Password Reset](https://www.better-auth.com/docs/plugins/phone-number#request-password-reset) |
| client.phoneNumber.resetPassword | [Reset Password](https://www.better-auth.com/docs/plugins/phone-number#api-method-phone-number-reset-password) |

### OneTimeToken Methods (2)

| Method | Documentation |
|--------|---------------|
| client.oneTimeToken.verify | [Verify Token](https://www.better-auth.com/docs/plugins/one-time-token#2-verify-the-token) |
| client.oneTimeToken.generate | [Generate Token](https://www.better-auth.com/docs/plugins/one-time-token#1-generate-a-token) |

### JWT Methods (1)

| Method | Documentation |
|--------|---------------|
| client.jwks | [JWKS](https://www.better-auth.com/docs/plugins/jwt#custom-jwks-path) |

### Generic OAuth2 Methods (1)

| Method | Documentation |
|--------|---------------|
| client.oauth2.link | [Link OAuth](https://www.better-auth.com/docs/plugins/generic-oauth#linking-oauth-accounts) |

### Device Authorization Methods (4)

| Method | Documentation |
|--------|---------------|
| client.device.code | [Request Device Code](https://www.better-auth.com/docs/plugins/device-authorization#requesting-device-authorization) |
| client.device.token | [Poll for Token](https://www.better-auth.com/docs/plugins/device-authorization#polling-for-token) |
| client.device.approve | [Approve Device](https://www.better-auth.com/docs/plugins/device-authorization#approve-device) |
| client.device.deny | [Deny Device](https://www.better-auth.com/docs/plugins/device-authorization#deny-device) |

### SCIM Methods (1)

| Method | Documentation |
|--------|---------------|
| client.scim.generateToken | [Generate SCIM Token](https://www.better-auth.com/docs/plugins/scim#generating-a-scim-token) |

### API Key Methods (5)

| Method | Documentation |
|--------|---------------|
| client.apiKey.create | [Create API Key](https://www.better-auth.com/docs/plugins/api-key#create-an-api-key) |
| client.apiKey.get | [Get API Key](https://www.better-auth.com/docs/plugins/api-key#get-an-api-key) |
| client.apiKey.update | [Update API Key](https://www.better-auth.com/docs/plugins/api-key#update-an-api-key) |
| client.apiKey.delete | [Delete API Key](https://www.better-auth.com/docs/plugins/api-key#delete-an-api-key) |
| client.apiKey.list | [List API Keys](https://www.better-auth.com/docs/plugins/api-key#list-api-keys) |

### Anonymous Methods (1)

| Method | Documentation |
|--------|---------------|
| client.deleteAnonymousUser | [Delete Anonymous User](https://www.better-auth.com/docs/plugins/anonymous#delete-anonymous-user) |

### Organization Methods (24)

| Method | Documentation |
|--------|---------------|
| client.organization.checkSlug | [Check Slug](https://www.better-auth.com/docs/plugins/organization#api-method-organization-check-slug) |
| client.organization.getInvitation | [Get Invitation](https://www.better-auth.com/docs/plugins/organization#get-invitation) |
| client.organization.listUserInvitations | [List User Invitations](https://www.better-auth.com/docs/plugins/organization#list-user-invitations) |
| client.organization.getActiveMember | [Get Active Member](https://www.better-auth.com/docs/plugins/organization#get-active-member) |
| client.organization.getActiveMemberRole | [Get Active Member Role](https://www.better-auth.com/docs/plugins/organization#get-active-member-role) |
| client.organization.addMember | [Add Member](https://www.better-auth.com/docs/plugins/organization#add-member) |
| client.organization.leave | [Leave Organization](https://www.better-auth.com/docs/plugins/organization#leave-organization) |
| client.organization.checkRolePermission | [Check Role Permission](https://www.better-auth.com/docs/plugins/organization#access-control-usage) |
| client.organization.createRole | [Create Role](https://www.better-auth.com/docs/plugins/organization#create-roles) |
| client.organization.deleteRole | [Delete Role](https://www.better-auth.com/docs/plugins/organization#deleting-a-role) |
| client.organization.listRoles | [List Roles](https://www.better-auth.com/docs/plugins/organization#listing-roles) |
| client.organization.getRole | [Get Role](https://www.better-auth.com/docs/plugins/organization#getting-a-specific-role) |
| client.organization.updateRole | [Update Role](https://www.better-auth.com/docs/plugins/organization#updating-a-role) |
| client.organization.createTeam | [Create Team](https://www.better-auth.com/docs/plugins/organization#create-team) |
| client.organization.listTeams | [List Teams](https://www.better-auth.com/docs/plugins/organization#list-teams) |
| client.organization.updateTeam | [Update Team](https://www.better-auth.com/docs/plugins/organization#update-team) |
| client.organization.removeTeam | [Remove Team](https://www.better-auth.com/docs/plugins/organization#remove-team) |
| client.organization.setActiveTeam | [Set Active Team](https://www.better-auth.com/docs/plugins/organization#set-active-team) |
| client.organization.listUserTeams | [List User Teams](https://www.better-auth.com/docs/plugins/organization#list-user-teams) |
| client.organization.addTeamMember | [Add Team Member](https://www.better-auth.com/docs/plugins/organization#add-team-member) |
| client.organization.removeTeamMember | [Remove Team Member](https://www.better-auth.com/docs/plugins/organization#remove-team-member) |

---

## Phase-Specific Prompts

### Phase 1: Core + Username

```
Implement 9 better-auth client wrappers for core user/session operations.

Methods to implement with documentation links:
1. client.updateUser - https://www.better-auth.com/docs/concepts/users-accounts#update-user
2. client.deleteUser - https://www.better-auth.com/docs/concepts/users-accounts#delete-user
3. client.revokeSession - https://www.better-auth.com/docs/concepts/session-management#revoke-session
4. client.revokeOtherSessions - https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions
5. client.revokeSessions - https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions
6. client.linkSocial - https://www.better-auth.com/docs/concepts/users-accounts#account-linking
7. client.listAccounts - https://www.better-auth.com/docs/concepts/users-accounts#list-user-accounts
8. client.unlinkAccount - https://www.better-auth.com/docs/concepts/users-accounts#account-unlinking
9. client.isUsernameAvailable - https://www.better-auth.com/docs/plugins/username#check-if-username-is-available

For each method:
1. Fetch the documentation URL to understand payload/response schemas
2. Create contract.ts with Payload, Success, and Wrapper
3. Create handler.ts using wrapIamMethod
4. Create mod.ts and index.ts exports
5. Update the appropriate layer file

Reference existing patterns in: packages/iam/clients/src/sign-in/email/
```

### Phase 2: Admin Part 1

```
Implement 7 admin better-auth client wrappers.

Methods to implement with documentation links:
1. client.admin.setRole - https://www.better-auth.com/docs/plugins/admin#set-user-role
2. client.admin.createUser - https://www.better-auth.com/docs/plugins/admin#create-user
3. client.admin.updateUser - https://www.better-auth.com/docs/plugins/admin#update-user
4. client.admin.listUsers - https://www.better-auth.com/docs/plugins/admin#list-users
5. client.admin.listUserSessions - https://www.better-auth.com/docs/plugins/admin#list-user-sessions
6. client.admin.unbanUser - https://www.better-auth.com/docs/plugins/admin#unban-user
7. client.admin.banUser - https://www.better-auth.com/docs/plugins/admin#ban-user

Create packages/iam/clients/src/admin/ folder structure.
```

### Phase 3: Admin Part 2 + SSO + Sign-in

```
Implement 13 better-auth client wrappers.

Admin methods:
1. client.admin.impersonateUser - https://www.better-auth.com/docs/plugins/admin#impersonate-user
2. client.admin.stopImpersonating - https://www.better-auth.com/docs/plugins/admin#stop-impersonating-user
3. client.admin.revokeUserSession - https://www.better-auth.com/docs/plugins/admin#revoke-user-session
4. client.admin.revokeUserSessions - https://www.better-auth.com/docs/plugins/admin#revoke-all-sessions-for-a-user
5. client.admin.removeUser - https://www.better-auth.com/docs/plugins/admin#remove-user
6. client.admin.setUserPassword - https://www.better-auth.com/docs/plugins/admin#set-user-password
7. client.admin.hasPermission - https://www.better-auth.com/docs/plugins/admin#access-control-usage

SSO methods:
8. client.sso.register - https://www.better-auth.com/docs/plugins/sso#register-an-oidc-provider
9. client.sso.verifyDomain - https://www.better-auth.com/docs/plugins/sso#domain-validation-request
10. client.sso.requestDomainVerification - https://www.better-auth.com/docs/plugins/sso#creating-a-new-verification-token

Sign-in methods:
11. client.signIn.sso - https://www.better-auth.com/docs/plugins/sso#sign-in-with-sso
12. client.signIn.passkey - https://www.better-auth.com/docs/plugins/passkey#sign-in-with-a-passkey
13. client.signIn.phoneNumber - https://www.better-auth.com/docs/plugins/phone-number#sign-in-with-phone-number
```

---

## Web Researcher Prompt Template

```
Fetch the better-auth documentation at [URL] and extract:
1. Request payload structure (all fields with types)
2. Response data structure (all fields with types)
3. Whether the operation is session-mutating
4. Any special handling notes (query wrapping, etc.)

Return in this format:

## [Method Name]

### Payload
```typescript
{
  fieldName: TypeName,
  optionalField?: TypeName,
}
```

### Response
```typescript
{
  data: {
    fieldName: TypeName,
  }
}
```

### Notes
- mutatesSession: true/false
- Special handling: none / query-wrapped / etc.
```

---

## Effect Code Writer Prompt Template

```
Create better-auth client wrapper for [METHOD_NAME].

Documentation: [DOC_URL]

Payload schema (from docs):
[PAYLOAD_FIELDS]

Response schema (from docs):
[RESPONSE_FIELDS]

Settings:
- mutatesSession: [true/false]
- Category folder: [CATEGORY]
- Operation folder: [OPERATION_NAME]

Create these files:
1. packages/iam/clients/src/[CATEGORY]/[OPERATION]/contract.ts
2. packages/iam/clients/src/[CATEGORY]/[OPERATION]/handler.ts
3. packages/iam/clients/src/[CATEGORY]/[OPERATION]/mod.ts
4. packages/iam/clients/src/[CATEGORY]/[OPERATION]/index.ts

Follow patterns from: packages/iam/clients/src/sign-in/email/
```
