/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: mapError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.942Z
 *
 * Overview:
 * Transforms the failure channel of a `Result`, leaving the success channel unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.fail("not found"),
 *   Result.mapError((e) => `Error: ${e}`)
 * )
 * console.log(result)
 * // Output: { _tag: "Failure", failure: "Error: not found", ... }
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
const exportName = "mapError";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Transforms the failure channel of a `Result`, leaving the success channel unchanged.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.fail("not found"),\n  Result.mapError((e) => `Error: ${e}`)\n)\nconsole.log(result)\n// Output: { _tag: "Failure", failure: "Error: not found", ... }';
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
