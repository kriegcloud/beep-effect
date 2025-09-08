import path from "node:path";
import * as Struct from "effect/Struct";
import type { NextConfig } from "next";

const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "script-src": ["'self'", "blob:"],
  "worker-src": ["'self'", "blob:"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "font-src": ["'self'"],
  "style-src-elem": ["'self'", "'unsafe-inline'"],
  "script-src-elem": ["'self'", "blob:", "https://vercel.live", "'unsafe-inline'"],
  "connect-src": ["'self'", "https://vercel.live/", "https://vercel.com"],
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
  {
    key: "Content-Security-Policy",
    value: genCSP()
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];

const nextConfig = {
  trailingSlash: true,

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
