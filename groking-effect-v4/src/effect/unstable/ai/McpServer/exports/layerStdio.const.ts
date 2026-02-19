/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/McpServer
 * Export: layerStdio
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/McpServer.ts
 * Generated: 2026-02-19T04:50:45.504Z
 *
 * Overview:
 * Run the McpServer, using stdio for input and output.
 *
 * Source JSDoc Example:
 * ```ts
 * import { NodeRuntime, NodeStdio } from "@effect/platform-node"
 * import { Effect, Layer, Logger, Schema } from "effect"
 * import { McpSchema, McpServer } from "effect/unstable/ai"
 *
 * const idParam = McpSchema.param("id", Schema.Number)
 *
 * // Define a resource template for a README file
 * const ReadmeTemplate = McpServer.resource`file://readme/${idParam}`({
 *   name: "README Template",
 *   // You can add auto-completion for the ID parameter
 *   completion: {
 *     id: (_) => Effect.succeed([1, 2, 3, 4, 5])
 *   },
 *   content: Effect.fn(function*(_uri, id) {
 *     return `# MCP Server Demo - ID: ${id}`
 *   })
 * })
 *
 * // Define a test prompt with parameters
 * const TestPrompt = McpServer.prompt({
 *   name: "Test Prompt",
 *   description: "A test prompt to demonstrate MCP server capabilities",
 *   parameters: {
 *     flightNumber: Schema.String
 *   },
 *   completion: {
 *     flightNumber: () => Effect.succeed(["FL123", "FL456", "FL789"])
 *   },
 *   content: ({ flightNumber }) =>
 *     Effect.succeed(`Get the booking details for flight number: ${flightNumber}`)
 * })
 *
 * // Merge all the resources and prompts into a single server layer
 * const ServerLayer = Layer.mergeAll(
 *   ReadmeTemplate,
 *   TestPrompt
 * ).pipe(
 *   // Provide the MCP server implementation
 *   Layer.provide(McpServer.layerStdio({
 *     name: "Demo Server",
 *     version: "1.0.0",
 *   })),
 *   Layer.provide(NodeStdio.layer),
 *   Layer.provide(Layer.succeed(Logger.LogToStderr)(true))
 * )
 *
 * Layer.launch(ServerLayer).pipe(NodeRuntime.runMain)
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
import * as McpServerModule from "effect/unstable/ai/McpServer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layerStdio";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/McpServer";
const sourceSummary = "Run the McpServer, using stdio for input and output.";
const sourceExample =
  'import { NodeRuntime, NodeStdio } from "@effect/platform-node"\nimport { Effect, Layer, Logger, Schema } from "effect"\nimport { McpSchema, McpServer } from "effect/unstable/ai"\n\nconst idParam = McpSchema.param("id", Schema.Number)\n\n// Define a resource template for a README file\nconst ReadmeTemplate = McpServer.resource`file://readme/${idParam}`({\n  name: "README Template",\n  // You can add auto-completion for the ID parameter\n  completion: {\n    id: (_) => Effect.succeed([1, 2, 3, 4, 5])\n  },\n  content: Effect.fn(function*(_uri, id) {\n    return `# MCP Server Demo - ID: ${id}`\n  })\n})\n\n// Define a test prompt with parameters\nconst TestPrompt = McpServer.prompt({\n  name: "Test Prompt",\n  description: "A test prompt to demonstrate MCP server capabilities",\n  parameters: {\n    flightNumber: Schema.String\n  },\n  completion: {\n    flightNumber: () => Effect.succeed(["FL123", "FL456", "FL789"])\n  },\n  content: ({ flightNumber }) =>\n    Effect.succeed(`Get the booking details for flight number: ${flightNumber}`)\n})\n\n// Merge all the resources and prompts into a single server layer\nconst ServerLayer = Layer.mergeAll(\n  ReadmeTemplate,\n  TestPrompt\n).pipe(\n  // Provide the MCP server implementation\n  Layer.provide(McpServer.layerStdio({\n    name: "Demo Server",\n    version: "1.0.0",\n  })),\n  Layer.provide(NodeStdio.layer),\n  Layer.provide(Layer.succeed(Logger.LogToStderr)(true))\n)\n\nLayer.launch(ServerLayer).pipe(NodeRuntime.runMain)';
const moduleRecord = McpServerModule as Record<string, unknown>;

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
