/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Clock
 * Export: clockWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Clock.ts
 * Generated: 2026-02-19T04:50:34.386Z
 *
 * Overview:
 * Accesses the current Clock service and uses it to run the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Clock, Effect } from "effect"
 *
 * const program = Clock.clockWith((clock) =>
 *   Effect.sync(() => {
 *     const currentTime = clock.currentTimeMillisUnsafe()
 *     console.log(`Current time: ${currentTime}`)
 *     return currentTime
 *   })
 * )
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
import * as ClockModule from "effect/Clock";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clockWith";
const exportKind = "const";
const moduleImportPath = "effect/Clock";
const sourceSummary = "Accesses the current Clock service and uses it to run the provided function.";
const sourceExample =
  'import { Clock, Effect } from "effect"\n\nconst program = Clock.clockWith((clock) =>\n  Effect.sync(() => {\n    const currentTime = clock.currentTimeMillisUnsafe()\n    console.log(`Current time: ${currentTime}`)\n    return currentTime\n  })\n)';
const moduleRecord = ClockModule as Record<string, unknown>;

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
