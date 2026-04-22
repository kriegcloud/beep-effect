/**
 * Glob pattern schemas and file matching service helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { fileURLToPath, pathToFileURL } from "node:url";
import { $UtilsId } from "@beep/identity/packages";
import { Context, Effect, Layer, Match, Order, pipe } from "effect";
import { dual } from "effect/Function";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import picomatch from "picomatch";
import { thunk } from "./thunk.ts";

const $I = $UtilsId.create("Glob");

/**
 * Schema for a glob pattern: either a single string or an array of strings.
 *
 * @example
 * ```ts
 * import { Pattern } from "@beep/utils/Glob"
 *
 * const schema = Pattern
 * void schema
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const Pattern = S.Union([S.String, S.Array(S.String)]);

/**
 * A glob pattern: either a single string or an array of strings.
 *
 * @example
 * ```ts
 * import type { Pattern } from "@beep/utils/Glob"
 *
 * const pattern: Pattern = ["src/*.ts", "test/*.ts"]
 * void pattern
 * ```
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
 * @example
 * ```ts
 * import { GlobError } from "@beep/utils/Glob"
 *
 * const pattern = (value: GlobError.Encoded) => value.pattern
 * void pattern
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace GlobError {
  /**
   * Encoded shape of {@link GlobError}.
   *
   * @example
   * ```ts
   * import { GlobError } from "@beep/utils/Glob"
   *
   * const pattern = (value: GlobError.Encoded) => value.pattern
   * void pattern
   * ```
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
 * @example
 * ```ts
 * import { GlobError } from "@beep/utils/Glob"
 *
 * const error = GlobError.new("src/*.ts", undefined)
 * void error
 * ```
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
  static readonly new: {
    (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]): GlobError;
    (pattern: GlobError.Encoded["pattern"]): (cause: GlobError.Encoded["cause"]) => GlobError;
  } = dual(2, (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]) => new GlobError({ pattern, cause }));
  static readonly newThunk: {
    (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]): () => GlobError;
    (pattern: GlobError.Encoded["pattern"]): (cause: GlobError.Encoded["cause"]) => () => GlobError;
  } = dual(2, (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]) =>
    thunk(new GlobError({ pattern, cause }))
  );
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
 *   const service = yield* Glob
 *   return yield* service.glob("src/*.ts")
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
 * @example
 * ```ts
 * import { Glob } from "@beep/utils/Glob"
 *
 * const tag = Glob
 * void tag
 * ```
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

type NodeGlobEntry = {
  readonly isDirectory: boolean;
  readonly relativePath: string;
};

type PatternMatcher = (relativePath: string, isDirectory: boolean) => boolean;

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

const compileIncludedPatterns = (patterns: ReadonlyArray<string>): ReadonlyArray<PatternMatcher> =>
  pipe(
    patterns,
    A.map((pattern) => {
      const normalizedPattern = normalizePathSeparators(pattern);
      const matcher = picomatch(normalizedPattern, {
        dot: true,
      });
      const rootDirectory = Str.endsWith("/**")(normalizedPattern) ? normalizedPattern.slice(0, -3) : undefined;

      return (relativePath: string, isDirectory: boolean): boolean =>
        matcher(relativePath) && !(isDirectory && rootDirectory !== undefined && relativePath === rootDirectory);
    })
  );

const compileIgnoredPatterns = (patterns: ReadonlyArray<string>): ReadonlyArray<PatternMatcher> =>
  pipe(
    patterns,
    A.map((pattern) => {
      const matcher = picomatch(normalizePathSeparators(pattern), {
        dot: true,
      });

      return (relativePath: string, isDirectory: boolean): boolean =>
        matcher(isDirectory ? ensureTrailingSeparator(relativePath) : relativePath);
    })
  );

const matchesCompiledPatterns = (
  matchers: ReadonlyArray<PatternMatcher>,
  relativePath: string,
  isDirectory: boolean
): boolean =>
  pipe(
    matchers,
    A.some((matcher) => matcher(relativePath, isDirectory))
  );

const scanDirectoryWithNodeFs = (
  fs: typeof import("node:fs"),
  cwdUrl: URL,
  absoluteDirectoryPath: string,
  relativeDirectoryPath: string,
  includeMatchers: ReadonlyArray<PatternMatcher>,
  ignoreMatchers: ReadonlyArray<PatternMatcher>,
  options: undefined | GlobOptions
): Array<NodeGlobEntry> =>
  pipe(
    fs.readdirSync(absoluteDirectoryPath, {
      withFileTypes: true,
    }),
    A.fromIterable,
    A.flatMap((entry) => {
      const relativePath = relativeDirectoryPath.length === 0 ? entry.name : `${relativeDirectoryPath}/${entry.name}`;
      const normalizedRelativePath = normalizePathSeparators(relativePath);
      const absolutePath = fileURLToPath(new URL(normalizedRelativePath, cwdUrl));
      const isHiddenPath = options?.dot !== true && hasDotSegment(normalizedRelativePath);

      if (isHiddenPath) {
        return [];
      }

      const isDirectory = entry.isDirectory() || (entry.isSymbolicLink() && fs.statSync(absolutePath).isDirectory());

      if (matchesCompiledPatterns(ignoreMatchers, normalizedRelativePath, isDirectory)) {
        return [];
      }

      const currentEntry =
        matchesCompiledPatterns(includeMatchers, normalizedRelativePath, isDirectory) &&
        (isDirectory ? options?.nodir !== true : true)
          ? [
              {
                isDirectory,
                relativePath: normalizedRelativePath,
              } satisfies NodeGlobEntry,
            ]
          : [];

      if (!isDirectory || entry.isSymbolicLink()) {
        return currentEntry;
      }

      return [
        ...currentEntry,
        ...scanDirectoryWithNodeFs(
          fs,
          cwdUrl,
          absolutePath,
          normalizedRelativePath,
          includeMatchers,
          ignoreMatchers,
          options
        ),
      ];
    })
  );

const scanWithNodeGlob = async (
  pattern: Pattern,
  options: undefined | GlobOptions,
  cwdUrl: URL,
  toAbsolute: (relativePath: string) => string
): Promise<Array<string>> => {
  const fs = await import("node:fs");
  const includeMatchers = compileIncludedPatterns(toPatterns(pattern));
  const ignoreMatchers = compileIgnoredPatterns(toIgnorePatterns(options?.ignore));
  const cwdPath = fileURLToPath(cwdUrl);

  const relativePaths = pipe(
    scanDirectoryWithNodeFs(fs, cwdUrl, cwdPath, "", includeMatchers, ignoreMatchers, options),
    A.map((entry) => entry.relativePath),
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
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Glob, layer } from "@beep/utils/Glob"
 *
 * const program = Effect.provide(
 *   Effect.gen(function* () {
 *     const service = yield* Glob
 *     return yield* service.glob("src/*.ts")
 *   }),
 *   layer
 * )
 *
 * void program
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const layer: Layer.Layer<Glob> = Layer.succeed(Glob, {
  glob: makeGlob,
});
