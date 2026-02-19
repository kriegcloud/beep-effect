/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: findEdge
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Finds the first edge that matches the given predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * 
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   const nodeA = Graph.addNode(mutable, "Node A")
 *   const nodeB = Graph.addNode(mutable, "Node B")
 *   const nodeC = Graph.addNode(mutable, "Node C")
 *   Graph.addEdge(mutable, nodeA, nodeB, 10)
 *   Graph.addEdge(mutable, nodeB, nodeC, 20)
 * })
 * 
 * const result = Graph.findEdge(graph, (data) => data > 15)
 * console.log(result) // 1
 * 
 * const notFound = Graph.findEdge(graph, (data) => data > 100)
 * console.log(notFound) // undefined
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
const exportName = "findEdge";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Finds the first edge that matches the given predicate.";
const sourceExample = "import { Graph } from \"effect\"\n\nconst graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {\n  const nodeA = Graph.addNode(mutable, \"Node A\")\n  const nodeB = Graph.addNode(mutable, \"Node B\")\n  const nodeC = Graph.addNode(mutable, \"Node C\")\n  Graph.addEdge(mutable, nodeA, nodeB, 10)\n  Graph.addEdge(mutable, nodeB, nodeC, 20)\n})\n\nconst result = Graph.findEdge(graph, (data) => data > 15)\nconsole.log(result) // 1\n\nconst notFound = Graph.findEdge(graph, (data) => data > 100)\nconsole.log(notFound) // undefined";
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
