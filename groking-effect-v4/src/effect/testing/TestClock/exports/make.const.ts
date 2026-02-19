/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestClock
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestClock.ts
 * Generated: 2026-02-19T04:14:22.347Z
 *
 * Overview:
 * Creates a `TestClock` with optional configuration.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { TestClock } from "effect/testing"
 * 
 * const program = Effect.gen(function*() {
 *   // Create a TestClock with default settings
 *   const testClock = yield* TestClock.make()
 * 
 *   // Create a TestClock with custom warning delay
 *   const customTestClock = yield* TestClock.make({
 *     warningDelay: "10 seconds"
 *   })
 * 
 *   // Use the TestClock to control time in tests
 *   yield* testClock.adjust("1 hour")
 *   const currentTime = testClock.currentTimeMillisUnsafe()
 *   console.log(currentTime) // Time advanced by 1 hour
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestClock";
const sourceSummary = "Creates a `TestClock` with optional configuration.";
const sourceExample = "import { Effect } from \"effect\"\nimport { TestClock } from \"effect/testing\"\n\nconst program = Effect.gen(function*() {\n  // Create a TestClock with default settings\n  const testClock = yield* TestClock.make()\n\n  // Create a TestClock with custom warning delay\n  const customTestClock = yield* TestClock.make({\n    warningDelay: \"10 seconds\"\n  })\n\n  // Use the TestClock to control time in tests\n  yield* testClock.adjust(\"1 hour\")\n  const currentTime = testClock.currentTimeMillisUnsafe()\n  console.log(currentTime) // Time advanced by 1 hour\n})";
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
