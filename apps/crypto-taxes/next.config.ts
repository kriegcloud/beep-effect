import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@beep/data",
    "@beep/identity",
    "@beep/messages",
    "@beep/schema",
    "@beep/types",
    "@beep/ui",
    "@beep/utils",
  ],
  turbopack: {
    root: decodeURIComponent(new URL("../../", import.meta.url).pathname),
  },
};

export default nextConfig;
