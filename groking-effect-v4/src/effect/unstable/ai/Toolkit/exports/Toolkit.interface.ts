/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Toolkit
 * Export: Toolkit
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts
 * Generated: 2026-02-19T04:14:24.162Z
 *
 * Overview:
 * Represents a collection of tools which can be used to enhance the capabilities of a large language model.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Schema } from "effect"
 * import { Tool, Toolkit } from "effect/unstable/ai"
 * 
 * // Create individual tools
 * const GetCurrentTime = Tool.make("GetCurrentTime", {
 *   description: "Get the current timestamp",
 *   success: Schema.Number
 * })
 * 
 * const GetWeather = Tool.make("GetWeather", {
 *   description: "Get weather for a location",
 *   parameters: Schema.Struct({ location: Schema.String }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String
 *   })
 * })
 * 
 * // Create a toolkit with multiple tools
 * const MyToolkit = Toolkit.make(GetCurrentTime, GetWeather)
 * 
 * const MyToolkitLayer = MyToolkit.toLayer({
 *   GetCurrentTime: () => Effect.succeed(Date.now()),
 *   GetWeather: ({ location }) =>
 *     Effect.succeed({
 *       temperature: 72,
 *       condition: "sunny"
 *     })
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
import * as ToolkitModule from "effect/unstable/ai/Toolkit";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Toolkit";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Toolkit";
const sourceSummary = "Represents a collection of tools which can be used to enhance the capabilities of a large language model.";
const sourceExample = "import { Effect, Schema } from \"effect\"\nimport { Tool, Toolkit } from \"effect/unstable/ai\"\n\n// Create individual tools\nconst GetCurrentTime = Tool.make(\"GetCurrentTime\", {\n  description: \"Get the current timestamp\",\n  success: Schema.Number\n})\n\nconst GetWeather = Tool.make(\"GetWeather\", {\n  description: \"Get weather for a location\",\n  parameters: Schema.Struct({ location: Schema.String }),\n  success: Schema.Struct({\n    temperature: Schema.Number,\n    condition: Schema.String\n  })\n})\n\n// Create a toolkit with multiple tools\nconst MyToolkit = Toolkit.make(GetCurrentTime, GetWeather)\n\nconst MyToolkitLayer = MyToolkit.toLayer({\n  GetCurrentTime: () => Effect.succeed(Date.now()),\n  GetWeather: ({ location }) =>\n    Effect.succeed({\n      temperature: 72,\n      condition: \"sunny\"\n    })\n})";
const moduleRecord = ToolkitModule as Record<string, unknown>;

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
