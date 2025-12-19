# Milestone 3: Password Flows

> **Status**: PENDING
> **Spec Reference**: [.specs/better-auth-specs/CORE.md](../better-auth-specs/CORE.md)
> **Patterns Reference**: [PATTERNS.md](./PATTERNS.md)

## Quick Start

**Current State** (from discovery):
- Domain contracts: ❌ Need creation
- Infra handlers: ❌ Need creation

**Next Action**: Start with Boilerplating Checklist → Domain Contracts

## Pre-Implementation Validation

- [ ] Read corresponding spec document (link above)
- [ ] Verify endpoint count matches spec (4 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements password management flows including password changes, password reset requests, and password reset completion. These endpoints are critical for user account security and recovery.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /change-password | `v1/core/change-password.ts` | `v1/core/change-password.ts` | `changePassword` |
| POST | /request-password-reset | `v1/core/request-password-reset.ts` | `v1/core/request-password-reset.ts` | `requestPasswordReset` |
| POST | /reset-password | `v1/core/reset-password.ts` | `v1/core/reset-password.ts` | `resetPassword` |
| GET | /reset-password/:token | `v1/core/reset-password-token.ts` | `v1/core/reset-password-token.ts` | N/A (redirect handler) |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `change-password.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/change-password.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /change-password)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-change-password)
  - Better Auth method name (`changePassword`)
  - Implementation requirements: validate current password, update to new password, optionally revoke other sessions
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: newPassword, currentPassword, revokeOtherSessions
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user, token (optional)
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `request-password-reset.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/request-password-reset.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /request-password-reset)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-request-password-reset)
  - Better Auth method name (`requestPasswordReset`)
  - Implementation requirements: send password reset email with redirect URL
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: email, redirectTo
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status, message
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `reset-password.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/reset-password.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /reset-password)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-reset-password)
  - Better Auth method name (`resetPassword`)
  - Implementation requirements: validate token and set new password
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: newPassword, token
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `reset-password-token.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/reset-password-token.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (GET /reset-password/:token)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#get-reset-passwordtoken)
  - Note: This is a redirect endpoint, not a standard Better Auth API call
  - Implementation requirements: redirect to callback URL with token or error
- [ ] Add `PathParams` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: token
- [ ] Add `UrlParams` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: callbackURL
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: token
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as ChangePassword from "./change-password.ts"`
- [ ] Import `* as RequestPasswordReset from "./request-password-reset.ts"`
- [ ] Import `* as ResetPassword from "./reset-password.ts"`
- [ ] Import `* as ResetPasswordToken from "./reset-password-token.ts"`
- [ ] Add `.add(ChangePassword.Contract)` to Group class
- [ ] Add `.add(RequestPasswordReset.Contract)` to Group class
- [ ] Add `.add(ResetPassword.Contract)` to Group class
- [ ] Add `.add(ResetPasswordToken.Contract)` to Group class
- [ ] Add exports to barrel export list

### Boilerplate Infra Handlers

#### `change-password.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/change-password.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.changePassword()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `request-password-reset.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/request-password-reset.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.requestPasswordReset()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `reset-password.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/reset-password.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.resetPassword()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `reset-password-token.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/reset-password-token.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments noting this is a redirect handler, not a standard Better Auth API call
  - Implementation should redirect to callbackURL with token query parameter
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as ChangePassword from "./change-password.ts"`
- [ ] Import `* as RequestPasswordReset from "./request-password-reset.ts"`
- [ ] Import `* as ResetPassword from "./reset-password.ts"`
- [ ] Import `* as ResetPasswordToken from "./reset-password-token.ts"`
- [ ] Add `.handle("change-password", ChangePassword.Handler)` to Routes
- [ ] Add `.handle("request-password-reset", RequestPasswordReset.Handler)` to Routes
- [ ] Add `.handle("reset-password", ResetPassword.Handler)` to Routes
- [ ] Add `.handle("reset-password-token", ResetPasswordToken.Handler)` to Routes

### Boilerplate Verification

- [ ] All stub files created with complete JSDoc
- [ ] All group files updated with imports/registrations
- [ ] `bun run check` runs (failures expected for TODO placeholders)
- [ ] Status updated to `BOILERPLATED` in PLAN.md

---

## Infra Handler Helpers Reference

> **See**: PATTERNS.md § "Infra Handler Patterns" for detailed usage examples

All handlers in this milestone should use the standard schema-driven helpers from `../../common/schema-helpers`:

| Helper | Use Case | Has Payload | Response Handling |
|--------|----------|-------------|-------------------|
| `runAuthEndpoint` | POST with request body + schema-decoded response | ✅ Yes | Schema decoded via `S.decodeUnknown()` |
| `runAuthQuery` | GET endpoints with schema-decoded response | ❌ No | Schema decoded via `S.decodeUnknown()` |
| `runAuthCommand` | POST/DELETE with fixed success value (no decoding) | ❌ No | Fixed value (e.g., `{ success: true }`) |
| `forwardCookieResponse` | Manual handling for custom response construction | Manual | Manual |

**Import Statement**:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

**Key Decisions for M3**:
- `change-password` → `runAuthEndpoint` (POST with request body containing Redacted password fields)
- `request-password-reset` → `runAuthEndpoint` (POST with request body containing Redacted email field)
- `reset-password` → `runAuthEndpoint` (POST with request body containing Redacted newPassword field)
- `reset-password-token` → Manual redirect handler (GET with path param, not a Better Auth API call)

**Note**: The `reset-password-token` endpoint is a custom redirect handler that does NOT call Better Auth API methods. It validates the token path parameter and redirects to the callback URL with the token as a query parameter.

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `change-password.ts`

- [ ] Implement `Payload` class fields:
  - `newPassword: CommonFields.UserPassword`
  - `currentPassword: CommonFields.UserPassword`
  - `revokeOtherSessions: S.optionalWith(S.Boolean, { default: () => false })`
- [ ] Implement `Success` class fields:
  - `user: S.Struct({ ... })` - minimal user object
  - `token: S.optionalWith(S.String, { nullable: true })` - new token if other sessions revoked
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `request-password-reset.ts`

- [ ] Implement `Payload` class fields:
  - `email: CommonFields.UserEmail`
  - `redirectTo: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })`
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { nullable: true })`
  - `message: S.optionalWith(S.String, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `reset-password.ts`

- [ ] Implement `Payload` class fields:
  - `newPassword: CommonFields.UserPassword`
  - `token: S.optionalWith(S.String, { nullable: true })` - reset token
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `reset-password-token.ts`

- [ ] Implement `PathParams` class fields:
  - `token: S.String`
- [ ] Implement `UrlParams` class fields:
  - `callbackURL: BS.URLPath`
- [ ] Implement `Success` class fields:
  - `token: S.optionalWith(S.String, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

#### `change-password.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body containing Redacted password fields

- [ ] Implement `Handler` logic using `runAuthEndpoint` with error mapping:
  ```typescript
  export const Handler: HandlerEffect = Effect.fn("ChangePassword")(
    function* ({ payload }) {
      const auth = yield* Auth.Service;
      const request = yield* HttpServerRequest.HttpServerRequest;

      return yield* runAuthEndpoint({
        payloadSchema: V1.Core.ChangePassword.Payload,
        successSchema: V1.Core.ChangePassword.Success,
        payload,
        headers: request.headers,
        authHandler: ({ body, headers }) =>
          Effect.tryPromise(() =>
            auth.api.changePassword({ body, headers, returnHeaders: true })
          ),
      });
    },
    IamAuthError.flowMap("change-password")
  );
  ```
- [ ] Wrap handler with `IamAuthError.flowMap("change-password")` for error mapping
- [ ] The helper automatically encodes Redacted fields (newPassword, currentPassword) via `S.encode()`
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `request-password-reset.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body containing Redacted email field

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.RequestPasswordReset.Payload,
    successSchema: V1.Core.RequestPasswordReset.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.requestPasswordReset({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] The helper automatically encodes Redacted email field via `S.encode()`
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `reset-password.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body containing Redacted newPassword field

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.ResetPassword.Payload,
    successSchema: V1.Core.ResetPassword.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.resetPassword({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] The helper automatically encodes Redacted newPassword field via `S.encode()`
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `reset-password-token.ts`

**Recommended Helper**: Manual redirect handler - NOT a standard Better Auth API call

- [ ] Implement `Handler` logic with manual redirect construction:
  ```typescript
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Extract path param and query param
  const token = pathParams.token; // From path: /reset-password/:token
  const callbackURL = urlParams.callbackURL; // From query: ?callbackURL=...

  // Validate token (optional - or let frontend handle validation)
  // For now, just redirect with token as query parameter

  const redirectUrl = `${callbackURL}?token=${encodeURIComponent(token)}`;

  // Return redirect response (no Better Auth API call)
  return yield* HttpServerResponse.redirect(redirectUrl, 302);
  ```
- [ ] Note: This endpoint does NOT call Better Auth API methods
- [ ] It's a simple redirect handler for email link workflows
- [ ] Extract `token` from path params (`:token` segment)
- [ ] Extract `callbackURL` from query params
- [ ] Redirect to `callbackURL` with token appended as query parameter
- [ ] Consider error handling for missing/invalid params (redirect with `?error=...`)
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Better Auth Method Mapping

- `/change-password` → `auth.api.changePassword`
- `/request-password-reset` → `auth.api.requestPasswordReset`
- `/reset-password` → `auth.api.resetPassword`
- `/reset-password/:token` → Custom redirect handler (no direct Better Auth method)

### Special Considerations

1. **Token Endpoint**: The `GET /reset-password/:token` endpoint is a redirect handler that doesn't call Better Auth directly. It validates the token parameter and redirects to the callback URL with the token or an error query parameter.

2. **Session Revocation**: The `change-password` endpoint can optionally revoke other sessions via the `revokeOtherSessions` flag. When this is true, a new session token is returned.

3. **Email Validation**: The `request-password-reset` endpoint sends an email to the user. Ensure the email service is properly configured in the Better Auth instance.

4. **Redirect URLs**: The `redirectTo` parameter in `request-password-reset` should be validated to ensure it's a safe redirect target (use `BS.URLPath` schema).
