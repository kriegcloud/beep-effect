/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: Mutable
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:14:23.506Z
 *
 * Overview:
 * Removes `readonly` from all properties of `T`. Supports arrays, tuples, and records.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 *
 * type Obj = Types.Mutable<{
 *   readonly a: string
 *   readonly b: ReadonlyArray<number>
 * }>
 * // { a: string; b: ReadonlyArray<number> }
 * //   ^ mutable    ^ still readonly inside
 *
 * type Arr = Types.Mutable<ReadonlyArray<string>>
 * // string[]
 *
 * type Tup = Types.Mutable<readonly [string, number]>
 * // [string, number]
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
import * as TypesModule from "effect/Types";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Mutable";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Removes `readonly` from all properties of `T`. Supports arrays, tuples, and records.";
const sourceExample =
  'import type { Types } from "effect"\n\ntype Obj = Types.Mutable<{\n  readonly a: string\n  readonly b: ReadonlyArray<number>\n}>\n// { a: string; b: ReadonlyArray<number> }\n//   ^ mutable    ^ still readonly inside\n\ntype Arr = Types.Mutable<ReadonlyArray<string>>\n// string[]\n\ntype Tup = Types.Mutable<readonly [string, number]>\n// [string, number]';
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
