/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: EqualsWith
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:14:23.505Z
 *
 * Overview:
 * Determines if two types are equal, returning custom types for each case.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 * 
 * type R1 = Types.EqualsWith<string, string, "same", "diff"> // "same"
 * type R2 = Types.EqualsWith<string, number, "same", "diff"> // "diff"
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
import * as TypesModule from "effect/Types";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  inspectTypeLikeExport
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "EqualsWith";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Determines if two types are equal, returning custom types for each case.";
const sourceExample = "import type { Types } from \"effect\"\n\ntype R1 = Types.EqualsWith<string, string, \"same\", \"diff\"> // \"same\"\ntype R2 = Types.EqualsWith<string, number, \"same\", \"diff\"> // \"diff\"";
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
