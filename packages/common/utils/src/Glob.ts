import { $UtilsId } from "@beep/identity/packages";
import { Context, Effect, FileSystem, Layer, Match, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import picomatch from "picomatch";
import { thunk } from "./thunk.ts";

const $I = $UtilsId.create("Glob");

/**
 * Schema for a glob pattern: either a single string or an array of strings.
 *
 * @category utilities
 * @since 0.0.0
 */
export const Pattern = S.Union([S.String, S.Array(S.String)]);

/**
 * A glob pattern: either a single string or an array of strings.
 *
 * @category models
 * @since 0.0.0
 */
export type Pattern = typeof Pattern.Type;

/**
 * Optional runtime flags for glob scans.
 *
 * @example
 * ```ts
 * import { GlobOptions } from "@beep/utils/Glob"
 *
 * const opts = new GlobOptions({ absolute: true, dot: true })
 * void opts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GlobOptions extends S.Class<GlobOptions>($I`GlobOptions`)(
  {
    absolute: S.optionalKey(S.Boolean),
    cwd: S.optionalKey(S.String),
    dot: S.optionalKey(S.Boolean),
    ignore: S.optionalKey(Pattern),
    nodir: S.optionalKey(S.Boolean),
  },
  $I.annote("GlobOptions", {
    description: "Optional runtime flags for glob scans.",
  })
) {}

/**
 * Namespace for the encoded form of {@link GlobError}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace GlobError {
  /**
   * Encoded shape of {@link GlobError}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof GlobError.Encoded;
}

/**
 * An error raised when glob pattern matching fails.
 *
 * Carries the offending `pattern` and an optional `cause` with stack trace.
 *
 * @category models
 * @since 0.0.0
 */
export class GlobError extends S.TaggedErrorClass<GlobError>($I`GlobError`)(
  "GlobError",
  {
    pattern: Pattern,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("GlobError", {
    description: "An error that occurs during glob pattern matching",
  })
) {
  static readonly new = (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]) =>
    new GlobError({ pattern, cause });
  static readonly newThunk = (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]) =>
    thunk(new GlobError({ pattern, cause }));
}

/**
 * Service interface for performing glob-based file matching.
 *
 * Provides a single `glob` method that resolves glob patterns against the
 * file system and returns the matched paths.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Glob } from "@beep/utils/Glob"
 *
 * const program = Effect.gen(function* () {
 *   const glob = yield* Glob
 *   return yield* glob.glob("src/**\\/*.ts")
 * })
 *
 * void program
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface Glob {
  readonly glob: ReturnType<typeof makeGlob>;
}

/**
 * Service tag for the {@link Glob} capability.
 *
 * @category services
 * @since 0.0.0
 */
export const Glob: Context.Service<Glob, Glob> = Context.Service("@effect/utils/Glob");

type GlobMatcher = (relativePath: string) => boolean;
type GlobWalkEntries = Array<readonly [relativePath: string, isFile: boolean]>;

function toGlobError(pattern: Pattern): (cause: unknown) => GlobError {
  return (cause: unknown): GlobError =>
    Match.value(cause).pipe(
      Match.when(S.is(GlobError), (error) => error),
      Match.orElse(
        (error) =>
          new GlobError({
            pattern,
            cause: S.decodeUnknownOption(S.DefectWithStack)(error),
          })
      )
    );
}

function ensureTrailingSeparator(value: string): string {
  return Match.value(Str.endsWith("/")(value) || Str.endsWith("\\")(value)).pipe(
    Match.when(true, () => value),
    Match.orElse(() => `${value}/`)
  );
}

function normalizePathSeparators(value: string): string {
  return Str.replaceAll("\\", "/")(value);
}

function hasDotSegment(value: string): boolean {
  return pipe(
    value,
    normalizePathSeparators,
    Str.split("/"),
    A.some((segment) => segment.length > 1 && segment !== ".." && Str.startsWith(".")(segment))
  );
}

function toPatterns(pattern: Pattern): ReadonlyArray<string> {
  return Match.value(pattern).pipe(
    Match.when(Str.isString, (singlePattern) => [singlePattern]),
    Match.orElse((patterns) => patterns)
  );
}

function toIgnorePatterns(ignore: undefined | Pattern): ReadonlyArray<string> {
  return Match.value(ignore).pipe(
    Match.when(
      (value: undefined | Pattern): value is undefined => value === undefined,
      () => A.empty<string>()
    ),
    Match.orElse(toPatterns)
  );
}

function toDirectoryPath(path: Path.Path, cwd: string): string {
  const normalizedCwd = ensureTrailingSeparator(cwd);

  return Match.value(path.isAbsolute(normalizedCwd)).pipe(
    Match.when(true, () => path.normalize(normalizedCwd)),
    Match.orElse(() => path.resolve(process.cwd(), normalizedCwd))
  );
}

function toAbsolutePath(path: Path.Path, cwdPath: string) {
  return (relativePath: string): string => path.normalize(path.join(cwdPath, relativePath));
}

function matchesAny(globs: ReadonlyArray<GlobMatcher>, relativePath: string): boolean {
  return pipe(
    globs,
    A.some((glob) => glob(relativePath))
  );
}

function toEntryRelativePath(path: Path.Path, relativeDir: string, entryName: string): string {
  const relativePath = Match.value(relativeDir.length === 0).pipe(
    Match.when(true, () => entryName),
    Match.orElse(() => path.join(relativeDir, entryName))
  );

  return normalizePathSeparators(relativePath);
}

const scanCandidates = Effect.fnUntraced(function* (fs: FileSystem.FileSystem, path: Path.Path, cwdPath: string) {
  const directories = A.make("");
  const discovered: GlobWalkEntries = [];

  while (directories.length > 0) {
    const relativeDir = directories.pop()!;
    const absoluteDir = Match.value(relativeDir.length === 0).pipe(
      Match.when(true, () => cwdPath),
      Match.orElse(() => path.join(cwdPath, relativeDir))
    );
    const entryNames = yield* fs.readDirectory(absoluteDir);

    for (const entryName of entryNames) {
      const relativePath = toEntryRelativePath(path, relativeDir, entryName);
      const absolutePath = path.join(absoluteDir, entryName);
      const info = yield* fs.stat(absolutePath);

      switch (info.type) {
        case "Directory":
          discovered.push([relativePath, false] as const);
          directories.push(relativePath);
          break;
        default:
          discovered.push([relativePath, info.type === "File"] as const);
      }
    }
  }

  return discovered;
});

function collectRelativePaths(
  candidates: Array<readonly [candidate: string, isFile: boolean]>,
  includeMatchers: ReadonlyArray<GlobMatcher>,
  ignoreMatchers: ReadonlyArray<GlobMatcher>,
  options: undefined | GlobOptions
) {
  const visibleCandidates = A.filter(candidates, ([candidate]) => options?.dot === true || !hasDotSegment(candidate));
  const filteredCandidates = A.filter(visibleCandidates, ([candidate]) => !matchesAny(ignoreMatchers, candidate));
  const fileCandidates = A.filter(filteredCandidates, ([, isFile]) => options?.nodir !== true || isFile);
  const matchedCandidates = A.filter(fileCandidates, ([candidate]) => matchesAny(includeMatchers, candidate));
  const candidatePaths = A.map(matchedCandidates, ([candidate]) => candidate);
  const dedupedPaths = A.dedupe(candidatePaths);

  return A.sort(dedupedPaths, Order.String);
}

function toOutputPaths(
  relativePaths: Array<string>,
  options: undefined | GlobOptions,
  toAbsolute: (relativePath: string) => string
) {
  return Match.value(options?.absolute === true).pipe(
    Match.when(true, () => A.map(relativePaths, toAbsolute)),
    Match.orElse(() => [...relativePaths])
  );
}

const makeGlob = (fs: FileSystem.FileSystem, path: Path.Path) => {
  return (pattern: Pattern, options?: undefined | GlobOptions) => {
    const cwdPath = toDirectoryPath(path, options?.cwd ?? ".");
    const toAbsolute = toAbsolutePath(path, cwdPath);

    return pipe(
      Effect.gen(function* () {
        const includeMatchers = yield* Effect.all(
          A.map(toPatterns(pattern), (currentPattern) =>
            Effect.try({
              try: () => picomatch(currentPattern, { dot: options?.dot ?? false }),
              catch: toGlobError(pattern),
            })
          )
        );
        const ignoreMatchers = yield* Effect.all(
          A.map(toIgnorePatterns(options?.ignore), (currentPattern) =>
            Effect.try({
              try: () => picomatch(currentPattern, { dot: options?.dot ?? false }),
              catch: toGlobError(pattern),
            })
          )
        );
        const candidates = yield* scanCandidates(fs, path, cwdPath);
        const relativePaths = collectRelativePaths(candidates, includeMatchers, ignoreMatchers, options);

        return toOutputPaths(relativePaths, options, toAbsolute);
      }),
      Effect.mapError(toGlobError(pattern))
    );
  };
};

/**
 * Live `Layer` providing the {@link Glob} service backed by `picomatch` plus
 * Effect `FileSystem` and `Path` services.
 *
 * @category utilities
 * @since 0.0.0
 */
export const layer = Layer.effect(
  Glob,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    return {
      glob: makeGlob(fs, path),
    };
  })
);
