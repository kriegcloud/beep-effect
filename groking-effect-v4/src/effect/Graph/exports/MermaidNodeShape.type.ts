/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: MermaidNodeShape
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.807Z
 *
 * Overview:
 * Mermaid node shape types for diagram visualization.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Shape selector function for different node types
 * const shapeSelector = (nodeData: string): Graph.MermaidNodeShape => {
 *   if (nodeData.includes("start") || nodeData.includes("end")) return "circle"
 *   if (nodeData.includes("decision")) return "diamond"
 *   if (nodeData.includes("process")) return "rectangle"
 *   if (nodeData.includes("data")) return "cylindrical"
 *   return "rounded"
 * }
 *
 * const options: Graph.MermaidOptions<string, string> = {
 *   nodeShape: shapeSelector
 * }
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as GraphModule from "effect/Graph";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MermaidNodeShape";
const exportKind = "type";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Mermaid node shape types for diagram visualization.";
const sourceExample =
  'import type * as Graph from "effect/Graph"\n\n// Shape selector function for different node types\nconst shapeSelector = (nodeData: string): Graph.MermaidNodeShape => {\n  if (nodeData.includes("start") || nodeData.includes("end")) return "circle"\n  if (nodeData.includes("decision")) return "diamond"\n  if (nodeData.includes("process")) return "rectangle"\n  if (nodeData.includes("data")) return "cylindrical"\n  return "rounded"\n}\n\nconst options: Graph.MermaidOptions<string, string> = {\n  nodeShape: shapeSelector\n}';
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
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
