/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: topo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.808Z
 *
 * Overview:
 * Creates a new topological sort iterator with optional configuration.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 1)
 * })
 *
 * // Standard topological sort
 * const topo1 = Graph.topo(graph)
 * for (const nodeIndex of Graph.indices(topo1)) {
 *   console.log(nodeIndex) // 0, 1, 2 (topological order)
 * }
 *
 * // With initial nodes
 * const topo2 = Graph.topo(graph, { initials: [0] })
 *
 * // Throws error for cyclic graph
 * const cyclicGraph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, a, 2) // Creates cycle
 * })
 *
 * try {
 *   Graph.topo(cyclicGraph) // Throws: "Cannot perform topological sort on cyclic graph"
 * } catch (error) {
 *   console.log((error as Error).message)
 * }
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
const exportName = "topo";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Creates a new topological sort iterator with optional configuration.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, "A")\n  const b = Graph.addNode(mutable, "B")\n  const c = Graph.addNode(mutable, "C")\n  Graph.addEdge(mutable, a, b, 1)\n  Graph.addEdge(mutable, b, c, 1)\n})\n\n// Standard topological sort\nconst topo1 = Graph.topo(graph)\nfor (const nodeIndex of Graph.indices(topo1)) {\n  console.log(nodeIndex) // 0, 1, 2 (topological order)\n}\n\n// With initial nodes\nconst topo2 = Graph.topo(graph, { initials: [0] })\n\n// Throws error for cyclic graph\nconst cyclicGraph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, "A")\n  const b = Graph.addNode(mutable, "B")\n  Graph.addEdge(mutable, a, b, 1)\n  Graph.addEdge(mutable, b, a, 2) // Creates cycle\n})\n\ntry {\n  Graph.topo(cyclicGraph) // Throws: "Cannot perform topological sort on cyclic graph"\n} catch (error) {\n  console.log((error as Error).message)\n}';
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
