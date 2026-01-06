# Better Auth Cookie Handling Investigation

This document details the internal cookie handling mechanics in Better Auth, based on source code analysis of version 1.5.0-beta.2.

## Table of Contents
1. [Cookie Generation Flow](#1-cookie-generation-flow)
2. [API Response Structure](#2-api-response-structure)
3. [Cookie Configuration](#3-cookie-configuration)
4. [Sign-Up Specific Flow](#4-sign-up-specific-flow)
5. [Potential Issues with Proxy Forwarding](#5-potential-issues-with-proxy-forwarding)

---

## 1. Cookie Generation Flow

### Where Cookies Are Created

Cookies are created in `/packages/better-auth/src/cookies/index.ts` via these key functions:

#### `setSessionCookie` (Lines 235-294)
This is the primary function called after successful authentication:

```typescript
export async function setSessionCookie(
  ctx: GenericEndpointContext,
  session: {
    session: Session & Record<string, any>;
    user: User;
  },
  dontRememberMe?: boolean | undefined,
  overrides?: Partial<CookieOptions> | undefined,
) {
  // Check if user requested "don't remember me"
  const dontRememberMeCookie = await ctx.getSignedCookie(
    ctx.context.authCookies.dontRememberToken.name,
    ctx.context.secret,
  );
  dontRememberMe =
    dontRememberMe !== undefined ? dontRememberMe : !!dontRememberMeCookie;

  const options = ctx.context.authCookies.sessionToken.options;
  const maxAge = dontRememberMe
    ? undefined
    : ctx.context.sessionConfig.expiresIn;

  // Set the signed session token cookie
  await ctx.setSignedCookie(
    ctx.context.authCookies.sessionToken.name,
    session.session.token,
    ctx.context.secret,
    {
      ...options,
      maxAge,
      ...overrides,
    },
  );

  // Optionally set "don't remember me" cookie
  if (dontRememberMe) {
    await ctx.setSignedCookie(
      ctx.context.authCookies.dontRememberToken.name,
      "true",
      ctx.context.secret,
      ctx.context.authCookies.dontRememberToken.options,
    );
  }

  // Set cookie cache if enabled
  await setCookieCache(ctx, session, dontRememberMe);

  // Notify context of new session
  ctx.context.setNewSession(session);

  // Store in secondary storage if configured
  if (ctx.context.options.secondaryStorage) {
    await ctx.context.secondaryStorage?.set(
      session.session.token,
      JSON.stringify({
        user: session.user,
        session: session.session,
      }),
      Math.floor(
        (new Date(session.session.expiresAt).getTime() - Date.now()) / 1000,
      ),
    );
  }
}
```

#### `setCookieCache` (Lines 113-233)
Sets an optional session cache cookie containing session data:

```typescript
export async function setCookieCache(
  ctx: GenericEndpointContext,
  session: {
    session: Session & Record<string, any>;
    user: User;
  },
  dontRememberMe: boolean,
) {
  const shouldStoreSessionDataInCookie =
    ctx.context.options.session?.cookieCache?.enabled;

  if (shouldStoreSessionDataInCookie) {
    // Filter session and user data based on configuration
    const filteredSession = /* ... */;
    const filteredUser = parseUserOutput(ctx.context.options, session.user);

    // Compute version for cache invalidation
    const version = /* ... */;

    const sessionData = {
      session: filteredSession,
      user: filteredUser,
      updatedAt: Date.now(),
      version,
    };

    // Encode data based on strategy (compact/jwt/jwe)
    const strategy = ctx.context.options.session?.cookieCache?.strategy || "compact";
    let data: string;

    if (strategy === "jwe") {
      data = await symmetricEncodeJWT(/* ... */);
    } else if (strategy === "jwt") {
      data = await signJWT(/* ... */);
    } else {
      // Compact strategy: base64url + HMAC
      data = base64Url.encode(/* ... */);
    }

    // Handle large cookies by chunking if needed (>4093 bytes)
    if (data.length > 4093) {
      const sessionStore = createSessionStore(/* ... */);
      const cookies = sessionStore.chunk(data, options);
      sessionStore.setCookies(cookies);
    } else {
      ctx.setCookie(ctx.context.authCookies.sessionData.name, data, options);
    }
  }
}
```

### How Session Token Gets Converted to Cookie

The `ctx.setSignedCookie` method (provided by `better-call` framework):
1. Takes the raw session token
2. Signs it with the application secret using HMAC
3. Sets the `Set-Cookie` header with all configured attributes

The cookie name follows this pattern:
- Default: `better-auth.session_token`
- With secure prefix (HTTPS): `__Secure-better-auth.session_token`

---

## 2. API Response Structure

### When `returnHeaders: true` Is Passed

From `/packages/better-auth/src/api/to-auth-endpoints.ts` (Lines 168-186):

```typescript
const response = context?.asResponse
  ? toResponse(result.response, {
      headers: result.headers,
      status: result.status,
    })
  : context?.returnHeaders
    ? context?.returnStatus
      ? {
          headers: result.headers,
          response: result.response,
          status: result.status,
        }
      : {
          headers: result.headers,
          response: result.response,
        }
    : context?.returnStatus
      ? { response: result.response, status: result.status }
      : result.response;
```

**Response Structure with `returnHeaders: true`:**
```typescript
{
  headers: Headers,   // Standard Headers object
  response: {         // The endpoint's response body
    token: string | null,
    user: User
  }
}
```

**Response Structure with `returnHeaders: true` AND `returnStatus: true`:**
```typescript
{
  headers: Headers,
  response: { token: string | null, user: User },
  status: number
}
```

### How Multiple `Set-Cookie` Headers Are Handled

From the test file (`to-auth-endpoints.test.ts`, Lines 388-420):

```typescript
it("set cookies from both hook", async () => {
  const result = await authEndpoints.cookies({
    asResponse: true,
  });
  expect(result.headers.get("set-cookie")).toContain("session=value");
  expect(result.headers.get("set-cookie")).toContain("data=2");
});
```

Multiple cookies are combined into a single `set-cookie` header string, comma-separated. The `Headers` object's `get("set-cookie")` returns all cookies as a concatenated string.

From `to-auth-endpoints.ts` (Lines 300-306), after hooks can append to set-cookie:
```typescript
if (key.toLowerCase() === "set-cookie") {
  context.context.responseHeaders.append(key, value);
} else {
  context.context.responseHeaders.set(key, value);
}
```

### Headers Returned by Default vs With `returnHeaders: true`

| Option | Return Value |
|--------|-------------|
| Default (no options) | `{ token, user }` - just the response body |
| `asResponse: true` | Full `Response` object with headers |
| `returnHeaders: true` | `{ headers, response }` |
| `returnHeaders: true, returnStatus: true` | `{ headers, response, status }` |

---

## 3. Cookie Configuration

### Default Cookie Attributes

From `/packages/better-auth/src/cookies/index.ts` (Lines 47-72):

```typescript
function createCookie(
  cookieName: string,
  overrideAttributes: Partial<CookieOptions> = {},
) {
  const prefix = options.advanced?.cookiePrefix || "better-auth";
  const name =
    options.advanced?.cookies?.[cookieName as "session_token"]?.name ||
    `${prefix}.${cookieName}`;

  const attributes =
    options.advanced?.cookies?.[cookieName as "session_token"]?.attributes;

  return {
    name: `${secureCookiePrefix}${name}`,
    attributes: {
      secure: !!secureCookiePrefix,        // Default: true if HTTPS
      sameSite: "lax",                      // Default: "lax"
      path: "/",                            // Default: "/"
      httpOnly: true,                       // Default: true
      ...(crossSubdomainEnabled ? { domain } : {}),
      ...options.advanced?.defaultCookieAttributes,  // User overrides
      ...overrideAttributes,               // Per-cookie overrides
      ...attributes,                       // Final overrides
    } as CookieOptions,
  };
}
```

**Default Cookie Attributes:**
| Attribute | Default Value |
|-----------|---------------|
| `secure` | `true` if `baseURL` starts with `https://` or in production |
| `sameSite` | `"lax"` |
| `path` | `"/"` |
| `httpOnly` | `true` |
| `domain` | Only set if `crossSubDomainCookies.enabled` is true |

### Secure Cookie Prefix

From `/packages/better-auth/src/cookies/cookie-utils.ts`:

```typescript
export const SECURE_COOKIE_PREFIX = "__Secure-";
export const HOST_COOKIE_PREFIX = "__Host-";
```

When `secure: true`:
- Cookie name becomes: `__Secure-better-auth.session_token`
- This prefix is a browser security feature that enforces HTTPS

### The `defaultCookieAttributes` Configuration Option

Users can override default cookie attributes globally:

```typescript
betterAuth({
  advanced: {
    defaultCookieAttributes: {
      sameSite: "strict",    // Override default "lax"
      partitioned: true,     // Enable CHIPS (partitioned cookies)
      secure: true,          // Force secure even on HTTP
    }
  }
})
```

### How `secure`, `sameSite`, `httpOnly`, `partitioned` Affect Behavior

| Attribute | Effect |
|-----------|--------|
| `secure: true` | Cookie only sent over HTTPS. Enables `__Secure-` prefix. |
| `sameSite: "lax"` | Cookie sent with top-level navigations and GET from third-party sites. Default. |
| `sameSite: "strict"` | Cookie only sent with same-site requests. More restrictive. |
| `sameSite: "none"` | Cookie sent with all requests. Requires `secure: true`. |
| `httpOnly: true` | Cookie inaccessible to JavaScript. Prevents XSS theft. Default. |
| `partitioned: true` | CHIPS - isolates cookie per top-level site. For cross-site embedding. |

---

## 4. Sign-Up Specific Flow

### Tracing `signUpEmail` from Request to Response

From `/packages/better-auth/src/api/routes/sign-up.ts`:

```
Request -> signUpEmail endpoint
    |
    v
1. Validate email/password (Lines 206-232)
    |
    v
2. Check if user exists (Lines 233-242)
    |
    v
3. Hash password (Line 251)
    |
    v
4. Create user in database (Lines 253-280)
    |
    v
5. Link credential account (Lines 287-292)
    |
    v
6. Send verification email if configured (Lines 293-320)
    |
    v
7. If autoSignIn disabled or email verification required:
   |-> Return { token: null, user } (Lines 322-332)
    |
    v
8. Create session (Lines 335-343)
    |
    v
9. Set session cookie (Lines 345-352)
   |-> setSessionCookie(ctx, { session, user }, rememberMe === false)
    |
    v
10. Return { token: session.token, user } (Lines 353-359)
```

### Where Session Creation Triggers Cookie Setting

From `sign-up.ts` (Lines 335-352):

```typescript
const session = await ctx.context.internalAdapter.createSession(
  createdUser.id,
  rememberMe === false,
);
if (!session) {
  throw APIError.from(
    "BAD_REQUEST",
    BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION,
  );
}
await setSessionCookie(
  ctx,
  {
    session,
    user: createdUser,
  },
  rememberMe === false,
);
return ctx.json({
  token: session.token,
  user: parseUserOutput(
    ctx.context.options,
    createdUser,
  ) as InferUser<O>,
});
```

### Where Response Headers Are Assembled

The response headers are assembled in `better-call` framework through the context methods:
1. `ctx.setCookie(name, value, options)` - Sets a plain cookie
2. `ctx.setSignedCookie(name, value, secret, options)` - Sets a signed cookie

These methods internally append to the `Set-Cookie` response header. The headers are then:
1. Passed through after-hooks (which can modify/append)
2. Assembled into the final response object based on `asResponse` or `returnHeaders` options

---

## 5. Potential Issues with Proxy Forwarding

### Issue 1: Multiple Set-Cookie Headers Concatenation

When Better Auth sets multiple cookies (session_token, session_data, dont_remember_token), they are stored in a single `Set-Cookie` header as comma-separated values:

```
Set-Cookie: better-auth.session_token=...; Path=/; HttpOnly; Secure, better-auth.session_data=...; Path=/; HttpOnly; Secure
```

**Proxy Problem:** Some proxies may:
- Split on commas incorrectly (cookies can contain commas in values)
- Not properly forward multiple Set-Cookie headers
- Truncate long header values

### Issue 2: Secure Cookie Prefix

When running behind a proxy that terminates TLS:
- Better Auth may detect HTTP (not HTTPS) and skip the `__Secure-` prefix
- Or it may incorrectly add the prefix when the proxy handles HTTPS

**Solution:** Always set `baseURL` with the correct protocol in production:
```typescript
betterAuth({
  baseURL: "https://your-domain.com/api/auth",
  advanced: {
    useSecureCookies: true  // Force secure cookies
  }
})
```

### Issue 3: Cookie Domain for Cross-Subdomain

If the proxy serves multiple subdomains:
```typescript
betterAuth({
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "your-domain.com"  // Without leading dot
    }
  }
})
```

### Issue 4: SameSite and Proxy Origins

If your proxy is on a different domain than your API:
- `sameSite: "lax"` may block cookies on cross-site POST requests
- May need `sameSite: "none"` with `secure: true`

### Issue 5: Chunked Cookies

From `/packages/better-auth/src/cookies/session-store.ts`:

When session data exceeds 4096 bytes, it's split into chunks:
- `better-auth.session_data.0`
- `better-auth.session_data.1`
- etc.

**Proxy Problem:** Some proxies may:
- Have per-cookie size limits
- Not properly forward all chunked cookies
- Drop cookies after a certain count

### Recommended Proxy Configuration

```typescript
// Better Auth configuration for proxy environments
betterAuth({
  baseURL: "https://your-public-domain.com/api/auth",
  advanced: {
    useSecureCookies: true,
    trustedProxyHeaders: true,  // Trust X-Forwarded-* headers
    defaultCookieAttributes: {
      sameSite: "lax",  // or "none" for cross-site
      secure: true,
    }
  }
})
```

### Code Snippet: Extracting Cookies from Response Headers

When forwarding cookies through a proxy, use this pattern:

```typescript
const { headers, response } = await auth.api.signUpEmail({
  returnHeaders: true,
  body: { email, password, name }
});

// Get all Set-Cookie values
const setCookieHeader = headers.get("set-cookie");

// Parse into individual cookies
import { parseSetCookieHeader } from "better-auth/cookies";
const cookieMap = parseSetCookieHeader(setCookieHeader);

// Forward each cookie individually
for (const [name, attrs] of cookieMap) {
  proxyResponse.headers.append("Set-Cookie",
    `${name}=${attrs.value}; Path=${attrs.path}; HttpOnly; Secure; SameSite=Lax`
  );
}
```

---

## Key Files Referenced

| File | Purpose |
|------|---------|
| `/packages/better-auth/src/cookies/index.ts` | Main cookie logic, setSessionCookie, setCookieCache |
| `/packages/better-auth/src/cookies/cookie-utils.ts` | Cookie parsing utilities, secure prefix constants |
| `/packages/better-auth/src/cookies/session-store.ts` | Cookie chunking logic |
| `/packages/better-auth/src/api/to-auth-endpoints.ts` | Response assembly, returnHeaders handling |
| `/packages/better-auth/src/api/routes/sign-up.ts` | Sign-up endpoint flow |
| `/packages/better-auth/src/api/routes/session.ts` | Session management endpoints |
| `/packages/core/src/api/index.ts` | Endpoint creation helpers |

---

## Summary

Better Auth's cookie handling is sophisticated with support for:
- Signed cookies (HMAC with secret)
- Cookie caching with multiple strategies (compact, JWT, JWE)
- Automatic chunking for large session data
- Secure cookie prefixes for HTTPS
- Cross-subdomain cookie support
- Configurable attributes per-cookie and globally

For proxy scenarios, the key considerations are:
1. Always use `returnHeaders: true` to access response headers
2. Parse the `set-cookie` header to extract individual cookies
3. Configure `baseURL` and `useSecureCookies` appropriately
4. Consider `trustedProxyHeaders` for X-Forwarded-* support
5. Handle multiple cookies being concatenated in a single header
