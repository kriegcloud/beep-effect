import * as Struct from "effect/Struct";
import type { NextConfig } from "next";
import path from "node:path";
/**
 * Static Exports in Next.js
 *
 * 1. Set `isStaticExport = true` in `next.config.{mjs|ts}`.
 * 2. This allows `generateStaticParams()` to pre-render dynamic routes at build time.
 *
 * For more details, see:
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 *
 * NOTE: Remove all "generateStaticParams()" functions if not using static exports.
 */
const staticHost = process.env.NEXT_PUBLIC_STATIC_URL?.replace("https://", "");
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "script-src": [
    "'self'",
    "https://www.google.com",
    "https://maps.googleapis.com",
    "https://www.gstatic.com",
    "https://api.iconify.design",
    "https://api.unisvg.com",
    "blob:",
  ],
  "worker-src": ["'self'", "blob:"],
  "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
  "font-src": ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
  "style-src-elem": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
  "script-src-elem": [
    "'self'",
    "blob:",
    "https://www.google.com",
    "https://www.gstatic.com",
    "https://vercel.live",
    "'unsafe-inline'",
  ],
  "connect-src": [
    "'self'",
    "https://api.unisvg.com",
    "https://api.iconify.design",
    process.env.NEXT_PUBLIC_STATIC_URL,
    "https://api.simplesvg.com",
    "https://vercel.live/",
    "https://vercel.com",
  ],
  "media-src": ["'self'", "data:"],
  "frame-ancestors": ["'self'", "https://vercel.live", "https://vercel.com"],
  "img-src": ["'self'", "https://www.google-analytics.com", process.env.NEXT_PUBLIC_STATIC_URL, "data:"],
  "frame-src": ["'self'", "https://google-analytics.com", "https://vercel.live", "https://vercel.com"],
} as const;

const genCSP = () => {
  let csp = "";
  for (const [k, v] of Struct.entries(CSP_DIRECTIVES)) {
    csp += `${k} ${v.join(" ")}; `;
  }
  return csp;
};

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "same-origin",
  },
  {
    key: "Content-Security-Policy",
    value: genCSP()
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
  // this may be needed to work locally
  // {
  //   key: "Access-Control-Allow-Origin",
  //   value: "http://localhost:3000",
  // }
];

const nextConfig = {
  transpilePackages: [
    "@beep/invariant",
    "@beep/schema",
    "@beep/types",
    "@beep/ui",
    "@beep/utils",
    "@beep/logos",
    "@beep/rete"
  ],
  images: {
    remotePatterns: staticHost ? [
      {
        protocol: "https",
        hostname: `${process.env.NEXT_PUBLIC_STATIC_URL}`.replace("https://", ""),
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_STATIC_URL!.replace("https://", ""),
        port: "",
        pathname: "/**",
      },
    ] : [],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/(.*?)",
        headers: securityHeaders,
      },
    ];
  },

  outputFileTracingRoot: path.join(__dirname, "../../"),
} satisfies NextConfig;

export default nextConfig;
