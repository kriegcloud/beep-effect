# Phase 3 Handoff: Email Verification

**Date**: 2026-01-15
**From**: Phase 2 (Password Recovery)
**To**: Phase 3 (Email Verification)
**Status**: Ready for implementation

---

## Phase 2 Summary

Phase 2 successfully implemented 3 password recovery handlers:

| Handler | Pattern | mutatesSession |
|---------|---------|----------------|
| request-reset | Factory (with-payload) | false |
| reset | Factory (with-payload) | false |
| change | Factory (with-payload) | true |

### Key Learnings Applied

1. **ALWAYS verify response shapes from Better Auth source** - Phase 2 had incorrect assumed schemas
2. **Better Auth test files are authoritative** - `*.test.ts` files show exact response shapes
3. **CamelCase path conversion**: Endpoint paths become camelCase client methods
4. **Response shapes vary** - Not all methods return `{ status: boolean }`, some include `message`, `user`, etc.
5. **Null vs undefined**: Better Auth uses `null` for optional fields - use `S.NullOr()` not `S.optional()`

---

## Better Auth Source Verification (MANDATORY)

**CRITICAL**: All response schemas in this handoff have been verified against Better Auth source code.

| Method | Route File | Test File | Verified |
|--------|-----------|-----------|----------|
| `sendVerificationEmail` | `tmp/better-auth/packages/better-auth/src/api/routes/email-verification.ts:77-204` | `tmp/better-auth/packages/better-auth/src/api/routes/email-verification.test.ts:20-30` | YES |
| `verifyEmail` | `tmp/better-auth/packages/better-auth/src/api/routes/email-verification.ts:206-543` | `tmp/better-auth/packages/better-auth/src/api/routes/email-verification.test.ts:41-48` | YES |

**Verification Process**:
1. Located route implementations in `src/api/routes/email-verification.ts`
2. Extracted exact response shapes from `ctx.json()` calls (lines 181-188, 200-202, 476-479, 538-541)
3. Cross-referenced with test assertions in `email-verification.test.ts` (lines 47, 174)
4. Documented ALL fields including optional/null fields

**CamelCase Conversion**:
- Endpoint: `/send-verification-email` -> Client: `client.sendVerificationEmail()`
- Endpoint: `/verify-email` -> Client: `client.verifyEmail()` (GET request via query params)

---

## Methods to Implement

### Email Verification (`client.*`)

| Method | Client Call | Parameters | Returns | Mutates Session | Pattern |
|--------|-------------|------------|---------|-----------------|---------|
| sendVerificationEmail | `client.sendVerificationEmail()` | `{ email: string, callbackURL?: string }` | `{ data: { status: boolean }, error }` | No | Factory |

**Note**: `verifyEmail` is a **redirect-based GET endpoint** that cannot be implemented as a standard handler. It's typically handled by the server when the user clicks the verification link in their email.

### Directory Structure

```
packages/iam/client/src/email-verification/
├── index.ts                                  # Re-exports (create LAST)
└── send-verification/
    ├── index.ts
    ├── send-verification.contract.ts
    └── send-verification.handler.ts
```

> **Note**: Only `sendVerificationEmail` needs a handler. `verifyEmail` is redirect-based and doesn't follow the standard client pattern.

---

## Pattern Decisions

### sendVerificationEmail: Factory Pattern

- Standard `{ data, error }` response shape
- No computed fields in payload
- Simple encode -> execute -> decode flow

### Session Signal Notification

| Method | `mutatesSession` Setting | Reason |
|--------|-------------------------|--------|
| sendVerificationEmail | `false` | Only sends email, doesn't touch session |

---

## Schema Shapes

### send-verification.contract.ts

**Client Method**: `client.sendVerificationEmail()`

**Verified Response Shape** (from `email-verification.ts` lines 181-188, 200-202):
```typescript
{
  status: boolean
}
```

> **VERIFIED**: Response contains ONLY `status: boolean`. No `message` field. Confirmed by:
> - Route implementation at lines 181-183, 186-188, 200-202
> - Test assertion at line 47: `expect(res.data?.status).toBe(true)`

**Contract Implementation**:
```typescript
import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("email-verification/send-verification");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
    callbackURL: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for sending a verification email.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for sending a verification email.",
  })
) {}
```

---

## Handler Implementation

### send-verification.handler.ts

```typescript
import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./send-verification.contract.ts";

/**
 * Handler for sending a verification email.
 *
 * Features:
 * - Sends email verification link to specified address
 * - Does NOT notify $sessionSignal (email-only operation)
 * - Works with or without active session
 * - Uses consistent span naming: "email-verification/send-verification/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/api/routes/email-verification.ts:77-204
 */
export const Handler = createHandler({
  domain: "email-verification",
  feature: "send-verification",
  execute: (encoded) => client.sendVerificationEmail(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
```

---

## Implementation Order

1. **send-verification** (only handler needed)
2. **email-verification/index.ts** (barrel file - create LAST)

---

## Verification Steps

After implementing the handler:

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
- `packages/iam/client/src/password/request-reset/` - Phase 2 handler (similar pattern)

### Better Auth Source (CRITICAL)
- `tmp/better-auth/packages/better-auth/src/api/routes/email-verification.ts` - Route implementation
- `tmp/better-auth/packages/better-auth/src/api/routes/email-verification.test.ts` - Test cases with exact response shapes

---

## Gotchas

### From Phase 2 Experience

1. **Verify ALL response fields**: Phase 2 had incorrect assumed schemas. Always check Better Auth source.
2. **Check test assertions**: Test files like `email-verification.test.ts:47` show exact response shapes.
3. **Note null vs undefined**: Better Auth uses `null` - use `S.NullOr()` when needed.

### Phase 3 Specific

1. **verifyEmail is redirect-based**: Don't try to implement it as a handler. It's a GET endpoint the server handles when users click email links.
2. **Response is simple**: `sendVerificationEmail` returns only `{ status: boolean }` - no `message` field unlike `requestPasswordReset`.
3. **Works without session**: `sendVerificationEmail` can be called with or without an active session.

---

## About verifyEmail (NOT Implemented)

The `verifyEmail` endpoint (`/verify-email`) is a **GET request** that:
- Takes `token` and optional `callbackURL` as query parameters
- Is typically accessed when user clicks the link in their email
- Redirects to `callbackURL` with success/error in query params
- Can return JSON response: `{ status: boolean, user: User | null }`

**Why NOT implemented as a handler**:
- It's a redirect-based flow initiated by clicking an email link
- The server handles token verification and redirects
- Client-side doesn't call this directly in typical usage

If needed in the future, a manual handler could be created for API-based verification flows.

---

## Success Criteria

Phase 3 is complete when:
- [ ] 1 handler implemented (send-verification)
- [ ] Handler uses factory pattern
- [ ] Handler has `mutatesSession: false`
- [ ] `email-verification/index.ts` barrel file exports handler
- [ ] Package `index.ts` exports `EmailVerification` module
- [ ] Type check passes: `bun run check --filter @beep/iam-client`
- [ ] Lint passes: `bun run lint --filter @beep/iam-client`
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] HANDOFF_P4.md created for Two-Factor phase (with verified schemas)

---

## Phase 4 Preview: Two-Factor Authentication

Phase 4 will implement the `client.twoFactor.*` plugin methods:

| Method | Description | Pattern |
|--------|-------------|---------|
| `getTotpUri` | Get TOTP URI for authenticator setup | Factory |
| `enable` | Enable 2FA for user | Factory |
| `disable` | Disable 2FA for user | Factory |
| `verifyTotp` | Verify TOTP code | Factory |
| `generateBackupCodes` | Generate backup codes | Factory |
| `verifyBackupCode` | Verify backup code | Factory |
| `viewBackupCodes` | View existing backup codes | Factory |
| `sendOtp` | Send OTP via email | Factory |
| `verifyOtp` | Verify OTP code | Factory |

> **IMPORTANT for P4**: Verify ALL response shapes from `tmp/better-auth/packages/better-auth/src/plugins/two-factor/` BEFORE creating HANDOFF_P4.md.
