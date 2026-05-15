/**
 * Request boundary headers for opip.law.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { type NextRequest, NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

const makeNonce = (): string => crypto.randomUUID();

const makeContentSecurityPolicy = (nonce: string): string => {
  const developmentScriptSources = isProduction ? "" : " 'unsafe-eval' 'unsafe-inline' http: https:";
  const developmentConnectSources = isProduction ? "" : " http://localhost:* https://*.localhost:* ws: wss:";
  const upgradeInsecureRequests = isProduction ? "; upgrade-insecure-requests" : "";

  return (
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScriptSources}`,
      `script-src-elem 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScriptSources}`,
      `style-src 'self' 'nonce-${nonce}'`,
      `style-src-elem 'self' 'nonce-${nonce}'`,
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
    ].join("; ") + upgradeInsecureRequests
  );
};

/**
 * Adds a per-request CSP nonce for the App Router render pass.
 *
 * @category constructors
 * @since 0.0.0
 */
export function proxy(request: NextRequest): NextResponse {
  const nonce = makeNonce();
  const contentSecurityPolicy = makeContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

/**
 * Runs the nonce proxy for rendered pages while skipping API, image, and static
 * asset requests that do not need a page-render CSP nonce.
 *
 * @category configuration
 * @since 0.0.0
 */
export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-[^/]+\\.js|opip/.*\\.(?:png|jpg|jpeg|svg|mp4|webp|ico)).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
