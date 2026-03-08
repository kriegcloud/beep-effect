/**
 * Filesystem utility service for common monorepo operations.
 *
 * Provides effectful wrappers around glob matching, JSON file I/O,
 * path existence checks, and file/directory type queries.
 *
 * @since 0.0.0
 * @module
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { Effect, FileSystem, Layer, Path, ServiceMap } from "effect";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { glob as globNpm } from "glob";
import { DomainError, NoSuchFileError } from "./errors/index.js";
import { jsonStringifyPretty } from "./JsonUtils.js";

const $I = $RepoUtilsId.create("FsUtils");
const decodeJsonString = S.decodeUnknownOption(S.fromJsonString(S.Json));

/**
 * Options for glob matching operations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GlobOptions extends S.Class<GlobOptions>($I`GlobOptions`)(
  {
    absolute: S.optionalKey(S.Boolean),
    cwd: S.optionalKey(S.String),
    dot: S.optionalKey(S.Boolean),
    ignore: S.optionalKey(S.Union([S.String, S.Array(S.String)])),
  },
  $I.annote("GlobOptions", {
    description: "Optional glob matching controls used by FsUtils path queries.",
  })
) {}

/**
 * Shape of the FsUtils service.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface FsUtilsShape {
  /**
   * Verify that a path exists on disk, or fail with `NoSuchFileError`.
   *
   * @since 0.0.0
   */
  readonly existsOrThrow: (filePath: string) => Effect.Effect<void, NoSuchFileError>;

  /**
   * Get the parent directory of a path.
   *
   * @since 0.0.0
   */
  readonly getParentDirectory: (filePath: string) => Effect.Effect<string>;
  /**
   * Match files and directories using glob patterns.
   *
   * @since 0.0.0
   */
  readonly glob: (
    pattern: string | ReadonlyArray<string>,
    options?: undefined | GlobOptions
  ) => Effect.Effect<ReadonlyArray<string>, DomainError>;

  /**
   * Match only files (not directories) using glob patterns.
   *
   * @since 0.0.0
   */
  readonly globFiles: (
    pattern: string | ReadonlyArray<string>,
    options?: undefined | GlobOptions
  ) => Effect.Effect<ReadonlyArray<string>, DomainError>;

  /**
   * Check whether a path is a directory.
   *
   * @since 0.0.0
   */
  readonly isDirectory: (filePath: string) => Effect.Effect<boolean, NoSuchFileError>;

  /**
   * Check whether a path is a regular file.
   *
   * @since 0.0.0
   */
  readonly isFile: (filePath: string) => Effect.Effect<boolean, NoSuchFileError>;

  /**
   * Read a file, apply a transform to its content, and write back only if the
   * content actually changed.
   *
   * @since 0.0.0
   */
  readonly modifyFile: (
    filePath: string,
    transform: (content: string) => string
  ) => Effect.Effect<boolean, NoSuchFileError | DomainError>;

  /**
   * Read and parse a JSON file.
   *
   * Returns `Option.none` when the file content is not valid JSON, while
   * missing-file failures remain in the error channel.
   *
   * @since 0.0.0
   */
  readonly readJson: (filePath: string) => Effect.Effect<O.Option<S.Json>, NoSuchFileError>;

  /**
   * Resolve a path to its canonical absolute form.
   *
   * @since 0.0.0
   */
  readonly realPath: (filePath: string) => Effect.Effect<string, NoSuchFileError>;

  /**
   * Write a value as JSON to a file with 2-space indentation and trailing newline.
   *
   * @since 0.0.0
   */
  readonly writeJson: (filePath: string, json: unknown) => Effect.Effect<void, DomainError>;
}

/**
 * Service tag for `FsUtils`.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class FsUtils extends ServiceMap.Service<FsUtils, FsUtilsShape>()($I`FsUtils`) {}

/**
 * Live layer for `FsUtils` that uses the platform `FileSystem` and `Path`
 * services.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const FsUtilsLive: Layer.Layer<FsUtils, never, FileSystem.FileSystem | Path.Path> = Layer.effect(
  FsUtils,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const runGlob: (
      pattern: string | ReadonlyArray<string>,
      options?: undefined | (GlobOptions & { readonly nodir?: undefined | boolean })
    ) => Effect.Effect<ReadonlyArray<string>, DomainError> = Effect.fnUntraced(function* (pattern, options) {
      return yield* Effect.tryPromise({
        try: () => {
          const globOpts: Record<string, unknown> = {
            dot: options?.dot ?? false,
            absolute: options?.absolute ?? false,
            nodir: options?.nodir ?? false,
          };
          if (options?.cwd !== undefined) {
            globOpts.cwd = options.cwd;
          }
          if (options?.ignore !== undefined) {
            globOpts.ignore = options.ignore;
          }
          return globNpm(pattern as string | string[], globOpts) as Promise<string[]>;
        },
        catch: (error) =>
          new DomainError({
            message: `Glob failed for pattern "${String(pattern)}"`,
            cause: error,
          }),
      });
    });

    const globFiles: FsUtilsShape["globFiles"] = Effect.fnUntraced(function* (pattern, options) {
      return yield* runGlob(pattern, { ...options, nodir: true });
    });

    const readJson: FsUtilsShape["readJson"] = Effect.fn(function* (filePath) {
      return yield* fs.readFileString(filePath).pipe(
        Effect.mapError(
          (e) =>
            new NoSuchFileError({
              path: filePath,
              message: `Failed to read file: ${e.message}`,
            })
        ),
        Effect.map(decodeJsonString)
      );
    });

    const writeJson: FsUtilsShape["writeJson"] = Effect.fn(function* (filePath, json) {
      const content = yield* jsonStringifyPretty(json);
      yield* fs.writeFileString(filePath, `${content}\n`).pipe(
        Effect.mapError(
          (e) =>
            new DomainError({
              message: `Failed to write JSON to "${filePath}"`,
              cause: e,
            })
        )
      );
    });

    const modifyFile: FsUtilsShape["modifyFile"] = Effect.fn(function* (filePath, transform) {
      const original = yield* fs.readFileString(filePath).pipe(
        Effect.mapError(
          (e) =>
            new NoSuchFileError({
              path: filePath,
              message: `Failed to read file for modification: ${e.message}`,
            })
        )
      );
      const transformed = transform(original);
      if (transformed === original) {
        return false;
      }
      yield* fs.writeFileString(filePath, transformed).pipe(
        Effect.mapError(
          (e) =>
            new DomainError({
              message: `Failed to write modified file "${filePath}"`,
              cause: e,
            })
        )
      );
      return true;
    });

    const realPath: FsUtilsShape["realPath"] = Effect.fn(function* (filePath) {
      return yield* fs.realPath(filePath).pipe(
        Effect.mapError(
          (e) =>
            new NoSuchFileError({
              path: filePath,
              message: `Failed to resolve canonical path for "${filePath}": ${e.message}`,
            })
        )
      );
    });

    const existsOrThrow: FsUtilsShape["existsOrThrow"] = Effect.fn(function* (filePath) {
      const exists = yield* fs.exists(filePath).pipe(
        Effect.mapError(
          () =>
            new NoSuchFileError({
              path: filePath,
              message: `Unable to check existence of "${filePath}"`,
            })
        )
      );
      if (!exists) {
        return yield* new NoSuchFileError({
          path: filePath,
          message: `Path does not exist: "${filePath}"`,
        });
      }
    });

    const statOrFail: (filePath: string) => Effect.Effect<FileSystem.File.Info, NoSuchFileError> = Effect.fnUntraced(
      function* (filePath) {
        return yield* fs.stat(filePath).pipe(
          Effect.mapError(
            () =>
              new NoSuchFileError({
                path: filePath,
                message: `Failed to stat "${filePath}"`,
              })
          )
        );
      }
    );

    const isDirectory: FsUtilsShape["isDirectory"] = Effect.fnUntraced(function* (filePath) {
      const info = yield* statOrFail(filePath);
      return info.type === "Directory";
    });

    const isFile: FsUtilsShape["isFile"] = Effect.fnUntraced(function* (filePath) {
      const info = yield* statOrFail(filePath);
      return info.type === "File";
    });

    const getParentDirectory: FsUtilsShape["getParentDirectory"] = Effect.fnUntraced(function* (filePath) {
      yield* Effect.void;
      return path.dirname(filePath);
    });

    return FsUtils.of({
      glob: runGlob,
      globFiles,
      readJson,
      writeJson,
      modifyFile,
      realPath,
      existsOrThrow,
      isDirectory,
      isFile,
      getParentDirectory,
    });
  })
);
// bench
