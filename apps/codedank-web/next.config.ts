import { fileURLToPath } from "node:url";
import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import nextPwa from "next-pwa";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "1",
});

const withPWA = nextPwa({
  dest: "public",
  disable: process.env.NEXT_DISABLE_PWA !== "0",
  register: true,
  skipWaiting: true,
});

const securityHeaders = [
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
] as const;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["codedank-web.localhost"],
  cacheComponents: true,
  outputFileTracingRoot: repoRoot,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ["@beep/ui", "@beep/identity", "@beep/schema", "@beep/utils"],
  turbopack: {
    root: repoRoot,
  },
  typedRoutes: true,
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  experimental: {
    cssChunking: true,
    mcpServer: true,
    mdxRs: true,
    optimizePackageImports: [
      "@base-ui/react",
      "@mui/material",
      "@mui/x-charts",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/x-date-pickers-pro",
      "@mui/x-tree-view",
      "@phosphor-icons/react",
    ],
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...securityHeaders],
      },
    ];
  },
};

export default withBundleAnalyzer(withPWA(withMDX(nextConfig)));
