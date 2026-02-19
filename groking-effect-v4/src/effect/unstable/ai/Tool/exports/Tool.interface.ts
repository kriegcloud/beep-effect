/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: Tool
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.148Z
 *
 * Overview:
 * A user-defined tool that language models can call to perform actions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 * 
 * // Create a weather lookup tool
 * const GetWeather = Tool.make("GetWeather", {
 *   description: "Get current weather for a location",
 *   parameters: Schema.Struct({
 *     location: Schema.String,
 *     units: Schema.Literals(["celsius", "fahrenheit"])
 *   }),
 *   success: Schema.Struct({
 *     temperature: Schema.Number,
 *     condition: Schema.String,
 *     humidity: Schema.Number
 *   })
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
const exportName = "Tool";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "A user-defined tool that language models can call to perform actions.";
const sourceExample = "import { Schema } from \"effect\"\nimport { Tool } from \"effect/unstable/ai\"\n\n// Create a weather lookup tool\nconst GetWeather = Tool.make(\"GetWeather\", {\n  description: \"Get current weather for a location\",\n  parameters: Schema.Struct({\n    location: Schema.String,\n    units: Schema.Literals([\"celsius\", \"fahrenheit\"])\n  }),\n  success: Schema.Struct({\n    temperature: Schema.Number,\n    condition: Schema.String,\n    humidity: Schema.Number\n  })\n})";
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
