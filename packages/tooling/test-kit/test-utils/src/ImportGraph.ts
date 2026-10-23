/**
 * Source-text import graph helpers for package runtime-boundary tests.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

/**
 * Remove line comments before block comments so prose naming wildcard paths cannot hide code.
 *
 * **Example** (Discard a commented import)
 * ```ts
 * import { stripComments } from "@beep/test-utils/ImportGraph";
 * stripComments('// import "hidden";\nimport "visible";') // => '\nimport "visible";'
 * ```
 * @category testing
 * @since 0.0.0
 */
export const stripComments = (source: string): string =>
  pipe(source, Str.replace(/(^|\n)\s*\/\/.*/g, "$1"), Str.replace(/\/\*[\s\S]*?\*\//g, ""));

const EDGE = /(?:^|\n)\s*(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']|\bimport\s*\(?\s*["']([^"']+)["']/g;

/**
 * Collect runtime imports and re-exports, skipping whole type-only clauses.
 *
 * **Example** (Keep runtime edges)
 * ```ts
 * import { runtimeEdges } from "@beep/test-utils/ImportGraph";
 * runtimeEdges('import type { X } from "types";\nimport "runtime";') // => ["runtime"]
 * ```
 * @category testing
 * @since 0.0.0
 */
export const runtimeEdges = (source: string): ReadonlyArray<string> =>
  A.flatMap(A.fromIterable(Str.matchAll(EDGE)(stripComments(source))), (match) => {
    const fromSpecifier = match[2];
    if (fromSpecifier !== undefined) {
      return /^\s*type\b/.test(match[1] ?? "") ? [] : [fromSpecifier];
    }
    return A.fromNullishOr(match[3]);
  });

const resolveFrom = (module: string, specifier: string): string =>
  A.join(
    A.reduce(Str.split(specifier, "/"), A.dropRight(Str.split(module, "/"), 1), (segments, part) =>
      part === ".." ? A.dropRight(segments, 1) : part === "." ? segments : A.append(segments, part)
    ),
    "/"
  );

const isRelative = Str.startsWith(".");

/**
 * Build a cycle-safe runtime graph from caller-owned source text and optional package entry edges.
 *
 * **Details**
 * Relative imports resolve against the importing module. Bare specifiers are collected and
 * entered only when `enterPackage` supplies module ids. Missing-source behavior belongs to `textOf`.
 *
 * **Example** (Walk a module's packages)
 * ```ts
 * import { make } from "@beep/test-utils/ImportGraph";
 * const graph = make({ textOf: () => 'import "effect/String";' });
 * graph.reachablePackages("index.ts") // => ["effect/String"]
 * ```
 * @category testing
 * @since 0.0.0
 */
export const make = (options: {
  readonly textOf: (module: string) => string;
  readonly enterPackage?: (specifier: string) => ReadonlyArray<string>;
}) => {
  const { textOf } = options;
  const enterPackage = options.enterPackage ?? (() => A.empty<string>());
  const runtimeImportsOf = (module: string): ReadonlyArray<string> => runtimeEdges(textOf(module));
  const runtimeClosure = (entry: string) => {
    let modules = HashSet.empty<string>();
    let packages = HashSet.empty<string>();
    let frontier: ReadonlyArray<string> = [entry];
    while (A.isReadonlyArrayNonEmpty(frontier)) {
      const next: string[] = [];
      for (const module of frontier) {
        if (HashSet.has(modules, module)) continue;
        modules = HashSet.add(modules, module);
        const edges = runtimeImportsOf(module);
        const bare = A.filter(edges, P.not(isRelative));
        packages = HashSet.union(packages, HashSet.fromIterable(bare));
        next.push(...A.map(A.filter(edges, isRelative), (specifier) => resolveFrom(module, specifier)));
        next.push(...A.flatMap(bare, enterPackage));
      }
      frontier = next;
    }
    return { modules, packages };
  };
  const reachablePackages = (entry: string): ReadonlyArray<string> =>
    A.sort(A.fromIterable(runtimeClosure(entry).packages), Str.Order);
  return { runtimeImportsOf, runtimeClosure, reachablePackages };
};
