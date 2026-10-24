// The package's runtime import graph, read from source text Vite's raw glob
// import inlines at transform time, so the scans touch no filesystem and run
// the same under Node and Bun (the package test runner is `bunx --bun vitest`).
//
// Sized to this package: public modules are flat siblings of `src/` and the
// seams live one level down in `src/internal/`, so a relative edge resolves to
// `<Module>.ts` or `internal/<module>.ts` and anything that would leave `src`
// fails loudly. An edge is a top-of-line `import`/`export … from` statement, a
// side-effect `import "x"`, or a literal `process.getBuiltinModule("node:…")`
// load (how this package reaches `node:crypto` and `node:fs`). Only top-of-line
// statements count, which keeps JSDoc example imports (written ` * import …`)
// and prose out of the graph without a comment stripper; `import type` and
// `export type` statements are erased at runtime and kept apart.

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";

const SRC_PREFIX = "../../src/";

const rawSources = import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true });

/** Every `src` module by its `src`-relative path (`"ActionCache.ts"`, `"internal/twirp.ts"`), sorted. */
export const sourceModules: ReadonlyArray<string> = A.sort(
  A.map(R.keys(rawSources), Str.slice(SRC_PREFIX.length)),
  Str.Order
);

/** The raw text of one `src` module; a module that does not exist fails loudly. */
export const sourceOf = (module: string): string =>
  O.getOrThrowWith(R.get(rawSources, `${SRC_PREFIX}${module}`), () => new Error(`no source module src/${module}`));

// `import|export [type] <clause> from "x"`: group 1 is `type` for an erased
// edge, group 2 the specifier. The clause is a default binding, a named list,
// a namespace or a star re-export, so a declaration whose body mentions `from`
// inside a string never becomes an edge.
const STATEMENT_EDGE =
  /^(?:import|export)\s+(type\s+)?(?:[\w$]+\s*,\s*)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?|[\w$]+)\s+from\s+"([^"]+)"/gm;
const SIDE_EFFECT_EDGE = /^import\s+"([^"]+)"/gm;
const BUILTIN_EDGE = /\bprocess\.getBuiltinModule\(\s*"(node:[^"]+)"\s*\)/g;

const capture = (pattern: RegExp, group: number, source: string): ReadonlyArray<string> =>
  A.getSomes(A.map(A.fromIterable(Str.matchAll(pattern)(source)), (match) => O.fromUndefinedOr(match[group])));

/** The edges one module's text names, split into runtime and erased (type-only) specifiers. */
export const edgesOf = (
  source: string
): { readonly runtime: ReadonlyArray<string>; readonly typeOnly: ReadonlyArray<string> } => {
  const statements = A.fromIterable(Str.matchAll(STATEMENT_EDGE)(source));
  const isErased = (match: RegExpMatchArray) => match[1] !== undefined;
  const specifiers = (matches: ReadonlyArray<RegExpMatchArray>) =>
    A.getSomes(A.map(matches, (match) => O.fromUndefinedOr(match[2])));
  return {
    runtime: pipe(
      specifiers(A.filter(statements, (match) => !isErased(match))),
      A.appendAll(capture(SIDE_EFFECT_EDGE, 1, source)),
      A.appendAll(capture(BUILTIN_EDGE, 1, source))
    ),
    typeOnly: specifiers(A.filter(statements, isErased)),
  };
};

const isRelative = Str.startsWith(".");

/** The `src` module a relative specifier in `from` names; a specifier that leaves `src` is a walker error. */
export const resolveSibling = (from: string, specifier: string): string => {
  const segments = A.appendAll(A.dropRight(Str.split(from, "/"), 1), Str.split(specifier, "/"));
  const resolved = A.reduce(segments, A.empty<string>(), (path, segment) => {
    if (segment === "." || segment === "") return path;
    if (segment !== "..") return A.append(path, segment);
    if (!A.isReadonlyArrayNonEmpty(path)) throw new Error(`${specifier} in src/${from} leaves src`);
    return A.dropRight(path, 1);
  });
  return A.join(resolved, "/");
};

/**
 * The runtime closure of one `src` module: the modules it reaches and the bare
 * specifiers those modules import, each sorted. Relative edges are followed,
 * bare edges are collected and not entered, and erased edges are skipped.
 */
export const runtimeClosure = (
  entry: string
): { readonly modules: ReadonlyArray<string>; readonly packages: ReadonlyArray<string> } => {
  const modules = MutableHashSet.empty<string>();
  const packages = MutableHashSet.empty<string>();
  let frontier: ReadonlyArray<string> = [entry];
  while (A.isReadonlyArrayNonEmpty(frontier)) {
    const fresh = A.dedupe(A.filter(frontier, (module) => !MutableHashSet.has(modules, module)));
    for (const module of fresh) MutableHashSet.add(modules, module);
    frontier = A.flatMap(fresh, (module) => {
      const { runtime } = edgesOf(sourceOf(module));
      for (const specifier of A.filter(runtime, (edge) => !isRelative(edge))) MutableHashSet.add(packages, specifier);
      return A.map(A.filter(runtime, isRelative), (specifier) => resolveSibling(module, specifier));
    });
  }
  return {
    modules: A.sort(A.fromIterable(modules), Str.Order),
    packages: A.sort(A.fromIterable(packages), Str.Order),
  };
};

/** The workspace or npm package a bare specifier belongs to (`@beep/glob/GlobSet` is `@beep/glob`). */
export const packageOf = (specifier: string): string =>
  A.join(A.take(Str.split(specifier, "/"), Str.startsWith("@")(specifier) ? 2 : 1), "/");
