/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Graph
 * Export: Walker
 * Kind: class
 * Source: .repos/effect-smol/packages/effect/src/Graph.ts
 * Generated: 2026-02-19T04:14:13.626Z
 *
 * Overview:
 * Concrete class for iterables that produce [NodeIndex, NodeData] tuples.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Graph } from "effect"
 * 
 * const graph = Graph.directed<string, number>((mutable) => {
 *   const a = Graph.addNode(mutable, "A")
 *   const b = Graph.addNode(mutable, "B")
 *   Graph.addEdge(mutable, a, b, 1)
 * })
 * 
 * // Both traversal and element iterators return NodeWalker
 * const dfsNodes: Graph.NodeWalker<string> = Graph.dfs(graph, { start: [0] })
 * const allNodes: Graph.NodeWalker<string> = Graph.nodes(graph)
 * 
 * // Common interface for working with node iterables
 * function processNodes<N>(nodeIterable: Graph.NodeWalker<N>): Array<number> {
 *   return Array.from(Graph.indices(nodeIterable))
 * }
 * 
 * // Access node data using values() or entries()
 * const nodeData = Array.from(Graph.values(dfsNodes)) // ["A", "B"]
 * const nodeEntries = Array.from(Graph.entries(allNodes)) // [[0, "A"], [1, "B"]]
 * ```
 *
 * Focus:
 * - Class export exploration with focused runtime examples.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as GraphModule from "effect/Graph";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportConstructor
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Walker";
const exportKind = "class";
const moduleImportPath = "effect/Graph";
const sourceSummary = "Concrete class for iterables that produce [NodeIndex, NodeData] tuples.";
const sourceExample = "import { Graph } from \"effect\"\n\nconst graph = Graph.directed<string, number>((mutable) => {\n  const a = Graph.addNode(mutable, \"A\")\n  const b = Graph.addNode(mutable, \"B\")\n  Graph.addEdge(mutable, a, b, 1)\n})\n\n// Both traversal and element iterators return NodeWalker\nconst dfsNodes: Graph.NodeWalker<string> = Graph.dfs(graph, { start: [0] })\nconst allNodes: Graph.NodeWalker<string> = Graph.nodes(graph)\n\n// Common interface for working with node iterables\nfunction processNodes<N>(nodeIterable: Graph.NodeWalker<N>): Array<number> {\n  return Array.from(Graph.indices(nodeIterable))\n}\n\n// Access node data using values() or entries()\nconst nodeData = Array.from(Graph.values(dfsNodes)) // [\"A\", \"B\"]\nconst nodeEntries = Array.from(Graph.entries(allNodes)) // [[0, \"A\"], [1, \"B\"]]";
const moduleRecord = GraphModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleClassDiscovery = Effect.gen(function* () {
  yield* Console.log("Inspect runtime metadata and class-like surface information.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleConstructionProbe = Effect.gen(function* () {
  yield* Console.log("Attempt a zero-arg construction probe.");
  yield* probeNamedExportConstructor({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧱",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Class Discovery",
      description: "Inspect runtime shape and discover class metadata.",
      run: exampleClassDiscovery
    },
    {
      title: "Zero-Arg Construction Probe",
      description: "Attempt construction and report constructor behavior.",
      run: exampleConstructionProbe
    }
  ]
});

BunRuntime.runMain(program);
