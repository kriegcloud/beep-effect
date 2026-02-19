/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: sequence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:50:34.556Z
 *
 * Overview:
 * Returns an infinite iterator that yields dates matching the Cron schedule.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const cron = Result.getOrThrow(Cron.parse("0 0 9 * * 1-5")) // 9 AM weekdays
 *
 * // Get first 5 occurrences
 * const iterator = Cron.sequence(cron, new Date("2023-01-01"))
 * const next5 = Array.from({ length: 5 }, () => iterator.next().value)
 *
 * console.log(next5)
 * // [Mon Jan 02 2023 09:00:00, Tue Jan 03 2023 09:00:00, ...]
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
const exportName = "sequence";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Returns an infinite iterator that yields dates matching the Cron schedule.";
const sourceExample =
  'import { Cron, Result } from "effect"\n\nconst cron = Result.getOrThrow(Cron.parse("0 0 9 * * 1-5")) // 9 AM weekdays\n\n// Get first 5 occurrences\nconst iterator = Cron.sequence(cron, new Date("2023-01-01"))\nconst next5 = Array.from({ length: 5 }, () => iterator.next().value)\n\nconsole.log(next5)\n// [Mon Jan 02 2023 09:00:00, Tue Jan 03 2023 09:00:00, ...]';
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
