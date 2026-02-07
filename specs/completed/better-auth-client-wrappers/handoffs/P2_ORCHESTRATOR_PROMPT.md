# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the better-auth-client-wrappers spec using the **3-stage batched workflow**.

### Your Mission

Implement 7 better-auth admin client wrappers.

---

## Stage 0: Pre-Flight (MANDATORY)

**Before ANY code changes:**

```bash
# 1. Verify baseline compiles
bun run check --filter @beep/iam-client

# 2. Create working branch
git checkout -b feat/iam-client-wrappers-p2
```

**If pre-flight fails**: Fix existing issues FIRST. Do NOT proceed with errors.

---

## Stage 1: Research All Methods (NO CODE YET)

Fetch docs for ALL 7 methods and create `outputs/phase-2-research.md`:

| # | Method | Doc URL |
|---|--------|---------|
| 10 | admin.setRole | https://www.better-auth.com/docs/plugins/admin |
| 11 | admin.createUser | https://www.better-auth.com/docs/plugins/admin |
| 12 | admin.updateUser | https://www.better-auth.com/docs/plugins/admin |
| 13 | admin.listUsers | https://www.better-auth.com/docs/plugins/admin |
| 14 | admin.listUserSessions | https://www.better-auth.com/docs/plugins/admin |
| 15 | admin.unbanUser | https://www.better-auth.com/docs/plugins/admin |
| 16 | admin.banUser | https://www.better-auth.com/docs/plugins/admin |

**Document for each:** Payload schema, Response schema, special flags (queryWrapped)

**Special cases identified:**
- Query-wrapped: listUsers, listUserSessions (use `{ query: encoded }`)

---

## Stage 2: Create All Contracts

After research complete, create ALL contract.ts files:

```bash
mkdir -p packages/iam/client/src/admin/{set-role,create-user,update-user,list-users,list-user-sessions,unban-user,ban-user}
```

**Verify contracts:**
```bash
bun run check --filter @beep/iam-client
```

---

## Stage 3: Handlers + Wire-up

After contracts verified:
1. Create all handler.ts
2. Create all mod.ts, index.ts (boilerplate)
3. Create `admin/layer.ts`, `admin/mod.ts`, `admin/index.ts`
4. Update main `src/index.ts` to export Admin

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

**Query-wrapped handler:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.admin.listUsers({ query: encoded }))
);
```

---

## Success Criteria

- [ ] Stage 0: Pre-flight passes, branch created
- [ ] Stage 1: `outputs/phase-2-research.md` with all 7 methods
- [ ] Stage 2: All contracts compile
- [ ] Stage 3: Full package type-checks
- [ ] HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context: `specs/better-auth-client-wrappers/handoffs/HANDOFF_P2.md`
