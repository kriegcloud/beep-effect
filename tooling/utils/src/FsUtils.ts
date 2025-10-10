import { DomainError } from "@beep/tooling-utils/repo/Errors";
import type { UnsafeTypes } from "@beep/types";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Bool from "effect/Boolean";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Glob from "glob";

/**
 * Internal constructor for the FsUtils service.
 *
 * Exposes convenient, Effect-based filesystem and glob helpers with
 * observability spans and sensible error messages. All functions are
 * pure wrappers that defer side-effects to the provided FileSystem and Path
 * services.
 */
const make = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;

  /**
   * Match files and directories against a glob pattern.
   *
   * Wraps `glob.glob` in Effect with an attached span.
   *
   * @param pattern A glob pattern or patterns
   * @param options Glob options
   * @returns Effect that resolves to all matches
   */
  const glob = (pattern: string | ReadonlyArray<string>, options?: Glob.GlobOptions) =>
    Effect.tryPromise({
      try: () => Glob.glob(pattern as UnsafeTypes.UnsafeAny, options as UnsafeTypes.UnsafeAny),
      catch: (e) => new Error(`glob failed: ${e}`),
    }).pipe(Effect.withSpan("FsUtils.glob"));

  /**
   * Like {@link glob} but ensures only files (no directories) are returned.
   */
  const globFiles = (pattern: string | ReadonlyArray<string>, options: Glob.GlobOptions = {}) =>
    glob(pattern, { ...options, nodir: true });

  /**
   * Modify a single file in-place.
   *
   * Reads the file as string, applies the provided transform, and writes
   * back only if the content changed.
   *
   * @param path File path
   * @param f Transform function receiving original content and path
   */
  const modifyFile = (path: string, f: (s: string, path: string) => string) =>
    fs.readFileString(path).pipe(
      Effect.bindTo("original"),
      Effect.let("modified", ({ original }) => f(original, path)),
      Effect.flatMap(({ modified, original }) =>
        original === modified ? Effect.void : fs.writeFile(path, new TextEncoder().encode(modified))
      ),
      Effect.withSpan("FsUtils.modifyFile", { attributes: { path } })
    );

  /**
   * Apply a textual transform to all files matching the glob pattern.
   *
   * @param pattern Glob pattern(s)
   * @param f Transform function
   * @param options Optional glob options
   */
  const modifyGlob = (
    pattern: string | ReadonlyArray<string>,
    f: (s: string, path: string) => string,
    options?: Glob.GlobOptions
  ) =>
    globFiles(pattern, options).pipe(
      Effect.flatMap((paths) =>
        Effect.forEach(paths, (path) => modifyFile(path, f), {
          concurrency: "inherit",
          discard: true,
        })
      ),
      Effect.withSpan("FsUtils.modifyGlob", { attributes: { pattern } })
    );

  /**
   * Remove a target path (if it exists) and copy a directory or file tree.
   *
   * @param from Source path
   * @param to Destination path
   */
  const rmAndCopy = (from: string, to: string) =>
    fs
      .remove(to, { recursive: true })
      .pipe(
        Effect.ignore,
        Effect.zipRight(fs.copy(from, to)),
        Effect.withSpan("FsUtils.rmAndCopy", { attributes: { from, to } })
      );

  /**
   * Copy path if it exists, otherwise no-op.
   *
   * @param from Source path
   * @param to Destination path
   */
  const copyIfExists = (from: string, to: string) =>
    fs.access(from).pipe(
      Effect.zipRight(Effect.ignore(fs.remove(to, { recursive: true }))),
      Effect.zipRight(fs.copy(from, to)),
      Effect.catchTag("SystemError", (e) => (e.reason === "NotFound" ? Effect.void : Effect.fail(e))),
      Effect.withSpan("FsUtils.copyIfExists", { attributes: { from, to } })
    );

  /**
   * Create a directory path recursively, caching the effect so repeated calls
   * for the same path become no-ops.
   */
  const mkdirCached_ = yield* Effect.cachedFunction((path: string) =>
    fs.makeDirectory(path, { recursive: true }).pipe(Effect.withSpan("FsUtils.mkdirCached", { attributes: { path } }))
  );

  /**
   * Create a directory path recursively. Accepts relative paths and resolves
   * them to absolute using the current platform Path service.
   */
  const mkdirCached = (path: string) => mkdirCached_(path_.resolve(path));

  /**
   * Copy all files matching a glob pattern under baseDir into a destination
   * directory, preserving relative structure. Ensures parent directories are
   * created using {@link mkdirCached}.
   */
  const copyGlobCached = (baseDir: string, pattern: string, to: string) =>
    globFiles(path_.join(baseDir, pattern)).pipe(
      Effect.flatMap(
        Effect.forEach(
          (path) => {
            const dest = path_.join(to, path_.relative(baseDir, path));
            const destDir = path_.dirname(dest);
            return mkdirCached(destDir).pipe(Effect.zipRight(fs.copyFile(path, dest)));
          },
          { concurrency: "inherit", discard: true }
        )
      ),
      Effect.withSpan("FsUtils.copyGlobCached", {
        attributes: { baseDir, pattern, to },
      })
    );

  /**
   * Remove a path and then re-create it as an empty directory.
   *
   * @param path Directory to recreate
   */
  const rmAndMkdir = (path: string) =>
    fs
      .remove(path, { recursive: true })
      .pipe(
        Effect.ignore,
        Effect.zipRight(mkdirCached(path)),
        Effect.withSpan("FsUtils.rmAndMkdir", { attributes: { path } })
      );
  /**
   * Verify if a path exists in the files system. If not throw a domain error. else return the path
   *
   */
  const existsOrThrow = Effect.fn("existsOrThrow")(function* (path: string) {
    return yield* Effect.flatMap(
      fs.exists(path),
      F.pipe(
        Bool.match({
          onTrue: () => Effect.succeed(path),
          onFalse: () =>
            new DomainError({
              message: `Path ${path} does not exist`,
            }),
        })
      )
    );
  });

  /**
   * Read a JSON file and parse it, mapping parsing errors into a friendly Error.
   *
   * @param path JSON file path
   */
  const readJson = (path: string) =>
    Effect.tryMap(fs.readFileString(path), {
      try: (_) => JSON.parse(_),
      catch: (e) => new Error(`readJson failed (${path}): ${e}`),
    });

  /**
   * Write a JSON value with stable formatting and trailing newline.
   *
   * @param path Output file path
   * @param json JSON-serializable value
   */
  const writeJson = (path: string, json: unknown) =>
    fs.writeFileString(
      path,
      `${JSON.stringify(json, null, 2)}
`
    );

  return {
    glob,
    globFiles,
    modifyFile,
    modifyGlob,
    copyIfExists,
    rmAndMkdir,
    rmAndCopy,
    mkdirCached,
    copyGlobCached,
    readJson,
    writeJson,
    existsOrThrow,
  } as const;
});

/**
 * Public interface of the FsUtils service. Prefer to depend on this tag in
 * your Effects and provide {@link FsUtilsLive} at the edges.
 */
export interface FsUtils extends Effect.Effect.Success<typeof make> {}

/**
 * Service tag for dependency injection via Effect Context.
 *
 * Usage:
 * ```ts
 * import { FsUtils } from "@beep/tooling-utils";
 * const utils = yield* FsUtils; // inside Effect.gen
 * ```
 */
export const FsUtils = Context.GenericTag<FsUtils>("@beep/tooling-utils/FsUtils");

/**
 * Live Layer implementation backed by Node's FileSystem/Path.
 * Compose into your runtime or test layers as needed.
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/tooling-utils";
 * import * as Effect from "effect/Effect";
 * const stuff = Effect.gen(function* () {
 *  const utils = yield* FsUtilsLive;
 * }).pipe(Effect.provide(FsUtilsLive));
 * ```
 */
export const FsUtilsLive = Layer.effect(FsUtils, make).pipe(
  Layer.provide(BunFileSystem.layer),
  Layer.provide(BunPath.layerPosix)
);
