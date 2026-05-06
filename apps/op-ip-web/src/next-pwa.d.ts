declare module "next-pwa" {
  import type { NextConfig } from "next";

  type NextPwaOptions = {
    readonly dest: string;
    readonly disable?: boolean;
    readonly register?: boolean;
    readonly skipWaiting?: boolean;
  };

  export default function nextPwa(options: NextPwaOptions): (nextConfig: NextConfig) => NextConfig;
}
