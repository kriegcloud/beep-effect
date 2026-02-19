/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: MatchRecord
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:50:44.518Z
 *
 * Overview:
 * Conditional type that checks if `S` is an empty object type.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 *
 * type A = Types.MatchRecord<{}, "empty", "not empty"> // "empty"
 * type B = Types.MatchRecord<{ a: number }, "empty", "not empty"> // "not empty"
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
import * as TypesModule from "effect/Types";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "MatchRecord";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Conditional type that checks if `S` is an empty object type.";
const sourceExample =
  'import type { Types } from "effect"\n\ntype A = Types.MatchRecord<{}, "empty", "not empty"> // "empty"\ntype B = Types.MatchRecord<{ a: number }, "empty", "not empty"> // "not empty"';
const moduleRecord = TypesModule as Record<string, unknown>;

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
