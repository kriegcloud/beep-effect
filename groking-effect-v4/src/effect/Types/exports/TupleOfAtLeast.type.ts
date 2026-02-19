/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: TupleOfAtLeast
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:14:23.506Z
 *
 * Overview:
 * Constructs a tuple type with at least `N` elements of type `T`.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 * 
 * // At least 2 strings
 * const ok1: Types.TupleOfAtLeast<2, string> = ["a", "b"]
 * const ok2: Types.TupleOfAtLeast<2, string> = ["a", "b", "c", "d"]
 * 
 * // @ts-expect-error - too few elements
 * const bad: Types.TupleOfAtLeast<2, string> = ["a"]
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
const exportName = "TupleOfAtLeast";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Constructs a tuple type with at least `N` elements of type `T`.";
const sourceExample = "import type { Types } from \"effect\"\n\n// At least 2 strings\nconst ok1: Types.TupleOfAtLeast<2, string> = [\"a\", \"b\"]\nconst ok2: Types.TupleOfAtLeast<2, string> = [\"a\", \"b\", \"c\", \"d\"]\n\n// @ts-expect-error - too few elements\nconst bad: Types.TupleOfAtLeast<2, string> = [\"a\"]";
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
