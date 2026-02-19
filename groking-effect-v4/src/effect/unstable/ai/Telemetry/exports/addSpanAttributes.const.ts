/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Telemetry
 * Export: addSpanAttributes
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Telemetry.ts
 * Generated: 2026-02-19T04:14:24.111Z
 *
 * Overview:
 * Creates a function to add attributes to a span with a given prefix and key transformation.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Tracer } from "effect"
 * import { String } from "effect"
 * import { Telemetry } from "effect/unstable/ai"
 * 
 * const addCustomAttributes = Telemetry.addSpanAttributes(
 *   "custom.ai",
 *   String.camelToSnake
 * )
 * 
 * // Usage with a span
 * declare const span: Tracer.Span
 * addCustomAttributes(span, {
 *   modelName: "gpt-4",
 *   maxTokens: 1000
 * })
 * // Results in attributes: "custom.ai.model_name" and "custom.ai.max_tokens"
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
import * as TelemetryModule from "effect/unstable/ai/Telemetry";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "addSpanAttributes";
const exportKind = "const";
const moduleImportPath = "effect/unstable/ai/Telemetry";
const sourceSummary = "Creates a function to add attributes to a span with a given prefix and key transformation.";
const sourceExample = "import type { Tracer } from \"effect\"\nimport { String } from \"effect\"\nimport { Telemetry } from \"effect/unstable/ai\"\n\nconst addCustomAttributes = Telemetry.addSpanAttributes(\n  \"custom.ai\",\n  String.camelToSnake\n)\n\n// Usage with a span\ndeclare const span: Tracer.Span\naddCustomAttributes(span, {\n  modelName: \"gpt-4\",\n  maxTokens: 1000\n})\n// Results in attributes: \"custom.ai.model_name\" and \"custom.ai.max_tokens\"";
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
