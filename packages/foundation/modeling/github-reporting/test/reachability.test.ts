// The root entry point must never link the markdown engine, and the managed
// document must reach `@beep/managed-section` only through its pure leaves, so
// `effect/FileSystem` (imported by the `ManagedSection` service the
// managed-section ROOT re-exports) stays out of this package's closure.
//
// Checked by walking the RUNTIME import graph of `src` (type-only edges are
// erased and skipped). A bundler dropping unreferenced modules rests on
// `"sideEffects": []` plus module-per-file output; this proves the part the
// package controls: no edge exists.

import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { reachablePackages, runtimeEdges, sourceModules, stripComments } from "./support/sourceGraph.ts";

const isMarkdownEdge = (specifier: string): boolean =>
  specifier === "@beep/markdown" || Str.startsWith("@beep/markdown/")(specifier);

const MANAGED_SECTION_LEAVES = [
  "@beep/managed-section/CommentStyle",
  "@beep/managed-section/Section",
  "@beep/managed-section/SectionDialect",
  "@beep/managed-section/SectionDocument",
];

describe("bundle reachability", () => {
  it("GitHubMarkdown DOES reach @beep/markdown (the control: the walker can see the edge)", () => {
    assert.isTrue(A.some(reachablePackages("GitHubMarkdown.ts"), isMarkdownEdge));
  });

  it("the root entry point never reaches @beep/markdown", () => {
    assert.isFalse(A.some(reachablePackages("index.ts"), isMarkdownEdge));
  });

  it("GitHubMarkdown is the only module that reaches @beep/markdown", () => {
    assert.deepStrictEqual(
      A.filter(sourceModules, (module) => A.some(reachablePackages(module), isMarkdownEdge)),
      ["GitHubMarkdown.ts"]
    );
  });

  it("managed-section is reached through its pure leaves only, and effect/FileSystem never", () => {
    for (const module of sourceModules) {
      const packages = reachablePackages(module);
      const managedSection = A.filter(packages, Str.startsWith("@beep/managed-section"));
      assert.isTrue(
        A.every(managedSection, (specifier) => A.contains(MANAGED_SECTION_LEAVES, specifier)),
        `${module} reaches ${A.join(managedSection, ", ")}`
      );
      assert.notInclude(packages, "effect/FileSystem");
    }
    assert.deepStrictEqual(
      A.filter(reachablePackages("index.ts"), Str.startsWith("@beep/managed-section")),
      MANAGED_SECTION_LEAVES
    );
  });

  it("the comment stripper removes prose imports and keeps code", () => {
    // A blinded scan is a silent false green, so the stripper gets its own
    // discriminating test.
    const source = A.join(
      [
        '// import { Markdown } from "@beep/markdown";',
        "/**",
        " * Prose naming @beep/* and an example:",
        ' * import { Markdown } from "@beep/markdown/Markdown";',
        " */",
        'import * as Str from "effect/String";',
        'import type { Root } from "@beep/markdown/MarkdownNode";',
        'export { x } from "./x.ts";',
        'import "./side-effect.ts";',
        'const lazy = () => import("./lazy.ts");',
      ],
      "\n"
    );
    assert.notInclude(stripComments(source), '@beep/markdown"');
    assert.deepStrictEqual(runtimeEdges(source), ["effect/String", "./x.ts", "./side-effect.ts", "./lazy.ts"]);
  });
});
