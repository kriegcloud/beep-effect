/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: isDynamic
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:50:45.970Z
 *
 * Overview:
 * Type guard to check if a value is a dynamic tool.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const DynamicTool = Tool.dynamic("DynamicTool", {
 *   parameters: { type: "object", properties: {} }
 * })
 *
 * const UserDefinedTool = Tool.make("Calculator", {
 *   parameters: Schema.Struct({ a: Schema.Number, b: Schema.Number }),
 *   success: Schema.Number
 * })
 *
 * console.log(Tool.isDynamic(DynamicTool)) // true
 * console.log(Tool.isDynamic(UserDefinedTool)) // false
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
import * as ToolModule from "effect/unstable/ai/Tool";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isDynamic";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "Type guard to check if a value is a dynamic tool.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Tool } from "effect/unstable/ai"\n\nconst DynamicTool = Tool.dynamic("DynamicTool", {\n  parameters: { type: "object", properties: {} }\n})\n\nconst UserDefinedTool = Tool.make("Calculator", {\n  parameters: Schema.Struct({ a: Schema.Number, b: Schema.Number }),\n  success: Schema.Number\n})\n\nconsole.log(Tool.isDynamic(DynamicTool)) // true\nconsole.log(Tool.isDynamic(UserDefinedTool)) // false';
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
