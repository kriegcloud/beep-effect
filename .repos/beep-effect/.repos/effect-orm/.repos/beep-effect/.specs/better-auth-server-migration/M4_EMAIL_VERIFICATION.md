# Milestone 4: Email Verification

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
- [ ] Verify endpoint count matches spec (3 endpoints)
- [ ] Check for any custom authentication requirements
- [ ] Identify any endpoints with complex nested objects

## Overview

This milestone implements email verification flows including sending verification emails, verifying email addresses via token, and changing email addresses. These endpoints ensure users have valid email addresses and can update them securely.

## Endpoints

| Method | Path | Domain File | Infra File | Better Auth Method |
|--------|------|-------------|------------|-------------------|
| POST | /send-verification-email | `v1/core/send-verification-email.ts` | `v1/core/send-verification-email.ts` | `sendVerificationEmail` |
| GET | /verify-email | `v1/core/verify-email.ts` | `v1/core/verify-email.ts` | `verifyEmail` |
| POST | /change-email | `v1/core/change-email.ts` | `v1/core/change-email.ts` | `changeEmail` |

## Phase 2.5: Boilerplating Checklist

> Complete this section BEFORE implementation. Creates stub files with JSDoc.

### Boilerplate Domain Contracts

#### `send-verification-email.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/send-verification-email.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /send-verification-email)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-send-verification-email)
  - Better Auth method name (`sendVerificationEmail`)
  - Implementation requirements: send verification email to user with callback URL
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: email, callbackURL
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `verify-email.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/verify-email.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (GET /verify-email)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#get-verify-email)
  - Better Auth method name (`verifyEmail`)
  - Implementation requirements: verify email token and return user with updated verification status
- [ ] Add `UrlParams` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: token, callbackURL (optional)
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user, status
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### `change-email.ts`

- [ ] Create stub file `packages/iam/domain/src/api/v1/core/change-email.ts`
- [ ] Fill module-level JSDoc with:
  - Endpoint path and method (POST /change-email)
  - Spec reference anchor (.specs/better-auth-specs/CORE.md#post-change-email)
  - Better Auth method name (`changeEmail`)
  - Implementation requirements: change user email, may require verification step
- [ ] Add `Payload` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: newEmail, callbackURL
- [ ] Add `Success` class stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comment listing fields: user (optional), status, message
- [ ] Add `Contract` export with complete JSDoc
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as SendVerificationEmail from "./send-verification-email.ts"`
- [ ] Import `* as VerifyEmail from "./verify-email.ts"`
- [ ] Import `* as ChangeEmail from "./change-email.ts"`
- [ ] Add `.add(SendVerificationEmail.Contract)` to Group class
- [ ] Add `.add(VerifyEmail.Contract)` to Group class
- [ ] Add `.add(ChangeEmail.Contract)` to Group class
- [ ] Add exports to barrel export list

### Boilerplate Infra Handlers

#### `send-verification-email.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/send-verification-email.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.sendVerificationEmail()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `verify-email.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/verify-email.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc (note: uses UrlParams, not Payload)
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.verifyEmail()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### `change-email.ts`

- [ ] Create stub file `packages/iam/server/src/api/v1/core/change-email.ts`
- [ ] Fill module-level JSDoc with spec references
- [ ] Add `HandlerEffect` type with JSDoc
- [ ] Add `Handler` stub with:
  - Complete JSDoc (@category, @example, @since)
  - TODO comments with implementation template for `auth.api.changeEmail()`
  - Placeholder `Effect.fail(new Error("Not implemented"))`
- [ ] Update `index.ts` barrel export

#### Update `_group.ts`

- [ ] Import `* as SendVerificationEmail from "./send-verification-email.ts"`
- [ ] Import `* as VerifyEmail from "./verify-email.ts"`
- [ ] Import `* as ChangeEmail from "./change-email.ts"`
- [ ] Add `.handle("send-verification-email", SendVerificationEmail.Handler)` to Routes
- [ ] Add `.handle("verify-email", VerifyEmail.Handler)` to Routes
- [ ] Add `.handle("change-email", ChangeEmail.Handler)` to Routes

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

**Key Decisions for M4**:
- `send-verification-email` → `runAuthEndpoint` (POST with request body containing Redacted email field)
- `verify-email` → Manual handling (GET with UrlParams that need manual query construction)
- `change-email` → `runAuthEndpoint` (POST with request body containing Redacted newEmail field)

**Note**: The `verify-email` endpoint requires manual handling because it's a GET endpoint with UrlParams that must be passed as a query object to Better Auth's API, which doesn't fit the `runAuthQuery` helper pattern (which expects no parameters).

---

## Implementation Checklist

> Complete this section AFTER boilerplating. Fills in stub implementations.

### 1. Domain Contracts

#### `send-verification-email.ts`

- [ ] Implement `Payload` class fields:
  - `email: CommonFields.UserEmail`
  - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })`
- [ ] Implement `Success` class fields:
  - `status: S.optionalWith(S.Boolean, { nullable: true })`
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `verify-email.ts`

- [ ] Implement `UrlParams` class fields:
  - `token: S.String` - verification token (required)
  - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })`
- [ ] Implement `Success` class fields:
  - `user: User.Model.json` - updated user with emailVerified = true
  - `status: S.Boolean` - verification status
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

#### `change-email.ts`

- [ ] Implement `Payload` class fields:
  - `newEmail: CommonFields.UserEmail` - valid email format (redacted)
  - `callbackURL: S.optionalWith(BS.URLPath, { as: "Option", nullable: true })`
- [ ] Implement `Success` class fields:
  - `user: S.optionalWith(User.Model.json, { nullable: true })` - updated user if change is immediate
  - `status: S.Boolean` - indicates success
  - `message: S.optionalWith(S.String, { nullable: true })` - status message
- [ ] Update JSDoc @example with realistic values
- [ ] Remove TODO comments

### 2. Infra Handlers

#### `send-verification-email.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body containing Redacted email field

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.SendVerificationEmail.Payload,
    successSchema: V1.Core.SendVerificationEmail.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.sendVerificationEmail({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] The helper automatically encodes Redacted email field via `S.encode()`
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `verify-email.ts`

**Recommended Helper**: Manual handling - GET endpoint with UrlParams that need to be passed as query object to Better Auth

- [ ] Implement `Handler` logic with manual query parameter handling:
  ```typescript
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Extract query params from HttpApiEndpoint UrlParams
  const urlParams = ...; // Get from handler context

  const { headers, response } = yield* F.pipe(
    Effect.tryPromise(() =>
      auth.api.verifyEmail({
        query: {
          token: urlParams.token,
          callbackURL: F.pipe(urlParams.callbackURL, O.getOrElse(F.constUndefined)),
        },
        headers: request.headers,
        returnHeaders: true,
      })
    ),
    Effect.flatMap((result) =>
      Effect.all({
        headers: Effect.succeed(result.headers),
        response: S.decodeUnknown(V1.Core.VerifyEmail.Success)(result.response),
      })
    )
  );

  return yield* forwardCookieResponse(headers, response);
  ```
- [ ] Note: GET endpoints with UrlParams require manual query parameter extraction
- [ ] Use `forwardCookieResponse` for cookie forwarding
- [ ] Handle Option fields (callbackURL) with `O.getOrElse(F.constUndefined)`
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

#### `change-email.ts`

**Recommended Helper**: `runAuthEndpoint` - POST with request body containing Redacted newEmail field

- [ ] Implement `Handler` logic using `runAuthEndpoint`:
  ```typescript
  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.ChangeEmail.Payload,
    successSchema: V1.Core.ChangeEmail.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.changeEmail({ body, headers, returnHeaders: true })
      ),
  });
  ```
- [ ] The helper automatically encodes Redacted newEmail field via `S.encode()`
- [ ] Cookie forwarding is handled automatically by the helper
- [ ] Remove placeholder `Effect.fail(...)`
- [ ] Update JSDoc @example if needed

### 3. Verification

- [ ] `bun run check` passes
- [ ] `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- [ ] Endpoints appear in OpenAPI spec at server `/docs`
- [ ] Status updated to `COMPLETE` in PLAN.md

## Notes

### Better Auth Method Mapping

- `/send-verification-email` → `auth.api.sendVerificationEmail`
- `/verify-email` → `auth.api.verifyEmail`
- `/change-email` → `auth.api.changeEmail`

### Special Considerations

1. **GET vs POST**: The `verify-email` endpoint is a GET request with query parameters, while the other two are POST requests with body payloads. Ensure the handler uses `urlParams` instead of `payload`.

2. **Better Auth Method Note**: The `verify-email` endpoint does not have an `operationId` in the OpenAPI spec. Verify the actual Better Auth client method name during implementation. It may be `verifyEmail` as documented, or may require custom implementation.

3. **Email Verification Flow**:
   - User signs up → email is unverified
   - `send-verification-email` sends token to user's email
   - User clicks link with token → `verify-email` validates token
   - User's `emailVerified` field is set to `true`

4. **Change Email Flow**:
   - User requests email change via `change-email`
   - Response may be immediate (`user` returned with updated email) or require verification (`message: "Verification email sent"`)
   - If verification is required, user must click link in new email to confirm

5. **Callback URLs**: All endpoints support optional callback URLs for redirecting after the operation completes. Use `BS.URLPath` schema for validation.

6. **Token Validation**: The `verify-email` endpoint must validate the token and handle expired or invalid tokens gracefully with appropriate error responses.

7. **Email Service**: Ensure the email service is properly configured in Better Auth to send verification emails. Check the `Auth.Service` configuration for email transport settings.
