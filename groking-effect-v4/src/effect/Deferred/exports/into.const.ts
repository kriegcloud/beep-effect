/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Deferred
 * Export: into
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Deferred.ts
 * Generated: 2026-02-19T04:14:11.285Z
 *
 * Overview:
 * Converts an `Effect` into an operation that completes a `Deferred` with its result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Deferred, Effect } from "effect"
 * 
 * // Define an effect that succeeds
 * const successEffect = Effect.succeed(42)
 * 
 * const program = Effect.gen(function*() {
 *   // Create a deferred
 *   const deferred = yield* Deferred.make<number, string>()
 * 
 *   // Complete the deferred using the successEffect
 *   const isCompleted = yield* Deferred.into(successEffect, deferred)
 * 
 *   // Access the value of the deferred
 *   const value = yield* Deferred.await(deferred)
 *   console.log(value)
 * 
 *   return isCompleted
 * })
 * 
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // 42
 * // true
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
import * as DeferredModule from "effect/Deferred";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "into";
const exportKind = "const";
const moduleImportPath = "effect/Deferred";
const sourceSummary = "Converts an `Effect` into an operation that completes a `Deferred` with its result.";
const sourceExample = "import { Deferred, Effect } from \"effect\"\n\n// Define an effect that succeeds\nconst successEffect = Effect.succeed(42)\n\nconst program = Effect.gen(function*() {\n  // Create a deferred\n  const deferred = yield* Deferred.make<number, string>()\n\n  // Complete the deferred using the successEffect\n  const isCompleted = yield* Deferred.into(successEffect, deferred)\n\n  // Access the value of the deferred\n  const value = yield* Deferred.await(deferred)\n  console.log(value)\n\n  return isCompleted\n})\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// 42\n// true";
const moduleRecord = DeferredModule as Record<string, unknown>;

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
