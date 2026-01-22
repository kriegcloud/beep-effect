# better-auth-client-wrappers

> Wrap remaining better-auth client methods for @beep/iam-client using established patterns

---

## Purpose

Create Effect-wrapped handlers for all remaining better-auth client methods in `@beep/iam-client`, following the established `Wrapper.implement()` + `wrapIamMethod()` pattern.

---

## Existing Wrappers (Already Implemented)

The following handlers already exist - **DO NOT reimplement**:

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

---

## Problem Statement

The `@beep/iam-client` package currently wraps a subset of better-auth client methods. There are **90 additional methods** across 15 categories that need wrappers to provide:

1. **Type-safe contracts** - Schema-validated payloads and responses
2. **Effect integration** - Proper error handling via `IamError`
3. **Session management** - Automatic `$sessionSignal` notification for mutations
4. **Consistent API** - Unified access pattern across all auth operations

---

## Scope

### In Scope

90 methods across 15 categories:

| Category | Method Count | Examples |
|----------|--------------|----------|
| admin | 14 | setRole, createUser, banUser, impersonateUser |
| core | 8 | updateUser, deleteUser, revokeSession, linkSocial |
| organization | 24 | checkSlug, addMember, createRole, createTeam |
| passkey | 4 | addPasskey, listUserPasskeys, deletePasskey |
| oauth-provider | 14 | getClient, register, consent, rotateSecret |
| phone-number | 4 | sendOtp, verify, requestPasswordReset |
| sign-in | 6 | sso, passkey, phoneNumber, social, oauth2, anonymous |
| api-key | 5 | create, get, update, delete, list |
| device | 4 | code, token, approve, deny |
| sso | 3 | register, verifyDomain, requestDomainVerification |
| oneTimeToken | 2 | verify, generate |
| scim | 1 | generateToken |
| jwt | 1 | jwks |
| oauth2 | 1 | link |
| anonymous | 1 | deleteAnonymousUser |
| username | 1 | isUsernameAvailable |

### Out of Scope

- Server-side better-auth plugins (this is client-only)
- React hooks/atoms (future spec)
- UI components (future spec)

---

## Success Criteria

### Quantitative Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Methods wrapped | 90 | Count directories in `src/*/` |
| File pattern compliance | 100% | Each method has 4 files: `contract.ts`, `handler.ts`, `mod.ts`, `index.ts` |
| Type errors | 0 | `bun run check --filter @beep/iam-client` |
| Lint errors | 0 | `bun run lint --filter @beep/iam-client` |
| Schema validation | 100% | Response schemas verified against better-auth source |

### Completion Checklist

- [ ] All 90 methods have wrapper handlers in `@beep/iam-client`
- [ ] Each handler follows the `contract.ts` + `handler.ts` + `mod.ts` + `index.ts` pattern
- [ ] Response schemas validated against actual better-auth API responses
- [ ] Handlers grouped into appropriate layers via `WrapperGroup`
- [ ] Package builds without errors: `bun run check --filter @beep/iam-client`
- [ ] All layers properly exported from package entry points
- [ ] Zero `S.Any` or unchecked casts in schema definitions
- [ ] JSDoc with `@module`, `@category`, `@since` on all public exports

---

## Design Decisions

### Why Wrapper Pattern?

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Wrapper.implement()** | Type-safe, Effect-native, consistent error handling | Boilerplate per method | ✓ Selected |
| React hooks | Familiar to React devs | Tight UI coupling, not Effect-native | Rejected |
| HOCs | Composable | Complex type inference | Rejected |

**Rationale**: The `Wrapper.implement()` + `wrapIamMethod()` pattern aligns with existing `@beep/iam-client` handlers, maintains Effect-first architecture, and provides consistent `IamError` handling across all auth operations.

### Why 3-Stage Batched Workflow?

Per-method implementation causes:
- Layer.ts modified N times (merge conflicts)
- Context switching between research and coding
- Late discovery of schema mismatches

Batched approach (Research ALL → Contracts ALL → Handlers ALL) minimizes these issues. See [outputs/OPTIMIZED_WORKFLOW.md](./outputs/OPTIMIZED_WORKFLOW.md).

---

## Complexity Assessment

```
Phase Count:       6 phases × 2 = 12
Agent Diversity:   3 agents × 3 = 9
Cross-Package:     1 package × 4 = 4
External Deps:     1 (better-auth) × 3 = 3
Uncertainty:       2 (patterns established) × 5 = 10
Research Required: 3 (API validation needed) × 2 = 6
────────────────────────────────────────────────────
Total Score:                                44 → High Complexity
```

**Structure**: Complex (MASTER_ORCHESTRATION, per-task checkpoints)

---

## Phase Overview

| Phase | Focus | Agents | Methods |
|-------|-------|--------|---------|
| P1 | Core + Username | web-researcher, effect-code-writer | 9 methods |
| P2 | Admin (Part 1) | web-researcher, effect-code-writer | 7 methods |
| P3 | Admin (Part 2) + SSO + Sign-in | web-researcher, effect-code-writer | 13 methods |
| P4 | Passkey + Phone-number + OneTimeToken | web-researcher, effect-code-writer | 10 methods |
| P5 | OAuth-provider + Device + JWT | web-researcher, effect-code-writer | 19 methods |
| P6 | Organization + API-key + Remaining | web-researcher, effect-code-writer | 30 methods |

---

## Canonical Patterns

### File Structure Per Method

```
packages/iam/client/src/[category]/[operation]/
├── contract.ts    # Payload, Success, Wrapper
├── handler.ts     # Handler = Wrapper.implement(wrapIamMethod(...))
├── mod.ts         # Re-export contract + handler
└── index.ts       # Namespace export: export * as Operation from "./mod.ts"
```

### Contract Template

```typescript
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("[category]/[operation]");

export class Payload extends S.Class<Payload>($I`Payload`)({
  // Schema fields from better-auth API
}, Common.formValuesAnnotation({ /* defaults */ })) {}

export class Success extends S.Class<Success>($I`Success`)({
  // Response schema validated against API
}) {}

export const Wrapper = W.Wrapper.make("[Operation]", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

### Handler Template

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false, // true for session-changing ops
  })((encoded) => client.[category].[method](encoded))
);
```

---

## Implementation Order

Methods prioritized by:
1. **Dependency chain** - Methods that others depend on first
2. **Complexity gradient** - Simpler methods first to establish patterns
3. **Category cohesion** - Complete related methods together

### Phase 1: Core + Username (9 methods)

Establishes patterns for user/session operations.

| Method | Category | mutatesSession | Notes |
|--------|----------|----------------|-------|
| updateUser | core | true | User profile mutations |
| deleteUser | core | true | Deletes user account |
| revokeSession | core | true | Single session |
| revokeOtherSessions | core | true | All except current |
| revokeSessions | core | true | All sessions |
| linkSocial | core | true | Link OAuth provider |
| listAccounts | core | false | Query linked accounts |
| unlinkAccount | core | true | Remove linked account |
| isUsernameAvailable | username | false | Availability check |

---

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for step-by-step implementation guide.

### Workflow Optimization

This spec uses a **3-stage batched workflow** to minimize churn and regression:
1. **Stage 1**: Research ALL methods before writing code
2. **Stage 2**: Create ALL contracts, verify compilation
3. **Stage 3**: Create ALL handlers, wire layer ONCE

See [outputs/OPTIMIZED_WORKFLOW.md](./outputs/OPTIMIZED_WORKFLOW.md) for detailed rationale.

---

## Reference Documentation

- [better-auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
- [better-auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)
- [better-auth Passkey Plugin](https://www.better-auth.com/docs/plugins/passkey)
- [better-auth OAuth Provider Plugin](https://www.better-auth.com/docs/plugins/oauth-provider)

---

## Related Specs

- [Spec Guide](../_guide/README.md) - Spec creation workflow
- [HANDOFF_STANDARDS](../_guide/HANDOFF_STANDARDS.md) - Context transfer standards
