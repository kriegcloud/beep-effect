/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: getEdge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Gets the edge data associated with an edge index, if it exists.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * 
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   Graph.addEdge(mutable, nodeA, nodeB, 42)
 * })
 * 
 * const edgeIndex = 0
 * const edgeData = Graph.getEdge(graph, edgeIndex)
 * 
 * if (edgeData !== undefined) {
 *   console.log(edgeData.data) // 42
 *   console.log(edgeData.source) // NodeIndex(0)
 *   console.log(edgeData.target) // NodeIndex(1)
 * }
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
const exportName = "getEdge";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Gets the edge data associated with an edge index, if it exists.";
const sourceExample = "import { Graph } from \"effect\"\n\nconst graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {\n  const nodeA = Graph.addNode(mutable, \"Node A\")\n  const nodeB = Graph.addNode(mutable, \"Node B\")\n  Graph.addEdge(mutable, nodeA, nodeB, 42)\n})\n\nconst edgeIndex = 0\nconst edgeData = Graph.getEdge(graph, edgeIndex)\n\nif (edgeData !== undefined) {\n  console.log(edgeData.data) // 42\n  console.log(edgeData.source) // NodeIndex(0)\n  console.log(edgeData.target) // NodeIndex(1)\n}";
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
