import type { NextConfig } from "next";
import type { Compilation, WebpackPluginInstance } from "webpack";
import type {
  GenerateSWOptions,
  InjectManifestOptions,
  RuntimeCaching,
  WebpackGenerateSWOptions,
  WebpackInjectManifestOptions,
  ManifestEntry as WorkboxManifestEntry,
  ManifestTransform as WorkboxManifestTransform,
} from "workbox-build";
import type { GenerateSWConfig } from "workbox-webpack-plugin";

// ============================================================================
// Re-export Workbox types for convenience
// ============================================================================

export type {
  RuntimeCaching,
  WorkboxManifestEntry,
  WorkboxManifestTransform,
  GenerateSWConfig,
  WebpackGenerateSWOptions,
  WebpackInjectManifestOptions,
};

/**
 * Mutable manifest entry for use in manifest transforms.
 * This matches Workbox's internal ManifestEntry type with size.
 */
export interface MutableManifestEntry {
  integrity?: string;
  revision: string | null;
  url: string;
  size: number;
}

/**
 * Manifest transform function type (re-exported from workbox-build).
 */
export type ManifestTransform = WorkboxManifestTransform;

// ============================================================================
// Service Worker Global Types
// ============================================================================

/**
 * ExtendableEvent is a Service Worker global type that allows
 * extending the lifetime of events by waiting on promises.
 */
declare global {
  interface ExtendableEvent extends Event {
    waitUntil(promise: Promise<unknown>): void;
  }

  interface ServiceWorkerGlobalScope {
    readonly origin: string;
    readonly caches: CacheStorage;
    skipWaiting(): Promise<void>;
  }
}

// ============================================================================
// Workbox Handler Types (used for default-cache.ts)
// ============================================================================

export type WorkboxHandler = "CacheFirst" | "CacheOnly" | "NetworkFirst" | "NetworkOnly" | "StaleWhileRevalidate";

// ============================================================================
// URL Pattern Types (for default-cache.ts urlPattern functions)
// ============================================================================

export interface UrlPatternParams {
  readonly url: URL;
  readonly request: Request;
  readonly event?: undefined | ExtendableEvent;
  readonly sameOrigin: boolean;
}

// ============================================================================
// Fallback Routes
// ============================================================================

export interface FallbackRoutes {
  readonly document?: undefined | string;
  readonly image?: undefined | string;
  readonly audio?: undefined | string;
  readonly video?: undefined | string;
  readonly font?: undefined | string;
  readonly data?: undefined | string;
}

// ============================================================================
// Manifest Entry (our internal type, compatible with Workbox)
// ============================================================================

export interface ManifestEntry {
  integrity?: string;
  revision: string | null;
  url: string;
}

// ============================================================================
// Asset Info for Webpack Compilation
// ============================================================================

export interface AssetInfo {
  readonly contenthash?: undefined | string;
  readonly immutable?: undefined | boolean;
  readonly minimized?: undefined | boolean;
  readonly sourceFilename?: undefined | string;
  readonly development?: undefined | boolean;
  readonly hotModuleReplacement?: undefined | boolean;
  readonly javascriptModule?: undefined | boolean;
  readonly related?: undefined | Record<string, string | ReadonlyArray<string>>;
}

export interface Asset {
  readonly name: string;
  readonly source: () => Buffer | string;
  readonly info: AssetInfo;
}

// ============================================================================
// Webpack Exclude Function
// ============================================================================

/**
 * Parameters for the exclude function.
 * Note: The asset parameter is simplified to just the name property
 * since that's what's most commonly used for exclusion logic.
 */
export interface ExcludeFunctionParams {
  readonly asset: { readonly name: string };
  readonly compilation: Compilation;
}

export type ExcludeFunction = (params: ExcludeFunctionParams) => boolean;

export type BuildExclude = string | RegExp | ExcludeFunction;

// ============================================================================
// Workbox Config Options (combined GenerateSW + InjectManifest)
// ============================================================================

export type WebpackConfigOptions = Partial<GenerateSWOptions & InjectManifestOptions>;

// ============================================================================
// PWA Plugin Configuration
// ============================================================================

export interface PWAConfig extends Partial<WebpackConfigOptions> {
  /**
   * Whether to disable the PWA plugin as a whole.
   * @default false
   */
  readonly disable?: undefined | boolean;

  /**
   * Configure if the service worker should be registered by the plugin.
   * Set to `false` if you want to register the service worker manually.
   * @default true
   */
  readonly register?: undefined | boolean;

  /**
   * The path to the directory where the generated service worker file will be placed.
   * Should be set to `public` for easier deployment to static hosting services.
   */
  readonly dest?: undefined | string;

  /**
   * Service worker script file name.
   * Set to a different value to customize the output file name.
   * @default "sw.js"
   */
  readonly sw?: undefined | string;

  /**
   * Whether to cache the start URL.
   * @default true
   */
  readonly cacheStartUrl?: undefined | boolean;

  /**
   * If your start url returns different HTML document under different state
   * (ex.: signed in against not signed in), this should be set to true.
   * @default true
   */
  readonly dynamicStartUrl?: undefined | boolean;

  /**
   * The url to another route that is the target of a redirect from the start url.
   * Only effective when `dynamicStartUrl` is set to `true`.
   */
  readonly dynamicStartUrlRedirect?: undefined | string;

  /**
   * URL scope of the PWA.
   * @default basePath or "/"
   */
  readonly scope?: undefined | string;

  /**
   * Array of Glob patterns to exclude files inside `public` folder from being precached.
   * @default ["!noprecache/**\/*"]
   */
  readonly publicExcludes?: undefined | string[];

  /**
   * Array of extra Glob patterns or functions to exclude files inside `.next/static`
   * folder from being precached.
   * @default []
   */
  readonly buildExcludes?: undefined | BuildExclude[];

  /**
   * The url to precached routes to be used as fallback when offline.
   */
  readonly fallbacks?: undefined | FallbackRoutes;

  /**
   * Whether to enable additional route caching when navigating between pages with `next/link`.
   * @default false
   */
  readonly cacheOnFrontEndNav?: undefined | boolean;

  /**
   * Customize the behavior of the app when the device goes back online.
   * Indicates if the app should refresh the page by calling `location.reload()`.
   * @default true
   */
  readonly reloadOnOnline?: undefined | boolean;

  /**
   * Customize the directory where the plugin will look for a custom worker implementation.
   * @default "worker"
   */
  readonly customWorkerDir?: undefined | string;

  /**
   * @deprecated Use `basePath` in next.config.js instead.
   */
  readonly subdomainPrefix?: undefined | string;
}

// ============================================================================
// Build Custom Worker Options
// ============================================================================

export interface BuildCustomWorkerOptions {
  readonly id: string;
  readonly basedir: string;
  readonly customWorkerDir: string;
  readonly destdir: string;
  readonly plugins: ReadonlyArray<WebpackPluginInstance>;
  readonly minify: boolean;
}

// ============================================================================
// Build Fallback Worker Options
// ============================================================================

export interface BuildFallbackWorkerOptions {
  readonly id: string;
  readonly fallbacks: FallbackRoutes;
  readonly basedir: string;
  readonly destdir: string;
  readonly minify: boolean;
  readonly pageExtensions: ReadonlyArray<string>;
}

export interface BuildFallbackWorkerResult {
  readonly fallbacks: FallbackRoutes;
  readonly name: string;
  readonly precaches: ReadonlyArray<string>;
}

// ============================================================================
// Fallback Environment Variables
// ============================================================================

export interface FallbackEnvs {
  readonly __PWA_FALLBACK_DOCUMENT__: string | false;
  readonly __PWA_FALLBACK_IMAGE__: string | false;
  readonly __PWA_FALLBACK_AUDIO__: string | false;
  readonly __PWA_FALLBACK_VIDEO__: string | false;
  readonly __PWA_FALLBACK_FONT__: string | false;
  readonly __PWA_FALLBACK_DATA__: string | false;
}

// ============================================================================
// Next.js Webpack Options
// ============================================================================

export interface NextWebpackOptions {
  readonly webpack: typeof import("webpack");
  readonly buildId: string;
  readonly dev: boolean;
  readonly isServer: boolean;
  readonly dir: string;
  readonly config: {
    readonly distDir?: undefined | string;
    readonly basePath?: undefined | string;
    readonly pageExtensions?: undefined | ReadonlyArray<string>;
    readonly experimental?:
      | undefined
      | {
          readonly modern?: undefined | boolean;
        };
  };
}

// ============================================================================
// Webpack Configuration Extensions
// ============================================================================

export interface WebpackEntries {
  readonly [key: string]: ReadonlyArray<string>;
}

export type EntriesFunction = () => Promise<Record<string, string[]>>;

export interface WebpackConfig {
  entry: EntriesFunction;
  output: {
    readonly path: string;
    readonly filename: string;
    readonly publicPath?: undefined | string;
  };
  plugins: Array<WebpackPluginInstance>;
  readonly resolve?: {
    readonly extensions?: undefined | ReadonlyArray<string>;
    readonly fallback?: undefined | Record<string, boolean>;
  };
  readonly module?:
    | undefined
    | {
        readonly rules?: undefined | ReadonlyArray<unknown>;
      };
}

// ============================================================================
// WithPWA Function Type
// ============================================================================

export type WithPWA = (config: NextConfig) => NextConfig;

// ============================================================================
// PWA Global Variables (for DefinePlugin)
// ============================================================================

export interface PWAGlobalVariables {
  readonly __PWA_SW__: string;
  readonly __PWA_SCOPE__: string;
  readonly __PWA_ENABLE_REGISTER__: string;
  readonly __PWA_START_URL__: string | undefined;
  readonly __PWA_CACHE_ON_FRONT_END_NAV__: string;
  readonly __PWA_RELOAD_ON_ONLINE__: string;
}

// ============================================================================
// Workbox Common Config (using Workbox's actual types)
// ============================================================================

/**
 * Common configuration passed to both GenerateSW and InjectManifest.
 * Uses Workbox's actual types to avoid type casting issues.
 */
export interface WorkboxCommonConfig {
  swDest: string;
  additionalManifestEntries?: undefined | Array<string | WorkboxManifestEntry>;
  exclude?: undefined | Array<string | RegExp | ((arg0: unknown) => boolean)>;
  modifyURLPrefix?: undefined | { [key: string]: string };
  manifestTransforms?: undefined | Array<WorkboxManifestTransform>;
}

// ============================================================================
// Service Worker Global Scope with fallback function
// ============================================================================

/**
 * Extended ServiceWorkerGlobalScope that includes the fallback function
 * injected by the fallback worker.
 */
export interface PWAServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  /**
   * Fallback function injected by the fallback worker script.
   * Returns a fallback response for the given request when offline.
   */
  fallback(request: Request): Promise<Response | undefined>;
}

// ============================================================================
// Runtime Caching Entry with mutable options
// ============================================================================
