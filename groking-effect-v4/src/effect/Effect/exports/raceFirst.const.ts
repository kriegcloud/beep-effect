/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: raceFirst
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * Races two effects and returns the result of the first one to complete, whether it succeeds or fails.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Duration, Effect } from "effect"
 *
 * const fastFail = Effect.delay(Effect.fail("fast-fail"), Duration.millis(10))
 * const slowSuccess = Effect.delay(Effect.succeed("slow-success"), Duration.millis(50))
 *
 * const program = Effect.gen(function*() {
 *   const message = yield* Effect.match(Effect.raceFirst(fastFail, slowSuccess), {
 *     onFailure: (error) => `failed: ${error}`,
 *     onSuccess: (value) => `succeeded: ${value}`
 *   })
 *   yield* Console.log(message)
 * })
 *
 * Effect.runPromise(program)
 * // Output: failed: fast-fail
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
const exportName = "raceFirst";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Races two effects and returns the result of the first one to complete, whether it succeeds or fails.";
const sourceExample =
  'import { Console, Duration, Effect } from "effect"\n\nconst fastFail = Effect.delay(Effect.fail("fast-fail"), Duration.millis(10))\nconst slowSuccess = Effect.delay(Effect.succeed("slow-success"), Duration.millis(50))\n\nconst program = Effect.gen(function*() {\n  const message = yield* Effect.match(Effect.raceFirst(fastFail, slowSuccess), {\n    onFailure: (error) => `failed: ${error}`,\n    onSuccess: (value) => `succeeded: ${value}`\n  })\n  yield* Console.log(message)\n})\n\nEffect.runPromise(program)\n// Output: failed: fast-fail';
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
