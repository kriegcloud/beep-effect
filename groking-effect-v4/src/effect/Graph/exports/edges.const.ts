/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: edges
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Creates an iterator over all edge indices in the graph.
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
 *   Graph.addEdge(mutable, b, c, 2)
 * })
 * 
 * const indices = Array.from(Graph.indices(Graph.edges(graph)))
 * console.log(indices) // [0, 1]
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
const exportName = "edges";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Creates an iterator over all edge indices in the graph.";
const sourceExample = "import { Graph } from \"effect\"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, \"A\")\n  const b = Graph.addNode(mutable, \"B\")\n  const c = Graph.addNode(mutable, \"C\")\n  Graph.addEdge(mutable, a, b, 1)\n  Graph.addEdge(mutable, b, c, 2)\n})\n\nconst indices = Array.from(Graph.indices(Graph.edges(graph)))\nconsole.log(indices) // [0, 1]";
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
