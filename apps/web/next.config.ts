import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { NextConfig } from "next";

type BundleAnalyzerFactory = (
  options?:
    | {
        readonly enabled?: boolean | string | undefined;
        readonly openAnalyzer?: boolean | undefined;
      }
    | undefined
) => (config: NextConfig) => NextConfig;

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

const candidateTranspilePackages = [
  "@beep/types",
  "@beep/invariant",
  "@beep/utils",
  "@beep/schema",
  "@beep/constants",
  "@beep/errors",
  "@beep/shared-domain",
  "@beep/shared-tables",
  "@beep/core-env",
  "@beep/core-email",
  "@beep/core-db",
  "@beep/ui",
  "@beep/ui-core",
  "@beep/identity",
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
  "@beep/tasks-domain",
  "@beep/tasks-tables",
  "@beep/tasks-infra",
  "@beep/tasks-sdk",
  "@beep/tasks-ui",
  "@beep/comms-domain",
  "@beep/comms-tables",
  "@beep/comms-infra",
  "@beep/comms-sdk",
  "@beep/comms-ui",
  "@beep/party-domain",
  "@beep/party-tables",
  "@beep/party-infra",
  "@beep/party-sdk",
  "@beep/party-ui",
];

const resolvePackageJson = (pkgName: string) => {
  try {
    return require.resolve(`${pkgName}/package.json`, { paths: [__dirname] });
  } catch {
    return null;
  }
};

const shouldTranspile = (pkgName: string) => {
  const pkgJsonPath = resolvePackageJson(pkgName);
  if (pkgJsonPath === null) {
    return true;
  }

  try {
    const pkgJsonRaw = fs.readFileSync(pkgJsonPath, "utf8");
    const pkgJson = JSON.parse(pkgJsonRaw) as Record<string, unknown>;

    const checkExports = (value: unknown): boolean => {
      if (typeof value === "string") {
        return value.endsWith(".ts") || value.includes("/src/");
      }
      if (value !== null && typeof value === "object") {
        return Object.values(value).some(checkExports);
      }
      return false;
    };

    if ("exports" in pkgJson && pkgJson.exports !== null) {
      if (checkExports(pkgJson.exports)) {
        return true;
      }
    }

    if ("module" in pkgJson && typeof pkgJson.module === "string") {
      return pkgJson.module.endsWith(".ts") || pkgJson.module.includes("/src/");
    }

    if ("main" in pkgJson && typeof pkgJson.main === "string") {
      return pkgJson.main.endsWith(".ts") || pkgJson.main.includes("/src/");
    }

    return false;
  } catch {
    return true;
  }
};

const transpilePackages = candidateTranspilePackages.filter(shouldTranspile);

const optimizeImports = Array.from(
  new Set([
    "@iconify/react",
    "@mui/x-date-pickers",
    "@mui/lab",
    "@mui/icons-material",
    "@mui/material",
    "@mui/system",
    "@beep/ui",
    "@beep/ui-core",
    "react-phone-number-input",
    "@effect/platform",
    "@effect/opentelemetry",
  ])
);

const nextConfig = {
  reactCompiler: true,
  trailingSlash: false,
  transpilePackages,
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
  experimental: {
    mcpServer: true,
    optimizePackageImports: optimizeImports,
    turbopackFileSystemCacheForDev: true,
  },
} satisfies NextConfig;

const config = withBundleAnalyzer(nextConfig);
export default config;
