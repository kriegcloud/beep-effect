// The package's runtime import graph, read from source text.
//
// Vite's glob import inlines every `src` module's raw text at transform time,
// so the walk needs no filesystem. The `@beep/managed-section` sources are
// inlined the same way, so a closure walk can enter that package through the
// leaves this package imports and see what they reach in turn. Type-only edges are erased at runtime and
// skipped. Comments go first, LINE comments before BLOCK comments: JSDoc
// examples carry real import statements, and prose such as `@beep/*` would
// otherwise open a block comment and silently hide the imports after it.

import * as ImportGraph from "@beep/test-utils/ImportGraph";
import * as A from "effect/Array";
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

const MANAGED_SECTION_PREFIX = "../../../managed-section/src/";

const managedSectionSources = import.meta.glob<string>("../../../managed-section/src/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * The module-id root under which `@beep/managed-section` sources are walked:
 * `src/X.ts` there is the module `@beep/managed-section/src/X.ts`.
 */
const MANAGED_SECTION_ROOT = "@beep/managed-section/src/";

const textOf = (module: string): string =>
  O.getOrThrowWith(
    Str.startsWith(MANAGED_SECTION_ROOT)(module)
      ? R.get(managedSectionSources, `${MANAGED_SECTION_PREFIX}${Str.slice(MANAGED_SECTION_ROOT.length)(module)}`)
      : R.get(sources, `${SRC_PREFIX}${module}`),
    () => new Error(`no source module ${module}`)
  );

export { runtimeEdges, stripComments } from "@beep/test-utils/ImportGraph";

/**
 * The `@beep/managed-section` module a bare specifier names, if any: the root
 * maps to `index.ts`, a subpath `@beep/managed-section/X` to `X.ts`.
 */
const managedSectionModule = (specifier: string): ReadonlyArray<string> =>
  specifier === "@beep/managed-section"
    ? [`${MANAGED_SECTION_ROOT}index.ts`]
    : Str.startsWith("@beep/managed-section/")(specifier)
      ? [`${MANAGED_SECTION_ROOT}${Str.slice("@beep/managed-section/".length)(specifier)}.ts`]
      : [];

/** Bare packages reached through relative source imports. */
export const reachablePackages = ImportGraph.make({ textOf }).reachablePackages;

/** Bare packages reached through relative imports and managed-section entries. */
export const reachableClosure = ImportGraph.make({ textOf, enterPackage: managedSectionModule }).reachablePackages;
