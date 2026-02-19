/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Utils
 * Export: OptionalNumber
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Utils.ts
 * Generated: 2026-02-19T04:50:53.315Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Utils } from "effect"
 *
 * const value1: Utils.OptionalNumber = 42
 * const value2: Utils.OptionalNumber = null
 * const value3: Utils.OptionalNumber = undefined
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
import * as UtilsModule from "effect/Utils";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "OptionalNumber";
const exportKind = "type";
const moduleImportPath = "effect/Utils";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import type { Utils } from "effect"\n\nconst value1: Utils.OptionalNumber = 42\nconst value2: Utils.OptionalNumber = null\nconst value3: Utils.OptionalNumber = undefined';
const moduleRecord = UtilsModule as Record<string, unknown>;

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
