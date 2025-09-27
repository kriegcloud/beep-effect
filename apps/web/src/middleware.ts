import { CSPHeader } from "@beep/constants/Csp";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
// import { paths } from "@beep/constants";

// const authPaths = [
//   paths.auth.signIn,
//   paths.auth.signUp,
// ] as const;

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(uuid()).toString("base64");
  // Replace newline characters and spaces

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const cspHeader = CSPHeader(nonce);
  requestHeaders.set(cspHeader.key, cspHeader.value);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(cspHeader.key, cspHeader.value);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
