declare module "next-pwa" {
  import type { NextConfig } from "next";

  /**
   * Options accepted by the `next-pwa` default export.
   *
   * @category models
   * @since 0.0.0
   */
  type NextPwaOptions = {
    readonly customWorkerDir?: string;
    readonly dest: string;
    readonly disable?: boolean;
    readonly fallbacks?: Record<string, string>;
    readonly publicExcludes?: ReadonlyArray<string>;
    readonly register?: boolean;
    readonly scope?: string;
    readonly skipWaiting?: boolean;
    readonly sw?: string;
  };

  /**
   * Wrap a Next.js config with `next-pwa`.
   *
   * @param options - PWA plugin options.
   * @returns A Next.js config plugin.
   * @category constructors
   * @since 0.0.0
   */
  export default function nextPwa(options: NextPwaOptions): (nextConfig: NextConfig) => NextConfig;
}
