/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Cause
 * Export: YieldableError
 * Kind: interface
 * Source: .repos/effect-smol/packages/effect/src/Cause.ts
 * Generated: 2026-02-19T04:14:10.146Z
 *
 * Overview:
 * Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Cause, Effect } from "effect"
 *
 * const error = new Cause.NoSuchElementError("not found")
 *
 * const program = Effect.gen(function*() {
 *   yield* error // fails the effect with NoSuchElementError
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
import * as CauseModule from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "YieldableError";
const exportKind = "interface";
const moduleImportPath = "effect/Cause";
const sourceSummary =
  "Base interface for error classes that can be yielded directly inside `Effect.gen` (via `Symbol.iterator`) or converted to a failing Effect via `.asEffect()`.";
const sourceExample =
  'import { Cause, Effect } from "effect"\n\nconst error = new Cause.NoSuchElementError("not found")\n\nconst program = Effect.gen(function*() {\n  yield* error // fails the effect with NoSuchElementError\n})';
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
