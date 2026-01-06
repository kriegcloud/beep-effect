# Beep-Effect IAM Implementation - Cookie Investigation Findings

## Executive Summary

After thorough analysis of the beep-effect IAM implementation, the cookie forwarding mechanism appears correctly implemented in the server-side code. However, there are potential issues in how cookies flow through the system that warrant investigation.

---

## 1. Sign-Up Flow Trace

### Client-Side Flow

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/client/src/atom/sign-up/sign-up.atoms.ts`
```typescript
export const useSignUpEmail = () => {
  const signUpEmail = useAtomSet(ApiClient.mutation("signUp", "email", {
    withResponse: true,  // Line 6 - Requests full response with headers
  }), { mode: "promise" as const });

  return { signUpEmail };
};
```

**Key Observation:** The client requests `withResponse: true`, which according to `@effect-atom/atom-react` documentation (see `AtomHttpApi.ts` line 74), should return a tuple `[_Success, HttpClientResponse]` instead of just the success body.

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/client/src/atom/api-client.ts`
```typescript
const httpClientWithCredentials = FetchHttpClient.layer.pipe(
  Layer.provide(Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include" }))
);
```

**Status:** CORRECTLY CONFIGURED for cross-origin cookie handling with `credentials: "include"`.

### Server-Side Flow

**1. Handler Entry Point**
**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/src/api/v1/sign-up/email.ts`

```typescript
export const Handler: HandlerEffect = Effect.fn("SignUpEmailHandler")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  const { headers, response } = yield* F.pipe(
    Effect.tryPromise(() =>
      auth.api.signUpEmail({
        body: { /* ... */ },
        headers: request.headers,
        returnHeaders: true,  // Line 31 - Requests headers from Better Auth
      })
    ),
    Effect.flatMap((result) =>
      Effect.all({
        headers: Effect.succeed(result.headers),
        response: S.decodeUnknown(V1.SignUp.Email.Success)(result.response).pipe(
          Effect.flatMap(S.encode(V1.SignUp.Email.Success))
        ),
      })
    )
  );

  return yield* forwardCookieResponse(headers, response);  // Line 45
}, IamAuthError.flowMap("sign-up"));
```

**Key Observations:**
1. Better Auth is called with `returnHeaders: true` to get session cookies
2. Headers are extracted from the Better Auth response
3. `forwardCookieResponse` is called to merge cookies into the HTTP response

**2. Cookie Forwarding Implementation**
**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/src/api/common/schema-helpers.ts`

```typescript
export const forwardCookieResponse = <T>(
  headers: Headers,
  response: T
): Effect.Effect<HttpServerResponse.HttpServerResponse, HttpBody.HttpBodyError | Cookies.CookiesError, never> =>
  F.pipe(
    headers.getSetCookie(),  // Line 29 - Gets all Set-Cookie headers
    A.fromIterable,
    (cookies) =>
      A.isEmptyArray(cookies)
        ? HttpServerResponse.json(response)
        : F.pipe(
            HttpServerResponse.json(response),
            Effect.flatMap(
              HttpServerResponse.mergeCookies(Cookies.fromSetCookie(cookies))  // Line 37
            )
          )
  );
```

**Status:** This implementation is CORRECT. It:
1. Retrieves all Set-Cookie headers using `headers.getSetCookie()` (Web API)
2. Converts them to Effect's `Cookies` using `Cookies.fromSetCookie()`
3. Merges them into the `HttpServerResponse`

**3. Route Registration**
**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/src/api/v1/sign-up/_group.ts`

```typescript
export const Routes: Routes = HttpApiBuilder.group(IamApi, "signUp", (h) => h.handle("email", Email.Handler));
```

**4. Response Serialization**
**File:** `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/@effect/platform/src/internal/httpServerResponse.ts` (lines 591-648)

```typescript
export const toWeb = (response: ServerResponse.HttpServerResponse, ...): Response => {
  const headers = new globalThis.Headers(response.headers)
  if (!Cookies.isEmpty(response.cookies)) {
    const toAdd = Cookies.toSetCookieHeaders(response.cookies)
    for (const header of toAdd) {
      headers.append("set-cookie", header)  // Line 600 - Cookies ARE added
    }
  }
  // ... returns Response with headers including cookies
}
```

**Status:** CORRECT. The platform correctly serializes `response.cookies` back to `Set-Cookie` headers.

---

## 2. Cookie Configuration Analysis

### Better Auth Configuration
**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/server/src/adapters/better-auth/Options.ts`

```typescript
advanced: {
  database: { generateId: false },
  defaultCookieAttributes:
    serverEnv.app.env === EnvValue.Enum.dev
      ? {
          httpOnly: true,
          sameSite: "lax",
          secure: false,  // Dev mode - not secure
        }
      : {
          httpOnly: true,
          partitioned: true,
          sameSite: "none",   // Cross-site cookies
          secure: true,       // HTTPS required
        },
},
```

**Production Configuration Analysis:**
- `httpOnly: true` - Correct, prevents XSS access
- `partitioned: true` - CHIPS (Cookies Having Independent Partitioned State)
- `sameSite: "none"` - Required for cross-origin credentials
- `secure: true` - Required when `sameSite: "none"`

**Potential Issue:** The `partitioned: true` setting enables CHIPS which is a newer privacy feature. If the browser or environment doesn't support it, cookies may not work as expected.

### CORS Configuration
**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/server/src/HttpRouter.layer.ts`

```typescript
const CorsMiddleware = HttpLayerRouter.cors({
  allowedOrigins: serverEnv.security.trustedOrigins,
  allowedMethods: BS.HttpMethod.pickOptions("GET", "POST", "PUT", "DELETE", "PATCH"),
  allowedHeaders: AllowedHeaders.Options,
  credentials: true,  // Line 43 - CORS credentials enabled
});
```

**Status:** CORRECTLY configured with `credentials: true`.

---

## 3. Potential Issue Points

### Issue 1: HttpApiBuilder Response Encoding

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/@effect/platform/src/HttpApiBuilder.ts` (line 699)

```typescript
const response = yield* handler(request)
return HttpServerResponse.isServerResponse(response) ? response : yield* encodeSuccess(response)
```

**Analysis:** When the handler returns an `HttpServerResponse` directly (which `forwardCookieResponse` does), it should pass through WITHOUT transformation. This is correct behavior.

**BUT** there's a subtle issue - the `encodeSuccess` function creates a new `HttpServerResponse.json()` which would NOT preserve cookies from the original response. Let me verify the handler returns the correct type:

The handler in `email.ts` returns:
```typescript
return yield* forwardCookieResponse(headers, response);
```

And `forwardCookieResponse` returns:
```typescript
Effect.Effect<HttpServerResponse.HttpServerResponse, ...>
```

**Verdict:** This should be working correctly as `HttpServerResponse.isServerResponse()` should return `true` for the response.

### Issue 2: Client Response Processing

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/node_modules/@effect/platform/src/HttpApiClient.ts` (lines 231-235)

```typescript
const response = yield* httpClient.execute(httpRequest)
const value = yield* (options.transformResponse === undefined
  ? decodeResponse(response)
  : options.transformResponse(decodeResponse(response)))
return request?.withResponse === true ? [value, response] : value
```

**Analysis:** When `withResponse: true`:
1. The HTTP response is captured
2. The body is decoded
3. Both `[value, response]` are returned

**The client DOES get access to the response object.** But the question is:

**Are cookies automatically handled by the browser when `credentials: "include"` is set?**

According to the Fetch API specification:
- When `credentials: "include"` is used, the browser SHOULD automatically store `Set-Cookie` headers
- No JavaScript intervention is needed

**However:** If the response processing in Effect discards or doesn't forward cookies through the Fetch layer properly, they may be lost.

### Issue 3: FetchHttpClient Layer Cookie Handling

**Critical Question:** Does `@effect/platform/FetchHttpClient` preserve `Set-Cookie` handling for credentials mode?

Looking at how the client is constructed in `api-client.ts`:
```typescript
const httpClientWithCredentials = FetchHttpClient.layer.pipe(
  Layer.provide(Layer.succeed(FetchHttpClient.RequestInit, { credentials: "include" }))
);
```

This provides `credentials: "include"` to the underlying `fetch()` calls. When the browser makes a fetch request with `credentials: "include"`:

1. Request includes existing cookies
2. Response `Set-Cookie` headers are processed by the browser
3. Cookies are stored in the browser's cookie jar

**This should work automatically** - no JavaScript intervention needed.

---

## 4. API Contract Definition

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/packages/iam/domain/src/api/v1/sign-up/email.ts`

```typescript
export const Contract = HttpApiEndpoint.post("email", "/email")
  .addSuccess(Success)
  .addError(IamAuthError)
  .setHeaders(CommonHeaders.CaptchaRequestHeaders)
  .setPayload(Payload);
```

**Note:** There's no response header schema defined. This is fine because cookies are handled at the HTTP layer, not the API schema layer.

---

## 5. Root Cause Analysis

After comprehensive analysis, the server-side cookie forwarding implementation appears CORRECT. The potential issues are:

### Most Likely Cause: Browser Cookie Storage Issues

1. **Development Environment:**
   - `sameSite: "lax"` requires same-site context OR top-level navigation
   - If the sign-up request is made via XHR/fetch (not a form submission), `lax` may block cookies

2. **Production Environment:**
   - `sameSite: "none"` + `secure: true` requires HTTPS
   - `partitioned: true` may cause issues with older browsers
   - Cross-origin cookie storage requires exact origin matching in CORS

### Second Likely Cause: CORS Origin Mismatch

The CORS configuration uses `serverEnv.security.trustedOrigins`. If the client origin doesn't exactly match (e.g., with/without trailing slash, different ports), cookies may be rejected.

### Third Possibility: Better Auth Response Structure

When Better Auth returns headers with `returnHeaders: true`, verify the response structure contains `Set-Cookie` headers:

```typescript
const result = await auth.api.signUpEmail({ ..., returnHeaders: true });
console.log(result.headers); // Should contain Set-Cookie
```

If Better Auth doesn't include cookies in the `headers` object when using the programmatic API (vs. HTTP handler), the cookies would be lost.

---

## 6. Recommendations

### Immediate Debugging Steps

1. **Log the Better Auth response headers:**
   ```typescript
   // In email.ts handler
   const result = yield* Effect.tryPromise(() =>
     auth.api.signUpEmail({ ..., returnHeaders: true })
   );
   console.log("Better Auth headers:", result.headers);
   console.log("Set-Cookie:", result.headers.getSetCookie?.());
   ```

2. **Verify HttpServerResponse contains cookies:**
   ```typescript
   const response = yield* forwardCookieResponse(headers, response);
   console.log("Response cookies:", response.cookies);
   return response;
   ```

3. **Check browser Network tab:**
   - Verify `Set-Cookie` headers are present in the response
   - Check if cookies are being stored (Application tab > Cookies)

### Configuration Fixes

1. **Development Mode Cookie Settings:**
   Consider using `sameSite: "none"` with `secure: true` even in dev (via HTTPS localhost):
   ```typescript
   defaultCookieAttributes: {
     httpOnly: true,
     sameSite: "none",
     secure: true,  // Requires HTTPS, even localhost
   }
   ```

2. **Remove `partitioned: true` temporarily:**
   CHIPS is a newer feature; removing it may fix compatibility issues:
   ```typescript
   defaultCookieAttributes: {
     httpOnly: true,
     sameSite: "none",
     secure: true,
     // partitioned: true,  // Disable temporarily
   }
   ```

3. **Verify Trusted Origins:**
   Ensure `serverEnv.security.trustedOrigins` contains the exact client origin including protocol and port.

### Alternative Architecture (If Issues Persist)

If the cookie forwarding through Effect's HttpApi continues to have issues, consider:

1. **Use Better Auth's built-in HTTP handler** for auth routes instead of wrapping in Effect HttpApi
2. **Proxy approach:** Mount Better Auth's handler directly at `/api/auth/*` and let it handle cookies natively

---

## 7. File Reference Summary

| File | Purpose | Line Numbers |
|------|---------|--------------|
| `packages/iam/client/src/atom/sign-up/sign-up.atoms.ts` | Client sign-up hook | 5-7 |
| `packages/iam/client/src/atom/api-client.ts` | HTTP client with credentials | 14-16, 18-22 |
| `packages/iam/server/src/api/v1/sign-up/email.ts` | Sign-up handler | 14-46 |
| `packages/iam/server/src/api/common/schema-helpers.ts` | Cookie forwarding | 24-40 |
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Auth & cookie config | 223-240 |
| `packages/runtime/server/src/HttpRouter.layer.ts` | CORS config | 38-43 |
| `packages/iam/domain/src/api/v1/sign-up/email.ts` | API contract | 34-38 |

---

## 8. Conclusion

The beep-effect implementation correctly implements cookie forwarding at the code level. The issue is likely related to:

1. **Browser cookie policy** (SameSite, Secure, CORS)
2. **Better Auth programmatic API** not including cookies in `returnHeaders` response
3. **Environment configuration mismatch** (origins, HTTPS requirements)

Focus debugging efforts on verifying cookies are present at each stage:
1. Better Auth response headers
2. HttpServerResponse.cookies property
3. Browser response headers
4. Browser cookie storage
