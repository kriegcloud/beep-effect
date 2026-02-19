/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Duration
 * Export: parts
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Duration.ts
 * Generated: 2026-02-19T04:50:34.676Z
 *
 * Overview:
 * Converts a `Duration` to its parts.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration } from "effect"
 *
 * // Create a complex duration by adding multiple parts
 * const duration = Duration.sum(
 *   Duration.sum(
 *     Duration.sum(Duration.days(1), Duration.hours(2)),
 *     Duration.sum(Duration.minutes(30), Duration.seconds(45))
 *   ),
 *   Duration.millis(123)
 * )
 * const components = Duration.parts(duration)
 * console.log(components)
 * // {
 * //   days: 1,
 * //   hours: 2,
 * //   minutes: 30,
 * //   seconds: 45,
 * //   millis: 123,
 * //   nanos: 0
 * // }
 *
 * const complex = Duration.sum(Duration.hours(25), Duration.minutes(90))
 * const complexParts = Duration.parts(complex)
 * console.log(complexParts)
 * // {
 * //   days: 1,
 * //   hours: 2,
 * //   minutes: 30,
 * //   seconds: 0,
 * //   millis: 0,
 * //   nanos: 0
 * // }
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
import * as DurationModule from "effect/Duration";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "parts";
const exportKind = "const";
const moduleImportPath = "effect/Duration";
const sourceSummary = "Converts a `Duration` to its parts.";
const sourceExample =
  'import { Duration } from "effect"\n\n// Create a complex duration by adding multiple parts\nconst duration = Duration.sum(\n  Duration.sum(\n    Duration.sum(Duration.days(1), Duration.hours(2)),\n    Duration.sum(Duration.minutes(30), Duration.seconds(45))\n  ),\n  Duration.millis(123)\n)\nconst components = Duration.parts(duration)\nconsole.log(components)\n// {\n//   days: 1,\n//   hours: 2,\n//   minutes: 30,\n//   seconds: 45,\n//   millis: 123,\n//   nanos: 0\n// }\n\nconst complex = Duration.sum(Duration.hours(25), Duration.minutes(90))\nconst complexParts = Duration.parts(complex)\nconsole.log(complexParts)\n// {\n//   days: 1,\n//   hours: 2,\n//   minutes: 30,\n//   seconds: 0,\n//   millis: 0,\n//   nanos: 0\n// }';
const moduleRecord = DurationModule as Record<string, unknown>;

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
