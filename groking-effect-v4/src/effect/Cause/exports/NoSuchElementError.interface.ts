/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: NoSuchElementError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * An error indicating that a requested element does not exist.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const error = new Cause.NoSuchElementError("Element not found")
 * console.log(error._tag)    // "NoSuchElementError"
 * console.log(error.message) // "Element not found"
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
const exportName = "NoSuchElementError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "An error indicating that a requested element does not exist.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst error = new Cause.NoSuchElementError("Element not found")\nconsole.log(error._tag)    // "NoSuchElementError"\nconsole.log(error.message) // "Element not found"';
const moduleRecord = CauseModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleTypeRuntimeCheck = Effect.gen(function* () {
  yield* Console.log(
    "Bridge note: `Cause.NoSuchElementError` is a compile-time interface paired with runtime companions."
  );
  yield* inspectTypeLikeExport({ moduleRecord, exportName });
  yield* Console.log("Inspecting runtime constructor companion: Cause.NoSuchElementError.");
  yield* inspectNamedExport({ moduleRecord, exportName: "NoSuchElementError" });
});

const exampleSourceAlignedCompanionFlow = Effect.gen(function* () {
  const error = new CauseModule.NoSuchElementError("Element not found");

  yield* Console.log(`Created error tag: ${error._tag}`);
  yield* Console.log(`Created error message: ${error.message}`);
  yield* Console.log(`Cause.isNoSuchElementError(error): ${CauseModule.isNoSuchElementError(error)}`);
  yield* Console.log(`Cause.isNoSuchElementError("nope"): ${CauseModule.isNoSuchElementError("nope")}`);
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
      description: "Construct `Cause.NoSuchElementError` and validate it with `Cause.isNoSuchElementError`.",
      run: exampleSourceAlignedCompanionFlow,
    },
  ],
});

BunRuntime.runMain(program);
