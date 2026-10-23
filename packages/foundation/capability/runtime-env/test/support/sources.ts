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

/**
 * The package's real source files, read at test-collection time by the test bundler rather than through `node:fs`,
 * keyed by their path under `src/` (`RuntimeEnv.ts`, `internal/colorDepth.ts`).
 *
 * @category testing
 * @since 0.0.0
 */
export const SOURCES: HashMap.HashMap<string, string> = HashMap.fromIterable(
  A.map(
    R.toEntries(import.meta.glob<string>("../../src/**/*.ts", { query: "?raw", import: "default", eager: true })),
    ([path, source]) => [Str.slice(10)(path), source] as const
  )
);

/**
 * The text of one package source file, keyed by its path under `src/`; fails loudly for a path outside the
 * package's sources, as a missing-file read would.
 *
 * @category testing
 * @since 0.0.0
 */
export const sourceOf = (file: string): string =>
  O.getOrThrowWith(HashMap.get(SOURCES, file), () => new Error(`no package source at src/${file}`));

const readsMatching =
  (dotted: RegExp) =>
  (source: string): ReadonlyArray<string> =>
    A.flatMap(A.fromIterable(Str.matchAll(dotted)(source)), (match) => A.fromNullishOr(match[1] ?? match[2]));

/**
 * Every environment key a source reads as `env.KEY` (an upper-case key) or `env["KEY"]`, in source order, with
 * duplicates.
 *
 * @category testing
 * @since 0.0.0
 */
export const envReadsOf: (source: string) => ReadonlyArray<string> = readsMatching(
  /(?<![\w./])env(?:\.([A-Z][A-Za-z_]+)|\[\s*"([A-Za-z_]+)"\s*\])/g
);

/**
 * Every environment key a source reads as `env.key` in any case (`env.ConEmuPID`) or `env["KEY"]`, in source order,
 * with duplicates.
 *
 * @category testing
 * @since 0.0.0
 */
export const anyCaseEnvReadsOf: (source: string) => ReadonlyArray<string> = readsMatching(
  /(?<![\w./])env(?:\.([A-Za-z_]+)|\[\s*"([A-Za-z_]+)"\s*\])/g
);
