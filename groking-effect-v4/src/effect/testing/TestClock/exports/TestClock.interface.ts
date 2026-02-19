/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestClock
 * Export: TestClock
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/testing/TestClock.ts
 * Generated: 2026-02-19T04:50:43.267Z
 *
 * Overview:
 * A `TestClock` simplifies deterministically and efficiently testing effects which involve the passage of time.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, Option, pipe } from "effect"
 * import { TestClock } from "effect/testing"
 * import * as assert from "node:assert"
 *
 * Effect.gen(function*() {
 *   const fiber = yield* pipe(
 *     Effect.sleep("5 minutes"),
 *     Effect.timeout("1 minute"),
 *     Effect.forkChild
 *   )
 *   yield* TestClock.adjust("1 minute")
 *   const result = yield* Fiber.join(fiber)
 *   assert.deepStrictEqual(result, Option.none())
 * })
 * ```
 *
 * Focus:
 * - Type-only exports (`type`, `interface`) are erased at runtime.
 * - Runtime examples still provide module-level context for learning.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TestClockModule from "effect/testing/TestClock";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "TestClock";
const exportKind = "interface";
const moduleImportPath = "effect/testing/TestClock";
const sourceSummary =
  "A `TestClock` simplifies deterministically and efficiently testing effects which involve the passage of time.";
const sourceExample =
  'import { Effect, Fiber, Option, pipe } from "effect"\nimport { TestClock } from "effect/testing"\nimport * as assert from "node:assert"\n\nEffect.gen(function*() {\n  const fiber = yield* pipe(\n    Effect.sleep("5 minutes"),\n    Effect.timeout("1 minute"),\n    Effect.forkChild\n  )\n  yield* TestClock.adjust("1 minute")\n  const result = yield* Fiber.join(fiber)\n  assert.deepStrictEqual(result, Option.none())\n})';
const moduleRecord = TestClockModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Check runtime visibility for this type/interface export.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
});

const exampleModuleContextInspection = Effect.gen(function* () {
  yield* Console.log("Inspect runtime module context around this type-like export.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🧠",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection,
    },
  ],
});

BunRuntime.runMain(program);
