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

/**
 * The package's real source files, read at test-collection time by the test
 * bundler rather than through `node:fs`, keyed `schema-org/src/<path>`.
 *
 * @category testing
 * @since 0.0.0
 */
const SOURCES: HashMap.HashMap<string, string> = HashMap.fromIterable(
  A.map(
    R.toEntries(import.meta.glob<string>("../src/**/*.ts", { query: "?raw", import: "default", eager: true })),
    ([path, source]) => [`schema-org/${Str.slice(3)(path)}`, source] as const
  )
);

/** The text of one package source file; fails loudly outside the package's sources, as a missing-file read would. */
const sourceOf = (file: string): string =>
  O.getOrThrowWith(HashMap.get(SOURCES, file), () => new Error(`no package source at ${file}`));

/**
 * The UTF-8 size of one package source file, in bytes.
 *
 * @category testing
 * @since 0.0.0
 */
export const byteLengthOf = (file: string): number => new TextEncoder().encode(sourceOf(file)).length;

/** Resolves a relative import specifier against the importing file's directory. */
const resolveSpecifier = (file: string, specifier: string): string => {
  const parts = A.dropRight(Str.split(file, "/"), 1);
  for (const segment of Str.split(specifier, "/")) {
    if (segment === "..") parts.pop();
    else if (segment !== ".") parts.push(segment);
  }
  return A.join(parts, "/");
};

/** Every relative import specifier in a module, resolved to a source path. */
const importsOf = (file: string): ReadonlyArray<string> =>
  pipe(
    A.fromIterable(Str.matchAll(/from\s+"(\.[^"]+)"/g)(sourceOf(file))),
    A.map((match) => resolveSpecifier(file, Str.replace(/\.js$/, ".ts")(match[1] ?? "")))
  );

/**
 * Every module reachable from an entrypoint, transitively.
 *
 * @category testing
 * @since 0.0.0
 */
export const reachableFrom = (entry: string): HashSet.HashSet<string> => {
  let seen = HashSet.empty<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop();
    if (file === undefined || HashSet.has(seen, file)) continue;
    seen = HashSet.add(seen, file);
    for (const next of importsOf(file)) queue.push(next);
  }
  return seen;
};
