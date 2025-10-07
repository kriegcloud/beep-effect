import { CSPHeader } from "@beep/constants/Csp";
<<<<<<< HEAD
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
=======
// import { AuthService } from "@beep/iam-infra";
// import { serverRuntime } from "@beep/runtime-server";
// import * as Data from "effect/Data";
// import * as Effect from "effect/Effect";
// import * as O from "effect/Option";
// import * as P from "effect/Predicate";
// import * as Str from "effect/String";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

// const middlewareProgram = Effect.fn("middlewareProgram")(function* () {
//   const { api } = yield* AuthService;
// });

>>>>>>> auth-type-perf
// import { paths } from "@beep/shared-domain";

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
