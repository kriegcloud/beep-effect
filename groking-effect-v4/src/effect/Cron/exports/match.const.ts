/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:14:11.219Z
 *
 * Overview:
 * Checks if a given date/time falls within an active Cron time window.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron, Result } from "effect"
 *
 * const cron = Result.getOrThrow(Cron.parse("0 0 4 8-14 * *"))
 *
 * // Check if specific dates match
 * const matches1 = Cron.match(cron, new Date("2021-01-08T04:00:00Z"))
 * console.log(matches1) // true - 4 AM on the 8th
 *
 * const matches2 = Cron.match(cron, new Date("2021-01-08T05:00:00Z"))
 * console.log(matches2) // false - wrong hour
 *
 * const matches3 = Cron.match(cron, new Date("2021-01-07T04:00:00Z"))
 * console.log(matches3) // false - wrong day
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
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Checks if a given date/time falls within an active Cron time window.";
const sourceExample =
  'import { Cron, Result } from "effect"\n\nconst cron = Result.getOrThrow(Cron.parse("0 0 4 8-14 * *"))\n\n// Check if specific dates match\nconst matches1 = Cron.match(cron, new Date("2021-01-08T04:00:00Z"))\nconsole.log(matches1) // true - 4 AM on the 8th\n\nconst matches2 = Cron.match(cron, new Date("2021-01-08T05:00:00Z"))\nconsole.log(matches2) // false - wrong hour\n\nconst matches3 = Cron.match(cron, new Date("2021-01-07T04:00:00Z"))\nconsole.log(matches3) // false - wrong day';
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
