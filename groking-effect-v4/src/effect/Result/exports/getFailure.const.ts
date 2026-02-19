/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: getFailure
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Extracts the failure value as an `Option`, discarding the success.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Option, Result } from "effect"
 *
 * console.log(Result.getFailure(Result.succeed("ok")))
 * // Output: { _tag: "None" }
 *
 * console.log(Result.getFailure(Result.fail("err")))
 * // Output: { _tag: "Some", value: "err" }
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
const exportName = "getFailure";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Extracts the failure value as an `Option`, discarding the success.";
const sourceExample =
  'import { Option, Result } from "effect"\n\nconsole.log(Result.getFailure(Result.succeed("ok")))\n// Output: { _tag: "None" }\n\nconsole.log(Result.getFailure(Result.fail("err")))\n// Output: { _tag: "Some", value: "err" }';
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
