/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: formatIso
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.265Z
 *
 * Overview:
 * Format a `DateTime` as a UTC ISO string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const dt = DateTime.makeUnsafe("2024-01-01T12:30:45.123Z")
 * console.log(DateTime.formatIso(dt)) // "2024-01-01T12:30:45.123Z"
 *
 * const zoned = DateTime.makeZonedUnsafe("2024-01-01T12:30:45.123Z", {
 *   timeZone: "Europe/London"
 * })
 * console.log(DateTime.formatIso(zoned)) // "2024-01-01T12:30:45.123Z"
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
const exportName = "formatIso";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Format a `DateTime` as a UTC ISO string.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst dt = DateTime.makeUnsafe("2024-01-01T12:30:45.123Z")\nconsole.log(DateTime.formatIso(dt)) // "2024-01-01T12:30:45.123Z"\n\nconst zoned = DateTime.makeZonedUnsafe("2024-01-01T12:30:45.123Z", {\n  timeZone: "Europe/London"\n})\nconsole.log(DateTime.formatIso(zoned)) // "2024-01-01T12:30:45.123Z"';
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
