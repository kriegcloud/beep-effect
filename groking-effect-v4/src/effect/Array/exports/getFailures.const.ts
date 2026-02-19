/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: getFailures
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.703Z
 *
 * Overview:
 * Extracts all failure values from an iterable of `Result`s, discarding successes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Result } from "effect"
 * 
 * console.log(Array.getFailures([Result.succeed(1), Result.fail("err"), Result.succeed(2)]))
 * // ["err"]
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
import * as ArrayModule from "effect/Array";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "getFailures";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Extracts all failure values from an iterable of `Result`s, discarding successes.";
const sourceExample = "import { Array, Result } from \"effect\"\n\nconsole.log(Array.getFailures([Result.succeed(1), Result.fail(\"err\"), Result.succeed(2)]))\n// [\"err\"]";
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
