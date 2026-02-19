/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: addFinalizer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.906Z
 *
 * Overview:
 * This function adds a finalizer to the scope of the calling `Effect` value. The finalizer is guaranteed to be run when the scope is closed, and it may depend on the `Exit` value that the scope is closed with.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit } from "effect"
 *
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     // Add a finalizer that runs when the scope closes
 *     yield* Effect.addFinalizer((exit) =>
 *       Console.log(
 *         Exit.isSuccess(exit)
 *           ? "Cleanup: Operation completed successfully"
 *           : "Cleanup: Operation failed, cleaning up resources"
 *       )
 *     )
 *
 *     yield* Console.log("Performing main operation...")
 *
 *     // This could succeed or fail
 *     return "operation result"
 *   })
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Performing main operation...
 * // Cleanup: Operation completed successfully
 * // operation result
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
const exportName = "addFinalizer";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "This function adds a finalizer to the scope of the calling `Effect` value. The finalizer is guaranteed to be run when the scope is closed, and it may depend on the `Exit` value ...";
const sourceExample =
  'import { Console, Effect, Exit } from "effect"\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    // Add a finalizer that runs when the scope closes\n    yield* Effect.addFinalizer((exit) =>\n      Console.log(\n        Exit.isSuccess(exit)\n          ? "Cleanup: Operation completed successfully"\n          : "Cleanup: Operation failed, cleaning up resources"\n      )\n    )\n\n    yield* Console.log("Performing main operation...")\n\n    // This could succeed or fail\n    return "operation result"\n  })\n)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Performing main operation...\n// Cleanup: Operation completed successfully\n// operation result';
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
