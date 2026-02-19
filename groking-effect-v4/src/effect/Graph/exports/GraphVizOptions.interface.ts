/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: GraphVizOptions
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.806Z
 *
 * Overview:
 * Configuration options for GraphViz DOT format generation from graphs.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Graph from "effect/Graph"
 *
 * // Basic options with custom labels
 * const basicOptions: Graph.GraphVizOptions<string, number> = {
 *   nodeLabel: (data) => `Node: ${data}`,
 *   edgeLabel: (data) => `Weight: ${data}`
 * }
 *
 * // Complete options with graph naming
 * const namedOptions: Graph.GraphVizOptions<string, string> = {
 *   nodeLabel: (data) => data.toUpperCase(),
 *   edgeLabel: (data) => data,
 *   graphName: "MyDependencyGraph"
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
const exportName = "GraphVizOptions";
const exportKind = "interface";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Configuration options for GraphViz DOT format generation from graphs.";
const sourceExample =
  'import type * as Graph from "effect/Graph"\n\n// Basic options with custom labels\nconst basicOptions: Graph.GraphVizOptions<string, number> = {\n  nodeLabel: (data) => `Node: ${data}`,\n  edgeLabel: (data) => `Weight: ${data}`\n}\n\n// Complete options with graph naming\nconst namedOptions: Graph.GraphVizOptions<string, string> = {\n  nodeLabel: (data) => data.toUpperCase(),\n  edgeLabel: (data) => data,\n  graphName: "MyDependencyGraph"\n}';
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
