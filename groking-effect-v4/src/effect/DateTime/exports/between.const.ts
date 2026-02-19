/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/DateTime
 * Export: between
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/DateTime.ts
 * Generated: 2026-02-19T04:14:11.264Z
 *
 * Overview:
 * Checks if a `DateTime` is between two other `DateTime` values (inclusive).
 *
 * Source JSDoc Example:
 * ```ts
 * import { DateTime } from "effect"
 *
 * const min = DateTime.makeUnsafe("2024-01-01")
 * const max = DateTime.makeUnsafe("2024-12-31")
 * const date = DateTime.makeUnsafe("2024-06-15")
 *
 * console.log(DateTime.between(date, { minimum: min, maximum: max })) // true
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
const exportName = "between";
const exportKind = "const";
const moduleImportPath = "effect/DateTime";
const sourceSummary = "Checks if a `DateTime` is between two other `DateTime` values (inclusive).";
const sourceExample =
  'import { DateTime } from "effect"\n\nconst min = DateTime.makeUnsafe("2024-01-01")\nconst max = DateTime.makeUnsafe("2024-12-31")\nconst date = DateTime.makeUnsafe("2024-06-15")\n\nconsole.log(DateTime.between(date, { minimum: min, maximum: max })) // true';
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
