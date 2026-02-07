# Handoff: Phase 1 - Core + Username

> Implement 9 better-auth client wrappers for core user/session operations

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods | 9 (core: 8, username: 1) |
| Workflow | 3-stage batched approach |
| Predecessor | Phase 0 (COMPLETED) |

---

## P0 Deliverables (Reference Materials)

| Document | Purpose |
|----------|---------|
| `outputs/phase-0-pattern-analysis.md` | Handler patterns, file structure, JSDoc templates |
| `outputs/method-implementation-guide.md` | Per-method specs with payload/response schemas |
| `outputs/OPTIMIZED_WORKFLOW.md` | 3-stage batched workflow details |

**Key P0 Findings:**
- 4 handler patterns: Standard, No-payload, Query-wrapped, Array
- Boilerplate files (mod.ts, index.ts) are 100% identical
- Existing `_internal/` infrastructure is sufficient (no new shared schemas needed)

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

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 1 | updateUser | Standard | `true` | `client.updateUser(encoded)` |
| 2 | deleteUser | **No-payload** | `true` | `client.deleteUser()` |
| 3 | revokeSession | Standard | `true` | `client.revokeSession({ token })` |
| 4 | revokeOtherSessions | **No-payload** | `true` | `client.revokeOtherSessions()` |
| 5 | revokeSessions | **No-payload** | `true` | `client.revokeSessions()` |
| 6 | linkSocial | Standard | `true` | `client.linkSocial({ provider, callbackURL })` |
| 7 | listAccounts | **No-payload + Array** | `false` | `client.listAccounts()` |
| 8 | unlinkAccount | Standard | `true` | `client.unlinkAccount({ providerId })` |
| 9 | isUsernameAvailable | Standard | `false` | `client.username.isUsernameAvailable({ username })` |

**Detailed schemas**: See `outputs/method-implementation-guide.md` (Methods 1-9).
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

**Full Templates**: See `outputs/phase-0-pattern-analysis.md`

**Standard contract**: See `packages/iam/client/src/sign-in/email/contract.ts`

**Standard handler**: See `packages/iam/client/src/sign-in/email/handler.ts`

**No-payload pattern**: See `packages/iam/client/src/core/sign-out/`

**mod.ts** (100% boilerplate - copy verbatim):
```typescript
/**
 * @fileoverview [Operation] module exports.
 * @module @beep/iam-client/[category]/[operation]/mod
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
export * from "./contract.ts";
export * from "./handler.ts";
```

**index.ts** (only namespace varies):
```typescript
/**
 * @fileoverview [Operation] namespace export.
 * @module @beep/iam-client/[category]/[operation]
 * @category [Category]/[Operation]
 * @since 0.1.0
 */
export * as [OperationPascalCase] from "./mod.ts";
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
