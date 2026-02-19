/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: Dynamic
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.146Z
 *
 * Overview:
 * A dynamic tool is a tool where the schema may not be known at compile time.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 * 
 * // Dynamic tool with Effect Schema (typed)
 * const Calculator = Tool.dynamic("Calculator", {
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 * 
 * // Dynamic tool with JSON Schema (untyped parameters)
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
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ToolModule from "effect/unstable/ai/Tool";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Dynamic";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "A dynamic tool is a tool where the schema may not be known at compile time.";
const sourceExample = "import { Schema } from \"effect\"\nimport { Tool } from \"effect/unstable/ai\"\n\n// Dynamic tool with Effect Schema (typed)\nconst Calculator = Tool.dynamic(\"Calculator\", {\n  parameters: Schema.Struct({\n    operation: Schema.Literals([\"add\", \"subtract\"]),\n    a: Schema.Number,\n    b: Schema.Number\n  }),\n  success: Schema.Number\n})\n\n// Dynamic tool with JSON Schema (untyped parameters)\nconst McpTool = Tool.dynamic(\"McpTool\", {\n  description: \"Tool from MCP server\",\n  parameters: {\n    type: \"object\",\n    properties: { query: { type: \"string\" } },\n    required: [\"query\"]\n  }\n})";
const moduleRecord = ToolModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
