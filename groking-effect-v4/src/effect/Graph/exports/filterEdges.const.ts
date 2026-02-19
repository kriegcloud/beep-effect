/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: filterEdges
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Filters edges by removing those that don't match the predicate. This function modifies the mutable graph in place.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *
 *   Graph.addEdge(mutable, a, b, 5)
 *   Graph.addEdge(mutable, b, c, 15)
 *   Graph.addEdge(mutable, c, a, 25)
 *
 *   // Keep only edges with weight >= 10
 *   Graph.filterEdges(mutable, (data) => data >= 10)
 * })
 *
 * console.log(Graph.edgeCount(graph)) // 2 (edge with weight 5 removed)
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
const exportName = "filterEdges";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary =
  "Filters edges by removing those that don't match the predicate. This function modifies the mutable graph in place.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, "A")\n  const b = Graph.addNode(mutable, "B")\n  const c = Graph.addNode(mutable, "C")\n\n  Graph.addEdge(mutable, a, b, 5)\n  Graph.addEdge(mutable, b, c, 15)\n  Graph.addEdge(mutable, c, a, 25)\n\n  // Keep only edges with weight >= 10\n  Graph.filterEdges(mutable, (data) => data >= 10)\n})\n\nconsole.log(Graph.edgeCount(graph)) // 2 (edge with weight 5 removed)';
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
