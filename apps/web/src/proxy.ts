import { getSessionCookie } from "better-auth/cookies";
import { Function as F, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/sign-in"] as const;
const PUBLIC_ROUTES = ["/sign-in"] as const;

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

const isAuthPath = (pathname: string) => Str.startsWith("/sign-in")(pathname);

const sanitizeCallbackPath = (raw: string | null | undefined): string => {
  if (!raw) {
    return DEFAULT_TARGET;
  }

  if (!isAbsolutePath(raw)) {
    return DEFAULT_TARGET;
  }

  const normalized = normalizePathname(raw);
  if (isAuthPath(normalized)) {
    return DEFAULT_TARGET;
  }

  return raw;
};

const getCallbackURL = (queryParams: URLSearchParams): string =>
  sanitizeCallbackPath(queryParams.get(CALLBACK_PARAM_NAME));

const matchesExact = (pathname: string, routes: ReadonlyArray<string>) => A.some(routes, (route) => route === pathname);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = matchesExact(pathname, AUTH_ROUTES);
  const isPublicRoute = matchesExact(pathname, PUBLIC_ROUTES);
  const isPrivateRoute = !isPublicRoute;

  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (sessionCookie && isAuthRoute) {
    const callbackParams = new URLSearchParams(request.nextUrl.search);
    const target = getCallbackURL(callbackParams);
    const redirectUrl = new URL(target, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (!sessionCookie && isPrivateRoute) {
    const originalTarget = `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`;
    const sanitized = sanitizeCallbackPath(originalTarget);
    const signInUrl = new URL("/sign-in", request.url);

    if (sanitized !== DEFAULT_TARGET) {
      signInUrl.searchParams.set(CALLBACK_PARAM_NAME, sanitized);
    }

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
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
