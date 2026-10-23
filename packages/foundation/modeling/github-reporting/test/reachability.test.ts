// The root entry point must never link the markdown engine, and the managed
// document must reach `@beep/managed-section` only through its pure leaves, so
// `effect/FileSystem` (imported by the `ManagedSection` service the
// managed-section ROOT re-exports) stays out of this package's closure. The
// FileSystem check walks INTO the managed-section leaves, so a leaf that later
// imports it fails here too. Each module's exact edge set is pinned, which
// also keeps the `@beep/github` driver (a devDependency, for the CheckState
// wire-set test only) out of `src`.
//
// Checked by walking the RUNTIME import graph of `src` (type-only edges are
// erased and skipped). A bundler dropping unreferenced modules rests on
// `"sideEffects": []` plus module-per-file output; this proves the part the
// package controls: no edge exists.

import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Str from "effect/String";
import {
  reachableClosure,
  reachablePackages,
  runtimeEdges,
  sourceModules,
  stripComments,
} from "./support/sourceGraph.ts";

const isMarkdownEdge = (specifier: string): boolean =>
  specifier === "@beep/markdown" || Str.startsWith("@beep/markdown/")(specifier);

const MANAGED_SECTION_LEAVES = [
  "@beep/managed-section/CommentStyle",
  "@beep/managed-section/Section",
  "@beep/managed-section/SectionDialect",
  "@beep/managed-section/SectionDocument",
];

// The workspace packages `src` may reach at runtime: its `dependencies`, and
// no driver. `@beep/github` is a devDependency and must never appear here.
const ALLOWED_WORKSPACE_ROOTS = [
  "@beep/identity",
  "@beep/managed-section",
  "@beep/markdown",
  "@beep/schema",
  "@beep/utils",
];

const workspaceRoot = (specifier: string): string => A.join(A.take(Str.split(specifier, "/"), 2), "/");

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

  it("the closure walk sees effect/FileSystem behind the managed-section root (the control)", () => {
    // Without this, a walker that never entered managed-section would pass
    // the FileSystem check below vacuously.
    assert.include(reachableClosure("@beep/managed-section/src/index.ts"), "effect/FileSystem");
  });

  it("managed-section is reached through its pure leaves only, and effect/FileSystem never", () => {
    for (const module of sourceModules) {
      const managedSection = A.filter(reachablePackages(module), Str.startsWith("@beep/managed-section"));
      assert.isTrue(
        A.every(managedSection, (specifier) => A.contains(MANAGED_SECTION_LEAVES, specifier)),
        `${module} reaches ${A.join(managedSection, ", ")}`
      );
      assert.notInclude(reachableClosure(module), "effect/FileSystem", `${module} reaches effect/FileSystem`);
    }
    assert.deepStrictEqual(
      A.filter(reachablePackages("index.ts"), Str.startsWith("@beep/managed-section")),
      MANAGED_SECTION_LEAVES
    );
  });

  it("no src module reaches a driver or any workspace package outside its dependencies", () => {
    for (const module of sourceModules) {
      const workspace = A.filter(reachableClosure(module), Str.startsWith("@beep/"));
      for (const specifier of workspace) {
        assert.include(ALLOWED_WORKSPACE_ROOTS, workspaceRoot(specifier), `${module} reaches ${specifier}`);
      }
      assert.isFalse(A.some(workspace, (specifier) => workspaceRoot(specifier) === "@beep/github"));
    }
  });

  it("each module reaches exactly its pinned edge set", () => {
    // Exact edge sets, carried over from the lab test this package replaced:
    // a stray value import fails here rather than in a consumer's bundle, and a
    // blinded walker shows up as an empty set rather than as a pass. The
    // vocabulary reaches nothing but effect and the kit (in particular NOT
    // `@beep/github`, whose conclusion set it mirrors).
    assert.deepStrictEqual(reachablePackages("CheckState.ts"), [
      "@beep/identity/packages",
      "@beep/schema/LiteralKit",
      "effect/Match",
      "effect/Schema",
    ]);
    assert.deepStrictEqual(reachablePackages("ManagedDocument.ts"), [
      "@beep/identity/packages",
      ...MANAGED_SECTION_LEAVES,
      "@beep/utils/Option",
      "effect/Array",
      "effect/Effect",
      "effect/Function",
      "effect/Result",
      "effect/Schema",
      "effect/String",
    ]);
    assert.deepStrictEqual(reachablePackages("CheckDocument.ts"), [
      "@beep/identity/packages",
      ...MANAGED_SECTION_LEAVES,
      "@beep/schema/LiteralKit",
      "@beep/utils/Option",
      "effect/Array",
      "effect/BigInt",
      "effect/Boolean",
      "effect/Clock",
      "effect/Context",
      "effect/DateTime",
      "effect/Duration",
      "effect/Effect",
      "effect/Function",
      "effect/HashMap",
      "effect/Latch",
      "effect/Layer",
      "effect/Match",
      "effect/Number",
      "effect/Option",
      "effect/Predicate",
      "effect/Ref",
      "effect/Result",
      "effect/Schema",
      "effect/Semaphore",
      "effect/String",
    ]);
    assert.deepStrictEqual(reachablePackages("GitHubMarkdown.ts"), [
      "@beep/identity/packages",
      "@beep/markdown/Markdown",
      "@beep/markdown/MarkdownNode",
      "@beep/schema/LiteralKit",
      "@beep/utils/thunk",
      "effect/Array",
      "effect/Function",
      "effect/Option",
      "effect/Predicate",
      "effect/Record",
      "effect/Result",
      "effect/Schema",
      "effect/SchemaAST",
      "effect/String",
    ]);
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
