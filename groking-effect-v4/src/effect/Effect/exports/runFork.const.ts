/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runFork
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.393Z
 *
 * Overview:
 * The foundational function for running effects, returning a "fiber" that can be observed or interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * // Title: Running an Effect in the Background
 * import { Effect } from "effect"
 * import { Schedule } from "effect"
 * import { Fiber } from "effect"
 * import { Console } from "effect"
 *
 * //      ┌─── Effect<number, never, never>
 * //      ▼
 * const program = Effect.repeat(
 *   Console.log("running..."),
 *   Schedule.spaced("200 millis")
 * )
 *
 * //      ┌─── RuntimeFiber<number, never>
 * //      ▼
 * const fiber = Effect.runFork(program)
 *
 * setTimeout(() => {
 *   Effect.runFork(Fiber.interrupt(fiber))
 * }, 500)
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
const exportName = "runFork";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  'The foundational function for running effects, returning a "fiber" that can be observed or interrupted.';
const sourceExample =
  '// Title: Running an Effect in the Background\nimport { Effect } from "effect"\nimport { Schedule } from "effect"\nimport { Fiber } from "effect"\nimport { Console } from "effect"\n\n//      ┌─── Effect<number, never, never>\n//      ▼\nconst program = Effect.repeat(\n  Console.log("running..."),\n  Schedule.spaced("200 millis")\n)\n\n//      ┌─── RuntimeFiber<number, never>\n//      ▼\nconst fiber = Effect.runFork(program)\n\nsetTimeout(() => {\n  Effect.runFork(Fiber.interrupt(fiber))\n}, 500)';
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
