/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: Reason
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:50:33.193Z
 *
 * Overview:
 * A single entry inside a {@link Cause}'s `reasons` array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause } from "effect"
 *
 * const reason = Cause.fail("error").reasons[0]
 * if (Cause.isFailReason(reason)) {
 *   console.log(reason.error) // "error"
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
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Reason";
const exportKind = "type";
const moduleImportPath = "effect/Cause";
const sourceSummary = "A single entry inside a {@link Cause}'s `reasons` array.";
const sourceExample =
  'import { Cause } from "effect"\n\nconst reason = Cause.fail("error").reasons[0]\nif (Cause.isFailReason(reason)) {\n  console.log(reason.error) // "error"\n}';
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
