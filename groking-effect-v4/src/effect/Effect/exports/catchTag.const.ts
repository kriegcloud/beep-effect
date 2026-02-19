/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: catchTag
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.387Z
 *
 * Overview:
 * Catches and handles specific errors by their `_tag` field, which is used as a discriminator.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * class NetworkError {
 *   readonly _tag = "NetworkError"
 *   constructor(readonly message: string) {}
 * }
 *
 * class ValidationError {
 *   readonly _tag = "ValidationError"
 *   constructor(readonly message: string) {}
 * }
 *
 * declare const task: Effect.Effect<string, NetworkError | ValidationError>
 *
 * const program = Effect.catchTag(
 *   task,
 *   "NetworkError",
 *   (error) => Effect.succeed(`Recovered from network error: ${error.message}`)
 * )
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
const exportName = "catchTag";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Catches and handles specific errors by their `_tag` field, which is used as a discriminator.";
const sourceExample =
  'import { Effect } from "effect"\n\nclass NetworkError {\n  readonly _tag = "NetworkError"\n  constructor(readonly message: string) {}\n}\n\nclass ValidationError {\n  readonly _tag = "ValidationError"\n  constructor(readonly message: string) {}\n}\n\ndeclare const task: Effect.Effect<string, NetworkError | ValidationError>\n\nconst program = Effect.catchTag(\n  task,\n  "NetworkError",\n  (error) => Effect.succeed(`Recovered from network error: ${error.message}`)\n)';
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
