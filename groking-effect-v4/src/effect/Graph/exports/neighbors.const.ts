/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: neighbors
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.624Z
 *
 * Overview:
 * Returns the neighboring nodes (targets of outgoing edges) for a given node.
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
 *   Graph.addEdge(mutable, nodeA, nodeC, 2)
 * })
 *
 * const nodeA = 0
 * const nodeB = 1
 * const nodeC = 2
 *
 * const neighborsA = Graph.neighbors(graph, nodeA)
 * console.log(neighborsA) // [NodeIndex(1), NodeIndex(2)]
 *
 * const neighborsB = Graph.neighbors(graph, nodeB)
 * console.log(neighborsB) // []
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
const exportName = "neighbors";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Returns the neighboring nodes (targets of outgoing edges) for a given node.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {\n  const nodeA = Graph.addNode(mutable, "Node A")\n  const nodeB = Graph.addNode(mutable, "Node B")\n  const nodeC = Graph.addNode(mutable, "Node C")\n  Graph.addEdge(mutable, nodeA, nodeB, 1)\n  Graph.addEdge(mutable, nodeA, nodeC, 2)\n})\n\nconst nodeA = 0\nconst nodeB = 1\nconst nodeC = 2\n\nconst neighborsA = Graph.neighbors(graph, nodeA)\nconsole.log(neighborsA) // [NodeIndex(1), NodeIndex(2)]\n\nconst neighborsB = Graph.neighbors(graph, nodeB)\nconsole.log(neighborsB) // []';
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
