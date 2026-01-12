import { CSP_HEADER } from "@beep/constants";
import { getSessionCookie } from "better-auth/cookies";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ============================================================================
// Todox-specific route configuration (NOT using paths value object)
// ============================================================================

const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"] as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/demo"] as const;

// All auth pages are public (but redirect if already logged in)
const PUBLIC_PREFIXES = ["/auth"] as const;

// ============================================================================
// Todox-specific callback URL handling
// ============================================================================

const CALLBACK_PARAM_NAME = "callbackURL";
const DEFAULT_TARGET = "/";

const stripFragment = (value: string) =>
  F.pipe(
    Str.split("#")(value),
    A.head,
    O.getOrElse(() => value)
  );

const stripQuery = (value: string) =>
  F.pipe(
    Str.split("?")(value),
    A.head,
    O.getOrElse(() => value)
  );

const normalizePathname = (value: string) => F.pipe(value, stripFragment, stripQuery);

const isAbsolutePath = (value: string) => Str.startsWith("/")(value) && !Str.startsWith("//")(value);

const isAuthPath = (pathname: string) => Str.startsWith("/auth")(pathname);

/**
 * Sanitize callback path for todox routes.
 * For todox, any absolute path that's not an auth path is valid.
 */
const sanitizeCallbackPath = (raw: string | null | undefined): string => {
  if (!raw) {
    return DEFAULT_TARGET;
  }

  if (!isAbsolutePath(raw)) {
    return DEFAULT_TARGET;
  }

  const normalized = normalizePathname(raw);

  // Don't allow redirecting back to auth routes
  if (isAuthPath(normalized)) {
    return DEFAULT_TARGET;
  }

  return raw;
};

const getCallbackURL = (queryParams: URLSearchParams): string =>
  sanitizeCallbackPath(queryParams.get(CALLBACK_PARAM_NAME));

// ============================================================================
// Route matching utilities
// ============================================================================

const withCsp = (response: NextResponse) => {
  response.headers.set("Content-Security-Policy", CSP_HEADER);
  return response;
};

const matchesExact = (pathname: string, routes: ReadonlyArray<string>) => A.some(routes, (route) => route === pathname);

const matchesPrefix = (pathname: string, prefixes: ReadonlyArray<string>) =>
  A.some(prefixes, (prefix) => Str.startsWith(prefix)(pathname));

// ============================================================================
// Middleware
// ============================================================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", CSP_HEADER);
  requestHeaders.set("x-url", request.url);

  const isAuthRoute = matchesExact(pathname, AUTH_ROUTES);
  const isDeclaredPublicRoute = matchesExact(pathname, PUBLIC_ROUTES) || matchesPrefix(pathname, PUBLIC_PREFIXES);

  // For todox: "/" is the main app (private), everything under /auth is public
  // Any route not explicitly public is considered private
  const isPrivateRoute = pathname === "/" || !isDeclaredPublicRoute;

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
    const target = getCallbackURL(callbackParams);
    const redirectUrl = new URL(target, request.url);
    return withCsp(NextResponse.redirect(redirectUrl));
  }

  // Redirect unauthenticated users to sign-in for private routes
  if (!sessionCookie && isPrivateRoute) {
    const originalTarget = `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    const sanitized = sanitizeCallbackPath(originalTarget);
    const signInUrl = new URL("/auth/sign-in", request.url);
    if (sanitized !== DEFAULT_TARGET) {
      signInUrl.searchParams.set(CALLBACK_PARAM_NAME, sanitized);
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
