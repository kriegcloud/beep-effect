/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: Exit
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.654Z
 *
 * Overview:
 * Represents the result of an Effect computation.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 *
 * const success: Exit.Exit<number> = Exit.succeed(42)
 * const failure: Exit.Exit<number, string> = Exit.fail("error")
 *
 * const result = Exit.match(success, {
 *   onSuccess: (value) => `Got value: ${value}`,
 *   onFailure: (cause) => `Got error: ${cause}`
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Exit";
const exportKind = "type";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Represents the result of an Effect computation.";
const sourceExample =
  'import { Exit } from "effect"\n\nconst success: Exit.Exit<number> = Exit.succeed(42)\nconst failure: Exit.Exit<number, string> = Exit.fail("error")\n\nconst result = Exit.match(success, {\n  onSuccess: (value) => `Got value: ${value}`,\n  onFailure: (cause) => `Got error: ${cause}`\n})';
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
  bunContext: BunContext,
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
