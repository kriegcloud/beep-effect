# Handoff: Phase 4 - Passkey + Phone-number + OneTimeToken

> Implement 10 better-auth client wrappers for passkey management, phone number verification, and one-time tokens

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods | 10 (passkey, phone-number, oneTimeToken categories) |
| Workflow | 3-stage batched approach |
| Predecessor | Phase 3 (COMPLETED) |

---

## P3 Deliverables (Reference Materials)

| Document | Purpose |
|----------|---------|
| `outputs/phase-3-research.md` | Research template for Phase 4 |
| `outputs/method-implementation-guide.md` | Per-method specs (Methods 30-39) |

**Key P3 Findings:**

- `S.mutable()` required for ALL arrays passed to Better Auth (e.g., `S.mutable(S.Array(S.String))`)
- `role` in `hasPermission` must be `S.Literal("user", "admin")` not `S.String`
- SSO domain verification methods (`verifyDomain`, `requestDomainVerification`) are **server-side only** - they don't exist on the browser client
- SAML config requires `spMetadata` object (not optional)
- Passkey sign-in payload has only `autoFill: S.optional(S.Boolean)`

---

## Pre-Flight (DO FIRST)

```bash
bun run check --filter @beep/iam-client
git checkout -b feat/iam-client-wrappers-p4
```

**If pre-flight fails**: Fix existing issues before proceeding.

---

## Existing Wrappers (DO NOT REIMPLEMENT)

| Category | Existing |
|----------|----------|
| `core/` | `sign-out`, `get-session`, `update-user`, `delete-user`, `revoke-session`, `revoke-other-sessions`, `revoke-sessions`, `link-social`, `list-accounts`, `unlink-account` |
| `username/` | `is-username-available` |
| `sign-in/` | `email`, `username`, `sso`, `passkey`, `phone-number` |
| `sign-up/` | `email` |
| `password/` | `change`, `request-reset`, `reset` |
| `admin/` | `set-role`, `create-user`, `update-user`, `list-users`, `list-user-sessions`, `unban-user`, `ban-user`, `impersonate-user`, `stop-impersonating`, `revoke-user-session`, `revoke-user-sessions`, `remove-user`, `set-user-password`, `has-permission` |
| `sso/` | `register` (+ contracts only: `verify-domain`, `request-domain-verification`) |

---

## Methods to Implement

### Passkey Category (Methods 30-33)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 30 | passkey.addPasskey | Standard | `false` | Add new passkey for user |
| 31 | passkey.listUserPasskeys | Standard | `false` | List user's passkeys |
| 32 | passkey.deletePasskey | Standard | `false` | `id` param |
| 33 | passkey.updatePasskey | Standard | `false` | `id` + `name` params |

### Phone-number Category (Methods 34-37)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 34 | phoneNumber.sendOtp | Standard | `false` | Send OTP to phone |
| 35 | phoneNumber.verify | Standard | `false` | Verify phone with code |
| 36 | phoneNumber.requestPasswordReset | Standard | `false` | Phone-based password reset |
| 37 | phoneNumber.resetPassword | Standard | `false` | Complete password reset |

### OneTimeToken Category (Methods 38-39)

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 38 | oneTimeToken.verify | Standard | `true` | Verify and consume token |
| 39 | oneTimeToken.generate | Standard | `false` | Generate new token |

**Detailed schemas**: See `outputs/method-implementation-guide.md` (Methods 30-39).

---

## 3-Stage Workflow

### Stage 1: Research All Methods

Create `outputs/phase-4-research.md` documenting for each method:
- Payload schema (fields and types)
- Response schema
- Special patterns: WebAuthn, OTP, sensitive fields

**Checkpoint**: All methods documented before Stage 2.

### Stage 2: Create All Contracts

```bash
# Passkey category (new)
mkdir -p packages/iam/client/src/passkey/{add-passkey,list-user-passkeys,delete-passkey,update-passkey}

# Phone-number category (new)
mkdir -p packages/iam/client/src/phone-number/{send-otp,verify,request-password-reset,reset-password}

# OneTimeToken category (new)
mkdir -p packages/iam/client/src/one-time-token/{verify,generate}
```

Create all `contract.ts` files. **Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

### Stage 3: Handlers + Wire-up

1. Create all `handler.ts` files
2. Create `mod.ts` and `index.ts` (boilerplate)
3. Create `passkey/layer.ts`, `passkey/mod.ts`, `passkey/index.ts`
4. Create `phone-number/layer.ts`, `phone-number/mod.ts`, `phone-number/index.ts`
5. Create `one-time-token/layer.ts`, `one-time-token/mod.ts`, `one-time-token/index.ts`
6. Update main `src/index.ts` to export `Passkey`, `PhoneNumber`, `OneTimeToken`

**Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

---

## Pattern Reference

**Full Templates**: See `outputs/phase-0-pattern-analysis.md`

**Standard handler with payload**:
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.passkey.addPasskey(encodedPayload))
);
```

**Session-mutating handler** (used by oneTimeToken.verify):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,  // Notifies $sessionSignal
  })((encodedPayload) => client.oneTimeToken.verify(encodedPayload))
);
```

**Sensitive field** (used by resetPassword):
```typescript
newPassword: S.Redacted(S.String)  // wrapIamMethod unwraps Redacted
```

---

## Key Gotchas

1. **Import paths**: `@beep/iam-client/_internal` (singular), `@beep/iam-client/adapters`
2. **Schema ID**: `$IamClientId.create("passkey/add-passkey")`
3. **Client paths**: `client.passkey.*`, `client.phoneNumber.*`, `client.oneTimeToken.*`
4. **mutatesSession: true** ONLY for `oneTimeToken.verify` (creates session)
5. **Layer imports**: Import from `index.ts` namespace, not `mod.ts` directly
6. **Three new categories**: All need full layer/mod/index setup
7. **Mutable arrays**: Use `S.mutable(S.Array(...))` if Better Auth expects mutable arrays

---

## Success Criteria

- [ ] All 10 `contract.ts` created
- [ ] All 10 `handler.ts` created
- [ ] `passkey/` category created with layer
- [ ] `phone-number/` category created with layer
- [ ] `one-time-token/` category created with layer
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `HANDOFF_P5.md` created

---

## Rollback

```bash
git checkout -- packages/iam/client/
```
