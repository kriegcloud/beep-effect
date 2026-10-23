// Runtime import facts about @beep/md's own sources, read from their text.
//
// Vite inlines every `src` module's raw text at transform time, so the walk
// needs no filesystem. Type-only edges (`import type`, `export type`) are
// erased at runtime and skipped. Comments are removed first (line comments,
// then block comments) because JSDoc examples carry real import statements.

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
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

const SRC_PREFIX = "../../src/";

/** Every package source module's text, keyed by its path under `src/`. */
export const SOURCES: HashMap.HashMap<string, string> = HashMap.fromIterable(
  A.map(
    R.toEntries(import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true })),
    ([path, text]) => [Str.slice(SRC_PREFIX.length)(path), text] as const
  )
);

const textOf = (module: string): string =>
  O.getOrThrowWith(HashMap.get(SOURCES, module), () => new Error(`no package source at src/${module}`));

// `from "x"` clauses (group 1 is the clause, group 2 the specifier), bare
// side-effect imports and dynamic imports.
const FROM_EDGE = /(?:^|\n)\s*(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']/g;
const BARE_EDGE = /(?:^|\n)\s*import\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const TYPE_ONLY = /^\s*type\b/;

const withoutComments = (text: string): string =>
  pipe(text, Str.replace(/(^|\n)\s*\/\/.*/g, "$1"), Str.replace(/\/\*[\s\S]*?\*\//g, ""));

/** The runtime specifiers one source module imports, in source order. */
export const runtimeImportsOf = (module: string): ReadonlyArray<string> => {
  const code = withoutComments(textOf(module));
  return [
    ...A.flatMap(A.fromIterable(Str.matchAll(FROM_EDGE)(code)), (match) =>
      TYPE_ONLY.test(match[1] ?? "") ? [] : A.fromNullishOr(match[2])
    ),
    ...A.flatMap(A.fromIterable(Str.matchAll(BARE_EDGE)(code)), (match) => A.fromNullishOr(match[1] ?? match[2])),
  ];
};

const resolveFrom = (module: string, specifier: string): string =>
  A.join(
    A.reduce(Str.split(specifier, "/"), A.dropRight(Str.split(module, "/"), 1), (segments, part) =>
      part === ".." ? A.dropRight(segments, 1) : part === "." ? segments : A.append(segments, part)
    ),
    "/"
  );

/** The modules an entry reaches at runtime (itself included) and the packages they import. */
interface RuntimeClosure {
  readonly modules: HashSet.HashSet<string>;
  readonly packages: HashSet.HashSet<string>;
}

/** Walk an entry module's runtime import closure, following relative edges only. */
export const runtimeClosure = (entry: string): RuntimeClosure => {
  const step = (closure: RuntimeClosure, module: string): RuntimeClosure => {
    if (HashSet.has(closure.modules, module)) {
      return closure;
    }
    const specifiers = runtimeImportsOf(module);
    const visited: RuntimeClosure = {
      modules: HashSet.add(closure.modules, module),
      packages: A.reduce(A.filter(specifiers, Str.isNonEmpty), closure.packages, (packages, specifier) =>
        Str.startsWith(".")(specifier) ? packages : HashSet.add(packages, specifier)
      ),
    };
    return A.reduce(A.filter(specifiers, Str.startsWith(".")), visited, (next, specifier) =>
      step(next, resolveFrom(module, specifier))
    );
  };
  return step({ modules: HashSet.empty(), packages: HashSet.empty() }, entry);
};
