/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: cachedWithTTL
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.386Z
 *
 * Overview:
 * Returns an effect that caches its result for a specified `Duration`, known as "timeToLive" (TTL).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * let i = 1
 * const expensiveTask = Effect.promise<string>(() => {
 *   console.log("expensive task...")
 *   return new Promise((resolve) => {
 *     setTimeout(() => {
 *       resolve(`result ${i++}`)
 *     }, 100)
 *   })
 * })
 *
 * const program = Effect.gen(function*() {
 *   const cached = yield* Effect.cachedWithTTL(expensiveTask, "150 millis")
 *   yield* cached.pipe(Effect.andThen(Console.log))
 *   yield* cached.pipe(Effect.andThen(Console.log))
 *   yield* Effect.sleep("100 millis")
 *   yield* cached.pipe(Effect.andThen(Console.log))
 * })
 *
 * Effect.runFork(program)
 * // Output:
 * // expensive task...
 * // result 1
 * // result 1
 * // expensive task...
 * // result 2
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
const exportName = "cachedWithTTL";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  'Returns an effect that caches its result for a specified `Duration`, known as "timeToLive" (TTL).';
const sourceExample =
  'import { Console, Effect } from "effect"\n\nlet i = 1\nconst expensiveTask = Effect.promise<string>(() => {\n  console.log("expensive task...")\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      resolve(`result ${i++}`)\n    }, 100)\n  })\n})\n\nconst program = Effect.gen(function*() {\n  const cached = yield* Effect.cachedWithTTL(expensiveTask, "150 millis")\n  yield* cached.pipe(Effect.andThen(Console.log))\n  yield* cached.pipe(Effect.andThen(Console.log))\n  yield* Effect.sleep("100 millis")\n  yield* cached.pipe(Effect.andThen(Console.log))\n})\n\nEffect.runFork(program)\n// Output:\n// expensive task...\n// result 1\n// result 1\n// expensive task...\n// result 2';
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
