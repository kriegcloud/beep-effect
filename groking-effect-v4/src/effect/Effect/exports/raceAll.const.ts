/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: raceAll
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.913Z
 *
 * Overview:
 * Races multiple effects and returns the first successful result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration, Effect } from "effect"
 *
 * // Multiple effects with different delays
 * const effect1 = Effect.delay(Effect.succeed("Fast"), Duration.millis(100))
 * const effect2 = Effect.delay(Effect.succeed("Slow"), Duration.millis(500))
 * const effect3 = Effect.delay(Effect.succeed("Very Slow"), Duration.millis(1000))
 *
 * // Race all effects - the first to succeed wins
 * const raced = Effect.raceAll([effect1, effect2, effect3])
 *
 * // Result: "Fast" (after ~100ms)
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
const exportName = "raceAll";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Races multiple effects and returns the first successful result.";
const sourceExample =
  'import { Duration, Effect } from "effect"\n\n// Multiple effects with different delays\nconst effect1 = Effect.delay(Effect.succeed("Fast"), Duration.millis(100))\nconst effect2 = Effect.delay(Effect.succeed("Slow"), Duration.millis(500))\nconst effect3 = Effect.delay(Effect.succeed("Very Slow"), Duration.millis(1000))\n\n// Race all effects - the first to succeed wins\nconst raced = Effect.raceAll([effect1, effect2, effect3])\n\n// Result: "Fast" (after ~100ms)';
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
