/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: matchEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.912Z
 *
 * Overview:
 * Handles both success and failure cases of an effect, allowing for additional side effects.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Handling Both Success and Failure Cases with Side Effects
 * import { Effect } from "effect"
 *
 * const success: Effect.Effect<number, Error> = Effect.succeed(42)
 * const failure: Effect.Effect<number, Error> = Effect.fail(
 *   new Error("Uh oh!")
 * )
 *
 * const program1 = Effect.matchEffect(success, {
 *   onFailure: (error) =>
 *     Effect.succeed(`failure: ${error.message}`).pipe(
 *       Effect.tap(Effect.log)
 *     ),
 *   onSuccess: (value) =>
 *     Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log))
 * })
 *
 * console.log(Effect.runSync(program1))
 * // Output:
 * // timestamp=... level=INFO fiber=#0 message="success: 42"
 * // success: 42
 *
 * const program2 = Effect.matchEffect(failure, {
 *   onFailure: (error) =>
 *     Effect.succeed(`failure: ${error.message}`).pipe(
 *       Effect.tap(Effect.log)
 *     ),
 *   onSuccess: (value) =>
 *     Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log))
 * })
 *
 * console.log(Effect.runSync(program2))
 * // Output:
 * // timestamp=... level=INFO fiber=#1 message="failure: Uh oh!"
 * // failure: Uh oh!
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "matchEffect";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles both success and failure cases of an effect, allowing for additional side effects.";
const sourceExample =
  '// Title: Handling Both Success and Failure Cases with Side Effects\nimport { Effect } from "effect"\n\nconst success: Effect.Effect<number, Error> = Effect.succeed(42)\nconst failure: Effect.Effect<number, Error> = Effect.fail(\n  new Error("Uh oh!")\n)\n\nconst program1 = Effect.matchEffect(success, {\n  onFailure: (error) =>\n    Effect.succeed(`failure: ${error.message}`).pipe(\n      Effect.tap(Effect.log)\n    ),\n  onSuccess: (value) =>\n    Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log))\n})\n\nconsole.log(Effect.runSync(program1))\n// Output:\n// timestamp=... level=INFO fiber=#0 message="success: 42"\n// success: 42\n\nconst program2 = Effect.matchEffect(failure, {\n  onFailure: (error) =>\n    Effect.succeed(`failure: ${error.message}`).pipe(\n      Effect.tap(Effect.log)\n    ),\n  onSuccess: (value) =>\n    Effect.succeed(`success: ${value}`).pipe(Effect.tap(Effect.log))\n})\n\nconsole.log(Effect.runSync(program2))\n// Output:\n// timestamp=... level=INFO fiber=#1 message="failure: Uh oh!"\n// failure: Uh oh!';
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
