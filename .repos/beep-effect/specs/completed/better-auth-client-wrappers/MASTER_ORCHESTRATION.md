# Master Orchestration: better-auth-client-wrappers

> Complete workflow for implementing 70+ better-auth client method wrappers

---

## Orchestration Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE PROGRESSION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  P0: Infrastructure & Scope Reduction (analysis only)                       │
│      ↓                                                                      │
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

## Phase 0: Infrastructure & Scope Reduction

**Methods**: 0 (analysis and documentation only)
**Duration**: 1 session
**Agents**: codebase-researcher, doc-writer

### Purpose

Identify and create scope-reducing infrastructure before main implementation:
- Pattern analysis to categorize all 90 methods
- Shared response schemas for repeated patterns
- Copy-paste templates for boilerplate files
- Method implementation guide with per-method specs

### Deliverables

| Deliverable | Location |
|-------------|----------|
| Pattern analysis | `outputs/phase-0-pattern-analysis.md` |
| Method guide | `outputs/method-implementation-guide.md` |
| Shared schemas | `_internal/common.schemas.ts` (if beneficial) |
| Templates | Documented in handoff |

### Workflow

1. **Audit**: Examine existing handlers for patterns
2. **Categorize**: Classify all 90 methods by handler pattern
3. **Identify**: Find response schemas used 5+ times
4. **Implement**: Create shared utilities (if beneficial)
5. **Document**: Update handoffs with templates and guide
6. **Handoff**: Create `HANDOFF_P0.md` and update `HANDOFF_P1.md`

### Expected Scope Reduction

| Area | Savings |
|------|---------|
| mod.ts/index.ts | 100% (copy template) |
| Research time | 80% (use method guide) |
| Handler pattern | 90% (use pattern template) |
| **Total per-method** | **~35% reduction** |

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
| P0 | **COMPLETED** | N/A (infra) | Yes |
| P1 | **COMPLETED** | 9/9 | Yes |
| P2 | **COMPLETED** | 7/7 | Yes |
| P3 | **COMPLETED** | 11/13* | Yes |
| P4 | **COMPLETED** | 10/10 | Yes |
| P5 | **COMPLETED** | 22/22 | Yes |
| P6 | Not Started | 0/29 | No |
| **Total** | - | **59/90** | - |

*P3 Note: 11 handlers implemented. 2 SSO methods (verifyDomain, requestDomainVerification) are server-side only - contracts kept for future server-side use.

---

## P0 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/phase-0-pattern-analysis.md` | Handler patterns, file structure, JSDoc templates |
| `outputs/method-implementation-guide.md` | Per-method specs for all 90 methods |
| `outputs/OPTIMIZED_WORKFLOW.md` | 3-stage batched workflow details |

## P2 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/phase-2-research.md` | Admin method schemas and implementation notes |
| `handoffs/HANDOFF_P2.md` | Phase 2 context and reference |
| `handoffs/HANDOFF_P3.md` | Phase 3 handoff document |
| `handoffs/P3_ORCHESTRATOR_PROMPT.md` | Phase 3 orchestrator prompt |

### P2 Learnings

- **Role arrays**: Use `S.mutable(S.Array(...))` to match Better Auth's mutable types
- **listUsers**: Uses query-wrapped pattern `{ query: encoded }`
- **listUserSessions**: Does NOT use query wrapping - passes `encoded` directly
- **Password in createUser**: Use `S.optional(S.String)` - Better Auth expects plain string

## P3 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/phase-3-research.md` | Admin/SSO/Sign-in method schemas and implementation notes |
| `handoffs/HANDOFF_P3.md` | Phase 3 context and reference |
| `handoffs/HANDOFF_P4.md` | Phase 4 handoff document |
| `handoffs/P4_ORCHESTRATOR_PROMPT.md` | Phase 4 orchestrator prompt |

### P3 Learnings

- **Mutable arrays**: ALL arrays passed to Better Auth need `S.mutable()` wrapper
- **Literal types**: `role` in hasPermission must be `S.Literal("user", "admin")` not `S.String`
- **Server-side only methods**: SSO `verifyDomain` and `requestDomainVerification` don't exist on browser client - contracts kept for potential server-side use
- **SAML config**: Requires `spMetadata` object (not optional)
- **Passkey sign-in**: Minimal payload - only `autoFill: S.optional(S.Boolean)`
- **No-payload pattern**: `stopImpersonating` uses `() => client.admin.stopImpersonating()` (no encodedPayload)

## P4 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/phase-4-research.md` | Passkey/Phone-number/OneTimeToken schemas and implementation notes |
| `handoffs/HANDOFF_P4.md` | Phase 4 context and reference |
| `handoffs/HANDOFF_P5.md` | Phase 5 handoff document |
| `handoffs/P5_ORCHESTRATOR_PROMPT.md` | Phase 5 orchestrator prompt |

### P4 Learnings

- **Query-wrapped**: `oneTimeToken.generate` uses `{ query: encodedPayload }` pattern
- **Field naming**: `phoneNumber.resetPassword` uses `otp` field (not `code`)
- **No-payload handler**: `listUserPasskeys` uses `() => client.passkey.listUserPasskeys()` pattern
- **Session mutation**: Only `oneTimeToken.verify` mutates session in Phase 4
- **Passkey schema**: All passkey methods share similar response schema with id, name, publicKey, etc.
- **3 new categories**: passkey, phone-number, one-time-token all created with full layer/mod/index setup

## P5 Outputs

| Output | Purpose |
|--------|---------|
| `outputs/phase-5-research.md` | OAuth2/Device/JWT/Sign-in schemas and implementation notes |
| `handoffs/HANDOFF_P5.md` | Phase 5 context and reference |
| `handoffs/HANDOFF_P6.md` | Phase 6 handoff document |

### P5 Learnings

- **Snake_case field names**: Better Auth uses snake_case for many API fields (client_id, device_code, grant_type, redirect_uris, oauth_query). Contracts match this exactly.
- **Nested update structures**: `updateClient` and `updateConsent` use `{ client_id/id, update: {...} }` structure
- **Mutable arrays**: Schema arrays passed to Better Auth must use `S.mutable(S.Array(...))` to avoid readonly array incompatibility
- **Device token**: Requires `grant_type: "urn:ietf:params:oauth:grant-type:device_code"` literal
- **OAuth2 consent**: Uses `accept` boolean, `scope` string, `oauth_query` string (not clientId/scopes array)
- **OAuth2 continue**: All optional fields (selected, created, postLogin, oauth_query)
- **3 new categories**: oauth2, device, jwt all created with full layer/mod/index setup
- **Sign-in extensions**: social, oauth2, anonymous added to existing sign-in layer
