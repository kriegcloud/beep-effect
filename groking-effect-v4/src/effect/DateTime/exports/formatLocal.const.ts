/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: formatLocal
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.611Z
 *
 * Overview:
 * Format a `DateTime` as a string using the `DateTimeFormat` API.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const dt = DateTime.makeUnsafe("2024-06-15T14:30:00Z")
 *
 * // Uses system local time zone and locale
 * const local = DateTime.formatLocal(dt, {
 *   year: "numeric",
 *   month: "long",
 *   day: "numeric",
 *   hour: "2-digit",
 *   minute: "2-digit"
 * })
 *
 * console.log(local) // Output depends on system locale/timezone
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
const exportName = "formatLocal";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Format a `DateTime` as a string using the `DateTimeFormat` API.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst dt = DateTime.makeUnsafe("2024-06-15T14:30:00Z")\n\n// Uses system local time zone and locale\nconst local = DateTime.formatLocal(dt, {\n  year: "numeric",\n  month: "long",\n  day: "numeric",\n  hour: "2-digit",\n  minute: "2-digit"\n})\n\nconsole.log(local) // Output depends on system locale/timezone';
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
