// The package's runtime import graph, read from source text.
//
// Vite's glob import inlines every `src` module's raw text at transform time,
// so the walk needs no filesystem. The `@beep/managed-section` sources are
// inlined the same way, so a closure walk can enter that package through the
// leaves this package imports and see what they reach in turn. Type-only edges are erased at runtime and
// skipped. Comments go first, LINE comments before BLOCK comments: JSDoc
// examples carry real import statements, and prose such as `@beep/*` would
// otherwise open a block comment and silently hide the imports after it.

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";

/** The subset of Vite's `import.meta.glob` signature this walker uses. */
interface RawGlobOptions {
  readonly eager: true;
  readonly import: "default";
  readonly query: "?raw";
}

declare global {
  interface ImportMeta {
    glob<T>(pattern: string, options: RawGlobOptions): Record<string, T>;
  }
}

const SRC_PREFIX = "../../src/";

const sources = import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true });

/** Every module under `src`, relative to `src/` (for example `"internal/unstubbed.ts"`). */
export const sourceModules: ReadonlyArray<string> = A.sort(
  A.map(R.keys(sources), Str.slice(SRC_PREFIX.length)),
  Str.Order
);

const MANAGED_SECTION_PREFIX = "../../../managed-section/src/";

const managedSectionSources = import.meta.glob<string>("../../../managed-section/src/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The module-id root under which `@beep/managed-section` sources are walked. */
const MANAGED_SECTION_ROOT = "@beep/managed-section/src/";

/** Every `@beep/managed-section` source module, as a closure-walk module id. */
export const managedSectionModules: ReadonlyArray<string> = A.sort(
  A.map(
    R.keys(managedSectionSources),
    (key) => `${MANAGED_SECTION_ROOT}${Str.slice(MANAGED_SECTION_PREFIX.length)(key)}`
  ),
  Str.Order
);

const textOf = (module: string): string =>
  O.getOrThrowWith(
    Str.startsWith(MANAGED_SECTION_ROOT)(module)
      ? R.get(managedSectionSources, `${MANAGED_SECTION_PREFIX}${Str.slice(MANAGED_SECTION_ROOT.length)(module)}`)
      : R.get(sources, `${SRC_PREFIX}${module}`),
    () => new Error(`no source module ${module}`)
  );

/** Remove line comments, then block comments (the order is load-bearing). */
export const stripComments: (source: string) => string = (source) =>
  pipe(source, Str.replace(/(^|\n)\s*\/\/.*/g, "$1"), Str.replace(/\/\*[\s\S]*?\*\//g, ""));

// One pattern for every runtime edge form: `import … from "x"`,
// `export … from "x"`, side-effect `import "x"` and dynamic `import("x")`.
// Group 1 is the clause of a `from` edge, group 2 its specifier, group 3 a
// bare-or-dynamic specifier.
const EDGE = /(?:^|\n)\s*(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']|\bimport\s*\(?\s*["']([^"']+)["']/g;

/** The runtime specifiers one module's text names. */
export const runtimeEdges = (source: string): ReadonlyArray<string> =>
  A.flatMap(A.fromIterable(Str.matchAll(EDGE)(stripComments(source))), (match) => {
    const fromSpecifier = match[2];
    if (fromSpecifier !== undefined) {
      return /^\s*type\b/.test(match[1] ?? "") ? [] : [fromSpecifier];
    }
    return match[3] === undefined ? [] : [match[3]];
  });

/** Resolve `./x.ts` or `../x.ts` against the importing module's directory. */
const resolveFrom = (module: string, specifier: string): string =>
  A.join(
    A.reduce(Str.split(specifier, "/"), A.dropRight(Str.split(module, "/"), 1), (segments, part) =>
      part === ".." ? A.dropRight(segments, 1) : part === "." ? segments : A.append(segments, part)
    ),
    "/"
  );

const isRelative = Str.startsWith(".");

/** One walk step: a module's relative edges resolved, and its bare edges. */
const stepFrom = (module: string): readonly [modules: ReadonlyArray<string>, packages: ReadonlyArray<string>] => {
  const edges = runtimeEdges(textOf(module));
  return [
    A.map(A.filter(edges, isRelative), (specifier) => resolveFrom(module, specifier)),
    A.filter(edges, P.not(isRelative)),
  ];
};

/**
 * The `@beep/managed-section` module a bare specifier names, if any: the root
 * maps to `index.ts`, a subpath `@beep/managed-section/X` to `X.ts`.
 */
const managedSectionModule = (specifier: string): ReadonlyArray<string> =>
  specifier === "@beep/managed-section"
    ? [`${MANAGED_SECTION_ROOT}index.ts`]
    : Str.startsWith("@beep/managed-section/")(specifier)
      ? [`${MANAGED_SECTION_ROOT}${Str.slice("@beep/managed-section/".length)(specifier)}.ts`]
      : [];

/** A closure-walk step: as {@link stepFrom}, plus the managed-section modules a bare edge enters. */
const closureStepFrom = (
  module: string
): readonly [modules: ReadonlyArray<string>, packages: ReadonlyArray<string>] => {
  const [modules, packages] = stepFrom(module);
  return [A.appendAll(modules, A.flatMap(packages, managedSectionModule)), packages];
};

const walkWith =
  (step: typeof stepFrom) =>
  (entry: string): ReadonlyArray<string> => {
    const walk = (
      frontier: ReadonlyArray<string>,
      visited: HashSet.HashSet<string>,
      packages: HashSet.HashSet<string>
    ): HashSet.HashSet<string> => {
      const fresh = A.dedupe(A.filter(frontier, (module) => !HashSet.has(visited, module)));
      if (!A.isReadonlyArrayNonEmpty(fresh)) return packages;
      const steps = A.map(fresh, step);
      return walk(
        A.flatMap(steps, ([modules]) => modules),
        HashSet.union(visited, HashSet.fromIterable(fresh)),
        HashSet.union(packages, HashSet.fromIterable(A.flatMap(steps, ([, bare]) => bare)))
      );
    };
    return A.sort(A.fromIterable(walk([entry], HashSet.empty(), HashSet.empty())), Str.Order);
  };

/**
 * The bare (package) specifiers reachable from one `src` module at runtime.
 * Relative edges are followed; bare edges are collected and not entered.
 */
export const reachablePackages: (entry: string) => ReadonlyArray<string> = walkWith(stepFrom);

/**
 * As {@link reachablePackages}, but a `@beep/managed-section` edge is also
 * entered, so the result holds what that package's modules reach in turn. The
 * entry may be a `src` module or a {@link managedSectionModules} id.
 */
export const reachableClosure: (entry: string) => ReadonlyArray<string> = walkWith(closureStepFrom);
