/**
 * Path safety helpers for clawhole scanner traversal checks.
 *
 * This module centralizes the path containment checks used by the scanner when
 * deciding whether a discovered file or directory should be trusted. The
 * service exposes a lexical path check, an optional canonical `realPath` check,
 * and a helper for recognizing scanner entries that should be skipped outright.
 *
 * @module @beep/clawhole/security/ScanPaths
 * @since 0.0.0
 */

import { $ClawholeId } from "@beep/identity";
import { Effect, FileSystem, Layer, Path, type PlatformError, pipe, Result, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

const $I = $ClawholeId.create("security/ScanPaths");

/**
 * Service contract for path traversal and scanner skip checks.
 *
 * The service separates lightweight lexical comparisons from canonical
 * `realPath` comparisons so callers can choose whether a missing filesystem
 * entry should fail closed or fall back to the lexical result.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface ScanPathsServiceShape {
  /**
   * Detects scanner entries that should be skipped based on a protected path segment.
   *
   * Entries are skipped when any path segment is `node_modules` or a hidden
   * segment such as `.git`.
   *
   * @param entry {string} - The scanner entry path to inspect.
   * @returns {boolean} - `true` when the entry contains a skipped segment.
   */
  readonly extensionUsesSkippedScannerPath: (entry: string) => boolean;
  /**
   * Checks whether a candidate path resolves inside a base path.
   *
   * Supports both direct invocation and the curried `dual` form used across the
   * repo.
   *
   * @param basePath {string} - The allowed parent path.
   * @param candidatePath {string} - The path that should stay within `basePath`.
   * @returns {Effect.Effect<boolean>} - An Effect that succeeds with `true` when the resolved candidate is equal to or nested under the resolved base path.
   */
  readonly isPathInside: {
    (basePath: string, candidatePath: string): Effect.Effect<boolean>;
    (candidatePath: string): (basePath: string) => Effect.Effect<boolean>;
  };

  /**
   * Checks path containment using both lexical resolution and canonical real paths.
   *
   * The lexical containment check runs first. When both `realPath` calls succeed,
   * the service re-checks containment with the canonical paths. When either
   * `realPath` lookup fails, the result falls back to `true` unless
   * `opts.requireRealpath` is explicitly enabled.
   *
   * @param basePath {string} - The allowed parent path.
   * @param candidatePath {string} - The path that should stay within `basePath`.
   * @param opts {{ readonly requireRealpath?: boolean } | undefined} - Optional behavior flags for canonical path enforcement.
   * @returns {Effect.Effect<boolean>} - An Effect that succeeds with whether the candidate remains inside the base path after the configured checks.
   */
  readonly isPathInsideWithRealpath: (
    basePath: string,
    candidatePath: string,
    opts?:
      | undefined
      | {
          readonly requireRealpath?: undefined | boolean;
        }
  ) => Effect.Effect<boolean>;

  /**
   * Resolves a filesystem path to its canonical real path without failing the surrounding Effect.
   *
   * This wraps the filesystem lookup in `Result` so callers can decide whether a
   * missing path should be tolerated.
   *
   * @param filePath {string} - The path to canonicalize.
   * @returns {Effect.Effect<Result.Result<string, PlatformError.PlatformError>>} - An Effect that always succeeds with either the canonical path or the captured platform error.
   */
  readonly safeRealpathSync: (filePath: string) => Effect.Effect<Result.Result<string, PlatformError.PlatformError>>;
}

const serviceEffect = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const isPathInsideWithRealpath = (
    basePath: string,
    candidatePath: string,
    opts?:
      | undefined
      | {
          readonly requireRealpath?: undefined | boolean;
        }
  ) =>
    Effect.gen(function* () {
      if (!(yield* isPathInside(basePath, candidatePath))) {
        return false;
      }

      const baseReal = yield* safeRealpathSync(basePath);
      const candidateReal = yield* safeRealpathSync(candidatePath);

      return yield* pipe(
        Result.all([baseReal, candidateReal]),
        Result.match({
          onFailure: () => {
            return Effect.succeed(opts?.requireRealpath !== true);
          },
          onSuccess: ([baseReal, candidateReal]) => isPathInside(baseReal, candidateReal),
        })
      );
    });

  const safeRealpathSync = (filePath: string) =>
    pipe(
      filePath,
      fs.realPath,
      Effect.result,
      Effect.withSpan("ScanPaths.safeRealpathSync", {
        attributes: {
          filePath,
        },
      })
    );

  const isPathInside: {
    (basePath: string, candidatePath: string): Effect.Effect<boolean>;
    (candidatePath: string): (basePath: string) => Effect.Effect<boolean>;
  } = dual(
    2,
    (basePath: string, candidatePath: string): Effect.Effect<boolean> =>
      Effect.gen(function* () {
        const base = path.resolve(basePath);
        const candidate = path.resolve(candidatePath);
        const rel = path.relative(base, candidate);

        return pipe(
          rel,
          P.or(
            Eq.equals(""),
            P.every([P.not(Str.startsWith(`..${path.sep}`)), P.not(Eq.equals("..")), P.not(path.isAbsolute)])
          )
        );
      }).pipe(
        Effect.withSpan("ScanPaths.serviceEffect", {
          attributes: {
            candidatePath,
            basePath,
          },
        })
      )
  );

  const extensionUsesSkippedScannerPath = (entry: string): boolean =>
    pipe(
      entry,
      Str.split(/[\\/]+/),
      A.filter(Boolean),
      A.some(
        P.or(Eq.equals("node_modules"), P.every([Str.startsWith("."), P.not(Eq.equals(".")), P.not(Eq.equals(".."))]))
      )
    );

  return {
    isPathInside,
    safeRealpathSync,
    isPathInsideWithRealpath,
    extensionUsesSkippedScannerPath,
  };
});

/**
 * Service tag for scan path security helpers.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class ScanPaths extends ServiceMap.Service<ScanPaths, ScanPathsServiceShape>()($I`ScanPaths`) {
  /**
   * Live layer for the {@link ScanPaths} service.
   *
   * @since 0.0.0
   * @category Configuration
   */
  static readonly layer = Layer.effect(ScanPaths, serviceEffect);
}
