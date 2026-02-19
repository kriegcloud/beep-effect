/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: scoped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.914Z
 *
 * Overview:
 * Scopes all resources used in this workflow to the lifetime of the workflow, ensuring that their finalizers are run as soon as this workflow completes execution, whether by success, failure, or interruption.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const resource = Effect.acquireRelease(
 *   Console.log("Acquiring resource").pipe(Effect.as("resource")),
 *   () => Console.log("Releasing resource")
 * )
 *
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const res = yield* resource
 *     yield* Console.log(`Using ${res}`)
 *     return res
 *   })
 * )
 *
 * Effect.runFork(program)
 * // Output: "Acquiring resource"
 * // Output: "Using resource"
 * // Output: "Releasing resource"
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
const exportName = "scoped";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Scopes all resources used in this workflow to the lifetime of the workflow, ensuring that their finalizers are run as soon as this workflow completes execution, whether by succe...";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst resource = Effect.acquireRelease(\n  Console.log("Acquiring resource").pipe(Effect.as("resource")),\n  () => Console.log("Releasing resource")\n)\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const res = yield* resource\n    yield* Console.log(`Using ${res}`)\n    return res\n  })\n)\n\nEffect.runFork(program)\n// Output: "Acquiring resource"\n// Output: "Using resource"\n// Output: "Releasing resource"';
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
