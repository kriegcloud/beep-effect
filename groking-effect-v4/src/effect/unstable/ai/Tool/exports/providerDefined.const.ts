/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: providerDefined
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:14:24.148Z
 *
 * Overview:
 * Creates a provider-defined tool which leverages functionality built into a large language model provider (e.g. web search, code execution).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 * 
 * // Web search tool provided by OpenAI
 * const WebSearch = Tool.providerDefined({
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
 *       content: Schema.String
 *     }))
 *   })
 * })
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
const exportName = "providerDefined";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary = "Creates a provider-defined tool which leverages functionality built into a large language model provider (e.g. web search, code execution).";
const sourceExample = "import { Schema } from \"effect\"\nimport { Tool } from \"effect/unstable/ai\"\n\n// Web search tool provided by OpenAI\nconst WebSearch = Tool.providerDefined({\n  id: \"openai.web_search\",\n  customName: \"OpenAiWebSearch\",\n  providerName: \"web_search\",\n  args: Schema.Struct({\n    query: Schema.String\n  }),\n  success: Schema.Struct({\n    results: Schema.Array(Schema.Struct({\n      title: Schema.String,\n      url: Schema.String,\n      content: Schema.String\n    }))\n  })\n})";
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
