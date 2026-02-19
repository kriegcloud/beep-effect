/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: scopedWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.915Z
 *
 * Overview:
 * Creates a scoped effect by providing access to the scope.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Scope } from "effect"
 *
 * const program = Effect.scopedWith((scope) =>
 *   Effect.gen(function*() {
 *     yield* Console.log("Inside scoped context")
 *
 *     // Manually add a finalizer to the scope
 *     yield* Scope.addFinalizer(scope, Console.log("Manual finalizer"))
 *
 *     // Create a scoped resource
 *     const resource = yield* Effect.scoped(
 *       Effect.acquireRelease(
 *         Console.log("Acquiring resource").pipe(Effect.as("resource")),
 *         () => Console.log("Releasing resource")
 *       )
 *     )
 *
 *     return resource
 *   })
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Inside scoped context
 * // Acquiring resource
 * // resource
 * // Releasing resource
 * // Manual finalizer
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
const exportName = "scopedWith";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates a scoped effect by providing access to the scope.";
const sourceExample =
  'import { Console, Effect, Scope } from "effect"\n\nconst program = Effect.scopedWith((scope) =>\n  Effect.gen(function*() {\n    yield* Console.log("Inside scoped context")\n\n    // Manually add a finalizer to the scope\n    yield* Scope.addFinalizer(scope, Console.log("Manual finalizer"))\n\n    // Create a scoped resource\n    const resource = yield* Effect.scoped(\n      Effect.acquireRelease(\n        Console.log("Acquiring resource").pipe(Effect.as("resource")),\n        () => Console.log("Releasing resource")\n      )\n    )\n\n    return resource\n  })\n)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Inside scoped context\n// Acquiring resource\n// resource\n// Releasing resource\n// Manual finalizer';
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
