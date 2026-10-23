// The runtime import closure of a package module, read from source text that
// Vite's raw glob import inlines at transform time (no filesystem at test time).
//
// Only top-of-line `import … from` / `export … from` statements count, so the
// `import` lines inside JSDoc examples (prefixed with ` * `) never match, and
// `import type` / `export type` statements are skipped because they are erased.

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as Str from "effect/String";

const moduleSources = import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true });

const RUNTIME_EDGE = /^(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s*"([^"]+)"/gm;

const sourceOf = (module: string): string =>
  O.getOrThrowWith(R.get(moduleSources, `../../src/${module}`), () => new Error(`no source for src/${module}`));

const runtimeEdgesOf = (module: string): ReadonlyArray<string> =>
  pipe(
    sourceOf(module),
    Str.matchAll(RUNTIME_EDGE),
    A.fromIterable,
    A.flatMap((match) => (match[1] === undefined ? [] : [match[1]]))
  );

// `src`-relative path of a relative specifier imported from `module`.
const resolveFrom = (module: string, specifier: string): string =>
  A.join(
    A.reduce(Str.split(specifier, "/"), A.dropRight(Str.split(module, "/"), 1), (segments, part) =>
      part === ".." ? A.dropRight(segments, 1) : part === "." ? segments : A.append(segments, part)
    ),
    "/"
  );

/** The `src` modules and the bare package specifiers reached from one entry module at runtime. */
export const runtimeClosureOf = (
  entry: string
): { readonly modules: ReadonlyArray<string>; readonly packages: ReadonlyArray<string> } => {
  const modules = MutableHashSet.empty<string>();
  const packages = MutableHashSet.empty<string>();
  // Relative edges are followed; bare package edges are collected, not entered.
  const visit = (module: string): ReadonlyArray<string> => {
    if (MutableHashSet.has(modules, module)) return [];
    MutableHashSet.add(modules, module);
    const [relative, bare] = A.partition(runtimeEdgesOf(module), (specifier) =>
      Str.startsWith(".")(specifier) ? Result.succeed(specifier) : Result.fail(specifier)
    );
    A.forEach(bare, (specifier) => MutableHashSet.add(packages, specifier));
    return A.map(relative, (specifier) => resolveFrom(module, specifier));
  };
  let pending: ReadonlyArray<string> = [entry];
  while (A.isReadonlyArrayNonEmpty(pending)) pending = A.flatMap(pending, visit);
  return { modules: A.fromIterable(modules), packages: A.fromIterable(packages) };
};
