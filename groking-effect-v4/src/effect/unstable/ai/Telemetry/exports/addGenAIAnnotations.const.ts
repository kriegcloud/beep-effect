/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Telemetry
 * Export: addGenAIAnnotations
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Telemetry.ts
 * Generated: 2026-02-19T04:50:45.922Z
 *
 * Overview:
 * Applies GenAI telemetry attributes to an OpenTelemetry span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { Telemetry } from "effect/unstable/ai"
 *
 * const directUsage = Effect.gen(function*() {
 *   const span = yield* Effect.currentSpan
 *
 *   Telemetry.addGenAIAnnotations(span, {
 *     system: "openai",
 *     request: { model: "gpt-4", temperature: 0.7 },
 *     usage: { inputTokens: 100, outputTokens: 50 }
 *   })
 * })
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
import * as TelemetryModule from "effect/unstable/ai/Telemetry";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "addGenAIAnnotations";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Telemetry";
const sourceSummary = "Applies GenAI telemetry attributes to an OpenTelemetry span.";
const sourceExample =
  'import { Effect } from "effect"\nimport { Telemetry } from "effect/unstable/ai"\n\nconst directUsage = Effect.gen(function*() {\n  const span = yield* Effect.currentSpan\n\n  Telemetry.addGenAIAnnotations(span, {\n    system: "openai",\n    request: { model: "gpt-4", temperature: 0.7 },\n    usage: { inputTokens: 100, outputTokens: 50 }\n  })\n})';
const moduleRecord = TelemetryModule as Record<string, unknown>;

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
