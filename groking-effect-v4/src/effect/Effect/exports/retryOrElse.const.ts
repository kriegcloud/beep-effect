/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: retryOrElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * Retries a failing effect and runs a fallback effect if retries are exhausted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * let attempt = 0
 * const networkRequest = Effect.gen(function*() {
 *   attempt++
 *   yield* Console.log(`Network attempt ${attempt}`)
 *   if (attempt < 3) {
 *     return yield* Effect.fail(new Error("Network timeout"))
 *   }
 *   return "Network data"
 * })
 *
 * // Retry up to 2 times, then fall back to cached data
 * const program = Effect.retryOrElse(
 *   networkRequest,
 *   Schedule.recurs(2),
 *   (error, retryCount) =>
 *     Effect.gen(function*() {
 *       yield* Console.log(`All ${retryCount} retries failed, using cache`)
 *       return "Cached data"
 *     })
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Network attempt 1
 * // Network attempt 2
 * // Network attempt 3
 * // Network data
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
const exportName = "retryOrElse";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Retries a failing effect and runs a fallback effect if retries are exhausted.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\nlet attempt = 0\nconst networkRequest = Effect.gen(function*() {\n  attempt++\n  yield* Console.log(`Network attempt ${attempt}`)\n  if (attempt < 3) {\n    return yield* Effect.fail(new Error("Network timeout"))\n  }\n  return "Network data"\n})\n\n// Retry up to 2 times, then fall back to cached data\nconst program = Effect.retryOrElse(\n  networkRequest,\n  Schedule.recurs(2),\n  (error, retryCount) =>\n    Effect.gen(function*() {\n      yield* Console.log(`All ${retryCount} retries failed, using cache`)\n      return "Cached data"\n    })\n)\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Network attempt 1\n// Network attempt 2\n// Network attempt 3\n// Network data';
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
