/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: spanAnnotations
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Returns the annotations of the current span.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   // Add some annotations to the current span
 *   yield* Effect.annotateCurrentSpan("userId", "123")
 *   yield* Effect.annotateCurrentSpan("operation", "data-processing")
 *
 *   // Retrieve all annotations
 *   const annotations = yield* Effect.spanAnnotations
 *
 *   console.log("Current span annotations:", annotations)
 *   return annotations
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output: Current span annotations: { userId: "123", operation: "data-processing" }
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "spanAnnotations";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Returns the annotations of the current span.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  // Add some annotations to the current span\n  yield* Effect.annotateCurrentSpan("userId", "123")\n  yield* Effect.annotateCurrentSpan("operation", "data-processing")\n\n  // Retrieve all annotations\n  const annotations = yield* Effect.spanAnnotations\n\n  console.log("Current span annotations:", annotations)\n  return annotations\n})\n\nEffect.runPromise(program).then(console.log)\n// Output: Current span annotations: { userId: "123", operation: "data-processing" }';
const moduleRecord = EffectModule as Record<string, unknown>;

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
