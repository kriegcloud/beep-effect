/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cron
 * Export: Cron
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cron.ts
 * Generated: 2026-02-19T04:14:11.218Z
 *
 * Overview:
 * Represents a cron schedule with time constraints and timezone information.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cron } from "effect"
 *
 * // Create a cron that runs at 9 AM on weekdays
 * const weekdayMorning = Cron.make({
 *   minutes: [0],
 *   hours: [9],
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
 *
 * // Check if a date matches the schedule
 * const matches = Cron.match(weekdayMorning, new Date("2023-06-05T09:00:00"))
 * console.log(matches) // true if it's 9 AM on a weekday
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as CronModule from "effect/Cron";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Cron";
const exportKind = "interface";
const moduleImportPath = "effect/Cron";
const sourceSummary = "Represents a cron schedule with time constraints and timezone information.";
const sourceExample =
  'import { Cron } from "effect"\n\n// Create a cron that runs at 9 AM on weekdays\nconst weekdayMorning = Cron.make({\n  minutes: [0],\n  hours: [9],\n  days: [\n    1,\n    2,\n    3,\n    4,\n    5,\n    6,\n    7,\n    8,\n    9,\n    10,\n    11,\n    12,\n    13,\n    14,\n    15,\n    16,\n    17,\n    18,\n    19,\n    20,\n    21,\n    22,\n    23,\n    24,\n    25,\n    26,\n    27,\n    28,\n    29,\n    30,\n    31\n  ],\n  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],\n  weekdays: [1, 2, 3, 4, 5] // Monday to Friday\n})\n\n// Check if a date matches the schedule\nconst matches = Cron.match(weekdayMorning, new Date("2023-06-05T09:00:00"))\nconsole.log(matches) // true if it\'s 9 AM on a weekday';
const moduleRecord = CronModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
