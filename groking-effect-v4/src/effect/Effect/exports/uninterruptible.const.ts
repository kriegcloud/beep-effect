/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: uninterruptible
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.396Z
 *
 * Overview:
 * Returns a new effect that disables interruption for the given effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 *
 * const criticalTask = Effect.gen(function*() {
 *   yield* Console.log("Starting critical section...")
 *   yield* Effect.sleep("2 seconds")
 *   yield* Console.log("Critical section completed")
 * })
 *
 * const program = Effect.uninterruptible(criticalTask)
 *
 * const fiber = Effect.runFork(program)
 * // Even if interrupted, the critical task will complete
 * Effect.runPromise(Fiber.interrupt(fiber))
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
const exportName = "uninterruptible";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Returns a new effect that disables interruption for the given effect.";
const sourceExample =
  'import { Console, Effect, Fiber } from "effect"\n\nconst criticalTask = Effect.gen(function*() {\n  yield* Console.log("Starting critical section...")\n  yield* Effect.sleep("2 seconds")\n  yield* Console.log("Critical section completed")\n})\n\nconst program = Effect.uninterruptible(criticalTask)\n\nconst fiber = Effect.runFork(program)\n// Even if interrupted, the critical task will complete\nEffect.runPromise(Fiber.interrupt(fiber))';
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
