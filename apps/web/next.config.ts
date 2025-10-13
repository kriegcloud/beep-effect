import { createRequire } from "node:module";
import path from "node:path";
import type { NextConfig } from "next";

type BundleAnalyzerFactory = (options?: {
  enabled?: boolean | string;
  openAnalyzer?: boolean;
}) => (config: NextConfig) => NextConfig;

type WithBundleAnalyzerConfig = Parameters<BundleAnalyzerFactory>[0];

const require = createRequire(import.meta.url);

const withBundleAnalyzer = (() => {
  if (process.env.ENV !== "dev") {
    return (config: NextConfig) => config;
  }

  try {
    const plugin = require("@next/bundle-analyzer") as BundleAnalyzerFactory;
    return plugin({
      enabled: true,
      openAnalyzer: true,
    } satisfies WithBundleAnalyzerConfig);
  } catch (error) {
    console.warn("Skipping @next/bundle-analyzer because it is not installed in this environment.", error);
    return (config: NextConfig) => config;
  }
})();

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
    key: "Cross-Origin-Resource-Policy",
    value: "cross-origin",
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
];

const nextConfig = {
  trailingSlash: false,
  transpilePackages: [
    "@beep/types",
    "@beep/invariant",
    "@beep/utils",
    "@beep/schema",
    "@beep/constants",
    "@beep/errors",
    "@beep/rules",
    "@beep/logos",
    "@beep/rete",
    "@beep/shared-domain",
    "@beep/shared-tables",
    "@beep/core-env",
    "@beep/core-email",
    "@beep/core-db",
    "@beep/ui",
    "@beep/ui-core",
    "@beep/iam-domain",
    "@beep/iam-tables",
    "@beep/iam-infra",
    "@beep/iam-sdk",
    "@beep/iam-ui",
    "@beep/files-domain",
    "@beep/files-tables",
    "@beep/files-infra",
    "@beep/files-sdk",
    "@beep/files-ui",
  ],

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
        hostname: process.env.NEXT_PUBLIC_STATIC_URL?.replace("https://", "") ?? "",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/metrics/:path*",
        destination: "http://localhost:4318/v1/metrics/:path*", // Proxy to your metrics server
      },
    ];
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
  webpack(config, { isServer }) {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 1000,
    };
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    config.experiments = {
      ...config.experiments,
      layers: true,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    return config;
  },
  experimental: {
    optimizePackageImports: ["@iconify/react", "lodash", "@mui/x-date-pickers", "@mui/lab"],
  },
} satisfies NextConfig;

const config = withBundleAnalyzer(nextConfig);
export default config;
