/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: separate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:50:32.368Z
 *
 * Overview:
 * Separates an iterable of `Result`s into two arrays: failures and successes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 *
 * const [failures, successes] = Array.separate([
 *   Result.succeed(1), Result.fail("error"), Result.succeed(2)
 * ])
 * console.log(failures) // ["error"]
 * console.log(successes) // [1, 2]
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
import * as ArrayModule from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "separate";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Separates an iterable of `Result`s into two arrays: failures and successes.";
const sourceExample =
  'import { Array, Result } from "effect"\n\nconst [failures, successes] = Array.separate([\n  Result.succeed(1), Result.fail("error"), Result.succeed(2)\n])\nconsole.log(failures) // ["error"]\nconsole.log(successes) // [1, 2]';
const moduleRecord = ArrayModule as Record<string, unknown>;

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
