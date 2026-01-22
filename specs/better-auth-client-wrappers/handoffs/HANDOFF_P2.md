# Handoff: Phase 2 - Admin Part 1

> Implement 7 better-auth admin client wrappers

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods | 7 (all in admin category) |
| Workflow | 3-stage batched approach |
| Predecessor | Phase 1 (COMPLETED) |

---

## P1 Deliverables (Reference Materials)

| Document | Purpose |
|----------|---------|
| `outputs/phase-1-research.md` | Research template for Phase 2 |
| `outputs/method-implementation-guide.md` | Per-method specs (Methods 10-16) |

**Key P1 Findings:**

- `client.isUsernameAvailable()` (NOT `client.username.isUsernameAvailable()`)
- ListAccounts required flexible schema with `S.Record` extension for unknown fields
- All no-payload handlers use `() => client.method()` pattern

---

## Pre-Flight (DO FIRST)

```bash
bun run check --filter @beep/iam-client
git checkout -b feat/iam-client-wrappers-p2
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

---

## Methods to Implement

| # | Method | Pattern | mutatesSession | Notes |
|---|--------|---------|----------------|-------|
| 10 | admin.setRole | Standard | `false` | `client.admin.setRole(encoded)` |
| 11 | admin.createUser | Standard | `false` | `client.admin.createUser(encoded)` |
| 12 | admin.updateUser | Standard | `false` | `client.admin.updateUser(encoded)` |
| 13 | admin.listUsers | **Query-wrapped** | `false` | `client.admin.listUsers({ query: encoded })` |
| 14 | admin.listUserSessions | **Query-wrapped** | `false` | `client.admin.listUserSessions({ query: encoded })` |
| 15 | admin.unbanUser | Standard | `false` | `client.admin.unbanUser(encoded)` |
| 16 | admin.banUser | Standard | `false` | `client.admin.banUser(encoded)` |

**Detailed schemas**: See `outputs/method-implementation-guide.md` (Methods 10-16).

---

## 3-Stage Workflow

### Stage 1: Research All Methods

Create `outputs/phase-2-research.md` documenting for each method:
- Payload schema (fields and types)
- Response schema
- Special flags: `queryWrapped`

**Checkpoint**: All methods documented before Stage 2.

### Stage 2: Create All Contracts

```bash
mkdir -p packages/iam/client/src/admin/{set-role,create-user,update-user,list-users,list-user-sessions,unban-user,ban-user}
```

Create all `contract.ts` files. **Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

### Stage 3: Handlers + Wire-up

1. Create all `handler.ts` files
2. Create `mod.ts` and `index.ts` (boilerplate)
3. Create `admin/layer.ts` (new)
4. Create `admin/mod.ts`, `admin/index.ts`
5. Update main `src/index.ts` to export `Admin`

**Checkpoint**:
```bash
bun run check --filter @beep/iam-client
```

---

## Pattern Reference

**Full Templates**: See `outputs/phase-0-pattern-analysis.md`

**Query-wrapped handler** (used by listUsers, listUserSessions):
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.admin.listUsers({ query: encoded }))
);
```

**mod.ts** (100% boilerplate):
```typescript
/**
 * @fileoverview [Operation] module exports.
 * @module @beep/iam-client/admin/[operation]/mod
 * @category Admin/[Operation]
 * @since 0.1.0
 */
export * from "./contract.ts";
export * from "./handler.ts";
```

**index.ts** (only namespace varies):
```typescript
/**
 * @fileoverview [Operation] namespace export.
 * @module @beep/iam-client/admin/[operation]
 * @category Admin/[Operation]
 * @since 0.1.0
 */
export * as [OperationPascalCase] from "./mod.ts";
```

---

## Key Gotchas

1. **Import paths**: `@beep/iam-client/_internal` (singular), `@beep/iam-client/adapters`
2. **Schema ID**: `$IamClientId.create("admin/set-role")`
3. **Query-wrapped**: `(encoded) => client.admin.method({ query: encoded })`
4. **Admin methods don't mutate session**: All return `mutatesSession: false`
5. **Layer imports**: Import from `index.ts` namespace, not `mod.ts` directly

---

## Success Criteria

- [ ] All 7 `contract.ts` created
- [ ] All 7 `handler.ts` created
- [ ] `admin/layer.ts` created
- [ ] `admin/` category wired to main index
- [ ] `bun run check --filter @beep/iam-client` passes
- [ ] `HANDOFF_P3.md` created

---

## Rollback

```bash
git checkout -- packages/iam/client/
```
