/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Data
 * Export: TaggedError
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Data.ts
 * Generated: 2026-02-19T04:14:11.233Z
 *
 * Overview:
 * Create a tagged error constructor with a specific tag for discriminated unions.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect, pipe } from "effect"
 * 
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   code: number
 *   message: string
 * }> {}
 * 
 * class ValidationError extends Data.TaggedError("ValidationError")<{
 *   field: string
 *   message: string
 * }> {}
 * 
 * const program = Effect.gen(function*() {
 *   yield* new NetworkError({ code: 500, message: "Server error" })
 * })
 * 
 * const result = pipe(
 *   program,
 *   Effect.catchTag(
 *     "NetworkError",
 *     (error) => Effect.succeed(`Network error: ${error.message}`)
 *   )
 * )
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
import * as DataModule from "effect/Data";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TaggedError";
const exportKind = "const";
const moduleImportPath = "effect/Data";
const sourceSummary = "Create a tagged error constructor with a specific tag for discriminated unions.";
const sourceExample = "import { Data, Effect, pipe } from \"effect\"\n\nclass NetworkError extends Data.TaggedError(\"NetworkError\")<{\n  code: number\n  message: string\n}> {}\n\nclass ValidationError extends Data.TaggedError(\"ValidationError\")<{\n  field: string\n  message: string\n}> {}\n\nconst program = Effect.gen(function*() {\n  yield* new NetworkError({ code: 500, message: \"Server error\" })\n})\n\nconst result = pipe(\n  program,\n  Effect.catchTag(\n    \"NetworkError\",\n    (error) => Effect.succeed(`Network error: ${error.message}`)\n  )\n)";
const moduleRecord = DataModule as Record<string, unknown>;

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
