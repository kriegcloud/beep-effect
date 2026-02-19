/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Response
 * Export: ToolResultPart
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Response.ts
 * Generated: 2026-02-19T04:14:24.103Z
 *
 * Overview:
 * Response part representing the result of a tool call.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * interface WeatherData {
 *   temperature: number
 *   condition: string
 *   humidity: number
 * }
 *
 * const toolResultPart: Response.ToolResultPart<
 *   "get_weather",
 *   WeatherData,
 *   never
 * > = Response.toolResultPart({
 *   id: "call_123",
 *   name: "get_weather",
 *   isFailure: false,
 *   result: {
 *     temperature: 22,
 *     condition: "sunny",
 *     humidity: 65
 *   },
 *   encodedResult: {
 *     temperature: 22,
 *     condition: "sunny",
 *     humidity: 65
 *   },
 *   providerExecuted: false,
 *   preliminary: false
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ResponseModule from "effect/unstable/ai/Response";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ToolResultPart";
const exportKind = "type";
const moduleImportPath = "effect/unstable/ai/Response";
const sourceSummary = "Response part representing the result of a tool call.";
const sourceExample =
  'import { Response } from "effect/unstable/ai"\n\ninterface WeatherData {\n  temperature: number\n  condition: string\n  humidity: number\n}\n\nconst toolResultPart: Response.ToolResultPart<\n  "get_weather",\n  WeatherData,\n  never\n> = Response.toolResultPart({\n  id: "call_123",\n  name: "get_weather",\n  isFailure: false,\n  result: {\n    temperature: 22,\n    condition: "sunny",\n    humidity: 65\n  },\n  encodedResult: {\n    temperature: 22,\n    condition: "sunny",\n    humidity: 65\n  },\n  providerExecuted: false,\n  preliminary: false\n})';
const moduleRecord = ResponseModule as Record<string, unknown>;

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
