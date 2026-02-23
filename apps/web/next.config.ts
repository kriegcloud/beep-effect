import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@beep/schema"],
  logging: {
    incomingRequests: true,
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    browserToTerminal: "warn",
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    webVitalsAttribution: ["CLS", "LCP", "FCP", "FID", "INP", "TTFB"],
  },
  turbopack: {
    root: path.join(dirname, "../.."),
  },
};

export default nextConfig;
