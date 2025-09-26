import path from "node:path";
import * as Struct from "effect/Struct";
import type { NextConfig } from "next";
// "development" | "test" | "production
const isDev = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENV === "dev";
const otlpOrigin = process.env.NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL
  ? new URL(process.env.NEXT_PUBLIC_OTLP_TRACE_EXPORTER_URL).origin
  : undefined;
const CONNECT_SRC = [
  "'self'",
  "https://vercel.live/",
  "https://vercel.com",
  // Allow WebSocket connections in development (Next HMR, Effect DevTools, etc.)
  ...(isDev ? ["ws:", "wss:", "http://localhost:*", "http://127.0.0.1:*"] : []),
  // Allow OTLP exporter endpoint if configured
  ...(otlpOrigin ? [otlpOrigin] : []),
];

const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "script-src": ["'self'", "blob:", "https://cdn.jsdelivr.net"],
  "worker-src": ["'self'", "blob:"],
  "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  "font-src": ["'self'", "https://fonts.scalar.com"],
  "style-src-elem": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  "script-src-elem": ["'self'", "blob:", "https://vercel.live", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
  "connect-src": CONNECT_SRC,
  "media-src": ["'self'", "data:"],
  "frame-ancestors": ["'self'", "https://vercel.live", "https://vercel.com"],
  "img-src": ["'self'", "https://www.google-analytics.com", "data:", "blob:"],
  "frame-src": ["'self'", "https://vercel.live", "https://vercel.com"],
};

const genCSP = () => {
  let csp = "";
  for (const [key, value] of Struct.entries(CSP_DIRECTIVES)) {
    csp += `${key} ${value.join(" ")}; `;
  }
  return csp;
};

const securityHeaders = [
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "require-corp",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
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
  ...(process.env.NODE_ENV === "production" ? [{
    key: "Content-Security-Policy",
    value: genCSP()
      .replace(/\s{2,}/g, " ")
      .trim(),
  }] as const : [])
];

const nextConfig = {
  trailingSlash: true,
  // transpilePackages: [
  //   "@beep/types",
  //   "@beep/invariant",
  //   "@beep/utils",
  //   "@beep/schema",
  //   "@beep/constants",
  //   "@beep/errors",
  //   "@beep/rules",
  //   "@beep/logos",
  //   "@beep/rete",
  //   "@beep/shared-domain",
  //   "@beep/shared-tables",
  //   "@beep/core-env",
  //   "@beep/core-email",
  //   "@beep/core-db",
  //   "@beep/ui",
  //   "@beep/iam-domain",
  //   "@beep/iam-tables",
  //   "@beep/iam-infra",
  //   "@beep/iam-sdk",
  //   "@beep/iam-ui",
  //   "@beep/files-domain",
  //   "@beep/files-tables",
  //   "@beep/files-infra",
  //   "@beep/files-sdk",
  //   "@beep/files-ui",
  // ],
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
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
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
