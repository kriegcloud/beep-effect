/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: UnknownError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.198Z
 *
 * Overview:
 * A wrapper for errors whose type is not statically known.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.UnknownError("original", "Something unknown")
 * console.log(error._tag)    // "UnknownError"
 * console.log(error.message) // "Something unknown"
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
const exportName = "UnknownError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A wrapper for errors whose type is not statically known.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst error = new Cause.UnknownError("original", "Something unknown")\nconsole.log(error._tag)    // "UnknownError"\nconsole.log(error.message) // "Something unknown"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log("Bridge note: `Cause.UnknownError` is a compile-time interface paired with runtime companions.");
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
  yield* Console.log("Inspecting runtime constructor companion: Cause.UnknownError.");
  yield* inspectNamedExport({ moduleRecord, exportName: "UnknownError" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  const originalCause = { raw: true };
  const error = new CauseModule.UnknownError(originalCause, "Something unknown");

  yield* Console.log(`Created error tag: ${error._tag}`);
  yield* Console.log(`Created error message: ${error.message}`);
  yield* Console.log(`Stored cause is original object: ${error.cause === originalCause}`);
  yield* Console.log(`Cause.isUnknownError(error): ${CauseModule.isUnknownError(error)}`);
  yield* Console.log(`Cause.isUnknownError("nope"): ${CauseModule.isUnknownError("nope")}`);
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
      description: "Construct `Cause.UnknownError` and validate it with `Cause.isUnknownError`.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
