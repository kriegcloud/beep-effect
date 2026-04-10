import { fileURLToPath, pathToFileURL } from "node:url";
import { $UtilsId } from "@beep/identity/packages";
import { Context, Effect, Layer, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
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
  readonly glob: (pattern: Pattern, options?: undefined | GlobOptions) => Effect.Effect<Array<string>, GlobError>;
}

/**
 * Service tag for the {@link Glob} capability.
 *
 * @category services
 * @since 0.0.0
 */
export const Glob: Context.Service<Glob, Glob> = Context.Service("@effect/utils/Glob");

type BunGlobScanRoot = {
  cwd?: string | undefined;
  dot?: boolean | undefined;
  onlyFiles?: boolean | undefined;
};

type BunGlobInstance = {
  readonly match: (relativePath: string) => boolean;
  readonly scanSync: (options?: BunGlobScanRoot) => Iterable<string>;
};

type BunGlobConstructor = new (pattern: string) => BunGlobInstance;

type NodeGlobScanRoot = {
  cwd?: string | URL | undefined;
  exclude?: ReadonlyArray<string> | undefined;
  withFileTypes?: false | undefined;
};

const absolutePathPattern = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;

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

const ensureTrailingSeparator = (value: string): string =>
  Str.endsWith("/")(value) || Str.endsWith("\\")(value) ? value : `${value}/`;

const normalizePathSeparators = (value: string): string => Str.replaceAll("\\", "/")(value);

const hasDotSegment = (value: string): boolean =>
  pipe(
    value,
    normalizePathSeparators,
    Str.split("/"),
    A.some((segment) => segment.length > 1 && segment !== ".." && Str.startsWith(".")(segment))
  );

function toPatterns(pattern: Pattern): ReadonlyArray<string> {
  return Match.value(pattern).pipe(
    Match.when(Str.isString, (singlePattern) => [singlePattern]),
    Match.orElse((patterns) => patterns)
  );
}

const toIgnorePatterns = (ignore: undefined | Pattern): ReadonlyArray<string> =>
  ignore === undefined ? [] : toPatterns(ignore);

const toDirectoryUrl = (cwd: string): URL => {
  const normalizedCwd = ensureTrailingSeparator(cwd);

  if (absolutePathPattern.test(normalizedCwd)) {
    return pathToFileURL(normalizedCwd);
  }

  return new URL(normalizedCwd, pathToFileURL(ensureTrailingSeparator(process.cwd())));
};

const toAbsolutePath =
  (cwdUrl: URL) =>
  (relativePath: string): string =>
    fileURLToPath(new URL(normalizePathSeparators(relativePath), cwdUrl));

const getBunGlobConstructor = (): undefined | BunGlobConstructor => {
  const BunGlob = (
    globalThis as typeof globalThis & {
      readonly Bun?: {
        readonly Glob?: BunGlobConstructor;
      };
    }
  ).Bun?.Glob;

  return BunGlob;
};

const compileGlobs = (BunGlob: BunGlobConstructor, patterns: ReadonlyArray<string>): ReadonlyArray<BunGlobInstance> =>
  A.map(patterns, (pattern) => new BunGlob(pattern));

const matchesAny = (globs: ReadonlyArray<BunGlobInstance>, relativePath: string): boolean =>
  pipe(
    globs,
    A.some((glob) => glob.match(relativePath))
  );

const scanWithNodeGlob = async (
  pattern: Pattern,
  options: undefined | GlobOptions,
  cwdUrl: URL,
  toAbsolute: (relativePath: string) => string
): Promise<Array<string>> => {
  const fs = await import("node:fs");
  const scanOptions: NodeGlobScanRoot = {
    cwd: options?.cwd,
    exclude: toIgnorePatterns(options?.ignore),
    withFileTypes: false,
  };

  const relativePaths = pipe(
    fs.globSync(toPatterns(pattern), scanOptions),
    A.fromIterable,
    A.map(normalizePathSeparators),
    A.filter((candidate) => options?.dot === true || !hasDotSegment(candidate)),
    A.filter((candidate) => {
      if (options?.nodir !== true) {
        return true;
      }

      return fs.statSync(new URL(normalizePathSeparators(candidate), cwdUrl)).isFile();
    }),
    A.dedupe,
    A.sort(Order.String)
  );

  return options?.absolute === true
    ? pipe(relativePaths, A.map(toAbsolute), (paths) => [...paths])
    : [...relativePaths];
};

const makeGlob = (pattern: Pattern, options?: undefined | GlobOptions) => {
  const cwdUrl = toDirectoryUrl(options?.cwd ?? ".");
  const toAbsolute = toAbsolutePath(cwdUrl);
  const BunGlob = getBunGlobConstructor();

  if (BunGlob === undefined) {
    return Effect.tryPromise({
      try: () => scanWithNodeGlob(pattern, options, cwdUrl, toAbsolute),
      catch: toGlobError(pattern),
    });
  }

  return Effect.try({
    try: (): Array<string> => {
      const scanOptions: BunGlobScanRoot = {
        dot: options?.dot ?? false,
        onlyFiles: options?.nodir ?? false,
      };

      if (options?.cwd !== undefined) {
        scanOptions.cwd = options.cwd;
      }

      const ignoreGlobs = compileGlobs(BunGlob, toIgnorePatterns(options?.ignore));
      const relativePaths = pipe(
        toPatterns(pattern),
        (patterns) => compileGlobs(BunGlob, patterns),
        A.flatMap((glob) => A.fromIterable(glob.scanSync(scanOptions))),
        A.map(normalizePathSeparators),
        A.filter((candidate) => !matchesAny(ignoreGlobs, candidate)),
        A.dedupe,
        A.sort(Order.String)
      );

      return options?.absolute === true
        ? pipe(relativePaths, A.map(toAbsolute), (paths) => [...paths])
        : [...relativePaths];
    },
    catch: toGlobError(pattern),
  });
};

/**
 * Live `Layer` providing the {@link Glob} service backed by `Bun.Glob` when
 * available and Node's `fs.globSync` otherwise.
 *
 * @category utilities
 * @since 0.0.0
 */
export const layer: Layer.Layer<Glob> = Layer.succeed(Glob, {
  glob: makeGlob,
});
