# Effect Platform HTTP Module Findings

## Executive Summary

This document details the findings from investigating Effect Platform's HTTP modules for cookie handling, response transformations, and client configuration. The research reveals a well-designed, type-safe cookie management system that requires understanding of specific patterns for proper integration with external authentication libraries like Better Auth.

---

## 1. HttpServerResponse Cookie Handling

### 1.1 Response Interface

The `HttpServerResponse` interface maintains cookies as a first-class property separate from headers:

```typescript
// Source: packages/platform/src/HttpServerResponse.ts
export interface HttpServerResponse extends Effect.Effect<HttpServerResponse>, Inspectable, Respondable {
  readonly [TypeId]: TypeId
  readonly status: number
  readonly statusText?: string | undefined
  readonly headers: Headers.Headers
  readonly cookies: Cookies.Cookies  // <-- First-class cookie support
  readonly body: Body.HttpBody
}
```

**Key Insight**: Cookies are NOT stored in the `headers` property. They are maintained in a separate `cookies` property and only serialized to `Set-Cookie` headers when converting to a web Response.

### 1.2 Constructor Options

All response constructors (`json`, `text`, `empty`, etc.) accept cookies via options:

```typescript
export interface Options {
  readonly status?: number | undefined
  readonly statusText?: string | undefined
  readonly headers?: Headers.Input | undefined
  readonly cookies?: Cookies.Cookies | undefined  // <-- Pass cookies here
  readonly contentType?: string | undefined
  readonly contentLength?: number | undefined
}
```

**Pattern for creating responses with cookies**:
```typescript
import * as HttpServerResponse from "@effect/platform/HttpServerResponse"
import * as Cookies from "@effect/platform/Cookies"

// Create cookies from Set-Cookie headers
const cookies = Cookies.fromSetCookie(["session=abc123; HttpOnly; Path=/"])

// Include cookies when creating the response
const response = yield* HttpServerResponse.json(
  { success: true },
  { cookies }
)
```

### 1.3 HttpServerResponse.json Behavior

The `json` function creates a fresh response and does NOT preserve cookies from previous responses. If you have existing cookies (e.g., from Better Auth), you must explicitly pass them:

```typescript
// Source: packages/platform/src/internal/httpServerResponse.ts (lines 196-207)
export const json = (
  body: unknown,
  options?: ServerResponse.Options.WithContent | undefined
): Effect.Effect<ServerResponse.HttpServerResponse, Body.HttpBodyError> =>
  Effect.map(internalBody.json(body), (body) =>
    new ServerResponseImpl(
      options?.status ?? 200,
      options?.statusText,
      options?.headers ? Headers.fromInput(options.headers) : Headers.empty,
      options?.cookies ?? Cookies.empty,  // <-- Defaults to empty if not provided!
      body
    ))
```

**Critical**: If you don't pass cookies in options, they default to `Cookies.empty` and are lost.

### 1.4 HttpServerResponse.mergeCookies

This combinator merges additional cookies into an existing response:

```typescript
// Source: packages/platform/src/internal/httpServerResponse.ts (lines 454-474)
export const mergeCookies = dual<
  (cookies: Cookies.Cookies) => (self: HttpServerResponse) => HttpServerResponse,
  (self: HttpServerResponse, cookies: Cookies.Cookies) => HttpServerResponse
>(
  2,
  (self, cookies) =>
    new ServerResponseImpl(
      self.status,
      self.statusText,
      self.headers,
      Cookies.merge(self.cookies, cookies),  // <-- Merges cookies
      self.body
    )
)
```

**Usage Pattern**:
```typescript
import * as HttpServerResponse from "@effect/platform/HttpServerResponse"

const responseWithCookies = HttpServerResponse.mergeCookies(
  originalResponse,
  additionalCookies
)
```

### 1.5 Cookie Combinators Overview

| Combinator | Description | Effect Type |
|------------|-------------|-------------|
| `setCookie` | Add a single cookie (validates) | `Effect<Response, CookiesError>` |
| `unsafeSetCookie` | Add single cookie (throws on invalid) | `Response` |
| `setCookies` | Add multiple cookies (validates) | `Effect<Response, CookiesError>` |
| `unsafeSetCookies` | Add multiple cookies (throws) | `Response` |
| `mergeCookies` | Merge a Cookies object into response | `Response` |
| `replaceCookies` | Replace all cookies | `Response` |
| `updateCookies` | Transform cookies with a function | `Response` |
| `removeCookie` | Remove a cookie by name | `Response` |
| `expireCookie` | Set cookie to expire immediately | `Response` |

### 1.6 toWeb Conversion - Cookie Serialization

When converting `HttpServerResponse` to a web `Response`, cookies are serialized to `Set-Cookie` headers:

```typescript
// Source: packages/platform/src/internal/httpServerResponse.ts (lines 592-648)
export const toWeb = (response: ServerResponse.HttpServerResponse, options?: {...}): Response => {
  const headers = new globalThis.Headers(response.headers)

  // Cookies are serialized here!
  if (!Cookies.isEmpty(response.cookies)) {
    const toAdd = Cookies.toSetCookieHeaders(response.cookies)
    for (const header of toAdd) {
      headers.append("set-cookie", header)  // Multiple Set-Cookie headers
    }
  }
  // ... rest of response conversion
}
```

**Important**: Multiple cookies result in multiple `Set-Cookie` headers via `headers.append()`, not a single concatenated header.

---

## 2. HttpApp.fromWebHandler Behavior

### 2.1 Function Signature

```typescript
// Source: packages/platform/src/HttpApp.ts (lines 326-355)
export const fromWebHandler = (
  handler: (request: Request) => Promise<Response>
): Default<ServerError.HttpServerError> =>
  Effect.async((resume, signal) => {
    // ...
    handler(requestResult.right).then(
      (response) => resume(Effect.succeed(ServerResponse.fromWeb(response))),
      // error handling...
    )
  })
```

### 2.2 ServerResponse.fromWeb - Cookie Extraction

The critical function for preserving cookies from web handlers:

```typescript
// Source: packages/platform/src/HttpServerResponse.ts (lines 402-426)
export const fromWeb = (response: Response): HttpServerResponse => {
  const headers = new globalThis.Headers(response.headers)

  // Extract Set-Cookie headers
  const setCookieHeaders = headers.getSetCookie()
  headers.delete("set-cookie")  // Remove from headers

  let self = empty({
    status: response.status,
    statusText: response.statusText,
    headers: headers as any,
    cookies: Cookies.fromSetCookie(setCookieHeaders)  // <-- Cookies preserved!
  })

  if (response.body) {
    // ... body handling
  }
  return self
}
```

**Key Finding**: `fromWebHandler` DOES preserve `Set-Cookie` headers by:
1. Extracting them via `headers.getSetCookie()`
2. Removing them from the headers object
3. Converting to a `Cookies` object via `Cookies.fromSetCookie()`
4. Storing in the response's `cookies` property

### 2.3 Cookie Flow Through fromWebHandler

```
Better Auth Response (web Response)
    |
    v
response.headers.getSetCookie()  --> ["session=...", "csrf=..."]
    |
    v
Cookies.fromSetCookie()  --> Cookies { session: Cookie, csrf: Cookie }
    |
    v
HttpServerResponse.cookies  <-- Cookies stored here
    |
    v
toWeb() conversion
    |
    v
Multiple Set-Cookie headers in final Response
```

---

## 3. FetchHttpClient Configuration

### 3.1 RequestInit Context Tag

```typescript
// Source: packages/platform/src/FetchHttpClient.ts
export class RequestInit extends Context.Tag(internal.requestInitTagKey)<RequestInit, globalThis.RequestInit>() {}
```

This Context Tag allows providing custom `RequestInit` options to all fetch requests.

### 3.2 Credentials Configuration

To enable `credentials: 'include'` for cookie forwarding:

```typescript
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as Layer from "effect/Layer"

// Create a layer that provides credentials configuration
const FetchHttpClientWithCredentials = Layer.succeed(
  FetchHttpClient.RequestInit,
  { credentials: "include" as const }
)

// Combine with the FetchHttpClient layer
const HttpClientLive = Layer.merge(
  FetchHttpClient.layer,
  FetchHttpClientWithCredentials
)
```

### 3.3 Internal Implementation

```typescript
// Source: packages/platform/src/internal/fetchHttpClient.ts (lines 15-51)
const fetch: Client.HttpClient = client.make((request, url, signal, fiber) => {
  const context = fiber.getFiberRef(FiberRef.currentContext)
  const fetch: typeof globalThis.fetch = context.unsafeMap.get(fetchTagKey) ?? globalThis.fetch
  const options: RequestInit = context.unsafeMap.get(requestInitTagKey) ?? {}

  const send = (body: BodyInit | undefined) =>
    Effect.map(
      Effect.tryPromise({
        try: () =>
          fetch(url, {
            ...options,  // <-- RequestInit options spread here
            method: request.method,
            headers,
            body,
            // ...
          } as any),
        // ...
      }),
      (response) => internalResponse.fromWeb(request, response)
    )
  // ...
})
```

**Key Insight**: The `RequestInit` options are spread into every fetch call, so providing `credentials: 'include'` will apply to all HTTP client requests.

---

## 4. Cookies Module Deep Dive

### 4.1 Cookies.fromSetCookie

Creates a `Cookies` object from `Set-Cookie` header strings:

```typescript
// Source: packages/platform/src/Cookies.ts (lines 146-157)
export const fromSetCookie = (headers: Iterable<string> | string): Cookies => {
  const arrayHeaders = typeof headers === "string" ? [headers] : headers
  const cookies: Array<Cookie> = []
  for (const header of arrayHeaders) {
    const cookie = parseSetCookie(header.trim())
    if (Option.isSome(cookie)) {
      cookies.push(cookie.value)
    }
  }
  return fromIterable(cookies)
}
```

**Parsing capabilities**:
- Cookie name and value
- Domain, Path, Expires, Max-Age
- HttpOnly, Secure, Partitioned, SameSite
- Priority (Low, Medium, High)

### 4.2 Cookies.merge

Combines two Cookies objects (second takes precedence):

```typescript
// Source: packages/platform/src/Cookies.ts (lines 421-431)
export const merge: {
  (that: Cookies): (self: Cookies) => Cookies
  (self: Cookies, that: Cookies): Cookies
} = dual(2, (self: Cookies, that: Cookies) =>
  fromReadonlyRecord({
    ...self.cookies,
    ...that.cookies  // <-- 'that' takes precedence
  }))
```

### 4.3 Cookies.toSetCookieHeaders

Serializes a Cookies object back to `Set-Cookie` header strings:

```typescript
// Source: packages/platform/src/Cookies.ts (line 694)
export const toSetCookieHeaders = (self: Cookies): Array<string> =>
  Object.values(self.cookies).map(serializeCookie)
```

### 4.4 Cookie Interface

```typescript
export interface Cookie extends Inspectable.Inspectable {
  readonly [CookieTypeId]: CookieTypeId
  readonly name: string
  readonly value: string
  readonly valueEncoded: string
  readonly options?: {
    readonly domain?: string | undefined
    readonly expires?: Date | undefined
    readonly maxAge?: Duration.DurationInput | undefined
    readonly path?: string | undefined
    readonly priority?: "low" | "medium" | "high" | undefined
    readonly httpOnly?: boolean | undefined
    readonly secure?: boolean | undefined
    readonly partitioned?: boolean | undefined
    readonly sameSite?: "lax" | "strict" | "none" | undefined
  } | undefined
}
```

---

## 5. Common Pitfalls and Solutions

### 5.1 Pitfall: Cookies Lost When Creating New Responses

**Problem**: Creating a new response with `HttpServerResponse.json()` loses existing cookies.

```typescript
// BAD: Cookies from betterAuthResponse are lost
const webResponse = yield* HttpApp.fromWebHandler(betterAuthHandler)(request)
// webResponse.cookies has Better Auth cookies

const finalResponse = yield* HttpServerResponse.json({ ok: true })
// finalResponse.cookies is empty!
```

**Solution**: Always pass cookies when creating new responses or use combinators:

```typescript
// GOOD: Preserve cookies via options
const finalResponse = yield* HttpServerResponse.json(
  { ok: true },
  { cookies: webResponse.cookies }
)

// OR use mergeCookies combinator
const baseResponse = yield* HttpServerResponse.json({ ok: true })
const finalResponse = HttpServerResponse.mergeCookies(baseResponse, webResponse.cookies)
```

### 5.2 Pitfall: Missing Credentials in Client Requests

**Problem**: Client-side requests don't send cookies.

```typescript
// BAD: Cookies not sent with requests
const response = yield* HttpClient.get("/api/auth/session")
```

**Solution**: Configure FetchHttpClient with credentials:

```typescript
// GOOD: Provide RequestInit with credentials
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"

const FetchWithCredentials = Layer.succeed(
  FetchHttpClient.RequestInit,
  { credentials: "include" }
)

// Use in your runtime
Effect.provide(myEffect, FetchWithCredentials)
```

### 5.3 Pitfall: Assuming Set-Cookie Headers Are in response.headers

**Problem**: Looking for cookies in the wrong place.

```typescript
// BAD: Cookies are not in headers after fromWeb conversion
const response = ServerResponse.fromWeb(webResponse)
const cookieHeader = response.headers["set-cookie"]  // undefined!
```

**Solution**: Access the `cookies` property:

```typescript
// GOOD: Use the cookies property
const response = ServerResponse.fromWeb(webResponse)
const sessionCookie = Cookies.get(response.cookies, "session")  // Option<Cookie>
```

### 5.4 Pitfall: Single Set-Cookie Header for Multiple Cookies

**Problem**: Trying to set multiple cookies with a single header.

```typescript
// BAD: Only one cookie will be set
response.headers["set-cookie"] = "session=abc; other=xyz"  // Wrong!
```

**Solution**: Use the Cookies API or multiple append calls:

```typescript
// GOOD: Each cookie is a separate Set-Cookie header
const cookies = Cookies.fromIterable([
  Cookies.unsafeMakeCookie("session", "abc", { httpOnly: true }),
  Cookies.unsafeMakeCookie("csrf", "xyz", { sameSite: "strict" })
])

const response = yield* HttpServerResponse.json({ ok: true }, { cookies })
// Results in:
// Set-Cookie: session=abc; HttpOnly
// Set-Cookie: csrf=xyz; SameSite=Strict
```

---

## 6. Better Auth Integration Pattern

### 6.1 Recommended Handler Pattern

```typescript
import * as Effect from "effect/Effect"
import * as HttpApp from "@effect/platform/HttpApp"
import * as HttpServerResponse from "@effect/platform/HttpServerResponse"
import * as Cookies from "@effect/platform/Cookies"
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest"

const betterAuthHandler = (request: Request) => auth.handler(request)

const handleAuthRequest = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest

  // Call Better Auth through fromWebHandler
  const authResponse = yield* HttpApp.fromWebHandler(betterAuthHandler)

  // Cookies are automatically extracted and available
  // in authResponse.cookies

  // If you need to transform the response:
  if (needsTransformation) {
    const newBody = transformBody(authResponse.body)
    return yield* HttpServerResponse.json(newBody, {
      status: authResponse.status,
      headers: authResponse.headers,
      cookies: authResponse.cookies  // Preserve the cookies!
    })
  }

  // Or just return the response as-is
  return authResponse
})
```

### 6.2 Client Configuration for Cookie Forwarding

```typescript
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as Layer from "effect/Layer"

// Layer for client-side requests
export const AuthHttpClient = Layer.merge(
  FetchHttpClient.layer,
  Layer.succeed(FetchHttpClient.RequestInit, {
    credentials: "include"
  })
)

// Usage
const getSession = HttpClient.get("/api/auth/session").pipe(
  Effect.provide(AuthHttpClient)
)
```

---

## 7. Code Examples from Effect Source

### 7.1 Creating Response with Cookies (from internal/httpServerResponse.ts)

```typescript
// Pattern used in all response constructors
new ServerResponseImpl(
  options?.status ?? 200,
  options?.statusText,
  options?.headers ? Headers.fromInput(options.headers) : Headers.empty,
  options?.cookies ?? Cookies.empty,  // Cookies as separate field
  body
)
```

### 7.2 Extracting Cookies from Web Response (from HttpServerResponse.ts)

```typescript
export const fromWeb = (response: Response): HttpServerResponse => {
  const headers = new globalThis.Headers(response.headers)
  const setCookieHeaders = headers.getSetCookie()  // Use getSetCookie()
  headers.delete("set-cookie")

  return empty({
    status: response.status,
    statusText: response.statusText,
    headers: headers,
    cookies: Cookies.fromSetCookie(setCookieHeaders)
  })
}
```

### 7.3 Serializing Cookies to Web Response (from internal/httpServerResponse.ts)

```typescript
export const toWeb = (response: ServerResponse.HttpServerResponse): Response => {
  const headers = new globalThis.Headers(response.headers)

  if (!Cookies.isEmpty(response.cookies)) {
    const toAdd = Cookies.toSetCookieHeaders(response.cookies)
    for (const header of toAdd) {
      headers.append("set-cookie", header)  // Use append for multiple cookies
    }
  }

  return new Response(/* body */, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}
```

---

## 8. Summary

| Topic | Key Finding |
|-------|-------------|
| Cookie Storage | Cookies stored in `response.cookies`, not `response.headers` |
| fromWebHandler | Automatically extracts Set-Cookie headers to Cookies object |
| Response Creation | Must explicitly pass cookies via options |
| Cookie Merging | Use `mergeCookies` combinator to add cookies to existing response |
| Client Credentials | Provide `FetchHttpClient.RequestInit` with `credentials: "include"` |
| Multiple Cookies | Each cookie becomes a separate `Set-Cookie` header |
| Cookie Parsing | `Cookies.fromSetCookie` handles full Set-Cookie syntax |

The Effect Platform provides a comprehensive, type-safe cookie management system. The key to successful Better Auth integration is understanding that cookies flow through a separate channel from headers and must be explicitly preserved when transforming responses.
