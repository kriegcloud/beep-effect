/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: forkScoped
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.910Z
 *
 * Overview:
 * Forks the fiber in a `Scope`, interrupting it when the scope is closed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const backgroundTask = Effect.gen(function*() {
 *   yield* Effect.sleep("5 seconds")
 *   yield* Effect.log("Background task completed")
 *   return "result"
 * })
 *
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const fiber = yield* backgroundTask.pipe(Effect.forkScoped)
 *
 *     // or fork a fiber that starts immediately:
 *     yield* backgroundTask.pipe(Effect.forkScoped({ startImmediately: true }))
 *
 *     yield* Effect.log("Task forked in scope")
 *     yield* Effect.sleep("1 second")
 *
 *     // Fiber will be interrupted when scope closes
 *     return "scope completed"
 *   })
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "forkScoped";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Forks the fiber in a `Scope`, interrupting it when the scope is closed.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst backgroundTask = Effect.gen(function*() {\n  yield* Effect.sleep("5 seconds")\n  yield* Effect.log("Background task completed")\n  return "result"\n})\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const fiber = yield* backgroundTask.pipe(Effect.forkScoped)\n\n    // or fork a fiber that starts immediately:\n    yield* backgroundTask.pipe(Effect.forkScoped({ startImmediately: true }))\n\n    yield* Effect.log("Task forked in scope")\n    yield* Effect.sleep("1 second")\n\n    // Fiber will be interrupted when scope closes\n    return "scope completed"\n  })\n)';
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
