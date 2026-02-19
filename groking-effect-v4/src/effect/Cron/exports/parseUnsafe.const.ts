/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: parseUnsafe
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:50:34.556Z
 *
 * Overview:
 * Parses a cron expression into a Cron instance, throwing on failure.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron } from "effect"
 *
 * // At 04:00 on every day-of-month from 8 through 14
 * const cron = Cron.parseUnsafe("0 0 4 8-14 * *")
 *
 * // With timezone
 * const cronWithTz = Cron.parseUnsafe("0 0 9 * * *", "America/New_York")
 *
 * // This would throw an error
 * // const invalid = Cron.parseUnsafe("invalid expression")
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
const exportName = "parseUnsafe";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Parses a cron expression into a Cron instance, throwing on failure.";
const sourceExample =
  'import { Cron } from "effect"\n\n// At 04:00 on every day-of-month from 8 through 14\nconst cron = Cron.parseUnsafe("0 0 4 8-14 * *")\n\n// With timezone\nconst cronWithTz = Cron.parseUnsafe("0 0 9 * * *", "America/New_York")\n\n// This would throw an error\n// const invalid = Cron.parseUnsafe("invalid expression")';
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
