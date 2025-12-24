/**
 * Fallback worker builder for PWA offline support.
 *
 * This module compiles the fallback worker code with environment variables
 * for offline fallback routes.
 *
 * @module pwa/build-fallback-worker
 */

import { FileSystem, Path } from "@effect/platform";
import type { BadArgument, PlatformError, SystemError } from "@effect/platform/Error";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import { globalValue } from "effect/GlobalValue";
import * as O from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { WebpackBuildError } from "./errors.js";
import type { BuildFallbackWorkerOptions, BuildFallbackWorkerResult, FallbackEnvs, FallbackRoutes } from "./types.js";

/**
 * Node polyfills fallback configuration for web workers.
 * Uses globalValue to persist across hot-reloads in Next.js development.
 */
const NODE_FALLBACKS = globalValue(
  Symbol.for("@beep/build-utils/pwa/fallback/NODE_FALLBACKS"),
  () =>
    ({
      module: false,
      dgram: false,
      dns: false,
      path: false,
      fs: false,
      os: false,
      crypto: false,
      stream: false,
      http2: false,
      net: false,
      tls: false,
      zlib: false,
      child_process: false,
    }) as const
);

/**
 * Find the pages directory in the project.
 *
 * @param basedir - The project root directory
 * @returns Effect that resolves to the path to the pages directory, or None if not found
 */
const findPagesDirectory = (
  basedir: string
): Effect.Effect<O.Option<string>, BadArgument | SystemError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Check root directory first
    const rootPath = path.join(basedir, "pages");
    if (yield* fs.exists(rootPath)) {
      return O.some(rootPath);
    }

    // Check src directory as fallback
    const srcPath = path.join(basedir, "src", "pages");
    if (yield* fs.exists(srcPath)) {
      return O.some(srcPath);
    }

    return O.none();
  });

/** Predicate for strings ending with .json */
const endsWithJson = Str.endsWith(".json");

/**
 * Detect the document fallback path.
 * Returns the configured document, auto-detects _offline page, or None.
 */
const detectDocumentFallback = (options: {
  document: string | undefined;
  basedir: string;
  pageExtensions: ReadonlyArray<string>;
}): Effect.Effect<O.Option<string>, BadArgument | PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const { document, basedir, pageExtensions } = options;

    // Return configured document if present
    if (document) {
      return O.some(document);
    }

    // Try to auto-detect _offline page
    const pagesDirOption = yield* findPagesDirectory(basedir);
    if (O.isNone(pagesDirOption)) {
      return O.none();
    }

    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const pagesDir = pagesDirOption.value;
    const offlinePagePaths = A.map(pageExtensions, (ext) => path.join(pagesDir, `_offline.${ext}`));

    const existsResults = yield* Effect.forEach(offlinePagePaths, (entry) =>
      Effect.map(fs.exists(entry), (exists) => (exists ? O.some(entry) : O.none()))
    );

    const offlinePages = A.filterMap(existsResults, (x) => x);

    // Only use auto-detected _offline if exactly one exists
    return A.length(offlinePages) === 1 ? O.some("/_offline") : O.none();
  });

/**
 * Transform the data path for Next.js data routes if needed.
 */
const transformDataPath = (data: string | undefined, id: string, path: Path.Path): string | false =>
  pipe(
    O.fromNullable(data),
    O.filter(endsWithJson),
    O.map((d) => path.join("/_next/data", id, d)),
    O.getOrElse(() => data || false)
  );

/**
 * Log configured fallbacks to console.
 */
const logFallbackEnvs = (envs: FallbackEnvs): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Console.log("> [PWA] Fallback to precache routes when fetch failed from cache or network:");

    if (envs.__PWA_FALLBACK_DOCUMENT__) {
      yield* Console.log(`> [PWA]   document (page): ${envs.__PWA_FALLBACK_DOCUMENT__}`);
    }
    if (envs.__PWA_FALLBACK_IMAGE__) {
      yield* Console.log(`> [PWA]   image: ${envs.__PWA_FALLBACK_IMAGE__}`);
    }
    if (envs.__PWA_FALLBACK_AUDIO__) {
      yield* Console.log(`> [PWA]   audio: ${envs.__PWA_FALLBACK_AUDIO__}`);
    }
    if (envs.__PWA_FALLBACK_VIDEO__) {
      yield* Console.log(`> [PWA]   video: ${envs.__PWA_FALLBACK_VIDEO__}`);
    }
    if (envs.__PWA_FALLBACK_FONT__) {
      yield* Console.log(`> [PWA]   font: ${envs.__PWA_FALLBACK_FONT__}`);
    }
    if (envs.__PWA_FALLBACK_DATA__) {
      yield* Console.log(`> [PWA]   data (/_next/data/**/*.json): ${envs.__PWA_FALLBACK_DATA__}`);
    }
  });

/**
 * Calculate fallback environment variables from configuration.
 *
 * Auto-detects `_offline` page if no document fallback is specified.
 *
 * @param options - Configuration options
 * @returns Effect that resolves to environment variables object, or None if no fallbacks configured
 */
const getFallbackEnvs = (options: {
  fallbacks: FallbackRoutes;
  basedir: string;
  id: string;
  pageExtensions: ReadonlyArray<string>;
}): Effect.Effect<O.Option<FallbackEnvs>, BadArgument | PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const { fallbacks, basedir, id, pageExtensions } = options;
    const path = yield* Path.Path;

    // Detect document fallback (configured or auto-detected)
    const documentOption = yield* detectDocumentFallback({
      document: fallbacks.document,
      basedir,
      pageExtensions,
    });

    // If no document configured and no pages directory found, return None
    if (!fallbacks.document && O.isNone(documentOption)) {
      return O.none();
    }

    // Transform data path for Next.js data routes
    const data = transformDataPath(fallbacks.data, id, path);

    const envs: FallbackEnvs = {
      __PWA_FALLBACK_DOCUMENT__: O.getOrElse(documentOption, () => false as const),
      __PWA_FALLBACK_IMAGE__: fallbacks.image || false,
      __PWA_FALLBACK_AUDIO__: fallbacks.audio || false,
      __PWA_FALLBACK_VIDEO__: fallbacks.video || false,
      __PWA_FALLBACK_FONT__: fallbacks.font || false,
      __PWA_FALLBACK_DATA__: data,
    };

    // Check if any fallbacks are configured using Predicate
    const isFallbackConfigured = Predicate.not((v: string | false) => v === false);
    const hasAnyFallback = A.some(R.values(envs), isFallbackConfigured);

    if (!hasAnyFallback) {
      return O.none();
    }

    yield* logFallbackEnvs(envs);

    return O.some(envs);
  });

/**
 * Run webpack compilation and wait for it to complete.
 *
 * @param webpackConfig - Webpack configuration
 * @returns Effect that completes when webpack finishes or fails with a WebpackBuildError
 */
const runWebpack = (webpackConfig: webpack.Configuration): Effect.Effect<void, WebpackBuildError> =>
  Effect.async<void, WebpackBuildError>((resume) => {
    webpack(webpackConfig).run((error, stats) => {
      if (error || stats?.hasErrors()) {
        const details = stats ? stats.toString({ colors: true }) : undefined;
        resume(
          Effect.fail(
            new WebpackBuildError({
              message: "Failed to build fallback worker",
              details,
            })
          )
        );
      } else {
        resume(Effect.succeed(void 0));
      }
    });
  });

/**
 * Get the path to the fallback.js file bundled with this module.
 *
 * @returns Effect that resolves to the path to fallback.js
 */
const getFallbackJsPath = (): Effect.Effect<string, never, Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    // Get the directory of the current module
    const currentFileUrl = import.meta.url;
    const currentFilePath = new URL(currentFileUrl).pathname;
    const currentDir = path.dirname(currentFilePath);
    return path.join(currentDir, "fallback.js");
  });

/**
 * Build the fallback worker with configured fallback routes.
 *
 * @param options - Build configuration options
 * @returns Effect that resolves to build result with fallback info, or None if no fallbacks configured
 *
 * @example
 * ```typescript
 * const result = yield* buildFallbackWorker({
 *   id: buildId,
 *   fallbacks: { document: '/_offline' },
 *   basedir: projectDir,
 *   destdir: outputDir,
 *   minify: true,
 *   pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
 * });
 * ```
 */
export const buildFallbackWorker = (
  options: BuildFallbackWorkerOptions
): Effect.Effect<
  O.Option<BuildFallbackWorkerResult>,
  BadArgument | PlatformError | WebpackBuildError,
  FileSystem.FileSystem | Path.Path
> =>
  Effect.gen(function* () {
    const { id, fallbacks, basedir, destdir, minify, pageExtensions } = options;
    const path = yield* Path.Path;

    // Calculate environment variables
    const envsOption = yield* getFallbackEnvs({ fallbacks, basedir, id, pageExtensions });
    if (O.isNone(envsOption)) {
      return O.none();
    }

    const envs = envsOption.value;
    const outputName = `fallback-${id}.js`;
    const fallbackJsPath = yield* getFallbackJsPath();

    // Build webpack configuration
    const webpackConfig: webpack.Configuration = {
      mode: "none",
      target: "webworker",
      entry: {
        main: fallbackJsPath,
      },
      resolve: {
        extensions: [".js"],
        fallback: NODE_FALLBACKS,
      },
      module: {
        rules: [
          {
            test: /\.js$/i,
            use: [
              {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "next/babel",
                      {
                        "transform-runtime": {
                          corejs: false,
                          helpers: true,
                          regenerator: false,
                          useESModules: true,
                        },
                        "preset-env": {
                          modules: false,
                          targets: "chrome >= 56",
                        },
                      },
                    ],
                  ],
                },
              },
            ],
          },
        ],
      },
      output: {
        path: destdir,
        filename: outputName,
      },
      plugins: [
        new CleanWebpackPlugin({
          cleanOnceBeforeBuildPatterns: [path.join(destdir, "fallback-*.js"), path.join(destdir, "fallback-*.js.map")],
        }),
        // EnvironmentPlugin accepts defaults that include booleans (false means the var is optional)
        new webpack.EnvironmentPlugin(envs),
      ],
      ...(minify && {
        optimization: {
          minimize: true,
          minimizer: [new TerserPlugin()],
        },
      }),
    };

    // Run webpack compilation
    yield* runWebpack(webpackConfig);

    // Collect precache routes from configured fallbacks
    // Use refinement to narrow string | false to non-empty strings
    const isNonEmptyString = (v: string | false): v is string => Predicate.isString(v) && Str.isNonEmpty(v);
    const precaches = A.filterMap(R.values(envs), O.liftPredicate(isNonEmptyString));

    return O.some({
      fallbacks,
      name: outputName,
      precaches,
    });
  });
