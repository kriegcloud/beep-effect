// The package's runtime import graph, read from source text.
//
// Vite's glob import inlines every `src` module's raw text at transform time,
// so the walk needs no filesystem. Type-only edges are erased at runtime and
// skipped. Comments go first, LINE comments before BLOCK comments: JSDoc
// examples carry real import statements, and prose such as `@beep/*` would
// otherwise open a block comment and silently hide the imports after it.

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
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

const textOf = (module: string): string =>
  O.getOrThrowWith(R.get(sources, `${SRC_PREFIX}${module}`), () => new Error(`no source module ${module}`));

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

/**
 * The bare (package) specifiers reachable from one `src` module at runtime.
 * Relative edges are followed; bare edges are collected and not entered.
 */
export const reachablePackages = (entry: string): ReadonlyArray<string> => {
  let visited = HashSet.empty<string>();
  let packages = HashSet.empty<string>();
  let frontier: ReadonlyArray<string> = [entry];
  while (A.isReadonlyArrayNonEmpty(frontier)) {
    const next: Array<string> = [];
    for (const module of frontier) {
      if (HashSet.has(visited, module)) continue;
      visited = HashSet.add(visited, module);
      for (const specifier of runtimeEdges(textOf(module))) {
        if (Str.startsWith(".")(specifier)) next.push(resolveFrom(module, specifier));
        else packages = HashSet.add(packages, specifier);
      }
    }
    frontier = next;
  }
  return A.sort(A.fromIterable(packages), Str.Order);
};
