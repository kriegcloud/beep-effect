/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: letrec
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/letrec.d.ts
 * Generated: 2026-02-19T04:14:22.331Z
 *
 * Overview:
 * For mutually recursive types
 *
 * Source JSDoc Example:
 * ```ts
 * type Leaf = number;
 * type Node = [Tree, Tree];
 * type Tree = Node | Leaf;
 * const { tree } = fc.letrec<{ tree: Tree, node: Node, leaf: Leaf }>(tie => ({
 *   tree: fc.oneof({depthSize: 'small'}, tie('leaf'), tie('node')),
 *   node: fc.tuple(tie('tree'), tie('tree')),
 *   leaf: fc.nat()
 * }));
 * // tree is 50% of node, 50% of leaf
 * // the ratio goes in favor of leaves as we go deeper in the tree (thanks to depthSize)
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FastCheckModule from "effect/testing/FastCheck";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "letrec";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "For mutually recursive types";
const sourceExample =
  "type Leaf = number;\ntype Node = [Tree, Tree];\ntype Tree = Node | Leaf;\nconst { tree } = fc.letrec<{ tree: Tree, node: Node, leaf: Leaf }>(tie => ({\n  tree: fc.oneof({depthSize: 'small'}, tie('leaf'), tie('node')),\n  node: fc.tuple(tie('tree'), tie('tree')),\n  leaf: fc.nat()\n}));\n// tree is 50% of node, 50% of leaf\n// the ratio goes in favor of leaves as we go deeper in the tree (thanks to depthSize)";
const moduleRecord = FastCheckModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleFunctionDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata before attempting invocation.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleFunctionInvocation = Effect.gen(function* () {
  yield* Console.log("Execute a safe zero-arg invocation probe.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧪",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Function Discovery",
      description: "Inspect runtime shape and preview callable details.",
      run: exampleFunctionDiscovery,
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation,
    },
  ],
});

BunRuntime.runMain(program);
