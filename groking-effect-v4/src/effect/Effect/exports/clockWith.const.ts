/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: clockWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.908Z
 *
 * Overview:
 * Retrieves the `Clock` service from the context and provides it to the specified effectful function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.clockWith((clock) =>
 *   clock.currentTimeMillis.pipe(
 *     Effect.map((currentTime) => `Current time is: ${currentTime}`),
 *     Effect.tap(Console.log)
 *   )
 * )
 *
 * Effect.runFork(program)
 * // Example Output:
 * // Current time is: 1735484929744
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clockWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Retrieves the `Clock` service from the context and provides it to the specified effectful function.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst program = Effect.clockWith((clock) =>\n  clock.currentTimeMillis.pipe(\n    Effect.map((currentTime) => `Current time is: ${currentTime}`),\n    Effect.tap(Console.log)\n  )\n)\n\nEffect.runFork(program)\n// Example Output:\n// Current time is: 1735484929744';
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
