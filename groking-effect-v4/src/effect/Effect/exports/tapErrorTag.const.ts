/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: tapErrorTag
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.395Z
 *
 * Overview:
 * Runs an effectful handler when a failure's `_tag` matches.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Data, Effect } from "effect"
 *
 * class NetworkError extends Data.TaggedError("NetworkError")<{
 *   statusCode: number
 * }> {}
 *
 * class ValidationError extends Data.TaggedError("ValidationError")<{
 *   field: string
 * }> {}
 *
 * const task: Effect.Effect<number, NetworkError | ValidationError> =
 *   Effect.fail(new NetworkError({ statusCode: 504 }))
 *
 * const program = Effect.tapErrorTag(task, "NetworkError", (error) =>
 *   Console.log(`expected error: ${error.statusCode}`)
 * )
 *
 * Effect.runPromiseExit(program)
 * // Output:
 * // expected error: 504
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "tapErrorTag";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs an effectful handler when a failure's `_tag` matches.";
const sourceExample =
  'import { Console, Data, Effect } from "effect"\n\nclass NetworkError extends Data.TaggedError("NetworkError")<{\n  statusCode: number\n}> {}\n\nclass ValidationError extends Data.TaggedError("ValidationError")<{\n  field: string\n}> {}\n\nconst task: Effect.Effect<number, NetworkError | ValidationError> =\n  Effect.fail(new NetworkError({ statusCode: 504 }))\n\nconst program = Effect.tapErrorTag(task, "NetworkError", (error) =>\n  Console.log(`expected error: ${error.statusCode}`)\n)\n\nEffect.runPromiseExit(program)\n// Output:\n// expected error: 504';
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
