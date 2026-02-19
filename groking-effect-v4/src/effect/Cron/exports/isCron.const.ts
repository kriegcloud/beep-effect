/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: isCron
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:50:34.556Z
 *
 * Overview:
 * Checks if a given value is a Cron instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron } from "effect"
 *
 * const cron = Cron.make({
 *   minutes: [0],
 *   hours: [9],
 *   days: [1, 15],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5]
 * })
 *
 * console.log(Cron.isCron(cron)) // true
 * console.log(Cron.isCron({})) // false
 * console.log(Cron.isCron("not a cron")) // false
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
import * as CronModule from "effect/Cron";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isCron";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Checks if a given value is a Cron instance.";
const sourceExample =
  'import { Cron } from "effect"\n\nconst cron = Cron.make({\n  minutes: [0],\n  hours: [9],\n  days: [1, 15],\n  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],\n  weekdays: [1, 2, 3, 4, 5]\n})\n\nconsole.log(Cron.isCron(cron)) // true\nconsole.log(Cron.isCron({})) // false\nconsole.log(Cron.isCron("not a cron")) // false';
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
