/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Result
 * Export: filterOrFail
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Result.ts
 * Generated: 2026-02-19T04:14:16.771Z
 *
 * Overview:
 * Validates the success value of a `Result` using a predicate, failing with a custom error if the predicate returns `false`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Result } from "effect"
 * 
 * const result = pipe(
 *   Result.succeed(0),
 *   Result.filterOrFail(
 *     (n) => n > 0,
 *     (n) => `${n} is not positive`
 *   )
 * )
 * console.log(result)
 * // Output: { _tag: "Failure", failure: "0 is not positive", ... }
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ResultModule from "effect/Result";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterOrFail";
const exportKind = "const";
const moduleImportPath = "effect/Result";
const sourceSummary = "Validates the success value of a `Result` using a predicate, failing with a custom error if the predicate returns `false`.";
const sourceExample = "import { pipe, Result } from \"effect\"\n\nconst result = pipe(\n  Result.succeed(0),\n  Result.filterOrFail(\n    (n) => n > 0,\n    (n) => `${n} is not positive`\n  )\n)\nconsole.log(result)\n// Output: { _tag: \"Failure\", failure: \"0 is not positive\", ... }";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
