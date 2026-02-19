/**
 * Export Playground
 *
 * Package: @effect/ai-openai
 * Module: @effect/ai-openai/OpenAiTelemetry
 * Export: addGenAIAnnotations
 * Kind: const
 * Source: .repos/effect-smol/packages/ai/openai/src/OpenAiTelemetry.ts
 * Generated: 2026-02-19T04:13:56.360Z
 *
 * Overview:
 * Applies the specified OpenAi GenAI telemetry attributes to the provided `Span`.
 *
 * Source JSDoc Example:
 * (No inline example was found in the source JSDoc.)
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as OpenAiTelemetryModule from "@effect/ai-openai/OpenAiTelemetry";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "addGenAIAnnotations";
const exportKind = "const";
const moduleImportPath = "@effect/ai-openai/OpenAiTelemetry";
const sourceSummary = "Applies the specified OpenAi GenAI telemetry attributes to the provided `Span`.";
const sourceExample = "";
const moduleRecord = OpenAiTelemetryModule as Record<string, unknown>;

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
