/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: forkIn
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.909Z
 *
 * Overview:
 * Forks the effect in the specified scope. The fiber will be interrupted when the scope is closed.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const task = Effect.gen(function*() {
 *   yield* Effect.sleep("10 seconds")
 *   return "completed"
 * })
 *
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const scope = yield* Effect.scope
 *     const fiber = yield* Effect.forkIn(task, scope)
 *     yield* Effect.sleep("1 second")
 *     // Fiber will be interrupted when scope closes
 *     return "done"
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
const exportName = "forkIn";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Forks the effect in the specified scope. The fiber will be interrupted when the scope is closed.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst task = Effect.gen(function*() {\n  yield* Effect.sleep("10 seconds")\n  return "completed"\n})\n\nconst program = Effect.scoped(\n  Effect.gen(function*() {\n    const scope = yield* Effect.scope\n    const fiber = yield* Effect.forkIn(task, scope)\n    yield* Effect.sleep("1 second")\n    // Fiber will be interrupted when scope closes\n    return "done"\n  })\n)';
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
