/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: withConcurrency
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.397Z
 *
 * Overview:
 * Sets the concurrency level for parallel operations within an effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const task = (id: number) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Task ${id} starting`)
 *     yield* Effect.sleep("100 millis")
 *     yield* Console.log(`Task ${id} completed`)
 *     return id
 *   })
 *
 * // Run tasks with limited concurrency (max 2 at a time)
 * const program = Effect.gen(function*() {
 *   const tasks = [1, 2, 3, 4, 5].map(task)
 *   return yield* Effect.all(tasks, { concurrency: 2 })
 * }).pipe(
 *   Effect.withConcurrency(2)
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Tasks will run with max 2 concurrent operations
 * // [1, 2, 3, 4, 5]
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
const exportName = "withConcurrency";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Sets the concurrency level for parallel operations within an effect.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst task = (id: number) =>\n  Effect.gen(function*() {\n    yield* Console.log(`Task ${id} starting`)\n    yield* Effect.sleep("100 millis")\n    yield* Console.log(`Task ${id} completed`)\n    return id\n  })\n\n// Run tasks with limited concurrency (max 2 at a time)\nconst program = Effect.gen(function*() {\n  const tasks = [1, 2, 3, 4, 5].map(task)\n  return yield* Effect.all(tasks, { concurrency: 2 })\n}).pipe(\n  Effect.withConcurrency(2)\n)\n\nEffect.runPromise(program).then(console.log)\n// Tasks will run with max 2 concurrent operations\n// [1, 2, 3, 4, 5]';
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
