/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: parse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:50:37.939Z
 *
 * Overview:
 * Tries to parse a `number` from a `string` using the `Number()` function. The following special string values are supported: "NaN", "Infinity", "-Infinity".
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number } from "effect"
 *
 * Number.parse("42") // 42
 * Number.parse("3.14") // 3.14
 * Number.parse("NaN") // NaN
 * Number.parse("Infinity") // Infinity
 * Number.parse("-Infinity") // -Infinity
 * Number.parse("not a number") // undefined
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
import * as NumberModule from "effect/Number";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "parse";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary =
  'Tries to parse a `number` from a `string` using the `Number()` function. The following special string values are supported: "NaN", "Infinity", "-Infinity".';
const sourceExample =
  'import { Number } from "effect"\n\nNumber.parse("42") // 42\nNumber.parse("3.14") // 3.14\nNumber.parse("NaN") // NaN\nNumber.parse("Infinity") // Infinity\nNumber.parse("-Infinity") // -Infinity\nNumber.parse("not a number") // undefined';
const moduleRecord = NumberModule as Record<string, unknown>;

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
