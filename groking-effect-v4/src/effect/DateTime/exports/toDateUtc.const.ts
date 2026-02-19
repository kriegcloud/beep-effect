/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: toDateUtc
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.268Z
 *
 * Overview:
 * Get the UTC `Date` of a `DateTime`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const dt = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {
 *   timeZone: "Europe/London"
 * })
 *
 * const utcDate = DateTime.toDateUtc(dt)
 * console.log(utcDate.toISOString()) // "2024-01-01T12:00:00.000Z"
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
const exportName = "toDateUtc";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Get the UTC `Date` of a `DateTime`.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst dt = DateTime.makeZonedUnsafe("2024-01-01T12:00:00Z", {\n  timeZone: "Europe/London"\n})\n\nconst utcDate = DateTime.toDateUtc(dt)\nconsole.log(utcDate.toISOString()) // "2024-01-01T12:00:00.000Z"';
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
