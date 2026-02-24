# Implementation Patterns Reference

> Extracted from completed milestones M0-M2

## Overview

This document captures the established patterns for implementing Better Auth endpoints in the Effect Platform HttpApi system. All patterns are extracted from working implementations in:

- `packages/iam/domain/src/api/v1/core/` (M0)
- `packages/iam/domain/src/api/v1/sign-in/` (M1)
- `packages/iam/domain/src/api/v1/sign-up/` (M2)
- `packages/iam/server/src/api/v1/core/` (M0)
- `packages/iam/server/src/api/v1/sign-in/` (M1)
- `packages/iam/server/src/api/v1/sign-up/` (M2)

---

## Table of Contents

1. [Domain Contract Patterns](#domain-contract-patterns)
2. [Infra Handler Patterns](#infra-handler-patterns)
3. [Infra Handler Helpers](#infra-handler-helpers)
4. [Group Patterns](#group-patterns)
5. [Schema Guidelines](#schema-guidelines)
6. [Error Handling](#error-handling)
7. [Forbidden Patterns](#forbidden-patterns)
8. [Additional Required Patterns](#additional-required-patterns)
9. [Naming Conventions](#naming-conventions)
10. [Verification Commands](#verification-commands)

---

## Domain Contract Patterns

### File Location

`packages/iam/domain/src/api/v1/[group]/[endpoint].ts`

### Pattern 1: POST Endpoint with Request Body

Use this pattern for endpoints that accept a request body (most POST endpoints).

**Example**: `packages/iam/domain/src/api/v1/sign-in/email.ts`

```typescript
import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

// Unique identifier for this endpoint's schemas
const $I = $IamDomainId.create("api/v1/sign-in/email");

// Request payload schema
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: CommonFields.UserEmail,
    password: CommonFields.UserPassword,
    callbackURL: CommonFields.CallbackURL,
    rememberMe: CommonFields.RememberMe,
  },
  $I.annotations("SignInPayload", {
    description: "Sign in with email and password.",
  })
) {}

// Success response schema
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model,
    redirect: CommonFields.Redirect,
    token: CommonFields.SessionToken,
    url: CommonFields.RedirectURL,
  },
  $I.annotations("SignInSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

// Contract definition
export const Contract = HttpApiEndpoint.post("email", "/email")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An Error indicating a failure to sign in with email and password.",
      })
    )
  )
  .addSuccess(Success);
```

**Key Points**:
- Import `$IamDomainId` from `@beep/identity/packages`
- Create identifier with `$IamDomainId.create("api/v1/[group]/[endpoint]")`
- Use `S.Class` for both `Payload` and `Success` schemas
- Apply identifier to class with `$I\`Payload\`` template literal syntax
- Use `$I.annotations()` for schema metadata
- Chain `.setPayload()` → `.addError()` → `.addSuccess()`
- First argument to `HttpApiEndpoint.post()` is the handler name (no leading slash)
- Second argument is the path (with leading slash)

### Pattern 2: GET Endpoint with Query Parameters

Use this pattern for GET endpoints that accept query parameters.

**Example**: `packages/iam/domain/src/api/v1/core/get-session.ts`

```typescript
import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export const $I = $IamDomainId.create("api/v1/core/get-session");

// Note: For GET endpoints with query params, define UrlParams class
// (Not shown in get-session example, but pattern is setUrlParams(UrlParams))

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model,
    session: Session.Model,
  },
  $I.annotations("GetSessionSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const Contract = HttpApiEndpoint.get("get-session", "/get-session")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
```

**Key Points**:
- Use `HttpApiEndpoint.get()` instead of `.post()`
- For query parameters, define `UrlParams` class and use `.setUrlParams(UrlParams)`
- Can specify HTTP status codes on errors with `HttpApiSchema.annotations({ status: ... })`
- GET endpoints typically don't have a `Payload` class

### Pattern 3: POST Endpoint without Request Body

Use this pattern for POST endpoints that don't require a request body.

**Example**: `packages/iam/domain/src/api/v1/core/sign-out.ts`

```typescript
import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/sign-out");

export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("SignOutSuccess", {
    description: "Sign out success response",
  })
) {}

export const Contract = HttpApiEndpoint.post("sign-out", "/sign-out")
  .addSuccess(Success)
  .addError(IamAuthError);
```

**Key Points**:
- No `Payload` class needed
- No `.setPayload()` in contract chain
- Can omit annotations on `IamAuthError` if using default behavior
- Chain directly `.addSuccess()` → `.addError()`

### Pattern 4: Complex Nested Payload

Use this pattern for endpoints with complex nested objects in the request body.

**Example**: `packages/iam/domain/src/api/v1/sign-in/social.ts`

```typescript
import { AuthProviderNameValue } from "@beep/constants";
import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/social");

export class Payload extends S.Class<Payload>($I`Payload`)({
  provider: AuthProviderNameValue,
  callbackURL: BS.toOptionalWithDefault(BS.URLPath)(BS.URLPath.make("/")).annotations({
    description: "Callback URL to redirect to after the user has signed in",
  }),
  disableRedirect: BS.BoolWithDefault(false).annotations({
    description: "Disable automatic redirection to the provider. Useful for handling the redirection yourself",
  }),
  errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true}).annotations({
    description: "Callback URL to redirect to if an error happens",
  }),
  idToken: S.optionalWith(
    S.Struct({
      token: S.Redacted(S.String).annotations({
        description: "ID token from the provider",
      }),
      accessToken: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true}).annotations({
        description: "Access token from the provider",
      }),
      expiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true}).annotations({
        description: "Expiry date of the token",
      }),
      nonce: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true}).annotations({
        description: "Nonce used to generate the token",
      }),
      refreshToken: S.optionalWith(S.Redacted(S.String), { as: "Option", exact: true}).annotations({
        description: "Refresh token from the provider",
      }),
    }),
    { as: "Option", exact: true}
  ),
  loginHint: S.optionalWith(S.String, { as: "Option", exact: true}).annotations({
    description: "The login hint to use for the authorization code request",
  }),
  newUserCallbackURL: S.optionalWith(BS.URLString, { as: "Option", exact: true}),
  requestSignUp: S.optionalWith(S.Boolean, { as: "Option", exact: true}).annotations({
    description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider",
  }),
  scopes: S.optionalWith(S.mutable(S.Array(S.String)), { as: "Option", exact: true}).annotations({
    description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider",
  }),
}) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model.json,
    redirect: CommonFields.Redirect,
    token: CommonFields.SessionToken,
    url: CommonFields.RedirectURL,
  },
  $I.annotations("SignInSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const Contract = HttpApiEndpoint.post("social", "/social")
  .setPayload(Payload)
  .addError(IamAuthError)
  .addSuccess(Success);
```

**Key Points**:
- For optional fields, use `S.optionalWith(Schema, { as: "Option", exact: true })` (decodes to `Option<A>`)
- For fields with defaults, use `BS.BoolWithDefault()` or `BS.toOptionalWithDefault()`
- Inline nested objects with `S.Struct({ ... })`
- Wrap nested optional structs with `S.optionalWith(S.Struct({ ... }), { as: "Option", exact: true })`
- Annotate individual fields with `.annotations({ description: "..." })`
- Use `S.Redacted()` for sensitive fields like tokens and passwords
- For arrays, use `S.mutable(S.Array(ItemSchema))` to allow mutation
- Import specialized schemas from `@beep/schema` (e.g., `BS.URLPath`, `BS.URLString`, `BS.EpochMillisFromAllAcceptable`)

---

## Infra Handler Patterns

### File Location

`packages/iam/server/src/api/v1/[group]/[endpoint].ts`

### Infra Handler Helpers

All infra handlers should use the standard schema-driven helpers from `../../common/schema-helpers` to eliminate boilerplate and ensure consistent encoding/decoding and cookie forwarding.

**Available Helpers**:

| Helper | Use Case | Has Payload | Response Handling | Example Endpoints |
|--------|----------|-------------|-------------------|-------------------|
| `runAuthEndpoint` | POST with request body + schema-decoded response | ✅ Yes | Schema decoded via `S.decodeUnknown()` | sign-in/email, sign-in/social, change-password, refresh-token |
| `runAuthQuery` | GET endpoints with schema-decoded response | ❌ No | Schema decoded via `S.decodeUnknown()` | get-session, list-sessions, verify-email |
| `runAuthCommand` | POST/DELETE with fixed success value (no decoding) | ❌ No | Fixed value (e.g., `{ success: true }`) | sign-out, revoke-session, revoke-sessions |
| `forwardCookieResponse` | Manual handling for Redacted fields that cause TypeScript errors with Better Auth | Manual | Manual decode + manual unwrap | sign-up/email (ONLY when necessary) |

**Import Statement**:
```typescript
import { runAuthEndpoint, runAuthQuery, runAuthCommand, forwardCookieResponse } from "../../common/schema-helpers";
```

**Selection Criteria (Decision Tree)**:

Does the endpoint return headers (cookies)?
  ├─ YES → Does it have a request body?
  │   ├─ YES → Use `runAuthEndpoint` (DEFAULT)
  │   │   └─ If TypeScript errors occur → Fall back to manual `forwardCookieResponse`
  │   └─ NO → Use `runAuthQuery`
  └─ NO → Is it a simple success response like `{ success: true }`?
      ├─ YES → Use `runAuthCommand`
      └─ NO → Manual handling required (OAuth redirects, etc.)

**Detailed Selection Criteria**:

1. **Use `runAuthEndpoint`** when:
   - Endpoint is POST with a request body (payload)
   - Response includes headers (cookies) AND needs schema decoding
   - Payload contains Redacted fields - helper handles `S.encode()` automatically
   - **This is the default choice for all POST endpoints with payloads that return headers**
   - Examples: sign-in/email, change-password, refresh-token
   - ❌ **NOT for OAuth redirect flows** (they return `{ url, redirect }` without headers)

2. **Use `runAuthQuery`** when:
   - Endpoint is GET (no request body)
   - Response includes headers (cookies) AND needs schema decoding
   - Examples: get-session, list-sessions, verify-email

3. **Use `runAuthCommand`** when:
   - Endpoint is POST/DELETE with no meaningful response data
   - Success response is a fixed literal value (e.g., `{ success: true }`, `{ status: true }`)
   - Response includes headers (cookies) but no schema decoding needed for response
   - Examples: sign-out, revoke-session, revoke-sessions

4. **Use `forwardCookieResponse`** (manual) when:
   - Better Auth's TypeScript signature rejects the encoded payload from `S.encode()`
   - TypeScript errors like "Type 'X' is not assignable to type 'string'" occur in auth.api.* call
   - **ONLY use when `runAuthEndpoint` fails TypeScript checks**
   - Requires manual unwrapping with `Redacted.value()` and `O.getOrElse()`
   - Example: sign-up/email (known edge case)

5. **Use manual handling** when:
   - OAuth redirect flows that return `{ url, redirect }` directly **WITHOUT headers**
   - Response does NOT include `set-cookie` header (no session management)
   - Examples: sign-in/oauth2 (initial request), sign-in/sso (initial request)
   - See [OAuth Redirect Flows Pattern](#oauth-redirect-flows-pattern) below

**Key Benefits**:
- **Automatic encoding**: Redacted fields (email, password) are unwrapped via `S.encode()`
- **Automatic decoding**: Responses are validated and transformed via `S.decodeUnknown()`
- **Cookie forwarding**: `set-cookie` headers are automatically forwarded from Better Auth
- **Type safety**: Full compile-time type checking with Effect Schema
- **Reduced boilerplate**: Eliminates manual Effect.Do/bind chains

---

### Pattern 1: POST Handler with Request Body (using `runAuthEndpoint`)

Use this pattern for most POST endpoints that accept a request body. This is the preferred approach using the `runAuthEndpoint` helper.

**Example**: `packages/iam/server/src/api/v1/sign-in/email.ts`

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.Email.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignInEmail")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAuthEndpoint({
      payloadSchema: V1.SignIn.Email.Payload,
      successSchema: V1.SignIn.Email.Success,
      payload,
      headers: request.headers,
      authHandler: ({ body, headers }) =>
        Effect.tryPromise(() =>
          auth.api.signInEmail({
            body,
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  IamAuthError.flowMap("sign-in")
);
```

**Key Points**:
- Type `HandlerEffect` as `Common.HandlerEffect<V1.[Group].[Endpoint].Payload>`
- Use `Effect.fn("HandlerName")` with generator function
- Destructure `{ payload }` from handler arguments
- Yield `Auth.Service` and `HttpServerRequest.HttpServerRequest`
- Import `runAuthEndpoint` from `"../../common/schema-helpers"`
- Pass `payloadSchema`, `successSchema`, `payload`, and `headers` to helper
- Provide `authHandler` callback that calls Better Auth API method
- Pass encoded `body` directly to Better Auth (already transformed by helper)
- Helper handles payload encoding, response decoding, and cookie forwarding automatically
- Wrap handler with `IamAuthError.flowMap("[context]")` for error mapping

### Pattern 2: GET Handler (using `runAuthQuery`)

Use this pattern for GET endpoints. This is the preferred approach using the `runAuthQuery` helper.

**Example**: `packages/iam/server/src/api/v1/core/get-session.ts`

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthQuery } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

export const Handler: HandlerEffect = Effect.fn("GetSession")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAuthQuery({
      successSchema: V1.Core.GetSession.Success,
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.getSession({
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get Session.",
        cause: e,
      })
  )
);
```

**Key Points**:
- Type `HandlerEffect` as `Common.HandlerEffect<undefined>` for no payload
- Generator function takes no arguments (or destructure `{}` if using query params)
- Import `runAuthQuery` from `"../../common/schema-helpers"`
- Pass `successSchema` and `headers` to helper
- Provide `authHandler` callback that calls Better Auth API method
- Helper handles response decoding and cookie forwarding automatically
- Can use `Effect.mapError()` instead of `IamAuthError.flowMap()` for custom error messages

### Pattern 3: Manual Handler with `forwardCookieResponse` (Edge Cases Only)

**⚠️ WARNING**: Use this pattern ONLY when `runAuthEndpoint` causes TypeScript errors with Better Auth's API. This is the exception, not the rule.

**Example**: `packages/iam/server/src/api/v1/sign-up/email.ts`

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { Common } from "../../common";
import { forwardCookieResponse } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignUp.Email.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignUpEmailHandler")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Manual body transformation required for Redacted fields
    const { headers, response } = yield* F.pipe(
      Effect.tryPromise(() =>
        auth.api.signUpEmail({
          body: {
            email: Redacted.value(payload.email),
            password: Redacted.value(payload.password),
            name: payload.name,
            rememberMe: payload.rememberMe,
            image: F.pipe(payload.image, O.getOrElse(F.constUndefined)),
            callbackURL: F.pipe(payload.callbackURL, O.getOrElse(F.constUndefined)),
          },
          headers: request.headers,
          returnHeaders: true,
        })
      ),
      Effect.flatMap((result) =>
        Effect.all({
          headers: Effect.succeed(result.headers),
          response: S.decodeUnknown(V1.SignUp.Email.Success)(result.response),
        })
      )
    );

    return yield* forwardCookieResponse(headers, response);
  },
  IamAuthError.flowMap("sign-up")
);
```

**Key Points**:
- **Only use when `runAuthEndpoint` fails** due to Better Auth TypeScript signature mismatches
- Manually unwrap Redacted fields with `Redacted.value(payload.field)`
- Manually unwrap Option fields with `F.pipe(payload.field, O.getOrElse(F.constUndefined))`
- Still use `S.decodeUnknown()` for response decoding
- Use `forwardCookieResponse()` helper to handle cookie forwarding
- This pattern is verbose - prefer `runAuthEndpoint` whenever possible

---

### Pattern 4: OAuth Redirect Flows (Manual Handling - No Headers)

**⚠️ SPECIAL CASE**: OAuth redirect flows (`sign-in/oauth2`, `sign-in/sso` initial requests) return `{ url, redirect }` directly **WITHOUT** the `set-cookie` header. These endpoints do NOT establish a session immediately - they redirect to the OAuth provider first.

**When to Use This Pattern**:
- OAuth2 sign-in initial request (`signInWithOAuth2`)
- SSO sign-in initial request (`signInSSO`)
- Endpoints that return redirect URLs without session cookies
- Response is plain JSON without headers

**Example**: `packages/iam/server/src/api/v1/sign-in/oauth2.ts` (hypothetical)

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.OAuth2.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignInOAuth2")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Encode payload to plain JSON format
    const body = yield* S.encode(V1.SignIn.OAuth2.Payload)(payload);

    // Call Better Auth API - returns { url, redirect } directly (no headers)
    const response = yield* Effect.tryPromise(() =>
      auth.api.signInWithOAuth2({
        body,
        headers: request.headers,
        // Note: No returnHeaders - OAuth redirect responses don't have cookies
      })
    );

    // Decode response
    const decoded = yield* S.decodeUnknown(V1.SignIn.OAuth2.Success)(response);

    // Return JSON response directly (no cookie forwarding needed)
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  IamAuthError.flowMap("sign-in")
);
```

**Key Differences from Standard Patterns**:
- ❌ **DO NOT** use `runAuthEndpoint` (it expects headers with cookies)
- ❌ **DO NOT** use `returnHeaders: true` in Better Auth call
- ❌ **DO NOT** call `forwardCookieResponse()` (no cookies to forward)
- ✅ **DO** encode payload with `S.encode(PayloadSchema)(payload)`
- ✅ **DO** decode response with `S.decodeUnknown(SuccessSchema)(response)`
- ✅ **DO** return response directly with `HttpServerResponse.json`

**Why This Pattern Exists**:
- OAuth flows redirect users to external providers (Google, GitHub, etc.)
- Session is established AFTER user returns from provider (callback endpoint)
- Initial request only generates redirect URL, no session cookies yet
- Response is plain JSON `{ url: string, redirect: boolean }`

**Verifying Better Auth Method Behavior**:
Before implementing, check the Better Auth method signature:
```typescript
// Check auth.api.* TypeScript types
// If method returns Promise<{ url, redirect }> without headers option
// → Use this manual pattern

// If method supports returnHeaders: true and returns cookies
// → Use runAuthEndpoint or runAuthQuery
```

### Schema Encoding/Decoding Pattern

**WHY**: Domain schemas use Effect types (`Redacted`, `Option`, `DateTime.Utc`) for type safety and semantic clarity, but Better Auth expects plain JSON-compatible types (strings, numbers, booleans, null/undefined). Encoding and decoding provides automatic transformation between these representations.

**Automatic Encoding (via `runAuthEndpoint` helper)**:

The `runAuthEndpoint` helper handles encoding automatically - you don't call `S.encode()` yourself:

```typescript
// ✅ PREFERRED: runAuthEndpoint handles encoding automatically
return yield* runAuthEndpoint({
  payloadSchema: V1.SignIn.Email.Payload,  // Helper calls S.encode() internally
  successSchema: V1.SignIn.Email.Success,
  payload,  // Raw payload with Effect types
  headers: request.headers,
  authHandler: ({ body, headers }) =>  // body is already encoded
    Effect.tryPromise(() =>
      auth.api.signInEmail({
        body,  // Already encoded - just pass through
        headers,
        returnHeaders: true,
      })
    ),
});
```

**Manual Encoding (edge cases only)**:

Only when `runAuthEndpoint` fails TypeScript checks, manually unwrap fields:

```typescript
// ⚠️ EDGE CASE ONLY: Manual unwrapping when runAuthEndpoint fails
const { headers, response } = yield* F.pipe(
  Effect.tryPromise(() =>
    auth.api.signUpEmail({
      body: {
        email: Redacted.value(payload.email),        // Manual unwrap
        password: Redacted.value(payload.password),  // Manual unwrap
        image: F.pipe(payload.image, O.getOrElse(F.constUndefined)),  // Manual unwrap
      },
      headers: request.headers,
      returnHeaders: true,
    })
  ),
  Effect.flatMap((result) =>
    Effect.all({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(V1.SignUp.Email.Success)(result.response),  // Still decode
    })
  )
);
```

**Response Decoding** (always via helpers):

All helpers (`runAuthEndpoint`, `runAuthQuery`, `runAuthCommand`) handle response decoding automatically:

```typescript
// Better Auth returns plain JSON response
// Helpers decode to domain Success schema with Effect types automatically

// Response has Effect types after helper decoding:
// {
//   user: User.Model (with Effect types),
//   redirect: boolean,
//   token: Option<string>,
//   url: Option<URLString>
// }
```

**Pattern Summary**:
1. **Use `runAuthEndpoint`** for all POST endpoints with payloads - encoding is automatic
2. **Use `runAuthQuery`** for all GET endpoints - decoding is automatic
3. **Use `runAuthCommand`** for command endpoints - no encoding/decoding needed
4. **Only manually unwrap** when `runAuthEndpoint` causes TypeScript errors with Better Auth (rare)
5. **Never call `S.encode()` yourself** - the helpers handle it

### Cookie Forwarding Pattern (Critical)

**ALL handlers must forward the `set-cookie` header** from Better Auth responses. This is essential for session management.

**Automatic Cookie Forwarding (via helpers)**:

All helpers (`runAuthEndpoint`, `runAuthQuery`, `runAuthCommand`) handle cookie forwarding automatically via the `forwardCookieResponse` function:

```typescript
// ✅ AUTOMATIC: No manual cookie handling needed when using helpers
return yield* runAuthEndpoint({
  payloadSchema: V1.SignIn.Email.Payload,
  successSchema: V1.SignIn.Email.Success,
  payload,
  headers: request.headers,
  authHandler: ({ body, headers }) =>
    Effect.tryPromise(() =>
      auth.api.signInEmail({ body, headers, returnHeaders: true })
    ),
});
// Helper automatically forwards set-cookie header
```

**Manual Cookie Forwarding (edge cases only)**:

When using the manual pattern with `forwardCookieResponse`, the helper still handles cookie logic:

```typescript
// ⚠️ EDGE CASE ONLY: Manual pattern still uses forwardCookieResponse helper
const { headers, response } = yield* F.pipe(
  Effect.tryPromise(() => auth.api.signUpEmail({ ... })),
  Effect.flatMap((result) =>
    Effect.all({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(V1.SignUp.Email.Success)(result.response),
    })
  )
);

return yield* forwardCookieResponse(headers, response);
// Helper checks for set-cookie and forwards it
```

---

## Infra Handler Helpers

### Overview

The `@beep/iam-server/api/common/schema-helpers` module provides composable helper functions that encapsulate the common patterns for Better Auth endpoint handlers. These helpers eliminate boilerplate and standardize encoding, decoding, and cookie forwarding.

**File Location**: `packages/iam/server/src/api/common/schema-helpers.ts`

### AuthApiResponse<T> Type

All Better Auth API methods with `returnHeaders: true` return a shape that includes both headers and response body:

```typescript
export type AuthApiResponse<T> = {
  readonly headers: Headers;
  readonly response: T;
};
```

The `headers` field contains the `set-cookie` header for session management, while `response` is the API response body.

---

### Helper Selection Guide

Choose the appropriate helper based on your endpoint's characteristics:

| Helper | Has Payload | Response Type | Use Case |
|--------|-------------|---------------|----------|
| `runAuthEndpoint` | ✅ Yes (POST body) | Decoded schema | **DEFAULT for all POST endpoints** - handles Redacted fields automatically |
| `runAuthQuery` | ❌ No payload | Decoded schema | GET endpoints (get-session, list-sessions, verify-email) |
| `runAuthCommand` | ❌ No payload | Fixed literal value | Commands returning `{ success: true }` (sign-out, revoke, delete) |
| `forwardCookieResponse` | Manual body | Manual decode | **ONLY when `runAuthEndpoint` fails TypeScript checks** (rare edge case) |

---

### Pattern 1: `runAuthEndpoint` - POST with Body

Use this helper for POST/PUT endpoints that accept a request body and return a decoded response schema.

**Signature**:
```typescript
runAuthEndpoint<PayloadType, SuccessType>({
  payloadSchema: Schema<PayloadType>,
  successSchema: Schema<SuccessType>,
  payload: PayloadType,
  headers: HttpServerRequest["headers"],
  authHandler: (args: { body: PayloadEncoded, headers: Headers })
    => Effect<AuthApiResponse<AuthResponse>>
}): Effect<HttpServerResponse>
```

**What it does**:
1. Encodes payload via `S.encode(payloadSchema)(payload)` (contravariant transformation)
2. Executes auth handler with encoded body + headers
3. Decodes response via `S.decodeUnknown(successSchema)(response)` (covariant transformation)
4. Forwards `set-cookie` header to HTTP response

**Example**: `packages/iam/server/src/api/v1/sign-in/social.ts`

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.Social.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignInSocial")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAuthEndpoint({
      payloadSchema: V1.SignIn.Social.Payload,
      successSchema: V1.SignIn.Social.Success,
      payload,
      headers: request.headers,
      authHandler: ({ body, headers }) =>
        Effect.tryPromise(() =>
          auth.api.signInSocial({
            body,
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  IamAuthError.flowMap("sign-in")
);
```

**Key Points**:
- Automatically encodes payload (Effect types → JSON types)
- Pass encoded `body` directly to Better Auth
- Automatically decodes response (JSON types → Effect types)
- Cookie forwarding handled automatically

---

### Pattern 2: `runAuthQuery` - GET Endpoints

Use this helper for GET endpoints (no request body) that return a decoded response schema.

**Signature**:
```typescript
runAuthQuery<SuccessType>({
  successSchema: Schema<SuccessType>,
  headers: HttpServerRequest["headers"],
  authHandler: (args: { headers: Headers })
    => Effect<AuthApiResponse<AuthResponse>>
}): Effect<HttpServerResponse>
```

**What it does**:
1. Executes auth handler with headers only
2. Decodes response via `S.decodeUnknown(successSchema)(response)`
3. Forwards `set-cookie` header to HTTP response

**Example**: `packages/iam/server/src/api/v1/core/get-session.ts`

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthQuery } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

export const Handler: HandlerEffect = Effect.fn("GetSession")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAuthQuery({
      successSchema: V1.Core.GetSession.Success,
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.getSession({
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get Session.",
        cause: e,
      })
  )
);
```

**Key Points**:
- No payload encoding (GET endpoints don't have request bodies)
- Automatically decodes response
- Cookie forwarding handled automatically

---

### Pattern 3: `runAuthCommand` - Fixed Success Response

Use this helper for command endpoints (POST/DELETE) that return a fixed success value rather than decoded API response.

**Signature**:
```typescript
runAuthCommand<SuccessType>({
  successValue: SuccessType,
  headers: HttpServerRequest["headers"],
  authHandler: (args: { headers: Headers })
    => Effect<AuthApiResponse<unknown>>
}): Effect<HttpServerResponse>
```

**What it does**:
1. Executes auth handler with headers only
2. Ignores API response body
3. Returns fixed `successValue` (typically `{ success: true }`)
4. Forwards `set-cookie` header to HTTP response

**Example**: `packages/iam/server/src/api/v1/core/sign-out.ts`

```typescript
import { IamAuthError } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthCommand } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

export const Handler: HandlerEffect = Effect.fn("SignOut")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    return yield* runAuthCommand({
      successValue: { success: true },
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.signOut({
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to sign out.",
        cause: e,
      })
  )
);
```

**Key Points**:
- No response decoding (uses fixed literal value)
- Cookie forwarding handled automatically
- Useful for operations like sign-out, revoke-sessions, delete-user

---

### Pattern 4: `forwardCookieResponse` - Manual Handling

Use this helper when payload schemas have `Redacted` fields that must be manually unwrapped because Better Auth's TypeScript definitions expect plain strings, not the encoded format from `S.encode()`.

**Why Manual Unwrapping is Needed**:

Better Auth's API methods have strict TypeScript signatures that expect plain JSON types (e.g., `{ email: string, password: string }`). When you use `S.encode()` on schemas with `Redacted` fields, the encoded output may not match Better Auth's expected types, causing TypeScript errors. In these cases, manually unwrap the fields using `Redacted.value()` and `Option.getOrElse()`.

**Signature**:
```typescript
forwardCookieResponse<T>(
  headers: Headers,
  response: T
): Effect<HttpServerResponse>
```

**What it does**:
1. Checks for `set-cookie` header in Better Auth response
2. Returns JSON response with cookie header if present
3. Returns plain JSON response otherwise

**Example**: `packages/iam/server/src/api/v1/sign-up/email.ts`

```typescript
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { Common } from "../../common";
import { forwardCookieResponse } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignUp.Email.Payload>;

export const Handler: HandlerEffect = Effect.fn("SignUpEmailHandler")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Manual body transformation required for Redacted fields
    const { headers, response } = yield* F.pipe(
      Effect.tryPromise(() =>
        auth.api.signUpEmail({
          body: {
            email: Redacted.value(payload.email),
            password: Redacted.value(payload.password),
            name: payload.name,
            rememberMe: payload.rememberMe,
            image: F.pipe(payload.image, O.getOrElse(F.constUndefined)),
            callbackURL: F.pipe(payload.callbackURL, O.getOrElse(F.constUndefined)),
          },
          headers: request.headers,
          returnHeaders: true,
        })
      ),
      Effect.flatMap((result) =>
        Effect.all({
          headers: Effect.succeed(result.headers),
          response: S.decodeUnknown(V1.SignUp.Email.Success)(result.response),
        })
      )
    );

    return yield* forwardCookieResponse(headers, response);
  },
  IamAuthError.flowMap("sign-up")
);
```

**Key Points**:
- Use when `S.encode()` produces incompatible types for Better Auth
- Manually unwrap `Redacted` fields: `Redacted.value(payload.field)`
- Manually unwrap `Option` fields: `F.pipe(payload.field, O.getOrElse(F.constUndefined))`
- Still decode response with `S.decodeUnknown()`
- Call `forwardCookieResponse()` to handle cookie forwarding

**When NOT to Use `runAuthEndpoint`**:

Avoid `runAuthEndpoint` when:
- Payload schema contains `Redacted` fields AND Better Auth's TypeScript signature expects plain strings
- TypeScript errors occur during `auth.api.*()` call due to type mismatches
- You see errors like: `Type 'string | { readonly [TypeId]: ... }' is not assignable to type 'string'`

In these cases, use `forwardCookieResponse` with manual field mapping instead.

---

### Helper Usage Summary

**Decision Tree (ALWAYS USE THIS)**:

```
START: Implementing Better Auth endpoint handler

Does the endpoint return headers (cookies)?
├─ YES → Does it have a request body?
│   ├─ YES → Use runAuthEndpoint (DEFAULT)
│   │   └─ If TypeScript errors occur → Fall back to manual forwardCookieResponse
│   └─ NO → Use runAuthQuery
│
└─ NO → Is it a simple success response like { success: true }?
    ├─ YES → Use runAuthCommand
    └─ NO → Manual handling required (OAuth redirects, etc.)
        └─ See "OAuth Redirect Flows Pattern" section
```

**Expanded Decision Tree**:

1. **Does endpoint return headers with cookies?**
   - Check if Better Auth method supports `returnHeaders: true`
   - If YES → Continue to step 2
   - If NO → Go to step 4

2. **Does endpoint accept a request body (POST/PUT)?**
   - **Yes** → Use `runAuthEndpoint` (DEFAULT - try this first)
     - If TypeScript errors occur in `auth.api.*` call → Fall back to manual `forwardCookieResponse`
   - **No** → Use `runAuthQuery`

3. **Alternative for POST/DELETE commands**:
   - Does it return a fixed `{ success: true }` value?
     - **Yes** → Use `runAuthCommand`
     - **No** → Use `runAuthQuery`

4. **No headers (OAuth redirect flows)**:
   - Does it return `{ url, redirect }` for OAuth provider redirect?
     - **Yes** → Manual handling (see OAuth Redirect Flows Pattern)
     - **No** → Consult patterns document or ask for guidance

**Benefits**:
- ✅ Eliminates boilerplate (no repeated encode/decode/cookie logic)
- ✅ Enforces consistent patterns across all handlers
- ✅ Type-safe with full inference
- ✅ Kleisli composition (automatic Effect chaining)
- ✅ Centralized cookie forwarding logic

---

## Group Patterns

### Domain Group Pattern

**File Location**: `packages/iam/domain/src/api/v1/[group]/_group.ts`

**Template**:

```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Endpoint1 from "./endpoint1.ts";
import * as Endpoint2 from "./endpoint2.ts";

export class Group extends HttpApiGroup.make("iam.[groupName]")
  .add(Endpoint1.Contract)
  .add(Endpoint2.Contract)
  .prefix("/[group-path]") {}

export { Endpoint1, Endpoint2 };
```

**Key Points**:
- Group name follows `iam.[camelCase]` convention (e.g., `iam.signIn`, `iam.core`)
- Use `.add()` for each endpoint contract
- Use `.prefix()` to set the base path for all endpoints in the group
- Re-export all endpoint modules as namespaces

### Infra Group Pattern

**File Location**: `packages/iam/server/src/api/v1/[group]/_group.ts`

**Template**:

```typescript
import { IamApi, IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-server";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Endpoint1 from "./endpoint1.ts";
import * as Endpoint2 from "./endpoint2.ts";

export type Service = HttpApiGroup.ApiGroup<"iam", "iam.[groupName]">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(IamApi, "iam.[groupName]", (h) =>
  h.handle("endpoint1", Endpoint1.Handler)
   .handle("endpoint2", Endpoint2.Handler)
);
```

**Key Points**:
- Define `Service`, `ServiceError`, and `ServiceDependencies` types
- `Service` type uses the exact group name from domain
- `ServiceError` is always `IamAuthError`
- `ServiceDependencies` is always `Auth.Service`
- Use `HttpApiBuilder.group()` to register handlers
- First argument to `.handle()` matches the endpoint name from domain contract
- Chain multiple `.handle()` calls for multiple endpoints

---

## Schema Guidelines

### Common Fields (Available from `@beep/iam-domain/api/common`)

| Field          | Type                  | Description                        |
|----------------|-----------------------|------------------------------------|
| `UserEmail`    | `Redacted<string>`    | Email address (redacted in logs)   |
| `UserPassword` | `Redacted<string>`    | Password (redacted in logs)        |
| `CallbackURL`  | `Option<URLPath>`     | Optional redirect after auth       |
| `RememberMe`   | `boolean` (default: false) | Extended session flag         |
| `SessionToken` | `Option<string>`      | Session token                      |
| `Redirect`     | `boolean`             | Whether response triggers redirect |
| `RedirectURL`  | `Option<URLString>`   | Where to redirect                  |
| `Name`         | `string`              | User's display name                |
| `UserImage`    | `Option<URLString>`   | User's profile image URL           |

### Schema Type Mapping

When translating OpenAPI types to Effect Schema:

| OpenAPI Type/Format | Effect Schema | Notes |
|---------------------|---------------|-------|
| `{ "type": "string" }` | `S.String` | Basic string |
| `{ "type": "string", "format": "email" }` | `CommonFields.UserEmail` | Redacted, use common field |
| `{ "type": "string", "format": "password" }` | `CommonFields.UserPassword` | Redacted, use common field |
| `{ "type": "string", "format": "date-time" }` | `BS.DateTimeUtcFromAllAcceptable` | ISO 8601 datetime - accepts strings, timestamps, Date, or DateTime.Utc |
| Better Auth `expiresAt?: number` | `BS.EpochMillisFromAllAcceptable` | Epoch millis for OAuth token expiry |
| `{ "type": "string", "format": "uri" }` | `BS.URLString` | Full URL (http/https) |
| Path-like strings (e.g., `/dashboard`) | `BS.URLPath` | Path validation |
| `{ "type": "boolean" }` | `S.Boolean` | |
| `{ "type": "integer" }` | `S.Number.pipe(S.int())` | |
| `{ "type": "number" }` | `S.Number` | |
| `{ "type": "array", "items": {...} }` | `S.mutable(S.Array(ItemSchema))` | Use S.mutable for arrays |
| `{ "type": "object" }` | `S.Class` or `S.Struct` | Use S.Class for named types |
| Optional field (nullable in OpenAPI) | `S.optionalWith(Schema, { as: "Option", exact: true })` | Decodes to Option<A> |
| Required field | Field in struct | No wrapper needed |
| Optional with default | `BS.toOptionalWithDefault(Schema)(defaultValue)` or `BS.BoolWithDefault(false)` | |
| Optional without default | `S.optionalWith(Schema, { as: "Option", exact: true })` | Decodes to Option<A> |
| User/Session/Account objects | `User.Model`, `Session.Model` | Use raw Model for API responses |

### DateTime Schema Selection

When working with datetime fields, choose the correct schema based on what Better Auth expects:

| Better Auth Expects | Schema to Use | Encoded Type | Use Case |
|---------------------|---------------|--------------|----------|
| `string` (ISO 8601) | `BS.DateTimeUtcFromAllAcceptable` | `Date` | Most datetime fields (createdAt, updatedAt) |
| `number` (epoch ms) | `BS.EpochMillisFromAllAcceptable` | `number` | OAuth token `expiresAt`, `accessTokenExpiresAt`, `refreshTokenExpiresAt` |

**Example - OAuth token with expiresAt**:
```typescript
idToken: S.optionalWith(
  S.Struct({
    token: S.Redacted(S.String),
    expiresAt: S.optionalWith(BS.EpochMillisFromAllAcceptable, { as: "Option", exact: true }).annotations({
      description: "Expiry date of the token",
    }),
    // ...
  }),
  { as: "Option", exact: true }
)
```

### Sensitive Data (PII) Handling

For passwords, tokens, API keys, and other sensitive fields:

```typescript
// ❌ WRONG - will appear in logs
password: S.String

// ✅ CORRECT - redacted in logs and traces
password: S.Redacted(S.String)  // Or use CommonFields.UserPassword
```

The `CommonFields.UserEmail` and `CommonFields.UserPassword` already wrap with `S.Redacted`.

### Model Variants for CRUD Operations

When referencing domain entities (User, Session, Account), use the raw `Model` in API response schemas:

```typescript
import { User, Session } from "@beep/shared-domain/entities";

// ✅ CORRECT - use raw Model for API responses
export class Success extends S.Class<Success>($I`Success`)({
  user: User.Model,
  session: Session.Model,
}) {}
```

**Actual Pattern in Codebase**:
- **Domain API responses**: Use `User.Model`, `Session.Model` (NOT `.json` variant)
- **Infra layer database operations**: Use Model methods (`Model.insert`, `Model.update`) when they exist
- No need to worry about field exposure at the schema level - Better Auth handles this

### Optional Field Patterns

```typescript
// Optional with default (using @beep/schema helper)
rememberMe: BS.BoolWithDefault(false)

// Optional with default path
callbackURL: BS.toOptionalWithDefault(BS.URLPath)(BS.URLPath.make("/")).annotations({
  description: "Callback URL to redirect to after the user has signed in",
})

// Optional without default (decodes to Option<A>)
errorCallbackURL: S.optionalWith(BS.URLPath, { as: "Option", exact: true }).annotations({
  description: "Callback URL to redirect to if an error happens",
})

// Optional nested struct with Option semantics
idToken: S.optionalWith(
  S.Struct({
    token: S.Redacted(S.String),
    // ... nested fields
  }),
  { as: "Option", exact: true }
)
```

### Domain Entity References

For User, Session, Account responses, use raw Model schemas:

```typescript
// ❌ WRONG - inline object definition
user: S.Struct({ id: S.String, name: S.String, email: S.String })

// ✅ CORRECT - use raw Model for API responses
import { User, Session } from "@beep/shared-domain/entities";

export class Success extends S.Class<Success>($I`Success`)({
  user: User.Model,
  session: Session.Model,
}) {}
```

### Identifier Composer Usage

ALWAYS use the identifier composer for schema annotations:

```typescript
import { $IamDomainId } from "@beep/identity/packages";

const $I = $IamDomainId.create("api/v1/sign-in/email");

// Use $I for:
// 1. Class identifiers: S.Class<Payload>($I`Payload`)
// 2. Annotations: $I.annotations("PayloadName", { description: "..." })
```

---

## Error Handling

### Single Error Schema Pattern

Use `IamAuthError` for ALL endpoint errors. Do NOT create individual error schemas per endpoint:

```typescript
// ❌ WRONG - creating separate error schemas
export class SignInError extends S.TaggedError<SignInError>()("SignInError", { ... }) {}
export class InvalidCredentialsError extends S.TaggedError<...>() { ... }

// ✅ CORRECT - single error class handles all cases
import { IamAuthError } from "@beep/iam-domain/api/common";

export const Contract = HttpApiEndpoint.post("email", "/email")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(IamAuthError.annotations($I.annotations("IamAuthError", {
    description: "An Error indicating a failure to sign in.",
  })));
```

### Error Mapping in Handlers

Two approaches are supported:

**1. Using `IamAuthError.flowMap()`** (preferred):

```typescript
export const Handler: HandlerEffect = Effect.fn("SignInEmail")(function* ({ payload }) {
  // ... handler implementation
}, IamAuthError.flowMap("sign-in"));
```

**2. Using `Effect.mapError()`**:

```typescript
export const Handler: HandlerEffect = Effect.fn("GetSession")(
  function* () {
    // ... handler implementation
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get Session.",
        cause: e,
      })
  )
);
```

Both patterns are valid. `IamAuthError.flowMap()` is more concise for standard cases, while `Effect.mapError()` allows custom error messages.

---

## Forbidden Patterns

This section explicitly documents patterns that **MUST NEVER** be used in Better Auth endpoint implementations. These patterns cause type safety issues, mask errors, or violate the Effect-first architecture.

### ❌ NEVER Use Type Suppression Comments

**Forbidden**:
```typescript
// ❌ FORBIDDEN - masks type errors instead of fixing them
const response = yield* Effect.tryPromise(() =>
  // @ts-expect-error - Better Auth types don't match
  auth.api.signInEmail({ body, headers, returnHeaders: true })
);

// ❌ FORBIDDEN - ignores TypeScript compiler
const response = yield* Effect.tryPromise(() =>
  // @ts-ignore
  auth.api.signInEmail({ body, headers, returnHeaders: true })
);
```

**Why It's Forbidden**:
- Masks type mismatches between domain schemas and Better Auth expectations
- Hides bugs that will fail at runtime
- Prevents TypeScript from catching breaking changes in Better Auth updates
- Defeats the purpose of Effect Schema's type safety

**Correct Approach**:
If `runAuthEndpoint` causes TypeScript errors, use the manual `forwardCookieResponse` pattern with proper field unwrapping:

```typescript
// ✅ CORRECT - manually unwrap fields to match Better Auth types
const { headers, response } = yield* F.pipe(
  Effect.tryPromise(() =>
    auth.api.signInEmail({
      body: {
        email: Redacted.value(payload.email),
        password: Redacted.value(payload.password),
      },
      headers: request.headers,
      returnHeaders: true,
    })
  ),
  Effect.flatMap((result) =>
    Effect.all({
      headers: Effect.succeed(result.headers),
      response: S.decodeUnknown(V1.SignIn.Email.Success)(result.response),
    })
  )
);
```

---

### ❌ NEVER Use Type Assertions on Better Auth Responses

**Forbidden**:
```typescript
// ❌ FORBIDDEN - unsafe type cast
const response = yield* Effect.tryPromise(() =>
  auth.api.signInEmail({ body, headers, returnHeaders: true })
) as Promise<AuthApiResponse<unknown>>;

// ❌ FORBIDDEN - bypasses schema validation
const result = (yield* Effect.tryPromise(() =>
  auth.api.getSession({ headers })
)) as V1.Core.GetSession.Success;
```

**Why It's Forbidden**:
- Bypasses Effect Schema validation
- No runtime verification of response shape
- Breaks if Better Auth changes response format
- Loses type safety guarantees

**Correct Approach**:
Always use `S.decodeUnknown()` to validate and transform responses:

```typescript
// ✅ CORRECT - schema validation ensures type safety
const response = yield* Effect.tryPromise(() =>
  auth.api.signInEmail({ body, headers, returnHeaders: true })
);

const decoded = yield* S.decodeUnknown(V1.SignIn.Email.Success)(response.response);
```

---

### ❌ NEVER Skip Schema Encoding/Decoding

**Forbidden**:
```typescript
// ❌ FORBIDDEN - passes Effect types directly to Better Auth
const response = yield* Effect.tryPromise(() =>
  auth.api.signInEmail({
    body: payload,  // payload has Redacted<string>, Option<T> types
    headers: request.headers,
    returnHeaders: true,
  })
);

// ❌ FORBIDDEN - returns unvalidated response
return yield* HttpServerResponse.json(response.response);
```

**Why It's Forbidden**:
- Better Auth expects plain JSON types, not Effect types
- Response may not match expected schema shape
- Loses type transformations (Redacted unwrapping, Option handling)

**Correct Approach**:
Use helpers that handle encoding/decoding automatically, or manually encode/decode:

```typescript
// ✅ CORRECT - helper handles encoding and decoding
return yield* runAuthEndpoint({
  payloadSchema: V1.SignIn.Email.Payload,
  successSchema: V1.SignIn.Email.Success,
  payload,
  headers: request.headers,
  authHandler: ({ body, headers }) =>  // body is already encoded
    Effect.tryPromise(() =>
      auth.api.signInEmail({ body, headers, returnHeaders: true })
    ),
});

// ✅ CORRECT - manual encoding and decoding
const body = yield* S.encode(V1.SignIn.Email.Payload)(payload);
const response = yield* Effect.tryPromise(() =>
  auth.api.signInEmail({ body, headers: request.headers, returnHeaders: true })
);
const decoded = yield* S.decodeUnknown(V1.SignIn.Email.Success)(response.response);
```

---

### ❌ NEVER Forget Cookie Forwarding

**Forbidden**:
```typescript
// ❌ FORBIDDEN - loses session cookies
const response = yield* Effect.tryPromise(() =>
  auth.api.signInEmail({ body, headers: request.headers, returnHeaders: true })
);

const decoded = yield* S.decodeUnknown(V1.SignIn.Email.Success)(response.response);

// Missing: No cookie forwarding!
return yield* HttpServerResponse.json(decoded);
```

**Why It's Forbidden**:
- Session cookies are not forwarded to client
- User appears signed out despite successful authentication
- Critical for Better Auth session management

**Correct Approach**:
Use helpers that handle cookie forwarding automatically, or use `forwardCookieResponse()`:

```typescript
// ✅ CORRECT - helper forwards cookies automatically
return yield* runAuthEndpoint({
  payloadSchema: V1.SignIn.Email.Payload,
  successSchema: V1.SignIn.Email.Success,
  payload,
  headers: request.headers,
  authHandler: ({ body, headers }) =>
    Effect.tryPromise(() =>
      auth.api.signInEmail({ body, headers, returnHeaders: true })
    ),
});

// ✅ CORRECT - manual cookie forwarding
return yield* forwardCookieResponse(response.headers, decoded);
```

---

### Summary of Forbidden Patterns

| Forbidden Pattern | Why It's Wrong | Correct Approach |
|-------------------|----------------|------------------|
| `@ts-expect-error`, `@ts-ignore` | Masks type errors | Use manual unwrapping with `Redacted.value()`, `O.getOrElse()` |
| `as Type` type assertions | Bypasses validation | Use `S.decodeUnknown()` for responses |
| Passing Effect types directly | Better Auth expects JSON | Use `S.encode()` or helpers with automatic encoding |
| Skipping response decoding | Loses type safety | Use `S.decodeUnknown()` or helpers with automatic decoding |
| Missing cookie forwarding | Breaks session management | Use helpers or `forwardCookieResponse()` |

**Golden Rule**: If you're tempted to use `@ts-expect-error` or type assertions, the schema needs to be fixed, not suppressed.

---

## Additional Required Patterns

### Dynamic Access Control (DAC) Method Wrappers

Better Auth's organization plugin provides Dynamic Access Control methods (`listOrgRoles`, `getOrgRole`, `createOrgRole`, `deleteOrgRole`, `updateOrgRole`) that are NOT reflected in TypeScript types. These methods are added at runtime via the `dynamicAccessControl` option.

**FORBIDDEN**:
```typescript
// ❌ FORBIDDEN - Type assertion to access DAC methods
const response = yield* Effect.tryPromise(() =>
  (auth.api as unknown as { listOrgRoles: (opts: { headers: unknown }) => Promise<unknown> }).listOrgRoles({
    headers: request.headers,
  })
);
```

**REQUIRED** - Use `BetterAuthBridge` wrappers:
```typescript
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";

// ✅ CORRECT - Use typed wrapper
const response = yield* BetterAuthBridge.listOrgRoles(auth.api as Record<string, unknown>, {
  headers: request.headers,
});
```

**Available DAC wrappers** (in `packages/iam/server/src/adapters/better-auth/BetterAuthBridge.ts`):
- `getOrgRole` - Get role by ID
- `createOrgRole` - Create new role
- `deleteOrgRole` - Delete role
- `updateOrgRole` - Update role permissions
- `listOrgRoles` - List all organization roles

---

### Mutually Exclusive Optional Fields Pattern

When an API expects EITHER field A OR field B but never both, use conditional object construction:

**FORBIDDEN**:
```typescript
// ❌ FORBIDDEN - Using `any` type and spreading undefined
const body: any = singleValue
  ? { fieldA: singleValue, fieldB: undefined }
  : { fieldB: multiValue, fieldA: undefined };
```

**REQUIRED**:
```typescript
// ✅ CORRECT - Conditional spreading (only include the field that has a value)
const body = singleValue != null
  ? { fieldA: singleValue }
  : { fieldB: multiValue };
```

**Why**:
1. Avoids `any` type which defeats type safety
2. Respects `exactOptionalPropertyTypes` - never spread `undefined` values
3. TypeScript infers correct union type `{ fieldA: T } | { fieldB: U }`

---

### Type Narrowing After Validation in Effect Generators

TypeScript doesn't automatically narrow types after validation in Effect generator functions. Store validated values in typed local variables.

**FORBIDDEN**:
```typescript
// ❌ FORBIDDEN - Type assertion after validation
if (!isValidRole(payload.role)) {
  return yield* Effect.fail(new IamAuthError({ message: "Invalid role" }));
}
// TypeScript still sees payload.role as original type
auth.api.setRole({ body: { role: payload.role as "user" | "admin" } });
```

**REQUIRED**:
```typescript
// ✅ CORRECT - Store in typed variable after validation
if (!isValidRole(payload.role)) {
  return yield* Effect.fail(new IamAuthError({ message: "Invalid role" }));
}
// Capture in properly typed variable at narrowing point
const validatedRole: "user" | "admin" = payload.role;
auth.api.setRole({ body: { role: validatedRole } });
```

**Why**: Effect generators use control flow that TypeScript doesn't fully analyze. Explicit assignment captures the narrowed type.

---

## Naming Conventions

### File Names

Use kebab-case matching the endpoint path:

| OpenAPI Path              | File Name            |
|---------------------------|----------------------|
| `/change-password`        | `change-password.ts` |
| `/reset-password/{token}` | `reset-password.ts`  |
| `/sign-in/email`          | `sign-in/email.ts`   |

### Contract Names

Export as `Contract` constant in each file:

```typescript
export const Contract = HttpApiEndpoint.post("endpoint-name", "/path")
  // ...
```

### Handler Names

First argument to `Effect.fn()` uses PascalCase:

```typescript
export const Handler: HandlerEffect = Effect.fn("SignInEmail")(function* ({ payload }) {
  // ...
}, IamAuthError.flowMap("sign-in"));
```

First argument to `.handle()` in group uses kebab-case matching endpoint name:

```typescript
export const Routes: Routes = HttpApiBuilder.group(IamApi, "signIn", (h) =>
  h.handle("email", Email.Handler)  // "email" matches Contract name
   .handle("social", Social.Handler)
);
```

### Group Names

- Domain group: `iam.[camelCase]` (e.g., `iam.signIn`, `iam.core`, `iam.twoFactor`)
- Infra types: Use same group name in `Service` type
- Path prefix: Use kebab-case (e.g., `/sign-in`, `/two-factor`)

---

## Better Auth API Methods Reference

### Method Naming Convention

Method names use camelCase, derived from endpoint paths:
- Remove leading slash
- Replace hyphens with camelCase
- Example: `/sign-in/email` → `signInEmail`

**IMPORTANT: Always Verify Method Names Before Implementation**

Before implementing a handler, verify the exact Better Auth method name using one of these approaches:

1. **TypeScript IntelliSense** (most reliable):
   ```typescript
   const auth = yield* Auth.Service;
   auth.api.  // ← Trigger autocomplete to see all available methods
   ```

2. **Better Auth TypeScript Types**:
   Check `node_modules/better-auth/dist/types.d.ts` or the type definition for `auth.api.*`

3. **Better Auth Documentation**:
   Consult [Better Auth API Reference](https://www.better-auth.com/docs) for official method names

4. **OpenAPI Spec `operationId`**:
   The `operationId` field in `nextjs-better-auth-api-spec.json` indicates the method name

**Common Naming Patterns to Watch For**:

| Endpoint Path | ❌ WRONG Method Name | ✅ CORRECT Method Name | Notes |
|---------------|---------------------|----------------------|-------|
| `/sign-in/oauth2` | `signInOAuth2` | `signInWithOAuth2` | Prefix "with" for OAuth methods |
| `/sign-in/sso` | `signInSso` | `signInSSO` | SSO is uppercase |
| `/two-factor/disable` | `twoFactor.disable` | `twoFactorDisable` | Plugin methods are flat camelCase |
| `/passkey/generate-options` | `passkey.generateOptions` | `passkeyGenerateOptions` | Plugin methods are flat camelCase |
| `/organization/create` | `organization.create` | `organizationCreate` | Plugin methods are flat camelCase |

**Why Verification Matters**:
- Better Auth uses non-standard naming for some methods (e.g., `signInWithOAuth2` instead of `signInOAuth2`)
- Plugin methods are flat camelCase, not nested (e.g., `twoFactorDisable`, not `twoFactor.disable`)
- Typos or incorrect method names cause runtime errors that TypeScript can catch
- Saves debugging time by verifying before implementation

**Example Verification Workflow**:
```typescript
// Step 1: Check TypeScript types
import { Auth } from "@beep/iam-server/adapters";

const auth = yield* Auth.Service;

// Step 2: Verify method exists (autocomplete will show available methods)
auth.api.signInWithOAuth2  // ✅ Correct - method exists
auth.api.signInOAuth2      // ❌ Wrong - no such method

// Step 3: Check method signature
auth.api.signInWithOAuth2({
  body: { ... },
  headers: request.headers,
  // Check if returnHeaders is supported
})
```

### Core Methods (M0, M3-M8)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `getSession`     | GET /get-session      | Retrieve current session |
| `signOut`        | POST /sign-out        | End session              |
| `changePassword` | POST /change-password | Update password          |
| `resetPassword`  | POST /reset-password  | Complete password reset  |
| `requestPasswordReset` | POST /request-password-reset | Request reset email |
| `verifyEmail`    | GET /verify-email     | Confirm email address    |
| `sendVerificationEmail` | POST /send-verification-email | Resend verification |
| `updateUser`     | POST /update-user     | Modify user profile      |
| `deleteUser`     | POST /delete-user     | Remove account           |
| `accountInfo`    | GET /account-info     | Get provider account info |
| `listUserSessions` | GET /list-sessions  | List all user sessions   |
| `revokeSession`  | POST /revoke-session  | End specific session     |
| `revokeSessions` | POST /revoke-sessions | End all sessions         |
| `revokeOtherSessions` | POST /revoke-other-sessions | End all other sessions |
| `linkSocialAccount` | POST /link-social  | Connect OAuth account    |
| `unlinkAccount`  | POST /unlink-account  | Remove linked account    |
| `listUserAccounts` | GET /list-accounts  | List linked accounts     |
| `refreshToken`   | POST /refresh-token   | Refresh OAuth token      |
| `getAccessToken` | POST /get-access-token | Get valid access token  |
| `changeEmail`    | POST /change-email    | Change user email        |

### Sign In Methods (M1)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `signInEmail`    | POST /sign-in/email   | Email/password sign in   |
| `signInSocial`   | POST /sign-in/social  | OAuth provider sign in   |
| `signInAnonymous` | POST /sign-in/anonymous | Anonymous sign in      |
| `signInPhoneNumber` | POST /sign-in/phone-number | Phone sign in       |
| `signInUsername` | POST /sign-in/username | Username sign in        |
| `signInOAuth2`   | POST /sign-in/oauth2  | OAuth2 sign in           |
| `signInSSO`      | POST /sign-in/sso     | SSO sign in              |

### Sign Up Methods (M2)

| Method           | Endpoint              | Description              |
|------------------|-----------------------|--------------------------|
| `signUpEmail`    | POST /sign-up/email   | Email registration       |

(Additional groups M9-M15 methods available in orchestration prompt)

> **Note**: Method names can also be discovered from Better Auth's TypeScript types: `auth.api.*`. The OpenAPI spec `operationId` field also indicates the method name.

---

## Barrel Export Pattern

When exporting from `index.ts` files, use namespace re-exports:

```typescript
// packages/iam/domain/src/api/v1/core/index.ts
export * as GetSession from "./get-session.ts";
export * as SignOut from "./sign-out.ts";
export * as ChangePassword from "./change-password.ts";
// Namespace re-export pattern - each endpoint as a namespace
```

This allows usage like:

```typescript
import { V1 } from "@beep/iam-domain/api";

// Access endpoint schemas
const payload = V1.SignIn.Email.Payload.make({ ... });
const response = V1.SignIn.Email.Success;
```

---

## Verification Commands

After implementing endpoints, run these commands to verify correctness:

```bash
# Type check entire workspace
bun run check

# Build affected packages
bun run build --filter=@beep/iam-domain --filter=@beep/iam-server

# Full workspace build
bun run build

# Lint and auto-fix
bun run lint:fix
```

**Success Criteria**:
- `bun run check` passes with no errors
- `bun run build --filter=@beep/iam-domain --filter=@beep/iam-server` succeeds
- Endpoints appear in OpenAPI spec at server `/docs` route
- Cookie forwarding works in all handlers
- All schemas properly annotated with `$I`

---

## Quick Reference Checklist

### Domain Contract Checklist

- [ ] Import `$IamDomainId` from `@beep/identity/packages`
- [ ] Create identifier: `const $I = $IamDomainId.create("api/v1/[group]/[endpoint]")`
- [ ] Define `Payload` class (if endpoint accepts body/query params)
- [ ] Define `Success` class
- [ ] Use `$I\`ClassName\`` syntax for class identifiers
- [ ] Use `$I.annotations()` for schema metadata
- [ ] Define `Contract` with appropriate HTTP method
- [ ] Chain `.setPayload()` or `.setUrlParams()` as needed
- [ ] Chain `.addError(IamAuthError)`
- [ ] Chain `.addSuccess(Success)`
- [ ] Update group `_group.ts` with import and `.add(Contract)`
- [ ] Update `index.ts` with namespace export

### Infra Handler Checklist

- [ ] Import domain contract: `import { V1 } from "@beep/iam-domain/api"`
- [ ] Import Auth service: `import { Auth } from "@beep/iam-server"` (or `"@beep/iam-server/adapters"`)
- [ ] Import appropriate helper from `"../../common/schema-helpers"`
  - [ ] `runAuthEndpoint` for POST/PUT with body (DEFAULT for all POST endpoints)
  - [ ] `runAuthQuery` for GET endpoints
  - [ ] `runAuthCommand` for commands returning `{ success: true }`
  - [ ] `forwardCookieResponse` ONLY if `runAuthEndpoint` fails TypeScript checks
- [ ] Define `HandlerEffect` type: `Common.HandlerEffect<V1.[Group].[Endpoint].Payload>` or `Common.HandlerEffect<undefined>`
- [ ] Export `Handler` with `Effect.fn("HandlerName")`
- [ ] Yield `Auth.Service` and `HttpServerRequest.HttpServerRequest`

**Using helper functions (ALWAYS prefer this)**:
- [ ] Call appropriate helper (`runAuthEndpoint`, `runAuthQuery`, or `runAuthCommand`)
- [ ] Pass required schemas:
  - `payloadSchema` (for `runAuthEndpoint`)
  - `successSchema` (for `runAuthEndpoint` and `runAuthQuery`)
  - `successValue` (for `runAuthCommand`)
- [ ] Pass `payload` (for `runAuthEndpoint`) and `headers`
- [ ] Provide `authHandler` callback with Better Auth API call
- [ ] Pass `body` directly to Better Auth (already encoded by helper)
- [ ] Wrap handler with error mapping (`IamAuthError.flowMap()` or `Effect.mapError()`)

**Manual approach (ONLY when `runAuthEndpoint` causes TypeScript errors)**:
- [ ] Manually unwrap Redacted fields with `Redacted.value(payload.field)`
- [ ] Manually unwrap Option fields with `F.pipe(payload.field, O.getOrElse(F.constUndefined))`
- [ ] Call Better Auth API method with `{ body: { ... }, headers, returnHeaders: true }`
- [ ] Use `Effect.all()` to combine headers and decoded response
- [ ] Decode response with `S.decodeUnknown(V1.[Group].[Endpoint].Success)(result.response)`
- [ ] Call `forwardCookieResponse(headers, response)` to handle cookie forwarding
- [ ] Wrap handler with error mapping (`IamAuthError.flowMap()` or `Effect.mapError()`)

**Final steps (all approaches)**:
- [ ] Update group `_group.ts` with import and `.handle("name", Handler)`
- [ ] Update `index.ts` with export

---

## Summary

This patterns document captures the working implementation patterns from M0-M2. Follow these patterns exactly for consistency and to ensure compatibility with the existing codebase. When in doubt, refer to the actual implementation files in `packages/iam/domain/src/api/v1/` and `packages/iam/server/src/api/v1/`.
