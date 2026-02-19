/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: MermaidOptions
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.807Z
 *
 * Overview:
 * Configuration options for Mermaid diagram generation from graphs.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Basic options with custom labels
 * const basicOptions: Graph.MermaidOptions<string, number> = {
 *   nodeLabel: (data) => `Node: ${data}`,
 *   edgeLabel: (data) => `Weight: ${data}`
 * }
 *
 * // Advanced options with all features
 * const advancedOptions: Graph.MermaidOptions<string, string> = {
 *   nodeLabel: (data) => data.toUpperCase(),
 *   edgeLabel: (data) => data,
 *   diagramType: "flowchart",
 *   direction: "LR",
 *   nodeShape: (data) => data.includes("start") ? "circle" : "rectangle"
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
const exportName = "MermaidOptions";
const exportKind = "interface";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Configuration options for Mermaid diagram generation from graphs.";
const sourceExample =
  'import type * as Graph from "effect/Graph"\n\n// Basic options with custom labels\nconst basicOptions: Graph.MermaidOptions<string, number> = {\n  nodeLabel: (data) => `Node: ${data}`,\n  edgeLabel: (data) => `Weight: ${data}`\n}\n\n// Advanced options with all features\nconst advancedOptions: Graph.MermaidOptions<string, string> = {\n  nodeLabel: (data) => data.toUpperCase(),\n  edgeLabel: (data) => data,\n  diagramType: "flowchart",\n  direction: "LR",\n  nodeShape: (data) => data.includes("start") ? "circle" : "rectangle"\n}';
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
