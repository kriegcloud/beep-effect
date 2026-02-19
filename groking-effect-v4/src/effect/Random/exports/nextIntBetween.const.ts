/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Random
 * Export: nextIntBetween
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Random.ts
 * Generated: 2026-02-19T04:50:38.572Z
 *
 * Overview:
 * Generates a random number between `min` (inclusive) and `max` (inclusive).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Random } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const diceRoll1 = yield* Random.nextIntBetween(1, 6)
 *   const diceRoll2 = yield* Random.nextIntBetween(1, 6, {
 *     halfOpen: true
 *   })
 *   const diceRoll3 = yield* Random.nextIntBetween(0, 10)
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
import * as RandomModule from "effect/Random";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "nextIntBetween";
const exportKind = "const";
const moduleImportPath = "effect/Random";
const sourceSummary = "Generates a random number between `min` (inclusive) and `max` (inclusive).";
const sourceExample =
  'import { Effect, Random } from "effect"\n\nconst program = Effect.gen(function*() {\n  const diceRoll1 = yield* Random.nextIntBetween(1, 6)\n  const diceRoll2 = yield* Random.nextIntBetween(1, 6, {\n    halfOpen: true\n  })\n  const diceRoll3 = yield* Random.nextIntBetween(0, 10)\n})';
const moduleRecord = RandomModule as Record<string, unknown>;

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
