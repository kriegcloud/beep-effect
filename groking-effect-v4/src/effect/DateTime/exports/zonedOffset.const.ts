/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: zonedOffset
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.615Z
 *
 * Overview:
 * Calculate the time zone offset of a `DateTime.Zoned` in milliseconds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const zoned = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {
 *   timeZone: "Europe/London"
 * })
 *
 * const offset = DateTime.zonedOffset(zoned)
 * console.log(offset) // 0 (London is UTC+0 in winter)
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
const exportName = "zonedOffset";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Calculate the time zone offset of a `DateTime.Zoned` in milliseconds.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst zoned = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {\n  timeZone: "Europe/London"\n})\n\nconst offset = DateTime.zonedOffset(zoned)\nconsole.log(offset) // 0 (London is UTC+0 in winter)';
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
