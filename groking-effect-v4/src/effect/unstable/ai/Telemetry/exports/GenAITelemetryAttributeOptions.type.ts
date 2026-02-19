/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Telemetry
 * Export: GenAITelemetryAttributeOptions
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Telemetry.ts
 * Generated: 2026-02-19T04:14:24.112Z
 *
 * Overview:
 * Configuration options for GenAI telemetry attributes.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Telemetry } from "effect/unstable/ai"
 * 
 * const telemetryOptions: Telemetry.GenAITelemetryAttributeOptions = {
 *   system: "openai",
 *   operation: {
 *     name: "chat"
 *   },
 *   request: {
 *     model: "gpt-4-turbo",
 *     temperature: 0.7,
 *     maxTokens: 2000
 *   },
 *   response: {
 *     id: "chatcmpl-123",
 *     model: "gpt-4-turbo-2024-04-09",
 *     finishReasons: ["stop"]
 *   },
 *   usage: {
 *     inputTokens: 50,
 *     outputTokens: 25
 *   }
 * }
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
import * as TelemetryModule from "effect/unstable/ai/Telemetry";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "GenAITelemetryAttributeOptions";
const exportKind = "type";
const moduleImportPath = "effect/unstable/ai/Telemetry";
const sourceSummary = "Configuration options for GenAI telemetry attributes.";
const sourceExample = "import type { Telemetry } from \"effect/unstable/ai\"\n\nconst telemetryOptions: Telemetry.GenAITelemetryAttributeOptions = {\n  system: \"openai\",\n  operation: {\n    name: \"chat\"\n  },\n  request: {\n    model: \"gpt-4-turbo\",\n    temperature: 0.7,\n    maxTokens: 2000\n  },\n  response: {\n    id: \"chatcmpl-123\",\n    model: \"gpt-4-turbo-2024-04-09\",\n    finishReasons: [\"stop\"]\n  },\n  usage: {\n    inputTokens: 50,\n    outputTokens: 25\n  }\n}";
const moduleRecord = TelemetryModule as Record<string, unknown>;

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
