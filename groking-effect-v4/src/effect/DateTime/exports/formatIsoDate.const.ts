/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: formatIsoDate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.611Z
 *
 * Overview:
 * Format a `DateTime` as a time zone adjusted ISO date string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const dt = DateTime.makeUnsafe("2024-01-01T23:30:00Z")
 * console.log(DateTime.formatIsoDate(dt)) // "2024-01-01"
 *
 * const zoned = DateTime.makeZonedUnsafe("2024-01-01T23:30:00Z", {
 *   timeZone: "Pacific/Auckland" // UTC+12/13
 * })
 * console.log(DateTime.formatIsoDate(zoned)) // "2024-01-02" (next day in Auckland)
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
const exportName = "formatIsoDate";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Format a `DateTime` as a time zone adjusted ISO date string.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst dt = DateTime.makeUnsafe("2024-01-01T23:30:00Z")\nconsole.log(DateTime.formatIsoDate(dt)) // "2024-01-01"\n\nconst zoned = DateTime.makeZonedUnsafe("2024-01-01T23:30:00Z", {\n  timeZone: "Pacific/Auckland" // UTC+12/13\n})\nconsole.log(DateTime.formatIsoDate(zoned)) // "2024-01-02" (next day in Auckland)';
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
