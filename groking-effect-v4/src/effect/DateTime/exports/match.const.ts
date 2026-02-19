/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: match
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.613Z
 *
 * Overview:
 * Pattern match on a `DateTime` to handle `Utc` and `Zoned` cases differently.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const dt1 = DateTime.nowUnsafe() // Utc
 * const dt2 = DateTime.makeZonedUnsafe(new Date(), { timeZone: "Europe/London" }) // Zoned
 *
 * const result1 = DateTime.match(dt1, {
 *   onUtc: (utc) => `UTC: ${DateTime.formatIso(utc)}`,
 *   onZoned: (zoned) => `Zoned: ${DateTime.formatIsoZoned(zoned)}`
 * })
 *
 * const result2 = DateTime.match(dt2, {
 *   onUtc: (utc) => `UTC: ${DateTime.formatIso(utc)}`,
 *   onZoned: (zoned) => `Zoned: ${DateTime.formatIsoZoned(zoned)}`
 * })
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
const exportName = "match";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Pattern match on a `DateTime` to handle `Utc` and `Zoned` cases differently.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst dt1 = DateTime.nowUnsafe() // Utc\nconst dt2 = DateTime.makeZonedUnsafe(new Date(), { timeZone: "Europe/London" }) // Zoned\n\nconst result1 = DateTime.match(dt1, {\n  onUtc: (utc) => `UTC: ${DateTime.formatIso(utc)}`,\n  onZoned: (zoned) => `Zoned: ${DateTime.formatIsoZoned(zoned)}`\n})\n\nconst result2 = DateTime.match(dt2, {\n  onUtc: (utc) => `UTC: ${DateTime.formatIso(utc)}`,\n  onZoned: (zoned) => `Zoned: ${DateTime.formatIsoZoned(zoned)}`\n})';
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
