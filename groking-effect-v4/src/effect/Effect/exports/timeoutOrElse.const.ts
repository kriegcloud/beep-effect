/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: timeoutOrElse
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.916Z
 *
 * Overview:
 * Applies a timeout to an effect, with a fallback effect executed if the timeout is reached.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const slowQuery = Effect.gen(function*() {
 *   yield* Console.log("Starting database query...")
 *   yield* Effect.sleep("5 seconds")
 *   return "Database result"
 * })
 *
 * // Use cached data as fallback when timeout is reached
 * const program = Effect.timeoutOrElse(slowQuery, {
 *   duration: "2 seconds",
 *   onTimeout: () =>
 *     Effect.gen(function*() {
 *       yield* Console.log("Query timed out, using cached data")
 *       return "Cached result"
 *     })
 * })
 *
 * Effect.runPromise(program).then(console.log)
 * // Output:
 * // Starting database query...
 * // Query timed out, using cached data
 * // Cached result
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
const exportName = "timeoutOrElse";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Applies a timeout to an effect, with a fallback effect executed if the timeout is reached.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst slowQuery = Effect.gen(function*() {\n  yield* Console.log("Starting database query...")\n  yield* Effect.sleep("5 seconds")\n  return "Database result"\n})\n\n// Use cached data as fallback when timeout is reached\nconst program = Effect.timeoutOrElse(slowQuery, {\n  duration: "2 seconds",\n  onTimeout: () =>\n    Effect.gen(function*() {\n      yield* Console.log("Query timed out, using cached data")\n      return "Cached result"\n    })\n})\n\nEffect.runPromise(program).then(console.log)\n// Output:\n// Starting database query...\n// Query timed out, using cached data\n// Cached result';
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
