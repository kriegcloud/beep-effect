/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: toGraphViz
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.808Z
 *
 * Overview:
 * Exports a graph to GraphViz DOT format for visualization.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 1)
 *   Graph.addEdge(mutable, nodeB, nodeC, 2)
 *   Graph.addEdge(mutable, nodeC, nodeA, 3)
 * })
 *
 * const dot = Graph.toGraphViz(graph)
 * console.log(dot)
 * // digraph G {
 * //   "0" [label="Node A"];
 * //   "1" [label="Node B"];
 * //   "2" [label="Node C"];
 * //   "0" -> "1" [label="1"];
 * //   "1" -> "2" [label="2"];
 * //   "2" -> "0" [label="3"];
 * // }
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
const exportName = "toGraphViz";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Exports a graph to GraphViz DOT format for visualization.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {\n  const nodeA = Graph.addNode(mutable, "Node A")\n  const nodeB = Graph.addNode(mutable, "Node B")\n  const nodeC = Graph.addNode(mutable, "Node C")\n  Graph.addEdge(mutable, nodeA, nodeB, 1)\n  Graph.addEdge(mutable, nodeB, nodeC, 2)\n  Graph.addEdge(mutable, nodeC, nodeA, 3)\n})\n\nconst dot = Graph.toGraphViz(graph)\nconsole.log(dot)\n// digraph G {\n//   "0" [label="Node A"];\n//   "1" [label="Node B"];\n//   "2" [label="Node C"];\n//   "0" -> "1" [label="1"];\n//   "1" -> "2" [label="2"];\n//   "2" -> "0" [label="3"];\n// }';
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
