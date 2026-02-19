/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: Success
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.655Z
 *
 * Overview:
 * A successful Exit containing a value.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit } from "effect"
 *
 * const success = Exit.succeed(42)
 *
 * if (Exit.isSuccess(success)) {
 *   console.log(success._tag) // "Success"
 *   console.log(success.value) // 42
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Success";
const exportKind = "interface";
const moduleImportPath = "effect/Exit";
const sourceSummary = "A successful Exit containing a value.";
const sourceExample =
  'import { Exit } from "effect"\n\nconst success = Exit.succeed(42)\n\nif (Exit.isSuccess(success)) {\n  console.log(success._tag) // "Success"\n  console.log(success.value) // 42\n}';
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
