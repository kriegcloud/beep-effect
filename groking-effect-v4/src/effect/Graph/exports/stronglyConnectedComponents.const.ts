/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: stronglyConnectedComponents
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.625Z
 *
 * Overview:
 * Find strongly connected components in a directed graph using Kosaraju's algorithm. Each SCC is represented as an array of node indices.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   const c = Graph.addNode(mutable, "C")
 *   Graph.addEdge(mutable, a, b, "A->B")
 *   Graph.addEdge(mutable, b, c, "B->C")
 *   Graph.addEdge(mutable, c, a, "C->A") // Creates SCC: A-B-C
 * })
 *
 * const sccs = Graph.stronglyConnectedComponents(graph)
 * console.log(sccs) // [[0, 1, 2]]
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
const exportName = "stronglyConnectedComponents";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary =
  "Find strongly connected components in a directed graph using Kosaraju's algorithm. Each SCC is represented as an array of node indices.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, string>((mutable) => {\n  const a = Graph.addNode(mutable, "A")\n  const b = Graph.addNode(mutable, "B")\n  const c = Graph.addNode(mutable, "C")\n  Graph.addEdge(mutable, a, b, "A->B")\n  Graph.addEdge(mutable, b, c, "B->C")\n  Graph.addEdge(mutable, c, a, "C->A") // Creates SCC: A-B-C\n})\n\nconst sccs = Graph.stronglyConnectedComponents(graph)\nconsole.log(sccs) // [[0, 1, 2]]';
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
