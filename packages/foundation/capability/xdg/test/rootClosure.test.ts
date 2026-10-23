import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { sourceModules } from "./support/rawModules.ts";

// Runtime import specifiers of one module. `import type` and `export type`
// statements are erased at compile time and never load anything.
const runtimeSpecifier = /^\s*(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s+"([^"]+)"/gm;

const specifiersOf = (source: string): ReadonlyArray<string> =>
  A.map(A.fromIterable(Str.matchAll(runtimeSpecifier)(source)), (match) => match[1] ?? "");

const isRelative = Str.startsWith("./");

/** The `src` modules a runtime import of `entry` loads, and the bare packages they reach. */
const closure = (entry: string) => {
  const visit = (
    pending: ReadonlyArray<string>,
    modules: HashSet.HashSet<string>,
    packages: HashSet.HashSet<string>
  ): { readonly modules: HashSet.HashSet<string>; readonly packages: HashSet.HashSet<string> } =>
    A.match(pending, {
      onEmpty: () => ({ modules, packages }),
      onNonEmpty: ([next, ...rest]) => {
        if (HashSet.has(modules, next)) return visit(rest, modules, packages);
        const specifiers = specifiersOf(R.get(sourceModules, next).pipe(O.getOrThrow));
        const relative = A.filter(specifiers, isRelative);
        const bare = A.filter(specifiers, (specifier) => !isRelative(specifier));
        return visit(
          A.appendAll(rest, A.map(relative, Str.replace("./", ""))),
          HashSet.add(modules, next),
          A.reduce(bare, packages, (set, specifier) => HashSet.add(set, specifier))
        );
      },
    });
  return visit([entry], HashSet.empty<string>(), HashSet.empty<string>());
};

describe("@beep/xdg root closure", () => {
  it.effect("the root barrel never loads XdgConfig, config-file or walker", () =>
    Effect.sync(() => {
      const root = closure("index.ts");
      expect(HashSet.has(root.modules, "XdgBase.ts")).toBe(true);
      expect(HashSet.has(root.modules, "XdgConfig.ts")).toBe(false);
      const packages = pipe(A.fromIterable(root.packages), A.sort(Str.Order));
      expect(A.filter(packages, Str.startsWith("@beep/config-file"))).toEqual([]);
      expect(A.filter(packages, Str.startsWith("@beep/walker"))).toEqual([]);
    })
  );

  it.effect("the XdgConfig subpath is where config-file and walker enter", () =>
    Effect.sync(() => {
      const subpath = closure("XdgConfig.ts");
      expect(HashSet.has(subpath.packages, "@beep/walker/Walker")).toBe(true);
      // XdgConfig imports config-file for types only, so even the subpath does not load it at runtime.
      expect(A.filter(A.fromIterable(subpath.packages), Str.startsWith("@beep/config-file"))).toEqual([]);
    })
  );
});
