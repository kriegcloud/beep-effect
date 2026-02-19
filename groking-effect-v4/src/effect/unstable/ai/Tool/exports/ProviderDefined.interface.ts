/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Tool
 * Export: ProviderDefined
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Tool.ts
 * Generated: 2026-02-19T04:50:45.970Z
 *
 * Overview:
 * A provider-defined tool is a tool which is built into a large language model provider (e.g. web search, code execution).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Schema } from "effect"
 * import { Tool } from "effect/unstable/ai"
 *
 * // Define a web search tool provided by OpenAI
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
 *       snippet: Schema.String
 *     }))
 *   })
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ToolModule from "effect/unstable/ai/Tool";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ProviderDefined";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Tool";
const sourceSummary =
  "A provider-defined tool is a tool which is built into a large language model provider (e.g. web search, code execution).";
const sourceExample =
  'import { Schema } from "effect"\nimport { Tool } from "effect/unstable/ai"\n\n// Define a web search tool provided by OpenAI\nconst WebSearch = Tool.providerDefined({\n  id: "openai.web_search",\n  customName: "OpenAiWebSearch",\n  providerName: "web_search",\n  args: Schema.Struct({\n    query: Schema.String\n  }),\n  success: Schema.Struct({\n    results: Schema.Array(Schema.Struct({\n      title: Schema.String,\n      url: Schema.String,\n      snippet: Schema.String\n    }))\n  })\n})';
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
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
