/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestClock
 * Export: adjust
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestClock.ts
 * Generated: 2026-02-19T04:14:22.347Z
 *
 * Overview:
 * Accesses a `TestClock` instance in the context and increments the time by the specified duration, running any actions scheduled for on or before the new time in order.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { TestClock } from "effect/testing"
 * 
 * const program = Effect.gen(function*() {
 *   let executed = false
 * 
 *   // Fork an effect that sleeps for 30 minutes
 *   const fiber = yield* Effect.gen(function*() {
 *     yield* Effect.sleep("30 minutes")
 *     executed = true
 *   }).pipe(Effect.forkChild)
 * 
 *   // Advance the clock by 30 minutes
 *   yield* TestClock.adjust("30 minutes")
 * 
 *   // The effect should now be executed
 *   console.log(executed) // true
 * })
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
import * as TestClockModule from "effect/testing/TestClock";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "adjust";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestClock";
const sourceSummary = "Accesses a `TestClock` instance in the context and increments the time by the specified duration, running any actions scheduled for on or before the new time in order.";
const sourceExample = "import { Effect } from \"effect\"\nimport { TestClock } from \"effect/testing\"\n\nconst program = Effect.gen(function*() {\n  let executed = false\n\n  // Fork an effect that sleeps for 30 minutes\n  const fiber = yield* Effect.gen(function*() {\n    yield* Effect.sleep(\"30 minutes\")\n    executed = true\n  }).pipe(Effect.forkChild)\n\n  // Advance the clock by 30 minutes\n  yield* TestClock.adjust(\"30 minutes\")\n\n  // The effect should now be executed\n  console.log(executed) // true\n})";
const moduleRecord = TestClockModule as Record<string, unknown>;

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
