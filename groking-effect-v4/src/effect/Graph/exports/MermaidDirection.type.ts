/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: MermaidDirection
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.624Z
 *
 * Overview:
 * Mermaid diagram direction types for controlling layout orientation.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Graph from "effect/Graph"
 * 
 * // Horizontal workflow diagram
 * const horizontalOptions: Graph.MermaidOptions<string, string> = {
 *   direction: "LR"
 * }
 * 
 * // Vertical hierarchy (default)
 * const verticalOptions: Graph.MermaidOptions<string, string> = {
 *   direction: "TB"
 * }
 * 
 * // Bottom-up flow
 * const bottomUpOptions: Graph.MermaidOptions<string, string> = {
 *   direction: "BT"
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as GraphModule from "effect/Graph";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MermaidDirection";
const exportKind = "type";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Mermaid diagram direction types for controlling layout orientation.";
const sourceExample = "import type * as Graph from \"effect/Graph\"\n\n// Horizontal workflow diagram\nconst horizontalOptions: Graph.MermaidOptions<string, string> = {\n  direction: \"LR\"\n}\n\n// Vertical hierarchy (default)\nconst verticalOptions: Graph.MermaidOptions<string, string> = {\n  direction: \"TB\"\n}\n\n// Bottom-up flow\nconst bottomUpOptions: Graph.MermaidOptions<string, string> = {\n  direction: \"BT\"\n}";
const moduleRecord = GraphModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
