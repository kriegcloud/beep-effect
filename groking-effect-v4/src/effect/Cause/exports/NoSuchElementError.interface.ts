/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: NoSuchElementError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.145Z
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
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as CauseModule from "effect/Cause";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "NoSuchElementError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary = "An error indicating that a requested element does not exist.";
const sourceExample = "import { Cause } from \"effect\"\n\nconst error = new Cause.NoSuchElementError(\"Element not found\")\nconsole.log(error._tag)    // \"NoSuchElementError\"\nconsole.log(error.message) // \"Element not found\"";
const moduleRecord = CauseModule as Record<string, unknown>;

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
  bunContext: BunContext,
  examples: [
    {
      title: "Type Erasure Check",
      description: "Confirm whether this symbol appears at runtime.",
      run: exampleTypeRuntimeCheck
    },
    {
      title: "Module Context Inspection",
      description: "Inspect the runtime module value for additional context.",
      run: exampleModuleContextInspection
    }
  ]
});

BunRuntime.runMain(program);
