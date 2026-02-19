/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: ExceededCapacityError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.184Z
 *
 * Overview:
 * An error indicating that a bounded resource (queue, pool, semaphore, etc.) has exceeded its capacity.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.ExceededCapacityError("Queue full")
 * console.log(error._tag)    // "ExceededCapacityError"
 * console.log(error.message) // "Queue full"
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
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "ExceededCapacityError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "An error indicating that a bounded resource (queue, pool, semaphore, etc.) has exceeded its capacity.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst error = new Cause.ExceededCapacityError("Queue full")\nconsole.log(error._tag)    // "ExceededCapacityError"\nconsole.log(error.message) // "Queue full"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log(
    "Bridge note: `Cause.ExceededCapacityError` is a compile-time interface paired with runtime companions."
  );
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
  yield* Console.log("Inspecting runtime constructor companion: Cause.ExceededCapacityError.");
  yield* inspectNamedExport({ moduleRecord, exportName: "ExceededCapacityError" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  const error = new CauseModule.ExceededCapacityError("Queue full");

  yield* Console.log(`Created error tag: ${error._tag}`);
  yield* Console.log(`Created error message: ${error.message}`);
  yield* Console.log(`Cause.isExceededCapacityError(error): ${CauseModule.isExceededCapacityError(error)}`);
  yield* Console.log(`Cause.isExceededCapacityError("nope"): ${CauseModule.isExceededCapacityError("nope")}`);
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
      title: "Type Erasure + Constructor Context",
      description: "Show interface erasure and inspect the runtime constructor companion export.",
      run: exampleTypeRuntimeCheck,
    },
    {
      title: "Source-Aligned Companion Flow",
      description: "Construct `Cause.ExceededCapacityError` and validate it with `Cause.isExceededCapacityError`.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
