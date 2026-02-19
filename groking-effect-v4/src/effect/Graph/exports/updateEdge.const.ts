/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: updateEdge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.808Z
 *
 * Overview:
 * Updates a single edge's data by applying a transformation function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const edgeIndex = Graph.addEdge(mutable, nodeA, nodeB, 10)
 *   Graph.updateEdge(mutable, edgeIndex, (data) => data * 2)
 * })
 *
 * const edgeData = Graph.getEdge(result, 0)
 * console.log(edgeData) // new Graph.Edge({ source: 0, target: 1, data: 20 })
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
const exportName = "updateEdge";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Updates a single edge's data by applying a transformation function.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst result = Graph.mutate(Graph.directed<string, number>(), (mutable) => {\n  const nodeA = Graph.addNode(mutable, "Node A")\n  const nodeB = Graph.addNode(mutable, "Node B")\n  const edgeIndex = Graph.addEdge(mutable, nodeA, nodeB, 10)\n  Graph.updateEdge(mutable, edgeIndex, (data) => data * 2)\n})\n\nconst edgeData = Graph.getEdge(result, 0)\nconsole.log(edgeData) // new Graph.Edge({ source: 0, target: 1, data: 20 })';
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
