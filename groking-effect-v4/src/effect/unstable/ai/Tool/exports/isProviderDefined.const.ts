/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: isProviderDefined
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.147Z
 *
 * Overview:
 * Type guard to check if a value is a provider-defined tool.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 * 
 * const UserDefinedTool = Tool.make("Calculator", {
 *   description: "Performs basic arithmetic operations",
 *   parameters: Schema.Struct({
 *     operation: Schema.Literals(["add", "subtract", "multiply", "divide"]),
 *     a: Schema.Number,
 *     b: Schema.Number
 *   }),
 *   success: Schema.Number
 * })
 * 
 * const ProviderDefinedTool = Tool.providerDefined({
 *   id: "openai.web_search",
 *   customName: "OpenAiWebSearch",
 *   providerName: "web_search",
 *   args: Schema.Struct({
 *     query: Schema.String
 *   }),
 *   success: Schema.Struct({
 *     results: Schema.Array(Schema.Struct({
 *       title: Schema.String,
 *       url: Schema.String,
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 * 
 * console.log(Tool.isUserDefined(UserDefinedTool)) // false
 * console.log(Tool.isUserDefined(ProviderDefinedTool)) // true
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
import * as ToolModule from "effect/unstable/ai/Tool";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isProviderDefined";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "Type guard to check if a value is a provider-defined tool.";
const sourceExample = "import { Schema } from \"effect\"\nimport { Tool } from \"effect/unstable/ai\"\n\nconst UserDefinedTool = Tool.make(\"Calculator\", {\n  description: \"Performs basic arithmetic operations\",\n  parameters: Schema.Struct({\n    operation: Schema.Literals([\"add\", \"subtract\", \"multiply\", \"divide\"]),\n    a: Schema.Number,\n    b: Schema.Number\n  }),\n  success: Schema.Number\n})\n\nconst ProviderDefinedTool = Tool.providerDefined({\n  id: \"openai.web_search\",\n  customName: \"OpenAiWebSearch\",\n  providerName: \"web_search\",\n  args: Schema.Struct({\n    query: Schema.String\n  }),\n  success: Schema.Struct({\n    results: Schema.Array(Schema.Struct({\n      title: Schema.String,\n      url: Schema.String,\n      snippet: Schema.String\n    }))\n  })\n})\n\nconsole.log(Tool.isUserDefined(UserDefinedTool)) // false\nconsole.log(Tool.isUserDefined(ProviderDefinedTool)) // true";
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
