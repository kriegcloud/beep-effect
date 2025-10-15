import { serverEnv } from "@beep/core-env/server";
import { AuthCallback } from "@beep/iam-sdk/constants";
import { paths } from "@beep/shared-domain";
import { getCookieCache } from "better-auth/cookies";
import * as A from "effect/Array";
import * as Str from "effect/String";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = [paths.auth.signIn, paths.auth.signUp] as const;

const PUBLIC_ROUTES = [
  paths.root,
  paths.comingSoon,
  paths.maintenance,
  paths.pricing,
  paths.payment,
  paths.about,
  paths.contact,
  paths.faqs,
  paths.terms,
  paths.privacy,
] as const;

const PUBLIC_PREFIXES = ["/auth"] as const;

const PRIVATE_PREFIXES = [
  paths.dashboard.root,
  paths.settings.root,
  paths.organizations.root,
  "/account",
  paths.fileManager.root,
  paths.admin.root,
] as const;

const withCsp = (response: NextResponse, csp: string) => {
  response.headers.set("Content-Security-Policy", csp);
  return response;
};

const matchesExact = (pathname: string, routes: ReadonlyArray<string>) => A.some(routes, (route) => route === pathname);

const matchesPrefix = (pathname: string, prefixes: ReadonlyArray<string>) =>
  A.some(prefixes, (prefix) => Str.startsWith(prefix)(pathname));

export async function proxy(request: NextRequest) {
  const csp = serverEnv.security.csp;
  const { pathname } = request.nextUrl;

  const isAuthRoute = matchesExact(pathname, AUTH_ROUTES);
  const isPrivateRoute = matchesPrefix(pathname, PRIVATE_PREFIXES);
  const isDeclaredPublicRoute = matchesExact(pathname, PUBLIC_ROUTES) || matchesPrefix(pathname, PUBLIC_PREFIXES);
  const isImplicitPublicRoute = !isAuthRoute && !isPrivateRoute;
  const isPublicRoute = isDeclaredPublicRoute || isImplicitPublicRoute;

  if (isPublicRoute && !isAuthRoute) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return withCsp(response, csp);
  }

  const session = await getCookieCache(request);

  if (session && isAuthRoute) {
    const callbackParams = new URLSearchParams(request.nextUrl.search);
    const target = AuthCallback.getURL(callbackParams);
    const redirectUrl = new URL(target, request.url);
    return withCsp(NextResponse.redirect(redirectUrl), csp);
  }

  if (!session && isPrivateRoute) {
    const originalTarget = `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    const sanitized = AuthCallback.sanitizePath(originalTarget);
    const signInUrl = new URL(paths.auth.signIn, request.url);
    if (sanitized !== AuthCallback.defaultTarget) {
      signInUrl.searchParams.set(AuthCallback.paramName, sanitized);
    }
    return withCsp(NextResponse.redirect(signInUrl), csp);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return withCsp(response, csp);
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
