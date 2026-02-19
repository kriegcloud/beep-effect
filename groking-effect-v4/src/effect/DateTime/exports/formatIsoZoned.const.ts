/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: formatIsoZoned
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.611Z
 *
 * Overview:
 * Format a `DateTime.Zoned` as a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const zoned = DateTime.makeZonedUnsafe("2024-06-15T14:30:45.123Z", {
 *   timeZone: "Europe/London"
 * })
 *
 * const formatted = DateTime.formatIsoZoned(zoned)
 * console.log(formatted) // "2024-06-15T15:30:45.123+01:00[Europe/London]"
 *
 * const offsetZone = DateTime.makeZonedUnsafe("2024-06-15T14:30:45.123Z", {
 *   timeZone: DateTime.zoneMakeOffset(3 * 60 * 60 * 1000)
 * })
 *
 * const offsetFormatted = DateTime.formatIsoZoned(offsetZone)
 * console.log(offsetFormatted) // "2024-06-15T17:30:45.123+03:00"
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
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "formatIsoZoned";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Format a `DateTime.Zoned` as a string.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst zoned = DateTime.makeZonedUnsafe("2024-06-15T14:30:45.123Z", {\n  timeZone: "Europe/London"\n})\n\nconst formatted = DateTime.formatIsoZoned(zoned)\nconsole.log(formatted) // "2024-06-15T15:30:45.123+01:00[Europe/London]"\n\nconst offsetZone = DateTime.makeZonedUnsafe("2024-06-15T14:30:45.123Z", {\n  timeZone: DateTime.zoneMakeOffset(3 * 60 * 60 * 1000)\n})\n\nconst offsetFormatted = DateTime.formatIsoZoned(offsetZone)\nconsole.log(offsetFormatted) // "2024-06-15T17:30:45.123+03:00"';
const moduleRecord = DateTimeModule as Record<string, unknown>;

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
