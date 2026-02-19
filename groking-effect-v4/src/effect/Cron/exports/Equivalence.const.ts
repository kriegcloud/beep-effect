/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: Equivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:14:11.219Z
 *
 * Overview:
 * An Equivalence instance for comparing Cron schedules.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron } from "effect"
 *
 * const cron1 = Cron.make({
 *   minutes: [0, 30],
 *   hours: [9],
 *   days: [1, 15],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * const cron2 = Cron.make({
 *   minutes: [30, 0], // Different order
 *   hours: [9],
 *   days: [15, 1], // Different order
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * console.log(Cron.Equivalence(cron1, cron2)) // true
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
import * as CronModule from "effect/Cron";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Equivalence";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "An Equivalence instance for comparing Cron schedules.";
const sourceExample =
  'import { Cron } from "effect"\n\nconst cron1 = Cron.make({\n  minutes: [0, 30],\n  hours: [9],\n  days: [1, 15],\n  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],\n  weekdays: [1, 2, 3, 4, 5]\n})\n\nconst cron2 = Cron.make({\n  minutes: [30, 0], // Different order\n  hours: [9],\n  days: [15, 1], // Different order\n  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],\n  weekdays: [1, 2, 3, 4, 5]\n})\n\nconsole.log(Cron.Equivalence(cron1, cron2)) // true';
const moduleRecord = CronModule as Record<string, unknown>;

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
