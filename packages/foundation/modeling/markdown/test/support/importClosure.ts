// The runtime import closure of a package module, read from source text.
//
// Vite's glob import inlines every `src` module's raw text at transform time
// (the yaml `fixture-text.ts` precedent), so the walk needs no filesystem.
// `import type` / `export type` edges are skipped because they are erased.
// Comments are stripped first, line comments before block comments, because
// JSDoc examples carry real import statements and prose such as `@beep/*`
// would otherwise open a block comment (the scratchpad github-actions
// reachability walker's ordering rule).

import * as A from "effect/Array";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";

/** The subset of Vite's `import.meta.glob` signature the walker uses. */
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

const sources = import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true });

const IMPORT_PATTERN = /(?:^|\n)\s*(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']/g;
const TYPE_CLAUSE = /^\s*type\b/;

// Side-effect (`import "x"`) and dynamic (`import("x")`) edges load modules
// too; neither has a `from` clause, so each needs its own pattern.
const SIDE_EFFECT_PATTERN = /(?:^|\n)\s*import\s*["']([^"']+)["']/g;
const DYNAMIC_PATTERN = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

const runtimeSpecifiers = (source: string): ReadonlyArray<string> => {
  const code = source.replace(/(^|\n)\s*\/\/.*/g, "$1").replace(/\/\*[\s\S]*?\*\//g, "");
  const fromEdges = A.flatMap(A.fromIterable(code.matchAll(IMPORT_PATTERN)), (match) => {
    const specifier = match[2];
    return specifier === undefined || TYPE_CLAUSE.test(match[1] ?? "") ? [] : [specifier];
  });
  const bareEdges = A.flatMap([...code.matchAll(SIDE_EFFECT_PATTERN), ...code.matchAll(DYNAMIC_PATTERN)], (match) =>
    match[1] === undefined ? [] : [match[1]]
  );
  return A.appendAll(fromEdges, bareEdges);
};

// Resolve a relative specifier against the importing module's `src`-relative
// directory, folding `.` and `..` segments.
const resolveRelative = (from: string, specifier: string): string => {
  const segments = A.dropRight(Str.split(from, "/"), 1);
  for (const part of Str.split(specifier, "/")) {
    if (part === "..") segments.pop();
    else if (part !== ".") segments.push(part);
  }
  return A.join(segments, "/");
};

/** The result of walking one entry module's runtime import closure. */
export interface ImportClosure {
  /** Every `src`-relative module reached, the entry included. */
  readonly modules: ReadonlyArray<string>;
  /** Every bare (package) specifier any reached module imports at runtime. */
  readonly packages: ReadonlyArray<string>;
}

/**
 * Walk the runtime import closure of a module under `src`, addressed relative
 * to `src/` (for example `"index.ts"`). Relative edges are followed; bare
 * edges are collected and not entered.
 */
export const importClosure = (entry: string): ImportClosure => {
  const modules = MutableHashSet.empty<string>();
  const packages = MutableHashSet.empty<string>();
  const pending = [entry];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    if (MutableHashSet.has(modules, next)) continue;
    MutableHashSet.add(modules, next);
    const source = O.getOrThrowWith(R.get(sources, `../../src/${next}`), () => new Error(`no source for ${next}`));
    for (const specifier of runtimeSpecifiers(source)) {
      if (Str.startsWith(".")(specifier)) pending.push(resolveRelative(next, specifier));
      else MutableHashSet.add(packages, specifier);
    }
  }
  return {
    modules: A.sort(A.fromIterable(modules), Str.Order),
    packages: A.sort(A.fromIterable(packages), Str.Order),
  };
};
