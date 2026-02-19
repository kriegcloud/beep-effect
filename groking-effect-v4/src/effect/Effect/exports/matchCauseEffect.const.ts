/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: matchCauseEffect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.911Z
 *
 * Overview:
 * Handles failures with access to the cause and allows performing side effects.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Console, Effect, Result } from "effect"
 *
 * const task = Effect.fail(new Error("Task failed"))
 *
 * const program = Effect.matchCauseEffect(task, {
 *   onFailure: (cause) =>
 *     Effect.gen(function*() {
 *       if (Cause.hasFails(cause)) {
 *         const error = Cause.findError(cause)
 *         if (Result.isSuccess(error)) {
 *           yield* Console.log(`Handling error: ${error.success.message}`)
 *         }
 *         return "recovered from error"
 *       } else {
 *         yield* Console.log("Handling interruption or defect")
 *         return "recovered from interruption/defect"
 *       }
 *     }),
 *   onSuccess: (value) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`Success: ${value}`)
 *       return `processed ${value}`
 *     })
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Handling error: Task failed
 * // recovered from error
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
const exportName = "matchCauseEffect";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Handles failures with access to the cause and allows performing side effects.";
const sourceExample =
  'import { Cause, Console, Effect, Result } from "effect"\n\nconst task = Effect.fail(new Error("Task failed"))\n\nconst program = Effect.matchCauseEffect(task, {\n  onFailure: (cause) =>\n    Effect.gen(function*() {\n      if (Cause.hasFails(cause)) {\n        const error = Cause.findError(cause)\n        if (Result.isSuccess(error)) {\n          yield* Console.log(`Handling error: ${error.success.message}`)\n        }\n        return "recovered from error"\n      } else {\n        yield* Console.log("Handling interruption or defect")\n        return "recovered from interruption/defect"\n      }\n    }),\n  onSuccess: (value) =>\n    Effect.gen(function*() {\n      yield* Console.log(`Success: ${value}`)\n      return `processed ${value}`\n    })\n})\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Handling error: Task failed\n// recovered from error';
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
