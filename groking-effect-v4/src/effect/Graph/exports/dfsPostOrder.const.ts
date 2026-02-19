/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: dfsPostOrder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.805Z
 *
 * Overview:
 * Creates a new DFS postorder iterator with optional configuration.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const root = Graph.addNode(mutable, "root")
 *   const child1 = Graph.addNode(mutable, "child1")
 *   const child2 = Graph.addNode(mutable, "child2")
 *   Graph.addEdge(mutable, root, child1, 1)
 *   Graph.addEdge(mutable, root, child2, 1)
 * })
 *
 * // Postorder: children before parents
 * const postOrder = Graph.dfsPostOrder(graph, { start: [0] })
 * for (const node of postOrder) {
 *   console.log(node) // 1, 2, 0
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
const exportName = "dfsPostOrder";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Creates a new DFS postorder iterator with optional configuration.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const root = Graph.addNode(mutable, "root")\n  const child1 = Graph.addNode(mutable, "child1")\n  const child2 = Graph.addNode(mutable, "child2")\n  Graph.addEdge(mutable, root, child1, 1)\n  Graph.addEdge(mutable, root, child2, 1)\n})\n\n// Postorder: children before parents\nconst postOrder = Graph.dfsPostOrder(graph, { start: [0] })\nfor (const node of postOrder) {\n  console.log(node) // 1, 2, 0\n}';
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
