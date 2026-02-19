/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: neighborsDirected
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.624Z
 *
 * Overview:
 * Get neighbors of a node in a specific direction for bidirectional traversal.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, string>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, "A->B")
 * })
 *
 * const nodeA = 0
 * const nodeB = 1
 *
 * // Get outgoing neighbors (nodes that nodeA points to)
 * const outgoing = Graph.neighborsDirected(graph, nodeA, "outgoing")
 *
 * // Get incoming neighbors (nodes that point to nodeB)
 * const incoming = Graph.neighborsDirected(graph, nodeB, "incoming")
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
const exportName = "neighborsDirected";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Get neighbors of a node in a specific direction for bidirectional traversal.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, string>((mutable) => {\n  const a = Graph.addNode(mutable, "A")\n  const b = Graph.addNode(mutable, "B")\n  Graph.addEdge(mutable, a, b, "A->B")\n})\n\nconst nodeA = 0\nconst nodeB = 1\n\n// Get outgoing neighbors (nodes that nodeA points to)\nconst outgoing = Graph.neighborsDirected(graph, nodeA, "outgoing")\n\n// Get incoming neighbors (nodes that point to nodeB)\nconst incoming = Graph.neighborsDirected(graph, nodeB, "incoming")';
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
