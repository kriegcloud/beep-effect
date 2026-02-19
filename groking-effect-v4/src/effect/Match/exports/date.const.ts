/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: date
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:14:14.900Z
 *
 * Overview:
 * Matches values that are instances of `Date`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * const processDateValue = Match.type<unknown>().pipe(
 *   Match.when(Match.date, (date) => {
 *     if (isNaN(date.getTime())) {
 *       return "Invalid date"
 *     }
 *     return `Date: ${date.toISOString().split("T")[0]}`
 *   }),
 *   Match.when(Match.string, (str) => `Date string: ${str}`),
 *   Match.when(
 *     Match.number,
 *     (num) => `Timestamp: ${new Date(num).toISOString()}`
 *   ),
 *   Match.orElse(() => "Not a date-related value")
 * )
 *
 * console.log(processDateValue(new Date("2024-01-01"))) // "Date: 2024-01-01"
 * console.log(processDateValue(new Date("invalid"))) // "Invalid date"
 * console.log(processDateValue("2024-01-01")) // "Date string: 2024-01-01"
 * console.log(processDateValue(1704067200000)) // "Timestamp: 2024-01-01T00:00:00.000Z"
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
import * as Effect from "effect/Effect";
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "date";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches values that are instances of `Date`.";
const sourceExample =
  'import { Match } from "effect"\n\nconst processDateValue = Match.type<unknown>().pipe(\n  Match.when(Match.date, (date) => {\n    if (isNaN(date.getTime())) {\n      return "Invalid date"\n    }\n    return `Date: ${date.toISOString().split("T")[0]}`\n  }),\n  Match.when(Match.string, (str) => `Date string: ${str}`),\n  Match.when(\n    Match.number,\n    (num) => `Timestamp: ${new Date(num).toISOString()}`\n  ),\n  Match.orElse(() => "Not a date-related value")\n)\n\nconsole.log(processDateValue(new Date("2024-01-01"))) // "Date: 2024-01-01"\nconsole.log(processDateValue(new Date("invalid"))) // "Invalid date"\nconsole.log(processDateValue("2024-01-01")) // "Date string: 2024-01-01"\nconsole.log(processDateValue(1704067200000)) // "Timestamp: 2024-01-01T00:00:00.000Z"';
const moduleRecord = MatchModule as Record<string, unknown>;

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
