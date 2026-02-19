/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: filterNodes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.805Z
 *
 * Overview:
 * Filters nodes by removing those that don't match the predicate. This function modifies the mutable graph in place.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 *
 * const graph = Graph.directed<string, number>((mutable) => {
 *   Graph.addNode(mutable, "active")
 *   Graph.addNode(mutable, "inactive")
 *   Graph.addNode(mutable, "pending")
 *   Graph.addNode(mutable, "active")
 *
 *   // Keep only "active" nodes
 *   Graph.filterNodes(mutable, (data) => data === "active")
 * })
 *
 * console.log(Graph.nodeCount(graph)) // 2 (only "active" nodes remain)
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
const exportName = "filterNodes";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary =
  "Filters nodes by removing those that don't match the predicate. This function modifies the mutable graph in place.";
const sourceExample =
  'import { Graph } from "effect"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  Graph.addNode(mutable, "active")\n  Graph.addNode(mutable, "inactive")\n  Graph.addNode(mutable, "pending")\n  Graph.addNode(mutable, "active")\n\n  // Keep only "active" nodes\n  Graph.filterNodes(mutable, (data) => data === "active")\n})\n\nconsole.log(Graph.nodeCount(graph)) // 2 (only "active" nodes remain)';
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
