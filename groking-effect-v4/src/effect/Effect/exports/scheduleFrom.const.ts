/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: scheduleFrom
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.394Z
 *
 * Overview:
 * Runs an effect repeatedly according to a schedule, starting from a specified initial input value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 *
 * const task = (input: number) =>
 *   Effect.gen(function*() {
 *     yield* Console.log(`Processing: ${input}`)
 *     return input + 1
 *   })
 *
 * // Start with 0, repeat 3 times
 * const program = Effect.scheduleFrom(
 *   task(0),
 *   0,
 *   Schedule.recurs(2)
 * )
 *
 * Effect.runPromise(program).then(console.log)
 * // Returns the schedule count
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
const exportName = "scheduleFrom";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Runs an effect repeatedly according to a schedule, starting from a specified initial input value.";
const sourceExample =
  'import { Console, Effect, Schedule } from "effect"\n\nconst task = (input: number) =>\n  Effect.gen(function*() {\n    yield* Console.log(`Processing: ${input}`)\n    return input + 1\n  })\n\n// Start with 0, repeat 3 times\nconst program = Effect.scheduleFrom(\n  task(0),\n  0,\n  Schedule.recurs(2)\n)\n\nEffect.runPromise(program).then(console.log)\n// Returns the schedule count';
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
