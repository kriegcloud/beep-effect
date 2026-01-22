# Handoff: Phase 5 - OAuth2 + Device + JWT + Misc Sign-in

> Implement 22 better-auth client wrappers for OAuth2 provider, device flow, JWT, and additional sign-in methods

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods | 22 (oauth2, device, jwt, sign-in categories) |
| Workflow | 3-stage batched approach |
| Predecessor | Phase 4 (COMPLETED) |

---

## P4 Deliverables (Reference Materials)

| Document | Purpose |
|----------|---------|
| `outputs/phase-4-research.md` | Research template for Phase 5 |
| `outputs/method-implementation-guide.md` | Per-method specs (Methods 40-61) |

**Key P4 Findings:**

- `oneTimeToken.generate` requires `{ query: encodedPayload }` wrapping
- `phoneNumber.resetPassword` uses `otp` field (not `code`)
- Array responses use `S.Array(ItemSchema)`
- No-payload handlers use `() => client.method()`
- Session-mutating operations are rare in Phase 4 (only `oneTimeToken.verify`)

---

## Pre-Flight (DO FIRST)

```bash
bun run check --filter @beep/iam-client
git checkout -b feat/iam-client-wrappers-p5
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
| `passkey/` | `add-passkey`, `list-user-passkeys`, `delete-passkey`, `update-passkey` |
| `phone-number/` | `send-otp`, `verify`, `request-password-reset`, `reset-password` |
| `one-time-token/` | `verify`, `generate` |

---

## Methods to Implement

### OAuth2 Category (Methods 40-52) - 13 methods

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 40 | oauth2.getClient | Query-wrapped | `false` | Get OAuth2 client by ID |
| 41 | oauth2.publicClient | Standard | `false` | Get public client info |
| 42 | oauth2.getClients | No-payload | `false` | List all OAuth2 clients |
| 43 | oauth2.updateClient | Standard | `false` | Update OAuth2 client |
| 44 | oauth2.client.rotateSecret | Standard | `false` | Rotate client secret |
| 45 | oauth2.deleteClient | Standard | `false` | Delete OAuth2 client |
| 46 | oauth2.getConsent | Query-wrapped | `false` | Get consent record |
| 47 | oauth2.getConsents | No-payload | `false` | List all consents |
| 48 | oauth2.updateConsent | Standard | `false` | Update consent |
| 49 | oauth2.deleteConsent | Standard | `false` | Delete consent |
| 50 | oauth2.register | Standard | `false` | Register OAuth2 client |
| 51 | oauth2.consent | Standard | `false` | Grant consent |
| 52 | oauth2.continue | Standard | `false` | Continue OAuth2 flow |

### Device Category (Methods 53-56) - 4 methods

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 53 | device.code | Standard | `false` | Request device code |
| 54 | device.token | Standard | `false` | Exchange device code |
| 55 | device.approve | Standard | `true` | Approve device |
| 56 | device.deny | Standard | `true` | Deny device |

### JWT Category (Method 57) - 1 method

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 57 | jwks | No-payload | `false` | Get JWKS |

### Sign-in Extensions (Methods 58-61) - 4 methods

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 58 | signIn.social | Standard | `true` | Social sign-in |
| 59 | signIn.oauth2 | Standard | `true` | OAuth2 sign-in |
| 60 | signIn.anonymous | No-payload | `true` | Anonymous sign-in |
| 61 | oauth2.link | Standard | `true` | Link OAuth2 account |

**Detailed schemas**: See `outputs/method-implementation-guide.md` (Methods 40-61).

---

## 3-Stage Workflow

### Stage 1: Research All Methods

Create `outputs/phase-5-research.md` documenting for each method:
- Payload schema (fields and types)
- Response schema
- Special patterns: query-wrapped, no-payload, sensitive fields

**Checkpoint**: All methods documented before Stage 2.

### Stage 2: Create All Contracts

```bash
# OAuth2 category (new)
mkdir -p packages/iam/client/src/oauth2/{get-client,public-client,get-clients,update-client,rotate-secret,delete-client,get-consent,get-consents,update-consent,delete-consent,register,consent,continue,link}

# Device category (new)
mkdir -p packages/iam/client/src/device/{code,token,approve,deny}

# JWT category (new)
mkdir -p packages/iam/client/src/jwt/jwks

# Sign-in extensions (add to existing)
mkdir -p packages/iam/client/src/sign-in/{social,oauth2,anonymous}
```

Create all `contract.ts` files. **Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

### Stage 3: Handlers + Wire-up

1. Create all `handler.ts` files
2. Create `mod.ts` and `index.ts` (boilerplate)
3. Create `oauth2/layer.ts`, `oauth2/mod.ts`, `oauth2/index.ts`
4. Create `device/layer.ts`, `device/mod.ts`, `device/index.ts`
5. Create `jwt/layer.ts`, `jwt/mod.ts`, `jwt/index.ts`
6. Update `sign-in/layer.ts` and `sign-in/mod.ts` with new handlers
7. Update main `src/index.ts` to export `OAuth2`, `Device`, `JWT`

**Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

---

## Pattern Reference

**Full Templates**: See `outputs/phase-0-pattern-analysis.md`

**Query-wrapped handler** (used by oauth2.getClient, oauth2.getConsent):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.getClient({ query: encodedPayload }))
);
```

**No-payload handler** (used by getClients, getConsents, jwks, signIn.anonymous):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,  // or true for signIn.anonymous
  })(() => client.oauth2.getClients())
);
```

**Session-mutating handler** (used by device.approve/deny, signIn.social/oauth2/anonymous):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,  // Notifies $sessionSignal
  })((encodedPayload) => client.device.approve(encodedPayload))
);
```

---

## Key Gotchas

1. **Import paths**: `@beep/iam-client/_internal` (singular), `@beep/iam-client/adapters`
2. **Schema ID**: `$IamClientId.create("oauth2/get-client")`
3. **Client paths**: `client.oauth2.*`, `client.device.*`, `client.signIn.*`
4. **mutatesSession: true** for: `device.approve`, `device.deny`, `signIn.social`, `signIn.oauth2`, `signIn.anonymous`, `oauth2.link`
5. **Layer imports**: Import from `index.ts` namespace, not `mod.ts` directly
6. **Multiple new categories**: oauth2, device, jwt all need full layer/mod/index setup
7. **Sign-in extension**: Add to existing sign-in layer, not new category
8. **Query-wrapped methods**: `getClient`, `getConsent` need `{ query: encoded }`
9. **Sensitive fields**: `clientSecret` in oauth2.register, use `S.Redacted(S.String)`

---

## Success Criteria

- [x] All 22 `contract.ts` created
- [x] All 22 `handler.ts` created
- [x] `oauth2/` category created with layer
- [x] `device/` category created with layer
- [x] `jwt/` category created with layer
- [x] Sign-in extensions added to existing layer
- [x] `bun run check --filter @beep/iam-client` passes
- [x] `HANDOFF_P6.md` created

---

## Rollback

```bash
git checkout -- packages/iam/client/
```
