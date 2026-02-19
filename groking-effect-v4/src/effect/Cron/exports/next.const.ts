/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: next
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:50:34.556Z
 *
 * Overview:
 * Returns the next scheduled date/time for the given Cron instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const cron = Result.getOrThrow(Cron.parse("0 0 4 8-14 * *"))
 *
 * // Get next run after a specific date
 * const after = new Date("2021-01-01T00:00:00Z")
 * const nextRun = Cron.next(cron, after)
 * console.log(nextRun) // 2021-01-08T04:00:00.000Z
 *
 * // Get next run from current time
 * const nextFromNow = Cron.next(cron)
 * console.log(nextFromNow) // Next occurrence from now
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
const exportName = "next";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Returns the next scheduled date/time for the given Cron instance.";
const sourceExample =
  'import { Cron, Result } from "effect"\n\nconst cron = Result.getOrThrow(Cron.parse("0 0 4 8-14 * *"))\n\n// Get next run after a specific date\nconst after = new Date("2021-01-01T00:00:00Z")\nconst nextRun = Cron.next(cron, after)\nconsole.log(nextRun) // 2021-01-08T04:00:00.000Z\n\n// Get next run from current time\nconst nextFromNow = Cron.next(cron)\nconsole.log(nextFromNow) // Next occurrence from now';
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
