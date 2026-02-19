/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Match
 * Export: instanceOf
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Match.ts
 * Generated: 2026-02-19T04:50:37.669Z
 *
 * Overview:
 * Matches instances of a given class.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Match } from "effect"
 *
 * class CustomError extends Error {
 *   constructor(message: string, public code: number) {
 *     super(message)
 *   }
 * }
 *
 * const handleValue = Match.type<unknown>()
 *   .pipe(
 *     Match.when(
 *       Match.instanceOf(CustomError),
 *       (err) => `Custom error: ${err.message} (code: ${err.code})`
 *     ),
 *     Match.when(
 *       Match.instanceOf(Error),
 *       (err) => `Standard error: ${err.message}`
 *     ),
 *     Match.when(Match.instanceOf(Date), (date) => `Date: ${date.toISOString()}`),
 *     Match.when(
 *       Match.instanceOf(Array),
 *       (arr) => `Array with ${arr.length} items`
 *     ),
 *     Match.orElse((value) => `Other: ${typeof value}`)
 *   )
 *
 * console.log(handleValue(new CustomError("Failed", 404)))
 * // Output: "Custom error: Failed (code: 404)"
 *
 * console.log(handleValue(new Error("Generic error")))
 * // Output: "Standard error: Generic error"
 *
 * console.log(handleValue(new Date()))
 * // Output: "Date: 2024-01-01T00:00:00.000Z"
 *
 * console.log(handleValue([1, 2, 3]))
 * // Output: "Array with 3 items"
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
import * as MatchModule from "effect/Match";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "instanceOf";
const exportKind = "const";
const moduleImportPath = "effect/Match";
const sourceSummary = "Matches instances of a given class.";
const sourceExample =
  'import { Match } from "effect"\n\nclass CustomError extends Error {\n  constructor(message: string, public code: number) {\n    super(message)\n  }\n}\n\nconst handleValue = Match.type<unknown>()\n  .pipe(\n    Match.when(\n      Match.instanceOf(CustomError),\n      (err) => `Custom error: ${err.message} (code: ${err.code})`\n    ),\n    Match.when(\n      Match.instanceOf(Error),\n      (err) => `Standard error: ${err.message}`\n    ),\n    Match.when(Match.instanceOf(Date), (date) => `Date: ${date.toISOString()}`),\n    Match.when(\n      Match.instanceOf(Array),\n      (arr) => `Array with ${arr.length} items`\n    ),\n    Match.orElse((value) => `Other: ${typeof value}`)\n  )\n\nconsole.log(handleValue(new CustomError("Failed", 404)))\n// Output: "Custom error: Failed (code: 404)"\n\nconsole.log(handleValue(new Error("Generic error")))\n// Output: "Standard error: Generic error"\n\nconsole.log(handleValue(new Date()))\n// Output: "Date: 2024-01-01T00:00:00.000Z"\n\nconsole.log(handleValue([1, 2, 3]))\n// Output: "Array with 3 items"';
const moduleRecord = MatchModule as Record<string, unknown>;

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
