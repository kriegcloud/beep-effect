/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Flag
 * Export: mapTryCatch
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Flag.ts
 * Generated: 2026-02-19T04:50:46.273Z
 *
 * Overview:
 * Transforms the parsed value using a function that might throw, with error handling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Flag } from "effect/unstable/cli"
 *
 * // Parse JSON string with error handling
 * const jsonFlag = Flag.string("config").pipe(
 *   Flag.mapTryCatch(
 *     (json) => JSON.parse(json),
 *     (error) => `Invalid JSON: ${error}`
 *   )
 * )
 *
 * // Parse URL with error handling
 * const urlFlag = Flag.string("url").pipe(
 *   Flag.mapTryCatch(
 *     (url) => new URL(url),
 *     (error) => `Invalid URL: ${error}`
 *   )
 * )
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
import * as Effect from "effect/Effect";
import * as FlagModule from "effect/unstable/cli/Flag";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapTryCatch";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Flag";
const sourceSummary = "Transforms the parsed value using a function that might throw, with error handling.";
const sourceExample =
  'import { Flag } from "effect/unstable/cli"\n\n// Parse JSON string with error handling\nconst jsonFlag = Flag.string("config").pipe(\n  Flag.mapTryCatch(\n    (json) => JSON.parse(json),\n    (error) => `Invalid JSON: ${error}`\n  )\n)\n\n// Parse URL with error handling\nconst urlFlag = Flag.string("url").pipe(\n  Flag.mapTryCatch(\n    (url) => new URL(url),\n    (error) => `Invalid URL: ${error}`\n  )\n)';
const moduleRecord = FlagModule as Record<string, unknown>;

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
