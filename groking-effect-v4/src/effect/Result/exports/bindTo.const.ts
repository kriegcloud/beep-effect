/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: bindTo
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.771Z
 *
 * Overview:
 * Wraps the success value of a `Result` into a named field, producing a `Result<Record<N, A>>`. This is typically used to start a do-notation chain from an existing `Result`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(42),
 *   Result.bindTo("answer")
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: { answer: 42 }, ... }
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
import * as Effect from "effect/Effect";
import * as ResultModule from "effect/Result";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "bindTo";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary =
  "Wraps the success value of a `Result` into a named field, producing a `Result<Record<N, A>>`. This is typically used to start a do-notation chain from an existing `Result`.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(42),\n  Result.bindTo("answer")\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: { answer: 42 }, ... }';
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
