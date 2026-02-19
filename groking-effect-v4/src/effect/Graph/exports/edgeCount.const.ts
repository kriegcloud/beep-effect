/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: edgeCount
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Returns the number of edges in the graph.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * 
 * const emptyGraph = Graph.directed<string, number>()
 * console.log(Graph.edgeCount(emptyGraph)) // 0
 * 
 * const graphWithEdges = Graph.mutate(emptyGraph, (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 1)
 *   Graph.addEdge(mutable, nodeB, nodeC, 2)
 *   Graph.addEdge(mutable, nodeC, nodeA, 3)
 * })
 * 
 * console.log(Graph.edgeCount(graphWithEdges)) // 3
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as GraphModule from "effect/Graph";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "edgeCount";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Returns the number of edges in the graph.";
const sourceExample = "import { Graph } from \"effect\"\n\nconst emptyGraph = Graph.directed<string, number>()\nconsole.log(Graph.edgeCount(emptyGraph)) // 0\n\nconst graphWithEdges = Graph.mutate(emptyGraph, (mutable) => {\n  const nodeA = Graph.addNode(mutable, \"Node A\")\n  const nodeB = Graph.addNode(mutable, \"Node B\")\n  const nodeC = Graph.addNode(mutable, \"Node C\")\n  Graph.addEdge(mutable, nodeA, nodeB, 1)\n  Graph.addEdge(mutable, nodeB, nodeC, 2)\n  Graph.addEdge(mutable, nodeC, nodeA, 3)\n})\n\nconsole.log(Graph.edgeCount(graphWithEdges)) // 3";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
