/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: raceAllFirst
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.392Z
 *
 * Overview:
 * Races multiple effects and returns the first successful result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Duration, Effect } from "effect"
 * 
 * // Multiple effects with different delays and potential failures
 * const effect1 = Effect.delay(Effect.succeed("First"), Duration.millis(200))
 * const effect2 = Effect.delay(Effect.fail("Second failed"), Duration.millis(100))
 * const effect3 = Effect.delay(Effect.succeed("Third"), Duration.millis(300))
 * 
 * // Race all effects - the first to succeed wins
 * const raced = Effect.raceAllFirst([effect1, effect2, effect3])
 * 
 * // Result: "First" (after ~200ms, even though effect2 completes first but fails)
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "raceAllFirst";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Races multiple effects and returns the first successful result.";
const sourceExample = "import { Duration, Effect } from \"effect\"\n\n// Multiple effects with different delays and potential failures\nconst effect1 = Effect.delay(Effect.succeed(\"First\"), Duration.millis(200))\nconst effect2 = Effect.delay(Effect.fail(\"Second failed\"), Duration.millis(100))\nconst effect3 = Effect.delay(Effect.succeed(\"Third\"), Duration.millis(300))\n\n// Race all effects - the first to succeed wins\nconst raced = Effect.raceAllFirst([effect1, effect2, effect3])\n\n// Result: \"First\" (after ~200ms, even though effect2 completes first but fails)";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
