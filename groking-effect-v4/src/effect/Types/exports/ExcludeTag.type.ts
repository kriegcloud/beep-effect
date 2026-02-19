/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Types
 * Export: ExcludeTag
 * Kind: type
 * Source: .repos/effect-smol/packages/effect/src/Types.ts
 * Generated: 2026-02-19T04:50:44.514Z
 *
 * Overview:
 * Excludes members of a tagged union by their `_tag` value.
 *
 * Source JSDoc Example:
 * ```ts
 * import type { Types } from "effect"
 *
 * type MyError =
 *   | { readonly _tag: "NotFound"; readonly id: string }
 *   | { readonly _tag: "Timeout"; readonly ms: number }
 *   | string
 *
 * type WithoutTimeout = Types.ExcludeTag<MyError, "Timeout">
 * // { readonly _tag: "NotFound"; readonly id: string } | string
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
const exportName = "ExcludeTag";
const exportKind = "type";
const moduleImportPath = "effect/Types";
const sourceSummary = "Excludes members of a tagged union by their `_tag` value.";
const sourceExample =
  'import type { Types } from "effect"\n\ntype MyError =\n  | { readonly _tag: "NotFound"; readonly id: string }\n  | { readonly _tag: "Timeout"; readonly ms: number }\n  | string\n\ntype WithoutTimeout = Types.ExcludeTag<MyError, "Timeout">\n// { readonly _tag: "NotFound"; readonly id: string } | string';
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
