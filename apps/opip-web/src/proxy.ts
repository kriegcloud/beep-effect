/**
 * Request proxy for dynamic OPIP response security.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV !== "production";
const developmentScriptSources = isDevelopment ? " 'unsafe-eval' https://unpkg.com" : "";
const developmentConnectSources = isDevelopment ? " http://localhost:* https://*.localhost:* ws: wss:" : "";

const buildCspHeader = (nonce: string): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${developmentScriptSources}`,
    `script-src-elem 'self' 'nonce-${nonce}'${developmentScriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    "style-src-elem 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self'",
    `connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-insights.com https://api.sanity.io https://*.api.sanity.io https://*.apicdn.sanity.io https://api.hsforms.com https://forms.hsforms.com https://api.hubapi.com${developmentConnectSources}`,
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

const withCsp = (cspHeader: string) => (response: NextResponse) => {
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
};

/**
 * Adds a per-request CSP nonce to OPIP document responses.
 *
 * @example
 * ```ts
 * import type { NextRequest, NextResponse } from "next/server"
 * import { proxy } from "@beep/opip-web/proxy"
 *
 * const handler: (request: NextRequest) => NextResponse = proxy
 * console.log(typeof handler)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function proxy(request: NextRequest): NextResponse {
  const nonce = btoa(crypto.randomUUID());
  const cspHeader = buildCspHeader(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("Content-Security-Policy", cspHeader);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-url", request.url);

  return withCsp(cspHeader)(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
}

/**
 * Route matcher for the OPIP CSP proxy.
 *
 * @example
 * ```ts
 * import { config } from "@beep/opip-web/proxy"
 *
 * console.log(config.matcher[0]?.source)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*|opip/.*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
