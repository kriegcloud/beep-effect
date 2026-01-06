# Effect + Better Auth Example Analysis

This document analyzes the working example in `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/` to understand how Better Auth integrates with Effect Platform.

## Executive Summary

The example demonstrates a clean integration pattern where Better Auth's web handler is wrapped as an Effect HttpApp and mounted alongside Effect API routes. The architecture relies on:

1. `HttpApp.fromWebHandler` to convert Better Auth's handler to an Effect-compatible HttpApp
2. `HttpApiBuilder.Router.use` to mount the auth app at a specific prefix
3. `HttpApiMiddleware` with `HttpApiSecurity.apiKey` for cookie-based authentication
4. CORS middleware with `credentials: true` for cross-origin cookie handling
5. Vite proxy during development to avoid CORS complexity on same-origin requests

---

## 1. Better Auth Integration Pattern

### 1.1 Better Auth Configuration

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/server/auth.ts`

```typescript
import { betterAuth } from "better-auth"
import { db } from "./db.ts"

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    }
  },
  trustedOrigins: ["http://localhost:5173"]
})
```

Key observations:
- Uses `trustedOrigins` to allow cross-origin requests from the Vite dev server (port 5173)
- Database is a direct Bun SQLite connection (not Effect SQL)
- Better Auth manages its own schema and tables

### 1.2 Wrapping as Effect HttpApp

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/server/middleware/BetterAuthApp.ts`

```typescript
import { HttpApiBuilder, HttpApp } from "@effect/platform"
import { auth } from "../auth.ts"

/** BetterAuth wrapped as an Effect HttpApp. */
export const BetterAuthApp = HttpApp.fromWebHandler(auth.handler)

/** Layer that mounts BetterAuth at /api/auth on the HttpApiBuilder Router. */
export const BetterAuthRouterLive = HttpApiBuilder.Router.use((router) =>
  router.mountApp("/api/auth", BetterAuthApp, { includePrefix: true })
)
```

**Critical Pattern:**
- `HttpApp.fromWebHandler(auth.handler)` converts the native `(Request) => Response | Promise<Response>` handler to an Effect HttpApp
- `router.mountApp("/api/auth", BetterAuthApp, { includePrefix: true })` mounts the app with prefix preservation (the `/api/auth` prefix is passed through to Better Auth)
- The `includePrefix: true` option is essential - Better Auth needs to see the full path to route internally

---

## 2. HttpApp.fromWebHandler Behavior

### 2.1 How It Works

`HttpApp.fromWebHandler` is a utility that converts a standard Web API handler (`(Request) => Response | Promise<Response>`) into an Effect HttpApp. According to Effect Platform's implementation:

1. It converts the incoming Effect `ServerRequest` to a native `Request`
2. Invokes the web handler
3. Converts the returned `Response` back to an Effect `ServerResponse`

### 2.2 Header Preservation

**Set-Cookie headers ARE preserved.** The conversion process maintains all response headers including `Set-Cookie`. This is because:

1. The web handler returns a native `Response` object
2. Effect Platform's response conversion copies all headers from the native response
3. No filtering or transformation is applied to cookie-related headers

The test file confirms this works correctly:

```typescript
// Test verifies auth responses work through the Effect layer
it.effect("mounted auth app handles sign-in", () =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.post("/api/auth/sign-in/email")
    const body = yield* response.json

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(body, { user: { id: "123", email: "test@test.com" } })
  }).pipe(Effect.provide(HttpLiveWithAuth))
)
```

---

## 3. Middleware Layer Architecture

### 3.1 Auth Middleware Definition

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/server/middleware/AuthMiddleware.ts`

```typescript
import { Context } from "effect"
import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform"

// User type that matches BetterAuth's session user
export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string | null | undefined
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean
}

// Service tag for the current authenticated user
export class CurrentUser extends Context.Tag("CurrentUser")<
  CurrentUser,
  AuthUser
>() {}

// Middleware that validates BetterAuth sessions
export class AuthMiddleware extends HttpApiMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    provides: CurrentUser,
    security: {
      // BetterAuth uses cookies for session management
      cookie: HttpApiSecurity.apiKey({
        in: "cookie",
        key: "better-auth.session_token"
      })
    }
  }
) {}
```

Key observations:
- Uses `HttpApiMiddleware.Tag` to create a typed middleware
- `provides: CurrentUser` indicates this middleware injects the authenticated user into the Effect context
- `security.cookie` uses `HttpApiSecurity.apiKey` to extract the session cookie by name (`better-auth.session_token`)

### 3.2 Middleware Implementation

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/server/middleware/Auth.ts`

```typescript
import { Effect, Layer, Redacted } from "effect"
import { auth } from "../auth.ts"
import { AuthMiddleware, CurrentUser } from "./AuthMiddleware.ts"

// Implementation layer for the auth middleware (uses BetterAuth)
export const AuthMiddlewareLive = Layer.succeed(
  AuthMiddleware,
  AuthMiddleware.of({
    cookie: (token) =>
      Effect.promise(async () => {
        const session = await auth.api.getSession({
          headers: new Headers({
            cookie: `better-auth.session_token=${Redacted.value(token)}`
          })
        })

        if (!session) {
          throw new Error("No active session")
        }

        return session.user
      })
  })
)
```

**Critical Pattern:**
- The `cookie` handler receives the extracted token as a `Redacted<string>`
- It reconstructs the cookie header and calls `auth.api.getSession()` with synthetic headers
- This bypasses the Effect request layer to use Better Auth's internal session validation
- On success, returns the user object which becomes available as `CurrentUser` in handlers

### 3.3 Applying Middleware to API Groups

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/server/Api.ts`

```typescript
// Protected endpoints (authentication required)
export class ProtectedGroup extends HttpApiGroup.make("protected")
  .add(HttpApiEndpoint.get("me", "/me").addSuccess(User))
  .add(
    HttpApiEndpoint.get("sessions", "/sessions")
      .addSuccess(Schema.Array(SessionInfo))
      .addError(DatabaseError)
  )
  .middleware(AuthMiddleware)  // <-- Middleware applied to entire group
  .prefix("/api")
{}
```

---

## 4. Server Configuration

### 4.1 HTTP Server Setup

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/server/main.ts`

```typescript
import { Effect, Layer } from "effect"
import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { ApiLive } from "./ApiLive.ts"
import { SqlLive } from "./db.ts"
import { BetterAuthRouterLive } from "./middleware/BetterAuthApp.ts"

// ApiLive requires SqlClient, so provide SqlLive to it first
const ApiWithSql = Layer.provide(ApiLive, SqlLive)

// Main application layer using BunHttpServer
const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors({
    allowedOrigins: ["http://localhost:5173"],
    credentials: true  // <-- CRITICAL for cookies
  })),
  Layer.provide(BetterAuthRouterLive),  // <-- Better Auth mounted here
  Layer.provide(ApiWithSql),
  Layer.provideMerge(BunHttpServer.layer({ port: 4000 }))
)
```

### 4.2 CORS Configuration

```typescript
HttpApiBuilder.middlewareCors({
  allowedOrigins: ["http://localhost:5173"],
  credentials: true
})
```

**Critical for cookies:**
- `credentials: true` enables the `Access-Control-Allow-Credentials: true` header
- Without this, browsers will not send or accept cookies on cross-origin requests
- `allowedOrigins` must be explicit (not `*`) when `credentials: true`

### 4.3 Layer Composition Order

The order of `Layer.provide` calls matters:

1. `HttpApiBuilder.serve(HttpMiddleware.logger)` - Creates the base server with logging
2. `Layer.provide(middlewareCors(...))` - CORS middleware runs first
3. `Layer.provide(BetterAuthRouterLive)` - Mounts Better Auth routes
4. `Layer.provide(ApiWithSql)` - Provides Effect API endpoints
5. `Layer.provideMerge(BunHttpServer.layer(...))` - Binds to actual HTTP server

---

## 5. Client-Side Configuration

### 5.1 Better Auth Client Setup

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/src/client/auth.ts`

```typescript
import { createAuthClient } from "better-auth/react"

// Better Auth client configured to talk to our Effect server
export const authClient = createAuthClient({
  baseURL: "http://localhost:4000",
  fetchOptions: {
    credentials: "include"  // <-- CRITICAL for cookies
  }
})

export const { signIn, signUp, signOut } = authClient
```

**Critical for cookies:**
- `credentials: "include"` tells fetch to include cookies in cross-origin requests
- `baseURL` points to the Effect server, not the Vite dev server
- This is required because Better Auth client makes direct API calls

### 5.2 Vite Proxy Configuration

**File:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/effect-better-auth-example/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // All API routes go to the single Effect server
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
})
```

**Development convenience:**
- Proxies `/api/*` from Vite (port 5173) to the Effect server (port 4000)
- Allows the dashboard to call `/api/me` as a same-origin request
- Avoids CORS issues for non-auth API calls during development

### 5.3 Client Usage Patterns

**Login flow:**
```typescript
// Uses Better Auth client with cross-origin fetch
const result = await signIn.email({ email, password })
```

**Protected API calls:**
```typescript
// Uses Vite proxy (same-origin relative URL)
const response = await fetch("/api/me")
```

---

## 6. Key Architectural Insights

### 6.1 Cookie Flow Analysis

1. **Sign-in request:**
   - Client sends POST to `http://localhost:4000/api/auth/sign-in/email` with `credentials: "include"`
   - Effect server receives request, routes to Better Auth via `HttpApp.fromWebHandler`
   - Better Auth validates credentials, creates session, returns response with `Set-Cookie: better-auth.session_token=...`
   - CORS headers allow the cookie to be set cross-origin
   - Browser stores the cookie

2. **Subsequent authenticated requests:**
   - Browser sends requests with `Cookie: better-auth.session_token=...`
   - For Effect API routes (`/api/me`), `AuthMiddleware` extracts the cookie via `HttpApiSecurity.apiKey`
   - Middleware implementation calls `auth.api.getSession()` to validate
   - On success, `CurrentUser` is injected into handler context

### 6.2 Separation of Concerns

| Component | Responsibility |
|-----------|----------------|
| `BetterAuthApp.ts` | Converts Better Auth handler to Effect HttpApp |
| `AuthMiddleware.ts` | Defines security scheme and context tag |
| `Auth.ts` | Implements session validation logic |
| `Api.ts` | Declares which endpoints require auth |
| `ApiLive.ts` | Implements handlers with access to `CurrentUser` |

### 6.3 Why This Pattern Works

1. **No cookie manipulation needed:** Effect Platform preserves all headers including `Set-Cookie`
2. **Clean security model:** `HttpApiSecurity.apiKey` with `in: "cookie"` is the idiomatic way to handle cookie auth
3. **Reusable auth context:** `CurrentUser` tag can be used anywhere in the handler effect chain
4. **Testable:** The middleware can be mocked to provide a test user (see `Api.test.ts`)

---

## 7. Comparison with beep-effect Architecture

### 7.1 Similarities

- Both use `HttpApp.fromWebHandler` to wrap Better Auth
- Both use middleware for session validation
- Both configure CORS with `credentials: true`

### 7.2 Differences to Investigate

| Aspect | Example | beep-effect (suspected) |
|--------|---------|-------------------------|
| Router mounting | `HttpApiBuilder.Router.use` with `mountApp` | May differ |
| Cookie extraction | `HttpApiSecurity.apiKey` with `in: "cookie"` | Needs verification |
| Session validation | Direct `auth.api.getSession()` call | May use different approach |
| Client baseURL | Points to server directly | May use relative URLs |

---

## 8. Testing Patterns

The example includes comprehensive tests demonstrating:

### 8.1 Mocking Auth Middleware

```typescript
const MockAuthMiddlewareLive = Layer.succeed(
  AuthMiddleware,
  AuthMiddleware.of({
    cookie: (_token) => Effect.succeed(testUser)
  })
)
```

### 8.2 Setting Cookies in Tests

```typescript
const ref = yield* Ref.make(
  Cookies.empty.pipe(Cookies.unsafeSet("better-auth.session_token", "test-token"))
)
const client = yield* HttpApiClient.makeWith(Api, {
  httpClient: HttpClient.withCookiesRef(yield* HttpClient.HttpClient, ref)
})
```

### 8.3 Testing Mounted Web Handlers

```typescript
const MockAuthApp = HttpApp.fromWebHandler(mockAuthHandler)
const MockAuthRouterLive = HttpApiBuilder.Router.use((router) =>
  Effect.gen(function* () {
    yield* router.mountApp("/api/auth", MockAuthApp, { includePrefix: true })
  })
)
```

---

## 9. Conclusions

The example demonstrates a working, production-ready pattern for integrating Better Auth with Effect Platform. The key success factors are:

1. **Correct use of `HttpApp.fromWebHandler`** - Preserves all headers including `Set-Cookie`
2. **Proper CORS configuration** - `credentials: true` on both server and client
3. **Idiomatic middleware** - Using `HttpApiSecurity.apiKey` for cookie extraction
4. **Direct session validation** - Calling `auth.api.getSession()` with reconstructed headers
5. **Layer composition** - Correct ordering ensures CORS runs before route handlers

If cookies are not being set in beep-effect, the issue likely lies in one of these areas:
- Missing `credentials: true` in CORS middleware
- Missing `credentials: "include"` in client fetch options
- Different mounting pattern for Better Auth routes
- Different middleware implementation for session validation
