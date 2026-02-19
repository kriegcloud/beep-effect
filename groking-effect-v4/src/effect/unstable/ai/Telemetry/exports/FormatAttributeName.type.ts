/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Telemetry
 * Export: FormatAttributeName
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Telemetry.ts
 * Generated: 2026-02-19T04:14:24.111Z
 *
 * Overview:
 * Utility type for converting camelCase names to snake_case format.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Telemetry } from "effect/unstable/ai"
 * 
 * type Formatted1 = Telemetry.FormatAttributeName<"modelName"> // "model_name"
 * type Formatted2 = Telemetry.FormatAttributeName<"maxTokens"> // "max_tokens"
 * type Formatted3 = Telemetry.FormatAttributeName<"temperature"> // "temperature"
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
const exportName = "FormatAttributeName";
const exportKind = "type";
const moduleImportPath = "effect/unstable/ai/Telemetry";
const sourceSummary = "Utility type for converting camelCase names to snake_case format.";
const sourceExample = "import type { Telemetry } from \"effect/unstable/ai\"\n\ntype Formatted1 = Telemetry.FormatAttributeName<\"modelName\"> // \"model_name\"\ntype Formatted2 = Telemetry.FormatAttributeName<\"maxTokens\"> // \"max_tokens\"\ntype Formatted3 = Telemetry.FormatAttributeName<\"temperature\"> // \"temperature\"";
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
