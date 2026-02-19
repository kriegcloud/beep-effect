/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxSemaphore
 * Export: withPermitScoped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxSemaphore.ts
 * Generated: 2026-02-19T04:50:44.490Z
 *
 * Overview:
 * Acquires a single permit from the semaphore in a scoped manner. The permit will be automatically released when the scope is closed, even if effects within the scope fail or are interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, TxSemaphore } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* TxSemaphore.make(3)
 *
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       // Acquire permit for the duration of this scope
 *       yield* TxSemaphore.withPermitScoped(semaphore)
 *       yield* Console.log("Permit acquired for scope")
 *
 *       // Do work within the scope
 *       yield* Effect.sleep("500 millis")
 *       yield* Console.log("Work completed")
 *
 *       // Permit will be automatically released when scope closes
 *     })
 *   )
 *
 *   yield* Console.log("Scope closed, permit released")
 * })
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
import * as TxSemaphoreModule from "effect/TxSemaphore";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "withPermitScoped";
const exportKind = "const";
const moduleImportPath = "effect/TxSemaphore";
const sourceSummary =
  "Acquires a single permit from the semaphore in a scoped manner. The permit will be automatically released when the scope is closed, even if effects within the scope fail or are ...";
const sourceExample =
  'import { Console, Effect, TxSemaphore } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* TxSemaphore.make(3)\n\n  yield* Effect.scoped(\n    Effect.gen(function*() {\n      // Acquire permit for the duration of this scope\n      yield* TxSemaphore.withPermitScoped(semaphore)\n      yield* Console.log("Permit acquired for scope")\n\n      // Do work within the scope\n      yield* Effect.sleep("500 millis")\n      yield* Console.log("Work completed")\n\n      // Permit will be automatically released when scope closes\n    })\n  )\n\n  yield* Console.log("Scope closed, permit released")\n})';
const moduleRecord = TxSemaphoreModule as Record<string, unknown>;

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
