/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: getJsonSchema
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:50:45.969Z
 *
 * Overview:
 * Generates a JSON Schema for a tool.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * const weatherTool = Tool.make("get_weather", {
 *   parameters: Schema.Struct({
 *     location: Schema.String,
 *     units: Schema.Literals(["celsius", "fahrenheit"])
 *   })
 * })
 *
 * const jsonSchema = Tool.getJsonSchema(weatherTool)
 * console.log(jsonSchema)
 * // {
 * //   type: "object",
 * //   properties: {
 * //     location: { type: "string" },
 * //     units: { type: "string", enum: ["celsius", "fahrenheit"] }
 * //   },
 * //   required: ["location", "units"]
 * // }
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
const exportName = "getJsonSchema";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "Generates a JSON Schema for a tool.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Tool } from "effect/unstable/ai"\n\nconst weatherTool = Tool.make("get_weather", {\n  parameters: Schema.Struct({\n    location: Schema.String,\n    units: Schema.Literals(["celsius", "fahrenheit"])\n  })\n})\n\nconst jsonSchema = Tool.getJsonSchema(weatherTool)\nconsole.log(jsonSchema)\n// {\n//   type: "object",\n//   properties: {\n//     location: { type: "string" },\n//     units: { type: "string", enum: ["celsius", "fahrenheit"] }\n//   },\n//   required: ["location", "units"]\n// }';
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
