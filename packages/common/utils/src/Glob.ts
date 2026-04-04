import { fileURLToPath, pathToFileURL } from "node:url";
import { $UtilsId } from "@beep/identity/packages";
import { Effect, Layer, Order, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Thunk from "./internal/Thunk.ts";

const $I = $UtilsId.create("Glob");

/**
 * @since 0.0.0
 * @category Validation
 */
export const Pattern = S.Union([S.String, S.Array(S.String)]);

/**
 * @since 0.0.0
 * @category Validation
 */
export type Pattern = typeof Pattern.Type;

/**
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace GlobError {
  /**
   * @since 0.0.0
   * @category DomainModel
   */
  export type Encoded = typeof GlobError.Encoded;
}

/**
 * @since 0.0.0
 * @category DomainModel
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

/**
 * @since 0.0.0
 * @category PortContract
 */
export interface Glob {
  readonly glob: (pattern: Pattern, options?: undefined | GlobOptions) => Effect.Effect<Array<string>, GlobError>;
}

/**
 * @since 0.0.0
 * @category PortContract
 */
export const Glob: ServiceMap.Service<Glob, Glob> = ServiceMap.Service("@effect/utils/Glob");

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

const ensureTrailingSeparator = (value: string): string =>
  Str.endsWith("/")(value) || Str.endsWith("\\")(value) ? value : `${value}/`;

const normalizePathSeparators = (value: string): string => Str.replaceAll("\\", "/")(value);

const hasDotSegment = (value: string): boolean =>
  pipe(
    value,
    normalizePathSeparators,
    Str.split("/"),
    A.some((segment) => segment.length > 1 && Str.startsWith(".")(segment))
  );

const toPatterns = (pattern: Pattern): ReadonlyArray<string> => (P.isString(pattern) ? [pattern] : pattern);

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

  if (options?.absolute === true) {
    return pipe(relativePaths, A.map(toAbsolute), (paths) => [...paths]);
  }

  return [...relativePaths];
};

/**
 * @since 0.0.0
 * @category Configuration
 */
export const layer: Layer.Layer<Glob> = Layer.succeed(Glob, {
  glob: (pattern, options) => {
    const cwdUrl = toDirectoryUrl(options?.cwd ?? ".");
    const toAbsolute = toAbsolutePath(cwdUrl);
    const BunGlob = getBunGlobConstructor();

    if (BunGlob === undefined) {
      return Effect.tryPromise({
        try: () => scanWithNodeGlob(pattern, options, cwdUrl, toAbsolute),
        catch: (cause) => new GlobError({ pattern, cause: S.decodeUnknownOption(S.DefectWithStack)(cause) }),
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

        if (options?.absolute === true) {
          return pipe(relativePaths, A.map(toAbsolute), (paths) => [...paths]);
        }

        return [...relativePaths];
      },
      catch: (cause) => new GlobError({ pattern, cause: S.decodeUnknownOption(S.DefectWithStack)(cause) }),
    });
  },
});
