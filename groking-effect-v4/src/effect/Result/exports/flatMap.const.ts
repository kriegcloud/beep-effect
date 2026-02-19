/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: flatMap
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:50:38.941Z
 *
 * Overview:
 * Chains a function that returns a `Result` onto a successful value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 *
 * const result = pipe(
 *   Result.succeed(5),
 *   Result.flatMap((n) =>
 *     n > 0 ? Result.succeed(n * 2) : Result.fail("not positive")
 *   )
 * )
 * console.log(result)
 * // Output: { _tag: "Success", success: 10, ... }
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
const exportName = "flatMap";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Chains a function that returns a `Result` onto a successful value.";
const sourceExample =
  'import { pipe, Result } from "effect"\n\nconst result = pipe(\n  Result.succeed(5),\n  Result.flatMap((n) =>\n    n > 0 ? Result.succeed(n * 2) : Result.fail("not positive")\n  )\n)\nconsole.log(result)\n// Output: { _tag: "Success", success: 10, ... }';
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
