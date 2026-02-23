# Optimized Phase Workflow

> Improvements to maximize success rate and minimize churn/regression

---

## Pre-Flight Requirements (Stage 0)

**MANDATORY before every phase:**

```bash
# 1. Verify package compiles cleanly
bun run check --filter @beep/iam-client

# 2. Create working branch (rollback point)
git checkout -b feat/iam-client-wrappers-p[N]
git status  # Non-clean is OK (parallel agents may be active)
```

**If pre-flight fails:** Fix existing issues BEFORE proceeding.

---

## Existing Wrappers (DO NOT REIMPLEMENT)

| Category | Already Implemented |
|----------|---------------------|
| `core/` | `sign-out`, `get-session` |
| `sign-in/` | `email`, `username` |
| `sign-up/` | `email` |
| `password/` | `change`, `request-reset`, `reset` |
| `two-factor/` | `enable`, `disable`, `backup/*`, `otp/*`, `totp/*` |
| `organization/` | `crud/*`, `invitations/*`, `members/*` |
| `multi-session/` | `list-sessions`, `revoke`, `set-active` |
| `email-verification/` | `send-verification` |

---

## Key Insights

### Problem: Interleaved Research + Implementation

**Current approach:**
```
For each method:
  1. Research docs
  2. Create contract
  3. Create handler
  4. Update layer
  5. Verify
```

**Issues:**
- Context switching between research and coding
- Layer.ts modified N times (merge conflicts, churn)
- Late discovery of schema mismatches
- No validation that client methods exist

---

## Optimized Workflow: Three-Stage Approach

### Stage 1: Research All Methods (Batch)

Before writing ANY code, gather ALL information for the phase:

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1: RESEARCH (No code changes)                            │
├─────────────────────────────────────────────────────────────────┤
│  1.1 Fetch ALL documentation URLs for phase methods             │
│  1.2 Extract payload schemas for each method                    │
│  1.3 Extract response schemas for each method                   │
│  1.4 Identify special cases:                                    │
│      - No-payload operations (deleteUser, signOut)              │
│      - Query-wrapped payloads ({ query: payload })              │
│      - Array responses (listUsers, listAccounts)                │
│      - Nested client paths (client.admin.setRole)               │
│  1.5 Verify client methods exist (LSP hover or type inspection) │
│  1.6 Document findings in outputs/phase-N-research.md           │
└─────────────────────────────────────────────────────────────────┘
```

**Output:** `outputs/phase-N-research.md` with:
```markdown
## Method: updateUser

### Client Call
`client.updateUser(payload)`

### Payload Schema
```typescript
{
  name?: string,
  image?: string,
}
```

### Response Schema
```typescript
{
  user: User  // See _internal/user.schemas.ts
}
```

### Flags
- mutatesSession: true
- queryWrapped: false
- noPayload: false
- arrayResponse: false

### Notes
- Uses existing DomainUserFromBetterAuthUser for response
```

---

### Stage 2: Implement Contracts (Batch)

Create ALL contracts before ANY handlers:

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: CONTRACTS (High-risk, requires accuracy)              │
├─────────────────────────────────────────────────────────────────┤
│  2.1 Create directory structure for ALL methods                 │
│  2.2 Create contract.ts for EACH method (from research doc)     │
│  2.3 CHECKPOINT: Verify contracts compile                       │
│      bun tsc --noEmit packages/iam/client/src/[cat]/*/contract.ts │
│  2.4 Fix any schema errors BEFORE proceeding                    │
└─────────────────────────────────────────────────────────────────┘
```

**Why contracts first?**
- Contracts are the hardest part (require correct API understanding)
- Schema errors caught early, before handlers are written
- No dependency on handlers yet

**Contract creation order (within stage):**
```
1. Create folder: mkdir -p packages/iam/client/src/[category]/[operation]
2. Create contract.ts with Payload, Success, Wrapper
3. Repeat for all methods in phase
4. Batch verify: tsc --noEmit on all new contracts
```

---

### Stage 3: Implement Handlers + Wire-up (Batch)

After contracts are verified, create handlers and complete wiring:

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: HANDLERS + WIRING (Mechanical, lower risk)            │
├─────────────────────────────────────────────────────────────────┤
│  3.1 Create handler.ts for EACH method                          │
│  3.2 Create mod.ts for EACH method (boilerplate)                │
│  3.3 Create index.ts for EACH method (boilerplate)              │
│  3.4 Update layer.ts ONCE with all new handlers                 │
│  3.5 Update parent mod.ts ONCE with all new exports             │
│  3.6 FINAL: Full verification                                   │
│      bun run check --filter @beep/iam-client                   │
│      bun run lint:fix --filter @beep/iam-client                │
└─────────────────────────────────────────────────────────────────┘
```

**Why handlers after contracts?**
- Handlers are mechanical (just wire contract to client method)
- If contract is correct, handler rarely fails
- Batching reduces layer.ts modifications to 1

---

## File Creation Order (Detailed)

### Within a Category (e.g., "core")

```
# Step 1: Create ALL directories
mkdir -p packages/iam/client/src/core/{update-user,delete-user,revoke-session,...}

# Step 2: Create ALL contracts (parallel-safe)
# These have no internal dependencies
core/update-user/contract.ts
core/delete-user/contract.ts
core/revoke-session/contract.ts
...

# Step 3: Verify contracts compile
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts

# Step 4: Create ALL handlers (parallel-safe)
# Each depends only on its own contract.ts
core/update-user/handler.ts
core/delete-user/handler.ts
core/revoke-session/handler.ts
...

# Step 5: Create ALL mod.ts (parallel-safe, boilerplate)
core/update-user/mod.ts
core/delete-user/mod.ts
...

# Step 6: Create ALL index.ts (parallel-safe, boilerplate)
core/update-user/index.ts
core/delete-user/index.ts
...

# Step 7: Update layer.ts ONCE (single modification)
core/layer.ts  # Add all new imports and WrapperGroup entries

# Step 8: Update parent mod.ts ONCE
core/mod.ts  # Add all new re-exports

# Step 9: Final verification
bun run check --filter @beep/iam-client
```

---

## Verification Checkpoints

### Checkpoint 1: After Research (Stage 1)
- [ ] All methods documented with payload/response schemas
- [ ] Special cases identified (no-payload, query-wrapped, array)
- [ ] Client method paths verified to exist

### Checkpoint 2: After Contracts (Stage 2)
```bash
# Quick syntax check on new contracts only
bun tsc --noEmit packages/iam/client/src/[category]/*/contract.ts
```
- [ ] All contracts compile without errors
- [ ] Schema types match expected API shapes

### Checkpoint 3: After Full Implementation (Stage 3)
```bash
# Full package verification
bun run check --filter @beep/iam-client
bun run lint:fix --filter @beep/iam-client
```
- [ ] Package type-checks clean
- [ ] Lint passes
- [ ] All handlers in layer

---

## Special Case Handling

### No-Payload Operations

**Identify during research:**
- `deleteUser`, `revokeOtherSessions`, `revokeSessions`, `listAccounts`
- `signOut`, `stopImpersonating`

**Contract pattern:**
```typescript
// NO Payload class - omit from Wrapper
export const Wrapper = W.Wrapper.make("DeleteUser", {
  success: Success,
  error: Common.IamError,
  // Note: no payload field
});
```

**Handler pattern:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.deleteUser())  // No parameter
);
```

### Query-Wrapped Payloads

**Identify during research:**
- `client.admin.listUsers`, `client.admin.listUserSessions`
- Most `list*` operations

**Handler pattern:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.admin.listUsers({ query: encoded }))  // Wrapped!
);
```

### Array Responses

**Identify during research:**
- `listAccounts`, `listUsers`, `listUserPasskeys`

**Contract pattern:**
```typescript
// Success is an array, not a class
export const Success = S.Array(AccountSchema).annotations(
  $I.annotations("Success", {
    description: "List of linked accounts",
  })
);
```

### Nested Client Paths

**Document during research:**
| Method | Client Path |
|--------|-------------|
| admin.setRole | `client.admin.setRole(payload)` |
| signIn.passkey | `client.signIn.passkey(payload)` |
| organization.addMember | `client.organization.addMember(payload)` |

---

## Anti-Patterns to Avoid

### ❌ Interleaved Research + Implementation
```
Research method 1 → Implement method 1 → Research method 2 → ...
```
**Problem:** Context switching, late error discovery

### ❌ Updating layer.ts After Each Method
```
Add handler 1 → Update layer → Add handler 2 → Update layer → ...
```
**Problem:** N modifications, merge conflicts, churn

### ❌ Skipping Contract Verification
```
Create contract → Create handler → Discover schema mismatch
```
**Problem:** Handler code wasted, have to redo both files

### ❌ Guessing API Response Shapes
```
Assume response looks like { user: User } → Discover it's { data: { user } }
```
**Problem:** Runtime failures, schema decode errors

---

## Success Criteria for Workflow

A phase is successfully completed when:

1. **Research Complete:**
   - [ ] `outputs/phase-N-research.md` exists with all methods documented
   - [ ] Special cases identified and flagged

2. **Contracts Verified:**
   - [ ] All `contract.ts` files compile: `tsc --noEmit` passes
   - [ ] No `any` types or unchecked casts

3. **Handlers Wired:**
   - [ ] All `handler.ts` files created
   - [ ] All `mod.ts` and `index.ts` boilerplate created
   - [ ] Layer updated with all handlers

4. **Package Verified:**
   - [ ] `bun run check --filter @beep/iam-client` passes
   - [ ] `bun run lint:fix --filter @beep/iam-client` passes

5. **Handoff Created:**
   - [ ] `HANDOFF_P[N+1].md` with verified schemas
   - [ ] `P[N+1]_ORCHESTRATOR_PROMPT.md` ready

---

## Template: Phase Research Document

```markdown
# Phase N Research: [Category Name]

## Methods Summary

| # | Method | Client Path | mutatesSession | Special |
|---|--------|-------------|----------------|---------|
| 1 | updateUser | client.updateUser | true | - |
| 2 | deleteUser | client.deleteUser | true | no-payload |
| 3 | listAccounts | client.listAccounts | false | no-payload, array |

---

## Method Details

### 1. updateUser

**Documentation:** https://www.better-auth.com/docs/...

**Client Call:** `client.updateUser(payload)`

**Payload:**
\`\`\`typescript
{
  name?: string,
  image?: string,
}
\`\`\`

**Response:**
\`\`\`typescript
{
  user: User
}
\`\`\`

**Flags:**
- mutatesSession: true
- queryWrapped: false
- noPayload: false
- arrayResponse: false

---

### 2. deleteUser
...
```

---

## Estimated Time Savings

| Approach | Layer Modifications | Verification Runs | Context Switches |
|----------|---------------------|-------------------|------------------|
| Current (per-method) | N | N | 2N |
| Optimized (batched) | 1 | 2-3 | 3 |

For Phase 1 with 9 methods:
- **Current:** 9 layer mods, 9 verifications, 18 context switches
- **Optimized:** 1 layer mod, 3 verifications, 3 context switches
