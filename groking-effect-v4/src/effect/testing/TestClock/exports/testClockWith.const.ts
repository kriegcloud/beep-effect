/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestClock
 * Export: testClockWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestClock.ts
 * Generated: 2026-02-19T04:14:22.347Z
 *
 * Overview:
 * Retrieves the `TestClock` service for this test and uses it to run the specified workflow.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { TestClock } from "effect/testing"
 * 
 * const program = Effect.gen(function*() {
 *   // Use testClockWith to access the TestClock instance
 *   const currentTime = yield* TestClock.testClockWith((testClock) =>
 *     Effect.succeed(testClock.currentTimeMillisUnsafe())
 *   )
 * 
 *   // Adjust time using the TestClock instance
 *   yield* TestClock.testClockWith((testClock) => testClock.adjust("2 hours"))
 * 
 *   console.log(currentTime) // Initial time
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
const exportName = "testClockWith";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestClock";
const sourceSummary = "Retrieves the `TestClock` service for this test and uses it to run the specified workflow.";
const sourceExample = "import { Effect } from \"effect\"\nimport { TestClock } from \"effect/testing\"\n\nconst program = Effect.gen(function*() {\n  // Use testClockWith to access the TestClock instance\n  const currentTime = yield* TestClock.testClockWith((testClock) =>\n    Effect.succeed(testClock.currentTimeMillisUnsafe())\n  )\n\n  // Adjust time using the TestClock instance\n  yield* TestClock.testClockWith((testClock) => testClock.adjust(\"2 hours\"))\n\n  console.log(currentTime) // Initial time\n})";
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
