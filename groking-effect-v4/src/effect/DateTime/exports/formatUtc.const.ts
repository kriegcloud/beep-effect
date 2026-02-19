/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: formatUtc
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.265Z
 *
 * Overview:
 * Format a `DateTime` as a string using the `DateTimeFormat` API.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const dt = DateTime.makeZonedUnsafe("2024-06-15T14:30:00Z", {
 *   timeZone: "Europe/London"
 * })
 *
 * // Force UTC formatting regardless of time zone
 * const utcFormatted = DateTime.formatUtc(dt, {
 *   year: "numeric",
 *   month: "2-digit",
 *   day: "2-digit",
 *   hour: "2-digit",
 *   minute: "2-digit",
 *   timeZoneName: "short"
 * })
 *
 * console.log(utcFormatted) // "06/15/2024, 02:30 PM UTC"
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
import * as DateTimeModule from "effect/DateTime";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "formatUtc";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Format a `DateTime` as a string using the `DateTimeFormat` API.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst dt = DateTime.makeZonedUnsafe("2024-06-15T14:30:00Z", {\n  timeZone: "Europe/London"\n})\n\n// Force UTC formatting regardless of time zone\nconst utcFormatted = DateTime.formatUtc(dt, {\n  year: "numeric",\n  month: "2-digit",\n  day: "2-digit",\n  hour: "2-digit",\n  minute: "2-digit",\n  timeZoneName: "short"\n})\n\nconsole.log(utcFormatted) // "06/15/2024, 02:30 PM UTC"';
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
