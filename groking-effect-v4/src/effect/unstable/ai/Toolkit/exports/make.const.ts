/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Toolkit
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts
 * Generated: 2026-02-19T04:50:45.987Z
 *
 * Overview:
 * Creates a new toolkit from the specified tools.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 *
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Get the current timestamp",
 *   success: Schema.Number
 * })
 *
 * const GetWeather = Tool.make("get_weather", {
 *   description: "Get weather information",
 *   parameters: Schema.Struct({ location: Schema.String }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String
 *   })
 * })
 *
 * const toolkit = Toolkit.make(GetCurrentTime, GetWeather)
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
import * as ToolkitModule from "effect/unstable/ai/Toolkit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Toolkit";
const sourceSummary = "Creates a new toolkit from the specified tools.";
const sourceExample =
  'import { Schema } from "effect"\nimport { Tool, Toolkit } from "effect/unstable/ai"\n\nconst GetCurrentTime = Tool.make("GetCurrentTime", {\n  description: "Get the current timestamp",\n  success: Schema.Number\n})\n\nconst GetWeather = Tool.make("get_weather", {\n  description: "Get weather information",\n  parameters: Schema.Struct({ location: Schema.String }),\n  success: Schema.Struct({\n    temperature: Schema.Number,\n    condition: Schema.String\n  })\n})\n\nconst toolkit = Toolkit.make(GetCurrentTime, GetWeather)';
const moduleRecord = ToolkitModule as Record<string, unknown>;

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
