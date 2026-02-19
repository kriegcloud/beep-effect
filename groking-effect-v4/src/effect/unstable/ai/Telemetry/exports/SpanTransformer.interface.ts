/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/ai/Telemetry
 * Export: SpanTransformer
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/unstable/ai/Telemetry.ts
 * Generated: 2026-02-19T04:14:24.112Z
 *
 * Overview:
 * A function that can transform OpenTelemetry spans based on AI operation data.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Telemetry } from "effect/unstable/ai"
 *
 * const customTransformer: Telemetry.SpanTransformer = ({ response, span }) => {
 *   // Add custom attributes based on the response
 *   const textParts = response.filter((part) => part.type === "text")
 *   const totalTextLength = textParts.reduce(
 *     (sum, part) => sum + (part.type === "text" ? part.text.length : 0),
 *     0
 *   )
 *   span.attribute("total_text_length", totalTextLength)
 * }
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
import * as TelemetryModule from "effect/unstable/ai/Telemetry";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SpanTransformer";
const exportKind = "interface";
const moduleImportPath = "effect/unstable/ai/Telemetry";
const sourceSummary = "A function that can transform OpenTelemetry spans based on AI operation data.";
const sourceExample =
  'import type { Telemetry } from "effect/unstable/ai"\n\nconst customTransformer: Telemetry.SpanTransformer = ({ response, span }) => {\n  // Add custom attributes based on the response\n  const textParts = response.filter((part) => part.type === "text")\n  const totalTextLength = textParts.reduce(\n    (sum, part) => sum + (part.type === "text" ? part.text.length : 0),\n    0\n  )\n  span.attribute("total_text_length", totalTextLength)\n}';
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
