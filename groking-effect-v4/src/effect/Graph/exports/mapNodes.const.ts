/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: mapNodes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.806Z
 *
 * Overview:
 * Creates a new graph with transformed node data using the provided mapping function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   Graph.addNode(mutable, "node a")
 *   Graph.addNode(mutable, "node b")
 *   Graph.addNode(mutable, "node c")
 *   Graph.mapNodes(mutable, (data) => data.toUpperCase())
 * })
 *
 * const nodeData = Graph.getNode(graph, 0)
 * console.log(nodeData) // new Graph.Node("NODE A")
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as GraphModule from "effect/Graph";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapNodes";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Creates a new graph with transformed node data using the provided mapping function.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  Graph.addNode(mutable, "node a")\n  Graph.addNode(mutable, "node b")\n  Graph.addNode(mutable, "node c")\n  Graph.mapNodes(mutable, (data) => data.toUpperCase())\n})\n\nconst nodeData = Graph.getNode(graph, 0)\nconsole.log(nodeData) // new Graph.Node("NODE A")';
const moduleRecord = GraphModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
