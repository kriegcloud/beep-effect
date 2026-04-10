import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { $UtilsId } from "@beep/identity/packages";
import { Context, Effect, Layer, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import picomatch from "picomatch";
import * as Thunk from "./internal/Thunk.ts";

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
 * Optional runtime flags for Bun.Glob scans.
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
    description: "Optional runtime flags for Bun.Glob scans.",
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
    Thunk.make(new GlobError({ pattern, cause }));
}

const makeGlob = (pattern: Pattern, options?: undefined | GlobOptions) => {
  const cwdUrl = toDirectoryUrl(options?.cwd ?? ".");
  const toAbsolute = toAbsolutePath(cwdUrl);

  return Effect.tryPromise({
    try: () => scanWithNodeGlob(pattern, options, cwdUrl, toAbsolute),
    catch: (cause) => new GlobError({ pattern, cause: S.decodeUnknownOption(S.DefectWithStack)(cause) }),
  });
};

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
  readonly glob: typeof makeGlob;
}

/**
 * Service tag for the {@link Glob} capability.
 *
 * @category services
 * @since 0.0.0
 */
export const Glob: Context.Service<Glob, Glob> = Context.Service("@effect/utils/Glob");

type GlobMatcher = (relativePath: string) => boolean;

const absolutePathPattern = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;

const ensureTrailingSeparator = (value: string): string =>
  Match.value(Str.endsWith("/")(value) || Str.endsWith("\\")(value)).pipe(
    Match.when(true, () => value),
    Match.orElse(() => `${value}/`)
  );

const normalizePathSeparators = (value: string): string => Str.replaceAll("\\", "/")(value);

const hasDotSegment = (value: string): boolean =>
  pipe(
    value,
    normalizePathSeparators,
    Str.split("/"),
    A.some((segment) => segment.length > 1 && segment !== ".." && Str.startsWith(".")(segment))
  );

const toPatterns = (pattern: Pattern): ReadonlyArray<string> => (P.isString(pattern) ? [pattern] : pattern);

const toIgnorePatterns = (ignore: undefined | Pattern): ReadonlyArray<string> =>
  ignore === undefined ? [] : toPatterns(ignore);

const toDirectoryUrl = (cwd: string): URL => {
  const normalizedCwd = ensureTrailingSeparator(cwd);

  return Match.value(absolutePathPattern.test(normalizedCwd)).pipe(
    Match.when(true, () => pathToFileURL(normalizedCwd)),
    Match.orElse(() => new URL(normalizedCwd, pathToFileURL(ensureTrailingSeparator(process.cwd()))))
  );
};

const toAbsolutePath =
  (cwdUrl: URL) =>
  (relativePath: string): string =>
    fileURLToPath(new URL(normalizePathSeparators(relativePath), cwdUrl));

const compileMatchers = (
  patterns: ReadonlyArray<string>,
  options: undefined | GlobOptions
): ReadonlyArray<GlobMatcher> => A.map(patterns, (pattern) => picomatch(pattern, { dot: options?.dot ?? false }));

const matchesAny = (globs: ReadonlyArray<GlobMatcher>, relativePath: string): boolean =>
  pipe(
    globs,
    A.some((glob) => glob(relativePath))
  );

const scanWithNodeGlob = async (
  pattern: Pattern,
  options: undefined | GlobOptions,
  cwdUrl: URL,
  toAbsolute: (relativePath: string) => string
): Promise<Array<string>> => {
  const cwdPath = fileURLToPath(cwdUrl);
  const includeMatchers = compileMatchers(toPatterns(pattern), options);
  const ignoreMatchers = compileMatchers(toIgnorePatterns(options?.ignore), options);

  const walk = (relativeDir = ""): ReadonlyArray<readonly [relativePath: string, isFile: boolean]> => {
    const absoluteDir =
      relativeDir.length === 0 ? cwdPath : fileURLToPath(new URL(ensureTrailingSeparator(relativeDir), cwdUrl));
    const entries = readdirSync(absoluteDir, { withFileTypes: true });

    return A.flatMap(entries, (entry) => {
      const relativePath = normalizePathSeparators(
        relativeDir.length === 0 ? entry.name : `${relativeDir}/${entry.name}`
      );
      const isFile = entry.isFile();

      return Match.value(entry.isDirectory()).pipe(
        Match.when(true, () => [[relativePath, false] as const, ...walk(relativePath)]),
        Match.orElse(() => [[relativePath, isFile] as const])
      );
    });
  };

  const relativePaths = pipe(
    walk(),
    A.filter(([candidate]) => options?.dot === true || !hasDotSegment(candidate)),
    A.filter(([candidate]) => !matchesAny(ignoreMatchers, candidate)),
    A.filter(([, isFile]) => options?.nodir !== true || isFile),
    A.filter(([candidate]) => matchesAny(includeMatchers, candidate)),
    A.map(([candidate]) => candidate),
    A.dedupe,
    A.sort(Order.String)
  );

  if (options?.absolute === true) {
    return A.map(relativePaths, toAbsolute);
  }

  return [...relativePaths];
};

/**
 * Live `Layer` providing the {@link Glob} service backed by `picomatch` and
 * Node.js `fs.readdirSync`.
 *
 * @category utilities
 * @since 0.0.0
 */
export const layer: Layer.Layer<Glob> = Layer.succeed(Glob, {
  glob: makeGlob,
});
