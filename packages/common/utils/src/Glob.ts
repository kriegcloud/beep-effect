import { fileURLToPath, pathToFileURL } from "node:url";
import { $UtilsId } from "@beep/identity/packages";
import { Effect, Layer, Order, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import picomatch from "picomatch";
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

type GlobMatcher = (relativePath: string) => boolean;

const absolutePathPattern = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;

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
  const fs = await import("node:fs");
  const path = await import("node:path");
  const cwdPath = fileURLToPath(cwdUrl);
  const includeMatchers = compileMatchers(toPatterns(pattern), options);
  const ignoreMatchers = compileMatchers(toIgnorePatterns(options?.ignore), options);

  const walk = (relativeDir = ""): ReadonlyArray<readonly [relativePath: string, isFile: boolean]> => {
    const absoluteDir = relativeDir.length === 0 ? cwdPath : path.join(cwdPath, relativeDir);
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });

    return A.flatMap(entries, (entry) => {
      const relativePath = normalizePathSeparators(
        relativeDir.length === 0 ? entry.name : path.join(relativeDir, entry.name)
      );
      const isFile = entry.isFile();

      if (entry.isDirectory()) {
        return [[relativePath, false] as const, ...walk(relativePath)];
      }

      return [[relativePath, isFile] as const];
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
 * @since 0.0.0
 * @category Configuration
 */
export const layer: Layer.Layer<Glob> = Layer.succeed(Glob, {
  glob: (pattern, options) => {
    const cwdUrl = toDirectoryUrl(options?.cwd ?? ".");
    const toAbsolute = toAbsolutePath(cwdUrl);
    return Effect.tryPromise({
      try: () => scanWithNodeGlob(pattern, options, cwdUrl, toAbsolute),
      catch: (cause) => new GlobError({ pattern, cause: S.decodeUnknownOption(S.DefectWithStack)(cause) }),
    });
  },
});
