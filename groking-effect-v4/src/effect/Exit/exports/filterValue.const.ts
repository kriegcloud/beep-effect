/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: filterValue
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.654Z
 *
 * Overview:
 * Extracts the success value from an Exit for use in filter pipelines.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit, Filter } from "effect"
 * 
 * const exit = Exit.succeed(42)
 * const result = Exit.filterValue(exit)
 * // If exit is a success, result is 42
 * // If exit is a failure, result is a Filter.fail marker
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
import * as ExitModule from "effect/Exit";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "filterValue";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Extracts the success value from an Exit for use in filter pipelines.";
const sourceExample = "import { Exit, Filter } from \"effect\"\n\nconst exit = Exit.succeed(42)\nconst result = Exit.filterValue(exit)\n// If exit is a success, result is 42\n// If exit is a failure, result is a Filter.fail marker";
const moduleRecord = ExitModule as Record<string, unknown>;

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
