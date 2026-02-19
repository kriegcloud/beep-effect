/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/FastCheck
 * Export: memo
 * Kind: function
 * Source: node_modules/fast-check/lib/types/arbitrary/memo.d.ts
 * Generated: 2026-02-19T04:14:22.332Z
 *
 * Overview:
 * For mutually recursive types
 *
 * Source JSDoc Example:
 * ```ts
 * // tree is 1 / 3 of node, 2 / 3 of leaf
 * const tree: fc.Memo<Tree> = fc.memo(n => fc.oneof(node(n), leaf(), leaf()));
 * const node: fc.Memo<Tree> = fc.memo(n => {
 *   if (n <= 1) return fc.record({ left: leaf(), right: leaf() });
 *   return fc.record({ left: tree(), right: tree() }); // tree() is equivalent to tree(n-1)
 * });
 * const leaf = fc.nat;
 * ```
 *
 * Focus:
 * - Function export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as FastCheckModule from "effect/testing/FastCheck";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "memo";
const exportKind = "function";
const moduleImportPath = "effect/testing/FastCheck";
const sourceSummary = "For mutually recursive types";
const sourceExample = "// tree is 1 / 3 of node, 2 / 3 of leaf\nconst tree: fc.Memo<Tree> = fc.memo(n => fc.oneof(node(n), leaf(), leaf()));\nconst node: fc.Memo<Tree> = fc.memo(n => {\n  if (n <= 1) return fc.record({ left: leaf(), right: leaf() });\n  return fc.record({ left: tree(), right: tree() }); // tree() is equivalent to tree(n-1)\n});\nconst leaf = fc.nat;";
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
      run: exampleFunctionDiscovery
    },
    {
      title: "Zero-Arg Invocation Probe",
      description: "Attempt invocation and report success/failure details.",
      run: exampleFunctionInvocation
    }
  ]
});

BunRuntime.runMain(program);
