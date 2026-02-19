/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: toMermaid
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:50:36.808Z
 *
 * Overview:
 * Exports a graph to Mermaid diagram format for visualization.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Graph from "effect/Graph"
 *
 * // Basic directed graph export
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const app = Graph.addNode(mutable, "App")
 *   const db = Graph.addNode(mutable, "Database")
 *   const cache = Graph.addNode(mutable, "Cache")
 *   Graph.addEdge(mutable, app, db, 1)
 *   Graph.addEdge(mutable, app, cache, 2)
 * })
 *
 * const mermaid = Graph.toMermaid(graph)
 * console.log(mermaid)
 * // flowchart TD
 * //   0["App"]
 * //   1["Database"]
 * //   2["Cache"]
 * //   0 -->|"1"| 1
 * //   0 -->|"2"| 2
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
const exportName = "toMermaid";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Exports a graph to Mermaid diagram format for visualization.";
const sourceExample =
  'import * as Graph from "effect/Graph"\n\n// Basic directed graph export\nconst graph = Graph.directed<string, number>((mutable) => {\n  const app = Graph.addNode(mutable, "App")\n  const db = Graph.addNode(mutable, "Database")\n  const cache = Graph.addNode(mutable, "Cache")\n  Graph.addEdge(mutable, app, db, 1)\n  Graph.addEdge(mutable, app, cache, 2)\n})\n\nconst mermaid = Graph.toMermaid(graph)\nconsole.log(mermaid)\n// flowchart TD\n//   0["App"]\n//   1["Database"]\n//   2["Cache"]\n//   0 -->|"1"| 1\n//   0 -->|"2"| 2';
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
