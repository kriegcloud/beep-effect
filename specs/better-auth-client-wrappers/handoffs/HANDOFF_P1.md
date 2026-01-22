# Handoff: Phase 1 - Core + Username

> Implement 9 better-auth client wrappers for core user/session operations

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods | 9 (core: 8, username: 1) |
| Workflow | 3-stage batched approach |

---

## Pre-Flight (DO FIRST)

```bash
bun run check --filter @beep/iam-client
git checkout -b feat/iam-client-wrappers-p1
```

**If pre-flight fails**: Fix existing issues before proceeding.

---

## Existing Wrappers (DO NOT REIMPLEMENT)

| Category | Existing |
|----------|----------|
| `core/` | `sign-out`, `get-session` |
| `sign-in/` | `email`, `username` |
| `sign-up/` | `email` |
| `password/` | `change`, `request-reset`, `reset` |

---

## Methods to Implement

| # | Method | mutatesSession | Notes |
|---|--------|----------------|-------|
| 1 | updateUser | true | `client.updateUser(encoded)` |
| 2 | deleteUser | true | No payload |
| 3 | revokeSession | true | `client.revokeSession({ token })` |
| 4 | revokeOtherSessions | true | No payload |
| 5 | revokeSessions | true | No payload |
| 6 | linkSocial | true | `client.linkSocial({ provider, callbackURL })` |
| 7 | listAccounts | **false** | No payload, array response |
| 8 | unlinkAccount | true | `client.unlinkAccount({ providerId })` |
| 9 | isUsernameAvailable | **false** | `client.isUsernameAvailable({ username })` |

**Doc Links**: See `AGENT_PROMPTS.md` for Better Auth documentation URLs.

---

## 3-Stage Workflow

### Stage 1: Research All Methods

Create `outputs/phase-1-research.md` documenting:
- Payload schema (fields and types)
- Response schema
- Special flags: `noPayload`, `arrayResponse`

**Checkpoint**: All methods documented before Stage 2.

### Stage 2: Create All Contracts

```bash
mkdir -p packages/iam/client/src/core/{update-user,delete-user,revoke-session,revoke-other-sessions,revoke-sessions,link-social,list-accounts,unlink-account}
mkdir -p packages/iam/client/src/username/is-username-available
```

Create all `contract.ts` files. **Checkpoint**:
```bash
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts
```

### Stage 3: Handlers + Wire-up

1. Create all `handler.ts` files
2. Create `mod.ts` and `index.ts` (boilerplate)
3. Update `core/layer.ts` (add 8 handlers)
4. Create `username/layer.ts` (new)

**Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

---

## Pattern Reference

**Standard contract**: See `packages/iam/client/src/sign-in/email/contract.ts`

**Standard handler**: See `packages/iam/client/src/sign-in/email/handler.ts`

**No-payload pattern**: See `packages/iam/client/src/core/sign-out/`

**mod.ts** (boilerplate):
```typescript
export * from "./contract.ts";
export * from "./handler.ts";
```

**index.ts** (namespace varies):
```typescript
export * as UpdateUser from "./mod.ts";
```

---

## Key Gotchas

1. **Import paths**: `@beep/iam-client/_internal` (singular), `@beep/iam-client/adapters`
2. **Schema ID**: `$IamClientId.create("core/update-user")`
3. **No-payload contracts**: Omit `payload` from Wrapper, handler uses `() => client.method()`
4. **Array responses**: `S.Array(Schema).annotations($I.annotations("Success", {}))`
5. **Layer imports**: Import from `index.ts` namespace, not `mod.ts` directly

---

## Success Criteria

- [ ] All 9 `contract.ts` created
- [ ] All 9 `handler.ts` created
- [ ] `core/layer.ts` updated
- [ ] `username/` category created
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `HANDOFF_P2.md` created

---

## Rollback

```bash
git checkout -- packages/iam/client/
```
