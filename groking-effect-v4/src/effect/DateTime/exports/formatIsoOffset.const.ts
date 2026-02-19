/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: formatIsoOffset
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.611Z
 *
 * Overview:
 * Format a `DateTime.Zoned` as an ISO string with an offset.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const utc = DateTime.makeUnsafe("2024-01-01T12:00:00Z")
 * console.log(DateTime.formatIsoOffset(utc)) // "2024-01-01T12:00:00.000Z"
 *
 * const zoned = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {
 *   timeZone: DateTime.zoneMakeOffset(3 * 60 * 60 * 1000)
 * })
 * console.log(DateTime.formatIsoOffset(zoned)) // "2024-01-01T15:00:00.000+03:00"
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
const exportName = "formatIsoOffset";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Format a `DateTime.Zoned` as an ISO string with an offset.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst utc = DateTime.makeUnsafe("2024-01-01T12:00:00Z")\nconsole.log(DateTime.formatIsoOffset(utc)) // "2024-01-01T12:00:00.000Z"\n\nconst zoned = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {\n  timeZone: DateTime.zoneMakeOffset(3 * 60 * 60 * 1000)\n})\nconsole.log(DateTime.formatIsoOffset(zoned)) // "2024-01-01T15:00:00.000+03:00"';
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
