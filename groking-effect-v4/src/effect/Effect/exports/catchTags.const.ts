/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchTags
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * Handles multiple errors in a single block of code using their `_tag` field.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Data, Effect } from "effect"
 * 
 * // Define tagged error types
 * class ValidationError extends Data.TaggedError("ValidationError")<{
 *   message: string
 * }> {}
 * 
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   statusCode: number
 * }> {}
 * 
 * // An effect that might fail with multiple error types
 * declare const program: Effect.Effect<string, ValidationError | NetworkError>
 * 
 * // Handle multiple error types at once
 * const handled = Effect.catchTags(program, {
 *   ValidationError: (error) =>
 *     Effect.succeed(`Validation failed: ${error.message}`),
 *   NetworkError: (error) => Effect.succeed(`Network error: ${error.statusCode}`)
 * })
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "catchTags";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles multiple errors in a single block of code using their `_tag` field.";
const sourceExample = "import { Data, Effect } from \"effect\"\n\n// Define tagged error types\nclass ValidationError extends Data.TaggedError(\"ValidationError\")<{\n  message: string\n}> {}\n\nclass NetworkError extends Data.TaggedError(\"NetworkError\")<{\n  statusCode: number\n}> {}\n\n// An effect that might fail with multiple error types\ndeclare const program: Effect.Effect<string, ValidationError | NetworkError>\n\n// Handle multiple error types at once\nconst handled = Effect.catchTags(program, {\n  ValidationError: (error) =>\n    Effect.succeed(`Validation failed: ${error.message}`),\n  NetworkError: (error) => Effect.succeed(`Network error: ${error.statusCode}`)\n})";
const moduleRecord = EffectModule as Record<string, unknown>;

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
