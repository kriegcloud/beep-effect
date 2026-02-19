/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestClock
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestClock.ts
 * Generated: 2026-02-19T04:14:22.347Z
 *
 * Overview:
 * Creates a `Layer` which constructs a `TestClock`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import { TestClock } from "effect/testing"
 *
 * // Create a TestClock layer
 * const testClockLayer = TestClock.layer()
 *
 * // Create a TestClock layer with custom options
 * const customTestClockLayer = TestClock.layer({
 *   warningDelay: "5 seconds"
 * })
 *
 * const program = Effect.gen(function*() {
 *   // Use the layer in your program
 *   yield* TestClock.adjust("1 hour")
 * }).pipe(Effect.provide(testClockLayer))
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
import * as TestClockModule from "effect/testing/TestClock";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestClock";
const sourceSummary = "Creates a `Layer` which constructs a `TestClock`.";
const sourceExample =
  'import { Effect } from "effect"\nimport { TestClock } from "effect/testing"\n\n// Create a TestClock layer\nconst testClockLayer = TestClock.layer()\n\n// Create a TestClock layer with custom options\nconst customTestClockLayer = TestClock.layer({\n  warningDelay: "5 seconds"\n})\n\nconst program = Effect.gen(function*() {\n  // Use the layer in your program\n  yield* TestClock.adjust("1 hour")\n}).pipe(Effect.provide(testClockLayer))';
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
