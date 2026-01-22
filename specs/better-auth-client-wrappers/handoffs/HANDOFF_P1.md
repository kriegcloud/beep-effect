# Handoff: Phase 1 - Core + Username

> Implement 9 better-auth client wrappers for core user/session operations

---

## Phase Summary

| Metric | Value |
|--------|-------|
| Methods to implement | 9 |
| Categories | core (8), username (1) |
| Estimated duration | 1 session |
| Workflow | 3-stage batched approach |

---

## Context Budget Validation

| Memory Type | Token Count | Budget | Status |
|-------------|-------------|--------|--------|
| Working | ~1,000 | ≤2,000 | ✓ OK |
| Episodic | ~500 | ≤1,000 | ✓ OK |
| Semantic | ~400 | ≤500 | ✓ OK |
| Procedural | Links only | N/A | ✓ OK |
| **TOTAL** | **~1,959** | **≤4,000** | **✓ OK** |

*Measured: 1,507 words × 1.3 = 1,959 tokens (verified 2025-01-22)*

---

## ⚠️ Pre-Flight Checklist (DO FIRST)

**Before making ANY changes**, verify a clean baseline:

```bash
# 1. Ensure package compiles cleanly
bun run check --filter @beep/iam-client

# 2. Create working branch (rollback point)
git checkout -b feat/iam-client-wrappers-p1
git status  # Should be clean
```

**If pre-flight fails**: Fix existing issues BEFORE proceeding. Do NOT proceed with errors.

---

## Existing Wrappers (DO NOT REIMPLEMENT)

The following handlers already exist in `packages/iam/client/src/`:

| Category | Existing Handlers |
|----------|-------------------|
| `core/` | `sign-out`, `get-session` |
| `sign-in/` | `email`, `username` |
| `sign-up/` | `email` |
| `password/` | `change`, `request-reset`, `reset` |
| `two-factor/` | `enable`, `disable`, `backup/*`, `otp/*`, `totp/*` |
| `organization/` | `crud/*`, `invitations/*`, `members/*` |
| `multi-session/` | `list-sessions`, `revoke`, `set-active` |
| `email-verification/` | `send-verification` |

**CRITICAL**: If a method appears on both lists, it's already implemented. Skip it.

---

## Rollback Strategy

If verification fails at any stage:

```bash
# Option 1: Discard all changes
git checkout -- packages/iam/client/

# Option 2: Reset to branch start
git reset --hard HEAD~N  # N = number of commits

# Option 3: Stash for investigation
git stash push -m "P1 WIP - stage N failure"
```

**Rule**: Never merge broken code. Always verify before proceeding to next stage.

---

## Optimized Workflow (3 Stages)

### Stage 1: Research All Methods

**Before writing ANY code**, gather information for all 9 methods:

| # | Method | Doc URL | Client Call |
|---|--------|---------|-------------|
| 1 | updateUser | [link](https://www.better-auth.com/docs/concepts/users-accounts#update-user) | `client.updateUser(payload)` |
| 2 | deleteUser | [link](https://www.better-auth.com/docs/concepts/users-accounts#delete-user) | `client.deleteUser()` |
| 3 | revokeSession | [link](https://www.better-auth.com/docs/concepts/session-management#revoke-session) | `client.revokeSession({ token })` |
| 4 | revokeOtherSessions | [link](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions) | `client.revokeOtherSessions()` |
| 5 | revokeSessions | [link](https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions) | `client.revokeSessions()` |
| 6 | linkSocial | [link](https://www.better-auth.com/docs/concepts/users-accounts#account-linking) | `client.linkSocial({ provider, callbackURL })` |
| 7 | listAccounts | [link](https://www.better-auth.com/docs/concepts/users-accounts#list-user-accounts) | `client.listAccounts()` |
| 8 | unlinkAccount | [link](https://www.better-auth.com/docs/concepts/users-accounts#account-unlinking) | `client.unlinkAccount({ providerId })` |
| 9 | isUsernameAvailable | [link](https://www.better-auth.com/docs/plugins/username#check-if-username-is-available) | `client.isUsernameAvailable({ username })` |

**For each method, document:**
- Payload schema (fields and types)
- Response schema (fields and types)
- `mutatesSession` flag
- Special flags: `noPayload`, `queryWrapped`, `arrayResponse`

**Output:** Create `outputs/phase-1-research.md`

**Checkpoint 1:** All methods documented before proceeding

---

### Stage 2: Create All Contracts

Create ALL contract.ts files before ANY handlers:

```bash
# Create directories
mkdir -p packages/iam/client/src/core/{update-user,delete-user,revoke-session,revoke-other-sessions,revoke-sessions,link-social,list-accounts,unlink-account}
mkdir -p packages/iam/client/src/username/is-username-available
```

**Create contracts in this order:**
1. `core/update-user/contract.ts`
2. `core/delete-user/contract.ts` (no-payload)
3. `core/revoke-session/contract.ts`
4. `core/revoke-other-sessions/contract.ts` (no-payload)
5. `core/revoke-sessions/contract.ts` (no-payload)
6. `core/link-social/contract.ts`
7. `core/list-accounts/contract.ts` (no-payload, array response)
8. `core/unlink-account/contract.ts`
9. `username/is-username-available/contract.ts`

**Checkpoint 2:** Verify contracts compile
```bash
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts packages/iam/client/src/username/*/contract.ts
```

---

### Stage 3: Handlers + Wire-up

After contracts verified, create remaining files:

**3a. Create all handlers:**
```
core/update-user/handler.ts
core/delete-user/handler.ts
... (all 9)
```

**3b. Create all mod.ts (boilerplate):**
```typescript
export * from "./contract.ts";
export * from "./handler.ts";
```

**3c. Create all index.ts (boilerplate):**
```typescript
export * as UpdateUser from "./mod.ts";
```

**3d. Update layer.ts ONCE:**
- `core/layer.ts` - Add 8 new handlers to WrapperGroup
- Create `username/layer.ts` - New category layer

**3e. Update parent mod.ts ONCE:**
- `core/mod.ts` - Add new re-exports
- Create `username/mod.ts`, `username/index.ts`

**Checkpoint 3:** Full verification
```bash
bun run check --filter @beep/iam-client
bun run lint:fix --filter @beep/iam-client
```

---

## Special Cases for Phase 1

### No-Payload Operations (4 methods)

| Method | Notes |
|--------|-------|
| deleteUser | Deletes current user, no input |
| revokeOtherSessions | Revokes all except current |
| revokeSessions | Revokes ALL sessions |
| listAccounts | Returns array of linked accounts |

**Contract pattern:**
```typescript
// Omit payload from Wrapper
export const Wrapper = W.Wrapper.make("DeleteUser", {
  success: Success,
  error: Common.IamError,
});
```

**Handler pattern:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.deleteUser())
);
```

### Array Response (1 method)

| Method | Response Type |
|--------|---------------|
| listAccounts | `Account[]` |

**Contract pattern:**
```typescript
export const Success = S.Array(AccountSchema).annotations(
  $I.annotations("Success", {
    description: "List of linked accounts",
  })
);
```

---

## Canonical Patterns

### Standard Contract (with payload)

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/update-user");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.optional(S.String),
    image: S.optional(S.String),
  },
  formValuesAnnotation({
    name: "",
    image: "",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  }
) {}

export const Wrapper = W.Wrapper.make("UpdateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

### Standard Handler

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.updateUser(encoded))
);
```

---

## mutatesSession Reference

| Method | mutatesSession | Reason |
|--------|----------------|--------|
| updateUser | true | Changes user profile |
| deleteUser | true | Removes user account |
| revokeSession | true | Ends a session |
| revokeOtherSessions | true | Ends sessions |
| revokeSessions | true | Ends ALL sessions |
| linkSocial | true | Adds linked provider |
| listAccounts | **false** | Read-only query |
| unlinkAccount | true | Removes linked provider |
| isUsernameAvailable | **false** | Read-only query |

---

## File Structure to Create

```
packages/iam/client/src/
├── core/
│   ├── update-user/
│   │   ├── contract.ts
│   │   ├── handler.ts
│   │   ├── mod.ts
│   │   └── index.ts
│   ├── delete-user/
│   │   └── (same 4 files)
│   ├── revoke-session/
│   ├── revoke-other-sessions/
│   ├── revoke-sessions/
│   ├── link-social/
│   ├── list-accounts/
│   ├── unlink-account/
│   ├── layer.ts          # UPDATE: Add 8 new handlers
│   ├── mod.ts            # UPDATE: Add 8 new re-exports
│   └── index.ts
└── username/
    ├── is-username-available/
    │   ├── contract.ts
    │   ├── handler.ts
    │   ├── mod.ts
    │   └── index.ts
    ├── layer.ts          # NEW: Create with 1 handler
    ├── service.ts        # NEW: Optional
    ├── mod.ts            # NEW
    └── index.ts          # NEW
```

---

## Verification Commands

```bash
# After Stage 2 (contracts only)
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts packages/iam/client/src/username/*/contract.ts

# After Stage 3 (full)
bun run check --filter @beep/iam-client
bun run lint:fix --filter @beep/iam-client
```

---

## Success Criteria

### Stage 1 Complete
- [ ] `outputs/phase-1-research.md` exists
- [ ] All 9 methods documented with payload/response schemas
- [ ] Special cases identified (4 no-payload, 1 array)

### Stage 2 Complete
- [ ] All 9 `contract.ts` files created
- [ ] Contracts compile: `tsc --noEmit` passes

### Stage 3 Complete
- [ ] All 9 handlers created
- [ ] All mod.ts/index.ts boilerplate created
- [ ] `core/layer.ts` updated with 8 handlers
- [ ] `username/` category created with layer
- [ ] Full type check passes
- [ ] Lint passes

### Phase Complete
- [ ] All success criteria above met
- [ ] `HANDOFF_P2.md` created with verified schemas
- [ ] `P2_ORCHESTRATOR_PROMPT.md` created
- [ ] `REFLECTION_LOG.md` updated with learnings

---

## Known Gotchas

1. **Import paths:**
   - Internal: `@beep/iam-client/_internal` (note: `iam-client` singular)
   - Client: `@beep/iam-client/adapters`
   - Relative for contract: `import * as Contract from "./contract.ts"`

2. **Schema identifier pattern:**
   ```typescript
   const $I = $IamClientId.create("core/update-user");  // category/operation
   ```

3. **No formValuesAnnotation for no-payload:**
   - Don't include `formValuesAnnotation` if there's no Payload class

4. **Array responses need annotations:**
   ```typescript
   S.Array(Schema).annotations($I.annotations("Success", { description: "..." }))
   ```

5. **Layer imports use namespace from index.ts:**
   ```typescript
   // CORRECT - import from index.ts (namespace export)
   import { UpdateUser } from "./update-user";
   import { DeleteUser } from "./delete-user";

   // WRONG - direct import from mod.ts
   import * as UpdateUser from "./update-user/mod.ts";  // Don't do this
   ```

6. **transformResponse for non-standard responses:**
   Some methods need response transformation before decoding. Example from `get-session`:
   ```typescript
   export const Handler = Contract.Wrapper.implement(
     Common.wrapIamMethod({
       wrapper: Contract.Wrapper,
       // Transform when Better Auth response shape differs from Success schema
       transformResponse: (response) => ({ data: response.data }),
     })(() => client.getSession())
   );
   ```

7. **JSDoc required for all files:**
   Existing handlers include comprehensive JSDoc with `@module`, `@category`, `@since`, `@example`.
   Follow the pattern in `packages/iam/client/src/core/sign-out/`

---

## Reference Files

| Purpose | File |
|---------|------|
| Contract example | `packages/iam/client/src/sign-in/email/contract.ts` |
| Handler example | `packages/iam/client/src/sign-in/email/handler.ts` |
| No-payload example | `packages/iam/client/src/core/sign-out/` |
| Layer example | `packages/iam/client/src/core/layer.ts` |
| Internal utils | `packages/iam/client/src/_internal/index.ts` |
