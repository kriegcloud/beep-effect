// import * as Struct from "effect/Struct";
import type { NextConfig } from "next";

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

// const CSP_DIRECTIVES = {
//   "default-src": ["'self'"],
//   "base-uri": ["'self'"],
//   "form-action": ["'self'"],
//   "script-src": ["'self'", "'strict-dynamic'", "blob:"],
//   "worker-src": ["'self'", "blob:"],
//   "style-src": ["'self'", "'unsafe-hashes'"],
//   "font-src": ["'self'"],
//   "style-src-elem": ["'self'", "'unsafe-inline'"],
//   "manifest-src": ["'self'"],
//   "script-src-elem": ["'self'", "blob:", "https://vercel.live"],
//   "style-src-attr": ["'self'", "'unsafe-hashes'"],
//   "connect-src": ["'self'", process.env.NEXT_PUBLIC_STATIC_URL, "https://vercel.live/", "https://vercel.com"],
//   "media-src": ["'self'", "data:"],
//   "frame-ancestors": ["'self'", "https://vercel.live", "https://vercel.com"],
//   "img-src": ["'self'", process.env.NEXT_PUBLIC_STATIC_URL, "data:", "blob:"],
//   "frame-src": ["'self'", "https://vercel.live", "https://vercel.com"],
// } as const;
//
// const genCSP = () => {
//   let csp = "";
//   for (const [k, v] of Struct.entries(CSP_DIRECTIVES)) {
//     csp += `${k} ${v.join(" ")}; `;
//   }
//   return `${csp} upgrade-insecure-requests;`;
// };

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
  // this may be needed to work locally
  // {
  //   key: "Access-Control-Allow-Origin",
  //   value: "http://localhost:3000",
  // }
];

const nextConfig = {
  trailingSlash: true,
  ...(process.env.NEXT_PUBLIC_ENV === "dev" ? {} : { experimental: { sri: { algorithm: "sha256" } } }),

  images: {
    remotePatterns: [
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
    ],
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
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.experiments = {
      ...config.experiments,
      layers: true,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    return config;
  },
} satisfies NextConfig;

export default nextConfig;
