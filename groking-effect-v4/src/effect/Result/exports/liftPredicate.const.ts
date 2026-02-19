/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: liftPredicate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Lifts a value into a `Result` based on a predicate or refinement.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const ensurePositive = pipe(
 *   5,
 *   Result.liftPredicate(
 *     (n: number) => n > 0,
 *     (n) => `${n} is not positive`
 *   )
 * )
 * console.log(ensurePositive)
 * // Output: { _tag: "Success", success: 5, ... }
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
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "liftPredicate";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Lifts a value into a `Result` based on a predicate or refinement.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst ensurePositive = pipe(\n  5,\n  Result.liftPredicate(\n    (n: number) => n > 0,\n    (n) => `${n} is not positive`\n  )\n)\nconsole.log(ensurePositive)\n// Output: { _tag: "Success", success: 5, ... }';
const moduleRecord = ResultModule as Record<string, unknown>;

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
