/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: filterMapNodes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.623Z
 *
 * Overview:
 * Filters and optionally transforms nodes in a mutable graph using a predicate function. Nodes that return Option.none are removed along with all their connected edges.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * import * as Option from "effect/Option"
 * 
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "active")
 *   const b = Graph.addNode(mutable, "inactive")
 *   const c = Graph.addNode(mutable, "active")
 *   Graph.addEdge(mutable, a, b, 1)
 *   Graph.addEdge(mutable, b, c, 2)
 * 
 *   // Keep only "active" nodes and transform to uppercase
 *   Graph.filterMapNodes(
 *     mutable,
 *     (data) =>
 *       data === "active" ? Option.some(data.toUpperCase()) : Option.none()
 *   )
 * })
 * 
 * console.log(Graph.nodeCount(graph)) // 2 (only "active" nodes remain)
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
const exportName = "filterMapNodes";
const exportKind = "const";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Filters and optionally transforms nodes in a mutable graph using a predicate function. Nodes that return Option.none are removed along with all their connected edges.";
const sourceExample = "import { Graph } from \"effect\"\nimport * as Option from \"effect/Option\"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, \"active\")\n  const b = Graph.addNode(mutable, \"inactive\")\n  const c = Graph.addNode(mutable, \"active\")\n  Graph.addEdge(mutable, a, b, 1)\n  Graph.addEdge(mutable, b, c, 2)\n\n  // Keep only \"active\" nodes and transform to uppercase\n  Graph.filterMapNodes(\n    mutable,\n    (data) =>\n      data === \"active\" ? Option.some(data.toUpperCase()) : Option.none()\n  )\n})\n\nconsole.log(Graph.nodeCount(graph)) // 2 (only \"active\" nodes remain)";
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
