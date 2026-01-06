# Cookie Investigation Research Synthesis

**Date:** 2026-01-06
**Issue:** Sign-up creates sessions in database, but cookies are not set in browser and no redirect occurs.

## Executive Summary

After comprehensive parallel research across 5 domains (Better Auth source, Better Auth docs, Effect-Better-Auth example, Effect Platform HTTP, and beep-effect implementation), we have identified the **root cause** and potential solutions.

**Key Finding:** The beep-effect implementation is largely correct. The issue is likely in **how Better Auth's programmatic API handles cookies** versus its HTTP handler mode.

---

## 1. Root Cause Analysis

### Primary Hypothesis: Better Auth Programmatic API vs HTTP Handler

When Better Auth is called via:
```typescript
auth.api.signUpEmail({ returnHeaders: true, ... })
```

The cookies may NOT be in the returned `headers` object. This is because:

1. **Better Auth's HTTP handler** (`auth.handler`) sets cookies directly on the HTTP response
2. **Better Auth's programmatic API** (`auth.api.*`) may not include cookies in the returned headers object

**Evidence from Better Auth source** (`01-better-auth-source-findings.md`):
- `setSessionCookie()` uses `ctx.setSignedCookie()` which sets cookies on the handler context
- When using `returnHeaders: true`, the `headers` object is constructed from the context's response headers
- The question is whether `ctx.setSignedCookie()` populates the headers object when called programmatically

### Secondary Hypothesis: Cookie Configuration Conflicts

**Development mode configuration:**
```typescript
sameSite: "lax",
secure: false
```

`sameSite: "lax"` may block cookies for cross-origin fetch/XHR requests. Cookies are only sent for:
- Same-site requests
- Top-level navigations with GET method

**Production configuration:**
```typescript
sameSite: "none",
secure: true,
partitioned: true
```

The `partitioned: true` (CHIPS) may cause compatibility issues with older browsers.

---

## 2. Key Findings by Research Domain

### 2.1 Better Auth Source Code Analysis
- `setSessionCookie()` is called after successful authentication
- Cookies are signed with HMAC using the secret
- Multiple cookies can be set (session_token, session_data, dont_remember_token)
- Response structure with `returnHeaders: true`: `{ headers: Headers, response: { token, user } }`

### 2.2 Better Auth Documentation
- `credentials: true` is mandatory in CORS configuration
- `credentials: "include"` is mandatory in client fetch
- For cross-origin: use `sameSite: "none"` + `secure: true`
- For subdomains: use `crossSubDomainCookies` configuration
- `partitioned: true` may be needed for modern browser third-party cookie restrictions

### 2.3 Effect-Better-Auth Example (Working Implementation)
**Critical pattern used:**
```typescript
// Better Auth wrapped as Effect HttpApp
export const BetterAuthApp = HttpApp.fromWebHandler(auth.handler)

// Mounted at /api/auth
export const BetterAuthRouterLive = HttpApiBuilder.Router.use((router) =>
  router.mountApp("/api/auth", BetterAuthApp, { includePrefix: true })
)
```

**Key difference from beep-effect:** The example uses `HttpApp.fromWebHandler(auth.handler)` which lets Better Auth handle cookies natively through its HTTP handler. Beep-effect uses the programmatic API (`auth.api.signUpEmail`).

### 2.4 Effect Platform HTTP Module
- `HttpServerResponse.json()` defaults to `Cookies.empty` - must explicitly pass cookies
- `HttpServerResponse.mergeCookies()` correctly merges cookies into response
- `HttpApp.fromWebHandler()` preserves Set-Cookie headers via `headers.getSetCookie()`
- `FetchHttpClient.RequestInit` with `credentials: "include"` is correctly configured

### 2.5 Beep-Effect Implementation
- Cookie forwarding logic in `forwardCookieResponse` is **CORRECT**
- `credentials: "include"` is **CORRECT** in client
- CORS `credentials: true` is **CORRECT**
- Better Auth configuration is **MOSTLY CORRECT** but may have issues with `partitioned: true`

---

## 3. Recommended Fix Strategy

### Option A: Use Better Auth HTTP Handler Directly (Recommended)

Instead of wrapping Better Auth's programmatic API with Effect handlers, mount Better Auth's HTTP handler directly using `HttpApp.fromWebHandler`:

```typescript
// packages/iam/server/src/adapters/better-auth/BetterAuthApp.ts
import { HttpApiBuilder, HttpApp } from "@effect/platform"
import { auth } from "./Auth"

export const BetterAuthApp = HttpApp.fromWebHandler(auth.handler)

export const BetterAuthRouterLive = HttpApiBuilder.Router.use((router) =>
  router.mountApp("/api/auth", BetterAuthApp, { includePrefix: true })
)
```

This bypasses the issue entirely because:
1. Better Auth's handler manages cookies natively
2. `HttpApp.fromWebHandler` preserves all Set-Cookie headers automatically
3. No manual cookie forwarding needed

### Option B: Debug Current Implementation

If Option A is not feasible, add debugging to verify cookie flow:

1. **Log Better Auth headers:**
```typescript
const result = await auth.api.signUpEmail({ ..., returnHeaders: true });
console.log("Set-Cookie headers:", result.headers.getSetCookie());
```

2. **Log HttpServerResponse cookies:**
```typescript
const response = yield* forwardCookieResponse(headers, body);
console.log("Response cookies:", Cookies.toSetCookieHeaders(response.cookies));
return response;
```

3. **Check browser Network tab:**
   - Verify `Set-Cookie` headers in response
   - Verify cookies appear in Application > Cookies

### Option C: Configuration Fixes

If cookies ARE being sent but not stored:

1. **Remove `partitioned: true` temporarily:**
```typescript
defaultCookieAttributes: {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  // partitioned: true,  // Disable for testing
}
```

2. **For development, consider HTTPS:**
```typescript
// Use same settings as production but with HTTPS dev server
defaultCookieAttributes: {
  httpOnly: true,
  sameSite: "none",
  secure: true,
}
```

3. **Verify trusted origins match exactly:**
```typescript
// Check serverEnv.security.trustedOrigins includes exact client URL
// e.g., "http://localhost:3000" not "http://localhost:3000/"
```

---

## 4. Architecture Comparison

| Aspect | Working Example | Beep-Effect Current |
|--------|-----------------|---------------------|
| Auth Handler | `HttpApp.fromWebHandler(auth.handler)` | `auth.api.signUpEmail()` |
| Cookie Management | Better Auth native | Manual forwarding |
| Route Mounting | `router.mountApp("/api/auth", ...)` | `HttpApiBuilder.group(...)` |
| Cookie Flow | Automatic | Must extract & merge |

---

## 5. Implementation Priority

1. **Immediate:** Add logging to verify cookies in Better Auth response
2. **Short-term:** Implement Option A (use `HttpApp.fromWebHandler`)
3. **If needed:** Apply configuration fixes (Option C)

---

## 6. Files to Modify

### For Option A (Recommended)

1. **Create:** `packages/iam/server/src/adapters/better-auth/BetterAuthApp.ts`
   - Wrap `auth.handler` with `HttpApp.fromWebHandler`
   - Create router layer for mounting

2. **Modify:** `packages/runtime/server/src/HttpRouter.layer.ts`
   - Add `BetterAuthRouterLive` to layer composition

3. **Remove/Deprecate:** Custom sign-up handlers in `packages/iam/server/src/api/v1/sign-up/`
   - Or keep them for additional business logic but don't forward cookies manually

### For Option B (Debugging)

1. **Modify:** `packages/iam/server/src/api/v1/sign-up/email.ts`
   - Add console.log statements for debugging

### For Option C (Configuration)

1. **Modify:** `packages/iam/server/src/adapters/better-auth/Options.ts`
   - Adjust cookie configuration

---

## 7. References

| Document | Key Insight |
|----------|-------------|
| `01-better-auth-source-findings.md` | Cookie generation flow, setSessionCookie implementation |
| `02-better-auth-docs-findings.md` | CORS requirements, troubleshooting checklist |
| `03-effect-example-findings.md` | Working architecture with HttpApp.fromWebHandler |
| `04-effect-platform-findings.md` | Cookie handling in Effect Platform |
| `05-beep-implementation-findings.md` | Current implementation analysis |
