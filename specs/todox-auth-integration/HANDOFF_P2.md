# todox-auth-integration P2 Handoff

> Continuation prompt for Phase 2 implementation: Adding proxy.ts middleware for route protection.

---

## Phase 1 Completed

All Phase 1 tasks are complete:

- **Guard Providers** (`apps/todox/src/providers/`):
  - `GuardErrorBoundary.tsx`
  - `GuardErrorFallback.tsx`
  - `AuthGuard.tsx`
  - `GuestGuard.tsx`

- **Auth Routes** (`apps/todox/src/app/auth/`):
  - `/auth/sign-in`
  - `/auth/sign-up`
  - `/auth/reset-password`
  - `/auth/request-reset-password`

- **Main Page**: Wrapped with `AuthGuard`, uses session data

---

## Phase 2 Task: Add proxy.ts Middleware

### Context

`apps/todox` needs middleware route protection similar to `apps/web/src/proxy.ts`, but with **todox-specific routes** instead of the `paths` value object.

### Key Differences from apps/web

1. **Do NOT use `paths` from `@beep/shared-domain`** - todox has different route structure
2. **Use string literals** for route definitions
3. **Todox routes are simpler** - no dashboard, organizations, file-manager, admin, etc.

### File to Create

**`apps/todox/src/proxy.ts`**

```typescript
import { CSP_HEADER } from "@beep/constants";
import { AuthCallback } from "@beep/iam-client/constants";
import { getSessionCookie } from "better-auth/cookies";
import * as A from "effect/Array";
import * as Str from "effect/String";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Todox-specific routes (NOT using paths value object)
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"] as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/demo",
  // Add other public routes as needed
] as const;

// All auth pages are public (but redirect if already logged in)
const PUBLIC_PREFIXES = ["/auth"] as const;

// Protected routes that require authentication
const PRIVATE_PREFIXES = [
  "/",  // Main app at root is protected
] as const;

const withCsp = (response: NextResponse) => {
  response.headers.set("Content-Security-Policy", CSP_HEADER);
  return response;
};

const matchesExact = (pathname: string, routes: ReadonlyArray<string>) =>
  A.some(routes, (route) => route === pathname);

const matchesPrefix = (pathname: string, prefixes: ReadonlyArray<string>) =>
  A.some(prefixes, (prefix) => Str.startsWith(prefix)(pathname));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", CSP_HEADER);
  requestHeaders.set("x-url", request.url);

  const isAuthRoute = matchesExact(pathname, AUTH_ROUTES);
  const isPrivateRoute = pathname === "/" || matchesPrefix(pathname, PRIVATE_PREFIXES.filter(p => p !== "/"));
  const isDeclaredPublicRoute = matchesExact(pathname, PUBLIC_ROUTES) || matchesPrefix(pathname, PUBLIC_PREFIXES);

  // Explicit check: root "/" is private, auth routes are public
  const isPublicRoute = isDeclaredPublicRoute && !pathname.startsWith("/") || pathname !== "/" && isDeclaredPublicRoute;

  // Allow public routes (except auth routes which need special handling)
  if (isDeclaredPublicRoute && !isAuthRoute) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    return withCsp(response);
  }

  const sessionCookie = getSessionCookie(request);

  // Redirect authenticated users away from auth routes
  if (sessionCookie && isAuthRoute) {
    const callbackParams = new URLSearchParams(request.nextUrl.search);
    const target = AuthCallback.getURL(callbackParams);
    const redirectUrl = new URL(target, request.url);
    return withCsp(NextResponse.redirect(redirectUrl));
  }

  // Redirect unauthenticated users to sign-in for private routes
  if (!sessionCookie && (pathname === "/" || isPrivateRoute)) {
    const originalTarget = `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    const sanitized = AuthCallback.sanitizePath(originalTarget);
    const signInUrl = new URL("/auth/sign-in", request.url);
    if (sanitized !== AuthCallback.defaultTarget) {
      signInUrl.searchParams.set(AuthCallback.paramName, sanitized);
    }
    return withCsp(NextResponse.redirect(signInUrl));
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return withCsp(response);
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
```

### File to Create/Update

**`apps/todox/src/middleware.ts`**

```typescript
export { proxy as middleware, config } from "./proxy";
```

---

## Implementation Notes

### Route Protection Strategy for Todox

| Route Pattern | Protection | Behavior |
|--------------|------------|----------|
| `/` | Private | Redirects to `/auth/sign-in` if not authenticated |
| `/auth/*` | Public (Guest) | Redirects to `/` if already authenticated |
| `/demo` | Public | Always accessible |
| `/api/*` | Excluded | Handled by matcher exclusion |

### Key Considerations

1. **Root path (`/`)** is the main todox app and should be protected
2. **Auth routes** should redirect authenticated users back to app
3. **CSP headers** applied to all responses
4. **Callback URL preservation** - maintains `callbackURL` param for post-login redirect

### Testing

After implementation:

```bash
# Type check
bun run check --filter @beep/todox

# Build (includes middleware compilation)
bun run build --filter @beep/todox
```

Manual testing:
1. Visit `/` while logged out → should redirect to `/auth/sign-in`
2. Visit `/auth/sign-in` while logged in → should redirect to `/`
3. Visit `/demo` → should always be accessible

---

## Critical Rules

1. **Use string literals for routes** - Do NOT import `paths` from `@beep/shared-domain`
2. **Effect utilities required** - Use `A.some`, `Str.startsWith` from Effect
3. **No native methods** - Avoid `array.some()`, `string.startsWith()`
4. **CSP header required** - Import `CSP_HEADER` from `@beep/constants`

---

## Success Criteria

1. Middleware compiles without errors
2. Unauthenticated users redirected to sign-in for protected routes
3. Authenticated users redirected away from auth routes
4. CSP headers applied to all responses
5. Callback URL preserved in redirect flow
