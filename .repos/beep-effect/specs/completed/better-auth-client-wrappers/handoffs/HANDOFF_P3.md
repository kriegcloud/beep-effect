# Handoff: Phase 3 - Admin Part 2 + SSO + Sign-in

> Implement 13 better-auth client wrappers for admin, SSO, and sign-in

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods | 13 (admin, sso, sign-in categories) |
| Workflow | 3-stage batched approach |
| Predecessor | Phase 2 (COMPLETED) |

---

## P2 Deliverables (Reference Materials)

| Document | Purpose |
|----------|---------|
| `outputs/phase-2-research.md` | Research template for Phase 3 |
| `outputs/method-implementation-guide.md` | Per-method specs (Methods 17-29) |

**Key P2 Findings:**

- Role schemas need `S.mutable()` for arrays to match Better Auth's mutable types
- `listUserSessions` does NOT use query wrapping (direct `encodedPayload`)
- `listUsers` DOES use query wrapping (`{ query: encoded }`)
- All Phase 2 admin methods use `mutatesSession: false`

---

## Pre-Flight (DO FIRST)

```bash
bun run check --filter @beep/iam-client
git checkout -b feat/iam-client-wrappers-p3
```

**If pre-flight fails**: Fix existing issues before proceeding.

---

## Existing Wrappers (DO NOT REIMPLEMENT)

| Category | Existing |
|----------|----------|
| `core/` | `sign-out`, `get-session`, `update-user`, `delete-user`, `revoke-session`, `revoke-other-sessions`, `revoke-sessions`, `link-social`, `list-accounts`, `unlink-account` |
| `username/` | `is-username-available` |
| `sign-in/` | `email`, `username` |
| `sign-up/` | `email` |
| `password/` | `change`, `request-reset`, `reset` |
| `admin/` | `set-role`, `create-user`, `update-user`, `list-users`, `list-user-sessions`, `unban-user`, `ban-user` |

---

## Methods to Implement

### Admin Category (Methods 17-23)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 17 | admin.impersonateUser | Standard | `true` | Returns session + user |
| 18 | admin.stopImpersonating | **No-payload** | `true` | Returns session + user |
| 19 | admin.revokeUserSession | Standard | `false` | `sessionToken` param |
| 20 | admin.revokeUserSessions | Standard | `false` | `userId` param |
| 21 | admin.removeUser | Standard | `false` | `userId` param |
| 22 | admin.setUserPassword | Standard | `false` | `userId` + `newPassword` |
| 23 | admin.hasPermission | Standard | `false` | `permission` param |

### SSO Category (Methods 24-26)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 24 | sso.register | Standard | `false` | OIDC provider registration |
| 25 | sso.verifyDomain | Standard | `false` | Domain verification |
| 26 | sso.requestDomainVerification | Standard | `false` | Request verification token |

### Sign-in Category (Methods 27-29)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 27 | signIn.sso | Standard | `true` | SSO redirect flow |
| 28 | signIn.passkey | Standard | `true` | WebAuthn passkey |
| 29 | signIn.phoneNumber | Standard | `true` | Phone OTP |

**Detailed schemas**: See `outputs/method-implementation-guide.md` (Methods 17-29).

---

## 3-Stage Workflow

### Stage 1: Research All Methods

Create `outputs/phase-3-research.md` documenting for each method:
- Payload schema (fields and types)
- Response schema
- Special patterns: no-payload, sensitive fields

**Checkpoint**: All methods documented before Stage 2.

### Stage 2: Create All Contracts

```bash
# Admin additions
mkdir -p packages/iam/client/src/admin/{impersonate-user,stop-impersonating,revoke-user-session,revoke-user-sessions,remove-user,set-user-password,has-permission}

# SSO category (new)
mkdir -p packages/iam/client/src/sso/{register,verify-domain,request-domain-verification}

# Sign-in additions
mkdir -p packages/iam/client/src/sign-in/{sso,passkey,phone-number}
```

Create all `contract.ts` files. **Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

### Stage 3: Handlers + Wire-up

1. Create all `handler.ts` files
2. Create `mod.ts` and `index.ts` (boilerplate)
3. Update `admin/layer.ts` with new handlers
4. Create `sso/layer.ts`, `sso/mod.ts`, `sso/index.ts`
5. Update `sign-in/layer.ts` with new handlers
6. Update main `src/index.ts` to export `SSO`

**Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

---

## Pattern Reference

**Full Templates**: See `outputs/phase-0-pattern-analysis.md`

**No-payload handler** (used by stopImpersonating):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.admin.stopImpersonating())
);
```

**Session-mutating handler** (used by impersonateUser, signIn.*):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,  // Notifies $sessionSignal
  })((encodedPayload) => client.admin.impersonateUser(encodedPayload))
);
```

**Sensitive field** (used by setUserPassword):
```typescript
newPassword: S.Redacted(S.String)  // Note: wrapIamMethod unwraps Redacted
```

---

## Key Gotchas

1. **Import paths**: `@beep/iam-client/_internal` (singular), `@beep/iam-client/adapters`
2. **Schema ID**: `$IamClientId.create("admin/impersonate-user")`
3. **No-payload**: `() => client.admin.stopImpersonating()` (no encodedPayload)
4. **mutatesSession: true** for impersonation and sign-in operations
5. **Layer imports**: Import from `index.ts` namespace, not `mod.ts` directly
6. **SSO is new category**: Needs full layer/mod/index setup like admin

---

## Success Criteria

- [ ] All 13 `contract.ts` created
- [ ] All 13 `handler.ts` created
- [ ] `admin/layer.ts` updated with 7 new handlers
- [ ] `sso/` category created with layer
- [ ] `sign-in/` updated with 3 new handlers
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `HANDOFF_P4.md` created

---

## Rollback

```bash
git checkout -- packages/iam/client/
```
