# Master Orchestration: better-auth-client-wrappers

> Complete workflow for implementing 70+ better-auth client method wrappers

---

## Orchestration Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE PROGRESSION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  P1: Core + Username (9 methods)                                            │
│      ↓                                                                      │
│  P2: Admin Part 1 (7 methods)                                               │
│      ↓                                                                      │
│  P3: Admin Part 2 + SSO + Sign-in (13 methods)                              │
│      ↓                                                                      │
│  P4: Passkey + Phone-number + OneTimeToken (10 methods)                     │
│      ↓                                                                      │
│  P5: OAuth-provider + Device + JWT (19 methods)                             │
│      ↓                                                                      │
│  P6: Organization + API-key + Remaining (30 methods)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Core + Username

**Methods**: 9
**Duration**: 1 session
**Agents**: web-researcher, effect-code-writer

### Methods to Implement

| # | Method | Category | mutatesSession | Doc Link |
|---|--------|----------|----------------|----------|
| 1 | updateUser | core | true | [link](https://www.better-auth.com/docs/concepts/users-accounts#update-user) |
| 2 | deleteUser | core | true | [link](https://www.better-auth.com/docs/concepts/users-accounts#delete-user) |
| 3 | revokeSession | core | true | [link](https://www.better-auth.com/docs/concepts/session-management#revoke-session) |
| 4 | revokeOtherSessions | core | true | [link](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions) |
| 5 | revokeSessions | core | true | [link](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions) |
| 6 | linkSocial | core | true | [link](https://www.better-auth.com/docs/concepts/users-accounts#account-linking) |
| 7 | listAccounts | core | false | [link](https://www.better-auth.com/docs/concepts/users-accounts#list-user-accounts) |
| 8 | unlinkAccount | core | true | [link](https://www.better-auth.com/docs/concepts/users-accounts#account-unlinking) |
| 9 | isUsernameAvailable | username | false | [link](https://www.better-auth.com/docs/plugins/username#check-if-username-is-available) |

### Workflow

1. **Research** (web-researcher): Fetch each doc link, extract payload/response schemas
2. **Implement** (effect-code-writer): Create contract + handler for each method
3. **Layer Update**: Add all handlers to `core/layer.ts` and create `username/layer.ts`
4. **Verify**: `bun run check --filter @beep/iam-client`
5. **Handoff**: Create `HANDOFF_P2.md` and `P2_ORCHESTRATOR_PROMPT.md`

---

## Phase 2: Admin Part 1

**Methods**: 7
**Duration**: 1 session
**Agents**: web-researcher, effect-code-writer

### Methods to Implement

| # | Method | Category | mutatesSession | Doc Link |
|---|--------|----------|----------------|----------|
| 1 | setRole | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#set-user-role) |
| 2 | createUser | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#create-user) |
| 3 | updateUser | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#update-user) |
| 4 | listUsers | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#list-users) |
| 5 | listUserSessions | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#list-user-sessions) |
| 6 | unbanUser | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#unban-user) |
| 7 | banUser | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#ban-user) |

### Workflow

1. **Research**: Fetch admin plugin docs, extract schemas
2. **Implement**: Create `admin/` folder with all handlers
3. **Layer**: Create `admin/layer.ts` with WrapperGroup
4. **Verify**: `bun run check --filter @beep/iam-client`
5. **Handoff**: Create `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md`

---

## Phase 3: Admin Part 2 + SSO + Sign-in

**Methods**: 13
**Duration**: 1 session
**Agents**: web-researcher, effect-code-writer

### Methods to Implement

| # | Method | Category | mutatesSession | Doc Link |
|---|--------|----------|----------------|----------|
| 1 | impersonateUser | admin | true | [link](https://www.better-auth.com/docs/plugins/admin#impersonate-user) |
| 2 | stopImpersonating | admin | true | [link](https://www.better-auth.com/docs/plugins/admin#stop-impersonating-user) |
| 3 | revokeUserSession | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#revoke-user-session) |
| 4 | revokeUserSessions | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#revoke-all-sessions-for-a-user) |
| 5 | removeUser | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#remove-user) |
| 6 | setUserPassword | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#set-user-password) |
| 7 | hasPermission | admin | false | [link](https://www.better-auth.com/docs/plugins/admin#access-control-usage) |
| 8 | sso.register | sso | false | [link](https://www.better-auth.com/docs/plugins/sso#register-an-oidc-provider) |
| 9 | sso.verifyDomain | sso | false | [link](https://www.better-auth.com/docs/plugins/sso#domain-validation-request) |
| 10 | sso.requestDomainVerification | sso | false | [link](https://www.better-auth.com/docs/plugins/sso#creating-a-new-verification-token) |
| 11 | signIn.sso | sign-in | true | [link](https://www.better-auth.com/docs/plugins/sso#sign-in-with-sso) |
| 12 | signIn.passkey | sign-in | true | [link](https://www.better-auth.com/docs/plugins/passkey#sign-in-with-a-passkey) |
| 13 | signIn.phoneNumber | sign-in | true | [link](https://www.better-auth.com/docs/plugins/phone-number#sign-in-with-phone-number) |

---

## Phase 4: Passkey + Phone-number + OneTimeToken

**Methods**: 10
**Duration**: 1 session
**Agents**: web-researcher, effect-code-writer

### Methods to Implement

| # | Method | Category | mutatesSession | Doc Link |
|---|--------|----------|----------------|----------|
| 1 | passkey.addPasskey | passkey | false | [link](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-add-passkey) |
| 2 | passkey.listUserPasskeys | passkey | false | [link](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-list-user-passkeys) |
| 3 | passkey.deletePasskey | passkey | false | [link](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-delete-passkey) |
| 4 | passkey.updatePasskey | passkey | false | [link](https://www.better-auth.com/docs/plugins/passkey#api-method-passkey-update-passkey) |
| 5 | phoneNumber.sendOtp | phone-number | false | [link](https://www.better-auth.com/docs/plugins/phone-number#send-otp-for-verification) |
| 6 | phoneNumber.verify | phone-number | false | [link](https://www.better-auth.com/docs/plugins/phone-number#verify-phone-number) |
| 7 | phoneNumber.requestPasswordReset | phone-number | false | [link](https://www.better-auth.com/docs/plugins/phone-number#request-password-reset) |
| 8 | phoneNumber.resetPassword | phone-number | false | [link](https://www.better-auth.com/docs/plugins/phone-number#api-method-phone-number-reset-password) |
| 9 | oneTimeToken.verify | oneTimeToken | true | [link](https://www.better-auth.com/docs/plugins/one-time-token#2-verify-the-token) |
| 10 | oneTimeToken.generate | oneTimeToken | false | [link](https://www.better-auth.com/docs/plugins/one-time-token#1-generate-a-token) |

---

## Phase 5: OAuth-provider + Device + JWT + Misc Sign-in

**Methods**: 22
**Duration**: 1-2 sessions
**Agents**: web-researcher, effect-code-writer

### Methods to Implement

| # | Method | Category | mutatesSession |
|---|--------|----------|----------------|
| 1 | oauth2.getClient | oauth-provider | false |
| 2 | oauth2.publicClient | oauth-provider | false |
| 3 | oauth2.getClients | oauth-provider | false |
| 4 | oauth2.updateClient | oauth-provider | false |
| 5 | oauth2.client.rotateSecret | oauth-provider | false |
| 6 | oauth2.deleteClient | oauth-provider | false |
| 7 | oauth2.getConsent | oauth-provider | false |
| 8 | oauth2.getConsents | oauth-provider | false |
| 9 | oauth2.updateConsent | oauth-provider | false |
| 10 | oauth2.deleteConsent | oauth-provider | false |
| 11 | oauth2.register | oauth-provider | false |
| 12 | oauth2.consent | oauth-provider | false |
| 13 | oauth2.continue | oauth-provider | false |
| 14 | device.code | device | false |
| 15 | device.token | device | false |
| 16 | device.approve | device | true |
| 17 | device.deny | device | true |
| 18 | jwks | jwt | false |
| 19 | signIn.social | sign-in | true |
| 20 | signIn.oauth2 | sign-in | true |
| 21 | signIn.anonymous | sign-in | true |
| 22 | oauth2.link | oauth2 | true |

---

## Phase 6: Organization + API-key + Remaining

**Methods**: 30
**Duration**: 2 sessions (split into P6a and P6b)
**Agents**: web-researcher, effect-code-writer

### Organization Methods (24)

| # | Method | mutatesSession |
|---|--------|----------------|
| 1 | checkSlug | false |
| 2 | getInvitation | false |
| 3 | listUserInvitations | false |
| 4 | getActiveMember | false |
| 5 | getActiveMemberRole | false |
| 6 | addMember | true |
| 7 | leave | true |
| 8 | checkRolePermission | false |
| 9 | createRole | true |
| 10 | deleteRole | true |
| 11 | listRoles | false |
| 12 | getRole | false |
| 13 | updateRole | true |
| 14 | createTeam | true |
| 15 | listTeams | false |
| 16 | updateTeam | true |
| 17 | removeTeam | true |
| 18 | setActiveTeam | true |
| 19 | listUserTeams | false |
| 20 | addTeamMember | true |
| 21 | removeTeamMember | true |
| 22 | scim.generateToken | false |
| 23 | deleteAnonymousUser | true |

### API-key Methods (5)

| # | Method | mutatesSession |
|---|--------|----------------|
| 1 | apiKey.create | false |
| 2 | apiKey.get | false |
| 3 | apiKey.update | false |
| 4 | apiKey.delete | false |
| 5 | apiKey.list | false |

---

## Verification Protocol

After each phase:

```bash
# Type check
bun run check --filter @beep/iam-client

# Lint fix
bun run lint:fix --filter @beep/iam-client

# Build (if applicable)
bun run build --filter @beep/iam-client
```

---

## Handoff Requirements

Each phase MUST produce:

1. **`handoffs/HANDOFF_P[N+1].md`** - Full context document
   - Methods implemented this phase
   - Verified response schemas
   - Layer updates made
   - Known issues

2. **`handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`** - Copy-paste prompt
   - Mission statement
   - Methods to implement
   - Pattern reminders
   - Verification commands

---

## Progress Tracking

| Phase | Status | Methods | Verified |
|-------|--------|---------|----------|
| P1 | Not Started | 0/9 | No |
| P2 | Not Started | 0/7 | No |
| P3 | Not Started | 0/13 | No |
| P4 | Not Started | 0/10 | No |
| P5 | Not Started | 0/22 | No |
| P6 | Not Started | 0/29 | No |
| **Total** | - | **0/90** | - |
