/**
 * Next.js PWA (Progressive Web App) plugin.
 *
 * This module provides utilities for adding PWA support to Next.js applications,
 * including service worker generation, caching strategies, and offline fallbacks.
 *
 * @module @beep/build-utils/pwa
 *
 * @example
 * ```typescript
 * // next.config.js
 * import { withPWA } from '@beep/build-utils/pwa';
 *
 * const nextConfig = {
 *   // your Next.js config
 * };
 *
 * export default withPWA({
 *   dest: 'public',
 *   disable: process.env.NODE_ENV === 'development',
 *   runtimeCaching: defaultCache,
 * })(nextConfig);
 * ```
 */

// Build utilities
export { buildCustomWorker } from "./build-custom-worker.ts";
export { buildFallbackWorker } from "./build-fallback-worker.ts";
// Default caching strategies
export { defaultCache } from "./default-cache.ts";
// Error types
export {
  FileNotFoundError,
  FileReadError,
  GlobError,
  type PWAError,
  WebpackBuildError,
} from "./errors.ts";
// Fallback worker source
export { fallbackWorkerSource } from "./fallback.ts";
// Register worker source
export { registerWorkerSource } from "./register.ts";
// Type exports
export type {
  // Asset types
  Asset,
  AssetInfo,
  // Build types
  BuildCustomWorkerOptions,
  BuildExclude,
  BuildFallbackWorkerOptions,
  BuildFallbackWorkerResult,
  EntriesFunction,
  ExcludeFunction,
  ExcludeFunctionParams,
  FallbackEnvs,
  FallbackRoutes,
  GenerateSWConfig,
  // Manifest types
  ManifestEntry,
  ManifestTransform,
  MutableManifestEntry,
  NextWebpackOptions,
  // Core configuration types
  PWAConfig,
  PWAGlobalVariables,
  RuntimeCaching,
  // URL pattern types
  UrlPatternParams,
  // Webpack types
  WebpackConfig,
  WebpackConfigOptions,
  WebpackEntries,
  WithPWA,
  WorkboxCommonConfig,
  // Workbox types (re-exported from workbox-build)
  WorkboxHandler,
  WorkboxManifestEntry,
  WorkboxManifestTransform,
} from "./types.ts";
// Main plugin export
export { withPWA } from "./with-pwa.ts";
