/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: MermaidDiagramType
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.624Z
 *
 * Overview:
 * Mermaid diagram types for different visualization formats.
 *
 * Source JSDoc Example:
 * ```ts
 * import type * as Graph from "effect/Graph"
 * 
 * // Force flowchart format (even for undirected graphs)
 * const flowchartOptions: Graph.MermaidOptions<string, string> = {
 *   diagramType: "flowchart"
 * }
 * 
 * // Force graph format (shows undirected connections)
 * const graphOptions: Graph.MermaidOptions<string, string> = {
 *   diagramType: "graph"
 * }
 * 
 * // Auto-detection (recommended, default behavior)
 * const autoOptions: Graph.MermaidOptions<string, string> = {}
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
const exportName = "MermaidDiagramType";
const exportKind = "type";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Mermaid diagram types for different visualization formats.";
const sourceExample = "import type * as Graph from \"effect/Graph\"\n\n// Force flowchart format (even for undirected graphs)\nconst flowchartOptions: Graph.MermaidOptions<string, string> = {\n  diagramType: \"flowchart\"\n}\n\n// Force graph format (shows undirected connections)\nconst graphOptions: Graph.MermaidOptions<string, string> = {\n  diagramType: \"graph\"\n}\n\n// Auto-detection (recommended, default behavior)\nconst autoOptions: Graph.MermaidOptions<string, string> = {}";
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
