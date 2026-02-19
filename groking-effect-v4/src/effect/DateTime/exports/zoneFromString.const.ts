/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: zoneFromString
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.269Z
 *
 * Overview:
 * Try to parse a `TimeZone` from a string.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const namedZone = DateTime.zoneFromString("Europe/London")
 * const offsetZone = DateTime.zoneFromString("+03:00")
 * const invalid = DateTime.zoneFromString("invalid")
 *
 * console.log(namedZone !== undefined) // true
 * console.log(offsetZone !== undefined) // true
 * console.log(invalid === undefined) // true
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
const exportName = "zoneFromString";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Try to parse a `TimeZone` from a string.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst namedZone = DateTime.zoneFromString("Europe/London")\nconst offsetZone = DateTime.zoneFromString("+03:00")\nconst invalid = DateTime.zoneFromString("invalid")\n\nconsole.log(namedZone !== undefined) // true\nconsole.log(offsetZone !== undefined) // true\nconsole.log(invalid === undefined) // true';
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
