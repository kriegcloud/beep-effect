/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: logTrace
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.390Z
 *
 * Overview:
 * Logs one or more messages at the TRACE level.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.logTrace("Entering function processData")
 *
 *   // Trace detailed execution flow
 *   for (let i = 0; i < 3; i++) {
 *     yield* Effect.logTrace("Loop iteration:", i, "Processing item")
 *   }
 *
 *   yield* Effect.logTrace("Exiting function processData")
 * })
 *
 * Effect.runPromise(program)
 * // Output:
 * // timestamp=2023-... level=TRACE message="Entering function processData"
 * // timestamp=2023-... level=TRACE message="Loop iteration: 0 Processing item"
 * // timestamp=2023-... level=TRACE message="Loop iteration: 1 Processing item"
 * // timestamp=2023-... level=TRACE message="Loop iteration: 2 Processing item"
 * // timestamp=2023-... level=TRACE message="Exiting function processData"
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
const exportName = "logTrace";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Logs one or more messages at the TRACE level.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.logTrace("Entering function processData")\n\n  // Trace detailed execution flow\n  for (let i = 0; i < 3; i++) {\n    yield* Effect.logTrace("Loop iteration:", i, "Processing item")\n  }\n\n  yield* Effect.logTrace("Exiting function processData")\n})\n\nEffect.runPromise(program)\n// Output:\n// timestamp=2023-... level=TRACE message="Entering function processData"\n// timestamp=2023-... level=TRACE message="Loop iteration: 0 Processing item"\n// timestamp=2023-... level=TRACE message="Loop iteration: 1 Processing item"\n// timestamp=2023-... level=TRACE message="Loop iteration: 2 Processing item"\n// timestamp=2023-... level=TRACE message="Exiting function processData"';
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
