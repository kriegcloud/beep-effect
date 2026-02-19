/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tracer
 * Export: SpanOptions
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Tracer.ts
 * Generated: 2026-02-19T04:50:43.303Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Tracer } from "effect"
 * import { Effect } from "effect"
 *
 * // Create an effect with span options
 * const options: Tracer.SpanOptions = {
 *   attributes: { "user.id": "123", "operation": "data-processing" },
 *   kind: "internal",
 *   root: false,
 *   captureStackTrace: true
 * }
 *
 * const program = Effect.succeed("Hello World").pipe(
 *   Effect.withSpan("my-operation", options)
 * )
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
import * as TracerModule from "effect/Tracer";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "SpanOptions";
const exportKind = "interface";
const moduleImportPath = "effect/Tracer";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import type { Tracer } from "effect"\nimport { Effect } from "effect"\n\n// Create an effect with span options\nconst options: Tracer.SpanOptions = {\n  attributes: { "user.id": "123", "operation": "data-processing" },\n  kind: "internal",\n  root: false,\n  captureStackTrace: true\n}\n\nconst program = Effect.succeed("Hello World").pipe(\n  Effect.withSpan("my-operation", options)\n)';
const moduleRecord = TracerModule as Record<string, unknown>;

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
