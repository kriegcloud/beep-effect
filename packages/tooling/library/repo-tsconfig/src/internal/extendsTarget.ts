/**
 * The `extends` target-resolution engine (relative/rooted specifiers and the bare-specifier
 * `node_modules` lookup). Every input reaching {@link resolveExports} is an
 * untrusted `package.json` `exports` map, so every recursive surface carries a
 * depth guard, every untrusted map read goes through `R.has` (an own-property check) and dunder
 * keys are skipped — a JSON-parsed `{"__proto__": …}` key must never read a prototype. Wildcard
 * captures are substituted into string targets only, so no untrusted map is ever rebuilt.
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

/** Depth guard for the recursive exports walk (condition nesting and fallback arrays). */
const MAX_EXPORTS_DEPTH = 32;

/** Path segments tsc rejects in an export target (after its leading `./`) and in a `*` capture. */
const INVALID_SEGMENTS = HashSet.make(".", "..", "node_modules");

/**
 * `exports` values tsc treats as no `exports` field at all (measured against tsgo 7.0.2: `null`, `false`
 * and `""` fall through to the manifest-less lookups; `0`, `true`, `{}` and `[]` do not).
 */
const ABSENT_EXPORTS = HashSet.make<ReadonlyArray<unknown>>(null, false, "");

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

/** The export value a subpath selected, with the `*` capture when a pattern key selected it. */
interface MatchedExport {
  readonly captured: O.Option<string>;
  readonly value: unknown;
}

/** The `.json` targets an `exports` lookup probes, in order, and whether a `null` target ended the walk. */
interface ExportsWalk {
  readonly blocked: boolean;
  readonly targets: ReadonlyArray<string>;
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
 * star) wins — most specific, not first-in-order. An exact key decides the subpath even when its targets
 * miss; the patterns are not consulted.
 *
 * @param map - The subpath map (every key starts with ".").
 * @param subpath - The subpath key being resolved.
 * @returns The selected export value with the pattern's capture, or `Option.none()` when no key matches.
 */
const matchSubpath = (map: UntrustedRecord, subpath: string): O.Option<MatchedExport> =>
  O.orElse(
    O.map(ownProp(map, subpath), (value) => ({ value, captured: O.none<string>() })),
    () =>
      pipe(
        A.getSomes(A.map(safeKeys(map), matchPattern(subpath))),
        A.reduce(O.none<PatternMatch>(), moreSpecific),
        O.map((best) => ({ value: map[best.pattern], captured: O.some(best.captured) }))
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
 * Find the export value for a subpath: exact key first, then a single-`*` pattern. A string, an array or a
 * condition object is the "." target.
 *
 * @param exports - The untrusted `exports` value.
 * @param subpath - The subpath key being resolved.
 * @returns The selected export value with the pattern's capture, or `Option.none()`.
 */
const matchExportKey = (exports: unknown, subpath: string): O.Option<MatchedExport> => {
  if (P.isObject(exports) && isSubpathMap(exports)) return matchSubpath(exports, subpath);
  const isRootTarget = P.isString(exports) || A.isArray(exports) || P.isObject(exports);
  return subpath === "." && isRootTarget ? O.some({ value: exports, captured: O.none() }) : O.none();
};

/**
 * The extensions tsc's config lookup reads as their `.json` sibling, longest first so `.d.ts` wins over
 * `.ts` (tsc `removeFileExtension` then `tryAddingExtensions`, which ends in
 * `state.isConfigLookup && tryExtension(".json")` for exactly these).
 */
const JSON_SIBLING_EXTENSIONS = [".d.ts", ".ts", ".js"];

/**
 * Read one string export target the way tsc's config lookup does: a `.json` target as written, and a
 * `.d.ts`, `.ts` or `.js` target as its `.json` sibling (`"./*": "./*.ts"` reaches `./tsconfig.json`).
 * Any other target is not a config.
 *
 * @param target - The string export target.
 * @returns The `.json` target to probe, or `Option.none()`.
 */
const jsonTarget = (target: string): O.Option<string> =>
  Str.endsWith(".json")(target)
    ? O.some(target)
    : O.map(
        A.findFirst(JSON_SIBLING_EXTENSIONS, (extension) => Str.endsWith(extension)(target)),
        (extension) => `${Str.slice(0, target.length - extension.length)(target)}.json`
      );

/**
 * Whether a path has a `.`, `..` or `node_modules` segment (either slash separates; the match is
 * case-sensitive, as tsc's is).
 *
 * @param path - The target tail or captured subpath to check.
 * @returns `true` when the path has an invalid segment.
 */
const hasInvalidSegment = (path: string): boolean =>
  A.some(Str.split(path, /[\\/]/), (segment) => HashSet.has(INVALID_SEGMENTS, segment));

/**
 * The `.json` target one string export target contributes, if any. tsc skips (and keeps walking past) a
 * target that does not start with `./` or has an invalid segment after it, and a target reached through a
 * `*` pattern whose capture has an invalid segment. A valid target has every `*` replaced by the capture
 * and is then read as a config ({@link jsonTarget}).
 *
 * @param target - The string export target, as written in the manifest.
 * @param captured - The pattern's captured segment, or `Option.none()` for an exact key.
 * @returns The `.json` target to probe, or nothing.
 */
const stringTarget = (target: string, captured: O.Option<string>): ReadonlyArray<string> =>
  Str.startsWith("./")(target) && !hasInvalidSegment(Str.slice(2)(target)) && !O.exists(captured, hasInvalidSegment)
    ? pipe(
        captured,
        O.match({ onNone: () => target, onSome: (segment) => A.join(Str.split(target, "*"), segment) }),
        jsonTarget,
        O.toArray
      )
    : [];

/** The walk of no further targets. */
const OPEN: ExportsWalk = { targets: [], blocked: false };

/** The walk a `null` target ends. */
const BLOCKED: ExportsWalk = { targets: [], blocked: true };

/**
 * Walk export values in order, concatenating their targets until one of them is blocked.
 *
 * @param entries - The values (array entries or honored condition keys), in order.
 * @param walk - The walk of one entry.
 * @returns The combined walk.
 */
const walkSequence = <X>(entries: ReadonlyArray<X>, walk: (entry: X) => ExportsWalk): ExportsWalk =>
  A.reduce(entries, OPEN, (acc, entry) => {
    if (acc.blocked) return acc;
    const next = walk(entry);
    return { targets: A.appendAll(acc.targets, next.targets), blocked: next.blocked };
  });

/**
 * Walk an export value the way tsc does for a config lookup: a string contributes its `.json` target, a
 * fallback array and a condition object (honored conditions plus `default`, in map insertion order) walk
 * every entry in turn, and a `null` ends the walk blocked. tsc keeps going past a target whose file is
 * missing, so every target up to the end (or the `null`) is a candidate. Bounded by the depth guard.
 *
 * @param value - The export value.
 * @param captured - The pattern's captured segment, or `Option.none()` for an exact key.
 * @param depth - The current nesting depth.
 * @returns The candidate targets in probe order and whether a `null` ended the walk.
 */
const walkValue = (value: unknown, captured: O.Option<string>, depth: number): ExportsWalk => {
  if (depth > MAX_EXPORTS_DEPTH) return OPEN;
  if (P.isNull(value)) return BLOCKED;
  if (P.isString(value)) return { targets: stringTarget(value, captured), blocked: false };
  if (A.isArray(value)) return walkSequence(value, (entry) => walkValue(entry, captured, depth + 1));
  return P.isObject(value) ? walkConditions(value, captured, depth + 1) : OPEN;
};

/**
 * Walk the honored conditions of a condition object, in map insertion order.
 *
 * @param conditions - The condition object.
 * @param captured - The pattern's captured segment, or `Option.none()` for an exact key.
 * @param depth - The nesting depth of its members.
 * @returns The combined walk.
 */
const walkConditions = (conditions: UntrustedRecord, captured: O.Option<string>, depth: number): ExportsWalk =>
  walkSequence(
    A.filter(safeKeys(conditions), (key) => HashSet.has(CONDITIONS, key)),
    (key) => walkValue(conditions[key], captured, depth)
  );

/**
 * Resolve a `package.json` `exports` map for a subpath key (`"."` for the
 * package root, `"./sub"` for a subpath) to the `.json` targets tsc probes, in
 * order. Pure and hardened; exported for direct unit testing.
 *
 * **Details**
 *
 * The targets are verbatim from the manifest (still relative to the package
 * directory); the caller joins them and takes the first that is a file. tsc keeps
 * going past a target whose file is missing, through fallback arrays, nested
 * conditions and later conditions alike. A `null` target ends the walk with
 * `blocked: true`: when no earlier target exists, tsc stops the whole lookup
 * there, including the ancestor `node_modules` walk.
 *
 * **Example** (Resolve a conditional package subpath)
 *
 * ```ts
 * import { resolveExports } from "@beep/repo-tsconfig/internal/extendsTarget";
 *
 * const walk = resolveExports({ ".": { types: "./index.d.ts", default: "./tsconfig.json" } }, ".");
 * console.log(walk.targets) // ["./index.json", "./tsconfig.json"]
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const resolveExports: {
  (exports: unknown, subpath: string): { readonly targets: ReadonlyArray<string>; readonly blocked: boolean };
  (subpath: string): (exports: unknown) => { readonly targets: ReadonlyArray<string>; readonly blocked: boolean };
} = dual(
  2,
  (exports: unknown, subpath: string): ExportsWalk =>
    O.match(matchExportKey(exports, subpath), {
      onNone: () => OPEN,
      onSome: ({ value, captured }) => walkValue(value, captured, 0),
    })
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
 * Probe candidate files in order, skipping directories and missing paths.
 *
 * @param fs - The filesystem service.
 * @param candidates - The absolute candidate paths, in priority order.
 * @returns The first file candidate, or `Option.none()`.
 */
const firstExisting = (
  fs: FileSystem.FileSystem,
  candidates: ReadonlyArray<string>
): Effect.Effect<O.Option<string>, PlatformError.PlatformError> =>
  Effect.findFirst(candidates, (candidate) =>
    fs.stat(candidate).pipe(
      Effect.map((info) => info.type === "File"),
      Effect.catchTag("PlatformError", (error) =>
        error.reason._tag === "NotFound" || (P.hasProperty(error.cause, "code") && error.cause.code === "ENOTDIR")
          ? Effect.succeed(false)
          : Effect.fail(error)
      )
    )
  );

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
 * fallback, even when it fails to resolve. The first walked target that is a file wins; tsc keeps going
 * past a missing path or a directory. A miss lets the ancestor walk continue, except when a `null` target ended the
 * walk: that decides the whole lookup as unresolved.
 *
 * @param fs - The filesystem service.
 * @param path - The path service.
 * @param pkgDir - The candidate package directory.
 * @param exports - The manifest's `exports` value.
 * @param subpath - The requested subpath ("" for the package root).
 * @returns `Option.some` of the decided result (the config path, or none when blocked), or `Option.none()`
 * to keep walking.
 */
const probeExports = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  pkgDir: string,
  exports: unknown,
  subpath: string
): Effect.Effect<O.Option<O.Option<string>>, PlatformError.PlatformError> => {
  const walk = resolveExports(exports, subpath === "" ? "." : `./${subpath}`);
  return Effect.map(
    firstExisting(
      fs,
      A.map(walk.targets, (target) => path.resolve(pkgDir, target))
    ),
    (found) => (walk.blocked ? O.some(found) : O.map(found, O.some))
  );
};

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
 * shadow a farther ancestor's copy. The one exception is an `exports` walk a
 * `null` target ended, which decides the lookup as unresolved. There is no
 * `package.json` presence gate — tsc probes `<pkg>/tsconfig.json` even when the
 * manifest is absent (loadNodeModuleFromDirectoryWorker, typescript.js:45943),
 * and an `exports` of `null`, `false` or `""` counts as absent.
 *
 * @param fs - The filesystem service.
 * @param path - The path service.
 * @param dir - The ancestor directory whose `node_modules` is probed.
 * @param specifier - The parsed bare specifier.
 * @returns `Option.some` of the decided result (the config path, or none when blocked), or `Option.none()`
 * to keep walking.
 */
const tryCandidate = Effect.fnUntraced(function* (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  dir: string,
  { pkg, subpath }: BareSpecifier
): Effect.fn.Return<O.Option<O.Option<string>>, PlatformError.PlatformError> {
  const pkgDir = path.join(dir, "node_modules", pkg);
  const record = yield* readManifest(fs, path.join(pkgDir, "package.json"));
  const exports = O.filter(ownProp(record, "exports"), (value) => !HashSet.has(ABSENT_EXPORTS, value));
  return yield* O.match(exports, {
    onNone: () => Effect.map(firstExisting(fs, fallbackCandidates(path, pkgDir, record, subpath)), O.map(O.some)),
    onSome: (value) => probeExports(fs, path, pkgDir, value, subpath),
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
      const decided = yield* tryCandidate(fs, path, dir, specifier);
      // tsc resolves a package target through the module resolver, which realpaths it
      // (`preserveSymlinks: false`), so a workspace symlink under `node_modules` resolves the
      // linked config's own relative `extends` from its real directory.
      if (O.isSome(decided)) return yield* Effect.transposeOption(O.map(decided.value, (found) => fs.realPath(found)));
    }
    return O.none();
  })
);
