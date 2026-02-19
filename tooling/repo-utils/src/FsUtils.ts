/**
 * Filesystem utility service for common monorepo operations.
 *
 * Provides effectful wrappers around glob matching, JSON file I/O,
 * path existence checks, and file/directory type queries.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, FileSystem, Path } from "effect"
import * as Layer from "effect/Layer"
import * as ServiceMap from "effect/ServiceMap"
import { glob as globNpm } from "glob"
import { DomainError, NoSuchFileError } from "./errors/index.js"

/**
 * Options for glob matching operations.
 *
 * @since 0.0.0
 * @category models
 */
export interface GlobOptions {
  /** The working directory for the glob pattern. Defaults to `process.cwd()`. */
  readonly cwd?: string | undefined
  /** Include dotfiles in results. Defaults to `false`. */
  readonly dot?: boolean | undefined
  /** Glob patterns to exclude from results. */
  readonly ignore?: string | string[] | undefined
  /** Return absolute paths. Defaults to `false`. */
  readonly absolute?: boolean | undefined
}

/**
 * Shape of the FsUtils service.
 *
 * @since 0.0.0
 * @category models
 */
export interface FsUtilsShape {
  /**
   * Match files and directories using glob patterns.
   *
   * @since 0.0.0
   */
  readonly glob: (
    pattern: string | ReadonlyArray<string>,
    options?: GlobOptions
  ) => Effect.Effect<ReadonlyArray<string>, DomainError>

  /**
   * Match only files (not directories) using glob patterns.
   *
   * @since 0.0.0
   */
  readonly globFiles: (
    pattern: string | ReadonlyArray<string>,
    options?: GlobOptions
  ) => Effect.Effect<ReadonlyArray<string>, DomainError>

  /**
   * Read and parse a JSON file.
   *
   * @since 0.0.0
   */
  readonly readJson: (
    filePath: string
  ) => Effect.Effect<unknown, NoSuchFileError | DomainError>

  /**
   * Write a value as JSON to a file with 2-space indentation and trailing newline.
   *
   * @since 0.0.0
   */
  readonly writeJson: (
    filePath: string,
    json: unknown
  ) => Effect.Effect<void, DomainError>

  /**
   * Read a file, apply a transform to its content, and write back only if the
   * content actually changed.
   *
   * @since 0.0.0
   */
  readonly modifyFile: (
    filePath: string,
    transform: (content: string) => string
  ) => Effect.Effect<boolean, NoSuchFileError | DomainError>

  /**
   * Verify that a path exists on disk, or fail with `NoSuchFileError`.
   *
   * @since 0.0.0
   */
  readonly existsOrThrow: (
    filePath: string
  ) => Effect.Effect<void, NoSuchFileError>

  /**
   * Check whether a path is a directory.
   *
   * @since 0.0.0
   */
  readonly isDirectory: (
    filePath: string
  ) => Effect.Effect<boolean, NoSuchFileError>

  /**
   * Check whether a path is a regular file.
   *
   * @since 0.0.0
   */
  readonly isFile: (
    filePath: string
  ) => Effect.Effect<boolean, NoSuchFileError>

  /**
   * Get the parent directory of a path.
   *
   * @since 0.0.0
   */
  readonly getParentDirectory: (
    filePath: string
  ) => Effect.Effect<string>
}

/**
 * Service tag for `FsUtils`.
 *
 * @since 0.0.0
 * @category services
 */
export class FsUtils extends ServiceMap.Service<FsUtils, FsUtilsShape>()(
  "@beep/repo-utils/FsUtils"
) {}

/**
 * Live layer for `FsUtils` that uses the platform `FileSystem` and `Path`
 * services.
 *
 * @since 0.0.0
 * @category layers
 */
export const FsUtilsLive: Layer.Layer<FsUtils, never, FileSystem.FileSystem | Path.Path> =
  Layer.effect(
    FsUtils,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path

      const runGlob = (
        pattern: string | ReadonlyArray<string>,
        options?: GlobOptions & { readonly nodir?: boolean }
      ): Effect.Effect<ReadonlyArray<string>, DomainError> =>
        Effect.tryPromise({
          try: () => {
            const globOpts: Record<string, unknown> = {
              dot: options?.dot ?? false,
              absolute: options?.absolute ?? false,
              nodir: options?.nodir ?? false,
            }
            if (options?.cwd !== undefined) {
              globOpts.cwd = options.cwd
            }
            if (options?.ignore !== undefined) {
              globOpts.ignore = options.ignore
            }
            return globNpm(
              pattern as string | string[],
              globOpts
            ) as Promise<string[]>
          },
          catch: (error) =>
            new DomainError({
              message: `Glob failed for pattern "${String(pattern)}"`,
              cause: error,
            }),
        })

      const readJson: FsUtilsShape["readJson"] = (filePath) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(filePath).pipe(
            Effect.mapError(
              (e) =>
                new NoSuchFileError({
                  path: filePath,
                  message: `Failed to read file: ${e.message}`,
                })
            )
          )
          return yield* Effect.try({
            try: () => JSON.parse(content) as unknown,
            catch: (error) =>
              new DomainError({
                message: `Failed to parse JSON at "${filePath}"`,
                cause: error,
              }),
          })
        })

      const writeJson: FsUtilsShape["writeJson"] = (filePath, json) =>
        fs
          .writeFileString(filePath, JSON.stringify(json, null, 2) + "\n")
          .pipe(
            Effect.mapError(
              (e) =>
                new DomainError({
                  message: `Failed to write JSON to "${filePath}"`,
                  cause: e,
                })
            )
          )

      const modifyFile: FsUtilsShape["modifyFile"] = (filePath, transform) =>
        Effect.gen(function* () {
          const original = yield* fs.readFileString(filePath).pipe(
            Effect.mapError(
              (e) =>
                new NoSuchFileError({
                  path: filePath,
                  message: `Failed to read file for modification: ${e.message}`,
                })
            )
          )
          const transformed = transform(original)
          if (transformed === original) {
            return false
          }
          yield* fs.writeFileString(filePath, transformed).pipe(
            Effect.mapError(
              (e) =>
                new DomainError({
                  message: `Failed to write modified file "${filePath}"`,
                  cause: e,
                })
            )
          )
          return true
        })

      const existsOrThrow: FsUtilsShape["existsOrThrow"] = (filePath) =>
        Effect.gen(function* () {
          const exists = yield* fs.exists(filePath).pipe(
            Effect.mapError(
              () =>
                new NoSuchFileError({
                  path: filePath,
                  message: `Unable to check existence of "${filePath}"`,
                })
            )
          )
          if (!exists) {
            return yield* Effect.fail(
              new NoSuchFileError({
                path: filePath,
                message: `Path does not exist: "${filePath}"`,
              })
            )
          }
        })

      const statOrFail = (filePath: string) =>
        fs.stat(filePath).pipe(
          Effect.mapError(
            () =>
              new NoSuchFileError({
                path: filePath,
                message: `Failed to stat "${filePath}"`,
              })
          )
        )

      const isDirectory: FsUtilsShape["isDirectory"] = (filePath) =>
        statOrFail(filePath).pipe(Effect.map((info) => info.type === "Directory"))

      const isFile: FsUtilsShape["isFile"] = (filePath) =>
        statOrFail(filePath).pipe(Effect.map((info) => info.type === "File"))

      const getParentDirectory: FsUtilsShape["getParentDirectory"] = (filePath) =>
        Effect.succeed(path.dirname(filePath))

      return FsUtils.of({
        glob: (pattern, options) => runGlob(pattern, options),
        globFiles: (pattern, options) =>
          runGlob(pattern, { ...options, nodir: true }),
        readJson,
        writeJson,
        modifyFile,
        existsOrThrow,
        isDirectory,
        isFile,
        getParentDirectory,
      })
    })
  )
