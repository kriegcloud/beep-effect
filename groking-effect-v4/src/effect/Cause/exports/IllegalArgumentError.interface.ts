/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: IllegalArgumentError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.188Z
 *
 * Overview:
 * An error indicating that a function received an argument that violates its contract (e.g. negative where positive was expected).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.IllegalArgumentError("Expected positive number")
 * console.log(error._tag)    // "IllegalArgumentError"
 * console.log(error.message) // "Expected positive number"
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
const exportName = "IllegalArgumentError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "An error indicating that a function received an argument that violates its contract (e.g. negative where positive was expected).";
const sourceExample =
  'import { Cause } from "effect"\n\nconst error = new Cause.IllegalArgumentError("Expected positive number")\nconsole.log(error._tag)    // "IllegalArgumentError"\nconsole.log(error.message) // "Expected positive number"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeErasureAndCompanionContext = Effect.gen(function* () {
  yield* Console.log(
    "Bridge note: `Cause.IllegalArgumentError` is a compile-time interface paired with runtime companions."
  );
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
  yield* Console.log("Inspecting runtime constructor companion: Cause.IllegalArgumentError.");
  yield* inspectNamedExport({ moduleRecord, exportName: "IllegalArgumentError" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  const error = new CauseModule.IllegalArgumentError("Expected positive number");

  yield* Console.log(`Created error tag: ${error._tag}`);
  yield* Console.log(`Created error message: ${error.message}`);
  yield* Console.log(`Cause.isIllegalArgumentError(error): ${CauseModule.isIllegalArgumentError(error)}`);
  yield* Console.log(`Cause.isIllegalArgumentError("nope"): ${CauseModule.isIllegalArgumentError("nope")}`);
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
      run: exampleTypeErasureAndCompanionContext,
    },
    {
      title: "Source-Aligned Companion Flow",
      description: "Construct `Cause.IllegalArgumentError` and validate it with `Cause.isIllegalArgumentError`.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
