/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: findNodes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Finds all nodes that match the given predicate.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * 
 * const graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {
 *   Graph.addNode(mutable, "Start A")
 *   Graph.addNode(mutable, "Node B")
 *   Graph.addNode(mutable, "Start C")
 * })
 * 
 * const result = Graph.findNodes(graph, (data) => data.startsWith("Start"))
 * console.log(result) // [0, 2]
 * 
 * const empty = Graph.findNodes(graph, (data) => data === "Not Found")
 * console.log(empty) // []
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
const exportName = "findNodes";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Finds all nodes that match the given predicate.";
const sourceExample = "import { Graph } from \"effect\"\n\nconst graph = Graph.mutate(Graph.directed<string, number>(), (mutable) => {\n  Graph.addNode(mutable, \"Start A\")\n  Graph.addNode(mutable, \"Node B\")\n  Graph.addNode(mutable, \"Start C\")\n})\n\nconst result = Graph.findNodes(graph, (data) => data.startsWith(\"Start\"))\nconsole.log(result) // [0, 2]\n\nconst empty = Graph.findNodes(graph, (data) => data === \"Not Found\")\nconsole.log(empty) // []";
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
