/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: astar
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.804Z
 *
 * Overview:
 * Find the shortest path between two nodes using A* pathfinding algorithm.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<{ x: number; y: number }, number>((mutable) => {
 *   const a = Graph.addNode(mutable, { x: 0, y: 0 })
 *   const b = Graph.addNode(mutable, { x: 1, y: 0 })
 *   const c = Graph.addNode(mutable, { x: 2, y: 0 })
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 1)
 * })
 *
 * // Manhattan distance heuristic
 * const heuristic = (
 *   nodeData: { x: number; y: number },
 *   targetData: { x: number; y: number }
 * ) => Math.abs(nodeData.x - targetData.x) + Math.abs(nodeData.y - targetData.y)
 *
 * const result = Graph.astar(graph, {
 *   source: 0,
 *   target: 2,
 *   cost: (edgeData) => edgeData,
 *   heuristic
 * })
 *
 * if (result !== undefined) {
 *   console.log(result.path) // [0, 1, 2] - shortest path
 *   console.log(result.distance) // 2 - total distance
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
const exportName = "astar";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Find the shortest path between two nodes using A* pathfinding algorithm.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<{ x: number; y: number }, number>((mutable) => {\n  const a = Graph.addNode(mutable, { x: 0, y: 0 })\n  const b = Graph.addNode(mutable, { x: 1, y: 0 })\n  const c = Graph.addNode(mutable, { x: 2, y: 0 })\n  Graph.addEdge(mutable, a, b, 1)\n  Graph.addEdge(mutable, b, c, 1)\n})\n\n// Manhattan distance heuristic\nconst heuristic = (\n  nodeData: { x: number; y: number },\n  targetData: { x: number; y: number }\n) => Math.abs(nodeData.x - targetData.x) + Math.abs(nodeData.y - targetData.y)\n\nconst result = Graph.astar(graph, {\n  source: 0,\n  target: 2,\n  cost: (edgeData) => edgeData,\n  heuristic\n})\n\nif (result !== undefined) {\n  console.log(result.path) // [0, 1, 2] - shortest path\n  console.log(result.distance) // 2 - total distance\n}';
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
