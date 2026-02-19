/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: externals
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Creates an iterator over external nodes (nodes without edges in specified direction).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const source = Graph.addNode(mutable, "source") // 0 - no incoming
 *   const middle = Graph.addNode(mutable, "middle") // 1 - has both
 *   const sink = Graph.addNode(mutable, "sink") // 2 - no outgoing
 *   const isolated = Graph.addNode(mutable, "isolated") // 3 - no edges
 *
 *   Graph.addEdge(mutable, source, middle, 1)
 *   Graph.addEdge(mutable, middle, sink, 2)
 * })
 *
 * // Nodes with no outgoing edges (sinks + isolated)
 * const sinks = Array.from(
 *   Graph.indices(Graph.externals(graph, { direction: "outgoing" }))
 * )
 * console.log(sinks) // [2, 3]
 *
 * // Nodes with no incoming edges (sources + isolated)
 * const sources = Array.from(
 *   Graph.indices(Graph.externals(graph, { direction: "incoming" }))
 * )
 * console.log(sources) // [0, 3]
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as GraphModule from "effect/Graph";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "externals";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Creates an iterator over external nodes (nodes without edges in specified direction).";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const source = Graph.addNode(mutable, "source") // 0 - no incoming\n  const middle = Graph.addNode(mutable, "middle") // 1 - has both\n  const sink = Graph.addNode(mutable, "sink") // 2 - no outgoing\n  const isolated = Graph.addNode(mutable, "isolated") // 3 - no edges\n\n  Graph.addEdge(mutable, source, middle, 1)\n  Graph.addEdge(mutable, middle, sink, 2)\n})\n\n// Nodes with no outgoing edges (sinks + isolated)\nconst sinks = Array.from(\n  Graph.indices(Graph.externals(graph, { direction: "outgoing" }))\n)\nconsole.log(sinks) // [2, 3]\n\n// Nodes with no incoming edges (sources + isolated)\nconst sources = Array.from(\n  Graph.indices(Graph.externals(graph, { direction: "incoming" }))\n)\nconsole.log(sources) // [0, 3]';
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
  bunContext: BunContext,
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
