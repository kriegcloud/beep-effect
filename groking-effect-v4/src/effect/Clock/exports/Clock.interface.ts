/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Clock
 * Export: Clock
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Clock.ts
 * Generated: 2026-02-19T04:50:34.386Z
 *
 * Overview:
 * Represents a time-based clock which provides functionality related to time and scheduling.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Clock, Effect } from "effect"
 *
 * const clockOperations = Effect.gen(function*() {
 *   const currentTime = yield* Clock.currentTimeMillis
 *   const currentTimeNanos = yield* Clock.currentTimeNanos
 *
 *   console.log(`Current time (ms): ${currentTime}`)
 *   console.log(`Current time (ns): ${currentTimeNanos}`)
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
import * as ClockModule from "effect/Clock";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Clock";
const exportKind = "interface";
const moduleImportPath = "effect/Clock";
const sourceSummary = "Represents a time-based clock which provides functionality related to time and scheduling.";
const sourceExample =
  'import { Clock, Effect } from "effect"\n\nconst clockOperations = Effect.gen(function*() {\n  const currentTime = yield* Clock.currentTimeMillis\n  const currentTimeNanos = yield* Clock.currentTimeNanos\n\n  console.log(`Current time (ms): ${currentTime}`)\n  console.log(`Current time (ns): ${currentTimeNanos}`)\n})';
const moduleRecord = ClockModule as Record<string, unknown>;

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
