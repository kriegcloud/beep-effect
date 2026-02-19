/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:14:11.219Z
 *
 * Overview:
 * Creates a Cron instance from time constraints.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron } from "effect"
 * 
 * // Every day at midnight
 * const midnight = Cron.make({
 *   minutes: [0],
 *   hours: [0],
 *   days: [
 *     1,
 *     2,
 *     3,
 *     4,
 *     5,
 *     6,
 *     7,
 *     8,
 *     9,
 *     10,
 *     11,
 *     12,
 *     13,
 *     14,
 *     15,
 *     16,
 *     17,
 *     18,
 *     19,
 *     20,
 *     21,
 *     22,
 *     23,
 *     24,
 *     25,
 *     26,
 *     27,
 *     28,
 *     29,
 *     30,
 *     31
 *   ],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [0, 1, 2, 3, 4, 5, 6]
 * })
 * 
 * // Every 15 minutes during business hours on weekdays
 * const businessHours = Cron.make({
 *   minutes: [0, 15, 30, 45],
 *   hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
 *   days: [
 *     1,
 *     2,
 *     3,
 *     4,
 *     5,
 *     6,
 *     7,
 *     8,
 *     9,
 *     10,
 *     11,
 *     12,
 *     13,
 *     14,
 *     15,
 *     16,
 *     17,
 *     18,
 *     19,
 *     20,
 *     21,
 *     22,
 *     23,
 *     24,
 *     25,
 *     26,
 *     27,
 *     28,
 *     29,
 *     30,
 *     31
 *   ],
 *   months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
 *   weekdays: [1, 2, 3, 4, 5] // Monday to Friday
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CronModule from "effect/Cron";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Creates a Cron instance from time constraints.";
const sourceExample = "import { Cron } from \"effect\"\n\n// Every day at midnight\nconst midnight = Cron.make({\n  minutes: [0],\n  hours: [0],\n  days: [\n    1,\n    2,\n    3,\n    4,\n    5,\n    6,\n    7,\n    8,\n    9,\n    10,\n    11,\n    12,\n    13,\n    14,\n    15,\n    16,\n    17,\n    18,\n    19,\n    20,\n    21,\n    22,\n    23,\n    24,\n    25,\n    26,\n    27,\n    28,\n    29,\n    30,\n    31\n  ],\n  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],\n  weekdays: [0, 1, 2, 3, 4, 5, 6]\n})\n\n// Every 15 minutes during business hours on weekdays\nconst businessHours = Cron.make({\n  minutes: [0, 15, 30, 45],\n  hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],\n  days: [\n    1,\n    2,\n    3,\n    4,\n    5,\n    6,\n    7,\n    8,\n    9,\n    10,\n    11,\n    12,\n    13,\n    14,\n    15,\n    16,\n    17,\n    18,\n    19,\n    20,\n    21,\n    22,\n    23,\n    24,\n    25,\n    26,\n    27,\n    28,\n    29,\n    30,\n    31\n  ],\n  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],\n  weekdays: [1, 2, 3, 4, 5] // Monday to Friday\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
