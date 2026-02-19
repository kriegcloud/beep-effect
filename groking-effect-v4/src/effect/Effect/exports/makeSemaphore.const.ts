/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: makeSemaphore
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.911Z
 *
 * Overview:
 * Creates a new Semaphore.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const semaphore = yield* Effect.makeSemaphore(2)
 *
 *   const task = (id: number) =>
 *     semaphore.withPermits(1)(
 *       Effect.gen(function*() {
 *         yield* Effect.log(`Task ${id} acquired permit`)
 *         yield* Effect.sleep("1 second")
 *         yield* Effect.log(`Task ${id} releasing permit`)
 *       })
 *     )
 *
 *   // Run 4 tasks, but only 2 can run concurrently
 *   yield* Effect.all([task(1), task(2), task(3), task(4)])
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeSemaphore";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Creates a new Semaphore.";
const sourceExample =
  'import { Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const semaphore = yield* Effect.makeSemaphore(2)\n\n  const task = (id: number) =>\n    semaphore.withPermits(1)(\n      Effect.gen(function*() {\n        yield* Effect.log(`Task ${id} acquired permit`)\n        yield* Effect.sleep("1 second")\n        yield* Effect.log(`Task ${id} releasing permit`)\n      })\n    )\n\n  // Run 4 tasks, but only 2 can run concurrently\n  yield* Effect.all([task(1), task(2), task(3), task(4)])\n})';
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
