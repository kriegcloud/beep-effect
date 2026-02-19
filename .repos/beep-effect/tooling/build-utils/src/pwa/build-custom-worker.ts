/**
 * Custom worker builder for PWA service workers.
 *
 * This module compiles custom service worker code from the user's project
 * and outputs it as a separate file to be imported by the main service worker.
 *
 * @module pwa/build-custom-worker
 */

import { FileSystem, Path } from "@effect/platform";
import type { BadArgument, PlatformError, SystemError } from "@effect/platform/Error";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { globalValue } from "effect/GlobalValue";
import * as O from "effect/Option";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { WebpackBuildError } from "./errors.js";
import type { BuildCustomWorkerOptions } from "./types.js";

/**
 * Node polyfills fallback configuration for web workers.
 * All Node.js built-in modules are disabled since they're not available in workers.
 * Uses globalValue to persist across hot-reloads in Next.js development.
 */
const NODE_FALLBACKS = globalValue(
  Symbol.for("@beep/build-utils/pwa/NODE_FALLBACKS"),
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
 * Supported extensions for custom worker entry files.
 * Uses globalValue to persist across hot-reloads in Next.js development.
 */
const WORKER_EXTENSIONS = globalValue(
  Symbol.for("@beep/build-utils/pwa/WORKER_EXTENSIONS"),
  () => ["ts", "js"] as const
);

/**
 * Find the custom worker directory.
 *
 * @param basedir - The project root directory
 * @param customWorkerDir - The name of the custom worker directory
 * @returns Effect that resolves to the path to the worker directory, or None if not found
 */
const findWorkerDirectory = (
  basedir: string,
  customWorkerDir: string
): Effect.Effect<O.Option<string>, BadArgument | SystemError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Check root directory first
    const rootPath = path.join(basedir, customWorkerDir);
    if (yield* fs.exists(rootPath)) {
      return O.some(rootPath);
    }

    // Check src directory as fallback
    const srcPath = path.join(basedir, "src", customWorkerDir);
    if (yield* fs.exists(srcPath)) {
      return O.some(srcPath);
    }

    return O.none();
  });

/**
 * Find custom worker entry files in the given directory.
 *
 * @param workerDir - The directory to search for entry files
 * @returns Effect that resolves to array of existing entry file paths
 */
const findWorkerEntries = (
  workerDir: string
): Effect.Effect<ReadonlyArray<string>, BadArgument | PlatformError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const entryPaths = A.map(WORKER_EXTENSIONS, (ext) => path.join(workerDir, `index.${ext}`));

    const existsResults = yield* Effect.forEach(entryPaths, (entry) =>
      Effect.map(fs.exists(entry), (exists) => (exists ? O.some(entry) : O.none()))
    );

    return A.filterMap(existsResults, (x) => x);
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
              message: "Failed to build custom worker",
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
 * Build a custom service worker from user code.
 *
 * Searches for a custom worker entry file (index.ts or index.js) in the
 * configured worker directory and compiles it using webpack.
 *
 * @param options - Build configuration options
 * @returns Effect that resolves to the output filename if a custom worker was built, or None
 *
 * @example
 * ```typescript
 * const workerName = yield* buildCustomWorker({
 *   id: buildId,
 *   basedir: projectDir,
 *   customWorkerDir: 'worker',
 *   destdir: outputDir,
 *   plugins: [definePlugin],
 *   minify: true,
 * });
 * ```
 */
export const buildCustomWorker = (
  options: BuildCustomWorkerOptions
): Effect.Effect<
  O.Option<string>,
  BadArgument | PlatformError | WebpackBuildError,
  FileSystem.FileSystem | Path.Path
> =>
  Effect.gen(function* () {
    const { id, basedir, customWorkerDir, destdir, plugins, minify } = options;
    const path = yield* Path.Path;

    // Find worker directory
    const workerDirOption = yield* findWorkerDirectory(basedir, customWorkerDir);
    if (O.isNone(workerDirOption)) {
      return O.none();
    }

    const workerDir = workerDirOption.value;

    // Find entry files
    const customWorkerEntries = yield* findWorkerEntries(workerDir);
    if (A.isEmptyReadonlyArray(customWorkerEntries)) {
      return O.none();
    }

    // Warn if multiple entry files found
    if (A.length(customWorkerEntries) > 1) {
      yield* Console.warn(
        `> [PWA] WARNING: More than one custom worker found (${A.join(customWorkerEntries, ",")}), not building a custom worker`
      );
      return O.none();
    }

    const customWorkerEntry = A.unsafeGet(customWorkerEntries, 0);
    const outputName = `worker-${id}.js`;

    yield* Console.log(`> [PWA] Custom worker found: ${customWorkerEntry}`);
    yield* Console.log(`> [PWA] Build custom worker: ${path.join(destdir, outputName)}`);

    // Build webpack configuration
    const webpackConfig: webpack.Configuration = {
      mode: "none",
      target: "webworker",
      entry: {
        main: customWorkerEntry,
      },
      resolve: {
        extensions: [".ts", ".js"],
        fallback: NODE_FALLBACKS,
      },
      module: {
        rules: [
          {
            test: /\.([tj])s$/i,
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
          cleanOnceBeforeBuildPatterns: [path.join(destdir, "worker-*.js"), path.join(destdir, "worker-*.js.map")],
        }),
        ...plugins,
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

    return O.some(outputName);
  });
