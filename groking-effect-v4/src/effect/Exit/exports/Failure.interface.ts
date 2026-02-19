/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: Failure
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:50:36.056Z
 *
 * Overview:
 * A failed Exit containing a Cause.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 *
 * const failure = Exit.fail("something went wrong")
 *
 * if (Exit.isFailure(failure)) {
 *   console.log(failure._tag) // "Failure"
 *   console.log(failure.cause) // Cause representing the error
 * }
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
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Failure";
const exportKind = "interface";
const moduleImportPath = "effect/Exit";
const sourceSummary = "A failed Exit containing a Cause.";
const sourceExample =
  'import { Exit } from "effect"\n\nconst failure = Exit.fail("something went wrong")\n\nif (Exit.isFailure(failure)) {\n  console.log(failure._tag) // "Failure"\n  console.log(failure.cause) // Cause representing the error\n}';
const moduleRecord = ExitModule as Record<string, unknown>;

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
