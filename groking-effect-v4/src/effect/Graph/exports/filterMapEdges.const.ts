/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: filterMapEdges
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.805Z
 *
 * Overview:
 * Filters and optionally transforms edges in a mutable graph using a predicate function. Edges that return Option.none are removed from the graph.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * import * as Option from "effect/Option"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, 5)
 *   Graph.addEdge(mutable, b, c, 15)
 *   Graph.addEdge(mutable, c, a, 25)
 *
 *   // Keep only edges with weight >= 10 and double their weight
 *   Graph.filterMapEdges(
 *     mutable,
 *     (data) => data >= 10 ? Option.some(data * 2) : Option.none()
 *   )
 * })
 *
 * console.log(Graph.edgeCount(graph)) // 2 (edges with weight 5 removed)
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
const exportName = "filterMapEdges";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary =
  "Filters and optionally transforms edges in a mutable graph using a predicate function. Edges that return Option.none are removed from the graph.";
const sourceExample =
  'import { Graph } from "effect"\nimport * as Option from "effect/Option"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, "A")\n  const b = Graph.addNode(mutable, "B")\n  const c = Graph.addNode(mutable, "C")\n  Graph.addEdge(mutable, a, b, 5)\n  Graph.addEdge(mutable, b, c, 15)\n  Graph.addEdge(mutable, c, a, 25)\n\n  // Keep only edges with weight >= 10 and double their weight\n  Graph.filterMapEdges(\n    mutable,\n    (data) => data >= 10 ? Option.some(data * 2) : Option.none()\n  )\n})\n\nconsole.log(Graph.edgeCount(graph)) // 2 (edges with weight 5 removed)';
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
