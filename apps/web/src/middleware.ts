import * as Struct from "effect/Struct";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const CSP_DIRECTIVES = {
    "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "script-src": [
    "'unsafe-eval'",
    "'self'",
    "blob:",
  ],
  "worker-src": ["'self'", "blob:"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": [
    "'self'",
  ],
  "style-src-elem": [
    "'self'",
    "'unsafe-inline'",
  ],
  "script-src-elem": [
    "'self'",
    "blob:",
    "https://vercel.live",
    "'unsafe-inline'",
  ],
  "connect-src": [
    "'self'",
    "https://vercel.live/",
    "https://vercel.com",
  ],
  "media-src": ["'self'", "data:"],
  "frame-ancestors": ["'self'", "https://vercel.live", "https://vercel.com"],
  "img-src": [
    "'self'",
    "https://www.google-analytics.com",
    "data:",
  ],
  "frame-src": [
    "'self'",
    "https://vercel.live",
    "https://vercel.com",
  ],
  } as const;

  const genCSP = () => {
    let csp = "";
    for (const [k, v] of Struct.entries(CSP_DIRECTIVES)) {
      csp += `${k} ${v.join(" ")}; `;
    }
    return csp;
  };

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = genCSP()
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

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
      source: "/form-demo",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
