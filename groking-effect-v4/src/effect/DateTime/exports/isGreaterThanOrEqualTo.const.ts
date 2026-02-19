/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: isGreaterThanOrEqualTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:50:34.612Z
 *
 * Overview:
 * Checks if the first `DateTime` is after or equal to the second `DateTime`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const date1 = DateTime.makeUnsafe("2024-01-01")
 * const date2 = DateTime.makeUnsafe("2024-01-01")
 * const date3 = DateTime.makeUnsafe("2024-02-01")
 *
 * console.log(DateTime.isGreaterThanOrEqualTo(date1, date2)) // true
 * console.log(DateTime.isGreaterThanOrEqualTo(date3, date1)) // true
 * console.log(DateTime.isGreaterThanOrEqualTo(date1, date3)) // false
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
const exportName = "isGreaterThanOrEqualTo";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Checks if the first `DateTime` is after or equal to the second `DateTime`.";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst date1 = DateTime.makeUnsafe("2024-01-01")\nconst date2 = DateTime.makeUnsafe("2024-01-01")\nconst date3 = DateTime.makeUnsafe("2024-02-01")\n\nconsole.log(DateTime.isGreaterThanOrEqualTo(date1, date2)) // true\nconsole.log(DateTime.isGreaterThanOrEqualTo(date3, date1)) // true\nconsole.log(DateTime.isGreaterThanOrEqualTo(date1, date3)) // false';
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
