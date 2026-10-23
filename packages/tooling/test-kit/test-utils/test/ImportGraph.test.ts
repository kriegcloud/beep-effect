import * as ImportGraph from "@beep/test-utils/ImportGraph";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type * as HashSet from "effect/HashSet";

const sources: Readonly<Record<string, string>> = {
  "index.ts": 'export { x } from "./nested/x.ts";\nimport "pkg";',
  "nested/x.ts": 'import "../index.ts";\nimport "./x.ts";\nimport "leaf";',
  "pkg/index.ts": 'import "transitive";',
};
const textOf = (module: string): string => O.getOrThrow(R.get(sources, module));
const sorted = (set: HashSet.HashSet<string>) => A.sort(A.fromIterable(set), Str.Order);

describe("ImportGraph", () => {
  it("walks relative paths, cycles and repeated edges once while retaining the entry", () => {
    const graph = ImportGraph.make({ textOf });
    const closure = graph.runtimeClosure("index.ts");
    assert.deepStrictEqual(sorted(closure.modules), ["index.ts", "nested/x.ts"]);
    assert.deepStrictEqual(sorted(closure.packages), ["leaf", "pkg"]);
    assert.deepStrictEqual(graph.reachablePackages("index.ts"), ["leaf", "pkg"]);
  });

  it("enters only configured bare packages and keeps their original specifiers", () => {
    const graph = ImportGraph.make({
      textOf,
      enterPackage: (specifier) => (specifier === "pkg" ? ["pkg/index.ts"] : []),
    });
    assert.deepStrictEqual(graph.reachablePackages("index.ts"), ["leaf", "pkg", "transitive"]);
  });

  it("ignores prose and type-only edges while keeping all runtime edge forms in order", () => {
    const source = A.join(
      [
        "// A wildcard path @beep/* must not open a block comment.",
        '/** import "hidden"; */',
        'import type { X } from "types";',
        'export type { Y } from "types-too";',
        'import { value } from "runtime";',
        'export { value } from "./local.ts";',
        'import "side-effect";',
        'const lazy = () => import("dynamic");',
      ],
      "\n"
    );
    assert.deepStrictEqual(ImportGraph.runtimeEdges(source), ["runtime", "./local.ts", "side-effect", "dynamic"]);
  });

  it("delegates missing sources to the supplied reader instead of silently skipping them", () => {
    assert.throws(() => ImportGraph.make({ textOf }).runtimeClosure("missing.ts"));
  });
});
