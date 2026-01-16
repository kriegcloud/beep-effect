# Phase 2 Handoff: Password Recovery Implementation

**Date**: 2026-01-15
**From**: Phase 1 (Multi-Session)
**To**: Phase 2 (Password Recovery)
**Status**: Ready for implementation

---

## Phase 1 Summary

Phase 1 successfully implemented 3 multi-session handlers:

| Handler | Pattern | mutatesSession |
|---------|---------|----------------|
| list-sessions | Factory (no-payload) | false |
| set-active | Factory (with-payload) | true |
| revoke | Factory (with-payload) | true |

### Key Learnings Applied
1. Factory pattern works for all standard `{ data, error }` responses
2. `S.Class` with `$IamClientId.create("domain/feature")` for schema definitions
3. Better Auth returns `Date` objects, not ISO strings - use `S.Date`
4. Session tokens use plain `S.String` (not `S.Redacted`)
5. Type check and lint passed first try

---

## Methods to Implement

### Password Management (`client.*`)

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| requestPasswordReset | `client.requestPasswordReset()` | `{ email: string, redirectTo?: string }` | `{ data: { status: boolean }, error }` | No | Factory |
| resetPassword | `client.resetPassword()` | `{ newPassword: string, token: string }` | `{ data, error }` | No* | Factory |
| changePassword | `client.changePassword()` | `{ newPassword: string, currentPassword: string, revokeOtherSessions?: boolean }` | `{ data, error }` | Yes** | Factory |

> *`resetPassword` doesn't create a session - user must sign in afterward
> **`changePassword` may revoke other sessions if `revokeOtherSessions: true`

### Directory Structure

```
packages/iam/client/src/password/
├── index.ts                     # Re-exports all handlers (create LAST)
├── request-reset/
│   ├── index.ts
│   ├── request-reset.contract.ts
│   └── request-reset.handler.ts
├── reset/
│   ├── index.ts
│   ├── reset.contract.ts
│   └── reset.handler.ts
└── change/
    ├── index.ts
    ├── change.contract.ts
    └── change.handler.ts
```

> **Note**: Create `password/index.ts` as the FINAL step after all 3 handlers are complete.

---

## Pattern Decisions

### All Three Methods: Factory Pattern

All password management methods follow the standard pattern:
- Standard `{ data, error }` response shape
- No computed fields in payload
- Simple encode → execute → decode flow

### Session Signal Notification

| Method | `mutatesSession` Setting | Reason |
|--------|-------------------------|--------|
| requestPasswordReset | `false` | Only sends email, doesn't touch session |
| resetPassword | `false` | Sets new password, but doesn't create session |
| changePassword | `true` | Current session remains valid, but may revoke others |

---

## Schema Shapes

### request-reset.contract.ts

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/request-reset");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
    redirectTo: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for requesting a password reset email.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for requesting a password reset.",
  })
) {}
```

### reset.contract.ts

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/reset");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    newPassword: S.String,  // User credential - but goes through factory encoding
    token: S.String,        // Server-generated reset token
  },
  $I.annotations("Payload", {
    description: "The payload for resetting a password with a token.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for resetting a password.",
  })
) {}
```

### change.contract.ts

```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/change");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    currentPassword: S.String,
    newPassword: S.String,
    revokeOtherSessions: S.optional(S.Boolean),
  },
  $I.annotations("Payload", {
    description: "The payload for changing the current user's password.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for changing a password.",
  })
) {}
```

---

## Implementation Order

1. **request-reset** (simplest - no session mutation)
2. **reset** (token-based, no session mutation)
3. **change** (authenticated, mutates session)
4. **password/index.ts** (barrel file - create LAST)

---

## Handler Examples

### request-reset.handler.ts

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./request-reset.contract.ts";

/**
 * Handler for requesting a password reset email.
 *
 * Features:
 * - Sends password reset email to the specified address
 * - Does NOT notify $sessionSignal (email-only operation)
 * - Uses consistent span naming: "password/request-reset/handler"
 */
export const Handler = createHandler({
  domain: "password",
  feature: "request-reset",
  execute: (encoded) => client.requestPasswordReset(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### reset.handler.ts

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./reset.contract.ts";

/**
 * Handler for resetting a password with a token.
 *
 * Features:
 * - Validates reset token and sets new password
 * - Does NOT create a session (user must sign in afterward)
 * - Uses consistent span naming: "password/reset/handler"
 */
export const Handler = createHandler({
  domain: "password",
  feature: "reset",
  execute: (encoded) => client.resetPassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

### change.handler.ts

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./change.contract.ts";

/**
 * Handler for changing the current user's password.
 *
 * Features:
 * - Requires current password for verification
 * - Optionally revokes other sessions via `revokeOtherSessions`
 * - Notifies $sessionSignal after success
 * - Uses consistent span naming: "password/change/handler"
 */
export const Handler = createHandler({
  domain: "password",
  feature: "change",
  execute: (encoded) => client.changePassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

---

## Verification Steps

After implementing each handler:

1. **Type Check**:
   ```bash
   bun run check --filter @beep/iam-client
   ```

2. **Lint**:
   ```bash
   bun run lint:fix --filter @beep/iam-client
   ```

---

## Files to Reference

### Pattern Templates
- `packages/iam/client/src/_common/handler.factory.ts` - Factory implementation
- `packages/iam/client/src/multi-session/` - Phase 1 handlers (just completed)

### Example Handlers
- `packages/iam/client/src/multi-session/set-active/` - Factory with payload
- `packages/iam/client/src/multi-session/list-sessions/` - Factory without payload

---

## Gotchas

1. **Password Fields**: Use plain `S.String` for password fields - the factory handles encoding
2. **Optional Fields**: `redirectTo` and `revokeOtherSessions` use `S.optional()`
3. **Token Field**: Reset token is server-generated - use plain `S.String`
4. **mutatesSession for changePassword**: Set to `true` even though it doesn't invalidate current session - the operation affects session state

---

## Success Criteria

Phase 2 is complete when:
- [ ] 3 handlers implemented (request-reset, reset, change)
- [ ] All handlers use factory pattern
- [ ] `changePassword` handler has `mutatesSession: true`
- [ ] `password/index.ts` barrel file exports all handlers
- [ ] Package `index.ts` exports `Password` module
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Lint passes: `bun run lint --filter @beep/iam-client`
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md created for Email Verification phase
