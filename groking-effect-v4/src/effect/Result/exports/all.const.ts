/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: all
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Collects a structure of `Result`s into a single `Result` of collected values.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Result } from "effect"
 *
 * // Tuple
 * const tuple = Result.all([Result.succeed(1), Result.succeed("two")])
 * console.log(tuple)
 * // Output: { _tag: "Success", success: [1, "two"], ... }
 *
 * // Struct
 * const struct = Result.all({ x: Result.succeed(1), y: Result.fail("err") })
 * console.log(struct)
 * // Output: { _tag: "Failure", failure: "err", ... }
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
const exportName = "all";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Collects a structure of `Result`s into a single `Result` of collected values.";
const sourceExample =
  'import { Result } from "effect"\n\n// Tuple\nconst tuple = Result.all([Result.succeed(1), Result.succeed("two")])\nconsole.log(tuple)\n// Output: { _tag: "Success", success: [1, "two"], ... }\n\n// Struct\nconst struct = Result.all({ x: Result.succeed(1), y: Result.fail("err") })\nconsole.log(struct)\n// Output: { _tag: "Failure", failure: "err", ... }';
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
