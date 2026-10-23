// The package's import graph, read from source text that Vite's raw glob
// import inlines at transform time, so the walk touches no filesystem and runs
// the same under Node and Bun (the package test runner is `bunx --bun vitest`).
//
// Sized to this package: every `src` module is a flat sibling, so a relative
// edge is always `./<Module>.ts`, and anything else fails loudly instead of
// being resolved by guesswork. Only top-of-line `import`/`export` statements
// count, which is what keeps the `import` lines inside JSDoc examples (written
// ` * import …`) and prose in comments out of the graph without a comment
// stripper.

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";

declare global {
  interface ImportMeta {
    glob<T>(
      pattern: string,
      options: { readonly query: "?raw"; readonly import: "default"; readonly eager: true }
    ): Readonly<Record<string, T>>;
  }
}

const SRC = "../../src/";

const sources = import.meta.glob<string>("../../src/*.ts", { query: "?raw", import: "default", eager: true });

/** Every `src` module by file name (for example `"Sbom.ts"`), sorted. */
export const sourceModules: ReadonlyArray<string> = A.sort(A.map(R.keys(sources), Str.slice(SRC.length)), Str.Order);

/** The raw text of one `src` module; fails loudly for a module that does not exist. */
export const sourceOf = (module: string): string =>
  O.getOrThrowWith(R.get(sources, `${SRC}${module}`), () => new Error(`no source module src/${module}`));

// A statement edge: `import|export [type] <clause> from "x"`, where the clause
// is a default binding, a named list, a namespace or a star re-export. Group 1
// is `type` for an erased edge, group 2 the specifier. Requiring a clause shape
// keeps a declaration such as `export class X {` whose body holds the word
// `from` inside a string from becoming a phantom edge.
const CLAUSE_EDGE =
  /^(?:import|export)\s+(type\s+)?(?:[\w$]+\s*,\s*)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?|[\w$]+)\s+from\s+"([^"]+)"/gm;

// A side-effect import: `import "x"`.
const BARE_IMPORT = /^import\s+"([^"]+)"/gm;

/** The edges one module's text names, split into runtime and erased (type-only) specifiers. */
export const edgesOf = (
  source: string
): { readonly runtime: ReadonlyArray<string>; readonly typeOnly: ReadonlyArray<string> } => {
  const clauses = A.fromIterable(Str.matchAll(CLAUSE_EDGE)(source));
  const specifierOf = (match: RegExpMatchArray): ReadonlyArray<string> => (match[2] === undefined ? [] : [match[2]]);
  return {
    runtime: A.appendAll(
      A.flatMap(
        A.filter(clauses, (match) => match[1] === undefined),
        specifierOf
      ),
      A.flatMap(A.fromIterable(Str.matchAll(BARE_IMPORT)(source)), (match) =>
        match[1] === undefined ? [] : [match[1]]
      )
    ),
    typeOnly: A.flatMap(
      A.filter(clauses, (match) => match[1] !== undefined),
      specifierOf
    ),
  };
};

const SIBLING = /^\.\/([A-Za-z]+\.ts)$/;

/** The sibling module a relative specifier names; anything but `./<Module>.ts` is a walker error. */
const siblingOf = (specifier: string): string =>
  pipe(
    O.fromNullishOr(SIBLING.exec(specifier)),
    O.flatMap((match) => O.fromNullishOr(match[1])),
    O.getOrThrowWith(() => new Error(`unexpected relative specifier ${specifier}`))
  );

const isRelative = Str.startsWith(".");

/**
 * The runtime closure of one `src` module: the sibling modules it reaches and
 * the bare package specifiers those modules import. Relative edges are
 * followed; bare edges are collected and not entered; type-only edges are
 * skipped because they are erased.
 */
export const runtimeClosure = (
  entry: string
): { readonly modules: ReadonlyArray<string>; readonly packages: ReadonlyArray<string> } => {
  const walk = (
    frontier: ReadonlyArray<string>,
    modules: HashSet.HashSet<string>,
    packages: HashSet.HashSet<string>
  ): readonly [HashSet.HashSet<string>, HashSet.HashSet<string>] => {
    const fresh = A.dedupe(A.filter(frontier, (module) => !HashSet.has(modules, module)));
    if (!A.isReadonlyArrayNonEmpty(fresh)) return [modules, packages];
    const edges = A.flatMap(fresh, (module) => edgesOf(sourceOf(module)).runtime);
    return walk(
      A.map(A.filter(edges, isRelative), siblingOf),
      HashSet.union(modules, HashSet.fromIterable(fresh)),
      HashSet.union(packages, HashSet.fromIterable(A.filter(edges, (edge) => !isRelative(edge))))
    );
  };
  const [modules, packages] = walk([entry], HashSet.empty(), HashSet.empty());
  return { modules: A.sort(A.fromIterable(modules), Str.Order), packages: A.sort(A.fromIterable(packages), Str.Order) };
};

/** The workspace or npm package a bare specifier belongs to (`@beep/spdx/License` is `@beep/spdx`). */
export const packageOf = (specifier: string): string =>
  A.join(A.take(Str.split(specifier, "/"), Str.startsWith("@")(specifier) ? 2 : 1), "/");
