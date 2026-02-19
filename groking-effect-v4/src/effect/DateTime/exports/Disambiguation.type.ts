/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: Disambiguation
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.610Z
 *
 * Overview:
 * A `Disambiguation` is used to resolve ambiguities when a `DateTime` is ambiguous, such as during a daylight saving time transition.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * // Fall-back example: 01:30 on Nov 2, 2025 in New York happens twice
 * const ambiguousTime = { year: 2025, month: 11, day: 2, hours: 1, minutes: 30 }
 * const timeZone = DateTime.zoneMakeNamedUnsafe("America/New_York")
 *
 * DateTime.makeZoned(ambiguousTime, {
 *   timeZone,
 *   adjustForTimeZone: true,
 *   disambiguation: "earlier"
 * })
 * // Earlier occurrence (DST time): 2025-11-02T05:30:00.000Z
 *
 * DateTime.makeZoned(ambiguousTime, {
 *   timeZone,
 *   adjustForTimeZone: true,
 *   disambiguation: "later"
 * })
 * // Later occurrence (standard time): 2025-11-02T06:30:00.000Z
 *
 * // Gap example: 02:30 on Mar 9, 2025 in New York doesn't exist
 * const gapTime = { year: 2025, month: 3, day: 9, hours: 2, minutes: 30 }
 *
 * DateTime.makeZoned(gapTime, {
 *   timeZone,
 *   adjustForTimeZone: true,
 *   disambiguation: "earlier"
 * })
 * // Time before gap: 2025-03-09T06:30:00.000Z (01:30 EST)
 *
 * DateTime.makeZoned(gapTime, {
 *   timeZone,
 *   adjustForTimeZone: true,
 *   disambiguation: "later"
 * })
 * // Time after gap: 2025-03-09T07:30:00.000Z (03:30 EDT)
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Disambiguation";
const exportKind = "type";
const moduleImportPath = "effect/DateTime";
const sourceSummary =
  "A `Disambiguation` is used to resolve ambiguities when a `DateTime` is ambiguous, such as during a daylight saving time transition.";
const sourceExample =
  'import { DateTime } from "effect"\n\n// Fall-back example: 01:30 on Nov 2, 2025 in New York happens twice\nconst ambiguousTime = { year: 2025, month: 11, day: 2, hours: 1, minutes: 30 }\nconst timeZone = DateTime.zoneMakeNamedUnsafe("America/New_York")\n\nDateTime.makeZoned(ambiguousTime, {\n  timeZone,\n  adjustForTimeZone: true,\n  disambiguation: "earlier"\n})\n// Earlier occurrence (DST time): 2025-11-02T05:30:00.000Z\n\nDateTime.makeZoned(ambiguousTime, {\n  timeZone,\n  adjustForTimeZone: true,\n  disambiguation: "later"\n})\n// Later occurrence (standard time): 2025-11-02T06:30:00.000Z\n\n// Gap example: 02:30 on Mar 9, 2025 in New York doesn\'t exist\nconst gapTime = { year: 2025, month: 3, day: 9, hours: 2, minutes: 30 }\n\nDateTime.makeZoned(gapTime, {\n  timeZone,\n  adjustForTimeZone: true,\n  disambiguation: "earlier"\n})\n// Time before gap: 2025-03-09T06:30:00.000Z (01:30 EST)\n\nDateTime.makeZoned(gapTime, {\n  timeZone,\n  adjustForTimeZone: true,\n  disambiguation: "later"\n})\n// Time after gap: 2025-03-09T07:30:00.000Z (03:30 EDT)';
const moduleRecord = DateTimeModule as Record<string, unknown>;

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
