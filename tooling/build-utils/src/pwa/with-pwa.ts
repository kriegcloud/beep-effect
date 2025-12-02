/**
 * Next.js PWA plugin for generating service workers.
 *
 * This module provides a higher-order function that enhances Next.js configuration
 * with Progressive Web App support using Workbox.
 *
 * @module pwa/with-pwa
 */

import * as crypto from "node:crypto";
import * as nodePath from "node:path";
import { FileSystem, Path } from "@effect/platform";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import { globalValue } from "effect/GlobalValue";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { globbySync } from "globby";
import type { NextConfig } from "next";
import type { DefinePlugin } from "webpack";
import type { ManifestTransform } from "workbox-build";
import WorkboxPlugin from "workbox-webpack-plugin";
import { buildCustomWorker } from "./build-custom-worker.ts";
import { buildFallbackWorker } from "./build-fallback-worker.ts";
import { defaultCache } from "./default-cache.ts";
import { FileReadError, GlobError } from "./errors.ts";
import type {
  FallbackRoutes,
  ManifestEntry,
  PWAConfig,
  PWAServiceWorkerGlobalScope,
  RuntimeCaching,
  WebpackGenerateSWOptions,
  WebpackInjectManifestOptions,
} from "./types.ts";

/** Declare self as the PWA service worker global scope */
declare const self: PWAServiceWorkerGlobalScope;

/**
 * Layer providing FileSystem and Path services for Bun runtime.
 * Uses globalValue to persist across hot-reloads in Next.js development.
 */
const PlatformLayer = globalValue(Symbol.for("@beep/build-utils/pwa/PlatformLayer"), () =>
  Layer.provideMerge(BunFileSystem.layer, BunPath.layer)
);

/**
 * Run an Effect synchronously with platform services provided.
 * Used for running Effects within webpack's synchronous config callback.
 */
const runSyncWithPlatform = <A, E>(effect: Effect.Effect<A, E, FileSystem.FileSystem | Path.Path>): A => {
  return Effect.runSync(Effect.provide(effect, PlatformLayer));
};

/**
 * Calculate MD5 hash of a file for cache revision.
 *
 * @param file - Path to the file
 * @returns Effect that resolves to MD5 hash string
 */
const getRevision = (file: string): Effect.Effect<string, FileReadError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFile(file).pipe(
      Effect.mapError(
        (e) =>
          new FileReadError({
            path: file,
            message: `Failed to read file for revision hash: ${e.message}`,
            cause: e,
          })
      )
    );
    return crypto.createHash("md5").update(content).digest("hex");
  });

/**
 * Get the directory path for this module (ESM equivalent of __dirname).
 */
const getModuleDir = (): Effect.Effect<string, never, Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const currentFileUrl = import.meta.url;
    const currentFilePath = new URL(currentFileUrl).pathname;
    return path.dirname(currentFilePath);
  });

/**
 * Glob files and create manifest entries.
 */
const globManifestEntries = (options: {
  patterns: ReadonlyArray<string>;
  cwd: string;
  basePath: string;
}): Effect.Effect<ReadonlyArray<ManifestEntry>, FileReadError | GlobError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const { patterns, cwd, basePath } = options;

    // Use globbySync wrapped in Effect.try for error handling
    const files = yield* Effect.try({
      try: () => globbySync(patterns, { cwd }),
      catch: (e) =>
        new GlobError({
          pattern: patterns,
          message: `Failed to glob files: ${e}`,
          cause: e,
        }),
    });

    // Create manifest entries with revisions
    return yield* Effect.forEach(files, (f) =>
      Effect.map(getRevision(`${cwd}/${f}`), (revision) => ({
        url: nodePath.posix.join(basePath, `/${f}`),
        revision,
      }))
    );
  });

/**
 * Create a PWA-enhanced Next.js configuration.
 *
 * @param pluginOptions - PWA plugin configuration options
 * @returns A function that accepts Next.js config and returns enhanced config
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
 * })(nextConfig);
 * ```
 */
export const withPWA =
  (pluginOptions: PWAConfig = {}) =>
  (nextConfig: NextConfig = {}): NextConfig => ({
    ...nextConfig,
    webpack: (config, options) => {
      const { webpack, buildId, dev, isServer, dir, config: nextJsConfig } = options;
      const distDir = nextJsConfig.distDir ?? ".next";
      const configBasePath = nextJsConfig.basePath;
      const pageExtensions = nextJsConfig.pageExtensions ?? ["tsx", "ts", "jsx", "js", "mdx"];
      const experimental = (nextJsConfig.experimental ?? {}) as { modern?: boolean };

      const basePath = configBasePath ?? "/";

      // Extract plugin options with defaults
      const {
        disable = false,
        register = true,
        dest = distDir,
        sw = "sw.js",
        cacheStartUrl = true,
        dynamicStartUrl = true,
        dynamicStartUrlRedirect,
        skipWaiting = true,
        clientsClaim = true,
        cleanupOutdatedCaches = true,
        additionalManifestEntries,
        ignoreURLParametersMatching = [],
        importScripts = [],
        publicExcludes = ["!noprecache/**/*"],
        buildExcludes = [],
        modifyURLPrefix = {},
        manifestTransforms = [],
        fallbacks = {},
        cacheOnFrontEndNav = false,
        reloadOnOnline = true,
        scope = basePath,
        customWorkerDir = "worker",
        subdomainPrefix,
        ...workbox
      } = pluginOptions;

      // Call original webpack config if provided (using pure conditional)
      const modifiedConfig = Predicate.isFunction(nextConfig.webpack) ? nextConfig.webpack(config, options) : config;

      // Exit early if PWA is disabled
      if (disable) {
        if (isServer) {
          // Use console.log directly here since we're in sync context and need immediate output
          console.log("> [PWA] PWA support is disabled");
        }
        return modifiedConfig;
      }

      // Warn about deprecated option
      if (subdomainPrefix) {
        console.error(
          "> [PWA] subdomainPrefix is deprecated, use basePath in next.config.js instead: https://nextjs.org/docs/api-reference/next.config.js/basepath"
        );
      }

      console.log(`> [PWA] Compile ${isServer ? "server" : "client (static)"}`);

      // Get runtime caching configuration
      const runtimeCaching: RuntimeCaching[] =
        (pluginOptions.runtimeCaching as RuntimeCaching[] | undefined) ?? (defaultCache as RuntimeCaching[]);
      const _scope = nodePath.posix.join(scope, "/");

      // Get module directory for register.js path
      const moduleDir = runSyncWithPlatform(getModuleDir());

      // Inject register script configuration via DefinePlugin
      const _sw = nodePath.posix.join(basePath, sw.startsWith("/") ? sw : `/${sw}`);
      modifiedConfig.plugins?.push(
        new webpack.DefinePlugin({
          __PWA_SW__: `'${_sw}'`,
          __PWA_SCOPE__: `'${_scope}'`,
          __PWA_ENABLE_REGISTER__: `${Boolean(register)}`,
          __PWA_START_URL__: dynamicStartUrl ? `'${basePath}'` : "undefined",
          __PWA_CACHE_ON_FRONT_END_NAV__: `${Boolean(cacheOnFrontEndNav)}`,
          __PWA_RELOAD_ON_ONLINE__: `${Boolean(reloadOnOnline)}`,
        })
      );

      // Inject register script into main.js entry
      const registerJs = nodePath.join(moduleDir, "register.js");
      const originalEntry = modifiedConfig.entry;
      modifiedConfig.entry = async (): Promise<Record<string, string[]>> => {
        const entries = typeof originalEntry === "function" ? await originalEntry() : originalEntry;

        const entriesRecord = entries as Record<string, string[]>;
        if (entriesRecord["main.js"] && !A.contains(entriesRecord["main.js"], registerJs)) {
          entriesRecord["main.js"].unshift(registerJs);
        }
        return entriesRecord;
      };

      // Client-side only configuration
      if (!isServer) {
        const _dest = nodePath.join(dir, dest);

        // Build custom worker if present (run Effect synchronously)
        const customWorkerResult = runSyncWithPlatform(
          buildCustomWorker({
            id: buildId,
            basedir: dir,
            customWorkerDir,
            destdir: _dest,
            plugins:
              modifiedConfig.plugins?.filter(
                (plugin: unknown): plugin is DefinePlugin =>
                  (plugin as { constructor?: { name?: string } } | null)?.constructor?.name === "DefinePlugin"
              ) ?? [],
            minify: !dev,
          })
        );

        // Log registration info
        if (register) {
          console.log(`> [PWA] Auto register service worker with: ${nodePath.resolve(registerJs)}`);
        } else {
          console.log(
            `> [PWA] Auto register service worker is disabled, please call following code in componentDidMount callback or useEffect hook`
          );
          console.log(`> [PWA]   window.workbox.register()`);
        }

        console.log(`> [PWA] Service worker: ${nodePath.join(_dest, sw)}`);
        console.log(`> [PWA]   url: ${_sw}`);
        console.log(`> [PWA]   scope: ${_scope}`);

        // Clean up old workbox files
        modifiedConfig.plugins?.push(
          new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
              nodePath.join(_dest, "workbox-*.js"),
              nodePath.join(_dest, "worker-*.js.LICENSE.txt"),
              nodePath.join(_dest, "workbox-*.js.map"),
              nodePath.join(_dest, sw),
              nodePath.join(_dest, `${sw}.map`),
            ],
          })
        );

        // Build manifest entries from public folder (pure function)
        const buildManifestEntries = (): ManifestEntry[] => {
          if (A.isArray(additionalManifestEntries)) {
            return additionalManifestEntries as ManifestEntry[];
          }
          const swWithoutLeadingSlash = pipe(sw, Str.replace(/^\/+/, ""));
          const globPatterns = [
            "**/*",
            "!workbox-*.js",
            "!workbox-*.js.map",
            "!worker-*.js",
            "!worker-*.js.map",
            "!fallback-*.js",
            "!fallback-*.js.map",
            `!${swWithoutLeadingSlash}`,
            `!${swWithoutLeadingSlash}.map`,
            ...publicExcludes,
          ];
          return runSyncWithPlatform(
            globManifestEntries({
              patterns: globPatterns,
              cwd: "public",
              basePath,
            })
          ) as ManifestEntry[];
        };

        // Build start URL entry if needed (pure function)
        const buildStartUrlEntry = (): ReadonlyArray<ManifestEntry> => {
          if (!cacheStartUrl) return [];
          if (!dynamicStartUrl) {
            return [{ url: basePath, revision: buildId }];
          }
          if (Predicate.isString(dynamicStartUrlRedirect) && Str.isNonEmpty(dynamicStartUrlRedirect)) {
            return [{ url: dynamicStartUrlRedirect, revision: buildId }];
          }
          return [];
        };

        // Compose manifest entries using spread (immutable)
        const manifestEntries: ManifestEntry[] = [...buildManifestEntries(), ...buildStartUrlEntry()];

        // Build fallback worker if fallbacks are configured (pure approach)
        const hasFallbacks = fallbacks && A.length(Struct.keys(fallbacks)) > 0;
        const fallbackResult = hasFallbacks
          ? runSyncWithPlatform(
              buildFallbackWorker({
                id: buildId,
                fallbacks,
                basedir: dir,
                destdir: _dest,
                minify: !dev,
                pageExtensions,
              })
            )
          : O.none();

        // Derive final fallbacks and import scripts from result
        const resolvedFallbacks: FallbackRoutes | undefined = pipe(
          fallbackResult,
          O.map((r) => r.fallbacks),
          O.getOrUndefined
        );

        // Build import scripts list (immutable)
        const finalImportScripts = pipe(
          fallbackResult,
          O.match({
            onNone: () =>
              pipe(
                customWorkerResult,
                O.match({
                  onNone: () => [...importScripts],
                  onSome: (name) => [name, ...importScripts],
                })
              ),
            onSome: (result) =>
              pipe(
                customWorkerResult,
                O.match({
                  onNone: () => [result.name, ...importScripts],
                  onSome: (name) => [result.name, name, ...importScripts],
                })
              ),
          })
        );

        // Build precache entries for fallback routes (pure function)
        const buildFallbackPrecacheEntries = (): ReadonlyArray<ManifestEntry> =>
          pipe(
            fallbackResult,
            O.map((result) =>
              A.filterMap(result.precaches, (route) =>
                A.findFirst(manifestEntries, (entry) => entry.url.startsWith(route))
                  ? O.none()
                  : O.some({ url: route, revision: buildId })
              )
            ),
            O.getOrElse(() => [] as ManifestEntry[])
          );

        // Compose final manifest entries (immutable)
        const finalManifestEntries: ManifestEntry[] = [...manifestEntries, ...buildFallbackPrecacheEntries()];

        // Build common workbox configuration
        const workboxCommon = {
          swDest: nodePath.join(_dest, sw),
          additionalManifestEntries: dev ? [] : finalManifestEntries,
          exclude: [
            ...A.map(buildExcludes, (exclude) => {
              // Convert our BuildExclude type to Workbox's expected format
              if (typeof exclude === "function") {
                return (arg: unknown) => {
                  const params = arg as { asset: { name: string } };
                  return exclude({ asset: params.asset, compilation: {} as never });
                };
              }
              return exclude;
            }),
            (arg: unknown) => {
              const { asset } = arg as { asset: { name: string } };
              if (
                pipe(asset.name, Str.startsWith("server/")) ||
                pipe(asset.name, Str.match(/^(build-manifest\.json|react-loadable-manifest\.json)$/))
              ) {
                return true;
              }
              if (dev && !pipe(asset.name, Str.startsWith("static/runtime/"))) {
                return true;
              }
              if (experimental.modern) {
                if (pipe(asset.name, Str.endsWith(".module.js"))) {
                  return false;
                }
                if (pipe(asset.name, Str.endsWith(".js"))) {
                  return true;
                }
              }
              return false;
            },
          ],
          modifyURLPrefix: {
            ...modifyURLPrefix,
            "/_next/../public/": "/",
          },
          manifestTransforms: [
            ...(manifestTransforms as ManifestTransform[]),
            (async (entries, compilation) => {
              const comp = compilation as { assetsInfo: Map<string, { contenthash?: string | string[] }> } | undefined;
              const publicPath = modifiedConfig.output?.publicPath;

              // Pure function to calculate asset key
              const getAssetKey = (url: string): string =>
                Predicate.isString(publicPath) && pipe(url, Str.startsWith(publicPath))
                  ? pipe(url, Str.substring(publicPath.length))
                  : url;

              // Pure function to get revision from asset info
              const getRevisionFromAssets = (url: string): string => {
                const key = getAssetKey(url);
                const assetInfo = comp?.assetsInfo.get(key);
                return assetInfo?.contenthash?.toString() ?? buildId;
              };

              // Transform each manifest entry (pure mapping)
              const manifest = A.map(entries, (m) => {
                // Fix double slashes in URLs (immutable operations)
                const urlFixed = pipe(
                  m.url,
                  Str.replace("/_next//static/image", "/_next/static/image"),
                  Str.replace("/_next//static/media", "/_next/static/media")
                );

                // Calculate revision from asset info if not present
                const revision = m.revision === null ? getRevisionFromAssets(urlFixed) : m.revision;

                // Encode brackets in URLs
                const urlEncoded = pipe(urlFixed, Str.replace(/\[/g, "%5B"), Str.replace(/]/g, "%5D"));

                return { ...m, url: urlEncoded, revision };
              });

              return { manifest, warnings: [] };
            }) as ManifestTransform,
          ],
        } satisfies Partial<WebpackGenerateSWOptions>;

        // Use InjectManifest if swSrc is provided, otherwise use GenerateSW
        if (workbox.swSrc) {
          const swSrc = nodePath.join(dir, workbox.swSrc);
          console.log(`> [PWA] Inject manifest in ${swSrc}`);
          const injectManifestConfig = {
            ...workboxCommon,
            ...workbox,
            swSrc,
          } satisfies WebpackInjectManifestOptions;
          modifiedConfig.plugins?.push(new WorkboxPlugin.InjectManifest(injectManifestConfig));
        } else {
          // Build runtime caching config based on dev mode and dynamic start URL (pure functions)
          const buildBaseRuntimeCaching = (): RuntimeCaching[] => {
            if (dev) {
              console.log(
                "> [PWA] Build in develop mode, cache and precache are mostly disabled. This means offline support is disabled, but you can continue developing other functions in service worker."
              );
              return [
                {
                  urlPattern: /.*/i,
                  handler: "NetworkOnly",
                  options: {
                    cacheName: "dev",
                  },
                },
              ];
            }
            return runtimeCaching;
          };

          // Build ignore URL parameters matching list (immutable)
          const finalIgnoreURLParametersMatching = dev
            ? [...ignoreURLParametersMatching, /ts/]
            : ignoreURLParametersMatching;

          // Build start URL cache entry
          const startUrlCacheEntry: RuntimeCaching = {
            urlPattern: basePath,
            handler: "NetworkFirst",
            options: {
              cacheName: "start-url",
              plugins: [
                {
                  cacheWillUpdate: async ({ response }: { response: Response }): Promise<Response | null> => {
                    if (response && response.type === "opaqueredirect") {
                      return new Response(response.body, {
                        status: 200,
                        statusText: "OK",
                        headers: response.headers,
                      });
                    }
                    return response;
                  },
                },
              ],
            },
          };

          // Compose runtime caching with start URL if enabled (immutable)
          const baseRuntimeCaching = buildBaseRuntimeCaching();
          const runtimeCachingWithStartUrl: RuntimeCaching[] = dynamicStartUrl
            ? [startUrlCacheEntry, ...baseRuntimeCaching]
            : baseRuntimeCaching;

          // Add fallback handler to runtime caching entries (pure transformation)
          const fallbackPlugin = {
            handlerDidError: async ({ request }: { request: Request }): Promise<Response | undefined> => {
              return self.fallback(request);
            },
          };

          const needsFallbackPlugin = (entry: RuntimeCaching): boolean =>
            !entry.options?.precacheFallback &&
            !(
              A.isArray(entry.options?.plugins) &&
              O.isSome(A.findFirst(entry.options.plugins, (p) => "handlerDidError" in p))
            );

          const addFallbackPluginToEntry = (entry: RuntimeCaching): RuntimeCaching => {
            if (!needsFallbackPlugin(entry)) return entry;
            const existingPlugins = entry.options?.plugins ?? [];
            return {
              ...entry,
              options: {
                ...entry.options,
                plugins: [...existingPlugins, fallbackPlugin],
              },
            };
          };

          // Apply fallback plugins if fallbacks are configured (immutable map)
          const finalRuntimeCaching: RuntimeCaching[] = resolvedFallbacks
            ? A.map(runtimeCachingWithStartUrl, addFallbackPluginToEntry)
            : runtimeCachingWithStartUrl;

          const generateSwConfig: WebpackGenerateSWOptions = {
            ...workboxCommon,
            skipWaiting,
            clientsClaim,
            cleanupOutdatedCaches,
            ignoreURLParametersMatching: finalIgnoreURLParametersMatching,
            importScripts: finalImportScripts,
            ...workbox,
            runtimeCaching: finalRuntimeCaching,
          };
          modifiedConfig.plugins?.push(new WorkboxPlugin.GenerateSW(generateSwConfig));
        }
      }

      return modifiedConfig;
    },
  });
