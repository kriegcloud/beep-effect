/**
 * The `extends` target-resolution engine (relative/rooted specifiers and the bare-specifier
 * `node_modules` lookup). Every input reaching {@link resolveExports} is an
 * untrusted `package.json` `exports` map, so every recursive surface carries a
 * depth guard, every untrusted map read goes through `R.has` (an own-property check), dunder
 * keys are skipped, and substituted maps are built with `Object.create(null)` —
 * a JSON-parsed `{"__proto__": …}` key must never read or assign a prototype.
 *
 * **Gotchas**
 *
 * A hostile `package.json` must never defect or fail the whole resolution: a
 * malformed manifest is absorbed to "no resolution for that candidate", and
 * only a genuine `PlatformError` from the underlying IO flows through the typed
 * error channel.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Jsonc } from "@beep/jsonc";
import { Walker } from "@beep/walker/Walker";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { dual, pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type * as PlatformError from "effect/PlatformError";

/** Conditions honored in an `exports` condition object, including the always-eligible `default`. */
const CONDITIONS = HashSet.make("require", "types", "node", "default");

/** Keys that are never data on a plain object. Skipped on every untrusted read. */
const DUNDER_KEYS = HashSet.make("__proto__", "constructor", "prototype");

/** Depth guard for the recursive exports walk (condition nesting, fallback arrays, wildcard substitution). */
const MAX_EXPORTS_DEPTH = 32;

/** An untrusted JSON object read from a `package.json`. */
type UntrustedRecord = { readonly [key: PropertyKey]: unknown };

/** The two halves of a single-`*` subpath pattern. */
interface WildcardPattern {
  readonly prefix: string;
  readonly suffix: string;
}

/** One `*` pattern that matched the requested subpath. */
interface PatternMatch {
  readonly captured: string;
  readonly pattern: string;
  readonly prefixLength: number;
}

/** A bare specifier split into its package name and the subpath below it. */
interface BareSpecifier {
  readonly pkg: string;
  readonly subpath: string;
}

/**
 * The own, non-dunder keys of an untrusted record, in insertion order.
 *
 * @param record - The untrusted record to read.
 * @returns The keys that are safe to read as data.
 */
const safeKeys = (record: UntrustedRecord): ReadonlyArray<string> =>
  A.filter(R.keys(record), (key) => !HashSet.has(DUNDER_KEYS, key) && R.has(record, key));

/**
 * Read an own property of an untrusted record, guarding dunder keys and inherited members.
 *
 * @param record - The untrusted record to read.
 * @param key - The property to read.
 * @returns The property value, or `Option.none()` when it is absent or unsafe.
 */
const ownProp = (record: UntrustedRecord, key: string): O.Option<unknown> =>
  !HashSet.has(DUNDER_KEYS, key) && R.has(record, key) ? O.some(record[key]) : O.none();

/**
 * Split a bare specifier into its package name and its subpath ("" when the whole spec is the package).
 *
 * @param spec - The bare `extends` specifier.
 * @returns The package name and the subpath below it.
 */
const parseSpecifier = (spec: string): BareSpecifier => {
  const parts = Str.split(spec, "/");
  const nameSegments = Str.startsWith("@")(spec) ? 2 : 1;
  return { pkg: A.join(A.take(parts, nameSegments), "/"), subpath: A.join(A.drop(parts, nameSegments), "/") };
};

/**
 * Split a subpath pattern at its only `*`.
 *
 * @param pattern - The `exports` key to split.
 * @returns The text around the star, or `Option.none()` unless there is exactly one star.
 */
const splitPattern = (pattern: string): O.Option<WildcardPattern> =>
  pipe(
    Str.indexOf("*")(pattern),
    O.map((star) => ({ prefix: Str.slice(0, star)(pattern), suffix: Str.slice(star + 1)(pattern) })),
    O.filter(({ suffix }) => !Str.includes("*")(suffix))
  );

/**
 * Match a split single-`*` pattern against a subpath.
 *
 * @param pattern - The split pattern.
 * @param subpath - The subpath key being resolved.
 * @returns The captured segment, or `Option.none()` when the subpath does not match.
 */
const matchWildcard = ({ prefix, suffix }: WildcardPattern, subpath: string): O.Option<string> =>
  subpath.length >= prefix.length + suffix.length && Str.startsWith(prefix)(subpath) && Str.endsWith(suffix)(subpath)
    ? O.some(Str.slice(prefix.length, subpath.length - suffix.length)(subpath))
    : O.none();

/**
 * Substitute a captured wildcard segment into an export value, hardened against dunder keys and unbounded nesting.
 *
 * @param value - The export value to rewrite.
 * @param captured - The segment the pattern's `*` captured.
 * @param depth - The current nesting depth.
 * @returns The rewritten value; past the depth guard, JSON `null` (an unresolvable target).
 */
const substituteWildcard = (value: unknown, captured: string, depth: number): unknown => {
  if (depth > MAX_EXPORTS_DEPTH) return null;
  if (P.isString(value)) return Str.replace(/\*/g, captured)(value);
  if (A.isArray(value)) return A.map(value, (entry) => substituteWildcard(entry, captured, depth + 1));
  return P.isObject(value) ? substituteObject(value, captured, depth + 1) : value;
};

/**
 * Substitute into every safe member of a condition object, building a null-prototype result.
 *
 * @param value - The condition object to rewrite.
 * @param captured - The segment the pattern's `*` captured.
 * @param depth - The nesting depth of the members.
 * @returns A null-prototype copy with every member substituted.
 */
const substituteObject = (value: UntrustedRecord, captured: string, depth: number): Record<string, unknown> => {
  const result: Record<string, unknown> = { __proto__: null };
  for (const key of safeKeys(value)) {
    result[key] = substituteWildcard(value[key], captured, depth);
  }
  return result;
};

/**
 * Match one `exports` key against the subpath as a `*` pattern.
 *
 * @param subpath - The subpath key being resolved.
 * @returns A function from a safe pattern key to its match, or `Option.none()`.
 */
const matchPattern =
  (subpath: string) =>
  (pattern: string): O.Option<PatternMatch> =>
    O.flatMap(splitPattern(pattern), (split) =>
      O.map(matchWildcard(split, subpath), (captured) => ({ pattern, captured, prefixLength: split.prefix.length }))
    );

/**
 * Keep the longer-prefixed match; the earlier one wins a tie.
 *
 * @param best - The best match so far.
 * @param next - The next candidate match.
 * @returns The more specific match.
 */
const moreSpecific = (best: O.Option<PatternMatch>, next: PatternMatch): O.Option<PatternMatch> =>
  O.isSome(best) && best.value.prefixLength >= next.prefixLength ? best : O.some(next);

/**
 * Resolve a subpath against a subpath map: the exact key first, then the most specific `*` pattern.
 * Node/tsc pattern selection: among matching `*` patterns the LONGEST base prefix (the text before the
 * star) wins — most specific, not first-in-order.
 *
 * @param map - The subpath map (every key starts with ".").
 * @param subpath - The subpath key being resolved.
 * @returns The selected export value, or `Option.none()` when no key matches.
 */
const matchSubpath = (map: UntrustedRecord, subpath: string): O.Option<unknown> =>
  O.orElse(ownProp(map, subpath), () =>
    pipe(
      A.getSomes(A.map(safeKeys(map), matchPattern(subpath))),
      A.reduce(O.none<PatternMatch>(), moreSpecific),
      O.map((best) => substituteWildcard(map[best.pattern], best.captured, 0))
    )
  );

/**
 * Whether an `exports` object is a subpath map: non-empty with every key starting with ".". Otherwise it
 * is a root-level condition object (sugar for the "." target).
 *
 * @param exports - The `exports` object.
 * @returns `true` for a subpath map.
 */
const isSubpathMap = (exports: UntrustedRecord): boolean => {
  const keys = R.keys(exports);
  return A.isReadonlyArrayNonEmpty(keys) && A.every(keys, Str.startsWith("."));
};

/**
 * Find the export value for a subpath: exact key first, then a single-`*` pattern (substituted). A string,
 * an array or a condition object is the "." target.
 *
 * @param exports - The untrusted `exports` value.
 * @param subpath - The subpath key being resolved.
 * @returns The selected export value, or `Option.none()`.
 */
const matchExportKey = (exports: unknown, subpath: string): O.Option<unknown> => {
  if (P.isObject(exports) && isSubpathMap(exports)) return matchSubpath(exports, subpath);
  const isRootTarget = P.isString(exports) || A.isArray(exports) || P.isObject(exports);
  return subpath === "." && isRootTarget ? O.some(exports) : O.none();
};

/**
 * Resolve an export value to a `.json` string target: strings gate on the
 * `.json` suffix, fallback arrays yield the first resolvable entry, and
 * condition objects are matched in map insertion order (Node semantics) against
 * the honored conditions plus `default`, under the depth guard.
 *
 * @param value - The export value.
 * @param depth - The current nesting depth.
 * @returns The `.json` target, or `Option.none()`.
 */
const resolveConditionValue = (value: unknown, depth: number): O.Option<string> => {
  if (depth > MAX_EXPORTS_DEPTH) return O.none();
  if (P.isString(value)) return Str.endsWith(".json")(value) ? O.some(value) : O.none();
  if (A.isArray(value)) return A.findFirst(value, (entry) => resolveConditionValue(entry, depth + 1));
  return P.isObject(value) ? resolveConditions(value, depth + 1) : O.none();
};

/**
 * Resolve the first honored condition of a condition object that yields a target.
 *
 * @param conditions - The condition object.
 * @param depth - The nesting depth of its members.
 * @returns The `.json` target, or `Option.none()`.
 */
const resolveConditions = (conditions: UntrustedRecord, depth: number): O.Option<string> =>
  A.findFirst(safeKeys(conditions), (key) =>
    HashSet.has(CONDITIONS, key) ? resolveConditionValue(conditions[key], depth) : O.none()
  );

/**
 * Resolve a `package.json` `exports` map for a subpath key (`"."` for the
 * package root, `"./sub"` for a subpath) to its `.json` target string. Pure and
 * hardened; exported for direct unit testing.
 *
 * **Details**
 *
 * The returned target is verbatim
 * from the manifest (still relative to the package directory) — the caller joins
 * and probes it.
 *
 * **Example** (Resolve a conditional package subpath)
 *
 * ```ts
 * import { resolveExports } from "@beep/repo-tsconfig/internal/extendsTarget";
 * import * as O from "effect/Option";
 *
 * const target = resolveExports({ "./base": { types: "./base.json" } }, "./base");
 * console.log(O.getOrElse(target, () => "missing")) // ./base.json
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const resolveExports: {
  (exports: unknown, subpath: string): O.Option<string>;
  (subpath: string): (exports: unknown) => O.Option<string>;
} = dual(
  2,
  (exports: unknown, subpath: string): O.Option<string> =>
    O.flatMap(matchExportKey(exports, subpath), (matched) => resolveConditionValue(matched, 0))
);

/**
 * Read and parse a `package.json`, coercing every failure that is not a
 * genuine IO error to an EMPTY manifest — tsc's `readJson`
 * (typescript.js:21176, `readJsonOrUndefined(path, host) || {}`) does exactly
 * this, so a missing, unparseable or non-object manifest falls through to the
 * manifest-less lookups (no exports, no tsconfig field) rather than deciding
 * the candidate. A `PlatformError` from `exists` flows through.
 *
 * @param fs - The filesystem service.
 * @param manifestPath - The absolute `package.json` path.
 * @returns The parsed manifest object, or an empty record.
 */
const readManifest = Effect.fnUntraced(function* (
  fs: FileSystem.FileSystem,
  manifestPath: string
): Effect.fn.Return<UntrustedRecord, PlatformError.PlatformError> {
  if (!(yield* fs.exists(manifestPath))) return {};
  const text = yield* fs.readFileString(manifestPath);
  const parsed = yield* Effect.option(Jsonc.parse(text));
  return O.getOrElse(O.filter(parsed, P.isObject), (): UntrustedRecord => ({}));
});

/**
 * Probe candidate files in order and return the first that exists.
 *
 * @param fs - The filesystem service.
 * @param candidates - The absolute candidate paths, in priority order.
 * @returns The first existing candidate, or `Option.none()`.
 */
const firstExisting = (
  fs: FileSystem.FileSystem,
  candidates: ReadonlyArray<string>
): Effect.Effect<O.Option<string>, PlatformError.PlatformError> =>
  Effect.findFirst(candidates, (candidate) => fs.exists(candidate));

/**
 * The exact path, then the `.json`-appended path unless the `.json` suffix is already present.
 *
 * @param abs - The absolute target path.
 * @param written - The text whose suffix decides the retry: the resolved path for a relative target,
 * the verbatim subpath for a package subpath (tsc checks the subpath, before resolution).
 * @returns The candidate paths in probe order.
 */
const withJsonRetry = (abs: string, written: string): ReadonlyArray<string> =>
  Str.endsWith(".json")(written) ? [abs] : [abs, `${abs}.json`];

/**
 * Probe a package whose manifest declares `exports`: exports present blocks every same-package
 * fallback, even when it fails to resolve — but the ancestor walk still continues afterwards.
 *
 * @param fs - The filesystem service.
 * @param path - The path service.
 * @param pkgDir - The candidate package directory.
 * @param exports - The manifest's `exports` value.
 * @param subpath - The requested subpath ("" for the package root).
 * @returns The resolved config path, or `Option.none()`.
 */
const probeExports = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  pkgDir: string,
  exports: unknown,
  subpath: string
): Effect.Effect<O.Option<string>, PlatformError.PlatformError> =>
  O.match(resolveExports(exports, subpath === "" ? "." : `./${subpath}`), {
    onNone: () => Effect.succeedNone,
    onSome: (target) => firstExisting(fs, [path.resolve(pkgDir, target)]),
  });

/**
 * The manifest-less candidates for a package without `exports`. A subpath probes the exact file, then the
 * `.json` retry. A bare package tries the `"tsconfig"` field (resolved against the package dir) first; on a
 * miss tsc falls through to the `<pkg>/tsconfig.json` probe (typescript.js:45943-45945 — a falsy
 * packageFileResult falls to loadModuleFromFile(indexPath)). tsc treats `""` as falsy too
 * (`packageFile && loader(...)`), so an empty-string field also falls through rather than resolving to
 * `path.resolve(pkgDir, "")`, which is the package directory itself.
 *
 * @param path - The path service.
 * @param pkgDir - The candidate package directory.
 * @param record - The parsed manifest.
 * @param subpath - The requested subpath ("" for the package root).
 * @returns The candidate paths in probe order.
 */
const fallbackCandidates = (
  path: Path.Path,
  pkgDir: string,
  record: UntrustedRecord,
  subpath: string
): ReadonlyArray<string> => {
  if (Str.isNonEmpty(subpath)) {
    const exact = path.resolve(pkgDir, subpath);
    return withJsonRetry(exact, subpath);
  }
  const tsField = pipe(
    ownProp(record, "tsconfig"),
    O.filter(P.isString),
    O.filter(Str.isNonEmpty),
    O.map((field) => path.resolve(pkgDir, field))
  );
  return A.append(O.toArray(tsField), path.join(pkgDir, "tsconfig.json"));
};

/**
 * Probe one candidate package under an ancestor's `node_modules`. `none` means
 * "did not resolve here — keep walking": tsc's ancestor walk
 * (forEachAncestorDirectoryStoppingAtGlobalCache, typescript.js:46466) only
 * stops on a defined result, so a present-but-unresolved candidate does NOT
 * shadow a farther ancestor's copy. There is no `package.json` presence gate —
 * tsc probes `<pkg>/tsconfig.json` even when the manifest is absent
 * (loadNodeModuleFromDirectoryWorker, typescript.js:45943).
 *
 * @param fs - The filesystem service.
 * @param path - The path service.
 * @param dir - The ancestor directory whose `node_modules` is probed.
 * @param specifier - The parsed bare specifier.
 * @returns The resolved config path, or `Option.none()`.
 */
const tryCandidate = Effect.fnUntraced(function* (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  dir: string,
  { pkg, subpath }: BareSpecifier
): Effect.fn.Return<O.Option<string>, PlatformError.PlatformError> {
  const pkgDir = path.join(dir, "node_modules", pkg);
  const record = yield* readManifest(fs, path.join(pkgDir, "package.json"));
  return yield* O.match(ownProp(record, "exports"), {
    onNone: () => firstExisting(fs, fallbackCandidates(path, pkgDir, record, subpath)),
    onSome: (exports) => probeExports(fs, path, pkgDir, exports, subpath),
  });
});

/**
 * Whether a normalized specifier is relative or rooted (resolved against the extending config's directory).
 *
 * @param path - The path service.
 * @param spec - The slash-normalized specifier.
 * @returns `true` for a relative or absolute specifier.
 */
const isPathSpecifier = (path: Path.Path, spec: string): boolean =>
  Str.startsWith("./")(spec) || Str.startsWith("../")(spec) || path.isAbsolute(spec);

/**
 * Resolve an `extends` target to an absolute config path. Relative and rooted
 * specifiers resolve against the extending config's directory; bare
 * specifiers walk up the ancestor `node_modules` chain, skipping ancestors
 * named `node_modules`, and resolve against the first package found.
 *
 * **Details**
 *
 * A package-resolved target is realpathed, matching tsc's `preserveSymlinks: false` module
 * resolution: a workspace package linked under `node_modules` resolves to its real file, so the
 * linked config's own relative `extends` resolves from its real directory. A relative or rooted
 * target is not realpathed; tsc keeps that path as written.
 *
 * Absence is `Option.none()`; a malformed manifest is coerced to an empty one
 * (tsc parity — the candidate's manifest-less lookups still run); a
 * `PlatformError` from the underlying IO flows through. Relative targets try
 * the exact file first (even extensionless), then the `.json`-appended path;
 * there is no directory fallback.
 *
 * **Example** (Construct a relative extends lookup)
 *
 * ```ts
 * import { resolveExtendsTarget } from "@beep/repo-tsconfig/internal/extendsTarget";
 * import * as Effect from "effect/Effect";
 *
 * const program = resolveExtendsTarget("./base.json", "/project/tsconfig.json");
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const resolveExtendsTarget: {
  (
    spec: string,
    fromConfigPath: string
  ): Effect.Effect<O.Option<string>, PlatformError.PlatformError, FileSystem.FileSystem | Path.Path>;
  (
    fromConfigPath: string
  ): (spec: string) => Effect.Effect<O.Option<string>, PlatformError.PlatformError, FileSystem.FileSystem | Path.Path>;
} = dual(
  2,
  Effect.fnUntraced(function* (
    spec: string,
    fromConfigPath: string
  ): Effect.fn.Return<O.Option<string>, PlatformError.PlatformError, FileSystem.FileSystem | Path.Path> {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const fromDir = path.dirname(fromConfigPath);
    // tsc normalizes slashes once and uses the normalized name throughout
    // (typescript.js:43745) — the normalized spec is what resolves.
    const normalized = Str.replace(/\\/g, "/")(spec);

    if (isPathSpecifier(path, normalized)) {
      const abs = path.resolve(fromDir, normalized);
      return yield* firstExisting(fs, withJsonRetry(abs, abs));
    }

    const specifier = parseSpecifier(normalized);
    const ancestors = yield* Walker.ascend(fromDir);
    for (const dir of A.filter(ancestors, (ancestor) => path.basename(ancestor) !== "node_modules")) {
      const candidate = yield* tryCandidate(fs, path, dir, specifier);
      // tsc resolves a package target through the module resolver, which realpaths it
      // (`preserveSymlinks: false`), so a workspace symlink under `node_modules` resolves the
      // linked config's own relative `extends` from its real directory.
      if (O.isSome(candidate)) return O.some(yield* fs.realPath(candidate.value));
    }
    return O.none();
  })
);
