/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Number
 * Export: Number
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Number.ts
 * Generated: 2026-02-19T04:50:37.939Z
 *
 * Overview:
 * The global `Number` constructor.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as N from "effect/Number"
 *
 * const num = N.Number("42")
 * console.log(num) // 42
 *
 * const float = N.Number("3.14")
 * console.log(float) // 3.14
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
const exportName = "Number";
const exportKind = "const";
const moduleImportPath = "effect/Number";
const sourceSummary = "The global `Number` constructor.";
const sourceExample =
  'import * as N from "effect/Number"\n\nconst num = N.Number("42")\nconsole.log(num) // 42\n\nconst float = N.Number("3.14")\nconsole.log(float) // 3.14';
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
