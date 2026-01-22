# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the better-auth-client-wrappers spec using the **3-stage batched workflow**.

### Your Mission

Implement 9 better-auth client wrappers for core + username operations.

---

## Stage 0: Pre-Flight (MANDATORY)

**Before ANY code changes:**

```bash
# 1. Verify clean baseline
bun run check --filter @beep/iam-client

# 2. Create working branch
git checkout -b feat/iam-client-wrappers-p1
```

**If pre-flight fails**: Fix existing issues FIRST. Do NOT proceed with errors.

---

## Stage 1: Research All Methods (NO CODE YET)

Fetch docs for ALL 9 methods and create `outputs/phase-1-research.md`:

| # | Method | Doc URL |
|---|--------|---------|
| 1 | updateUser | https://www.better-auth.com/docs/concepts/users-accounts#update-user |
| 2 | deleteUser | https://www.better-auth.com/docs/concepts/users-accounts#delete-user |
| 3 | revokeSession | https://www.better-auth.com/docs/concepts/session-management#revoke-session |
| 4 | revokeOtherSessions | https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions |
| 5 | revokeSessions | https://www.better-auth.com/docs/concepts/session-management#revoke-all-sessions |
| 6 | linkSocial | https://www.better-auth.com/docs/concepts/users-accounts#account-linking |
| 7 | listAccounts | https://www.better-auth.com/docs/concepts/users-accounts#list-user-accounts |
| 8 | unlinkAccount | https://www.better-auth.com/docs/concepts/users-accounts#account-unlinking |
| 9 | isUsernameAvailable | https://www.better-auth.com/docs/plugins/username#check-if-username-is-available |

**Document for each:** Payload schema, Response schema, mutatesSession, special flags (noPayload/arrayResponse)

**Special cases identified:**
- No-payload: deleteUser, revokeOtherSessions, revokeSessions, listAccounts
- Array response: listAccounts

---

## Stage 2: Create All Contracts

After research complete, create ALL contract.ts files:

```bash
mkdir -p packages/iam/client/src/core/{update-user,delete-user,revoke-session,revoke-other-sessions,revoke-sessions,link-social,list-accounts,unlink-account}
mkdir -p packages/iam/client/src/username/is-username-available
```

**Verify contracts:**
```bash
bun tsc --noEmit packages/iam/client/src/core/*/contract.ts packages/iam/client/src/username/*/contract.ts
```

---

## Stage 3: Handlers + Wire-up

After contracts verified:
1. Create all handler.ts
2. Create all mod.ts, index.ts (boilerplate)
3. Update `core/layer.ts` ONCE with 8 new handlers
4. Create `username/layer.ts`, `username/mod.ts`, `username/index.ts`

**Final verify:**
```bash
bun run check --filter @beep/iam-client
bun run lint:fix --filter @beep/iam-client
```

---

## Key Patterns

**Contract imports:**
```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
```

**Handler imports:**
```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";
```

**No-payload wrapper:** Omit `payload` field from `W.Wrapper.make()`

**No-payload handler:** `()(() => client.method())` - no parameter

---

## Success Criteria

- [ ] Stage 0: Pre-flight passes, branch created
- [ ] Stage 1: `outputs/phase-1-research.md` with all 9 methods
- [ ] Stage 2: All contracts compile
- [ ] Stage 3: Full package type-checks
- [ ] HANDOFF_P2.md and P2_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context: `specs/better-auth-client-wrappers/handoffs/HANDOFF_P1.md`
