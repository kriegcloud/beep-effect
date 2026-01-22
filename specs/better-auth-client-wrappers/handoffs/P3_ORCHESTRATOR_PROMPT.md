# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the better-auth-client-wrappers spec using the **3-stage batched workflow**.

### Your Mission

Implement 13 better-auth client wrappers across admin, SSO, and sign-in categories.

---

## Stage 0: Pre-Flight (MANDATORY)

**Before ANY code changes:**

```bash
# 1. Verify clean baseline
bun run check --filter @beep/iam-client

# 2. Create working branch
git checkout -b feat/iam-client-wrappers-p3
```

**If pre-flight fails**: Fix existing issues FIRST. Do NOT proceed with errors.

---

## Stage 1: Research All Methods (NO CODE YET)

Fetch docs for ALL 13 methods and create `outputs/phase-3-research.md`:

### Admin Methods (7)

| # | Method | Doc URL |
|---|--------|---------|
| 17 | admin.impersonateUser | https://www.better-auth.com/docs/plugins/admin |
| 18 | admin.stopImpersonating | https://www.better-auth.com/docs/plugins/admin |
| 19 | admin.revokeUserSession | https://www.better-auth.com/docs/plugins/admin |
| 20 | admin.revokeUserSessions | https://www.better-auth.com/docs/plugins/admin |
| 21 | admin.removeUser | https://www.better-auth.com/docs/plugins/admin |
| 22 | admin.setUserPassword | https://www.better-auth.com/docs/plugins/admin |
| 23 | admin.hasPermission | https://www.better-auth.com/docs/plugins/admin |

### SSO Methods (3)

| # | Method | Doc URL |
|---|--------|---------|
| 24 | sso.register | https://www.better-auth.com/docs/plugins/enterprise-sso |
| 25 | sso.verifyDomain | https://www.better-auth.com/docs/plugins/enterprise-sso |
| 26 | sso.requestDomainVerification | https://www.better-auth.com/docs/plugins/enterprise-sso |

### Sign-in Methods (3)

| # | Method | Doc URL |
|---|--------|---------|
| 27 | signIn.sso | https://www.better-auth.com/docs/plugins/enterprise-sso |
| 28 | signIn.passkey | https://www.better-auth.com/docs/plugins/passkey |
| 29 | signIn.phoneNumber | https://www.better-auth.com/docs/plugins/phone-number |

**Document for each:** Payload schema, Response schema, special flags

**Special cases identified:**
- No-payload: stopImpersonating
- Session-mutating: impersonateUser, stopImpersonating, signIn.*

---

## Stage 2: Create All Contracts

After research complete, create ALL contract.ts files:

```bash
# Admin additions
mkdir -p packages/iam/client/src/admin/{impersonate-user,stop-impersonating,revoke-user-session,revoke-user-sessions,remove-user,set-user-password,has-permission}

# SSO category (new)
mkdir -p packages/iam/client/src/sso/{register,verify-domain,request-domain-verification}

# Sign-in additions
mkdir -p packages/iam/client/src/sign-in/{sso,passkey,phone-number}
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
3. Update `admin/layer.ts` with 7 new handlers
4. Create `sso/layer.ts`, `sso/mod.ts`, `sso/index.ts` (new category)
5. Update `sign-in/layer.ts` with 3 new handlers (may need to read existing structure)
6. Update main `src/index.ts` to export SSO

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

**No-payload handler:**
```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.admin.stopImpersonating())
);
```

**Session-mutating success schema:**
```typescript
export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Common.DomainSessionFromBetterAuthSession,
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response with session and user data.",
  })
) {}
```

---

## Success Criteria

- [ ] Stage 0: Pre-flight passes, branch created
- [ ] Stage 1: `outputs/phase-3-research.md` with all 13 methods
- [ ] Stage 2: All contracts compile
- [ ] Stage 3: Full package type-checks
- [ ] HANDOFF_P4.md and P4_ORCHESTRATOR_PROMPT.md created

### Handoff Document

Read full context: `specs/better-auth-client-wrappers/handoffs/HANDOFF_P3.md`
