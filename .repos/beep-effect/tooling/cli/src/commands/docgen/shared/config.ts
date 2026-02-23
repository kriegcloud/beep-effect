/**
 * @file Docgen Configuration Utilities
 *
 * Handles loading, parsing, and validating docgen.json configuration files.
 * Also provides utilities for generating new configurations from tsconfig.
 *
 * Key exports:
 * - loadDocgenConfig: Load and validate existing docgen.json
 * - hasDocgenConfig: Check if docgen.json exists
 * - findTsConfig: Find best tsconfig file in precedence order
 * - writeDocgenConfig: Save docgen.json configuration
 * - DOCGEN_CONFIG_FILENAME: Standard filename constant
 * - TSCONFIG_PRECEDENCE: Search order for tsconfig files
 *
 * @module docgen/shared/config
 * @since 0.1.0
 */

import type { PlatformError } from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { DocgenConfigError, TsConfigNotFoundError } from "../errors.js";
import { type DocgenConfig, DocgenConfigSchema } from "../types.js";

/**
 * Map PlatformError to DocgenConfigError.
 */
const mapPlatformError =
  (path: string, context: string) =>
  (e: PlatformError): DocgenConfigError =>
    new DocgenConfigError({
      path,
      reason: `${context}: ${e.message}`,
    });

/**
 * Standard filename for docgen configuration.
 *
 * @example
 * ```ts
 * import { DOCGEN_CONFIG_FILENAME } from "@beep/repo-cli/commands/docgen/shared"
 *
 * console.log(DOCGEN_CONFIG_FILENAME)
 * // => "docgen.json"
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const DOCGEN_CONFIG_FILENAME = "docgen.json";

/**
 * TSConfig file search order - first match wins.
 *
 * @example
 * ```ts
 * import { TSCONFIG_PRECEDENCE } from "@beep/repo-cli/commands/docgen/shared"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const files = F.pipe(TSCONFIG_PRECEDENCE, A.fromIterable)
 * console.log(files)
 * // => ["tsconfig.src.json", "tsconfig.build.json", "tsconfig.json"]
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const TSCONFIG_PRECEDENCE = ["tsconfig.src.json", "tsconfig.build.json", "tsconfig.json"] as const;

/**
 * Load and parse docgen.json from a package directory.
 *
 * @example
 * ```ts
 * import { loadDocgenConfig } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
 * import * as NodePath from "@effect/platform-node/NodePath"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* loadDocgenConfig("packages/common/schema")
 *   console.log(config.examplesCompilerOptions?.paths)
 * }).pipe(Effect.provide(NodeFileSystem.layer), Effect.provide(NodePath.layer))
 * ```
 *
 * @param packagePath - Absolute path to the package directory
 * @returns Parsed and validated DocgenConfig
 * @throws DocgenConfigError if file doesn't exist, can't be read, or fails validation
 * @category utilities
 * @since 0.1.0
 */
export const loadDocgenConfig = (
  packagePath: string
): Effect.Effect<DocgenConfig, DocgenConfigError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const configPath = path.join(packagePath, DOCGEN_CONFIG_FILENAME);

    const exists = yield* fs
      .exists(configPath)
      .pipe(Effect.mapError(mapPlatformError(configPath, "Cannot check file existence")));
    if (!exists) {
      return yield* Effect.fail(
        new DocgenConfigError({
          path: configPath,
          reason: "File does not exist",
        })
      );
    }

    const content = yield* fs
      .readFileString(configPath)
      .pipe(Effect.mapError(mapPlatformError(configPath, "Failed to read file")));

    const parsed = yield* Effect.try({
      try: () => JSON.parse(content) as unknown,
      catch: (e) =>
        new DocgenConfigError({
          path: configPath,
          reason: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        }),
    });

    return yield* S.decodeUnknown(DocgenConfigSchema)(parsed).pipe(
      Effect.mapError(
        (e) =>
          new DocgenConfigError({
            path: configPath,
            reason: `Schema validation failed: ${e.message}`,
          })
      )
    );
  });

/**
 * Check if docgen.json exists in a package directory.
 *
 * @example
 * ```ts
 * import { hasDocgenConfig } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
 * import * as NodePath from "@effect/platform-node/NodePath"
 *
 * const program = Effect.gen(function* () {
 *   const exists = yield* hasDocgenConfig("packages/common/schema")
 *   console.log(exists)
 *   // => true
 * }).pipe(Effect.provide(NodeFileSystem.layer), Effect.provide(NodePath.layer))
 * ```
 *
 * @param packagePath - Absolute path to the package directory
 * @returns true if docgen.json exists, false otherwise
 * @category utilities
 * @since 0.1.0
 */
export const hasDocgenConfig = (
  packagePath: string
): Effect.Effect<boolean, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const configPath = path.join(packagePath, DOCGEN_CONFIG_FILENAME);
    return yield* fs.exists(configPath).pipe(Effect.orElseSucceed(F.constFalse));
  });

/**
 * Find the best tsconfig file in a package directory.
 * Returns the first existing file from TSCONFIG_PRECEDENCE.
 *
 * @example
 * ```ts
 * import { findTsConfig } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
 * import * as NodePath from "@effect/platform-node/NodePath"
 *
 * const program = Effect.gen(function* () {
 *   const tsconfigPath = yield* findTsConfig("packages/common/schema")
 *   console.log(tsconfigPath)
 *   // => "/home/user/project/packages/common/schema/tsconfig.src.json"
 * }).pipe(Effect.provide(NodeFileSystem.layer), Effect.provide(NodePath.layer))
 * ```
 *
 * @param packagePath - Absolute path to the package directory
 * @returns Absolute path to the found tsconfig file
 * @throws TsConfigNotFoundError if no tsconfig file is found
 * @category utilities
 * @since 0.1.0
 */
export const findTsConfig = (
  packagePath: string
): Effect.Effect<string, TsConfigNotFoundError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Check each file in precedence order
    for (const filename of TSCONFIG_PRECEDENCE) {
      const configPath = path.join(packagePath, filename);
      const exists = yield* fs.exists(configPath).pipe(Effect.orElseSucceed(F.constFalse));
      if (exists) {
        return configPath;
      }
    }

    return yield* Effect.fail(
      new TsConfigNotFoundError({
        packagePath,
        searchedFiles: [...TSCONFIG_PRECEDENCE],
      })
    );
  });

/**
 * Write docgen.json to a package directory.
 *
 * @example
 * ```ts
 * import { writeDocgenConfig } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
 * import * as NodePath from "@effect/platform-node/NodePath"
 *
 * const program = Effect.gen(function* () {
 *   yield* writeDocgenConfig("packages/common/schema", {
 *     examplesCompilerOptions: {
 *       paths: {
 *         "@beep/schema": ["./src/index.ts"]
 *       }
 *     }
 *   })
 * }).pipe(Effect.provide(NodeFileSystem.layer), Effect.provide(NodePath.layer))
 * ```
 *
 * @param packagePath - Absolute path to the package directory
 * @param config - DocgenConfig object to write
 * @throws DocgenConfigError if file cannot be written
 * @category utilities
 * @since 0.1.0
 */
export const writeDocgenConfig = (
  packagePath: string,
  config: DocgenConfig
): Effect.Effect<void, DocgenConfigError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const configPath = path.join(packagePath, DOCGEN_CONFIG_FILENAME);

    const content = JSON.stringify(config, null, 2);

    yield* fs.writeFileString(configPath, content).pipe(
      Effect.mapError(
        (e) =>
          new DocgenConfigError({
            path: configPath,
            reason: `Failed to write file: ${e.message}`,
          })
      )
    );
  });

/**
 * Load and parse a tsconfig.json file.
 *
 * @example
 * ```ts
 * import { loadTsConfig } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
 *
 * const program = Effect.gen(function* () {
 *   const tsconfig = yield* loadTsConfig("packages/common/schema/tsconfig.src.json")
 *   console.log(tsconfig)
 * }).pipe(Effect.provide(NodeFileSystem.layer))
 * ```
 *
 * @param tsconfigPath - Absolute path to the tsconfig file
 * @returns Parsed JSON content
 * @throws DocgenConfigError if file cannot be read or parsed
 * @category utilities
 * @since 0.1.0
 */
export const loadTsConfig = (tsconfigPath: string): Effect.Effect<unknown, DocgenConfigError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const content = yield* fs.readFileString(tsconfigPath).pipe(
      Effect.mapError(
        (e) =>
          new DocgenConfigError({
            path: tsconfigPath,
            reason: `Failed to read tsconfig: ${e.message}`,
          })
      )
    );

    // Handle JSON with comments (strip them for parsing)
    const strippedContent = pipe(
      content,
      Str.replace(/\/\/.*$/gm, Str.empty),
      Str.replace(/\/\*[\s\S]*?\*\//g, Str.empty)
    );

    return yield* Effect.try({
      try: () => JSON.parse(strippedContent) as unknown,
      catch: (e) =>
        new DocgenConfigError({
          path: tsconfigPath,
          reason: `Invalid JSON in tsconfig: ${e instanceof Error ? e.message : String(e)}`,
        }),
    });
  });
