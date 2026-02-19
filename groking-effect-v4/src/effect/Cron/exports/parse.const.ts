/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: parse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:14:11.219Z
 *
 * Overview:
 * Parses a cron expression into a `Cron` instance.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron, Result } from "effect"
 * import * as assert from "node:assert"
 *
 * // At 04:00 on every day-of-month from 8 through 14.
 * assert.deepStrictEqual(
 *   Cron.parse("0 0 4 8-14 * *"),
 *   Result.succeed(Cron.make({
 *     seconds: [0],
 *     minutes: [0],
 *     hours: [4],
 *     days: [8, 9, 10, 11, 12, 13, 14],
 *     months: [],
 *     weekdays: []
 *   }))
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as CronModule from "effect/Cron";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "parse";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Parses a cron expression into a `Cron` instance.";
const sourceExample =
  'import { Cron, Result } from "effect"\nimport * as assert from "node:assert"\n\n// At 04:00 on every day-of-month from 8 through 14.\nassert.deepStrictEqual(\n  Cron.parse("0 0 4 8-14 * *"),\n  Result.succeed(Cron.make({\n    seconds: [0],\n    minutes: [0],\n    hours: [4],\n    days: [8, 9, 10, 11, 12, 13, 14],\n    months: [],\n    weekdays: []\n  }))\n)';
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
