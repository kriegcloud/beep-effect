/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: dynamic
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.146Z
 *
 * Overview:
 * Creates a dynamic tool that can accept either an Effect Schema or a raw JSON Schema for its parameters.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // With Effect Schema (typed parameters)
 * const Calculator = Tool.dynamic("Calculator", {
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 *
 * // With JSON Schema (untyped parameters)
 * const McpTool = Tool.dynamic("McpTool", {
 *   description: "Tool from MCP server",
 *   parameters: {
 *     type: "object",
 *     properties: { query: { type: "string" } },
 *     required: ["query"]
 *   }
 * })
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
import * as ToolModule from "effect/unstable/ai/Tool";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "dynamic";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary =
  "Creates a dynamic tool that can accept either an Effect Schema or a raw JSON Schema for its parameters.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Tool } from "effect/unstable/ai"\n\n// With Effect Schema (typed parameters)\nconst Calculator = Tool.dynamic("Calculator", {\n  parameters: Schema.Struct({\n    operation: Schema.Literals(["add", "subtract"]),\n    a: Schema.Number,\n    b: Schema.Number\n  }),\n  success: Schema.Number\n})\n\n// With JSON Schema (untyped parameters)\nconst McpTool = Tool.dynamic("McpTool", {\n  description: "Tool from MCP server",\n  parameters: {\n    type: "object",\n    properties: { query: { type: "string" } },\n    required: ["query"]\n  }\n})';
const moduleRecord = ToolModule as Record<string, unknown>;

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
