// Runtime import facts about @beep/md's own sources, read from their text.
//
// Vite inlines every `src` module's raw text at transform time, so the walk
// needs no filesystem. Type-only edges (`import type`, `export type`) are
// erased at runtime and skipped. Comments are removed first (line comments,
// then block comments) because JSDoc examples carry real import statements.

import * as ImportGraph from "@beep/test-utils/ImportGraph";
import * as A from "effect/Array";
import * as HashMap from "effect/HashMap";
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

const graph = ImportGraph.make({ textOf });

/** The runtime specifiers imported by a package source module. */
export const runtimeImportsOf = graph.runtimeImportsOf;

/** The relative modules and bare packages reached by an entry. */
export const runtimeClosure = graph.runtimeClosure;
